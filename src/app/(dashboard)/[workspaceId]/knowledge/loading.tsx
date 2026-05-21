// ═══════════════════════════════════════════════════════════
// Knowledge Hub Loading Template
// Skeleton loader matching dashboard aesthetics
// ═══════════════════════════════════════════════════════════

export default function KnowledgeLoading() {
  return (
    <div className="space-y-6 animate-pulse">
      {/* Page Header Skeleton */}
      <div className="space-y-2">
        <div className="h-8 w-48 rounded bg-muted" />
        <div className="h-4 w-96 rounded bg-muted" />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Document Library Skeleton */}
        <div className="lg:col-span-2 space-y-6 border rounded-2xl p-6 bg-card/15 backdrop-blur-md">
          <div className="h-5 w-36 rounded bg-muted mb-6" />
          {/* Dropzone skeleton */}
          <div className="h-32 rounded-xl bg-muted/30 border border-dashed border-muted" />
          {/* List items skeletons */}
          <div className="space-y-3 mt-6">
            <div className="h-16 rounded-lg bg-muted/40" />
            <div className="h-16 rounded-lg bg-muted/40" />
            <div className="h-16 rounded-lg bg-muted/40" />
          </div>
        </div>

        {/* Sidebar Skeleton */}
        <div className="border rounded-2xl p-6 bg-card/15 backdrop-blur-md h-[400px]">
          <div className="h-5 w-32 rounded bg-muted mb-6" />
          <div className="space-y-3">
            <div className="h-12 rounded-lg bg-muted/40" />
            <div className="h-12 rounded-lg bg-muted/40" />
            <div className="h-12 rounded-lg bg-muted/40" />
          </div>
        </div>
      </div>
    </div>
  );
}
