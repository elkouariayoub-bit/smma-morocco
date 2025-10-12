import { Skeleton } from '@/components/ui/skeleton';

export default function DashboardLoading() {
  return (
    <div className="min-h-screen bg-background lg:pl-72">
      <div className="sticky top-0 z-20 border-b border-border/60 bg-surface px-4 py-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-4">
          <Skeleton className="h-10 w-10 rounded-xl" />
          <div className="space-y-2">
            <Skeleton className="h-3 w-24" />
            <Skeleton className="h-3 w-40" />
          </div>
        </div>
      </div>
      <div className="space-y-8 px-4 py-6 sm:px-6 lg:px-8">
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
          <Skeleton className="h-36 rounded-2xl" />
          <Skeleton className="h-36 rounded-2xl" />
          <Skeleton className="h-36 rounded-2xl" />
          <Skeleton className="h-36 rounded-2xl" />
        </div>
        <Skeleton className="h-[320px] rounded-2xl" />
        <Skeleton className="h-[420px] rounded-2xl" />
      </div>
    </div>
  );
}
