import type { ReactNode } from 'react';
import { Sidebar } from '@/components/Sidebar';
import { DashboardTopbar } from './dashboard-topbar';

export type BreadcrumbItem = {
  label: string;
  href?: string;
};

interface DashboardShellProps {
  title: string;
  description?: string;
  breadcrumbs?: BreadcrumbItem[];
  actions?: ReactNode;
  children: ReactNode;
}

export function DashboardShell({ title, description, breadcrumbs, actions, children }: DashboardShellProps) {
  return (
    <div className="min-h-screen bg-surface text-slate-900">
      <Sidebar />
      <div className="lg:pl-72">
        <DashboardTopbar breadcrumbs={breadcrumbs} />
        <main className="px-4 pb-12 pt-24 sm:px-8">
          <div className="mx-auto flex max-w-6xl flex-col gap-8">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
              <div className="space-y-2">
                <h1 className="text-3xl font-semibold tracking-tight text-slate-900">{title}</h1>
                {description && <p className="text-base text-slate-500">{description}</p>}
              </div>
              {actions && <div className="flex items-center gap-3">{actions}</div>}
            </div>
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
