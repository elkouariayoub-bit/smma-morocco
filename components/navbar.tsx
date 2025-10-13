"use client";

import Link from "next/link";
import { useCallback, useState } from "react";
import { useRouter } from "next/navigation";

import { Button } from "./ui/button";
import { useUser } from "@/hooks/useUser";

const navLinks = [
    { href: '/dashboard', label: 'Dashboard' },
    { href: '/queue', label: 'Queue' },
    { href: '/drafts', label: 'Drafts' },
    { href: '/analytics', label: 'Analytics' },
];

export function Navbar() {
  const router = useRouter();
  const { user, refresh } = useUser();
  const [isSigningOut, setIsSigningOut] = useState(false);

  const handleSignOut = useCallback(async () => {
    if (isSigningOut) {
      return;
    }

    setIsSigningOut(true);

    try {
      const response = await fetch("/api/auth/signout", { method: "POST" });

      if (!response.ok) {
        const payload = (await response.json().catch(() => null)) as { error?: string } | null;
        const message = payload?.error ?? "Unable to sign out.";
        console.error(message);
      }
    } catch (error) {
      console.error("Failed to sign out", error);
    } finally {
      await refresh();
      router.replace("/login");
      router.refresh();
      setIsSigningOut(false);
    }
  }, [isSigningOut, refresh, router]);

  return (
    <header className="border-b bg-white/80 backdrop-blur-lg sticky top-0 z-10">
      <div className="max-w-5xl mx-auto p-3 flex items-center gap-4">
        <Link href="/" className="font-semibold text-lg">SMMA Morocco</Link>
        <nav className="ml-auto flex gap-2 text-sm">
            {navLinks.map(link => (
                <Link key={link.href} href={link.href} className="px-3 py-1.5 rounded-full hover:bg-gray-100 transition-colors">
                    {link.label}
                </Link>
            ))}
        </nav>
        <div className="ml-2">
            {user ? (
                <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-600 hidden sm:inline">{user.email}</span>
                    <Button
                      variant="secondary"
                      onClick={handleSignOut}
                      disabled={isSigningOut}
                    >
                      {isSigningOut ? "Signing out…" : "Sign Out"}
                    </Button>
                </div>
            ) : (
                <Link href="/auth/login"><Button variant="secondary">Sign In</Button></Link>
            )}
        </div>
      </div>
    </header>
  );
}
