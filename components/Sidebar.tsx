'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { User, type Session } from '@supabase/supabase-js';
import { useEffect, useState, type Dispatch, type SetStateAction } from 'react';
import type { Page } from '../types';
import { PenSquare, Clock, Archive, BarChart2, LogOut, Users } from 'lucide-react';

const navItems = [
  { href: '/composer', label: 'Composer', icon: PenSquare },
  { href: '/queue', label: 'Queue', icon: Clock },
  { href: '/drafts', label: 'Drafts', icon: Archive },
  { href: '/analytics', label: 'Analytics', icon: BarChart2 },
  { href: '/team', label: 'Team', icon: Users },
];

interface SidebarProps {
  currentPage?: Page;
  setCurrentPage?: Dispatch<SetStateAction<Page>>;
}

export function Sidebar({ currentPage, setCurrentPage }: SidebarProps) {
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
