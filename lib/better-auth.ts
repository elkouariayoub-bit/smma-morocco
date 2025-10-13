import { betterAuth } from 'better-auth';
import { google } from 'better-auth/providers';

import { loadServerEnv } from './load-server-env';

import type { BetterAuthInstance } from 'better-auth';

type BetterAuthConfig = {
  googleClientId: string;
  googleClientSecret: string;
  betterAuthSecret: string;
  betterAuthUrl: string;
};

type BetterAuthConfigState =
  | { status: 'ready'; config: BetterAuthConfig }
  | { status: 'missing'; config: Partial<BetterAuthConfig>; missing: string[] };

export type BetterAuthStatus = {
  configured: boolean;
  missing: string[];
  providers: string[];
  baseUrl: string | null;
};

export class BetterAuthUnavailableError extends Error {
  statusCode = 503;

  constructor(message: string) {
    super(message);
    this.name = 'BetterAuthUnavailableError';
  }
}

let instance: BetterAuthInstance | null | undefined;
let initializing: Promise<BetterAuthInstance | null> | null = null;
let cachedState: BetterAuthConfigState | null = null;

async function resolveConfigState(forceRefresh = false): Promise<BetterAuthConfigState> {
  if (!forceRefresh && cachedState) {
    return cachedState;
  }

  loadServerEnv();
  const { env } = await import('./env');

  const config: Partial<BetterAuthConfig> = {
    googleClientId: env.googleClientId ?? undefined,
    googleClientSecret: env.googleClientSecret ?? undefined,
    betterAuthSecret: env.betterAuthSecret ?? undefined,
    betterAuthUrl: env.betterAuthUrl ?? undefined,
  };

  const missing: string[] = [];

  if (!config.googleClientId) missing.push('GOOGLE_CLIENT_ID');
  if (!config.googleClientSecret) missing.push('GOOGLE_CLIENT_SECRET');
  if (!config.betterAuthSecret) missing.push('BETTER_AUTH_SECRET');
  if (!config.betterAuthUrl) missing.push('BETTER_AUTH_URL');

  cachedState =
    missing.length === 0
      ? { status: 'ready', config: config as BetterAuthConfig }
      : { status: 'missing', config, missing };

  return cachedState;
}

async function createBetterAuth(): Promise<BetterAuthInstance | null> {
  const state = await resolveConfigState();

  if (state.status === 'missing') {
    if (process.env.NODE_ENV !== 'production') {
      console.warn(
        '[better-auth] Authentication disabled – missing configuration:',
        state.missing
      );
    }
    return null;
  }

  const auth = betterAuth({
    secret: state.config.betterAuthSecret,
    baseURL: state.config.betterAuthUrl,
    providers: [
      google({
        clientId: state.config.googleClientId,
        clientSecret: state.config.googleClientSecret,
      }),
    ],
  });

  if (!auth.providers.google) {
    throw new Error(
      'Google provider failed to register. Double-check GOOGLE_CLIENT_ID/SECRET values and restart your server.'
    );
  }

  return auth;
}

export async function getBetterAuth(): Promise<BetterAuthInstance | null> {
  if (instance !== undefined) {
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

export async function getBetterAuthStatus(options: {
  forceRefresh?: boolean;
} = {}): Promise<BetterAuthStatus> {
  const state = await resolveConfigState(options.forceRefresh ?? false);

  if (state.status === 'ready') {
    return {
      configured: true,
      missing: [],
      providers: ['google'],
      baseUrl: state.config.betterAuthUrl,
    };
  }

  return {
    configured: false,
    missing: [...state.missing],
    providers: [],
    baseUrl: state.config.betterAuthUrl ?? null,
  };
}

export function resetBetterAuthCache() {
  instance = undefined;
  cachedState = null;
}
