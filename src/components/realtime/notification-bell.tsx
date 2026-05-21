// ═══════════════════════════════════════════════════════════
// Notification Bell
// Header notification indicator with unread count
// ═══════════════════════════════════════════════════════════

"use client";

import { useEffect } from "react";
import { Bell } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useNotificationStore } from "@/stores/notification-store";
import { cn } from "@/lib/utils";
import { useSession } from "@/lib/auth-client";
import { useRealtime } from "@/hooks/use-realtime";
import {
  getNotifications,
  markAllNotificationsAsRead,
  markNotificationAsRead,
} from "@/actions/notification.actions";
import type { Notification } from "@/types";

export function NotificationBell() {
  const router = useRouter();
  const { data: session } = useSession();
  const userId = session?.user?.id;

  const {
    unreadCount,
    notifications,
    isOpen,
    setIsOpen,
    markAllAsRead,
    markAsRead,
    addNotification,
    setNotifications,
  } = useNotificationStore();

  // 1. Fetch initial notifications
  useEffect(() => {
    if (!userId) return;

    async function loadNotifications() {
      const res = await getNotifications(userId!);
      if (res.success) {
        setNotifications(res.data);
      }
    }

    loadNotifications();
  }, [userId, setNotifications]);

  // 2. Realtime listener via useRealtime
  useRealtime<Notification>(
    userId ? `user-${userId}` : null,
    "notification-received",
    (notification) => {
      // Prevent duplicates
      if (notifications.some((n) => n.id === notification.id)) return;

      addNotification(notification);

      // Playful sleek micro-interaction notification toast
      toast.info(notification.title, {
        description: notification.body || undefined,
        action: notification.linkUrl
          ? {
              label: "View",
              onClick: () => {
                handleNotificationClick(notification);
              },
            }
          : undefined,
      });
    }
  );

  async function handleMarkAllAsRead() {
    if (!userId) return;
    
    // Optimistic update
    markAllAsRead();
    
    const res = await markAllNotificationsAsRead(userId);
    if (!res.success) {
      toast.error("Failed to mark all as read on server");
    }
  }

  async function handleNotificationClick(notification: Notification) {
    setIsOpen(false);

    if (!notification.read && userId) {
      // Optimistic update
      markAsRead(notification.id);
      
      const res = await markNotificationAsRead(notification.id, userId);
      if (!res.success) {
        toast.error("Failed to mark notification as read");
      }
    }

    if (notification.linkUrl) {
      router.push(notification.linkUrl as any);
    }
  }

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger
        render={
          <Button
            variant="ghost"
            size="icon"
            className="relative h-8 w-8"
          >
            <Bell className="h-4 w-4" />
            {unreadCount > 0 && (
              <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-destructive px-1 text-[10px] font-bold text-white animate-scale-in">
                {unreadCount > 9 ? "9+" : unreadCount}
              </span>
            )}
          </Button>
        }
      />
      <PopoverContent className="w-80 p-0" align="end">
        <div className="flex items-center justify-between border-b px-4 py-3">
          <h3 className="text-sm font-semibold">Notifications</h3>
          {unreadCount > 0 && (
            <button
              onClick={handleMarkAllAsRead}
              className="text-xs text-primary hover:underline"
            >
              Mark all as read
            </button>
          )}
        </div>
        <ScrollArea className="max-h-[300px]">
          {notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <Bell className="mb-2 h-8 w-8 text-muted-foreground/40" />
              <p className="text-sm text-muted-foreground">
                No notifications yet
              </p>
            </div>
          ) : (
            <div className="divide-y">
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  onClick={() => handleNotificationClick(notification)}
                  className={cn(
                    "flex gap-3 px-4 py-3 transition-colors hover:bg-muted/50 cursor-pointer",
                    !notification.read && "bg-primary/5"
                  )}
                >
                  <div
                    className={cn(
                      "mt-1.5 h-2 w-2 shrink-0 rounded-full",
                      notification.read ? "bg-transparent" : "bg-primary animate-pulse"
                    )}
                  />
                  <div className="flex-1 space-y-0.5">
                    <p className="text-sm font-medium leading-tight">
                      {notification.title}
                    </p>
                    {notification.body && (
                      <p className="text-xs text-muted-foreground line-clamp-2">
                        {notification.body}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
}

