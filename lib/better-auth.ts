import { betterAuth } from 'better-auth';
import { google } from 'better-auth/providers';
import { env } from './env';

import type { BetterAuthInstance } from 'better-auth';

let instance: BetterAuthInstance | null = null;

export function getBetterAuth() {
  if (instance) {
    return instance;
  }

  const missing: string[] = [];

  if (!env.googleClientId) missing.push('GOOGLE_CLIENT_ID');
  if (!env.googleClientSecret) missing.push('GOOGLE_CLIENT_SECRET');
  if (!env.betterAuthSecret) missing.push('BETTER_AUTH_SECRET');

  if (missing.length) {
    throw new Error(`Better Auth is missing configuration: ${missing.join(', ')}`);
  }

  instance = betterAuth({
    secret: env.betterAuthSecret!,
    baseURL: env.betterAuthUrl ?? null,
    providers: [
      google({
        clientId: env.googleClientId!,
        clientSecret: env.googleClientSecret!,
      }),
    ],
  });

  return instance;
}
