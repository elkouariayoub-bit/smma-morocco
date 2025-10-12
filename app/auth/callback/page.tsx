'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getOptionalSupabaseBrowserClient } from '@/lib/supabase';

const getSafeNext = (value: string | null) => {
  if (!value || !value.startsWith('/') || value.startsWith('//')) {
    return null;
  }

  try {
    const url = new URL(value, 'https://example.com');
    return url.pathname + url.search;
  } catch (error) {
    console.warn('Invalid next parameter provided to auth callback:', value, error);
    return null;
  }
};

const withLoginMessage = (message: string, next?: string | null) => {
  const url = new URL('/auth/login', window.location.origin);
  url.searchParams.set('message', message);
  if (next) {
    url.searchParams.set('next', next);
  }
  return url.toString();
};

export default function AuthCallbackPage() {
  const router = useRouter();
  const supabase = getOptionalSupabaseBrowserClient();
  useEffect(() => {
    const finishSignIn = async () => {
      if (!supabase) {
        router.replace(withLoginMessage('Authentication is not configured. Please contact support.'));
        return;
      }

      try {
        const searchParams = new URLSearchParams(window.location.search);
        const error = searchParams.get('error');
        const nextParam = getSafeNext(searchParams.get('next'));
        if (error) {
          const description =
            searchParams.get('error_description') ||
            (error === 'access_denied' ? 'Sign-in link is invalid or has expired' : 'Sign-in failed');
          router.replace(withLoginMessage(description, nextParam));
          return;
        }

        const code = searchParams.get('code');
        const searchType = searchParams.get('type');
        if (code) {
          const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);
          if (exchangeError) {
            console.error('Error exchanging auth code:', exchangeError);
            router.replace(
              withLoginMessage(exchangeError.message || 'Sign-in failed', nextParam)
            );
            return;
          }

          if (searchType === 'recovery') {
            router.replace('/auth/reset');
            return;
          }

          router.replace(nextParam ?? '/dashboard');
          return;
        }

        const hash = window.location.hash.replace(/^#/, '');
        if (!hash) {
          router.replace(withLoginMessage('No auth credentials found', nextParam));
          return;
        }

        const params = new URLSearchParams(hash);
        const access_token = params.get('access_token');
        const refresh_token = params.get('refresh_token');
        const hashType = params.get('type');
        const hashNext = getSafeNext(params.get('next'));
        const redirectTarget = hashNext ?? nextParam;

        if (!access_token || !refresh_token) {
          router.replace(withLoginMessage('No auth token in URL', redirectTarget));
          return;
        }

        const { error: sessionError } = await supabase.auth.setSession({ access_token, refresh_token });
        if (sessionError) {
          console.error('Error setting session after magic link:', sessionError);
          router.replace(
            withLoginMessage(sessionError.message || 'Sign-in failed', redirectTarget)
          );
          return;
        }

        if (hashType === 'recovery') {
          router.replace('/auth/reset');
          return;
        }

        router.replace(redirectTarget ?? '/dashboard');
      } catch (err) {
        console.error('Unexpected error during auth callback', err);
        router.replace(withLoginMessage('Unexpected auth error'));
      }
    };

    finishSignIn();
  }, [router, supabase]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <p className="text-gray-600">Finishing sign-in…</p>
    </div>
  );
}
