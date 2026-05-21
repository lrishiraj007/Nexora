// ═══════════════════════════════════════════════════════════
// Workspace Dashboard Page
// Overview of tasks, documents, and collaboration shortcuts
// ═══════════════════════════════════════════════════════════

import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  LayoutDashboard,
  FileText,
  CheckCircle,
  Plus,
  ArrowRight,
  TrendingUp,
  Users,
  BarChart3,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PageHeader } from "@/components/shared/page-header";
import { ActivityFeed } from "@/components/dashboard/activity-feed";
import { getDashboardStats } from "@/actions/dashboard.actions";
import { getActivityLogs } from "@/actions/activity.actions";

export const metadata: Metadata = {
  title: "Workspace Dashboard",
  description: "Overview of workspace tasks and documentation",
};

interface WorkspacePageProps {
  params: Promise<{
    workspaceId: string;
  }>;
}

export default async function WorkspacePage({ params }: WorkspacePageProps) {
  const { workspaceId } = await params;

  // 1. Fetch real stats and recent activities
  const [statsRes, logsRes] = await Promise.all([
    getDashboardStats(workspaceId),
    getActivityLogs(workspaceId, 5),
  ]);

  if (!statsRes.success || !statsRes.data || !logsRes.success || !logsRes.data) {
    return notFound();
  }

  const stats = statsRes.data;
  const logs = logsRes.data;

  const statsData = [
    {
      label: "Active Tasks",
      value: String(stats.totalTasks - stats.completedTasks),
      icon: LayoutDashboard,
      color: "text-indigo-500",
      bg: "bg-indigo-500/10",
    },
    {
      label: "Documents Ingested",
      value: String(stats.documentCount),
      icon: FileText,
      color: "text-violet-500",
      bg: "bg-violet-500/10",
    },
    {
      label: "Tasks Completed",
      value: String(stats.completedTasks),
      icon: CheckCircle,
      color: "text-emerald-500",
      bg: "bg-emerald-500/10",
    },
    {
      label: "Active Members",
      value: String(stats.memberCount),
      icon: Users,
      color: "text-pink-500",
      bg: "bg-pink-500/10",
    },
  ];

  return (
    <div className="space-y-8">
      {/* Dynamic page header */}
      <PageHeader
        title="Workspace Overview"
        description="Get a high-level view of tasks, knowledge base, and recent team activities."
      >
        <div className="flex items-center gap-3">
          <Link href={`/${workspaceId}/tasks`}>
            <Button variant="outline" className="border-border/80">
              Go to Tasks
            </Button>
          </Link>
          <Link href={`/${workspaceId}/knowledge`}>
            <Button className="bg-gradient-to-r from-indigo-500 to-violet-600 text-white shadow-md">
              <Plus className="mr-2 h-4 w-4" />
              Upload Document
            </Button>
          </Link>
        </div>
      </PageHeader>

      {/* Stats row */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {statsData.map((stat, idx) => {
          const Icon = stat.icon;
          return (
            <Card
              key={idx}
              className="border-border/50 bg-card/45 backdrop-blur-sm transition-all hover:shadow-md hover:border-border"
            >
              <CardContent className="p-6 flex items-center justify-between">
                <div className="space-y-1">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    {stat.label}
                  </p>
                  <p className="text-3xl font-extrabold text-foreground">{stat.value}</p>
                </div>
                <div className={`rounded-xl p-3 ${stat.bg} ${stat.color} shadow-inner`}>
                  <Icon className="h-5 w-5" />
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Main sections */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* Quick Launch Card */}
        <Card className="md:col-span-1 border-border/50 bg-card/40 backdrop-blur-sm h-fit">
          <CardHeader>
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-primary" />
              Quick Actions
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Link href={`/${workspaceId}/tasks`}>
              <div className="group flex items-center justify-between p-3.5 rounded-xl border bg-muted/20 hover:bg-muted/50 cursor-pointer transition-colors">
                <div className="flex items-center gap-3">
                  <div className="bg-indigo-500/10 text-indigo-500 p-2 rounded-lg">
                    <LayoutDashboard className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">Kanban Task Board</p>
                    <p className="text-xs text-muted-foreground">Manage cards and assignees</p>
                  </div>
                </div>
                <ArrowRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all" />
              </div>
            </Link>

            <Link href={`/${workspaceId}/knowledge`}>
              <div className="group flex items-center justify-between p-3.5 rounded-xl border bg-muted/20 hover:bg-muted/50 cursor-pointer transition-colors">
                <div className="flex items-center gap-3">
                  <div className="bg-violet-500/10 text-violet-500 p-2 rounded-lg">
                    <FileText className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">AI Knowledge Base</p>
                    <p className="text-xs text-muted-foreground">Chat and summarize files</p>
                  </div>
                </div>
                <ArrowRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all" />
              </div>
            </Link>

            <Link href={`/${workspaceId}/analytics`}>
              <div className="group flex items-center justify-between p-3.5 rounded-xl border bg-muted/20 hover:bg-muted/50 cursor-pointer transition-colors">
                <div className="flex items-center gap-3">
                  <div className="bg-emerald-500/10 text-emerald-500 p-2 rounded-lg">
                    <BarChart3 className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">Project Analytics</p>
                    <p className="text-xs text-muted-foreground">Velocity trends & leaderboards</p>
                  </div>
                </div>
                <ArrowRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all" />
              </div>
            </Link>
          </CardContent>
        </Card>

        {/* Activity Feed Card */}
        <div className="lg:col-span-2">
          <ActivityFeed logs={logs} />
        </div>
      </div>
    </div>
  );
}
