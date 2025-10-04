// lib/supabaseServer.ts
import { createClient } from '@supabase/supabase-js';
import { env } from './env';

export function supabaseServer() {
  if (!env.supabaseUrl || !env.supabaseAnonKey) {
    throw new Error('Missing server env vars: NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY');
  }

  return createClient(env.supabaseUrl as string, env.supabaseAnonKey as string, {
    auth: { persistSession: false }
  });
}
