import { betterAuth } from 'better-auth';
import { google } from 'better-auth/providers';
import { env } from './env';

import type { BetterAuthInstance } from 'better-auth';

let authInstance: BetterAuthInstance | null = null;

export function getBetterAuth() {
  if (!authInstance) {
    if (!env.googleClientId || !env.googleClientSecret) {
      throw new Error('Google OAuth is not configured. Please set GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET.');
    }

    authInstance = betterAuth({
      providers: [
        google({
          clientId: env.googleClientId,
          clientSecret: env.googleClientSecret,
        }),
      ],
    });
  }

  return authInstance;
}
