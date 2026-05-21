// ═══════════════════════════════════════════════════════════
// Task Card
// Draggable task card for the Kanban board
// ═══════════════════════════════════════════════════════════

"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { format } from "date-fns";
import {
  Calendar,
  MessageSquare,
  GripVertical,
} from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { TASK_PRIORITY_CONFIG } from "@/lib/constants";
import { cn } from "@/lib/utils";
import type { TaskStatus } from "@/types";

interface TaskCardProps {
  task: {
    id: string;
    title: string;
    description?: string | null;
    status: TaskStatus;
    priority: "LOW" | "MEDIUM" | "HIGH" | "URGENT";
    assignee: { id: string; name: string; image: string | null } | null;
    comments: { id: string }[];
    tags: { tag: { id: string; name: string; color: string } }[];
    dueDate: Date | null;
  };
  isDragging?: boolean;
  onClick?: () => void;
}

export function TaskCard({ task, isDragging, onClick }: TaskCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging: isSortableDragging,
  } = useSortable({ id: task.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const priorityConfig = TASK_PRIORITY_CONFIG[task.priority];
  const isOverdue =
    task.dueDate && new Date(task.dueDate) < new Date() && task.status !== "DONE";

  const initials = task.assignee?.name
    ?.split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <div
      ref={setNodeRef}
      style={style}
      onClick={onClick}
      className={cn(
        "group relative rounded-lg border border-border/60 bg-card p-3.5 shadow-sm transition-all duration-200",
        "hover:border-border hover:shadow-md cursor-grab active:cursor-grabbing",
        isDragging && "task-card-dragging",
        isSortableDragging && "opacity-50"
      )}
      {...attributes}
      {...listeners}
    >
      {/* Grip handle — visible on hover */}
      <div className="absolute -left-0.5 top-1/2 -translate-y-1/2 opacity-0 transition-opacity group-hover:opacity-60">
        <GripVertical className="h-4 w-4 text-muted-foreground" />
      </div>

      {/* Tags */}
      {task.tags.length > 0 && (
        <div className="mb-2 flex flex-wrap gap-1">
          {task.tags.map(({ tag }) => (
            <span
              key={tag.id}
              className="inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium"
              style={{
                backgroundColor: tag.color + "15",
                color: tag.color,
              }}
            >
              {tag.name}
            </span>
          ))}
        </div>
      )}

      {/* Title */}
      <p className="mb-2 text-sm font-medium leading-snug text-foreground line-clamp-2">
        {task.title}
      </p>

      {/* Description preview */}
      {task.description && (
        <p className="mb-3 text-xs text-muted-foreground line-clamp-2">
          {task.description}
        </p>
      )}

      {/* Footer: Priority, due date, comments, assignee */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {/* Priority */}
          <Badge
            variant="secondary"
            className="h-5 gap-1 px-1.5 text-[10px] font-medium"
            style={{
              color: priorityConfig.color,
              backgroundColor: priorityConfig.color + "15",
            }}
          >
            {priorityConfig.label}
          </Badge>

          {/* Due date */}
          {task.dueDate && (
            <span
              className={cn(
                "flex items-center gap-1 text-[10px]",
                isOverdue ? "text-destructive" : "text-muted-foreground"
              )}
            >
              <Calendar className="h-3 w-3" />
              {format(new Date(task.dueDate), "MMM d")}
            </span>
          )}

          {/* Comment count */}
          {task.comments.length > 0 && (
            <span className="flex items-center gap-1 text-[10px] text-muted-foreground">
              <MessageSquare className="h-3 w-3" />
              {task.comments.length}
            </span>
          )}
        </div>

        {/* Assignee avatar */}
        {task.assignee && (
          <Avatar className="h-6 w-6 border border-background">
            <AvatarImage src={task.assignee.image || ""} />
            <AvatarFallback className="bg-gradient-to-br from-indigo-400 to-violet-500 text-[9px] font-bold text-white">
              {initials}
            </AvatarFallback>
          </Avatar>
        )}
      </div>
    </div>
  );
}
