// ═══════════════════════════════════════════════════════════
// Sidebar
// Collapsible sidebar with workspace switcher and navigation
// ═══════════════════════════════════════════════════════════

"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sparkles,
  ChevronsLeft,
  ChevronsRight,
  Plus,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { WorkspaceSwitcher } from "@/components/workspace/workspace-switcher";
import { useUIStore } from "@/stores/ui-store";
import { useKeyboardShortcut } from "@/hooks/use-keyboard-shortcut";
import { getNavigation } from "@/config/navigation";
import { cn } from "@/lib/utils";

interface SidebarProps {
  workspaces: Array<{ id: string; name: string; color: string; icon: string }>;
}

export function Sidebar({ workspaces }: SidebarProps) {
  const pathname = usePathname();
  const { sidebarCollapsed, toggleSidebar } = useUIStore();

  // ⌘B to toggle sidebar
  useKeyboardShortcut({
    key: "b",
    meta: true,
    callback: toggleSidebar,
  });

  if (pathname === "/workspaces" || pathname === "/workspaces/") {
    return null;
  }

  // Extract workspaceId from path: /[workspaceId]/...
  const segments = pathname.split("/").filter(Boolean);
  const workspaceId = segments[0] || "";

  // Get navigation items for the current workspace
  const navigation = getNavigation(workspaceId);

  return (
    <motion.aside
      initial={false}
      animate={{ width: sidebarCollapsed ? 68 : 256 }}
      transition={{ duration: 0.2, ease: "easeInOut" }}
      className="relative flex h-full flex-col border-r border-sidebar-border bg-sidebar-background"
    >
      {/* ── Logo & Collapse Toggle ─────────────────── */}
      <div className="flex h-14 items-center justify-between px-4">
        <AnimatePresence mode="wait">
          {!sidebarCollapsed && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex items-center gap-2"
            >
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600 shadow-md shadow-indigo-500/20">
                <Sparkles className="h-4 w-4 text-white" />
              </div>
              <span className="font-bold text-sm tracking-tight">
                Nexora
              </span>
            </motion.div>
          )}
        </AnimatePresence>

        <Tooltip>
          <TooltipTrigger
            render={
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-muted-foreground hover:text-foreground"
                onClick={toggleSidebar}
              >
                {sidebarCollapsed ? (
                  <ChevronsRight className="h-4 w-4" />
                ) : (
                  <ChevronsLeft className="h-4 w-4" />
                )}
              </Button>
            }
          />
          <TooltipContent side="right">
            {sidebarCollapsed ? "Expand" : "Collapse"} sidebar
            <kbd className="ml-2 rounded bg-muted px-1.5 py-0.5 text-[10px] font-medium">
              ⌘B
            </kbd>
          </TooltipContent>
        </Tooltip>
      </div>

      <Separator />

      {/* ── Workspace Switcher ─────────────────────── */}
      <div className="px-3 py-3">
        <WorkspaceSwitcher collapsed={sidebarCollapsed} workspaces={workspaces} />
      </div>

      <Separator />

      {/* ── Navigation ─────────────────────────────── */}
      <ScrollArea className="flex-1 px-3 py-3">
        {navigation.map((section) => (
          <div key={section.title} className="mb-4">
            {!sidebarCollapsed && (
              <p className="mb-1 px-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/60">
                {section.title}
              </p>
            )}
            <div className="space-y-0.5">
              {section.items.map((item) => {
                const isActive =
                  pathname === item.href ||
                  (item.href !== `/${workspaceId}` &&
                    pathname.startsWith(item.href));

                const linkContent = (
                  <Link
                    href={item.href as any}
                    className={cn(
                      "group flex items-center gap-3 rounded-lg px-2.5 py-2 text-sm font-medium transition-all duration-150",
                      isActive
                        ? "bg-sidebar-primary/10 text-sidebar-primary"
                        : "text-muted-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                    )}
                  >
                    <item.icon
                      className={cn(
                        "h-4 w-4 shrink-0 transition-colors",
                        isActive
                          ? "text-sidebar-primary"
                          : "text-muted-foreground group-hover:text-sidebar-accent-foreground"
                      )}
                    />
                    {!sidebarCollapsed && (
                      <motion.span
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="truncate"
                      >
                        {item.title}
                      </motion.span>
                    )}
                    {/* Active indicator */}
                    {isActive && (
                      <motion.div
                        layoutId="sidebar-active"
                        className="absolute left-0 h-6 w-[3px] rounded-r-full bg-sidebar-primary"
                        transition={{ type: "spring", bounce: 0.2, duration: 0.4 }}
                      />
                    )}
                  </Link>
                );

                if (sidebarCollapsed) {
                  return (
                    <Tooltip key={item.href}>
                      <TooltipTrigger render={linkContent} />
                      <TooltipContent side="right">{item.title}</TooltipContent>
                    </Tooltip>
                  );
                }

                return (
                  <div key={item.href} className="relative">
                    {linkContent}
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </ScrollArea>

      {/* ── Quick Action ───────────────────────────── */}
      <div className="border-t border-sidebar-border p-3">
        <Tooltip>
          <TooltipTrigger
            render={
              <Button
                variant="ghost"
                className={cn(
                  "w-full justify-start gap-2 text-muted-foreground hover:text-foreground",
                  sidebarCollapsed && "justify-center px-0"
                )}
                onClick={() => useUIStore.getState().setCreateTaskOpen(true)}
              >
                <Plus className="h-4 w-4" />
                {!sidebarCollapsed && <span>New Task</span>}
              </Button>
            }
          />
          {sidebarCollapsed && (
            <TooltipContent side="right">New Task</TooltipContent>
          )}
        </Tooltip>
      </div>
    </motion.aside>
  );
}
