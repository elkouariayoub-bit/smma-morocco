'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { User, type Session } from '@supabase/supabase-js';
import { useEffect, useState, type Dispatch, type SetStateAction } from 'react';
import type { Page } from '../types';
import { BarChart2, Clock, LogOut, PenSquare, Sparkles, Archive } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from './ui/button';

export const NAV_ITEMS = [
  { href: '/composer', label: 'Composer', icon: PenSquare },
  { href: '/queue', label: 'Queue', icon: Clock },
  { href: '/drafts', label: 'Drafts', icon: Archive },
  { href: '/analytics', label: 'Analytics', icon: BarChart2 },
];

interface SidebarProps {
  currentPage?: Page;
  setCurrentPage?: Dispatch<SetStateAction<Page>>;
  className?: string;
  onNavigate?: () => void;
}

export function Sidebar({ currentPage, setCurrentPage, className, onNavigate }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const fetchUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
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
    onNavigate?.();
  };

  const handleNavigate = (pageFromHref: Page) => {
    setCurrentPage?.(pageFromHref);
    onNavigate?.();
  };

  const initials = user?.email ? user.email.slice(0, 2).toUpperCase() : 'SM';

  return (
    <aside
      className={cn(
        'fixed inset-y-0 left-0 z-40 hidden w-72 flex-col border-r border-slate-200/80 bg-white/90 px-6 py-8 shadow-subtle backdrop-blur-lg lg:flex',
        className,
      )}
    >
      <Link href="/composer" className="flex items-center gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-purple-500 text-lg font-semibold text-white shadow-md">
          SM
        </div>
        <div>
          <p className="text-base font-semibold text-slate-900">SMMA Morocco</p>
          <p className="text-xs text-slate-500">Social command center</p>
        </div>
      </Link>

      <nav className="mt-8 flex flex-1 flex-col gap-1">
        {NAV_ITEMS.map((item) => {
          const pageFromHref = item.href.replace(/^\//, '') as Page;
          const isActive = pathname === item.href || currentPage === pageFromHref;
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => handleNavigate(pageFromHref)}
              className={cn(
                'group flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium transition-base',
                isActive
                  ? 'bg-slate-900 text-white shadow-md'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900',
              )}
            >
              <item.icon className={cn('h-5 w-5 transition-base', isActive ? 'text-white' : 'text-slate-400 group-hover:text-slate-700')} />
              <span className="flex-1">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="mt-6 rounded-xl bg-brand-soft px-4 py-5">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white text-brand shadow-inner">
            <Sparkles className="h-5 w-5" />
          </div>
          <div className="space-y-1">
            <p className="text-sm font-semibold text-slate-900">Unlock scheduling automations</p>
            <p className="text-xs text-slate-500">Upgrade to collaborate with your team, automate approvals, and post faster.</p>
            <Button size="sm" variant="secondary" className="mt-3 w-full">Upgrade plan</Button>
          </div>
        </div>
      </div>

      {user && (
        <div className="mt-6 rounded-xl border border-slate-200 bg-white px-4 py-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-900 text-sm font-semibold text-white">
              {initials}
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-slate-900">{user.email}</p>
              <p className="text-xs text-slate-500">Growth Workspace</p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="mt-4 w-full justify-start gap-2 text-slate-500 hover:bg-slate-100 hover:text-slate-900"
            onClick={handleSignOut}
          >
            <LogOut className="h-4 w-4" /> Sign out
          </Button>
        </div>
      )}
    </aside>
  );
}
