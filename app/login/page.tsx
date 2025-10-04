'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Auth } from '@supabase/auth-ui-react';
import { ThemeSupa } from '@supabase/auth-ui-shared';
import { supabase } from '@/lib/supabase';
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
    <div className="relative isolate flex min-h-screen flex-col justify-center overflow-hidden bg-slate-950 px-6 py-16 sm:px-8">
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -left-1/3 top-1/4 h-96 w-96 rounded-full bg-gradient-to-br from-blue-400/40 via-cyan-300/30 to-purple-500/30 blur-3xl" />
        <div className="absolute -right-24 bottom-0 h-80 w-80 rounded-full bg-gradient-to-tr from-purple-500/40 via-indigo-400/30 to-sky-400/30 blur-3xl" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_#1e293b_0,_transparent_55%)]" />
      </div>

      <div className="mx-auto flex w-full max-w-6xl flex-col gap-16 lg:flex-row lg:items-center">
        <div className="max-w-xl space-y-6 text-slate-100">
          <Link href="/" className="inline-flex items-center text-sm font-semibold tracking-wide text-slate-200">
            ← Back to site
          </Link>
          <div>
            <p className="text-sm uppercase tracking-[0.3em] text-slate-400">SMMA Morocco</p>
            <h1 className="mt-3 text-4xl font-semibold tracking-tight sm:text-5xl">Access your social media command center</h1>
            <p className="mt-4 text-base text-slate-300">
              Use our official Supabase authentication experience to sign in with your preferred method or unlock direct access
              with the partner code.
            </p>
          </div>
          <div className="grid gap-4 text-sm text-slate-300 sm:grid-cols-2">
            <div className="rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur">
              <p className="font-medium text-white">Supabase Auth UI</p>
              <p className="mt-2 leading-6 text-slate-300">Pre-built email, password, magic link, and OAuth sign-in powered by Supabase.</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur">
              <p className="font-medium text-white">Access code entry</p>
              <p className="mt-2 leading-6 text-slate-300">Use your “AYOUB” code for immediate workspace access.</p>
            </div>
          </div>
        </div>

        <div className="w-full max-w-md space-y-6">
          <Card className="border-none shadow-xl shadow-slate-900/20">
            <CardHeader className="space-y-2 text-center">
              <CardTitle className="text-2xl font-semibold text-slate-900">Sign in to SMMA Morocco</CardTitle>
              <CardDescription className="text-base text-slate-600">
                Choose your preferred authentication method, including Google, GitHub, email/password, or a secure magic link.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {searchMessage && (
                <p className="rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-700" role="status">
                  {searchMessage}
                </p>
              )}
              <Auth
                supabaseClient={supabase}
                appearance={{ theme: ThemeSupa }}
                providers={['google', 'github']}
                redirectTo={redirectTo}
              />
            </CardContent>
          </Card>

          <Card className="border border-dashed border-slate-300/70 bg-white/80 shadow-none backdrop-blur">
            <CardHeader>
              <CardTitle className="text-xl font-semibold text-slate-900">Sign in with access code</CardTitle>
              <CardDescription className="text-sm text-slate-600">
                Enter <span className="font-semibold tracking-[0.3em] text-slate-900">AYOUB</span> to jump straight into your dashboard.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleCodeSignIn} className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-slate-700" htmlFor="access-code">
                    Access code
                  </label>
                  <Input
                    id="access-code"
                    name="code"
                    value={code}
                    onChange={(event) => setCode(event.target.value)}
                    placeholder="AYOUB"
                    className="mt-2 h-11 rounded-lg border-slate-200 text-base uppercase tracking-[0.5em]"
                    required
                  />
                </div>
                <Button
                  type="submit"
                  disabled={isCodeLoading || !code}
                  className="h-11 w-full rounded-lg bg-slate-900 text-base font-semibold text-white hover:bg-slate-800"
                >
                  {isCodeLoading ? 'Verifying…' : 'Unlock workspace'}
                </Button>
                {(codeError || codeSuccess) && (
                  <p className={`text-sm ${codeError ? 'text-red-600' : 'text-emerald-600'}`} role={codeError ? 'alert' : 'status'}>
                    {codeError ?? codeSuccess}
                  </p>
                )}
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
