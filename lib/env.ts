export const env = {
  geminiApiKey: process.env.GEMINI_API_KEY,
  supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL,
  supabaseAnonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
} as const;

export type EnvKey = keyof typeof env;

export function getMissingEnvVars(keys: EnvKey[] = Object.keys(env) as EnvKey[]) {
  return keys.filter((key) => {
    const value = env[key];
    if (typeof value === 'string') {
      return value.trim().length === 0;
    }
    return !value;
  });
}

export function formatMissingEnvMessage(keys: EnvKey[]) {
  return keys.length ? keys.join(', ') : 'Unknown variables';
}
