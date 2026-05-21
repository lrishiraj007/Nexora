"use server";

import { db } from "@/lib/db";
import { pusherServer } from "@/lib/pusher-server";
import type { ActionResult, CommentWithAuthor } from "@/types";

export async function createComment(data: {
  content: string;
  taskId: string;
  authorId: string;
}): Promise<ActionResult<CommentWithAuthor>> {
  try {
    const comment = await db.comment.create({
      data: {
        content: data.content,
        taskId: data.taskId,
        authorId: data.authorId,
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
      },
    });

    // Realtime update via Pusher
    await pusherServer.trigger(`task-${data.taskId}`, "comment-added", comment);

    // Also trigger activity log
    const task = await db.task.findUnique({
      where: { id: data.taskId },
      select: { workspaceId: true, title: true },
    });

    if (task) {
      await db.activityLog.create({
        data: {
          action: "COMMENTED",
          entityType: "task",
          entityId: data.taskId,
          userId: data.authorId,
          workspaceId: task.workspaceId,
          metadata: { title: task.title, commentContent: data.content },
        },
      });
    }

    return { success: true, data: comment };
  } catch (error) {
    console.error("Failed to create comment:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to create comment",
    };
  }
}

export async function deleteComment(
  commentId: string,
  userId: string
): Promise<ActionResult> {
  try {
    const comment = await db.comment.findUnique({
      where: { id: commentId },
    });

    if (!comment) {
      return { success: false, error: "Comment not found" };
    }

    if (comment.authorId !== userId) {
      return { success: false, error: "Unauthorized to delete this comment" };
    }

    await db.comment.delete({
      where: { id: commentId },
    });

    // Realtime update via Pusher
    await pusherServer.trigger(`task-${comment.taskId}`, "comment-deleted", {
      commentId,
      taskId: comment.taskId,
    });

    return { success: true, data: undefined };
  } catch (error) {
    console.error("Failed to delete comment:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to delete comment",
    };
  }
}

export async function getComments(taskId: string): Promise<ActionResult<CommentWithAuthor[]>> {
  try {
    const comments = await db.comment.findMany({
      where: { taskId },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
      },
      orderBy: { createdAt: "asc" },
    });

    return { success: true, data: comments };
  } catch (error) {
    console.error("Failed to fetch comments:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to fetch comments",
    };
  }
}
