// ═══════════════════════════════════════════════════════════
// Kanban Column
// Individual column with drop zone and task cards
// ═══════════════════════════════════════════════════════════

"use client";

import { useDroppable } from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { Plus } from "lucide-react";

import { TaskCard } from "@/components/tasks/task-card";
import { Button } from "@/components/ui/button";
import { TASK_STATUS_CONFIG } from "@/lib/constants";
import { useUIStore } from "@/stores/ui-store";
import { cn } from "@/lib/utils";
import type { TaskStatus } from "@/types";

interface KanbanColumnProps {
  status: TaskStatus;
  tasks: Array<{
    id: string;
    title: string;
    description: string | null;
    status: TaskStatus;
    priority: "LOW" | "MEDIUM" | "HIGH" | "URGENT";
    assignee: { id: string; name: string; image: string | null } | null;
    comments: { id: string }[];
    tags: { tag: { id: string; name: string; color: string } }[];
    dueDate: Date | null;
  }>;
  onTaskClick: (taskId: string) => void;
}

export function KanbanColumn({ status, tasks, onTaskClick }: KanbanColumnProps) {
  const { setNodeRef, isOver } = useDroppable({ id: status });
  const config = TASK_STATUS_CONFIG[status];
  const { setCreateTaskOpen } = useUIStore();

  return (
    <div className="flex w-72 shrink-0 flex-col">
      {/* Column header */}
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div
            className="h-2.5 w-2.5 rounded-full"
            style={{ backgroundColor: config.color }}
          />
          <h3 className="text-sm font-semibold text-foreground">
            {config.label}
          </h3>
          <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-muted px-1.5 text-xs font-medium text-muted-foreground">
            {tasks.length}
          </span>
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="h-6 w-6 text-muted-foreground hover:text-foreground"
          onClick={() => setCreateTaskOpen(true, status)}
        >
          <Plus className="h-3.5 w-3.5" />
        </Button>
      </div>

      {/* Drop zone */}
      <div
        ref={setNodeRef}
        className={cn(
          "kanban-column flex flex-1 flex-col gap-2 rounded-xl border-2 border-dashed border-transparent p-1 transition-all duration-200",
          isOver && "border-primary/30 bg-primary/5"
        )}
      >
        <SortableContext
          items={tasks.map((t) => t.id)}
          strategy={verticalListSortingStrategy}
        >
          {tasks.map((task) => (
            <TaskCard key={task.id} task={task} onClick={() => onTaskClick(task.id)} />
          ))}
        </SortableContext>

        {tasks.length === 0 && (
          <div className="flex h-24 items-center justify-center rounded-lg border border-dashed border-border/50 text-xs text-muted-foreground">
            Drop tasks here
          </div>
        )}
      </div>
    </div>
  );
}
