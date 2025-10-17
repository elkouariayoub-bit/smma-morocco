// lib/env.ts
// Centralized environment access with lazy getters so updates after
// dotenv loading are reflected automatically.

export type EnvValues = {
  readonly geminiApiKey: string | undefined;
  readonly supabaseServiceRoleKey: string | undefined;
  readonly googleClientId: string | undefined;
  readonly googleClientSecret: string | undefined;
  readonly betterAuthSecret: string | undefined;
  readonly betterAuthUrl: string | undefined;
  readonly supabaseUrl: string | undefined;
  readonly supabaseAnonKey: string | undefined;
  readonly siteUrl: string | undefined;
};

const env: EnvValues = {
  get geminiApiKey() {
    return process.env.GEMINI_API_KEY;
  },
  get supabaseServiceRoleKey() {
    return process.env.SUPABASE_SERVICE_ROLE_KEY;
  },
  get googleClientId() {
    return process.env.GOOGLE_CLIENT_ID;
  },
  get googleClientSecret() {
    return process.env.GOOGLE_CLIENT_SECRET;
  },
  get betterAuthSecret() {
    return process.env.BETTER_AUTH_SECRET;
  },
  get betterAuthUrl() {
    return process.env.BETTER_AUTH_URL;
  },
  get supabaseUrl() {
    return process.env.NEXT_PUBLIC_SUPABASE_URL;
  },
  get supabaseAnonKey() {
    return process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  },
  get siteUrl() {
    return process.env.NEXT_PUBLIC_SITE_URL;
  },
};

export { env };

function collectMissing(keys: Array<keyof EnvValues>) {
  const missing: string[] = [];

  for (const key of keys) {
    if (!env[key]) {
      missing.push(key as string);
    }
  }

  return missing;
}

const browserRequiredKeys: Array<keyof EnvValues> = ['supabaseUrl', 'supabaseAnonKey'];
const serverRequiredKeys: Array<keyof EnvValues> = [
  'geminiApiKey',
  'googleClientId',
  'googleClientSecret',
  'betterAuthSecret',
  'betterAuthUrl',
];

export function assertBrowserEnv() {
  const missing = collectMissing(browserRequiredKeys);
  if (missing.length) {
    throw new Error(`Missing required browser env vars: ${missing.join(', ')}`);
  }
}

export function assertServerEnv(options?: { optional?: Array<keyof EnvValues> }) {
  const optional = new Set(options?.optional ?? []);
  const keys = serverRequiredKeys.filter((key) => !optional.has(key));
  const missing = collectMissing(keys);

  if (missing.length) {
    throw new Error(`Missing required server env vars: ${missing.join(', ')}`);
  }
}

if (typeof window !== 'undefined') {
  try {
    assertBrowserEnv();
  } catch (error) {
    if (process.env.NODE_ENV !== 'production') {
      const message =
        error instanceof Error ? error.message : 'Unknown browser environment validation error.';
      console.warn('Missing optional browser environment variables:', message);
    }
  }
}
