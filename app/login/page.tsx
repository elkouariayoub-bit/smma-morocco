'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

type LoginSearchParams = {
  message?: string;
};

export default function LoginPage({ searchParams }: { searchParams?: LoginSearchParams }) {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [code, setCode] = useState('');
  const [codeError, setCodeError] = useState<string | null>(null);
  const [isCodeLoading, setIsCodeLoading] = useState(false);
  const router = useRouter();

  const handleMagicLinkSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const response = await fetch('/auth/magic-link', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => null);
        const message = data?.error?.message || 'Failed to send magic link';
        throw new Error(message);
      }

      setSent(true);
    } catch (err) {
      console.error('Error sending magic link', err);
      setError(err instanceof Error ? err.message : 'Failed to send magic link');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCodeSignIn = async (event: React.FormEvent) => {
    event.preventDefault();
    setCodeError(null);
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
        const data = await response.json().catch(() => null);
        const message = data?.error?.message || 'Invalid access code';
        throw new Error(message);
      }

      router.push('/composer');
    } catch (err) {
      console.error('Error verifying access code', err);
      setCodeError(err instanceof Error ? err.message : 'Invalid access code');
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
              Choose the login method that suits you—receive a secure magic link in your inbox or unlock instant
              access with your one-time partner code.
            </p>
          </div>
          <div className="grid gap-4 text-sm text-slate-300 sm:grid-cols-2">
            <div className="rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur">
              <p className="font-medium text-white">Email magic links</p>
              <p className="mt-2 leading-6 text-slate-300">Secure sign-in without remembering passwords.</p>
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
              <CardTitle className="text-2xl font-semibold text-slate-900">
                {sent ? 'Check your inbox' : 'Sign in with magic link'}
              </CardTitle>
              <CardDescription className="text-base text-slate-600">
                {sent
                  ? `We've sent a secure login link to ${email}. Open it on this device to continue.`
                  : 'Enter your email address and we will email you a secure, one-click sign in link.'}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {!sent ? (
                <form onSubmit={handleMagicLinkSignIn} className="space-y-4">
                  <div className="text-left">
                    <label className="text-sm font-medium text-slate-700" htmlFor="email">
                      Work email
                    </label>
                    <Input
                      className="mt-2 h-11 rounded-lg border-slate-200 text-base"
                      id="email"
                      name="email"
                      type="email"
                      placeholder="you@example.com"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>
                  <Button
                    type="submit"
                    disabled={isLoading || !email}
                    className="h-11 rounded-lg bg-slate-900 text-base font-semibold text-white hover:bg-slate-800"
                  >
                    {isLoading ? 'Sending…' : 'Send me a magic link'}
                  </Button>
                </form>
              ) : (
                <div className="space-y-4 text-sm text-slate-600">
                  <p>
                    Didn&apos;t receive the message? Check your spam folder or resend the link by submitting your email
                    again.
                  </p>
                  <Button
                    type="button"
                    onClick={() => setSent(false)}
                    className="h-11 rounded-lg border border-slate-200 bg-white text-base font-semibold text-slate-800 hover:bg-slate-100"
                  >
                    Send a new link
                  </Button>
                </div>
              )}

              {(error || searchMessage) && (
                <p
                  className={`rounded-lg border p-3 text-sm font-medium ${
                    error
                      ? 'border-red-200 bg-red-50 text-red-700'
                      : 'border-amber-200 bg-amber-50 text-amber-700'
                  }`}
                >
                  {error || searchMessage}
                </p>
              )}
            </CardContent>
          </Card>

          <div className="relative flex items-center gap-3 text-sm font-medium text-slate-400">
            <span className="h-px flex-1 bg-white/20" />
            or
            <span className="h-px flex-1 bg-white/20" />
          </div>

          <Card className="border-none shadow-xl shadow-slate-900/20">
            <CardHeader className="space-y-2 text-center">
              <CardTitle className="text-2xl font-semibold text-slate-900">Sign in with access code</CardTitle>
              <CardDescription className="text-base text-slate-600">
                Enter the shared code from your onboarding email to jump straight into the dashboard.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleCodeSignIn} className="space-y-4">
                <div className="text-left">
                  <label className="text-sm font-medium text-slate-700" htmlFor="access-code">
                    Access code
                  </label>
                  <Input
                    id="access-code"
                    name="access-code"
                    type="text"
                    required
                    value={code}
                    onChange={(event) => setCode(event.target.value)}
                    placeholder="Enter “AYOUB”"
                    className="mt-2 h-11 rounded-lg border-slate-200 text-base tracking-[0.4em] uppercase"
                    autoComplete="off"
                  />
                </div>
                <Button
                  type="submit"
                  disabled={isCodeLoading || !code.trim()}
                  className="h-11 rounded-lg bg-slate-900 text-base font-semibold text-white hover:bg-slate-800"
                >
                  {isCodeLoading ? 'Verifying…' : 'Unlock my workspace'}
                </Button>
                {codeError && (
                  <p className="rounded-lg border border-red-200 bg-red-50 p-3 text-center text-sm font-medium text-red-700">
                    {codeError}
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
