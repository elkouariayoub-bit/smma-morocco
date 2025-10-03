import { createBrowserClient } from '@supabase/auth-helpers-nextjs';
import { env } from './env';

export const supabase = createBrowserClient(env.supabaseUrl, env.supabaseAnonKey);
