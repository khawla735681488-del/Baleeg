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
import './jobs/processor.js';

const app = express();
const upload = multer({ dest: path.join(config.storageRoot, 'uploads') });
const redis = new IORedis(config.redisUrl);
const projectQueue = new Queue('project-processing', { connection: redis });

app.use(cors());
app.use(express.json({ limit: '100mb' }));

app.get('/health', async (_req, res) => {
  res.json({ ok: true, service: 'YemenDub API', timestamp: new Date().toISOString() });
});

app.get('/api/projects', async (_req, res) => {
  const projects = await prisma.project.findMany({ orderBy: { createdAt: 'desc' }, include: { segments: true } });
  res.json(projects);
});

app.post('/api/projects/upload', upload.single('video'), async (req, res) => {
  const schema = z.object({ dialect: z.string().default('صنعاني'), addSubtitles: z.string().optional() });
  const parsed = schema.safeParse({
    dialect: req.body.dialect,
    addSubtitles: req.body.addSubtitles
  });

  if (!parsed.success || !req.file) {
    return res.status(400).json({ error: 'يجب إرفاق ملف فيديو صالح' });
  }

  await ensureStorageDirs();
  const finalPath = path.join(config.storageRoot, 'uploads', req.file.originalname || `${Date.now()}.mp4`);
  await fs.rename(req.file.path, finalPath);

  const project = await prisma.project.create({
    data: {
      name: req.file.originalname || 'video-upload',
      sourceType: 'upload',
      filePath: finalPath,
      dialect: parsed.data.dialect,
      addSubtitles: parsed.data.addSubtitles === 'true',
      status: 'UPLOADED',
      progress: 0
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
      name: 'Imported URL',
      sourceType: 'url',
      sourceUrl: parsed.data.url,
      dialect: parsed.data.dialect,
      addSubtitles: parsed.data.addSubtitles,
      status: 'UPLOADED'
    },
    include: { segments: true }
  });

  res.status(201).json(project);
});

app.get('/api/projects/:id', async (req, res) => {
  const project = await prisma.project.findUnique({ where: { id: req.params.id }, include: { segments: true } });
  if (!project) return res.status(404).json({ error: 'المشروع غير موجود' });
  res.json(project);
});

app.post('/api/projects/:id/process', async (req, res) => {
  const project = await prisma.project.findUnique({ where: { id: req.params.id } });
  if (!project) return res.status(404).json({ error: 'المشروع غير موجود' });

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

  const exportPath = path.join(config.storageRoot, 'exports', `${project.id}.mp4`);
  await fs.writeFile(exportPath, '');
  await prisma.project.update({ where: { id: project.id }, data: { outputUrl: exportPath, status: 'READY' } });

  res.json({ jobId: project.id, status: 'READY', progress: 100, outputUrl: exportPath });
});

const port = config.port;
app.listen(port, () => console.log(`YemenDub API running on http://localhost:${port}`));
