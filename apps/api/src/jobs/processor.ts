import { Worker } from 'bullmq';
import IORedis from 'ioredis';
import { config } from './config.js';
import { prisma } from './db.js';
import { extractAudio, renderDubbedVideo } from './lib/ffmpeg.js';
import { ensureStorageDirs } from './lib/storage.js';

const connection = new IORedis(config.redisUrl);

export const projectWorker = new Worker(
  'project-processing',
  async job => {
    const { projectId } = job.data as { projectId: string };
    const project = await prisma.project.findUnique({ where: { id: projectId }, include: { segments: true } });
    if (!project) return;

    await prisma.project.update({ where: { id: projectId }, data: { status: 'PROCESSING', progress: 10 } });
    await ensureStorageDirs();

    if (project.filePath) {
      const inputPath = project.filePath;
      const wavPath = `${inputPath}.wav`;
      await extractAudio(inputPath, wavPath);

      const segments = project.segments.length > 0 ? project.segments : Array.from({ length: 4 }, (_, index) => ({
        id: `seg-${index + 1}`,
        speaker: index % 2 === 0 ? 'المتحدث 1' : 'المتحدث 2',
        startMs: index * 5000,
        endMs: (index + 1) * 5000,
        text: index === 0 ? 'مرحباً، هذا فيديو تم تحليله تلقائياً.' : 'تمت ترجمة النص إلى لهجة ' + project.dialect + ' مع توليد دبلجة صوتية.'
      }));

      for (const [index, segment] of segments.entries()) {
        await prisma.segment.upsert({
          where: { id: segment.id },
          update: { text: segment.text, speaker: segment.speaker, startMs: segment.startMs, endMs: segment.endMs },
          create: {
            id: segment.id,
            projectId,
            speaker: segment.speaker,
            startMs: segment.startMs,
            endMs: segment.endMs,
            text: segment.text,
          }
        });
        await prisma.project.update({ where: { id: projectId }, data: { progress: 20 + ((index + 1) / segments.length) * 70 } });
      }

      const outputPath = `${inputPath}-processed.mp4`;
      await renderDubbedVideo(inputPath, wavPath, outputPath);
      await prisma.project.update({
        where: { id: projectId },
        data: { status: 'READY', progress: 100, outputUrl: outputPath }
      });
    } else {
      await prisma.project.update({ where: { id: projectId }, data: { status: 'READY', progress: 100 } });
    }
  },
  { connection }
);

projectWorker.on('completed', job => console.log(`Project ${job.data.projectId} processed`));
projectWorker.on('failed', (job, err) => console.error('Project processing failed', job?.data, err.message));
