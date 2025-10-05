import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { env } from '@/lib/env';

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

function resolveCanonicalOrigin(request: NextRequest) {
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
  const supabase = createRouteHandlerClient({ cookies });

  let payload: { email?: string };
  try {
    payload = await request.json();
  } catch (error) {
    console.error('Invalid JSON payload in magic link request', error);
    return NextResponse.json({ error: { message: 'Invalid request body' } }, { status: 400 });
  }

  const email = payload.email?.trim();
  if (!email) {
    return NextResponse.json({ error: { message: 'Email is required' } }, { status: 400 });
  }

  const origin = resolveCanonicalOrigin(request);
  const callbackUrl = new URL('/auth/callback', origin).toString();

  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: {
      emailRedirectTo: callbackUrl,
    },
  });

  if (error) {
    console.error('Error sending magic link', error);
    return NextResponse.json({ error: { message: error.message } }, { status: 400 });
  }

  return NextResponse.json({ success: true });
}
