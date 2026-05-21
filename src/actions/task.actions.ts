// ═══════════════════════════════════════════════════════════
// Task Server Actions
// Server-side mutations for task management
// ═══════════════════════════════════════════════════════════

"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { pusherServer } from "@/lib/pusher-server";
import { logActivity } from "@/actions/activity.actions";
import { createTaskSchema, moveTaskSchema } from "@/validators/task.schema";
import type { ActionResult, TaskStatus, TaskPriority, TaskWithRelations } from "@/types";

/** Fetch all tasks in a workspace */
export async function getTasks(workspaceId: string): Promise<ActionResult<TaskWithRelations[]>> {
  try {
    const tasks = await db.task.findMany({
      where: { workspaceId },
      orderBy: { position: "asc" },
      include: {
        assignee: {
          select: { id: true, name: true, image: true },
        },
        creator: {
          select: { id: true, name: true, image: true },
        },
        comments: {
          select: { id: true },
        },
        tags: {
          include: {
            tag: true,
          },
        },
      },
    });

    return { success: true, data: tasks as TaskWithRelations[] };
  } catch (error) {
    console.error("Failed to fetch tasks:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to fetch tasks",
    };
  }
}

/** Fetch a single task by ID with relations */
export async function getTaskById(taskId: string): Promise<ActionResult<TaskWithRelations>> {
  try {
    const task = await db.task.findUnique({
      where: { id: taskId },
      include: {
        assignee: {
          select: { id: true, name: true, image: true },
        },
        creator: {
          select: { id: true, name: true, image: true },
        },
        comments: {
          select: { id: true },
        },
        tags: {
          include: {
            tag: true,
          },
        },
      },
    });

    if (!task) {
      return { success: false, error: "Task not found" };
    }

    return { success: true, data: task as TaskWithRelations };
  } catch (error) {
    console.error("Failed to fetch task:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to fetch task",
    };
  }
}

/** Create a new task in a workspace */
export async function createTask(
  data: {
    title: string;
    description?: string;
    status?: string;
    priority?: string;
    assigneeId?: string | null;
    dueDate?: string | null;
    workspaceId: string;
    creatorId: string;
  }
): Promise<ActionResult<{ id: string }>> {
  try {
    const validated = createTaskSchema.parse(data);

    // Get the highest position for the given status column
    const maxPosition = await db.task.findFirst({
      where: {
        workspaceId: validated.workspaceId,
        status: validated.status,
      },
      orderBy: { position: "desc" },
      select: { position: true },
    });

    const task = await db.task.create({
      data: {
        title: validated.title,
        description: validated.description,
        status: validated.status,
        priority: validated.priority,
        assigneeId: validated.assigneeId,
        dueDate: validated.dueDate ? new Date(validated.dueDate) : null,
        workspaceId: validated.workspaceId,
        creatorId: data.creatorId,
        position: (maxPosition?.position ?? -1) + 1,
      },
      include: {
        assignee: {
          select: { id: true, name: true, image: true },
        },
        creator: {
          select: { id: true, name: true, image: true },
        },
      },
    });

    // Create Notification if assignee is set and is not the creator
    if (task.assigneeId && task.assigneeId !== data.creatorId) {
      const notification = await db.notification.create({
        data: {
          type: "TASK_ASSIGNED",
          title: "New Task Assigned",
          body: `You have been assigned the task: "${task.title}"`,
          userId: task.assigneeId,
          linkUrl: `/${validated.workspaceId}/tasks?taskId=${task.id}`,
        },
      });

      // Send live Pusher notification to the assignee
      await pusherServer.trigger(`user-${task.assigneeId}`, "notification-received", notification);
    }

    // Log activity
    await logActivity({
      action: "CREATED",
      entityType: "task",
      entityId: task.id,
      userId: data.creatorId,
      workspaceId: validated.workspaceId,
      metadata: { title: task.title },
    });

    // Realtime broadcast to workspace
    await pusherServer.trigger(`workspace-${validated.workspaceId}`, "task-created", {
      ...task,
      comments: [],
      tags: [],
    });

    revalidatePath(`/${validated.workspaceId}/tasks`);
    return { success: true, data: { id: task.id } };
  } catch (error) {
    console.error("Failed to create task:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to create task",
    };
  }
}

