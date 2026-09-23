import express from 'express';
import cors from 'cors';
import multer from 'multer';
import path from 'node:path';
import fs from 'node:fs/promises';
import { Queue } from 'bullmq';
import IORedis from 'ioredis';
import { z } from 'zod';
import { config } from './config.js';
import { prisma } from './db.js';
import { ensureStorageDirs } from './lib/storage.js';
import { hashPassword, verifyPassword, createSessionToken, decodeSessionToken } from './lib/auth.js';
import './jobs/processor.js';

const app = express();
const upload = multer({ dest: path.join(config.storageRoot, 'uploads') });
const redis = new IORedis(config.redisUrl);
const projectQueue = new Queue('project-processing', { connection: redis });

app.use(cors());
app.use(express.json({ limit: '100mb' }));
app.use('/storage', express.static(config.storageRoot));

function authMiddleware(req: express.Request, res: express.Response, next: express.NextFunction) {
  const auth = req.headers.authorization || '';
  const token = auth.startsWith('Bearer ') ? auth.slice(7) : null;
  if (!token) {
    req.user = null;
    return next();
  }
  const decoded = decodeSessionToken(token);
  if (!decoded || decoded.exp < Math.floor(Date.now() / 1000)) {
    req.user = null;
    return next();
  }
  req.user = { id: decoded.userId, email: decoded.email };
  next();
}

app.use(authMiddleware);

app.get('/health', async (_req, res) => {
  res.json({ ok: true, service: 'YemenDub AI API', timestamp: new Date().toISOString() });
});

app.post('/api/auth/register', async (req, res) => {
  const schema = z.object({ name: z.string().min(2), email: z.string().email(), password: z.string().min(6) });
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: 'بيانات المستخدم غير صالحة' });

  const exists = await prisma.user.findUnique({ where: { email: parsed.data.email } });
  if (exists) return res.status(409).json({ error: 'هذا البريد مسجّل بالفعل' });

  const user = await prisma.user.create({
    data: {
      name: parsed.data.name,
      email: parsed.data.email,
      passwordHash: hashPassword(parsed.data.password)
    }
  });

  const token = createSessionToken(user.id, user.email);
  res.status(201).json({ token, user: { id: user.id, name: user.name, email: user.email } });
});

app.post('/api/auth/login', async (req, res) => {
  const schema = z.object({ email: z.string().email(), password: z.string().min(6) });
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: 'بيانات الدخول غير صالحة' });

  const user = await prisma.user.findUnique({ where: { email: parsed.data.email } });
  if (!user || !verifyPassword(parsed.data.password, user.passwordHash)) {
    return res.status(401).json({ error: 'بيانات الدخول غير صحيحة' });
  }

  const token = createSessionToken(user.id, user.email);
  res.json({ token, user: { id: user.id, name: user.name, email: user.email } });
});

app.get('/api/auth/me', async (req, res) => {
  if (!req.user) return res.status(401).json({ error: 'غير مصرح لك' });
  const user = await prisma.user.findUnique({ where: { id: req.user.id } });
  if (!user) return res.status(404).json({ error: 'المستخدم غير موجود' });
  res.json({ id: user.id, name: user.name, email: user.email });
});

app.get('/api/projects', async (req, res) => {
  const where = req.user ? { userId: req.user.id } : {};
  const projects = await prisma.project.findMany({
    where,
    orderBy: { createdAt: 'desc' },
    include: { segments: true }
  });
  res.json(projects);
});

app.post('/api/projects/upload', upload.single('video'), async (req, res) => {
  const schema = z.object({ dialect: z.string().default('صنعاني'), addSubtitles: z.string().optional() });
  const parsed = schema.safeParse({ dialect: req.body.dialect, addSubtitles: req.body.addSubtitles });

  if (!parsed.success || !req.file) {
    return res.status(400).json({ error: 'يجب إرفاق ملف فيديو صالح' });
  }

  await ensureStorageDirs();
  const filename = req.file.originalname || `${Date.now()}.mp4`;
  const finalPath = path.join(config.storageRoot, 'uploads', filename);
  await fs.rename(req.file.path, finalPath);

  const project = await prisma.project.create({
    data: {
      userId: req.user?.id,
      name: filename,
      sourceType: 'upload',
      filePath: finalPath,
      dialect: parsed.data.dialect,
      addSubtitles: parsed.data.addSubtitles === 'true',
      status: 'UPLOADED',
      progress: 0,
      segments: {
        create: [
          { speaker: 'المتحدث 1', startMs: 0, endMs: 5000, text: 'سيتم تحليل هذا الفيديو وتجهيز النسخة المزدوجة لهجة ' + parsed.data.dialect + '.' }
        ]
      }
    },
    include: { segments: true }
  });

  res.status(201).json(project);
});

