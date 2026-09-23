import { execFile } from 'node:child_process';
import { promisify } from 'node:util';

const exec = promisify(execFile);

export async function extractAudio(inputPath: string, outputPath: string) {
  await exec('ffmpeg', [
    '-i', inputPath,
    '-vn',
    '-acodec', 'pcm_s16le',
    '-ar', '16000',
    '-y',
    outputPath
  ]);
}

export async function renderDubbedVideo(inputPath: string, audioPath: string, outputPath: string) {
  await exec('ffmpeg', [
    '-i', inputPath,
    '-i', audioPath,
    '-map', '0:v:0',
    '-map', '1:a:0',
    '-c:v', 'copy',
    '-c:a', 'aac',
    '-movflags', '+faststart',
    '-y',
    outputPath
  ]);
}
