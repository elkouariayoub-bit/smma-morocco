// lib/supabaseServer.ts
import { createClient } from '@supabase/supabase-js';
import { env } from './env';

export function supabaseServer() {
  if (!env.supabaseUrl) {
    throw new Error('Missing server env var: NEXT_PUBLIC_SUPABASE_URL');
  }

  // Prefer a service role key for server operations when available
  const key = env.supabaseServiceRoleKey || env.supabaseAnonKey;
  if (!key) throw new Error('Missing Supabase key for server client');

  return createClient(env.supabaseUrl as string, key as string, {
    auth: { persistSession: false }
  });
}
