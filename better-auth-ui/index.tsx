'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { LogOut } from 'lucide-react';

type AuthComponentProps = {
  redirectTo?: string;
};

type SignInProps = AuthComponentProps & {
  onSwitchToSignUp?: () => void;
};

type SignUpProps = AuthComponentProps & {
  onSwitchToSignIn?: () => void;
};

type AuthState = {
  name?: string;
  email: string;
  password: string;
  confirmPassword?: string;
  message: string | null;
  error: string | null;
  isLoading: boolean;
};

const initialState: AuthState = {
  name: '',
  email: '',
  password: '',
  confirmPassword: undefined,
  message: null,
  error: null,
  isLoading: false,
};

type BetterAuthIntent = 'signin' | 'signup' | 'reset' | 'oauth';

type BetterAuthResponse = {
  success?: boolean;
  message?: string;
  error?: string;
  redirect?: string;
  requiresConfirmation?: boolean;
};

const requestBetterAuth = async (payload: Record<string, unknown>, intent: BetterAuthIntent) => {
  const response = await fetch('/auth/better', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ ...payload, intent }),
  });

  let data: BetterAuthResponse | null = null;

  try {
    data = (await response.json()) as BetterAuthResponse;
  } catch (error) {
    data = null;
  }

  if (!response.ok || !data?.success) {
    const message = data?.error ?? 'Unable to process your request right now. Please try again.';
    throw new Error(message);
  }

  return data;
};

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const validateEmail = (value: string) => {
  if (!value.trim()) {
    return 'Please enter your email address.';
  }

  if (!emailPattern.test(value.trim())) {
    return 'Enter a valid email address.';
  }

  return undefined;
};

const validatePasswordPresence = (value: string) => {
  if (!value.trim()) {
    return 'Please enter your password.';
  }

  return undefined;
};

const validatePasswordStrength = (value: string) => {
  if (!value.trim()) {
    return 'Please create a password.';
  }

  const trimmed = value.trim();
  const hasMinLength = trimmed.length >= 8;
  const hasUppercase = /[A-Z]/.test(trimmed);
  const hasLowercase = /[a-z]/.test(trimmed);
  const hasNumber = /\d/.test(trimmed);

  if (!hasMinLength || !hasUppercase || !hasLowercase || !hasNumber) {
    return 'Password must be at least 8 characters and include upper and lower case letters and a number.';
  }

  return undefined;
};

const validateConfirmPassword = (password: string, confirm: string) => {
  if (!confirm.trim()) {
    return 'Please confirm your password.';
  }

  if (password.trim() && confirm.trim() && password !== confirm) {
    return 'Passwords do not match.';
  }

  return undefined;
};

