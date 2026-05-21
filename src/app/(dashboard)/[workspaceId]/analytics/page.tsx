// ═══════════════════════════════════════════════════════════
// Workspace Analytics Dashboard Page
// Deep-dive real-time charts, advisor, and team contribution
// ═══════════════════════════════════════════════════════════

import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Sparkles, Users, Award, AlertTriangle, CheckCircle, BarChart3 } from "lucide-react";

import { PageHeader } from "@/components/shared/page-header";
import { StatsCards } from "@/components/dashboard/stats-cards";
import { ProductivityChart } from "@/components/dashboard/productivity-chart";
import { AIInsightsCard } from "@/components/dashboard/ai-insights-card";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { getDashboardStats } from "@/actions/dashboard.actions";
import { TASK_PRIORITY_CONFIG, TASK_STATUS_CONFIG } from "@/lib/constants";

export const metadata: Metadata = {
  title: "Workspace Analytics",
  description: "Detailed performance metrics and AI insights",
};

interface AnalyticsPageProps {
  params: Promise<{
    workspaceId: string;
  }>;
}

export default async function AnalyticsPage({ params }: AnalyticsPageProps) {
  const { workspaceId } = await params;
  const res = await getDashboardStats(workspaceId);

  if (!res.success || !res.data) {
    return notFound();
  }

  const stats = res.data;

  // Find top performer(s) based on completed tasks
  const sortedMembers = [...stats.memberStats].sort((a, b) => b.completedCount - a.completedCount);
  const topMember = sortedMembers[0];

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <PageHeader
        title="Workspace Analytics"
        description="Deep dive into project health, throughput trends, and active contributor stats."
      />

      {/* Primary Stats Grid */}
      <StatsCards stats={stats} />

      {/* Middle Grid: Chart and Advisor */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Productivity Velocity Chart */}
        <div className="lg:col-span-2">
          <ProductivityChart data={stats.productivityTrend} />
        </div>

        {/* AI advisor insight card */}
        <div className="lg:col-span-1">
          <AIInsightsCard workspaceId={workspaceId} />
        </div>
      </div>

      {/* Bottom Grid: Team Performance and Task Breakdown */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* Member contribution card */}
        <Card className="border-border/40 bg-card/45 backdrop-blur-md lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-sm font-semibold tracking-tight flex items-center gap-2">
              <Award className="h-4 w-4 text-amber-500" />
              Contributor Leaderboard
            </CardTitle>
            <CardDescription className="text-xs text-muted-foreground/80 font-medium">
              Task contribution and resolution metrics per workspace member
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {stats.memberStats.length === 0 ? (
              <div className="flex h-32 flex-col items-center justify-center text-center">
                <Users className="h-8 w-8 text-muted-foreground/30 mb-2" />
                <p className="text-xs font-semibold text-muted-foreground/70">No members listed</p>
              </div>
            ) : (
              <div className="space-y-5">
                {sortedMembers.map((member, idx) => {
                  const total = member.assignedCount;
                  const completed = member.completedCount;
                  const rate = total > 0 ? Math.round((completed / total) * 100) : 0;

                  return (
                    <div key={member.id} className="flex items-center justify-between gap-4">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="relative">
                          <Avatar className="h-9 w-9 border border-border/40">
                            {member.image ? <AvatarImage src={member.image} alt={member.name} /> : null}
                            <AvatarFallback className="text-[10px] bg-muted font-bold text-muted-foreground">
                              {member.name
                                .split(" ")
                                .map((n) => n[0])
                                .join("")
                                .toUpperCase()
                                .slice(0, 2)}
                            </AvatarFallback>
                          </Avatar>
                          {idx === 0 && completed > 0 && (
                            <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-amber-500 text-[8px] font-bold text-background shadow">
                              ★
                            </span>
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs font-semibold truncate text-foreground">{member.name}</p>
                          <p className="text-[10px] font-medium text-muted-foreground mt-0.5">
                            {completed} resolved · {total - completed} active tasks
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-4 w-44 shrink-0">
                        <div className="flex-1 space-y-1">
                          <div className="flex items-center justify-between text-[9px] font-bold">
                            <span className="text-muted-foreground/80">Resolution Rate</span>
                            <span className="text-foreground">{rate}%</span>
                          </div>
                          <Progress value={rate} className="h-1 bg-muted/65" />
                        </div>
                        <div className="w-10 text-right">
                          <span className="text-xs font-extrabold text-foreground">{completed}</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Task Priority & Status Breakdown */}
        <Card className="border-border/40 bg-card/45 backdrop-blur-md">
          <CardHeader>
            <CardTitle className="text-sm font-semibold tracking-tight flex items-center gap-2">
              <BarChart3 className="h-4 w-4 text-indigo-500" />
              Task Profile
            </CardTitle>
            <CardDescription className="text-xs text-muted-foreground/80 font-medium">
              Workspace backlog segmented by priority weights
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Priority Progress Bars */}
            <div className="space-y-4">
              <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/70">
                Priority Density
              </span>
              <div className="space-y-3.5">
                {stats.priorityCounts.map(({ priority, count }) => {
                  const total = stats.totalTasks;
                  const percentage = total > 0 ? Math.round((count / total) * 100) : 0;
                  const config = TASK_PRIORITY_CONFIG[priority];
                  
                  // Setup priority color classes
                  let progressColor = "bg-slate-400";
                  if (priority === "URGENT") progressColor = "bg-rose-500";
                  if (priority === "HIGH") progressColor = "bg-amber-500";
                  if (priority === "MEDIUM") progressColor = "bg-indigo-500";
                  if (priority === "LOW") progressColor = "bg-sky-500";

                  return (
                    <div key={priority} className="space-y-1.5">
                      <div className="flex items-center justify-between text-[11px] font-semibold">
                        <span className="flex items-center gap-1.5 text-foreground/90">
                          <span className={`h-1.5 w-1.5 rounded-full ${progressColor}`} />
                          {config.label}
                        </span>
                        <span className="text-muted-foreground">
                          {count} ({percentage}%)
                        </span>
                      </div>
                      <Progress value={percentage} className="h-1 bg-muted/65" />
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Status Breakdown Pills */}
            <div className="space-y-3 border-t border-border/20 pt-4">
              <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/70">
                Column Distribution
              </span>
              <div className="grid grid-cols-2 gap-2">
                {stats.statusCounts.map(({ status, count }) => {
                  const config = TASK_STATUS_CONFIG[status];
                  return (
                    <div
                      key={status}
                      className="flex items-center justify-between p-2 rounded-xl border border-border/30 bg-muted/15"
                    >
                      <span className="text-[10px] font-bold text-muted-foreground/80 uppercase tracking-wider">
                        {config.label}
                      </span>
                      <span className="text-xs font-extrabold text-foreground">{count}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
