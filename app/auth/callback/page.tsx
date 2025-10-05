'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';

export default function AuthCallbackPage() {
  const router = useRouter();
  useEffect(() => {
    const finishSignIn = async () => {
      try {
        const searchParams = new URLSearchParams(window.location.search);
        const error = searchParams.get('error');
        if (error) {
          const description =
            searchParams.get('error_description') ||
            (error === 'access_denied' ? 'Sign-in link is invalid or has expired' : 'Sign-in failed');
          router.replace('/login?message=' + encodeURIComponent(description));
          return;
        }

        const code = searchParams.get('code');
        if (code) {
          const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);
          if (exchangeError) {
            console.error('Error exchanging auth code:', exchangeError);
            router.replace('/login?message=' + encodeURIComponent(exchangeError.message || 'Sign-in failed'));
            return;
          }

          router.replace('/composer');
          return;
        }

        const hash = window.location.hash.replace(/^#/, '');
        if (!hash) {
          router.replace('/login?message=' + encodeURIComponent('No auth credentials found'));
          return;
        }

        const params = new URLSearchParams(hash);
        const access_token = params.get('access_token');
        const refresh_token = params.get('refresh_token');

        if (!access_token || !refresh_token) {
          router.replace('/login?message=' + encodeURIComponent('No auth token in URL'));
          return;
        }

        const { error: sessionError } = await supabase.auth.setSession({ access_token, refresh_token });
        if (sessionError) {
          console.error('Error setting session after magic link:', sessionError);
          router.replace('/login?message=' + encodeURIComponent(sessionError.message || 'Sign-in failed'));
          return;
        }

        router.replace('/composer');
      } catch (err) {
        console.error('Unexpected error during auth callback', err);
        router.replace('/login?message=' + encodeURIComponent('Unexpected auth error'));
      }
    };

    finishSignIn();
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <p className="text-gray-600">Finishing sign-in…</p>
    </div>
  );
}
