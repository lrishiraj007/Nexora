// ═══════════════════════════════════════════════════════════
// Dashboard Server Actions
// Server-side queries for workspace analytics & insights
// ═══════════════════════════════════════════════════════════

"use server";

import { db } from "@/lib/db";
import type { ActionResult } from "@/types";
import { TaskStatus, TaskPriority } from "@prisma/client";
import { generateText } from "ai";
import { defaultModel } from "@/lib/ai";

export interface TaskStatusCount {
  status: TaskStatus;
  count: number;
}

export interface TaskPriorityCount {
  priority: TaskPriority;
  count: number;
}

export interface DailyProductivity {
  date: string;
  completed: number;
  created: number;
}

export interface MemberStat {
  id: string;
  name: string;
  image: string | null;
  assignedCount: number;
  completedCount: number;
}

export interface DashboardStats {
  totalTasks: number;
  completedTasks: number;
  inProgressTasks: number;
  inReviewTasks: number;
  todoTasks: number;
  overdueTasks: number;
  documentCount: number;
  memberCount: number;
  priorityCounts: TaskPriorityCount[];
  statusCounts: TaskStatusCount[];
  productivityTrend: DailyProductivity[];
  memberStats: MemberStat[];
}

/** Fetch aggregated analytics for the workspace dashboard */
export async function getDashboardStats(
  workspaceId: string
): Promise<ActionResult<DashboardStats>> {
  try {
    // 1. Core Task Counts
    const [
      totalTasks,
      todoTasks,
      inProgressTasks,
      inReviewTasks,
      completedTasks,
      overdueTasks,
    ] = await Promise.all([
      db.task.count({ where: { workspaceId } }),
      db.task.count({ where: { workspaceId, status: TaskStatus.TODO } }),
      db.task.count({ where: { workspaceId, status: TaskStatus.IN_PROGRESS } }),
      db.task.count({ where: { workspaceId, status: TaskStatus.IN_REVIEW } }),
      db.task.count({ where: { workspaceId, status: TaskStatus.DONE } }),
      db.task.count({
        where: {
          workspaceId,
          status: { not: TaskStatus.DONE },
          dueDate: { lt: new Date() },
        },
      }),
    ]);

    // 2. Ingested Documents
    const documentCount = await db.document.count({
      where: { workspaceId },
    });

    // 3. Organization Members
    const workspace = await db.workspace.findUnique({
      where: { id: workspaceId },
      select: { organizationId: true },
    });

    const memberCount = workspace
      ? await db.member.count({
          where: { organizationId: workspace.organizationId },
        })
      : 0;

    // 4. Breakdown by Priority
    const priorityCountsRaw = await db.task.groupBy({
      by: ["priority"],
      where: { workspaceId },
      _count: { id: true },
    });

    const priorityCounts: TaskPriorityCount[] = Object.values(TaskPriority).map(
      (priority) => ({
        priority,
        count: priorityCountsRaw.find((p) => p.priority === priority)?._count.id || 0,
      })
    );

    // 5. Breakdown by Status
    const statusCounts: TaskStatusCount[] = [
      { status: TaskStatus.TODO, count: todoTasks },
      { status: TaskStatus.IN_PROGRESS, count: inProgressTasks },
      { status: TaskStatus.IN_REVIEW, count: inReviewTasks },
      { status: TaskStatus.DONE, count: completedTasks },
    ];

    // 6. Productivity Trend (Last 7 Days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    sevenDaysAgo.setHours(0, 0, 0, 0);

    const recentTasks = await db.task.findMany({
      where: {
        workspaceId,
        OR: [
          { createdAt: { gte: sevenDaysAgo } },
          { updatedAt: { gte: sevenDaysAgo } },
        ],
      },
      select: {
        createdAt: true,
        updatedAt: true,
        status: true,
      },
    });

    const productivityTrend: DailyProductivity[] = [];
    const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
      const dayStart = new Date(d);
      dayStart.setHours(0, 0, 0, 0);
      const dayEnd = new Date(d);
      dayEnd.setHours(23, 59, 59, 999);

      // Tasks created on this day
      const created = recentTasks.filter(
        (t) => t.createdAt >= dayStart && t.createdAt <= dayEnd
      ).length;

      // Tasks marked Done on this day (simplified based on updatedAt for DONE tasks)
      const completed = recentTasks.filter(
        (t) =>
          t.status === TaskStatus.DONE &&
          t.updatedAt >= dayStart &&
          t.updatedAt <= dayEnd
      ).length;

      productivityTrend.push({
        date: dateStr,
        completed,
        created,
      });
    }

    // 7. Member Statistics
    let memberStats: MemberStat[] = [];
    if (workspace) {
      const dbMembers = await db.member.findMany({
        where: { organizationId: workspace.organizationId },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              image: true,
            },
          },
        },
      });

      const memberIds = dbMembers.map((m) => m.user.id);
      const userTasks = await db.task.findMany({
        where: {
          workspaceId,
          assigneeId: { in: memberIds },
        },
        select: {
          assigneeId: true,
          status: true,
        },
      });

      memberStats = dbMembers.map((m) => {
        const assignedTasks = userTasks.filter((t) => t.assigneeId === m.user.id);
        const completed = assignedTasks.filter((t) => t.status === TaskStatus.DONE).length;
        return {
          id: m.user.id,
          name: m.user.name,
          image: m.user.image,
          assignedCount: assignedTasks.length,
          completedCount: completed,
        };
      });
    }

    return {
      success: true,
      data: {
        totalTasks,
        todoTasks,
        inProgressTasks,
        inReviewTasks,
        completedTasks,
        overdueTasks,
        documentCount,
        memberCount,
        priorityCounts,
        statusCounts,
        productivityTrend,
        memberStats,
      },
    };
  } catch (error) {
    console.error("Failed to generate dashboard statistics:", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to load dashboard statistics",
    };
  }
}

