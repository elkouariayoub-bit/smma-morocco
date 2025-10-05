import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { loadServerEnv } from '@/lib/load-server-env';
import { getBetterAuth } from '@/lib/better-auth';

import type { EnvValues } from '@/lib/env';

type SupportedProvider = 'google';

type BetterAuthIntent = 'signin' | 'signup' | 'reset' | 'oauth';

type BetterAuthRequest = {
  intent?: BetterAuthIntent;
  email?: string;
  password?: string;
  name?: string;
  redirectTo?: string;
  provider?: SupportedProvider;
};

const normalizeEmail = (email: string) => email.trim().toLowerCase();

const normalizeOrigin = (value: string | null | undefined) => {
  if (!value) return null;

  try {
    const url = new URL(value);
    return url.origin;
  } catch (error) {
    console.warn('Invalid origin provided for Better Auth redirect:', value, error);
    return null;
  }
};

const getBaseOrigin = (env: EnvValues, request: Request) =>
  normalizeOrigin(env.betterAuthUrl) || normalizeOrigin(env.siteUrl) || new URL(request.url).origin;

const getRedirectTarget = (
  env: EnvValues,
  redirectTo: string | undefined,
  request: Request,
  options?: { provider?: SupportedProvider }
) => {
  if (redirectTo) {
    return redirectTo;
  }

  const baseOrigin = getBaseOrigin(env, request);
  const path = options?.provider === 'google' ? '/api/auth/callback/google' : '/auth/callback';
  return `${baseOrigin}${path}`;
};

const invalidRequest = (message: string, status = 400) =>
  NextResponse.json({ error: message }, { status });

export async function GET() {
  try {
    loadServerEnv();
    const { env } = await import('@/lib/env');
    const auth = await getBetterAuth();
    const providers = Object.keys(auth.providers);

    return NextResponse.json({
      success: true,
      providers,
      env: {
        googleClientId: Boolean(env.googleClientId),
        googleClientSecret: Boolean(env.googleClientSecret),
        betterAuthSecret: Boolean(env.betterAuthSecret),
        betterAuthUrl: env.betterAuthUrl ?? null,
      },
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Unable to initialize Better Auth.';

    console.error('[better-auth] Failed to resolve configuration', error);
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  let payload: BetterAuthRequest;

  try {
    payload = (await request.json()) as BetterAuthRequest;
  } catch (error) {
    return invalidRequest('Invalid request payload.');
  }

  const { intent, email, password, name, redirectTo, provider } = payload;

  if (!intent) {
    return invalidRequest('Missing intent.');
  }

  loadServerEnv();
  const { env } = await import('@/lib/env');
  const supabase = createRouteHandlerClient({ cookies });

  switch (intent) {
    case 'reset': {
      if (!email?.trim()) {
        return invalidRequest('Email is required.');
      }

      const { error } = await supabase.auth.resetPasswordForEmail(normalizeEmail(email), {
        redirectTo: getRedirectTarget(env, redirectTo, request),
      });

      if (error) {
        return invalidRequest(error.message, 400);
      }

      return NextResponse.json({ success: true, message: 'Password reset email sent. Check your inbox!' });
    }

    case 'signin': {
      if (!email?.trim() || !password?.trim()) {
        return invalidRequest('Email and password are required.');
      }

      const { error } = await supabase.auth.signInWithPassword({
        email: normalizeEmail(email),
        password,
      });

      if (error) {
        return invalidRequest(error.message, 401);
      }

      return NextResponse.json({ success: true, message: 'Successfully signed in.', redirect: '/composer' });
    }

    case 'signup': {
      if (!name?.trim()) {
        return invalidRequest('Name is required.');
      }

      if (!email?.trim() || !password?.trim()) {
        return invalidRequest('Email and password are required.');
      }

      const cleanedName = name.trim();
      const normalizedEmail = normalizeEmail(email);
      const emailRedirectTo = getRedirectTarget(env, redirectTo, request);

      const { data, error } = await supabase.auth.signUp({
        email: normalizedEmail,
        password,
        options: {
          emailRedirectTo,
          data: { full_name: cleanedName },
        },
      });

      if (error) {
        return invalidRequest(error.message, 400);
      }

      const requiresConfirmation = !data.session;

      return NextResponse.json({
        success: true,
        message: requiresConfirmation
          ? 'Account created! Check your email to confirm your address.'
          : 'Account created successfully.',
        requiresConfirmation,
        redirect: requiresConfirmation ? undefined : '/composer',
      });
    }

    case 'oauth': {
      if (!provider) {
        return invalidRequest('Provider is required.');
      }

      if (provider !== 'google') {
        return invalidRequest('Unsupported OAuth provider.');
      }

      let auth;
      try {
        auth = await getBetterAuth();
      } catch (error) {
        const message =
          error instanceof Error ? error.message : 'Google OAuth is not configured. Please try again later.';
        return invalidRequest(message, 500);
      }

      if (!auth.providers.google) {
        return invalidRequest('Google OAuth is not available right now.');
      }

      const redirectTarget = getRedirectTarget(env, redirectTo, request, { provider });
      console.info('[better-auth] Starting OAuth flow', {
        provider,
        redirectTarget,
        configuredProviders: Object.keys(auth.providers),
      });

      const { data, error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: redirectTarget,
          skipBrowserRedirect: true,
        },
      });

      if (error) {
        console.error('[better-auth] OAuth error', error);
        return invalidRequest(error.message || 'Google sign-in failed.');
      }

      return NextResponse.json({
        success: true,
        provider,
        url: data.url,
      });
    }

    default:
      return invalidRequest(`Unsupported intent: ${intent}`);
  }
}
