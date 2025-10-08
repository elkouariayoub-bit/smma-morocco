import type { BetterAuthProvider } from './index';

export type GoogleProviderOptions = {
  clientId?: string;
  clientSecret?: string;
};

export function google({ clientId, clientSecret }: GoogleProviderOptions): BetterAuthProvider {
  if (!clientId || !clientSecret) {
    throw new Error('Google OAuth credentials are not configured.');
  }

  return {
    id: 'google',
    clientId,
    clientSecret,
  };
}
