"use client";

import { useState } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

/**
 * Returns a memoized Supabase client for use inside client components.
 *
 * Supabase's `createBrowserSupabaseClient` helper has been deprecated in favour
 * of `createClientComponentClient`, which is safe to call during React render.
 * We wrap it in `useState` so every component instance receives a stable
 * reference without re-creating the client on every render.
 */
export function useSupabaseClient<Database = any>() {
  const [client] = useState(() => createClientComponentClient<Database>());

  return client;
}
