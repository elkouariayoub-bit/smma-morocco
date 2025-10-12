// lib/supabaseServer.ts
import { createClient } from '@supabase/supabase-js';
import { env } from './env';

export function supabaseServer() {
  const supabaseUrl = env.supabaseUrl;
  if (!supabaseUrl) {
    throw new Error('Missing server env var: NEXT_PUBLIC_SUPABASE_URL');
  }

  const key = env.supabaseServiceRoleKey || env.supabaseAnonKey;
  if (!key) {
    throw new Error('Missing Supabase key for server client');
  }

  return createClient(supabaseUrl, key, {
    auth: { persistSession: false },
  });
}
