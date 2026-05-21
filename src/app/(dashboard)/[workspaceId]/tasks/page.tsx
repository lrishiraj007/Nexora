// ═══════════════════════════════════════════════════════════
// Tasks Page
// Renders the drag-and-drop Kanban board for a workspace
// ═══════════════════════════════════════════════════════════

import type { Metadata } from "next";

import { KanbanBoard } from "@/components/tasks/kanban-board";
import { PageHeader } from "@/components/shared/page-header";

export const metadata: Metadata = {
  title: "Tasks Board",
  description: "Manage and collaborate on workspace tasks",
};

interface TasksPageProps {
  params: Promise<{
    workspaceId: string;
  }>;
}

export default async function TasksPage({ params }: TasksPageProps) {
  const { workspaceId } = await params;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Task Board"
        description="Drag and drop tasks to update progress, track priority, and assign work."
      />
      <KanbanBoard />
    </div>
  );
}
