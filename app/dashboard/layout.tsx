"use client";

import { Sidebar } from "@/components/Sidebar";
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [hasCodeSession, setHasCodeSession] = useState(false);

  useEffect(() => {
    let isMounted = true;
    let authSubscription: { unsubscribe: () => void } | null = null;

    const checkSession = async () => {
      try {
        const response = await fetch('/auth/code', { method: 'GET' });
        if (response.ok) {
          if (!isMounted) return;
          setHasCodeSession(true);
          setLoading(false);
          return;
        }
      } catch (error) {
        console.error('Error checking code session', error);
      }

      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.replace('/login');
        return;
      }

      if (!isMounted) return;
      setLoading(false);
      const { data } = supabase.auth.onAuthStateChange((event: string, session: any) => {
        if (!session) router.replace('/login');
      });
      authSubscription = data?.subscription ?? null;
    };

    checkSession();

    return () => {
      isMounted = false;
      authSubscription?.unsubscribe();
    };
  }, [router]);

  if (loading) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center"><p>Loading your dashboard...</p></div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar hasCodeSession={hasCodeSession} />
      <main className="flex-1 p-4 sm:p-6 lg:p-8 ml-64">{children}</main>
    </div>
  );
}