/** Generate AI project manager insights for the workspace */
export async function getAIInsights(
  workspaceId: string
): Promise<ActionResult<string>> {
  try {
    // 1. Fetch current tasks for analysis
    const tasks = await db.task.findMany({
      where: { workspaceId },
      select: {
        title: true,
        status: true,
        priority: true,
        dueDate: true,
      },
    });

    const total = tasks.length;
    const completed = tasks.filter((t) => t.status === TaskStatus.DONE).length;
    const overdue = tasks.filter(
      (t) =>
        t.status !== TaskStatus.DONE && t.dueDate && t.dueDate < new Date()
    ).length;
    const highPriority = tasks.filter(
      (t) =>
        t.priority === TaskPriority.HIGH || t.priority === TaskPriority.URGENT
    ).length;

    if (total === 0) {
      return {
        success: true,
        data: "### AI Project Health Overview\n\nNo task data is currently available in this workspace. Add some tasks on the Kanban Board, and I will analyze your team metrics and suggest optimizations!",
      };
    }

    const prompt = `You are a professional AI Project Manager and agile coach.
Analyze the following workspace metrics:
- Total tasks: ${total}
- Completed tasks: ${completed}
- Overdue tasks: ${overdue}
- High/Urgent priority tasks: ${highPriority}

Active Task Details:
${tasks
  .map(
    (t) =>
      `- ${t.title} [Status: ${t.status}, Priority: ${t.priority}, Due: ${
        t.dueDate ? t.dueDate.toISOString().split("T")[0] : "None"
      }]`
  )
  .join("\n")}

Provide an elegant project health report in Markdown under 150 words:
1. **Workspace Health Index**: Give a percentage based on overdue tasks and completions, with a brief status (e.g. "Healthy", "Needs Attention").
2. **Current Bottlenecks**: Pinpoint overdue or high-priority tasks holding up velocity.
3. **Productivity Recommendations**: Give 2 actionable bullet points on reassigning or prioritizing.
Be direct, professional, and clear.`;

    const { text } = await generateText({
      model: defaultModel,
      prompt,
    });

    return { success: true, data: text };
  } catch (error) {
    console.error("Failed to generate AI insights:", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to generate AI insights",
    };
  }
}
