import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import type { Provider } from '@supabase/supabase-js';
import { env } from '@/lib/env';

type BetterAuthIntent = 'signin' | 'signup' | 'reset' | 'oauth';

type BetterAuthRequest = {
  intent?: BetterAuthIntent;
  email?: string;
  password?: string;
  name?: string;
  redirectTo?: string;
  provider?: Provider;
};

const normalizeEmail = (email: string) => email.trim().toLowerCase();

const getRedirectTarget = (redirectTo: string | undefined, request: Request) => {
  if (redirectTo) {
    return redirectTo;
  }

  const configured = env.siteUrl?.replace(/\/$/, '');
  if (configured) {
    return `${configured}/auth/callback`;
  }

  const url = new URL(request.url);
  return `${url.origin}/auth/callback`;
};

const invalidRequest = (message: string, status = 400) =>
  NextResponse.json({ error: message }, { status });

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

  const supabase = createRouteHandlerClient({ cookies });

  switch (intent) {
    case 'reset': {
      if (!email?.trim()) {
        return invalidRequest('Email is required.');
      }

      const { error } = await supabase.auth.resetPasswordForEmail(normalizeEmail(email), {
        redirectTo: getRedirectTarget(redirectTo, request),
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
      const emailRedirectTo = getRedirectTarget(redirectTo, request);

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

      const { data, error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: getRedirectTarget(redirectTo, request),
          skipBrowserRedirect: true,
        },
      });

      if (error) {
        return invalidRequest(error.message, 400);
      }

      if (!data.url) {
        return invalidRequest('Unable to start OAuth flow.', 500);
      }

      return NextResponse.json({ success: true, redirect: data.url });
    }

    default:
      return invalidRequest('Unsupported intent.');
  }
}
