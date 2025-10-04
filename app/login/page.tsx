'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';

export default function LoginPage({ searchParams }: { searchParams: { message: string } }) {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

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
          <CardContent>
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
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
