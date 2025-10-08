'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { getOptionalSupabaseBrowserClient } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

const validatePasswordStrength = (value: string) => {
  const trimmed = value.trim();

  if (!trimmed) {
    return 'Please enter a new password.';
  }

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
  const trimmed = confirm.trim();

  if (!trimmed) {
    return 'Please confirm your password.';
  }

  if (password.trim() && password !== confirm) {
    return 'Passwords do not match.';
  }

  return undefined;
};

export default function ResetPasswordPage() {
  const router = useRouter();
  const supabase = getOptionalSupabaseBrowserClient();
  const [isCheckingSession, setIsCheckingSession] = useState(true);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [fieldErrors, setFieldErrors] = useState<{
    password?: string;
    confirmPassword?: string;
  }>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [formSuccess, setFormSuccess] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    let isActive = true;

    if (!supabase) {
      setFormError('Authentication is not configured. Contact the site owner.');
      setIsCheckingSession(false);
      return;
    }

    const verifySession = async () => {
      const { data } = await supabase.auth.getSession();

      if (!isActive) return;

      if (!data.session) {
        router.replace('/login?message=' + encodeURIComponent('Your reset link has expired. Please request a new one.'));
        return;
      }

      setIsCheckingSession(false);
    };

    verifySession();

    return () => {
      isActive = false;
    };
  }, [router, supabase]);

  const passwordError = useMemo(() => validatePasswordStrength(password), [password]);
  const confirmError = useMemo(
    () => validateConfirmPassword(password, confirmPassword),
    [password, confirmPassword],
  );

  const isSubmitDisabled = isSubmitting || Boolean(passwordError) || Boolean(confirmError);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFormError(null);
    setFormSuccess(null);

    const nextFieldErrors: typeof fieldErrors = {};
    const nextPasswordError = validatePasswordStrength(password);
    if (nextPasswordError) {
      nextFieldErrors.password = nextPasswordError;
    }

    const nextConfirmError = validateConfirmPassword(password, confirmPassword);
    if (nextConfirmError) {
      nextFieldErrors.confirmPassword = nextConfirmError;
    }

    setFieldErrors(nextFieldErrors);

    if (Object.keys(nextFieldErrors).length > 0) {
      return;
    }

    setIsSubmitting(true);

    if (!supabase) {
      setFormError('Authentication is not configured. Contact the site owner.');
      setIsSubmitting(false);
      return;
    }

    try {
      const { error } = await supabase.auth.updateUser({ password: password.trim() });

      if (error) {
        throw new Error(error.message);
      }

      setFormSuccess('Password updated successfully. Redirecting…');
      setPassword('');
      setConfirmPassword('');
      setTimeout(() => {
        router.replace('/dashboard');
        router.refresh();
      }, 1200);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unable to update password. Please try again.';
      setFormError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!supabase) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-100 px-4">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle>Password reset unavailable</CardTitle>
            <CardDescription>
              Authentication is not configured. Please contact the site owner to finish resetting your password.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link
              href="/login"
              className="text-sm font-medium text-blue-600 transition-colors duration-200 hover:text-blue-500"
            >
              Return to sign in
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isCheckingSession) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-100">
        <p className="text-sm text-slate-600">Validating reset link…</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100">
      <div className="flex min-h-screen w-full flex-col items-center justify-center px-6 py-16 sm:px-8">
        <Link
          href="/login"
          className="mb-8 inline-flex items-center gap-2 text-sm font-medium text-blue-600 transition-colors duration-200 hover:text-blue-500"
        >
          ← Back to login
        </Link>

        <Card className="m-8 w-full max-w-[420px]">
          <CardHeader className="space-y-2 px-6 pb-0 pt-6 text-center">
            <CardTitle className="text-[28px] font-bold text-[#1f2937]">Reset your password</CardTitle>
            <CardDescription className="text-base font-normal text-[#6b7280]">
              Choose a strong password to secure your account.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-5 p-6 pt-0">
            <form className="space-y-5" onSubmit={handleSubmit} noValidate>
              <div className="space-y-2">
                <label htmlFor="reset-password" className="text-sm font-medium text-slate-700">
                  New password
                </label>
                <Input
                  id="reset-password"
                  type="password"
                  autoComplete="new-password"
                  value={password}
                  onChange={(event) => {
                    const value = event.target.value;
                    setPassword(value);
                    setFieldErrors((prev) => ({ ...prev, password: validatePasswordStrength(value) }));
                  }}
                  placeholder="Enter a secure password"
                  aria-invalid={Boolean(fieldErrors.password)}
                  aria-describedby={fieldErrors.password ? 'reset-password-error' : undefined}
                  required
                />
                {fieldErrors.password && (
                  <p id="reset-password-error" className="text-sm text-red-600" role="alert">
                    {fieldErrors.password}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <label htmlFor="reset-confirm" className="text-sm font-medium text-slate-700">
                  Confirm password
                </label>
                <Input
                  id="reset-confirm"
                  type="password"
                  autoComplete="new-password"
                  value={confirmPassword}
                  onChange={(event) => {
                    const value = event.target.value;
                    setConfirmPassword(value);
                    setFieldErrors((prev) => ({
                      ...prev,
                      confirmPassword: validateConfirmPassword(password, value),
                    }));
                  }}
                  placeholder="Re-enter your password"
                  aria-invalid={Boolean(fieldErrors.confirmPassword)}
                  aria-describedby={fieldErrors.confirmPassword ? 'reset-confirm-error' : undefined}
                  required
                />
                {fieldErrors.confirmPassword && (
                  <p id="reset-confirm-error" className="text-sm text-red-600" role="alert">
                    {fieldErrors.confirmPassword}
                  </p>
                )}
              </div>

              <Button type="submit" disabled={isSubmitDisabled}>
                {isSubmitting ? 'Updating password…' : 'Update password'}
              </Button>
            </form>

            {(formError || formSuccess) && (
              <p
                className={`text-sm transition-opacity duration-200 ${
                  formError ? 'text-red-600' : 'text-emerald-600'
                }`}
                role={formError ? 'alert' : 'status'}
              >
                {formError ?? formSuccess}
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
