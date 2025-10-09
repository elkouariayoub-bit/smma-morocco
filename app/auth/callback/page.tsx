'use client';

import { Suspense, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { supabase } from '@/lib/supabase';

export default function AuthCallbackPage() {
  return (
    <Suspense fallback={<CallbackMessage message="Finishing sign-in…" />}>
      <AuthCallbackHandler />
    </Suspense>
  );
}

function AuthCallbackHandler() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const finishSignIn = async () => {
      try {
        const error = searchParams.get('error');
        const errorDescription = searchParams.get('error_description');
        if (error) {
          router.replace(
            '/login?message=' + encodeURIComponent(errorDescription || 'Sign-in failed'),
          );
          return;
        }

        const next = searchParams.get('next');
        const redirectTo = next && next.startsWith('/') ? next : '/composer';
        const code = searchParams.get('code');

        if (code) {
          const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);
          if (exchangeError) {
            console.error('Error exchanging auth code:', exchangeError);
            router.replace(
              '/login?message=' + encodeURIComponent(exchangeError.message || 'Sign-in failed'),
            );
            return;
          }

          router.replace(redirectTo);
          return;
        }

        // Supabase magic links include the access_token and refresh_token in the
        // URL fragment (window.location.hash). We'll parse the fragment and call
        // supabase.auth.setSession() to persist the session client-side.
        const hash = window.location.hash.replace(/^#/, '');
        const params = new URLSearchParams(hash);
        const access_token = params.get('access_token');
        const refresh_token = params.get('refresh_token');

        if (!access_token || !refresh_token) {
          // Nothing to do — redirect back to login with message
          router.replace('/login?message=' + encodeURIComponent('No auth token in URL'));
          return;
        }

        const { data, error: sessionError } = await supabase.auth.setSession({
          access_token,
          refresh_token,
        });
        if (sessionError) {
          console.error('Error setting session after magic link:', sessionError);
          router.replace(
            '/login?message=' + encodeURIComponent(sessionError.message || 'Sign-in failed'),
          );
          return;
        }

        // Success — navigate into the app
        router.replace(redirectTo);
      } catch (err) {
        console.error('Unexpected error during auth callback', err);
        router.replace('/login?message=' + encodeURIComponent('Unexpected auth error'));
      }
    };

    finishSignIn();
  }, [router, searchParams]);

  return <CallbackMessage message="Finishing sign-in…" />;
}

function CallbackMessage({ message }: { message: string }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <p className="text-gray-600">{message}</p>
    </div>
  );
}
