'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useSupabaseClient } from '@/lib/supabase';
import { User } from '@supabase/supabase-js';
import { useEffect, useState } from 'react';
import { PenSquare, Clock, Archive, BarChart2, LogOut } from 'lucide-react';
import type { Page } from '@/lib/types';
import type { MouseEvent } from 'react';

type NavItem = {
  href: string;
  label: string;
  icon: typeof PenSquare;
  page: Page;
};

const navItems: NavItem[] = [
  { href: '/composer', label: 'Composer', icon: PenSquare, page: 'composer' },
  { href: '/queue', label: 'Queue', icon: Clock, page: 'queue' },
  { href: '/drafts', label: 'Drafts', icon: Archive, page: 'drafts' },
  { href: '/analytics', label: 'Analytics', icon: BarChart2, page: 'analytics' },
];

type SidebarProps = {
  currentPage?: Page;
  setCurrentPage?: (page: Page) => void;
};

export function Sidebar({ currentPage, setCurrentPage }: SidebarProps = {}) {
  const pathname = usePathname();
  const router = useRouter();
  const { client: supabase } = useSupabaseClient();
  const [user, setUser] = useState<User | null>(null);

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

    const { data: authListener } = supabase.auth.onAuthStateChange((_event: string, session: { user: User | null } | null) => {
      setUser(session?.user ?? null);
    });

    return () => {
      authListener?.subscription.unsubscribe();
    };
  }, [supabase]);

  const handleSignOut = async () => {
    if (!supabase) return;
    await supabase.auth.signOut();
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
          const isActive = setCurrentPage ? currentPage === item.page : pathname === item.href;
          const handleItemClick = (event: MouseEvent<HTMLAnchorElement>) => {
            if (setCurrentPage) {
              event.preventDefault();
              setCurrentPage(item.page);
            }
          };
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-gray-900 text-white'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
              onClick={handleItemClick}
            >
              <item.icon className="w-5 h-5" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>
      {user && (
         <div className="p-4 border-t border-gray-200">
            <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center font-bold text-gray-600">
                    {user.email?.[0].toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-800 truncate">{user.email}</p>
                    <button onClick={handleSignOut} className="text-xs text-gray-500 hover:underline flex items-center gap-1">
                        <LogOut className="w-3 h-3"/>
                        Sign Out
                    </button>
                </div>
            </div>
         </div>
      )}
    </aside>
  );
}
