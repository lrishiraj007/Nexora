// ═══════════════════════════════════════════════════════════
// Loading Skeleton
// Reusable skeleton components for loading states
// ═══════════════════════════════════════════════════════════

import { Skeleton } from "@/components/ui/skeleton";

export function CardSkeleton() {
  return (
    <div className="rounded-xl border border-border p-6 space-y-3">
      <Skeleton className="h-4 w-[60%]" />
      <Skeleton className="h-3 w-[80%]" />
      <Skeleton className="h-3 w-[40%]" />
    </div>
  );
}

export function TaskCardSkeleton() {
  return (
    <div className="rounded-lg border border-border bg-card p-4 space-y-3">
      <div className="flex items-center gap-2">
        <Skeleton className="h-5 w-14 rounded-full" />
        <Skeleton className="h-5 w-14 rounded-full" />
      </div>
      <Skeleton className="h-4 w-[80%]" />
      <Skeleton className="h-3 w-[60%]" />
      <div className="flex items-center justify-between pt-2">
        <Skeleton className="h-6 w-6 rounded-full" />
        <Skeleton className="h-3 w-16" />
      </div>
    </div>
  );
}

export function KanbanSkeleton() {
  return (
    <div className="flex gap-6 overflow-x-auto pb-4">
      {[1, 2, 3, 4].map((col) => (
        <div key={col} className="w-72 shrink-0 space-y-3">
          <div className="flex items-center gap-2">
            <Skeleton className="h-5 w-24" />
            <Skeleton className="h-5 w-6 rounded-full" />
          </div>
          {[1, 2, 3].map((card) => (
            <TaskCardSkeleton key={card} />
          ))}
        </div>
      ))}
    </div>
  );
}

export function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <CardSkeleton key={i} />
        ))}
      </div>
      <div className="grid gap-6 md:grid-cols-2">
        <div className="rounded-xl border border-border p-6">
          <Skeleton className="h-5 w-32 mb-4" />
          <Skeleton className="h-[200px] w-full rounded-lg" />
        </div>
        <div className="rounded-xl border border-border p-6">
          <Skeleton className="h-5 w-32 mb-4" />
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex items-center gap-3">
                <Skeleton className="h-8 w-8 rounded-full" />
                <div className="flex-1 space-y-1">
                  <Skeleton className="h-3 w-[60%]" />
                  <Skeleton className="h-2 w-[40%]" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export function PageHeaderSkeleton() {
  return (
    <div className="space-y-2 mb-6">
      <Skeleton className="h-8 w-48" />
      <Skeleton className="h-4 w-72" />
    </div>
  );
}
