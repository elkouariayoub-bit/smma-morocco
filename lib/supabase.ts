import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { env } from './env';

export const supabase = createClientComponentClient({ supabaseUrl: env.supabaseUrl, supabaseKey: env.supabaseAnonKey });
