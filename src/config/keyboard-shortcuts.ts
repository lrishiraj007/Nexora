// ═══════════════════════════════════════════════════════════
// Keyboard Shortcuts Configuration
// Centralized shortcut definitions for the command palette
// ═══════════════════════════════════════════════════════════

export interface KeyboardShortcut {
  key: string;
  meta?: boolean; // ⌘ on Mac, Ctrl on Windows
  shift?: boolean;
  alt?: boolean;
  description: string;
  action: string;
  group: string;
}

export const keyboardShortcuts: KeyboardShortcut[] = [
  // Navigation
  {
    key: "k",
    meta: true,
    description: "Open command palette",
    action: "command-palette",
    group: "Navigation",
  },
  {
    key: "b",
    meta: true,
    description: "Toggle sidebar",
    action: "toggle-sidebar",
    group: "Navigation",
  },
  {
    key: "/",
    description: "Focus search",
    action: "focus-search",
    group: "Navigation",
  },

  // Tasks
  {
    key: "n",
    meta: true,
    description: "Create new task",
    action: "new-task",
    group: "Tasks",
  },
  {
    key: "f",
    meta: true,
    description: "Filter tasks",
    action: "filter-tasks",
    group: "Tasks",
  },

  // General
  {
    key: ".",
    meta: true,
    description: "Toggle theme",
    action: "toggle-theme",
    group: "General",
  },
];