const validateName = (value?: string) => {
  if (!value?.trim()) {
    return 'Please enter your name.';
  }

  return undefined;
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

type OAuthProvider = 'google';

function OAuthButtons({ onOAuth, isLoading }: { onOAuth: (provider: OAuthProvider) => Promise<void>; isLoading: boolean }) {
  return (
    <div className="grid gap-4">
      <Button
        type="button"
        variant="social"
        className="w-full gap-2"
        onClick={() => onOAuth('google')}
        disabled={isLoading}
      >
        <GoogleIcon />
        Continue with Google
      </Button>
    </div>
  );
}

const LoadingSpinner = ({ className = 'h-4 w-4 border-2' }: { className?: string }) => (
  <span className={`inline-flex ${className} animate-spin rounded-full border-white/60 border-t-white`} aria-hidden="true" />
);

export function SignIn({ redirectTo, onSwitchToSignUp }: SignInProps) {
  const router = useRouter();
  const [state, setState] = useState<AuthState>(initialState);
  const [mode, setMode] = useState<'signin' | 'reset'>('signin');
  const [fieldErrors, setFieldErrors] = useState<{
    email?: string;
    password?: string;
  }>({});
  const canonicalRedirect = useRedirect(redirectTo);
  const emailValidationMessage = validateEmail(state.email);
  const passwordValidationMessage = mode === 'signin' ? validatePasswordPresence(state.password) : undefined;
  const isSubmitDisabled =
    state.isLoading ||
    (mode === 'reset'
      ? Boolean(emailValidationMessage)
      : Boolean(emailValidationMessage) || Boolean(passwordValidationMessage));

  const updateState = (patch: Partial<AuthState>) => setState((prev) => ({ ...prev, ...patch }));

  useEffect(() => {
    setState((prev) => ({ ...prev, error: null, message: null, isLoading: false }));
    setFieldErrors({});
  }, [mode]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    updateState({ isLoading: true, error: null, message: null });
    setFieldErrors({});

    const { email, password } = state;

    const nextFieldErrors: typeof fieldErrors = {};

    const emailError = validateEmail(email);
    if (emailError) {
      nextFieldErrors.email = emailError;
    }

    if (mode === 'signin') {
      const passwordError = validatePasswordPresence(password);
      if (passwordError) {
        nextFieldErrors.password = passwordError;
      }
    }

    if (Object.keys(nextFieldErrors).length > 0) {
      setFieldErrors(nextFieldErrors);
      updateState({ isLoading: false });
      return;
    }

    const normalizedEmail = email.trim();

    try {
      if (mode === 'reset') {
        const result = await requestBetterAuth(
          {
            email: normalizedEmail,
            redirectTo: canonicalRedirect,
          },
          'reset'
        );

        updateState({
          message: result.message ?? 'Password reset email sent. Check your inbox!',
          isLoading: false,
        });
        return;
      }

      const result = await requestBetterAuth(
        {
          email: normalizedEmail,
          password,
          redirectTo: canonicalRedirect,
        },
        'signin'
      );

      updateState({
        message: result.message ?? 'Successfully signed in. Redirecting…',
        isLoading: false,
        password: '',
      });
      router.replace(result.redirect ?? '/composer');
      router.refresh();
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unable to sign in. Please try again.';
      updateState({ error: message, isLoading: false });
    }
  };

  const handleOAuth = useCallback(
    async (provider: OAuthProvider) => {
      updateState({ isLoading: true, error: null, message: null });

      try {
        const result = await requestBetterAuth(
          {
            provider,
            redirectTo: canonicalRedirect,
          },
          'oauth'
        );

        if (result.redirect) {
          updateState({ message: 'Redirecting to provider…' });
          window.location.href = result.redirect;
          return;
        }

        updateState({
          error: 'Unable to redirect to the selected provider. Please try again.',
          isLoading: false,
        });
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Unable to start OAuth flow. Please try again.';
        updateState({ error: message, isLoading: false });
      }
    },
    [canonicalRedirect]
  );

  return (
    <div className="space-y-5">
      <OAuthButtons onOAuth={handleOAuth} isLoading={state.isLoading} />

      <div className="relative" aria-hidden="true">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t border-slate-200" />
        </div>
        <div className="relative flex justify-center">
          <span className="bg-white px-4 text-sm font-medium text-[#6b7280]">or continue with email</span>
        </div>
      </div>

      <form className="space-y-4" onSubmit={handleSubmit} noValidate>
        {mode === 'reset' && (
          <p className="rounded-lg bg-blue-50 px-3 py-2 text-sm text-blue-600">
            Enter your email address and we&apos;ll send you a secure reset link.
          </p>
        )}
        <div className="space-y-2">
          <label htmlFor="signin-email" className="text-sm font-medium text-slate-700">
            Email address
          </label>
          <Input
            id="signin-email"
            type="email"
            autoComplete="email"
            value={state.email}
            onChange={(event) => {
              const value = event.target.value;
              updateState({ email: value });
              setFieldErrors((prev) => ({ ...prev, email: validateEmail(value) }));
            }}
            placeholder="you@example.com"
            aria-invalid={Boolean(fieldErrors.email)}
            aria-describedby={fieldErrors.email ? 'signin-email-error' : undefined}
            required
          />
          {fieldErrors.email && (
            <p id="signin-email-error" className="text-sm text-red-600" role="alert">
              {fieldErrors.email}
            </p>
          )}
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
              onChange={(event) => {
                const value = event.target.value;
                updateState({ password: value });
                setFieldErrors((prev) => ({ ...prev, password: validatePasswordPresence(value) }));
              }}
              placeholder="Enter your password"
              aria-invalid={Boolean(fieldErrors.password)}
              aria-describedby={fieldErrors.password ? 'signin-password-error' : undefined}
              required
            />
            {fieldErrors.password && (
              <p id="signin-password-error" className="text-sm text-red-600" role="alert">
                {fieldErrors.password}
              </p>
            )}
            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => setMode('reset')}
                className="text-sm font-medium text-blue-600 transition-colors duration-200 hover:text-blue-500"
              >
                Forgot password?
              </button>
            </div>
          </div>
        )}

        {mode === 'reset' && (
          <div className="flex justify-between text-sm">
            <button
              type="button"
              onClick={() => setMode('signin')}
              className="font-medium text-blue-600 transition-colors duration-200 hover:text-blue-500"
            >
              Back to sign in
            </button>
            <span className="text-xs font-medium uppercase tracking-[0.26em] text-slate-400">Secure access</span>
          </div>
        )}

        <Button type="submit" disabled={isSubmitDisabled}>
          {state.isLoading ? (
            <span className="flex items-center justify-center gap-2">
              <LoadingSpinner />
              {mode === 'reset' ? 'Sending reset link…' : 'Signing in…'}
            </span>
          ) : mode === 'reset' ? (
            'Send reset link'
          ) : (
            'Sign In'
          )}
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
      <p className="text-center text-sm text-slate-500">
        Don&apos;t have an account?{' '}
        <button
          type="button"
          onClick={onSwitchToSignUp}
          className="font-medium text-blue-600 transition-colors duration-200 hover:text-blue-500"
        >
          Sign up
        </button>
      </p>
    </div>
  );
}

