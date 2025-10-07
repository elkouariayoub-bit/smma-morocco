#!/usr/bin/env node

import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import process from 'node:process';

const REQUIRED_KEYS = [
  'GOOGLE_CLIENT_ID',
  'GOOGLE_CLIENT_SECRET',
  'BETTER_AUTH_SECRET',
  'BETTER_AUTH_URL',
];

const envPath = path.resolve(process.cwd(), '.env.local');

if (!existsSync(envPath)) {
  console.error('Missing .env.local file. Please create it with the required Better Auth credentials.');
  process.exit(1);
}

const fileContents = readFileSync(envPath, 'utf8');
const envEntries = new Map();

for (const line of fileContents.split(/\r?\n/)) {
  const trimmed = line.trim();

  if (!trimmed || trimmed.startsWith('#')) {
    continue;
  }

  const [key, ...valueParts] = trimmed.split('=');
  const value = valueParts.join('=').trim();
  envEntries.set(key.trim(), value);
}

const missingKeys = REQUIRED_KEYS.filter((key) => {
  if (envEntries.has(key)) {
    const value = envEntries.get(key) ?? '';
    return value.length === 0;
  }

  const runtimeValue = process.env[key];
  return !runtimeValue || runtimeValue.length === 0;
});

if (missingKeys.length > 0) {
  console.error(
    `Missing required environment variables in .env.local: ${missingKeys.join(', ')}`,
  );
  process.exit(1);
}

console.log('All required Better Auth environment variables are present in .env.local.');
