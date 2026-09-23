import fs from 'node:fs/promises';
import path from 'node:path';
import { config } from './config.js';

export async function ensureStorageDirs() {
  await fs.mkdir(config.storageRoot, { recursive: true });
  await fs.mkdir(path.join(config.storageRoot, 'uploads'), { recursive: true });
  await fs.mkdir(path.join(config.storageRoot, 'exports'), { recursive: true });
  await fs.mkdir(path.join(config.storageRoot, 'audio'), { recursive: true });
}

export function publicPath(filePath: string) {
  return `${config.appUrl}/storage/${path.basename(filePath)}`;
}
