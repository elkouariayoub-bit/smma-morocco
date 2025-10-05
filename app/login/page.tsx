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
  const [activeTab, setActiveTab] = useState<'signin' | 'signup'>('signin');

  const { emailRedirect, oauthRedirect } = useMemo(() => {
    const canonical =
      typeof window !== 'undefined'
        ? window.location.origin
        : trimTrailingSlash(env.siteUrl);

    if (!canonical) {
      return { emailRedirect: undefined, oauthRedirect: undefined };
    }

    return {
      emailRedirect: `${canonical}/auth/callback`,
      oauthRedirect: `${canonical}/api/auth/callback/google`,
    };
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
          className="mb-8 inline-flex items-center gap-2 text-sm font-medium text-blue-600 transition-colors duration-200 hover:text-blue-500"
        >
          ← Back to site
        </Link>

        <Card className="m-8 w-full max-w-[420px]">
          <CardHeader className="space-y-2 px-6 pb-0 pt-6 text-center">
            <CardTitle className="text-[28px] font-bold text-[#1f2937]">Sign in to SMMA Morocco</CardTitle>
            <CardDescription className="text-base font-normal text-[#6b7280]">
              Welcome back! Please sign in to your account.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-5 p-6 pt-0">
            {searchMessage && (
              <p className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-2 text-sm text-amber-700" role="status">
                {searchMessage}
              </p>
            )}

            <div className="space-y-5">
              <div className="rounded-xl bg-slate-100 p-1 text-sm font-medium text-slate-500">
                <div className="grid grid-cols-2 gap-1">
                  <button
                    type="button"
                    onClick={() => setActiveTab('signin')}
                    className={`rounded-lg px-3 py-2 transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 ${
                      activeTab === 'signin'
                        ? 'bg-white text-slate-900 shadow-sm'
                        : 'hover:text-slate-700'
                    }`}
                  >
                    Sign In
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab('signup')}
                    className={`rounded-lg px-3 py-2 transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 ${
                      activeTab === 'signup'
                        ? 'bg-white text-slate-900 shadow-sm'
                        : 'hover:text-slate-700'
                    }`}
                  >
                    Sign Up
                  </button>
                </div>
              </div>

              <div className="relative">
                <div
                  className={`transition-all duration-300 ${
                    activeTab === 'signin'
                      ? 'relative translate-y-0 opacity-100'
                      : 'pointer-events-none absolute inset-0 -translate-y-3 opacity-0'
                  }`}
                >
                  <SignIn
                    redirectTo={emailRedirect}
                    oauthRedirectTo={oauthRedirect}
                    onSwitchToSignUp={() => setActiveTab('signup')}
                  />
                </div>
                <div
                  className={`transition-all duration-300 ${
                    activeTab === 'signup'
                      ? 'relative translate-y-0 opacity-100'
                      : 'pointer-events-none absolute inset-0 -translate-y-3 opacity-0'
                  }`}
                >
                  <SignUp
                    redirectTo={emailRedirect}
                    oauthRedirectTo={oauthRedirect}
                    onSwitchToSignIn={() => setActiveTab('signin')}
                  />
                </div>
              </div>

              <div className="space-y-2 text-left">
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
                    {codeError && (
                      <p className="text-sm text-red-600" role="alert">
                        {codeError}
                      </p>
                    )}
                    {codeSuccess && !codeError && (
                      <p className="text-sm text-emerald-600" role="status">
                        {codeSuccess}
                      </p>
                    )}
                  </div>
                  <Button type="submit" disabled={isCodeLoading || !code.trim()}>
                    {isCodeLoading ? 'Verifying…' : 'Unlock workspace'}
                  </Button>
                </form>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
