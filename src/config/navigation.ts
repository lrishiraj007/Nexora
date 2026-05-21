// ═══════════════════════════════════════════════════════════
// Navigation Configuration
// Defines sidebar navigation items for the dashboard
// ═══════════════════════════════════════════════════════════

import {
  LayoutDashboard,
  CheckSquare,
  Brain,
  BarChart3,
  Settings,
  Users,
  type LucideIcon,
} from "lucide-react";

export interface NavItem {
  title: string;
  href: string;
  icon: LucideIcon;
  badge?: string;
  disabled?: boolean;
}

export interface NavSection {
  title: string;
  items: NavItem[];
}

/**
 * Returns the navigation sections for a given workspace.
 * Navigation is workspace-scoped — all links are prefixed with the workspace ID.
 */
export function getNavigation(workspaceId: string): NavSection[] {
  return [
    {
      title: "Overview",
      items: [
        {
          title: "Dashboard",
          href: `/${workspaceId}`,
          icon: LayoutDashboard,
        },
        {
          title: "Tasks",
          href: `/${workspaceId}/tasks`,
          icon: CheckSquare,
        },
        {
          title: "Knowledge Hub",
          href: `/${workspaceId}/knowledge`,
          icon: Brain,
        },
        {
          title: "Analytics",
          href: `/${workspaceId}/analytics`,
          icon: BarChart3,
        },
      ],
    },
    {
      title: "Settings",
      items: [
        {
          title: "Members",
          href: `/${workspaceId}/settings/members`,
          icon: Users,
        },
        {
          title: "Settings",
          href: `/${workspaceId}/settings`,
          icon: Settings,
        },
      ],
    },
  ];
}
