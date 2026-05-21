// ═══════════════════════════════════════════════════════════
// Workspace Store (Zustand)
// Tracks the active workspace and organization context
// ═══════════════════════════════════════════════════════════

import { create } from "zustand";

interface WorkspaceState {
  activeWorkspaceId: string | null;
  activeOrganizationId: string | null;
  setActiveWorkspace: (id: string | null) => void;
  setActiveOrganization: (id: string | null) => void;
}

export const useWorkspaceStore = create<WorkspaceState>()((set) => ({
  activeWorkspaceId: null,
  activeOrganizationId: null,
  setActiveWorkspace: (id) => set({ activeWorkspaceId: id }),
  setActiveOrganization: (id) => set({ activeOrganizationId: id }),
}));
