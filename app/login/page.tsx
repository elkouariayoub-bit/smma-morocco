'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function LoginPage({ searchParams }: { searchParams: { message: string } }) {
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
          <CardContent className="space-y-8">
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

            {(error || searchParams?.message) && (
              <p className={`mt-4 p-3 text-center text-sm rounded-lg ${
                error ? 'bg-red-100 text-red-800' : 'bg-gray-100 text-gray-800'
              }`}>
                {error || searchParams.message}
              </p>
            )}

            <div>
              <div className="text-center">
                <p className="text-sm font-medium text-gray-700">Have a one-time access code?</p>
                <p className="text-xs text-gray-500">Enter it below to jump straight into the app.</p>
              </div>

              <form onSubmit={handleCodeSignIn} className="mt-4 flex flex-col gap-4">
                <div>
                  <label className="text-sm font-medium" htmlFor="access-code">
                    Access code
                  </label>
                  <Input
                    id="access-code"
                    name="access-code"
                    type="text"
                    required
                    value={code}
                    onChange={(event) => setCode(event.target.value)}
                    placeholder="Enter your code"
                    className="mt-1"
                    autoComplete="off"
                  />
                </div>
                <Button type="submit" disabled={isCodeLoading || !code.trim()}>
                  {isCodeLoading ? 'Checking...' : 'Sign in with code'}
                </Button>
                {codeError && (
                  <p className="text-sm text-center text-red-700 bg-red-100 rounded-md p-2">
                    {codeError}
                  </p>
                )}
              </form>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
