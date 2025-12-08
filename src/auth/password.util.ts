import { randomBytes, pbkdf2Sync } from 'node:crypto';

// Format: pbkdf2$<iterations>$<salt>$<hash>
const ITERATIONS = 100_000;
const KEYLEN = 32; // 256-bit
const DIGEST = 'sha256';

export function hashPassword(plain: string): string {
  const salt = randomBytes(16).toString('hex');
  const hash = pbkdf2Sync(plain, salt, ITERATIONS, KEYLEN, DIGEST).toString('hex');
  return `pbkdf2$${ITERATIONS}$${salt}$${hash}`;
}

export function verifyPassword(plain: string, stored: string): boolean {
  try {
    const [scheme, iterStr, salt, expected] = stored.split('$');
    if (scheme !== 'pbkdf2') return false;
    const iterations = Number(iterStr);
    const hash = pbkdf2Sync(plain, salt, iterations, KEYLEN, DIGEST).toString('hex');
    return timingSafeEqual(expected, hash);
  } catch {
    return false;
  }
}

function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  // Simple constant-time comparison
  let result = 0;
  for (let i = 0; i < a.length; i++) {
    result |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return result === 0;
}