'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import type { Provider } from '@supabase/supabase-js';
import { LogOut } from 'lucide-react';

type AuthComponentProps = {
  redirectTo?: string;
};

type AuthState = {
  email: string;
  password: string;
  confirmPassword?: string;
  message: string | null;
  error: string | null;
  isLoading: boolean;
};

const initialState: AuthState = {
  email: '',
  password: '',
  confirmPassword: undefined,
  message: null,
  error: null,
  isLoading: false,
};

function useRedirect(redirectTo?: string) {
  return useMemo(() => {
    if (redirectTo) return redirectTo;

    if (typeof window !== 'undefined') {
      return `${window.location.origin}/auth/callback`;
    }

    return undefined;
  }, [redirectTo]);
}

function OAuthButtons({ onOAuth, isLoading }: { onOAuth: (provider: Provider) => Promise<void>; isLoading: boolean }) {
  return (
    <div className="grid gap-3">
      <Button
        type="button"
        variant="secondary"
        className="w-full border border-gray-200 bg-white text-gray-700 hover:bg-gray-50"
        onClick={() => onOAuth('google')}
        disabled={isLoading}
      >
        Continue with Google
      </Button>
      <Button
        type="button"
        variant="secondary"
        className="w-full border border-gray-200 bg-white text-gray-700 hover:bg-gray-50"
        onClick={() => onOAuth('github')}
        disabled={isLoading}
      >
        Continue with GitHub
      </Button>
    </div>
  );
}

export function SignIn({ redirectTo }: AuthComponentProps) {
  const router = useRouter();
  const [state, setState] = useState<AuthState>(initialState);
  const [isResetting, setIsResetting] = useState(false);
  const canonicalRedirect = useRedirect(redirectTo);

  const updateState = (patch: Partial<AuthState>) =>
    setState((prev) => ({ ...prev, ...patch }));

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    updateState({ isLoading: true, error: null, message: null });

    const { email, password } = state;
    if (!email || !password) {
      updateState({ error: 'Please provide both email and password.', isLoading: false });
      return;
    }

    const { error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      updateState({ error: error.message, isLoading: false });
      return;
    }

    updateState({ message: 'Successfully signed in. Redirecting…', isLoading: false });
    router.replace('/composer');
  };

  const handleForgotPassword = async () => {
    if (!state.email) {
      updateState({ error: 'Enter your email first so we know where to send the reset link.' });
      return;
    }

    updateState({ isLoading: true, error: null, message: null });

    const { error } = await supabase.auth.resetPasswordForEmail(state.email, {
      redirectTo: canonicalRedirect,
    });

    if (error) {
      updateState({ error: error.message, isLoading: false });
      return;
    }

    updateState({ message: 'Password reset email sent. Check your inbox!', isLoading: false });
    setIsResetting(false);
  };

  const handleOAuth = useCallback(
    async (provider: Provider) => {
      updateState({ isLoading: true, error: null, message: null });
      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: canonicalRedirect ? { redirectTo: canonicalRedirect } : undefined,
      });

      if (error) {
        updateState({ error: error.message, isLoading: false });
        return;
      }

      updateState({ message: 'Redirecting to provider…' });
    },
    [canonicalRedirect]
  );

  return (
    <div className="space-y-6">
      <div className="text-left">
        <h2 className="text-xl font-semibold text-gray-900">Welcome back</h2>
        <p className="mt-1 text-sm text-gray-500">Sign in with your credentials or a connected provider.</p>
      </div>

      <OAuthButtons onOAuth={handleOAuth} isLoading={state.isLoading} />

      <div className="relative">
        <div className="absolute inset-0 flex items-center" aria-hidden="true">
          <span className="w-full border-t border-gray-200" />
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="bg-white px-2 text-gray-500">Or continue with email</span>
        </div>
      </div>

      <form className="space-y-4" onSubmit={handleSubmit}>
        <div className="space-y-2">
          <label htmlFor="signin-email" className="text-sm font-medium text-gray-700">
            Email address
          </label>
          <Input
            id="signin-email"
            type="email"
            autoComplete="email"
            value={state.email}
            onChange={(event) => updateState({ email: event.target.value })}
            placeholder="you@example.com"
            required
          />
        </div>
        {!isResetting && (
          <div className="space-y-2">
            <label htmlFor="signin-password" className="text-sm font-medium text-gray-700">
              Password
            </label>
            <Input
              id="signin-password"
              type="password"
              autoComplete="current-password"
              value={state.password}
              onChange={(event) => updateState({ password: event.target.value })}
              placeholder="••••••••"
              required
            />
          </div>
        )}
        <div className="flex items-center justify-between text-sm">
          <label className="flex items-center gap-2 text-gray-500">
            <input
              type="checkbox"
              className="h-4 w-4 rounded border-gray-300 text-gray-900"
              checked={isResetting}
              onChange={(event) => setIsResetting(event.target.checked)}
            />
            Forgot password?
          </label>
          <button
            type={isResetting ? 'button' : 'submit'}
            onClick={isResetting ? handleForgotPassword : undefined}
            className="font-medium text-blue-600 hover:text-blue-500"
            disabled={state.isLoading}
          >
            {isResetting ? 'Send reset link' : 'Sign in'}
          </button>
        </div>
        {!isResetting && (
          <Button type="submit" className="h-11 w-full rounded-xl text-base" disabled={state.isLoading}>
            {state.isLoading ? 'Signing in…' : 'Continue'}
          </Button>
        )}
      </form>

      {(state.error || state.message) && (
        <p className={`text-sm ${state.error ? 'text-red-600' : 'text-emerald-600'}`} role={state.error ? 'alert' : 'status'}>
          {state.error ?? state.message}
        </p>
      )}
    </div>
  );
}

