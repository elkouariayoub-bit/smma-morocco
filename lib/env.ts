// lib/env.ts
// Helper utilities to read runtime environment variables without
// crashing the build when deploy-time configuration is incomplete.
// These helpers are imported in both server and client modules, so
// keep the reads side-effect free and only throw when a value is
// accessed at runtime.

export const env = {
  // Server-only (do NOT expose to client)
  geminiApiKey: process.env.GEMINI_API_KEY,
  supabaseServiceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY,

  // Client (NEXT_PUBLIC_*) — safe to bundle for browser
  supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL,
  supabaseAnonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
};

export function requireBrowserSupabaseEnv() {
  if (!env.supabaseUrl || !env.supabaseAnonKey) {
    throw new Error(
      'Supabase environment variables are missing. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.'
    );
  }

  return {
    supabaseUrl: env.supabaseUrl,
    supabaseAnonKey: env.supabaseAnonKey,
  } as { supabaseUrl: string; supabaseAnonKey: string };
}

export function requireGeminiApiKey() {
  if (!env.geminiApiKey) {
    throw new Error('GEMINI_API_KEY is not configured. Add it to your environment settings.');
  }

  return env.geminiApiKey;
}
