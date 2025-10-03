"use client";

import { useState } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import type { SupabaseClient } from '@supabase/supabase-js';
import { getMissingEnvVars } from './env';

type SupabaseHookResult = {
  client: SupabaseClient | null;
  missingEnv: ReturnType<typeof getMissingEnvVars>;
};

/**
 * Returns a memoized Supabase client for use inside client components.
 * When the required environment variables are missing, the hook
 * resolves to `null` and exposes the missing variables so callers can
 * surface a helpful UI instead of crashing on render.
 */
export function useSupabaseClient(): SupabaseHookResult {
  const missingEnv = getMissingEnvVars(['supabaseUrl', 'supabaseAnonKey']);

  const [client] = useState(() => {
    if (missingEnv.length) {
      return null;
    }
    return createClientComponentClient();
  });

  return { client: client as SupabaseClient | null, missingEnv };
}
