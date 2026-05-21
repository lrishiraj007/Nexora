// ═══════════════════════════════════════════════════════════
// Empty State
// Reusable empty state with icon, title, description, and CTA
// ═══════════════════════════════════════════════════════════

import { type LucideIcon, Inbox } from "lucide-react";
import { Button } from "@/components/ui/button";

interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
}

export function EmptyState({
  icon: Icon = Inbox,
  title,
  description,
  actionLabel,
  onAction,
}: EmptyStateProps) {
  return (
    <div className="flex min-h-[300px] flex-col items-center justify-center gap-4 rounded-xl border border-dashed border-border p-8 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-muted">
        <Icon className="h-7 w-7 text-muted-foreground" />
      </div>
      <div className="space-y-1">
        <h3 className="text-lg font-semibold">{title}</h3>
        <p className="max-w-sm text-sm text-muted-foreground">{description}</p>
      </div>
      {actionLabel && onAction && (
        <Button
          onClick={onAction}
          className="mt-2 bg-gradient-to-r from-indigo-500 to-violet-600 text-white"
        >
          {actionLabel}
        </Button>
      )}
    </div>
  );
}
