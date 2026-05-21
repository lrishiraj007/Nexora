// ═══════════════════════════════════════════════════════════
// Header
// Top bar with search trigger, notifications, user menu
// ═══════════════════════════════════════════════════════════

"use client";

import { Search, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { NotificationBell } from "@/components/realtime/notification-bell";
import { UserMenu } from "@/components/layout/user-menu";
import { useUIStore } from "@/stores/ui-store";
import { useWorkspaceStore } from "@/stores/workspace-store";
import { PresenceIndicator } from "@/components/realtime/presence-indicator";

export function Header() {
  const { setCommandPaletteOpen, setMobileNavOpen } = useUIStore();
  const { activeWorkspaceId } = useWorkspaceStore();

  return (
    <header className="flex h-14 items-center justify-between border-b border-border bg-background/80 px-4 backdrop-blur-md">
      {/* Left: Mobile menu + Search */}
      <div className="flex items-center gap-2">
        {/* Mobile menu trigger */}
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 md:hidden"
          onClick={() => setMobileNavOpen(true)}
        >
          <Menu className="h-4 w-4" />
        </Button>

        {/* Search trigger */}
        <button
          onClick={() => setCommandPaletteOpen(true)}
          className="flex h-8 items-center gap-2 rounded-lg border border-border bg-muted/50 px-3 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
        >
          <Search className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">Search...</span>
          <kbd className="hidden rounded bg-background px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground sm:inline">
            ⌘K
          </kbd>
        </button>
      </div>

      {/* Right: Presence + Notifications + User */}
      <div className="flex items-center gap-3">
        {activeWorkspaceId && (
          <PresenceIndicator workspaceId={activeWorkspaceId} />
        )}
        <NotificationBell />
        <UserMenu />
      </div>
    </header>
  );
}

