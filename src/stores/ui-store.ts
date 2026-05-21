// ═══════════════════════════════════════════════════════════
// UI Store (Zustand)
// Global UI state: sidebar, modals, command palette, theme
// ═══════════════════════════════════════════════════════════

import { create } from "zustand";
import { persist } from "zustand/middleware";

interface UIState {
  // Sidebar
  sidebarCollapsed: boolean;
  toggleSidebar: () => void;
  setSidebarCollapsed: (collapsed: boolean) => void;

  // Command palette
  commandPaletteOpen: boolean;
  setCommandPaletteOpen: (open: boolean) => void;

  // Create task dialog
  createTaskOpen: boolean;
  createTaskStatus: "TODO" | "IN_PROGRESS" | "IN_REVIEW" | "DONE" | null;
  setCreateTaskOpen: (open: boolean, status?: "TODO" | "IN_PROGRESS" | "IN_REVIEW" | "DONE" | null) => void;

  // Mobile nav
  mobileNavOpen: boolean;
  setMobileNavOpen: (open: boolean) => void;
}

export const useUIStore = create<UIState>()(
  persist(
    (set) => ({
      // Sidebar — persisted to localStorage
      sidebarCollapsed: false,
      toggleSidebar: () =>
        set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),
      setSidebarCollapsed: (collapsed) =>
        set({ sidebarCollapsed: collapsed }),

      // Command palette — not persisted
      commandPaletteOpen: false,
      setCommandPaletteOpen: (open) => set({ commandPaletteOpen: open }),

      // Create task dialog
      createTaskOpen: false,
      createTaskStatus: null,
      setCreateTaskOpen: (open, status = null) =>
        set({ createTaskOpen: open, createTaskStatus: open ? status : null }),

      // Mobile nav
      mobileNavOpen: false,
      setMobileNavOpen: (open) => set({ mobileNavOpen: open }),
    }),
    {
      name: "kh-ui-store",
      // Only persist sidebar state
      partialize: (state) => ({
        sidebarCollapsed: state.sidebarCollapsed,
      }),
    }
  )
);
