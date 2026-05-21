// ═══════════════════════════════════════════════════════════
// App Constants
// Centralized configuration values used throughout the app
// ═══════════════════════════════════════════════════════════

export const APP_NAME = "Nexora";
export const APP_DESCRIPTION =
  "AI-powered team collaboration and knowledge management platform";

// Task status labels and colors for the Kanban board
export const TASK_STATUS_CONFIG = {
  TODO: {
    label: "To Do",
    color: "#6366f1",
    bgColor: "bg-indigo-500/10",
    textColor: "text-indigo-500",
  },
  IN_PROGRESS: {
    label: "In Progress",
    color: "#f59e0b",
    bgColor: "bg-amber-500/10",
    textColor: "text-amber-500",
  },
  IN_REVIEW: {
    label: "In Review",
    color: "#8b5cf6",
    bgColor: "bg-violet-500/10",
    textColor: "text-violet-500",
  },
  DONE: {
    label: "Done",
    color: "#10b981",
    bgColor: "bg-emerald-500/10",
    textColor: "text-emerald-500",
  },
} as const;

// Task priority configuration
export const TASK_PRIORITY_CONFIG = {
  LOW: {
    label: "Low",
    color: "#6b7280",
    icon: "minus",
  },
  MEDIUM: {
    label: "Medium",
    color: "#f59e0b",
    icon: "equal",
  },
  HIGH: {
    label: "High",
    color: "#ef4444",
    icon: "chevron-up",
  },
  URGENT: {
    label: "Urgent",
    color: "#dc2626",
    icon: "alert-triangle",
  },
} as const;

// Workspace colors for the color picker
export const WORKSPACE_COLORS = [
  "#6366f1", // Indigo
  "#8b5cf6", // Violet
  "#a855f7", // Purple
  "#ec4899", // Pink
  "#ef4444", // Red
  "#f97316", // Orange
  "#f59e0b", // Amber
  "#10b981", // Emerald
  "#14b8a6", // Teal
  "#06b6d4", // Cyan
  "#3b82f6", // Blue
  "#6b7280", // Gray
] as const;

// Pagination defaults
export const DEFAULT_PAGE_SIZE = 20;
export const MAX_PAGE_SIZE = 100;

// File upload limits
export const MAX_FILE_SIZE_MB = 16;
export const ALLOWED_DOCUMENT_TYPES = [
  "application/pdf",
  "text/plain",
  "text/markdown",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
] as const;

// Realtime channel prefixes
export const PUSHER_CHANNELS = {
  WORKSPACE: "workspace",
  TASK: "task",
  USER: "user",
  PRESENCE: "presence",
} as const;

// Keyboard shortcut keys
export const SHORTCUT_KEYS = {
  COMMAND_PALETTE: "k",
  NEW_TASK: "n",
  SEARCH: "/",
  SIDEBAR_TOGGLE: "b",
} as const;
