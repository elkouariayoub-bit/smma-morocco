// lib/supabaseServer.ts
import { createClient } from '@supabase/supabase-js';
import { env, getMissingEnvVars } from './env';

export function supabaseServer() {
  const missing = getMissingEnvVars(['supabaseUrl', 'supabaseAnonKey']);
  if (missing.length) {
    throw new Error(`Missing Supabase environment variables: ${missing.join(', ')}`);
  }

  return createClient(env.supabaseUrl as string, env.supabaseAnonKey as string, {
    auth: { persistSession: false },
  });
}
