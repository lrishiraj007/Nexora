// ═══════════════════════════════════════════════════════════
// Workspace Selector Page
// Shows when user navigates to / — pick or create workspace
// ═══════════════════════════════════════════════════════════

import type { Metadata } from "next";
import Link from "next/link";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import {
  LayoutDashboard,
  Plus,
  ArrowRight,
} from "lucide-react";

import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { PageHeader } from "@/components/shared/page-header";
import { CreateWorkspaceDialog } from "@/components/workspace/create-workspace-dialog";

export const metadata: Metadata = {
  title: "Workspaces",
  description: "Select or create a workspace",
};

export default async function WorkspaceSelectorPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    redirect("/sign-in");
  }

  // Fetch workspaces belonging to organizations the user is a member of
  const dbWorkspaces = await db.workspace.findMany({
    where: {
      organization: {
        members: {
          some: {
            userId: session.user.id,
          },
        },
      },
    },
    include: {
      _count: {
        select: {
          tasks: true,
        },
      },
      organization: {
        include: {
          _count: {
            select: {
              members: true,
            },
          },
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  const workspaces = dbWorkspaces.map((w) => ({
    id: w.id,
    name: w.name,
    description: w.description || "No description provided.",
    color: w.color,
    icon: w.icon,
    taskCount: w._count.tasks,
    memberCount: w.organization._count.members,
  }));

  return (
    <div className="space-y-8 max-w-5xl mx-auto py-8">
      <PageHeader
        title="Your Workspaces"
        description="Select a workspace to get started, or create a new one."
      >
        <CreateWorkspaceDialog
          trigger={
            <Button className="bg-gradient-to-r from-indigo-500 to-violet-600 hover:from-indigo-600 hover:to-violet-700 text-white shadow-md cursor-pointer">
              <Plus className="mr-2 h-4 w-4" />
              New Workspace
            </Button>
          }
        />
      </PageHeader>

      <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
        {workspaces.map((workspace) => (
          <Link key={workspace.id} href={`/${workspace.id}`}>
            <Card className="group cursor-pointer border border-border/40 bg-card/45 backdrop-blur-sm transition-all duration-300 hover:border-border hover:shadow-xl hover:-translate-y-0.5 relative overflow-hidden h-[180px] flex flex-col justify-between">
              {/* Top brand indicator stripe */}
              <div 
                className="absolute top-0 left-0 right-0 h-1 transition-colors duration-300"
                style={{ backgroundColor: workspace.color }}
              />
              
              <CardContent className="p-6 h-full flex flex-col justify-between select-none">
                <div>
                  <div className="mb-4 flex items-center gap-3">
                    <div
                      className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-xl shadow-inner transition-transform group-hover:scale-105"
                      style={{ backgroundColor: workspace.color + "15", color: workspace.color }}
                    >
                      {workspace.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-sm truncate group-hover:text-primary transition-colors text-foreground">
                        {workspace.name}
                      </h3>
                      <p className="text-[10px] text-muted-foreground font-medium">
                        {workspace.memberCount} {workspace.memberCount === 1 ? "member" : "members"}
                      </p>
                    </div>
                    <ArrowRight className="h-4 w-4 text-muted-foreground opacity-0 transition-all group-hover:opacity-100 group-hover:translate-x-1" />
                  </div>
                  
                  <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                    {workspace.description}
                  </p>
                </div>

                <div className="flex items-center gap-4 text-[10px] text-muted-foreground font-semibold uppercase tracking-wider pt-3 border-t border-border/30">
                  <div className="flex items-center gap-1.5">
                    <LayoutDashboard className="h-3.5 w-3.5 text-primary" />
                    {workspace.taskCount} {workspace.taskCount === 1 ? "task" : "tasks"}
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}

        {/* Create new workspace card */}
        <CreateWorkspaceDialog
          trigger={
            <Card className="group cursor-pointer border-dashed border-2 border-border/50 hover:border-primary/30 bg-muted/5 transition-all duration-300 hover:shadow-xl h-[180px]">
              <CardContent className="flex h-full flex-col items-center justify-center gap-3 p-6 text-center select-none">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-muted transition-colors group-hover:bg-primary/10">
                  <Plus className="h-6 w-6 text-muted-foreground transition-colors group-hover:text-primary" />
                </div>
                <div>
                  <p className="font-semibold text-sm group-hover:text-primary transition-colors text-foreground">
                    Create Workspace
                  </p>
                  <p className="text-xs text-muted-foreground/80 mt-0.5">
                    Start a new project or team
                  </p>
                </div>
              </CardContent>
            </Card>
          }
        />
      </div>
    </div>
  );
}
