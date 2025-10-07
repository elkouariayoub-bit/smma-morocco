'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { getOptionalSupabaseBrowserClient } from '@/lib/supabase';
import { User, type Session } from '@supabase/supabase-js';
import { useEffect, useState, type Dispatch, type SetStateAction } from 'react';
import type { Page } from '../types';
import { Clock, Archive, BarChart2, Home } from 'lucide-react';
import { UserButton } from '@daveyplate/better-auth-ui';

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: Home },
  { href: '/queue', label: 'Queue', icon: Clock },
  { href: '/drafts', label: 'Drafts', icon: Archive },
  { href: '/analytics', label: 'Analytics', icon: BarChart2 },
];

interface SidebarProps {
  currentPage?: Page;
  setCurrentPage?: Dispatch<SetStateAction<Page>>;
  hasCodeSession?: boolean;
}

export function Sidebar({ currentPage, setCurrentPage, hasCodeSession = false }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [codeSession, setCodeSession] = useState(hasCodeSession);
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

  useEffect(() => {
    setCodeSession(hasCodeSession);
  }, [hasCodeSession]);

  const handleSignOut = async () => {
    await Promise.allSettled([
      supabase?.auth.signOut(),
      fetch('/auth/code', { method: 'DELETE' }),
    ]);
    setCodeSession(false);
    router.push('/login');
  };

  return (
    <aside className="w-64 bg-white border-r border-gray-200 flex flex-col fixed h-full">
      <div className="p-6 border-b border-gray-200">
        <Link href="/" className="text-2xl font-bold text-gray-800">SMMA<span className="text-black">.</span></Link>
        <p className="text-sm text-gray-500">Morocco</p>
      </div>
      <nav className="flex-1 p-4 space-y-1">
        {navItems.map((item) => {
          const pageFromHref = item.href.replace(/^\//, '') as Page;
          const isActive = pathname === item.href || currentPage === pageFromHref;
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setCurrentPage?.(pageFromHref)}
              className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-gray-900 text-white'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <item.icon className="w-5 h-5" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>
      {(user || codeSession) && (
        <div className="p-4 border-t border-gray-200">
          <UserButton onSignOut={handleSignOut} hasCodeSession={codeSession} />
        </div>
      )}
    </aside>
  );
}
