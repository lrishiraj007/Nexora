// ═══════════════════════════════════════════════════════════
// Workspace Switcher
// Dropdown to switch between workspaces
// ═══════════════════════════════════════════════════════════

"use client";

import { useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { ChevronsUpDown, Plus, Check } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { CreateWorkspaceDialog } from "./create-workspace-dialog";

interface WorkspaceSwitcherProps {
  collapsed?: boolean;
  workspaces: Array<{ id: string; name: string; color: string; icon: string }>;
}

export function WorkspaceSwitcher({ collapsed, workspaces }: WorkspaceSwitcherProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  // Extract active workspace ID from URL path: /[workspaceId]/...
  const segments = pathname.split("/").filter(Boolean);
  const activeWorkspaceId = segments[0] || "";

  // Identify active workspace from the real fetched list, fallback gracefully
  const activeWorkspace =
    workspaces.find((w) => w.id === activeWorkspaceId) ||
    workspaces[0] ||
    { id: "", name: "No Workspace", color: "#6366f1", icon: "🚀" };

  function handleSelect(workspace: typeof activeWorkspace) {
    if (!workspace.id) return;
    setOpen(false);
    router.push(`/${workspace.id}`);
  }

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger
        render={
          <Button
            variant="ghost"
            className={cn(
              "w-full justify-start gap-2 px-2 py-1.5 h-auto hover:bg-muted/10",
              collapsed && "justify-center px-0"
            )}
          >
            <div
              className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-sm shadow-sm transition-all"
              style={{ backgroundColor: activeWorkspace.color + "20", color: activeWorkspace.color }}
            >
              {activeWorkspace.icon}
            </div>
            {!collapsed && (
              <>
                <div className="flex-1 text-left min-w-0">
                  <p className="text-sm font-medium truncate text-foreground">
                    {activeWorkspace.name}
                  </p>
                </div>
                <ChevronsUpDown className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
              </>
            )}
          </Button>
        }
      />
      <DropdownMenuContent
        className="w-[220px] bg-popover border border-border/80 shadow-xl"
        align={collapsed ? "center" : "start"}
        side={collapsed ? "right" : "bottom"}
      >
        <DropdownMenuLabel className="text-xs text-muted-foreground px-2 py-1.5">
          Workspaces
        </DropdownMenuLabel>
        
        {workspaces.length === 0 ? (
          <div className="text-[11px] text-muted-foreground px-2 py-3 text-center italic">
            No workspaces found
          </div>
        ) : (
          <div className="space-y-0.5 max-h-[200px] overflow-y-auto">
            {workspaces.map((workspace) => (
              <DropdownMenuItem
                key={workspace.id}
                onClick={() => handleSelect(workspace)}
                className="gap-2 cursor-pointer px-2 py-1.5 hover:bg-muted/20"
              >
                <div
                  className="flex h-6 w-6 shrink-0 items-center justify-center rounded text-xs transition-colors"
                  style={{ backgroundColor: workspace.color + "20", color: workspace.color }}
                >
                  {workspace.icon}
                </div>
                <span className="flex-1 truncate text-xs text-foreground font-medium">
                  {workspace.name}
                </span>
                {workspace.id === activeWorkspace.id && (
                  <Check className="h-3.5 w-3.5 text-primary shrink-0" />
                )}
              </DropdownMenuItem>
            ))}
          </div>
        )}
        
        <DropdownMenuSeparator className="bg-border/40" />

        {/* Create workspace triggers the premium dialog */}
        <CreateWorkspaceDialog
          trigger={
            <DropdownMenuItem
              onSelect={(e) => {
                e.preventDefault(); // Don't close the dropdown instantly
              }}
              className="gap-2 cursor-pointer text-xs text-muted-foreground hover:text-foreground hover:bg-muted/20 px-2 py-1.5 font-medium"
            >
              <Plus className="h-4 w-4 shrink-0 text-primary" />
              Create Workspace
            </DropdownMenuItem>
          }
        />
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
