'use client';

import { Sidebar } from "@/components/Sidebar";
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSupabaseClient } from '@/lib/supabase';
import { MissingEnvNotice } from '@/components/MissingEnvNotice';

export default function DashLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const { client: supabase, missingEnv } = useSupabaseClient();

  useEffect(() => {
    if (missingEnv.length || !supabase) {
      setLoading(false);
      return;
    }

    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();

      if (!session) {
        router.replace('/login');
      } else {
        setLoading(false);
      }
    };

    checkSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event: string, session: any) => {
      if (!session) {
        router.replace('/login');
      }
    });

    return () => {
      subscription?.unsubscribe();
    };

  }, [router, supabase, missingEnv]);

  if (missingEnv.length) {
    return (
      <MissingEnvNotice
        missing={missingEnv}
        title="Supabase environment variables are missing"
        description="The dashboard requires Supabase credentials to authenticate users and load data."
      />
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-600">Loading your dashboard...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar />
      {/* FIX: Add ml-64 to account for the fixed 256px (w-64) sidebar */}
      <main className="flex-1 p-4 sm:p-6 lg:p-8 ml-64">{children}</main>
    </div>
  );
}