export function SignUp({ redirectTo }: AuthComponentProps) {
  const router = useRouter();
  const [state, setState] = useState<AuthState>({ ...initialState, confirmPassword: '' });
  const canonicalRedirect = useRedirect(redirectTo);

  const updateState = (patch: Partial<AuthState>) =>
    setState((prev) => ({ ...prev, ...patch }));

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    updateState({ isLoading: true, error: null, message: null });

    const { email, password, confirmPassword } = state;
    if (!email || !password) {
      updateState({ error: 'Please provide both email and password.', isLoading: false });
      return;
    }

    if (password !== confirmPassword) {
      updateState({ error: 'Passwords do not match.', isLoading: false });
      return;
    }

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: canonicalRedirect ? { emailRedirectTo: canonicalRedirect } : undefined,
    });

    if (error) {
      updateState({ error: error.message, isLoading: false });
      return;
    }

    updateState({
      message: 'Account created! Check your inbox to confirm your email.',
      isLoading: false,
    });
    router.replace('/composer');
  };

  const handleOAuth = useCallback(
    async (provider: Provider) => {
      updateState({ isLoading: true, error: null, message: null });
      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: canonicalRedirect ? { redirectTo: canonicalRedirect } : undefined,
      });

      if (error) {
        updateState({ error: error.message, isLoading: false });
        return;
      }

      updateState({ message: 'Redirecting to provider…' });
    },
    [canonicalRedirect]
  );

  return (
    <div className="space-y-6">
      <div className="text-left">
        <h2 className="text-xl font-semibold text-gray-900">Create an account</h2>
        <p className="mt-1 text-sm text-gray-500">Join SMMA Morocco with email or your favorite provider.</p>
      </div>

      <OAuthButtons onOAuth={handleOAuth} isLoading={state.isLoading} />

      <div className="relative">
        <div className="absolute inset-0 flex items-center" aria-hidden="true">
          <span className="w-full border-t border-gray-200" />
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="bg-white px-2 text-gray-500">Or sign up with email</span>
        </div>
      </div>

      <form className="space-y-4" onSubmit={handleSubmit}>
        <div className="space-y-2">
          <label htmlFor="signup-email" className="text-sm font-medium text-gray-700">
            Email address
          </label>
          <Input
            id="signup-email"
            type="email"
            autoComplete="email"
            value={state.email}
            onChange={(event) => updateState({ email: event.target.value })}
            placeholder="you@example.com"
            required
          />
        </div>
        <div className="space-y-2">
          <label htmlFor="signup-password" className="text-sm font-medium text-gray-700">
            Password
          </label>
          <Input
            id="signup-password"
            type="password"
            autoComplete="new-password"
            value={state.password}
            onChange={(event) => updateState({ password: event.target.value })}
            placeholder="Create a secure password"
            required
          />
        </div>
        <div className="space-y-2">
          <label htmlFor="signup-confirm" className="text-sm font-medium text-gray-700">
            Confirm password
          </label>
          <Input
            id="signup-confirm"
            type="password"
            autoComplete="new-password"
            value={state.confirmPassword ?? ''}
            onChange={(event) => updateState({ confirmPassword: event.target.value })}
            placeholder="Re-enter your password"
            required
          />
        </div>
        <Button type="submit" className="h-11 w-full rounded-xl text-base" disabled={state.isLoading}>
          {state.isLoading ? 'Creating account…' : 'Create account'}
        </Button>
      </form>

      {(state.error || state.message) && (
        <p className={`text-sm ${state.error ? 'text-red-600' : 'text-emerald-600'}`} role={state.error ? 'alert' : 'status'}>
          {state.error ?? state.message}
        </p>
      )}
    </div>
  );
}

