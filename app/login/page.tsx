'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function LoginPage({ searchParams }: { searchParams: { message?: string } }) {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [accessCode, setAccessCode] = useState('');
  const [isAccessLoading, setIsAccessLoading] = useState(false);

  const handleMagicLinkSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    setIsLoading(false);
    if (error) {
      setError(error.message);
    } else {
      setSent(true);
    }
  };

  const handleAccessCodeSignIn = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);
    setIsAccessLoading(true);

    try {
      const response = await fetch('/api/auth/access-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: accessCode }),
      });

      const payload = (await response.json().catch(() => ({}))) as {
        access_token?: string;
        refresh_token?: string;
        error?: string;
      };

      if (!response.ok || !payload.access_token || !payload.refresh_token) {
        throw new Error(payload.error || 'Invalid access code');
      }

      const { error } = await supabase.auth.setSession({
        access_token: payload.access_token,
        refresh_token: payload.refresh_token,
      });

      if (error) {
        throw error;
      }

      router.replace('/composer');
    } catch (err: any) {
      setError(err?.message || 'Access code sign-in failed');
    } finally {
      setIsAccessLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-sm">
        <Card>
          <CardHeader className="text-center">
            <Link href="/" className="font-semibold text-2xl mx-auto mb-2">
              SMMA Morocco
            </Link>
            <CardTitle>{sent ? 'Check your inbox' : 'Welcome'}</CardTitle>
            <CardDescription>
              {sent
                ? `We've sent a magic link to ${email}. Click the link to sign in.`
                : 'Enter your email to receive a magic link to sign in.'}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {!sent && (
              <form onSubmit={handleMagicLinkSignIn} className="flex flex-col w-full justify-center gap-4">
                <div>
                  <label className="text-sm font-medium" htmlFor="email">
                    Email
                  </label>
                  <Input
                    className="mt-1"
                    id="email"
                    name="email"
                    type="email"
                    placeholder="you@example.com"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
                <div className="flex flex-col gap-2 pt-2">
                  <Button type="submit" disabled={isLoading || !email}>
                    {isLoading ? 'Sending...' : 'Send Magic Link'}
                  </Button>
                </div>
              </form>
            )}

            <div>
              <div className="flex items-center gap-4 text-xs font-medium uppercase tracking-wide text-gray-400">
                <span className="h-px flex-1 bg-gray-200" />
                <span>or</span>
                <span className="h-px flex-1 bg-gray-200" />
              </div>
              <form onSubmit={handleAccessCodeSignIn} className="mt-4 flex flex-col gap-4">
                <div>
                  <label className="text-sm font-medium" htmlFor="access-code">
                    Access Code
                  </label>
                  <Input
                    className="mt-1"
                    id="access-code"
                    name="access-code"
                    placeholder="Enter access code"
                    value={accessCode}
                    onChange={(e) => setAccessCode(e.target.value)}
                  />
                </div>
                <Button type="submit" disabled={isAccessLoading || !accessCode.trim()}>
                  {isAccessLoading ? 'Checking…' : 'Enter Dashboard'}
                </Button>
              </form>
            </div>

            {(error || searchParams?.message) && (
              <p
                className={`mt-2 rounded-lg p-3 text-center text-sm ${
                  error ? 'bg-red-100 text-red-800' : 'bg-gray-100 text-gray-800'
                }`}
              >
                {error || searchParams?.message}
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
