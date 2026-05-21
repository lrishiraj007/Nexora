// ═══════════════════════════════════════════════════════════
// Dashboard Layout
// App shell with sidebar, header, and main content area
// ═══════════════════════════════════════════════════════════

import { Suspense } from "react";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";
import { CommandPalette } from "@/components/shared/command-palette";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  let workspaces: Array<{ id: string; name: string; color: string; icon: string }> = [];

  if (session?.user) {
    workspaces = await db.workspace.findMany({
      where: {
        organization: {
          members: {
            some: {
              userId: session.user.id,
            },
          },
        },
      },
      select: {
        id: true,
        name: true,
        color: true,
        icon: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });
  }

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Sidebar */}
      <Suspense fallback={<div className="w-64 border-r bg-sidebar-background" />}>
        <Sidebar workspaces={workspaces} />
      </Suspense>

      {/* Main Content */}
      <div className="flex flex-1 flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto">
          <div className="mx-auto max-w-7xl p-6">{children}</div>
        </main>
      </div>

      {/* Command Palette (global) */}
      <CommandPalette />
    </div>
  );
}
