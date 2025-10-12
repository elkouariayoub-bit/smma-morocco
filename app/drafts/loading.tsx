import { DashboardShell } from "@/components/layout/dashboard-shell";
import { Skeleton } from "@/components/ui/skeleton";

export default function DraftsLoading() {
  return (
    <DashboardShell
      title="Drafts"
      description="Loading saved ideas"
      breadcrumbs={[{ label: 'Dashboard', href: '/composer' }, { label: 'Drafts' }]}
    >
      <Skeleton className="h-[320px] w-full" />
    </DashboardShell>
  );
}
