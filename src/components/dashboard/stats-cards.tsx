// ═══════════════════════════════════════════════════════════
// Stats Cards Component
// Premium visual display of workspace metrics
// ═══════════════════════════════════════════════════════════

"use client";

import { motion } from "framer-motion";
import {
  CheckCircle2,
  AlertCircle,
  FileText,
  Users,
  Briefcase,
  TrendingUp,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

interface StatsCardsProps {
  stats: {
    totalTasks: number;
    completedTasks: number;
    inProgressTasks: number;
    inReviewTasks: number;
    todoTasks: number;
    overdueTasks: number;
    documentCount: number;
    memberCount: number;
  };
}

export function StatsCards({ stats }: StatsCardsProps) {
  const completionRate =
    stats.totalTasks > 0
      ? Math.round((stats.completedTasks / stats.totalTasks) * 100)
      : 0;

  const cardData = [
    {
      title: "Workspace Tasks",
      value: stats.totalTasks,
      subtext: `${stats.inProgressTasks} in progress · ${stats.inReviewTasks} in review`,
      icon: Briefcase,
      color: "text-indigo-500",
      bg: "bg-indigo-500/10",
      borderGlow: "hover:shadow-indigo-500/5",
    },
    {
      title: "Completed Tasks",
      value: stats.completedTasks,
      subtext: `${completionRate}% overall completion rate`,
      icon: CheckCircle2,
      color: "text-emerald-500",
      bg: "bg-emerald-500/10",
      borderGlow: "hover:shadow-emerald-500/5",
      badge: `${completionRate}% Done`,
    },
    {
      title: "Overdue Tasks",
      value: stats.overdueTasks,
      subtext: stats.overdueTasks > 0 ? "Requires immediate attention" : "All deadlines met",
      icon: AlertCircle,
      color: stats.overdueTasks > 0 ? "text-rose-500" : "text-muted-foreground/60",
      bg: stats.overdueTasks > 0 ? "bg-rose-500/10" : "bg-muted/10",
      borderGlow: stats.overdueTasks > 0 ? "hover:shadow-rose-500/5" : "hover:shadow-muted/5",
    },
    {
      title: "Knowledge Base",
      value: stats.documentCount,
      subtext: `${stats.documentCount} ingested files`,
      icon: FileText,
      color: "text-violet-500",
      bg: "bg-violet-500/10",
      borderGlow: "hover:shadow-violet-500/5",
    },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05,
      },
    },
  } as const;

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    show: { y: 0, opacity: 1, transition: { type: "spring", stiffness: 100 } },
  } as const;

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4"
    >
      {cardData.map((card, idx) => {
        const Icon = card.icon;
        return (
          <motion.div key={idx} variants={itemVariants}>
            <Card
              className={`relative overflow-hidden border-border/40 bg-card/45 backdrop-blur-md transition-all duration-300 hover:-translate-y-1 hover:border-border/80 hover:shadow-lg ${card.borderGlow}`}
            >
              {/* Subtle top color gradient bar */}
              <div
                className={`absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-indigo-500/20 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100`}
              />

              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground/70">
                    {card.title}
                  </span>
                  <div className={`rounded-xl p-2.5 ${card.bg} ${card.color} shadow-inner`}>
                    <Icon className="h-4.5 w-4.5" />
                  </div>
                </div>

                <div className="mt-4 space-y-1.5">
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-extrabold tracking-tight text-foreground">
                      {card.value}
                    </span>
                    {card.badge && (
                      <span className="inline-flex items-center rounded-full bg-emerald-500/10 px-2 py-0.5 text-xs font-medium text-emerald-500">
                        <TrendingUp className="mr-1 h-3 w-3" />
                        {card.badge}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground/80 font-medium">
                    {card.subtext}
                  </p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        );
      })}
    </motion.div>
  );
}