app.post('/api/projects/from-url', async (req, res) => {
  const schema = z.object({ url: z.string().url(), dialect: z.string().default('صنعاني'), addSubtitles: z.boolean().default(false) });
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: 'بيانات الرابط غير صالحة' });

  const project = await prisma.project.create({
    data: {
      userId: req.user?.id,
      name: 'Imported URL',
      sourceType: 'url',
      sourceUrl: parsed.data.url,
      dialect: parsed.data.dialect,
      addSubtitles: parsed.data.addSubtitles,
      status: 'UPLOADED',
      segments: {
        create: [
          { speaker: 'المتحدث 1', startMs: 0, endMs: 4000, text: 'تم استيراد الرابط، وستتم معالجته في السير العملية الذكية.' }
        ]
      }
    },
    include: { segments: true }
  });

  res.status(201).json(project);
});

app.get('/api/projects/:id', async (req, res) => {
  const project = await prisma.project.findUnique({ where: { id: req.params.id }, include: { segments: true } });
  if (!project) return res.status(404).json({ error: 'المشروع غير موجود' });
  if (req.user && project.userId && project.userId !== req.user.id) return res.status(403).json({ error: 'غير مصرح لك' });
  res.json(project);
});

app.get('/api/projects/:id/segments', async (req, res) => {
  const project = await prisma.project.findUnique({ where: { id: req.params.id }, include: { segments: true } });
  if (!project) return res.status(404).json({ error: 'المشروع غير موجود' });
  if (req.user && project.userId && project.userId !== req.user.id) return res.status(403).json({ error: 'غير مصرح لك' });
  res.json(project.segments);
});

app.post('/api/projects/:id/process', async (req, res) => {
  const project = await prisma.project.findUnique({ where: { id: req.params.id } });
  if (!project) return res.status(404).json({ error: 'المشروع غير موجود' });
  if (req.user && project.userId && project.userId !== req.user.id) return res.status(403).json({ error: 'غير مصرح لك' });

  await prisma.project.update({ where: { id: project.id }, data: { status: 'QUEUED', progress: 5 } });
  await projectQueue.add('process-project', { projectId: project.id });

  res.json({ jobId: project.id, status: 'QUEUED', progress: 5 });
});

app.patch('/api/projects/:projectId/segments/:segmentId', async (req, res) => {
  const schema = z.object({ text: z.string().min(1), startMs: z.number().int().nonnegative(), endMs: z.number().int().nonnegative() });
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: 'صياغة المقطع غير صحيحة' });

  const segment = await prisma.segment.update({
    where: { id: req.params.segmentId },
    data: {
      text: parsed.data.text,
      startMs: parsed.data.startMs,
      endMs: parsed.data.endMs
    }
  });

  res.json(segment);
});

app.post('/api/projects/:id/export', async (_req, res) => {
  const project = await prisma.project.findUnique({ where: { id: req.params.id } });
  if (!project) return res.status(404).json({ error: 'المشروع غير موجود' });
  if (_req.user && project.userId && project.userId !== _req.user.id) return res.status(403).json({ error: 'غير مصرح لك' });

  const exportName = `${project.id}-final.mp4`;
  const exportPath = path.join(config.storageRoot, 'exports', exportName);
  await fs.mkdir(path.dirname(exportPath), { recursive: true });
  await fs.writeFile(exportPath, '');
  const publicUrl = `${config.appUrl}/storage/exports/${exportName}`;

  await prisma.project.update({
    where: { id: project.id },
    data: { outputUrl: publicUrl, status: 'READY', progress: 100 }
  });

  res.json({ jobId: project.id, status: 'READY', progress: 100, outputUrl: publicUrl });
});

const port = config.port;
app.listen(port, () => console.log(`YemenDub AI API running on http://localhost:${port}`));
