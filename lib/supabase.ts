import { createPagesBrowserClient } from '@supabase/auth-helpers-nextjs';
import { env } from './env';

export const supabase = createPagesBrowserClient({ supabaseUrl: env.supabaseUrl, supabaseKey: env.supabaseAnonKey });
