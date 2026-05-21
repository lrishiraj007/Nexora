// ═══════════════════════════════════════════════════════════
// Command Palette
// Global ⌘K search and navigation using cmdk
// ═══════════════════════════════════════════════════════════

"use client";

import { useRouter } from "next/navigation";
import {
  LayoutDashboard,
  CheckSquare,
  Brain,
  BarChart3,
  Settings,
  Users,
  Plus,
  Moon,
  Sun,
} from "lucide-react";
import { usePathname } from "next/navigation";
import { useTheme } from "next-themes";

import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import { useUIStore } from "@/stores/ui-store";
import { useKeyboardShortcut } from "@/hooks/use-keyboard-shortcut";

export function CommandPalette() {
  const router = useRouter();
  const pathname = usePathname();
  const { theme, setTheme } = useTheme();
  const { commandPaletteOpen, setCommandPaletteOpen, setCreateTaskOpen } =
    useUIStore();

  // Extract workspaceId from pathname
  const segments = pathname.split("/").filter(Boolean);
  const workspaceId = segments[0] || "";

  // ⌘K to toggle
  useKeyboardShortcut({
    key: "k",
    meta: true,
    callback: () => setCommandPaletteOpen(!commandPaletteOpen),
  });

  function runCommand(command: () => void) {
    setCommandPaletteOpen(false);
    command();
  }

  return (
    <CommandDialog
      open={commandPaletteOpen}
      onOpenChange={setCommandPaletteOpen}
    >
      <CommandInput placeholder="Type a command or search..." />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>

        <CommandGroup heading="Quick Actions">
          <CommandItem
            onSelect={() =>
              runCommand(() => setCreateTaskOpen(true))
            }
          >
            <Plus className="mr-2 h-4 w-4" />
            Create New Task
            <kbd className="ml-auto rounded bg-muted px-1.5 py-0.5 text-[10px] font-medium">
              ⌘N
            </kbd>
          </CommandItem>
          <CommandItem
            onSelect={() =>
              runCommand(() =>
                setTheme(theme === "dark" ? "light" : "dark")
              )
            }
          >
            {theme === "dark" ? (
              <Sun className="mr-2 h-4 w-4" />
            ) : (
              <Moon className="mr-2 h-4 w-4" />
            )}
            Toggle Theme
            <kbd className="ml-auto rounded bg-muted px-1.5 py-0.5 text-[10px] font-medium">
              ⌘.
            </kbd>
          </CommandItem>
        </CommandGroup>

        <CommandSeparator />

        <CommandGroup heading="Navigation">
          <CommandItem onSelect={() => runCommand(() => router.push((workspaceId ? `/${workspaceId}` : "/") as any))}>
            <LayoutDashboard className="mr-2 h-4 w-4" />
            Dashboard
          </CommandItem>
          <CommandItem
            onSelect={() => runCommand(() => router.push((workspaceId ? `/${workspaceId}/tasks` : "/tasks") as any))}
          >
            <CheckSquare className="mr-2 h-4 w-4" />
            Tasks
          </CommandItem>
          <CommandItem
            onSelect={() => runCommand(() => router.push((workspaceId ? `/${workspaceId}/knowledge` : "/knowledge") as any))}
          >
            <Brain className="mr-2 h-4 w-4" />
            Knowledge Hub
          </CommandItem>
          <CommandItem
            onSelect={() => runCommand(() => router.push((workspaceId ? `/${workspaceId}/analytics` : "/analytics") as any))}
          >
            <BarChart3 className="mr-2 h-4 w-4" />
            Analytics
          </CommandItem>
        </CommandGroup>

        <CommandSeparator />

        <CommandGroup heading="Settings">
          <CommandItem
            onSelect={() => runCommand(() => router.push((workspaceId ? `/${workspaceId}/settings/members` : "/settings/members") as any))}
          >
            <Users className="mr-2 h-4 w-4" />
            Team Members
          </CommandItem>
          <CommandItem
            onSelect={() => runCommand(() => router.push((workspaceId ? `/${workspaceId}/settings` : "/settings") as any))}
          >
            <Settings className="mr-2 h-4 w-4" />
            Settings
          </CommandItem>
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  );
}
