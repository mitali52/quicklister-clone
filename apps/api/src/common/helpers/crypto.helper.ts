import { createHash, randomBytes, scrypt, timingSafeEqual } from 'crypto';
import { promisify } from 'util';

const scryptAsync = promisify(scrypt);

const KEYLEN = 64;

export async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16).toString('hex');
  const hash = (await scryptAsync(password, salt, KEYLEN)) as Buffer;
  return `${salt}:${hash.toString('hex')}`;
}

export async function verifyPassword(password: string, stored: string): Promise<boolean> {
  // Backward compatibility for legacy seeded accounts that used plain SHA-256 hashes.
  if (!stored.includes(':')) {
    const legacyHash = createHash('sha256').update(password).digest('hex');
    return timingSafeEqual(Buffer.from(legacyHash, 'hex'), Buffer.from(stored, 'hex'));
  }

  const [salt, hash] = stored.split(':');
  if (!salt || !hash) return false;
  const hashBuffer = Buffer.from(hash, 'hex');
  const derivedHash = (await scryptAsync(password, salt, KEYLEN)) as Buffer;
  return timingSafeEqual(hashBuffer, derivedHash);
}

export function hashToken(token: string): string {
  return createHash('sha256').update(token).digest('hex');
}
