// ═══════════════════════════════════════════════════════════
// Activity Log Server Actions
// Server-side actions for recording and fetching team activity
// ═══════════════════════════════════════════════════════════

"use server";

import { db } from "@/lib/db";
import type { ActionResult, ActivityLogWithUser } from "@/types";
import { ActivityAction } from "@prisma/client";

export interface CreateActivityInput {
  action: ActivityAction;
  entityType: string;
  entityId: string;
  metadata?: any;
  userId: string;
  workspaceId: string;
}

/** Record a new team activity log in the database */
export async function logActivity(data: CreateActivityInput): Promise<void> {
  try {
    await db.activityLog.create({
      data: {
        action: data.action,
        entityType: data.entityType,
        entityId: data.entityId,
        metadata: data.metadata || undefined,
        userId: data.userId,
        workspaceId: data.workspaceId,
      },
    });
  } catch (error) {
    console.error("Failed to record activity log:", error);
  }
}

/** Fetch recent activity logs for a given workspace */
export async function getActivityLogs(
  workspaceId: string,
  limit = 15
): Promise<ActionResult<ActivityLogWithUser[]>> {
  try {
    const logs = await db.activityLog.findMany({
      where: { workspaceId },
      orderBy: { createdAt: "desc" },
      take: limit,
      include: {
        user: {
          select: { id: true, name: true, image: true },
        },
      },
    });

    return { success: true, data: logs as ActivityLogWithUser[] };
  } catch (error) {
    console.error("Failed to fetch activity logs:", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to load recent activity feed",
    };
  }
}
