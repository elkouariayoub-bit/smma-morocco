'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { User, type Session } from '@supabase/supabase-js';
import { useEffect, useMemo, useState, type Dispatch, type SetStateAction } from 'react';
import type { Page } from '../types';
import {
  Archive,
  BarChart2,
  Clock,
  LayoutDashboard,
  LogOut,
  PenSquare,
  Sparkles,
} from 'lucide-react';
import { Button } from './ui/button';
import { Tooltip } from './ui/tooltip';

const navItems = [
  { href: '/dashboard', label: 'Overview', icon: LayoutDashboard },
  { href: '/composer', label: 'Composer', icon: PenSquare },
  { href: '/queue', label: 'Queue', icon: Clock },
  { href: '/drafts', label: 'Drafts', icon: Archive },
  { href: '/analytics', label: 'Analytics', icon: BarChart2 },
];

interface SidebarProps {
  currentPage?: Page;
  setCurrentPage?: Dispatch<SetStateAction<Page>>;
  userEmail?: string | null;
  isOpen?: boolean;
  onClose?: () => void;
}

export function Sidebar({ currentPage, setCurrentPage, userEmail, isOpen = true, onClose }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const fetchUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      setUser(user);
    };

    fetchUser();

    const { data: authListener } = supabase.auth.onAuthStateChange((event: string, session: Session | null) => {
      setUser(session?.user ?? null);
    });

    return () => {
      authListener?.subscription.unsubscribe();
    };
  }, []);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push('/login');
  };

  const initials = useMemo(
    () => user?.email?.[0]?.toUpperCase() ?? userEmail?.[0]?.toUpperCase() ?? 'U',
    [user?.email, userEmail]
  );

  return (
    <>
      <aside
        className={`fixed inset-y-0 left-0 z-40 flex w-72 flex-col border-r border-white/5 bg-sidebar/95 pb-8 text-white shadow-elevated transition-transform duration-300 ease-standard lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex h-20 items-center gap-3 px-6">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/20 text-primary">
            <Sparkles className="h-6 w-6" />
          </div>
          <div>
            <Link href="/dashboard" className="text-lg font-semibold tracking-tight">
              SMMA Morocco
            </Link>
            <p className="text-xs text-white/60">Growth Suite</p>
          </div>
        </div>

        <div className="px-6">
          <Button
            className="w-full justify-center rounded-xl border border-white/10 bg-white/10 text-sm font-semibold text-white shadow-none backdrop-blur transition hover:bg-white/20"
            onClick={() => {
              onClose?.();
              router.push('/composer');
            }}
          >
            New Campaign
          </Button>
        </div>

        <nav className="mt-8 flex-1 space-y-8 px-4">
          <div className="space-y-2">
            <p className="px-2 text-xs font-semibold uppercase tracking-[0.18em] text-white/40">Workspace</p>
            {navItems.map((item) => {
              const pageFromHref = item.href.replace(/^\//, '') as Page;
              const isActive = pathname === item.href || currentPage === pageFromHref;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => {
                    setCurrentPage?.(pageFromHref);
                    onClose?.();
                  }}
                  className={`group flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium transition-all duration-200 ease-standard ${
                    isActive ? 'bg-white/10 text-white shadow-sm' : 'text-white/70 hover:bg-white/10 hover:text-white'
                  }`}
                >
                  <item.icon
                    className={`h-5 w-5 transition ${
                      isActive ? 'text-primary' : 'text-white/60 group-hover:text-primary/80'
                    }`}
                  />
                  <span className="capitalize">{item.label}</span>
                </Link>
              );
            })}
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
            <p className="text-sm font-semibold text-white">Upgrade to Pro</p>
            <p className="mt-2 text-xs leading-5 text-white/70">
              Unlock advanced analytics, collaborative workflows, and AI-assisted campaign planning.
            </p>
            <Button
              variant="secondary"
              className="mt-4 w-full justify-center rounded-lg border border-white/10 bg-white text-sidebar hover:bg-primary hover:text-white"
            >
              Explore Plans
            </Button>
          </div>
        </nav>

        <div className="mt-8 px-6">
          <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/20 text-sm font-semibold text-white">
                {initials}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-white">{user?.email ?? userEmail ?? 'Guest'}</p>
                <p className="text-xs text-white/60">Premium Workspace</p>
              </div>
            </div>
            <Tooltip label="Sign out">
              <button
                onClick={handleSignOut}
                className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-lg border border-white/10 bg-white/10 px-4 py-2 text-sm font-medium text-white transition hover:bg-white/20"
              >
                <LogOut className="h-4 w-4" />
                Sign out
              </button>
            </Tooltip>
          </div>
        </div>
      </aside>

      {isOpen && (
        <button
          className="fixed inset-0 z-30 bg-black/30 backdrop-blur-sm transition-opacity duration-200 ease-standard lg:hidden"
          onClick={onClose}
          aria-label="Close navigation"
        />
      )}
    </>
  );
}
