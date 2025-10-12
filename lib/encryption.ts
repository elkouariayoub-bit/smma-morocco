import { randomBytes, createCipheriv, createDecipheriv } from 'node:crypto';

import { loadServerEnv } from './load-server-env';

const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 12; // 96-bit IV for GCM
const KEY_LENGTH = 32;

function decodeKey(rawKey: string): Buffer {
  const trimmed = rawKey.trim();

  const asBase64 = Buffer.from(trimmed, 'base64');
  if (asBase64.length === KEY_LENGTH) {
    return asBase64;
  }

  try {
    const asHex = Buffer.from(trimmed, 'hex');
    if (asHex.length === KEY_LENGTH) {
      return asHex;
    }
  } catch (error) {
    // fall through
  }

  const asUtf8 = Buffer.from(trimmed, 'utf8');
  if (asUtf8.length === KEY_LENGTH) {
    return asUtf8;
  }

  throw new Error('INTEGRATIONS_ENCRYPTION_KEY must decode to 32 bytes');
}

function getKey(): Buffer {
  loadServerEnv();
  const key = process.env.INTEGRATIONS_ENCRYPTION_KEY;
  if (!key) {
    throw new Error('Missing INTEGRATIONS_ENCRYPTION_KEY environment variable');
  }

  return decodeKey(key);
}

export function encryptSecret(value: string | null | undefined): string | null {
  if (!value) {
    return value ?? null;
  }

  const key = getKey();
  const iv = randomBytes(IV_LENGTH);
  const cipher = createCipheriv(ALGORITHM, key, iv);
  const encrypted = Buffer.concat([cipher.update(value, 'utf8'), cipher.final()]);
  const authTag = cipher.getAuthTag();

  return [iv.toString('base64'), encrypted.toString('base64'), authTag.toString('base64')].join('.');
}

export function decryptSecret(payload: string | null | undefined): string | null {
  if (!payload) {
    return payload ?? null;
  }

  const key = getKey();
  const segments = payload.split('.');
  if (segments.length !== 3) {
    throw new Error('Invalid encrypted payload format');
  }

  const [ivPart, encryptedPart, authTagPart] = segments;
  const iv = Buffer.from(ivPart, 'base64');
  const encrypted = Buffer.from(encryptedPart, 'base64');
  const authTag = Buffer.from(authTagPart, 'base64');

  const decipher = createDecipheriv(ALGORITHM, key, iv);
  decipher.setAuthTag(authTag);

  const decrypted = Buffer.concat([decipher.update(encrypted), decipher.final()]);
  return decrypted.toString('utf8');
}
