"use client";

import { Sidebar } from "@/components/Sidebar";
import { Topbar } from "@/components/dashboard/Topbar";
import { Skeleton } from "@/components/ui/skeleton";
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [userEmail, setUserEmail] = useState<string | null>(null);

  useEffect(() => {
    const checkSession = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) {
        router.replace('/login');
      } else {
        setLoading(false);
        setUserEmail(session.user.email ?? null);
      }
    };

    checkSession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event: string, session: any) => {
      if (!session) {
        router.replace('/login');
      } else {
        setUserEmail(session.user?.email ?? null);
      }
    });

    return () => subscription?.unsubscribe();
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="flex h-24 items-center gap-4 border-b border-border/60 bg-surface px-6">
          <Skeleton className="h-12 w-12 rounded-xl" />
          <div className="space-y-2">
            <Skeleton className="h-3 w-32" />
            <Skeleton className="h-3 w-48" />
          </div>
        </div>
        <div className="grid gap-6 px-6 py-8 sm:grid-cols-2 lg:grid-cols-3">
          <Skeleton className="h-40 rounded-2xl" />
          <Skeleton className="h-40 rounded-2xl" />
          <Skeleton className="h-40 rounded-2xl" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} userEmail={userEmail} />
      <div className="lg:pl-72">
        <Topbar onToggleSidebar={() => setSidebarOpen(true)} userEmail={userEmail} />
        <main className="px-4 py-6 sm:px-6 lg:px-8">{children}</main>
      </div>
    </div>
  );
}
