import { randomBytes, createCipheriv, createDecipheriv } from 'node:crypto'

import { loadServerEnv } from './load-server-env'

const ALGORITHM = 'aes-256-gcm'
const IV_LENGTH = 12 // 96-bit IV for GCM
const AUTH_TAG_LENGTH = 16 // 128-bit authentication tag
const KEY_LENGTH = 32

function decodeKey(rawKey: string): Buffer {
  const trimmed = rawKey.trim()

  const asBase64 = Buffer.from(trimmed, 'base64')
  if (asBase64.length === KEY_LENGTH) {
    return asBase64
  }

  try {
    const asHex = Buffer.from(trimmed, 'hex')
    if (asHex.length === KEY_LENGTH) {
      return asHex
    }
  } catch (error) {
    // fall through to UTF-8 validation
  }

  const asUtf8 = Buffer.from(trimmed, 'utf8')
  if (asUtf8.length === KEY_LENGTH) {
    return asUtf8
  }

  throw new Error('ENCRYPTION_KEY must decode to 32 bytes')
}

function getKey(): Buffer {
  loadServerEnv()
  const key = process.env.ENCRYPTION_KEY
  if (!key) {
    throw new Error('Missing ENCRYPTION_KEY environment variable')
  }

  return decodeKey(key)
}

export function encrypt(text: string): string {
  if (typeof text !== 'string') {
    throw new TypeError('Value to encrypt must be a string')
  }

  try {
    const key = getKey()
    const iv = randomBytes(IV_LENGTH)
    const cipher = createCipheriv(ALGORITHM, key, iv)
    const encrypted = Buffer.concat([cipher.update(text, 'utf8'), cipher.final()])
    const authTag = cipher.getAuthTag()

    const payload = Buffer.concat([iv, authTag, encrypted])
    return payload.toString('base64')
  } catch (error) {
    if (error instanceof Error) {
      throw error
    }
    throw new Error('Failed to encrypt data')
  }
}

export function decrypt(encryptedText: string): string {
  if (typeof encryptedText !== 'string' || encryptedText.length === 0) {
    throw new TypeError('Encrypted payload must be a non-empty string')
  }

  try {
    const key = getKey()
    const payload = Buffer.from(encryptedText, 'base64')

    if (payload.length <= IV_LENGTH + AUTH_TAG_LENGTH) {
      throw new Error('Encrypted payload is too short')
    }

    const iv = payload.subarray(0, IV_LENGTH)
    const authTag = payload.subarray(IV_LENGTH, IV_LENGTH + AUTH_TAG_LENGTH)
    const encrypted = payload.subarray(IV_LENGTH + AUTH_TAG_LENGTH)

    const decipher = createDecipheriv(ALGORITHM, key, iv)
    decipher.setAuthTag(authTag)

    const decrypted = Buffer.concat([decipher.update(encrypted), decipher.final()])
    return decrypted.toString('utf8')
  } catch (error) {
    if (error instanceof Error) {
      throw error
    }
    throw new Error('Failed to decrypt data')
  }
}
