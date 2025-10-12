'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Bell, Menu, Search, X } from 'lucide-react';
import { Breadcrumbs } from '../ui/breadcrumbs';
import type { BreadcrumbItem } from './dashboard-shell';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { Sidebar } from '@/components/Sidebar';
import { supabase } from '@/lib/supabase';
import type { User } from '@supabase/supabase-js';

interface DashboardTopbarProps {
  breadcrumbs?: BreadcrumbItem[];
}

export function DashboardTopbar({ breadcrumbs }: DashboardTopbarProps) {
  const pathname = usePathname();
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const fetchUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
    };
    fetchUser();
  }, []);

  const initials = user?.email ? user.email.slice(0, 2).toUpperCase() : 'SM';

  return (
    <header className="fixed inset-x-0 top-0 z-30 border-b border-slate-200/80 bg-white/80 backdrop-blur supports-[backdrop-filter]:bg-white/60">
      <div className="flex h-16 items-center justify-between px-4 sm:px-8">
        <div className="flex items-center gap-3">
          <button
            type="button"
            className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 shadow-sm transition-base hover:bg-slate-100 hover:text-slate-900 lg:hidden"
            onClick={() => setIsMobileNavOpen(true)}
            aria-label="Open navigation"
          >
            <Menu className="h-5 w-5" />
          </button>
          <Breadcrumbs
            items={
              breadcrumbs ?? [
                { label: 'Dashboard', href: '/composer' },
                { label: pathname.split('/').filter(Boolean).slice(-1)[0]?.replace(/-/g, ' ') ?? 'Overview' },
              ]
            }
          />
        </div>
        <div className="hidden items-center gap-3 md:flex">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <Input className="h-10 w-64 pl-10" placeholder="Search campaigns, posts, or teammates" aria-label="Search" />
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" className="relative" title="Notifications">
            <Bell className="h-5 w-5" />
            <span className="absolute -right-1 -top-1 inline-flex h-4 w-4 items-center justify-center rounded-full bg-accent text-[10px] font-semibold text-white">3</span>
          </Button>
          <Link
            href="/settings"
            className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-900 text-sm font-semibold text-white shadow-sm transition-base hover:bg-slate-700"
            title={user?.email ?? 'Account'}
          >
            {initials}
          </Link>
        </div>
      </div>

      {isMobileNavOpen && (
        <div className="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-sm lg:hidden" role="dialog" aria-modal="true">
          <div className="absolute inset-y-0 left-0 w-72 max-w-full bg-white shadow-subtle">
            <div className="flex items-center justify-between border-b border-slate-200 px-4 py-4">
              <span className="text-sm font-semibold text-slate-900">Navigation</span>
              <Button variant="ghost" size="icon" type="button" onClick={() => setIsMobileNavOpen(false)} aria-label="Close navigation">
                <X className="h-5 w-5" />
              </Button>
            </div>
            <Sidebar className="!flex w-full flex-col !border-none !shadow-none" onNavigate={() => setIsMobileNavOpen(false)} />
          </div>
          <button type="button" className="absolute inset-0 w-full" onClick={() => setIsMobileNavOpen(false)} aria-label="Close navigation overlay" />
        </div>
      )}
    </header>
  );
}
