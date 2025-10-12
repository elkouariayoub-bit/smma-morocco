import { DashboardShell } from "@/components/layout/dashboard-shell";
import { Skeleton } from "@/components/ui/skeleton";

export default function AnalyticsLoading() {
  return (
    <DashboardShell
      title="Analytics"
      description="Gathering performance data"
      breadcrumbs={[{ label: 'Dashboard', href: '/composer' }, { label: 'Analytics' }]}
    >
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {[0, 1, 2].map((key) => (
          <Skeleton key={key} className="h-28 w-full" />
        ))}
      </div>
      <Skeleton className="mt-6 h-[360px] w-full" />
      <div className="grid gap-6 lg:grid-cols-2">
        <Skeleton className="h-64 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    </DashboardShell>
  );
}
