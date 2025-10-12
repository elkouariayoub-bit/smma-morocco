'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { Button } from './ui/button';
import { getOptionalSupabaseBrowserClient } from '@/lib/supabase';
import { User, type Session } from '@supabase/supabase-js';

const navLinks = [
    { href: '/dashboard', label: 'Dashboard' },
    { href: '/queue', label: 'Queue' },
    { href: '/drafts', label: 'Drafts' },
    { href: '/analytics', label: 'Analytics' },
];

export function Navbar() {
  const [user, setUser] = useState<User | null>(null);
  const supabase = getOptionalSupabaseBrowserClient();

  useEffect(() => {
    if (!supabase) {
      setUser(null);
      return;
    }

    const fetchUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
    };

    fetchUser();

    const { data: authListener } = supabase.auth.onAuthStateChange((_event: string, session: Session | null) => {
      setUser(session?.user ?? null);
    });

    return () => {
      authListener?.subscription.unsubscribe();
    };
  }, [supabase]);

  const handleSignOut = async () => {
    if (!supabase) {
      console.warn('Supabase credentials missing; unable to sign out.');
      return;
    }

    await supabase.auth.signOut();
  };

  return (
    <header className="border-b bg-white/80 backdrop-blur-lg sticky top-0 z-10">
      <div className="max-w-5xl mx-auto p-3 flex items-center gap-4">
        <Link href="/" className="font-semibold text-lg">SMMA Morocco</Link>
        <nav className="ml-auto flex gap-2 text-sm">
            {navLinks.map(link => (
                <Link key={link.href} href={link.href} className="px-3 py-1.5 rounded-full hover:bg-gray-100 transition-colors">
                    {link.label}
                </Link>
            ))}
        </nav>
        <div className="ml-2">
            {user ? (
                <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-600 hidden sm:inline">{user.email}</span>
                    <Button variant="secondary" onClick={handleSignOut}>Sign Out</Button>
                </div>
            ) : (
                <Link href="/auth/login"><Button variant="secondary">Sign In</Button></Link>
            )}
        </div>
      </div>
    </header>
  );
}
