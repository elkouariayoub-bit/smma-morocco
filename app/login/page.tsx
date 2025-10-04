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
      <div className="flex min-h-screen w-full flex-col items-center justify-center px-6 py-16 sm:px-8">
        <Link
          href="/"
          className="mb-10 inline-flex items-center gap-2 text-sm font-semibold text-blue-600 transition-colors duration-200 hover:text-blue-500"
        >
          ← Back to site
        </Link>

        <Card className="w-full max-w-md border border-slate-200 bg-white shadow-[0_18px_48px_-24px_rgba(15,23,42,0.3)]">
          <CardHeader className="space-y-3 text-center">
            <CardTitle className="text-3xl font-semibold text-slate-900">Sign in to SMMA Morocco</CardTitle>
            <CardDescription className="text-sm text-slate-500">
              Welcome back! Please sign in to your account.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-10">
            {searchMessage && (
              <p className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700" role="status">
                {searchMessage}
              </p>
            )}

            <SignIn redirectTo={redirectTo} />

            <div className="space-y-6">
              <div className="space-y-3 text-left">
                <h2 className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-400">Create account</h2>
                <SignUp redirectTo={redirectTo} />
              </div>

              <div className="space-y-3 text-left">
                <h2 className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-400">Partner access code</h2>
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
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
