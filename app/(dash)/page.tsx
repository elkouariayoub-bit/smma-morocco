"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function DashboardPage() {
  const router = useRouter();

  useEffect(() => {
    // client-side redirect to the default dashboard subpage
    router.replace('/composer');
  }, [router]);

  // Render a tiny, invisible element so Next treats this as a client page and
  // generates the client-reference-manifest file during the build.
  return <div aria-hidden style={{ display: 'none' }} />;
}