export function SignUp({ redirectTo, onSwitchToSignIn }: SignUpProps) {
  const router = useRouter();
  const [state, setState] = useState<AuthState>({ ...initialState, confirmPassword: '' });
  const [fieldErrors, setFieldErrors] = useState<{
    name?: string;
    email?: string;
    password?: string;
    confirmPassword?: string;
  }>({});
  const canonicalRedirect = useRedirect(redirectTo);
  const nameValidationMessage = validateName(state.name);
  const emailValidationMessage = validateEmail(state.email);
  const passwordValidationMessage = validatePasswordStrength(state.password);
  const confirmValidationMessage = validateConfirmPassword(state.password, state.confirmPassword ?? '');
  const isSubmitDisabled =
    state.isLoading ||
    Boolean(nameValidationMessage) ||
    Boolean(emailValidationMessage) ||
    Boolean(passwordValidationMessage) ||
    Boolean(confirmValidationMessage);

  const updateState = (patch: Partial<AuthState>) =>
    setState((prev) => ({ ...prev, ...patch }));

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    updateState({ isLoading: true, error: null, message: null });
    setFieldErrors({});

    const { name, email, password, confirmPassword } = state;

    const nextFieldErrors: typeof fieldErrors = {};

    const nameError = validateName(name);
    if (nameError) {
      nextFieldErrors.name = nameError;
    }

    const emailError = validateEmail(email);
    if (emailError) {
      nextFieldErrors.email = emailError;
    }

    const passwordError = validatePasswordStrength(password);
    if (passwordError) {
      nextFieldErrors.password = passwordError;
    }

    const confirmError = validateConfirmPassword(password, confirmPassword ?? '');
    if (confirmError) {
      nextFieldErrors.confirmPassword = confirmError;
    }

    if (Object.keys(nextFieldErrors).length > 0) {
      setFieldErrors(nextFieldErrors);
      updateState({ isLoading: false });
      return;
    }

    const normalizedEmail = email.trim();
    try {
      const result = await requestBetterAuth(
        {
          name: name?.trim(),
          email: normalizedEmail,
          password,
          redirectTo: canonicalRedirect,
        },
        'signup'
      );

      updateState({
        message:
          result.message ?? 'Account created! Check your inbox to confirm your email.',
        isLoading: false,
        name: '',
        email: '',
        password: '',
        confirmPassword: '',
      });

      if (result.redirect) {
        router.replace(result.redirect);
        router.refresh();
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unable to create your account right now.';
      updateState({ error: message, isLoading: false });
    }
  };

  const handleOAuth = useCallback(
    async (provider: OAuthProvider) => {
      updateState({ isLoading: true, error: null, message: null });

      try {
        const result = await requestBetterAuth(
          {
            provider,
            redirectTo: canonicalRedirect,
          },
          'oauth'
        );

        if (result.redirect) {
          updateState({ message: 'Redirecting to provider…' });
          window.location.href = result.redirect;
          return;
        }

        updateState({
          error: 'Unable to redirect to the selected provider. Please try again.',
          isLoading: false,
        });
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Unable to start OAuth flow. Please try again.';
        updateState({ error: message, isLoading: false });
      }
    },
    [canonicalRedirect]
  );

  return (
    <div className="space-y-5">
      <div className="space-y-2 text-left">
        <h2 className="text-xl font-semibold text-[#1f2937]">Create an account</h2>
        <p className="text-base text-[#6b7280]">Join SMMA Morocco with your email or your favorite provider.</p>
      </div>

      <OAuthButtons onOAuth={handleOAuth} isLoading={state.isLoading} />

      <div className="relative" aria-hidden="true">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t border-slate-200" />
        </div>
        <div className="relative flex justify-center">
          <span className="bg-white px-4 text-sm font-medium text-[#6b7280]">or continue with email</span>
        </div>
      </div>

      <form className="space-y-4" onSubmit={handleSubmit} noValidate>
        <div className="space-y-2">
          <label htmlFor="signup-name" className="text-sm font-medium text-slate-700">
            Name
          </label>
          <Input
            id="signup-name"
            type="text"
            autoComplete="name"
            value={state.name ?? ''}
            onChange={(event) => {
              const value = event.target.value;
              updateState({ name: value });
              setFieldErrors((prev) => ({ ...prev, name: validateName(value) }));
            }}
            placeholder="Your full name"
            aria-invalid={Boolean(fieldErrors.name)}
            aria-describedby={fieldErrors.name ? 'signup-name-error' : undefined}
            required
          />
          {fieldErrors.name && (
            <p id="signup-name-error" className="text-sm text-red-600" role="alert">
              {fieldErrors.name}
            </p>
          )}
        </div>
        <div className="space-y-2">
          <label htmlFor="signup-email" className="text-sm font-medium text-slate-700">
            Email address
          </label>
          <Input
            id="signup-email"
            type="email"
            autoComplete="email"
            value={state.email}
            onChange={(event) => {
              const value = event.target.value;
              updateState({ email: value });
              setFieldErrors((prev) => ({ ...prev, email: validateEmail(value) }));
            }}
            placeholder="you@example.com"
            aria-invalid={Boolean(fieldErrors.email)}
            aria-describedby={fieldErrors.email ? 'signup-email-error' : undefined}
            required
          />
          {fieldErrors.email && (
            <p id="signup-email-error" className="text-sm text-red-600" role="alert">
              {fieldErrors.email}
            </p>
          )}
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
            onChange={(event) => {
              const value = event.target.value;
              updateState({ password: value });
              setFieldErrors((prev) => ({
                ...prev,
                password: validatePasswordStrength(value),
                ...(state.confirmPassword !== undefined
                  ? { confirmPassword: validateConfirmPassword(value, state.confirmPassword ?? '') }
                  : {}),
              }));
            }}
            placeholder="Create a secure password"
            aria-invalid={Boolean(fieldErrors.password)}
            aria-describedby={fieldErrors.password ? 'signup-password-error' : undefined}
            required
          />
          {fieldErrors.password && (
            <p id="signup-password-error" className="text-sm text-red-600" role="alert">
              {fieldErrors.password}
            </p>
          )}
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
            onChange={(event) => {
              const value = event.target.value;
              updateState({ confirmPassword: value });
              setFieldErrors((prev) => ({
                ...prev,
                confirmPassword: validateConfirmPassword(state.password, value),
              }));
            }}
            placeholder="Re-enter your password"
            aria-invalid={Boolean(fieldErrors.confirmPassword)}
            aria-describedby={fieldErrors.confirmPassword ? 'signup-confirm-error' : undefined}
            required
          />
          {fieldErrors.confirmPassword && (
            <p id="signup-confirm-error" className="text-sm text-red-600" role="alert">
              {fieldErrors.confirmPassword}
            </p>
          )}
        </div>
        <Button type="submit" disabled={isSubmitDisabled}>
          {state.isLoading ? (
            <span className="flex items-center justify-center gap-2">
              <LoadingSpinner />
              Creating account…
            </span>
          ) : (
            'Create Account'
          )}
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
      <p className="text-center text-sm text-slate-500">
        Already have an account?{' '}
        <button
          type="button"
          onClick={onSwitchToSignIn}
          className="font-medium text-blue-600 transition-colors duration-200 hover:text-blue-500"
        >
          Sign in
        </button>
      </p>
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
