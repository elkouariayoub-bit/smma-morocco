import { DashboardShell } from "@/components/layout/dashboard-shell";
import { Skeleton } from "@/components/ui/skeleton";

export default function ComposerLoading() {
  return (
    <DashboardShell
      title="Composer"
      description="Loading your workspace"
      breadcrumbs={[{ label: 'Dashboard', href: '/composer' }, { label: 'Composer' }]}
    >
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[0, 1, 2, 3].map((key) => (
          <Skeleton key={key} className="h-28 w-full" />
        ))}
      </div>
      <div className="grid gap-6 lg:grid-cols-12">
        <div className="lg:col-span-8 space-y-6">
          <Skeleton className="h-[420px] w-full" />
          <Skeleton className="h-80 w-full" />
        </div>
        <div className="lg:col-span-4 space-y-6">
          <Skeleton className="h-72 w-full" />
          <Skeleton className="h-48 w-full" />
        </div>
      </div>
    </DashboardShell>
  );
}
