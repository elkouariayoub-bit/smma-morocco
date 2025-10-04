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

const GoogleIcon = () => (
  <svg className="h-5 w-5" viewBox="0 0 24 24" aria-hidden="true">
    <path
      fill="#EA4335"
      d="M12.24 10.285v3.6h5.028c-.204 1.152-1.356 3.384-5.028 3.384-3.024 0-5.496-2.52-5.496-5.52s2.472-5.52 5.496-5.52c1.728 0 2.88.732 3.528 1.356l2.448-2.448C16.92 3.66 14.76 2.52 12.24 2.52 7.512 2.52 3.6 6.432 3.6 11.16s3.912 8.64 8.64 8.64c4.992 0 8.28-3.492 8.28-8.412 0-.564-.06-.996-.132-1.416H12.24z"
    />
  </svg>
);

const GithubIcon = () => (
  <svg className="h-5 w-5" viewBox="0 0 24 24" aria-hidden="true">
    <path
      fill="currentColor"
      d="M12 .5C5.648.5.5 5.648.5 12c0 5.088 3.292 9.384 7.868 10.908.576.108.788-.252.788-.56 0-.276-.012-1.188-.012-2.16-3.212.588-4.044-.78-4.296-1.5-.132-.336-.708-1.5-1.212-1.8-.408-.216-.996-.744-.012-.756.924-.012 1.584.852 1.8 1.2 1.056 1.776 2.748 1.272 3.42.972.108-.768.408-1.272.744-1.56-2.844-.324-5.82-1.428-5.82-6.348 0-1.404.5-2.556 1.32-3.456-.132-.324-.576-1.668.132-3.468 0 0 1.08-.348 3.528 1.32a12.08 12.08 0 0 1 3.216-.432c1.092 0 2.184.144 3.216.432 2.448-1.68 3.528-1.32 3.528-1.32.708 1.8.264 3.144.132 3.468.828.9 1.32 2.052 1.32 3.456 0 4.932-2.988 6.024-5.832 6.348.42.36.78 1.056.78 2.136 0 1.548-.012 2.796-.012 3.18 0 .312.204.684.792.564C20.216 21.372 23.5 17.088 23.5 12 23.5 5.648 18.352.5 12 .5z"
    />
  </svg>
);

function OAuthButtons({ onOAuth, isLoading }: { onOAuth: (provider: Provider) => Promise<void>; isLoading: boolean }) {
  return (
    <div className="grid gap-3">
      <Button
        type="button"
        variant="outline"
        className="w-full gap-3 text-sm font-semibold"
        onClick={() => onOAuth('google')}
        disabled={isLoading}
      >
        <GoogleIcon />
        Continue with Google
      </Button>
      <Button
        type="button"
        variant="outline"
        className="w-full gap-3 text-sm font-semibold"
        onClick={() => onOAuth('github')}
        disabled={isLoading}
      >
        <GithubIcon />
        Continue with GitHub
      </Button>
    </div>
  );
}

export function SignIn({ redirectTo }: AuthComponentProps) {
  const router = useRouter();
  const [state, setState] = useState<AuthState>(initialState);
  const [mode, setMode] = useState<'signin' | 'reset'>('signin');
  const canonicalRedirect = useRedirect(redirectTo);

  const updateState = (patch: Partial<AuthState>) => setState((prev) => ({ ...prev, ...patch }));

  useEffect(() => {
    setState((prev) => ({ ...prev, error: null, message: null, isLoading: false }));
  }, [mode]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    updateState({ isLoading: true, error: null, message: null });

    const { email, password } = state;

    if (!email) {
      updateState({ error: 'Please provide your email address.', isLoading: false });
      return;
    }

    if (mode === 'reset') {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: canonicalRedirect,
      });

      if (error) {
        updateState({ error: error.message, isLoading: false });
        return;
      }

      updateState({ message: 'Password reset email sent. Check your inbox!', isLoading: false });
      return;
    }

    if (!password) {
      updateState({ error: 'Please enter your password.', isLoading: false });
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
    <div className="space-y-8">
      <OAuthButtons onOAuth={handleOAuth} isLoading={state.isLoading} />

      <div className="relative" aria-hidden="true">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t border-slate-200" />
        </div>
        <div className="relative flex justify-center">
          <span className="bg-white px-3 text-xs font-medium text-slate-500">or continue with email</span>
        </div>
      </div>

      <form className="space-y-4" onSubmit={handleSubmit}>
        <div className="space-y-2">
          <label htmlFor="signin-email" className="text-sm font-medium text-slate-700">
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

        {mode === 'signin' && (
          <div className="space-y-2">
            <label htmlFor="signin-password" className="text-sm font-medium text-slate-700">
              Password
            </label>
            <Input
              id="signin-password"
              type="password"
              autoComplete="current-password"
              value={state.password}
              onChange={(event) => updateState({ password: event.target.value })}
              placeholder="Enter your password"
              required
            />
          </div>
        )}

        <div className="flex items-center justify-between text-sm">
          <button
            type="button"
            onClick={() => setMode(mode === 'signin' ? 'reset' : 'signin')}
            className="font-medium text-blue-600 transition-colors duration-200 hover:text-blue-500"
          >
            {mode === 'signin' ? 'Forgot password?' : 'Back to sign in'}
          </button>
          <span className="text-xs font-medium uppercase tracking-[0.26em] text-slate-400">Secure access</span>
        </div>

        <Button type="submit" disabled={state.isLoading}>
          {state.isLoading ? (mode === 'reset' ? 'Sending reset link…' : 'Signing in…') : mode === 'reset' ? 'Send reset link' : 'Continue'}
        </Button>
      </form>

      {(state.error || state.message) && (
        <p
          className={`text-sm transition-opacity duration-200 ${state.error ? 'text-red-600' : 'text-emerald-600'}`}
          role={state.error ? 'alert' : 'status'}
        >
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
    <div className="space-y-8">
      <div className="space-y-1 text-left">
        <h2 className="text-2xl font-semibold text-slate-900">Create an account</h2>
        <p className="text-sm text-slate-500">Join SMMA Morocco with your email or your favorite provider.</p>
      </div>

      <OAuthButtons onOAuth={handleOAuth} isLoading={state.isLoading} />

      <div className="relative" aria-hidden="true">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t border-slate-200" />
        </div>
        <div className="relative flex justify-center">
          <span className="bg-white px-3 text-xs font-medium text-slate-500">or continue with email</span>
        </div>
      </div>

      <form className="space-y-4" onSubmit={handleSubmit}>
        <div className="space-y-2">
          <label htmlFor="signup-email" className="text-sm font-medium text-slate-700">
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
          <label htmlFor="signup-password" className="text-sm font-medium text-slate-700">
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
          <label htmlFor="signup-confirm" className="text-sm font-medium text-slate-700">
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
        <Button type="submit" disabled={state.isLoading}>
          {state.isLoading ? 'Creating account…' : 'Create account'}
        </Button>
      </form>

      {(state.error || state.message) && (
        <p
          className={`text-sm transition-opacity duration-200 ${state.error ? 'text-red-600' : 'text-emerald-600'}`}
          role={state.error ? 'alert' : 'status'}
        >
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
