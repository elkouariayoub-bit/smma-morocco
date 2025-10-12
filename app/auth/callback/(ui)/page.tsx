'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';

export default function AuthCallbackPage() {
  const router = useRouter();

  useEffect(() => {
    const finishSignIn = async () => {
      try {
        const currentUrl = new URL(window.location.href);
        const code = currentUrl.searchParams.get('code');

        if (code) {
          const response = await fetch('/api/auth/callback', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ code }),
          });

          if (!response.ok) {
            const errorPayload = (await response.json().catch(() => ({}))) as { error?: string };
            const message = typeof errorPayload.error === 'string' ? errorPayload.error : 'Sign-in failed';
            console.error('Error exchanging auth code for session:', message);
            router.replace('/login?message=' + encodeURIComponent(message));
            return;
          }

          router.replace('/composer');
          return;
        }

        // Supabase magic links include the access_token and refresh_token in the
        // URL fragment (window.location.hash). We'll parse the fragment and call
        // supabase.auth.setSession() to persist the session client-side.
        const hash = currentUrl.hash.replace(/^#/, '');
        const params = new URLSearchParams(hash);
        const access_token = params.get('access_token');
        const refresh_token = params.get('refresh_token');

        if (!access_token || !refresh_token) {
          // Nothing to do — redirect back to login with message
          router.replace('/login?message=' + encodeURIComponent('No auth token in URL'));
          return;
        }

        const { error } = await supabase.auth.setSession({ access_token, refresh_token });
        if (error) {
          console.error('Error setting session after magic link:', error);
          router.replace('/login?message=' + encodeURIComponent(error.message || 'Sign-in failed'));
          return;
        }

        // Success — navigate into the app
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
