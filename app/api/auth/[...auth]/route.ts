import { toNextJsHandler } from 'better-auth/next-js';

import {
  BetterAuthUnavailableError,
  getBetterAuth,
  getBetterAuthStatus,
} from '@/lib/auth';

async function resolveBetterAuthInstance() {
  const auth = await getBetterAuth();

  if (auth) {
    return auth;
  }

  const status = await getBetterAuthStatus();
  const includeMissing = process.env.NODE_ENV !== 'production' && status.missing.length;
  const messageParts = ['Better Auth is not configured.'];

  if (includeMissing) {
    messageParts.push(`Missing: ${status.missing.join(', ')}`);
  }

  const message = messageParts.join(' ');

  throw new BetterAuthUnavailableError(message);
}

export const { GET, POST } = toNextJsHandler(resolveBetterAuthInstance);
