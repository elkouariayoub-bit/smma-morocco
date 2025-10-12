'use client';

import Link from 'next/link';
import { useMemo } from 'react';
import { usePathname } from 'next/navigation';
import { Bell, HelpCircle, Menu, Search } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tooltip } from '@/components/ui/tooltip';

interface TopbarProps {
  onToggleSidebar: () => void;
  userEmail?: string | null;
}

export function Topbar({ onToggleSidebar, userEmail }: TopbarProps) {
  const pathname = usePathname();

  const breadcrumbs = useMemo(() => {
    if (!pathname) return [];
    const segments = pathname.split('/').filter(Boolean);
    return segments.map((segment, index) => {
      const href = '/' + segments.slice(0, index + 1).join('/');
      const label = segment.replace(/-/g, ' ');
      return { href, label };
    });
  }, [pathname]);

  const initials = userEmail?.[0]?.toUpperCase() ?? 'U';

  return (
    <header className="sticky top-0 z-30 border-b border-border/60 bg-surface/80 backdrop-blur-xl">
      <div className="flex flex-col gap-4 px-4 py-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-transparent bg-surface shadow-sm hover:border-primary/40 lg:hidden"
            onClick={onToggleSidebar}
            aria-label="Open navigation"
          >
            <Menu className="h-5 w-5" />
          </Button>

          <div className="hidden lg:flex lg:flex-col">
            <span className="text-xs font-semibold uppercase tracking-[0.18em] text-muted">Dashboard</span>
            <div className="flex items-center gap-2 text-sm font-medium text-muted">
              <Link href="/dashboard" className="transition-colors hover:text-foreground">
                Home
              </Link>
              {breadcrumbs.slice(1).map((crumb) => (
                <div key={crumb.href} className="flex items-center gap-2">
                  <span className="text-xs text-muted/60">/</span>
                  <Link href={crumb.href} className="capitalize transition-colors hover:text-foreground">
                    {crumb.label}
                  </Link>
                </div>
              ))}
            </div>
          </div>

          <div className="ml-auto flex flex-1 items-center gap-3 lg:max-w-md">
            <div className="relative hidden w-full items-center gap-2 rounded-xl border border-transparent bg-surface shadow-sm sm:flex">
              <Search className="ml-3 h-4 w-4 text-muted" />
              <Input className="h-11 border-none bg-transparent pl-10 text-sm shadow-none focus:ring-0" placeholder="Search campaigns, posts, or team" />
            </div>

            <Tooltip label="Help Center">
              <Button variant="ghost" className="hidden h-10 w-10 items-center justify-center rounded-xl border border-transparent bg-surface shadow-sm hover:border-primary/40 sm:inline-flex">
                <HelpCircle className="h-5 w-5" />
              </Button>
            </Tooltip>

            <Tooltip label="Notifications">
              <Button variant="ghost" className="h-10 w-10 rounded-xl border border-transparent bg-surface shadow-sm hover:border-primary/40">
                <Bell className="h-5 w-5" />
              </Button>
            </Tooltip>

            <div className="flex items-center gap-3 rounded-xl border border-border/70 bg-surface px-3 py-2 shadow-sm">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
                {initials}
              </div>
              <div className="hidden text-left text-sm leading-tight sm:block">
                <p className="font-semibold text-foreground">{userEmail ?? 'Guest'}</p>
                <p className="text-xs text-muted">Workspace Admin</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
