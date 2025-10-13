export {
  getBetterAuth,
  getBetterAuthStatus,
  resetBetterAuthCache,
  BetterAuthUnavailableError,
} from './better-auth';
export type { BetterAuthStatus } from './better-auth';
export type { BetterAuthInstance } from 'better-auth';

const SAFE_NEXT_PATTERN = /^\/(?!\/)/;

export type AuthRedirect = string | null;

export function sanitizeRedirectPath(next?: string | null): AuthRedirect {
  if (!next) return null;
  if (!SAFE_NEXT_PATTERN.test(next)) return null;

  try {
    const url = new URL(next, 'https://example.com');
    return url.pathname + url.search;
  } catch (error) {
    if (process.env.NODE_ENV !== 'production') {
      console.warn('Invalid redirect path received for auth flow:', next, error);
    }
    return null;
  }
}

export type AuthEventName = 'login_attempt' | 'login_success' | 'google_auth_initiated';

export function trackAuthEvent(event: AuthEventName, payload: { method: string }) {
  if (process.env.NODE_ENV !== 'production') {
    console.info(`[analytics] ${event}`, payload);
  }

  if (typeof window === 'undefined') {
    return;
  }

  const detail = { event, method: payload.method, timestamp: Date.now() };

  try {
    window.dispatchEvent(new CustomEvent('auth:analytics', { detail }));
  } catch (error) {
    if (process.env.NODE_ENV !== 'production') {
      console.warn('Failed to dispatch analytics event', error);
    }
  }

  const dataLayer = (window as typeof window & { dataLayer?: Array<Record<string, unknown>> }).dataLayer;
  if (Array.isArray(dataLayer)) {
    dataLayer.push({ ...detail });
  }
}
