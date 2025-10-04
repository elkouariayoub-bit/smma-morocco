'use client';

import { useState } from 'react';
import type { SupabaseClient } from '@supabase/supabase-js';

type AuthView = 'sign_in' | 'sign_up' | 'magic_link';

type AuthProps = {
  supabaseClient: SupabaseClient;
  providers?: string[];
  appearance?: {
    theme?: unknown;
  };
  redirectTo?: string;
};

const providerLabels: Record<string, string> = {
  google: 'Continue with Google',
  github: 'Continue with GitHub',
};

export function Auth({ supabaseClient, providers = [], redirectTo }: AuthProps) {
  const [view, setView] = useState<AuthView>('sign_in');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const resetStatus = () => {
    setMessage(null);
    setError(null);
  };

  const handlePasswordSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    resetStatus();
    setIsSubmitting(true);

    try {
      if (view === 'sign_in') {
        const { error: signInError } = await supabaseClient.auth.signInWithPassword({
          email,
          password,
        });

        if (signInError) throw signInError;
        setMessage('Signed in successfully.');
      } else {
        const { error: signUpError } = await supabaseClient.auth.signUp({
          email,
          password,
          options: redirectTo
            ? {
                emailRedirectTo: redirectTo,
              }
            : undefined,
        });

        if (signUpError) throw signUpError;
        setMessage('Check your email to confirm your account.');
      }
    } catch (err) {
      console.error('Supabase auth password flow failed', err);
      const description = err instanceof Error ? err.message : 'Unable to authenticate with email and password';
      setError(description);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleMagicLinkSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    resetStatus();
    setIsSubmitting(true);

    try {
      const { error: linkError } = await supabaseClient.auth.signInWithOtp({
        email,
        options: redirectTo
          ? {
              emailRedirectTo: redirectTo,
            }
          : undefined,
      });

      if (linkError) throw linkError;
      setMessage('Magic link sent. Check your inbox to continue.');
    } catch (err) {
      console.error('Supabase auth magic link flow failed', err);
      const description = err instanceof Error ? err.message : 'Unable to send magic link';
      setError(description);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleProvider = async (provider: string) => {
    resetStatus();
    setIsSubmitting(true);

    try {
      const { error: providerError } = await supabaseClient.auth.signInWithOAuth({
        provider: provider as any,
        options: redirectTo ? { redirectTo } : undefined,
      });

      if (providerError) throw providerError;
    } catch (err) {
      console.error('Supabase OAuth sign-in failed', err);
      const description = err instanceof Error ? err.message : 'Unable to sign in with provider';
      setError(description);
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex space-x-3 text-sm font-medium">
        <button
          type="button"
          className={`rounded-md px-3 py-2 transition-colors ${
            view === 'sign_in'
              ? 'bg-slate-900 text-white'
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          }`}
          onClick={() => {
            resetStatus();
            setView('sign_in');
          }}
        >
          Sign in
        </button>
        <button
          type="button"
          className={`rounded-md px-3 py-2 transition-colors ${
            view === 'sign_up'
              ? 'bg-slate-900 text-white'
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          }`}
          onClick={() => {
            resetStatus();
            setView('sign_up');
          }}
        >
          Create account
        </button>
        <button
          type="button"
          className={`rounded-md px-3 py-2 transition-colors ${
            view === 'magic_link'
              ? 'bg-slate-900 text-white'
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          }`}
          onClick={() => {
            resetStatus();
            setView('magic_link');
          }}
        >
          Magic link
        </button>
      </div>

      {providers.length > 0 && (
        <div className="space-y-3">
          {providers.map((provider) => (
            <button
              key={provider}
              type="button"
              onClick={() => handleProvider(provider)}
              className="flex w-full items-center justify-center gap-3 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50"
              disabled={isSubmitting}
            >
              {providerLabels[provider] ?? `Continue with ${provider}`}
            </button>
          ))}
        </div>
      )}

      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        {view === 'magic_link' ? (
          <form onSubmit={handleMagicLinkSubmit} className="space-y-4">
            <div>
              <label htmlFor="magic-email" className="text-sm font-medium text-slate-700">
                Email address
              </label>
              <input
                id="magic-email"
                type="email"
                required
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                className="mt-2 w-full rounded-lg border border-slate-200 px-3 py-2 text-base text-slate-900 focus:border-slate-900 focus:outline-none"
                placeholder="you@example.com"
              />
            </div>
            <button
              type="submit"
              className="w-full rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Sending…' : 'Send magic link'}
            </button>
          </form>
        ) : (
          <form onSubmit={handlePasswordSubmit} className="space-y-4">
            <div>
              <label htmlFor="auth-email" className="text-sm font-medium text-slate-700">
                Email address
              </label>
              <input
                id="auth-email"
                type="email"
                required
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                className="mt-2 w-full rounded-lg border border-slate-200 px-3 py-2 text-base text-slate-900 focus:border-slate-900 focus:outline-none"
                placeholder="you@example.com"
              />
            </div>
            <div>
              <label htmlFor="auth-password" className="text-sm font-medium text-slate-700">
                Password
              </label>
              <input
                id="auth-password"
                type="password"
                required
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                className="mt-2 w-full rounded-lg border border-slate-200 px-3 py-2 text-base text-slate-900 focus:border-slate-900 focus:outline-none"
                placeholder="Your password"
              />
            </div>
            <button
              type="submit"
              className="w-full rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Submitting…' : view === 'sign_in' ? 'Sign in' : 'Create account'}
            </button>
          </form>
        )}

        {(message || error) && (
          <p
            className={`mt-4 text-sm ${message ? 'text-emerald-600' : 'text-red-600'}`}
            role={message ? 'status' : 'alert'}
          >
            {message ?? error}
          </p>
        )}
      </div>
    </div>
  );
}

export default Auth;
