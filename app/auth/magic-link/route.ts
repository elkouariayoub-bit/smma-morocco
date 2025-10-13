import { NextRequest, NextResponse } from 'next/server';
import { loadServerEnv } from '@/lib/load-server-env';
import { applySupabaseCookies, createClient } from '@/lib/supabase';

import type { EnvValues } from '@/lib/env';

const LOCAL_HOSTNAMES = new Set(['localhost', '127.0.0.1', '::1']);

function isLocalHostname(hostname: string) {
  if (!hostname) return false;
  if (LOCAL_HOSTNAMES.has(hostname)) return true;
  return hostname.endsWith('.localhost');
}

function parseUrl(value: string | undefined) {
  if (!value) return null;
  try {
    return new URL(value);
  } catch (error) {
    console.error('Invalid site URL configuration:', value, error);
    return null;
  }
}

function normalizeNextPath(value: unknown) {
  if (typeof value !== 'string' || !value.startsWith('/') || value.startsWith('//')) {
    return undefined;
  }

  try {
    const url = new URL(value, 'https://example.com');
    return url.pathname + url.search;
  } catch (error) {
    console.warn('Invalid next parameter supplied to magic link endpoint:', value, error);
    return undefined;
  }
}

function resolveCanonicalOrigin(env: EnvValues, request: NextRequest) {
  const configured = parseUrl(env.siteUrl || undefined);
  const forwardedHost = request.headers.get('x-forwarded-host') || request.headers.get('host');
  const forwardedProto = request.headers.get('x-forwarded-proto');

  if (configured) {
    if (!forwardedHost) {
      return configured.origin;
    }

    const isConfiguredLocal = isLocalHostname(configured.hostname);
    const isRequestLocal = isLocalHostname(forwardedHost);

    if (!isConfiguredLocal || isRequestLocal) {
      return configured.origin;
    }
  }

  if (forwardedHost) {
    const protocol = forwardedProto || (isLocalHostname(forwardedHost) ? 'http' : 'https');
    return `${protocol}://${forwardedHost}`;
  }

  // Fallback to the configured URL even if invalid/localhost to avoid returning undefined.
  if (configured) {
    return configured.origin;
  }

  return 'http://localhost:3000';
}

export async function POST(request: NextRequest) {
  loadServerEnv();
  const { env } = await import('@/lib/env');
  const supabaseResponse = NextResponse.next();
  const supabase = createClient({ request, response: supabaseResponse });

  let payload: { email?: string; next?: string };
  try {
    payload = await request.json();
  } catch (error) {
    console.error('Invalid JSON payload in magic link request', error);
    const response = NextResponse.json({ error: { message: 'Invalid request body' } }, { status: 400 });
    applySupabaseCookies(supabaseResponse, response);
    return response;
  }

  const email = payload.email?.trim();
  if (!email) {
    const response = NextResponse.json({ error: { message: 'Email is required' } }, { status: 400 });
    applySupabaseCookies(supabaseResponse, response);
    return response;
  }

  const origin = resolveCanonicalOrigin(env, request);
  const nextPath = normalizeNextPath(payload.next);
  const callbackUrl = new URL('/api/auth/callback', origin);
  if (nextPath) {
    callbackUrl.searchParams.set('next', nextPath);
  }

  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: {
      emailRedirectTo: callbackUrl.toString(),
    },
  });

  if (error) {
    console.error('Error sending magic link', error);
    const response = NextResponse.json({ error: { message: error.message } }, { status: 400 });
    applySupabaseCookies(supabaseResponse, response);
    return response;
  }

  const response = NextResponse.json({ success: true });
  applySupabaseCookies(supabaseResponse, response);
  return response;
}
