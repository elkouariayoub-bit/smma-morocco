"use client";

import { Sidebar } from "@/components/Sidebar";
import { useEffect, useState, type ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { DashboardTopbar } from '@/components/layout/dashboard-topbar';

export default function DashboardLayout({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.replace('/login');
      } else {
        setLoading(false);
      }
    };
    checkSession();
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event: string, session: any) => {
      if (!session) router.replace('/login');
    });
    return () => subscription?.unsubscribe();
  }, [router]);

  if (loading) return (
    <div className="min-h-screen bg-surface flex items-center justify-center"><p className="text-slate-500">Loading your dashboard…</p></div>
  );

  return (
    <div className="min-h-screen bg-surface">
      <Sidebar />
      <div className="lg:pl-72">
        <DashboardTopbar />
        <main className="px-4 pb-12 pt-24 sm:px-8">{children}</main>
      </div>
    </div>
  );
}
