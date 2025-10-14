import type { SupabaseClient } from '@supabase/supabase-js';
import { createClient } from '@supabase/supabase-js';

import { loadServerEnv } from './load-server-env';
import { env } from './env';

let adminClient: SupabaseClient<any> | null = null;

function createAdminClient(): SupabaseClient<any> {
  loadServerEnv();

  if (!env.supabaseUrl) {
    throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL for Supabase admin client');
  }

  if (!env.supabaseServiceRoleKey) {
    throw new Error('Missing SUPABASE_SERVICE_ROLE_KEY for Supabase admin client');
  }

  return createClient(env.supabaseUrl, env.supabaseServiceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

export function getSupabaseAdminClient(): SupabaseClient<any> {
  if (!adminClient) {
    adminClient = createAdminClient();
  }

  return adminClient;
}

export function getOptionalSupabaseAdminClient(): SupabaseClient<any> | null {
  try {
    return getSupabaseAdminClient();
  } catch (error) {
    if (process.env.NODE_ENV !== 'production') {
      console.warn('Supabase admin client unavailable:', error);
    }

    return null;
  }
}
