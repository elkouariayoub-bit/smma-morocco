// lib/env.ts
export const env = {
  geminiApiKey: process.env.GEMINI_API_KEY!,
  supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL!,
  supabaseAnonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
};

function assertEnv() {
  const missing: string[] = [];
  (Object.keys(env) as (keyof typeof env)[]).forEach((k) => {
    if (!env[k]) missing.push(k);
  });
  if (missing.length) {
    throw new Error(`Missing required env vars: ${missing.join(", ")}`);
  }
}
assertEnv();
