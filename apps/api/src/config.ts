import dotenv from 'dotenv';
dotenv.config({ path: '../../.env' });

export const config = {
  port: Number(process.env.PORT || 8080),
  databaseUrl: process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/yemendub?schema=public',
  redisUrl: process.env.REDIS_URL || 'redis://localhost:6379',
  storageRoot: process.env.STORAGE_ROOT || './storage',
  appUrl: process.env.APP_URL || 'http://localhost:3000',
  jwtSecret: process.env.JWT_SECRET || 'dev-secret'
};
