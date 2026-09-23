import crypto from 'node:crypto';

export function hashPassword(password: string) {
  return crypto.createHash('sha256').update(password + process.env.JWT_SECRET || 'dev-secret').digest('hex');
}

export function verifyPassword(password: string, hash: string | null | undefined) {
  if (!hash) return false;
  return hashPassword(password) === hash;
}

export function createSessionToken(userId: string, email: string) {
  const payload = { userId, email, exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 7 };
  return Buffer.from(JSON.stringify(payload)).toString('base64url');
}

export function decodeSessionToken(token: string) {
  try {
    const decoded = Buffer.from(token, 'base64url').toString('utf8');
    return JSON.parse(decoded) as { userId: string; email: string; exp: number };
  } catch {
    return null;
  }
}
