import { createPagesBrowserClient } from '@supabase/auth-helpers-nextjs';
import type { SupabaseClient } from '@supabase/supabase-js';
import { requireBrowserSupabaseEnv } from './env';

type BrowserClient = SupabaseClient<any, any, any>;

let browserClient: BrowserClient | null = null;

function initBrowserClient(): BrowserClient {
  const { supabaseUrl, supabaseAnonKey } = requireBrowserSupabaseEnv();
  browserClient = createPagesBrowserClient({ supabaseUrl, supabaseKey: supabaseAnonKey });
  return browserClient;
}

export function getSupabaseBrowserClient(): BrowserClient {
  if (browserClient) return browserClient;
  if (typeof window === 'undefined') {
    throw new Error('Supabase browser client is not available on the server.');
  }
  return initBrowserClient();
}

export const supabase = new Proxy({} as BrowserClient, {
  get(_target, prop, receiver) {
    const instance = getSupabaseBrowserClient();
    const value = Reflect.get(instance as any, prop, receiver);
    return typeof value === 'function' ? value.bind(instance) : value;
  },
});
