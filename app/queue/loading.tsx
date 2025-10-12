import { DashboardShell } from "@/components/layout/dashboard-shell";
import { Skeleton } from "@/components/ui/skeleton";

export default function QueueLoading() {
  return (
    <DashboardShell
      title="Queue"
      description="Checking upcoming posts"
      breadcrumbs={[{ label: 'Dashboard', href: '/composer' }, { label: 'Queue' }]}
    >
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[0, 1, 2, 3].map((key) => (
          <Skeleton key={key} className="h-28 w-full" />
        ))}
      </div>
      <Skeleton className="mt-6 h-[420px] w-full" />
    </DashboardShell>
  );
}
