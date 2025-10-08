import { toNextJsHandler } from 'better-auth/next-js';
import { getBetterAuth } from '@/lib/auth';

export const { GET, POST } = toNextJsHandler(getBetterAuth);
