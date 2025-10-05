#!/usr/bin/env node
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import fs from 'node:fs';
import process from 'node:process';
import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const projectRoot = path.resolve(__dirname, '..');
const localEnvPath = path.join(projectRoot, '.env.local');
const defaultEnvPath = path.join(projectRoot, '.env');

if (fs.existsSync(localEnvPath)) {
  dotenv.config({ path: localEnvPath, override: true });
}

if (fs.existsSync(defaultEnvPath)) {
  dotenv.config({ path: defaultEnvPath, override: false });
}

const mask = (value) => {
  if (!value) return 'missing';
  if (value.length <= 8) return 'set';
  return `${value.slice(0, 4)}…${value.slice(-4)}`;
};

const googleClientId = process.env.GOOGLE_CLIENT_ID;
const googleClientSecret = process.env.GOOGLE_CLIENT_SECRET;
const betterAuthSecret = process.env.BETTER_AUTH_SECRET;
const betterAuthUrl = process.env.BETTER_AUTH_URL ?? 'not set';

const providerConfigured = Boolean(googleClientId && googleClientSecret);

const diagnostics = {
  googleClientId: mask(googleClientId),
  googleClientSecret: mask(googleClientSecret),
  betterAuthSecret: mask(betterAuthSecret),
  betterAuthUrl,
  providers: providerConfigured ? ['google'] : [],
};

console.log('Better Auth configuration diagnostics');
console.table(diagnostics);

const missing = [];
if (!googleClientId) missing.push('GOOGLE_CLIENT_ID');
if (!googleClientSecret) missing.push('GOOGLE_CLIENT_SECRET');
if (!betterAuthSecret) missing.push('BETTER_AUTH_SECRET');

if (missing.length) {
  console.error(`\nMissing required environment variables: ${missing.join(', ')}`);
  process.exitCode = 1;
} else {
  console.log('\nEnvironment variables look good. Make sure Google is enabled in Supabase → Authentication → Providers.');
}
