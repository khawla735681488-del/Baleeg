import { Worker } from 'bullmq';
import IORedis from 'ioredis';
import path from 'node:path';
import { config } from '../config.js';
import { prisma } from '../db.js';
import { extractAudio, renderDubbedVideo } from '../lib/ffmpeg.js';
import { ensureStorageDirs } from '../lib/storage.js';
import { generateProjectSegments } from '../services/aiPipeline.js';

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

      const segments = await generateProjectSegments(project, inputPath);

      for (const [index, segment] of segments.entries()) {
        await prisma.segment.upsert({
          where: { id: segment.id },
          update: {
            text: segment.text,
            speaker: segment.speaker,
            startMs: segment.startMs,
            endMs: segment.endMs,
            audioUrl: segment.audioUrl
          },
          create: {
            id: segment.id,
            projectId,
            speaker: segment.speaker,
            startMs: segment.startMs,
            endMs: segment.endMs,
            text: segment.text,
            audioUrl: segment.audioUrl
          }
        });

        await prisma.project.update({
          where: { id: projectId },
          data: { progress: 20 + ((index + 1) / Math.max(segments.length, 1)) * 70 }
        });
      }

      const outputDir = path.join(config.storageRoot, 'exports');
      const outputPath = path.join(outputDir, `${project.id}-final.mp4`);
      await renderDubbedVideo(inputPath, wavPath, outputPath);
      await prisma.project.update({
        where: { id: projectId },
        data: {
          status: 'READY',
          progress: 100,
          outputUrl: `${config.appUrl}/storage/exports/${project.id}-final.mp4`
        }
      });
    } else {
      const fallbackSegments = await generateProjectSegments(project, undefined);
      for (const segment of fallbackSegments) {
        await prisma.segment.upsert({
          where: { id: segment.id },
          update: {
            text: segment.text,
            speaker: segment.speaker,
            startMs: segment.startMs,
            endMs: segment.endMs,
            audioUrl: segment.audioUrl
          },
          create: {
            id: segment.id,
            projectId,
            speaker: segment.speaker,
            startMs: segment.startMs,
            endMs: segment.endMs,
            text: segment.text,
            audioUrl: segment.audioUrl
          }
        });
      }
      await prisma.project.update({ where: { id: projectId }, data: { status: 'READY', progress: 100 } });
    }
  },
  { connection }
);

projectWorker.on('completed', job => console.log(`Project ${job.data.projectId} processed`));
projectWorker.on('failed', (job, err) => console.error('Project processing failed', job?.data, err.message));
