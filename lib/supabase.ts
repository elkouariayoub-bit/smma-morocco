import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

import { env } from './env';

let browserClient: ReturnType<typeof createClientComponentClient<any>> | null = null;

function createBrowserClient(): ReturnType<typeof createClientComponentClient<any>> {
  if (!env.supabaseUrl || !env.supabaseAnonKey) {
    throw new Error(
      'Supabase client requires NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY to be configured.',
    );
  }

  return createClientComponentClient<any>({
    supabaseUrl: env.supabaseUrl,
    supabaseKey: env.supabaseAnonKey,
  });
}

export function getSupabaseBrowserClient(): ReturnType<typeof createClientComponentClient<any>> {
  if (!browserClient) {
    browserClient = createBrowserClient();
  }

  return browserClient;
}

export function getOptionalSupabaseBrowserClient(): ReturnType<typeof createClientComponentClient<any>> | null {
  try {
    return getSupabaseBrowserClient();
  } catch (error) {
    if (process.env.NODE_ENV !== 'production') {
      console.warn('Supabase client unavailable:', error);
    }

    return null;
  }
}

export function isSupabaseConfigured(): boolean {
  return Boolean(env.supabaseUrl && env.supabaseAnonKey);
}
