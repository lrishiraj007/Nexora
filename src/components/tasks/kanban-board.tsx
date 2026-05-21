// ═══════════════════════════════════════════════════════════
// Kanban Board
// Full drag-and-drop task board using @dnd-kit
// ═══════════════════════════════════════════════════════════

"use client";

import { useState, useMemo, useCallback, useEffect } from "react";
import { useParams } from "next/navigation";
import {
  DndContext,
  DragOverlay,
  closestCorners,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
  type DragOverEvent,
} from "@dnd-kit/core";
import { sortableKeyboardCoordinates } from "@dnd-kit/sortable";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

import { KanbanColumn } from "@/components/tasks/kanban-column";
import { TaskCard } from "@/components/tasks/task-card";
import { TaskDetailPanel } from "@/components/tasks/task-detail-panel";
import { CreateTaskDialog } from "@/components/tasks/create-task-dialog";
import { TASK_STATUS_CONFIG } from "@/lib/constants";
import { getTasks, moveTask } from "@/actions/task.actions";
import { useSession } from "@/lib/auth-client";
import { useRealtime } from "@/hooks/use-realtime";
import type { TaskStatus, TaskWithRelations } from "@/types";

const columns = Object.keys(TASK_STATUS_CONFIG) as TaskStatus[];

export function KanbanBoard() {
  const params = useParams();
  const workspaceId = params.workspaceId as string;
  const { data: session } = useSession();
  const currentUserId = session?.user?.id;

  const [tasks, setTasks] = useState<TaskWithRelations[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTask, setActiveTask] = useState<TaskWithRelations | null>(null);
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // 1. Fetch real tasks from workspace DB
  const loadTasks = useCallback(async () => {
    if (!workspaceId) return;
    setIsLoading(true);
    const res = await getTasks(workspaceId);
    if (res.success) {
      setTasks(res.data);
    } else {
      toast.error("Failed to load tasks");
    }
    setIsLoading(false);
  }, [workspaceId]);

  useEffect(() => {
    loadTasks();
  }, [loadTasks]);

  // 2. Hook up workspace real-time Pusher events
  useRealtime<any>(
    workspaceId ? `workspace-${workspaceId}` : null,
    "task-created",
    (newTask) => {
      setTasks((prev) => {
        if (prev.some((t) => t.id === newTask.id)) return prev;
        return [...prev, newTask];
      });
    }
  );

  useRealtime<any>(
    workspaceId ? `workspace-${workspaceId}` : null,
    "task-updated",
    (updatedTask) => {
      setTasks((prev) =>
        prev.map((t) => (t.id === updatedTask.id ? { ...t, ...updatedTask } : t))
      );
    }
  );

  useRealtime<{ taskId: string; status: TaskStatus; position: number }>(
    workspaceId ? `workspace-${workspaceId}` : null,
    "task-moved",
    (data) => {
      setTasks((prev) =>
        prev.map((t) =>
          t.id === data.taskId
            ? { ...t, status: data.status, position: data.position }
            : t
        )
      );
    }
  );

  useRealtime<{ taskId: string }>(
    workspaceId ? `workspace-${workspaceId}` : null,
    "task-deleted",
    (data) => {
      setTasks((prev) => prev.filter((t) => t.id !== data.taskId));
      if (selectedTaskId === data.taskId) {
        setSelectedTaskId(null);
      }
    }
  );

  // Group tasks by status
  const tasksByStatus = useMemo(() => {
    const grouped: Record<string, TaskWithRelations[]> = {};
    for (const col of columns) {
      grouped[col] = tasks
        .filter((t) => t.status === col)
        .sort((a, b) => a.position - b.position);
    }
    return grouped;
  }, [tasks]);

  const handleDragStart = useCallback(
    (event: DragStartEvent) => {
      const task = tasks.find((t) => t.id === event.active.id);
      if (task) setActiveTask(task);
    },
    [tasks]
  );

  const handleDragOver = useCallback(
    (event: DragOverEvent) => {
      const { active, over } = event;
      if (!over) return;

      const activeId = active.id as string;
      const overId = over.id as string;

      // Check if we're dragging over a column
      const overColumn = columns.find((col) => col === overId);
      if (overColumn) {
        setTasks((prev) =>
          prev.map((t) =>
            t.id === activeId ? { ...t, status: overColumn } : t
          )
        );
        return;
      }

      // Dragging over another task
      const overTask = tasks.find((t) => t.id === overId);
      if (overTask) {
        setTasks((prev) =>
          prev.map((t) =>
            t.id === activeId ? { ...t, status: overTask.status } : t
          )
        );
      }
    },
    [tasks]
  );

  const handleDragEnd = useCallback(
    async (event: DragEndEvent) => {
      setActiveTask(null);
      const { active, over } = event;
      if (!over) return;

      const activeId = active.id as string;
      const overId = over.id as string;

      const draggedTask = tasks.find((t) => t.id === activeId);
      if (!draggedTask) return;

      // Determine the new status
      let newStatus = draggedTask.status;
      const overColumn = columns.find((col) => col === overId);
      if (overColumn) {
        newStatus = overColumn;
      } else {
        const overTask = tasks.find((t) => t.id === overId);
        if (overTask) {
          newStatus = overTask.status;
        }
      }

      // Calculate the new position in the new column
      const columnTasks = tasks
        .filter((t) => t.status === newStatus && t.id !== activeId)
        .sort((a, b) => a.position - b.position);

      let newPositionIndex = columnTasks.length;
      if (!overColumn) {
        const overTaskIndex = columnTasks.findIndex((t) => t.id === overId);
        if (overTaskIndex !== -1) {
          newPositionIndex = overTaskIndex;
        }
      }

      // Call moveTask server action
      const res = await moveTask({
        taskId: activeId,
        status: newStatus,
        position: newPositionIndex,
      }, currentUserId);

      if (res.success) {
        toast.success(`Moved "${draggedTask.title}" to ${TASK_STATUS_CONFIG[newStatus].label}`);
      } else {
        toast.error(res.error || "Failed to save card movement");
        loadTasks();
      }
    },
    [tasks, loadTasks, currentUserId]
  );

  const handleTaskClick = useCallback((taskId: string) => {
    setSelectedTaskId(taskId);
  }, []);

  if (isLoading) {
    return (
      <div className="flex h-[450px] items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 text-primary animate-spin" />
          <p className="text-xs text-muted-foreground font-medium">Loading workspace board...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
      >
        <div className="flex gap-5 overflow-x-auto pb-4">
          {columns.map((status) => (
            <KanbanColumn
              key={status}
              status={status}
              tasks={tasksByStatus[status] || []}
              onTaskClick={handleTaskClick}
            />
          ))}
        </div>

        {/* Drag overlay — renders the floating card */}
        <DragOverlay>
          {activeTask ? <TaskCard task={activeTask} isDragging /> : null}
        </DragOverlay>
      </DndContext>

      {/* Create Task Dialog */}
      <CreateTaskDialog />

      {/* Task Details Side-sheet */}
      {selectedTaskId && currentUserId && (
        <TaskDetailPanel
          taskId={selectedTaskId}
          workspaceId={workspaceId}
          currentUserId={currentUserId}
          onClose={() => setSelectedTaskId(null)}
          onTaskUpdated={loadTasks}
          onTaskDeleted={loadTasks}
        />
      )}
    </>
  );
}

