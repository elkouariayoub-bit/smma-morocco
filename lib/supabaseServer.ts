// lib/supabaseServer.ts
import { createClient } from '@supabase/supabase-js';
import { env } from './env';

export function supabaseServer() {
  return createClient(env.supabaseUrl, env.supabaseAnonKey, {
    auth: { persistSession: false }
  });
}
