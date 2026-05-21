"use server";

import { db } from "@/lib/db";
import { pusherServer } from "@/lib/pusher-server";
import type { ActionResult, Notification, NotificationType } from "@/types";

export async function getNotifications(userId: string): Promise<ActionResult<Notification[]>> {
  try {
    const notifications = await db.notification.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
    });

    return { success: true, data: notifications };
  } catch (error) {
    console.error("Failed to fetch notifications:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to fetch notifications",
    };
  }
}

export async function createNotification(data: {
  type: NotificationType;
  title: string;
  body?: string;
  userId: string;
  linkUrl?: string;
}): Promise<ActionResult<Notification>> {
  try {
    const notification = await db.notification.create({
      data: {
        type: data.type,
        title: data.title,
        body: data.body,
        userId: data.userId,
        linkUrl: data.linkUrl,
      },
    });

    // Realtime update via Pusher to the user's specific notification channel
    await pusherServer.trigger(`user-${data.userId}`, "notification-received", notification);

    return { success: true, data: notification };
  } catch (error) {
    console.error("Failed to create notification:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to create notification",
    };
  }
}

export async function markNotificationAsRead(
  notificationId: string,
  userId: string
): Promise<ActionResult> {
  try {
    const notification = await db.notification.findUnique({
      where: { id: notificationId },
    });

    if (!notification) {
      return { success: false, error: "Notification not found" };
    }

    if (notification.userId !== userId) {
      return { success: false, error: "Unauthorized" };
    }

    await db.notification.update({
      where: { id: notificationId },
      data: { read: true },
    });

    return { success: true, data: undefined };
  } catch (error) {
    console.error("Failed to mark notification as read:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to mark notification as read",
    };
  }
}

export async function markAllNotificationsAsRead(userId: string): Promise<ActionResult> {
  try {
    await db.notification.updateMany({
      where: { userId, read: false },
      data: { read: true },
    });

    return { success: true, data: undefined };
  } catch (error) {
    console.error("Failed to mark all notifications as read:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to mark all notifications as read",
    };
  }
}