/** Update a task's fields */
export async function updateTask(
  taskId: string,
  data: {
    title?: string;
    description?: string;
    status?: string;
    priority?: string;
    assigneeId?: string | null;
    dueDate?: string | null;
  },
  userId: string
): Promise<ActionResult> {
  try {
    const originalTask = await db.task.findUnique({
      where: { id: taskId },
    });

    if (!originalTask) {
      return { success: false, error: "Task not found" };
    }

    const task = await db.task.update({
      where: { id: taskId },
      data: {
        title: data.title,
        description: data.description,
        status: data.status as TaskStatus | undefined,
        priority: data.priority as TaskPriority | undefined,
        assigneeId: data.assigneeId,
        dueDate: data.dueDate ? new Date(data.dueDate) : data.dueDate === null ? null : undefined,
      },
      include: {
        assignee: {
          select: { id: true, name: true, image: true },
        },
        creator: {
          select: { id: true, name: true, image: true },
        },
        comments: { select: { id: true } },
        tags: { include: { tag: true } },
      },
    });

    // Create Notification if assignee has changed
    if (data.assigneeId && data.assigneeId !== originalTask.assigneeId && data.assigneeId !== userId) {
      const notification = await db.notification.create({
        data: {
          type: "TASK_ASSIGNED",
          title: "Task Assigned",
          body: `You have been assigned the task: "${task.title}"`,
          userId: data.assigneeId,
          linkUrl: `/${task.workspaceId}/tasks?taskId=${task.id}`,
        },
      });

      // Send live Pusher notification to the assignee
      await pusherServer.trigger(`user-${data.assigneeId}`, "notification-received", notification);
    }

    // Log activity
    if (data.status) {
      await logActivity({
        action: "STATUS_CHANGED",
        entityType: "task",
        entityId: task.id,
        userId,
        workspaceId: task.workspaceId,
        metadata: { status: data.status, title: task.title },
      });
    } else {
      await logActivity({
        action: "UPDATED",
        entityType: "task",
        entityId: task.id,
        userId,
        workspaceId: task.workspaceId,
        metadata: { title: task.title },
      });
    }

    // Realtime broadcast to workspace
    await pusherServer.trigger(`workspace-${task.workspaceId}`, "task-updated", task);

    revalidatePath(`/${task.workspaceId}/tasks`);
    return { success: true, data: undefined };
  } catch (error) {
    console.error("Failed to update task:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to update task",
    };
  }
}

/** Move a task (drag-and-drop) — update status and position */
export async function moveTask(
  data: {
    taskId: string;
    status: "TODO" | "IN_PROGRESS" | "IN_REVIEW" | "DONE";
    position: number;
  },
  userId?: string
): Promise<ActionResult> {
  try {
    const validated = moveTaskSchema.parse(data);

    const originalTask = await db.task.findUnique({
      where: { id: validated.taskId },
      select: { status: true, title: true },
    });

    const task = await db.task.update({
      where: { id: validated.taskId },
      data: {
        status: validated.status,
        position: validated.position,
      },
    });

    if (userId && originalTask && originalTask.status !== validated.status) {
      await logActivity({
        action: "STATUS_CHANGED",
        entityType: "task",
        entityId: task.id,
        userId,
        workspaceId: task.workspaceId,
        metadata: { status: validated.status, title: task.title },
      });
    }

    // Realtime broadcast of movement to other users in workspace
    await pusherServer.trigger(`workspace-${task.workspaceId}`, "task-moved", {
      taskId: task.id,
      status: task.status,
      position: task.position,
    });

    revalidatePath(`/${task.workspaceId}/tasks`);
    return { success: true, data: undefined };
  } catch (error) {
    console.error("Failed to move task:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to move task",
    };
  }
}

/** Delete a task */
export async function deleteTask(
  taskId: string,
  userId: string
): Promise<ActionResult> {
  try {
    const task = await db.task.delete({
      where: { id: taskId },
    });

    await logActivity({
      action: "DELETED",
      entityType: "task",
      entityId: taskId,
      userId,
      workspaceId: task.workspaceId,
      metadata: { title: task.title },
    });

    // Realtime broadcast of deletion to workspace
    await pusherServer.trigger(`workspace-${task.workspaceId}`, "task-deleted", {
      taskId,
    });

    revalidatePath(`/${task.workspaceId}/tasks`);
    return { success: true, data: undefined };
  } catch (error) {
    console.error("Failed to delete task:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to delete task",
    };
  }
}

