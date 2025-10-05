import { betterAuth } from 'better-auth';
import { google } from 'better-auth/providers';
import { env } from './env';
import { loadServerEnv } from './load-server-env';

import type { BetterAuthInstance } from 'better-auth';

const mask = (value: string | null | undefined) => {
  if (!value) return 'missing';
  if (value.length <= 8) return 'set';
  return `${value.slice(0, 4)}…${value.slice(-4)}`;
};

let instance: BetterAuthInstance | null = null;
let initializing: Promise<BetterAuthInstance> | null = null;

async function createBetterAuth(): Promise<BetterAuthInstance> {
  loadServerEnv();

  const missing: string[] = [];

  if (!env.googleClientId) missing.push('GOOGLE_CLIENT_ID');
  if (!env.googleClientSecret) missing.push('GOOGLE_CLIENT_SECRET');

  if (!env.betterAuthSecret) {
    throw new Error(
      [
        'Better Auth secret is not configured.',
        'Generate one with `node -e "console.log(require(\'crypto\').randomBytes(32).toString(\'hex\'))"`',
        'and add BETTER_AUTH_SECRET to your .env.local (and hosting provider) before restarting.',
      ].join(' ')
    );
  }

  if (missing.length) {
    throw new Error(`Better Auth is missing configuration: ${missing.join(', ')}`);
  }

  const auth = betterAuth({
    secret: env.betterAuthSecret!,
    baseURL: env.betterAuthUrl ?? null,
    providers: [
      google({
        clientId: env.googleClientId!,
        clientSecret: env.googleClientSecret!,
      }),
    ],
  });

  const providerIds = Object.keys(auth.providers);
  console.info('[better-auth] Configuration check', {
    googleClientId: mask(env.googleClientId),
    googleClientSecret: mask(env.googleClientSecret),
    betterAuthSecret: mask(env.betterAuthSecret),
    betterAuthUrl: env.betterAuthUrl ?? 'not set',
  });
  console.info(
    '[better-auth] Registered providers:',
    providerIds.length ? providerIds.join(', ') : 'none'
  );

  if (!auth.providers.google) {
    throw new Error(
      'Google provider failed to register. Double-check GOOGLE_CLIENT_ID/SECRET values and restart your server.'
    );
  }

  return auth;
}

export async function getBetterAuth(): Promise<BetterAuthInstance> {
  if (instance) {
    return instance;
  }

  if (!initializing) {
    initializing = createBetterAuth()
      .then((auth) => {
        instance = auth;
        return auth;
      })
      .finally(() => {
        initializing = null;
      });
  }

  return initializing;
}
