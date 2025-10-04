'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { SignIn, SignUp } from '@daveyplate/better-auth-ui';
import { env } from '@/lib/env';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

type LoginSearchParams = {
  message?: string;
};

const trimTrailingSlash = (value: string | null | undefined) =>
  value ? value.replace(/\/$/, '') : null;

export default function LoginPage({ searchParams }: { searchParams?: LoginSearchParams }) {
  const router = useRouter();
  const [code, setCode] = useState('');
  const [codeError, setCodeError] = useState<string | null>(null);
  const [codeSuccess, setCodeSuccess] = useState<string | null>(null);
  const [isCodeLoading, setIsCodeLoading] = useState(false);

  const redirectTo = useMemo(() => {
    const canonical =
      typeof window !== 'undefined'
        ? window.location.origin
        : trimTrailingSlash(env.siteUrl);

    return canonical ? `${canonical}/auth/callback` : undefined;
  }, []);

  const handleCodeSignIn = async (event: React.FormEvent) => {
    event.preventDefault();
    setCodeError(null);
    setCodeSuccess(null);
    setIsCodeLoading(true);

    try {
      const response = await fetch('/auth/code', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ code }),
      });

      if (!response.ok) {
        const payload = await response.json().catch(() => null);
        const message = payload?.error?.message ?? 'Invalid access code';
        throw new Error(message);
      }

      setCodeSuccess('Code accepted. Redirecting…');
      router.push('/composer');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Invalid access code';
      setCodeError(message);
    } finally {
      setIsCodeLoading(false);
    }
  };

  const searchMessage = searchParams?.message ?? null;

  return (
    <div className="min-h-screen bg-slate-100">
      <div className="mx-auto flex min-h-screen w-full max-w-6xl flex-col items-center justify-center px-6 py-16 sm:px-8">
        <div className="w-full space-y-12">
          <div className="flex items-center justify-between">
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-sm font-semibold text-blue-600 transition-colors duration-200 hover:text-blue-500"
            >
              ← Back to site
            </Link>
            <span className="text-xs font-semibold uppercase tracking-[0.28em] text-slate-400">SMMA Morocco</span>
          </div>

          <div className="space-y-4 text-center">
            <h1 className="text-4xl font-semibold text-slate-900 sm:text-5xl">Sign in to your workspace</h1>
            <p className="mx-auto max-w-2xl text-base text-slate-500">
              Enjoy a polished authentication experience with email, password, Google, GitHub, and direct partner access. Every
              element is tuned for clarity, focus, and effortless onboarding.
            </p>
          </div>

          <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,360px)]">
            <Card className="border-0 bg-white shadow-[0_20px_60px_-32px_rgba(15,23,42,0.35)]">
              <CardHeader className="space-y-3 text-left">
                <CardTitle className="text-2xl font-semibold text-slate-900">Welcome back</CardTitle>
                <CardDescription className="text-sm text-slate-500">
                  Continue with your preferred method and jump back into campaign management.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-8">
                {searchMessage && (
                  <p className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700" role="status">
                    {searchMessage}
                  </p>
                )}
                <SignIn redirectTo={redirectTo} />
              </CardContent>
            </Card>

            <div className="grid gap-6">
              <Card className="border-0 bg-white shadow-[0_20px_60px_-32px_rgba(15,23,42,0.2)]">
                <CardHeader className="space-y-2 text-left">
                  <CardTitle className="text-xl font-semibold text-slate-900">Create a new account</CardTitle>
                  <CardDescription className="text-sm text-slate-500">
                    Set up your profile in minutes and access your performance toolkit instantly.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <SignUp redirectTo={redirectTo} />
                </CardContent>
              </Card>

              <Card className="border border-slate-200 bg-white shadow-[0_12px_40px_-24px_rgba(15,23,42,0.25)]">
                <CardHeader className="space-y-2 text-left">
                  <CardTitle className="text-xl font-semibold text-slate-900">Partner access code</CardTitle>
                  <CardDescription className="text-sm text-slate-500">
                    Enter the exclusive code to unlock full access without additional steps.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleCodeSignIn} className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-slate-700" htmlFor="access-code">
                        Access code
                      </label>
                      <Input
                        id="access-code"
                        name="code"
                        value={code}
                        onChange={(event) => setCode(event.target.value.toUpperCase())}
                        placeholder="AYOUB"
                        className="tracking-[0.5em]"
                        required
                      />
                    </div>
                    <Button type="submit" disabled={isCodeLoading || !code.trim()}>
                      {isCodeLoading ? 'Verifying…' : 'Unlock workspace'}
                    </Button>
                    {(codeError || codeSuccess) && (
                      <p
                        className={`text-sm transition-opacity duration-200 ${codeError ? 'text-red-600' : 'text-emerald-600'}`}
                        role={codeError ? 'alert' : 'status'}
                      >
                        {codeError ?? codeSuccess}
                      </p>
                    )}
                  </form>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