type UserButtonProps = {
  onSignOut?: () => Promise<void> | void;
  hasCodeSession?: boolean;
};

export function UserButton({ onSignOut, hasCodeSession = false }: UserButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isSigningOut, setIsSigningOut] = useState(false);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [initials, setInitials] = useState('A');

  useEffect(() => {
    const loadUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      const email = user?.email ?? (hasCodeSession ? 'access@smma-morocco.com' : null);
      setUserEmail(email);
      setInitials(email ? email[0].toUpperCase() : 'A');
    };

    loadUser();

    const { data } = supabase.auth.onAuthStateChange((_event, session) => {
      const email = session?.user?.email ?? (hasCodeSession ? 'access@smma-morocco.com' : null);
      setUserEmail(email);
      setInitials(email ? email[0].toUpperCase() : 'A');
    });

    return () => {
      data?.subscription.unsubscribe();
    };
  }, [hasCodeSession]);

  const handleToggle = () => setIsOpen((prev) => !prev);

  const handleSignOut = async () => {
    setIsSigningOut(true);
    await (onSignOut ? onSignOut() : supabase.auth.signOut());
    setIsSigningOut(false);
    setIsOpen(false);
  };

  const label = userEmail ?? 'Access code user';

  return (
    <div className="relative">
      <button
        type="button"
        onClick={handleToggle}
        className="flex w-full items-center gap-3 rounded-lg px-3 py-2 transition hover:bg-gray-100"
      >
        <span className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-900 text-sm font-semibold text-white">
          {initials}
        </span>
        <span className="flex-1 text-left">
          <span className="block text-sm font-semibold text-gray-900">{label}</span>
          <span className="block text-xs text-gray-500">Account settings</span>
        </span>
      </button>
      {isOpen && (
        <div className="absolute bottom-14 left-0 w-56 rounded-xl border border-gray-200 bg-white shadow-xl">
          <div className="border-b border-gray-200 px-4 py-3">
            <p className="text-sm font-semibold text-gray-900">{label}</p>
            <p className="text-xs text-gray-500">Signed in</p>
          </div>
          <button
            type="button"
            onClick={handleSignOut}
            className="flex w-full items-center gap-2 px-4 py-3 text-sm font-medium text-red-600 hover:bg-red-50"
            disabled={isSigningOut}
          >
            <LogOut className="h-4 w-4" />
            {isSigningOut ? 'Signing out…' : 'Sign out'}
          </button>
        </div>
      )}
    </div>
  );
}
