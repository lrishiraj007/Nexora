// ═══════════════════════════════════════════════════════════
// Activity Feed Component
// Renders a premium, animated timeline of workspace activities
// ═══════════════════════════════════════════════════════════

"use client";

import { motion } from "framer-motion";
import {
  Plus,
  Edit,
  Trash,
  MessageSquare,
  UserPlus,
  ArrowRightLeft,
  Upload,
  Brain,
  LucideIcon,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import type { ActivityLogWithUser } from "@/types";
import { ActivityAction } from "@prisma/client";

interface ActivityFeedProps {
  logs: ActivityLogWithUser[];
}

const actionStyles: Record<
  ActivityAction,
  { icon: LucideIcon; color: string; bg: string; text: string }
> = {
  CREATED: { icon: Plus, color: "text-indigo-500", bg: "bg-indigo-500/10", text: "created" },
  UPDATED: { icon: Edit, color: "text-amber-500", bg: "bg-amber-500/10", text: "updated" },
  DELETED: { icon: Trash, color: "text-rose-500", bg: "bg-rose-500/10", text: "deleted" },
  COMMENTED: {
    icon: MessageSquare,
    color: "text-emerald-500",
    bg: "bg-emerald-500/10",
    text: "commented on",
  },
  ASSIGNED: { icon: UserPlus, color: "text-sky-500", bg: "bg-sky-500/10", text: "assigned" },
  STATUS_CHANGED: {
    icon: ArrowRightLeft,
    color: "text-violet-500",
    bg: "bg-violet-500/10",
    text: "moved",
  },
  UPLOADED: { icon: Upload, color: "text-teal-500", bg: "bg-teal-500/10", text: "uploaded" },
  AI_QUERY: { icon: Brain, color: "text-pink-500", bg: "bg-pink-500/10", text: "asked AI" },
};

export function ActivityFeed({ logs }: ActivityFeedProps) {
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.05 },
    },
  } as const;

  const itemVariants = {
    hidden: { x: -10, opacity: 0 },
    show: { x: 0, opacity: 1, transition: { type: "spring", stiffness: 120 } },
  } as const;

  const getTargetName = (log: ActivityLogWithUser) => {
    try {
      if (log.metadata) {
        const meta = typeof log.metadata === "string" ? JSON.parse(log.metadata) : log.metadata;
        if (meta && typeof meta === "object") {
          return (meta as any).title || (meta as any).name || (meta as any).target || "item";
        }
      }
    } catch (e) {
      // JSON parse fallback
    }
    return log.entityType;
  };

  const formatRelativeTime = (dateInput: Date | string) => {
    const date = new Date(dateInput);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.max(1, Math.floor(diffMs / 60000));
    
    if (diffMins < 60) return `${diffMins}m ago`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays}d ago`;
  };

  return (
    <Card className="border-border/40 bg-card/45 backdrop-blur-md h-full flex flex-col">
      <CardHeader className="pb-4">
        <CardTitle className="text-sm font-semibold tracking-tight">Recent Activity</CardTitle>
        <CardDescription className="text-xs text-muted-foreground/80 font-medium mt-1">
          Live stream of updates in this workspace
        </CardDescription>
      </CardHeader>

      <CardContent className="flex-1 overflow-y-auto max-h-[350px] pr-2 scrollbar-thin">
        {logs.length === 0 ? (
          <div className="flex h-32 flex-col items-center justify-center text-center">
            <p className="text-xs font-semibold text-muted-foreground/70">No activity yet</p>
            <p className="text-[10px] text-muted-foreground/50 mt-1">
              Changes and uploads will show up here
            </p>
          </div>
        ) : (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="show"
            className="relative border-l border-border/20 pl-4.5 ml-2.5 space-y-5"
          >
            {logs.map((log) => {
              const style = actionStyles[log.action] || actionStyles.CREATED;
              const ActionIcon = style.icon;
              const targetName = getTargetName(log);

              return (
                <motion.div
                  key={log.id}
                  variants={itemVariants}
                  className="relative flex items-start gap-3 text-sm group"
                >
                  {/* Timeline indicator node */}
                  <span
                    className={`absolute -left-7 top-1 flex h-5 w-5 items-center justify-center rounded-full ring-4 ring-background ${style.bg} ${style.color} transition-all duration-200 group-hover:scale-110`}
                  >
                    <ActionIcon className="h-3 w-3" />
                  </span>

                  <Avatar className="h-7 w-7 border border-border/40 shrink-0">
                    {log.user.image ? (
                      <AvatarImage src={log.user.image} alt={log.user.name} />
                    ) : null}
                    <AvatarFallback className="text-[9px] bg-muted font-bold text-muted-foreground">
                      {log.user.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")
                        .toUpperCase()
                        .slice(0, 2)}
                    </AvatarFallback>
                  </Avatar>

                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-foreground/90 leading-relaxed">
                      <span className="font-semibold text-foreground hover:underline cursor-pointer">
                        {log.user.name}
                      </span>{" "}
                      <span className="text-muted-foreground/80 font-medium">{style.text}</span>{" "}
                      <span className="font-semibold text-foreground truncate max-w-[180px] inline-block align-bottom">
                        {targetName}
                      </span>
                    </p>
                    <span className="text-[9px] font-bold text-muted-foreground/50 block mt-1 uppercase tracking-wider">
                      {formatRelativeTime(log.createdAt)}
                    </span>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        )}
      </CardContent>
    </Card>
  );
}
