// ═══════════════════════════════════════════════════════════
// Workspace Server Actions
// Server-side mutations for workspace management
// ═══════════════════════════════════════════════════════════

"use server";

import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { createWorkspaceSchema } from "@/validators/workspace.schema";
import type { ActionResult } from "@/types";

/** Create a new workspace within an organization */
export async function createWorkspace(
  formData: FormData
): Promise<ActionResult<{ id: string }>> {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });
    if (!session?.user) {
      return { success: false, error: "Unauthorized" };
    }

    const raw = {
      name: formData.get("name") as string,
      description: (formData.get("description") as string) || undefined,
      color: (formData.get("color") as string) || undefined,
      icon: (formData.get("icon") as string) || undefined,
    };

    const validated = createWorkspaceSchema.parse(raw);

    // Query user's organizations to see if they have one
    const memberRecords = await db.member.findMany({
      where: { userId: session.user.id },
    });

    let organizationId = formData.get("organizationId") as string;

    if (!organizationId) {
      if (memberRecords.length > 0) {
        // Fallback to active organization or first organization they are member of
        const activeOrgId = session.session.activeOrganizationId;
        const activeOrg = memberRecords.find((m) => m.organizationId === activeOrgId);
        organizationId = activeOrg?.organizationId || memberRecords[0].organizationId;
      } else {
        // Zero-friction onboarding: silently create a default organization for the user
        const orgName = `${session.user.name || "My"}'s Team`;
        // Generate a valid slug
        const baseSlug = (session.user.name || "my")
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/^-+|-+$/g, "");
        const orgSlug = `${baseSlug || "team"}-${Math.random().toString(36).substring(2, 6)}`;

        const newOrg = await db.organization.create({
          data: {
            name: orgName,
            slug: orgSlug,
            members: {
              create: {
                userId: session.user.id,
                role: "OWNER",
              },
            },
          },
        });
        organizationId = newOrg.id;
      }
    }

    const workspace = await db.workspace.create({
      data: {
        name: validated.name,
        description: validated.description,
        color: validated.color || "#6366f1",
        icon: validated.icon || "🚀",
        organizationId: organizationId,
      },
    });

    revalidatePath("/workspaces");
    revalidatePath("/");
    return { success: true, data: { id: workspace.id } };
  } catch (error) {
    console.error("Failed to create workspace:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to create workspace",
    };
  }
}

/** Update workspace settings */
export async function updateWorkspace(
  workspaceId: string,
  formData: FormData
): Promise<ActionResult> {
  try {
    const data: Record<string, string | undefined> = {};
    if (formData.get("name")) data.name = formData.get("name") as string;
    if (formData.get("description"))
      data.description = formData.get("description") as string;
    if (formData.get("color")) data.color = formData.get("color") as string;

    await db.workspace.update({
      where: { id: workspaceId },
      data,
    });

    revalidatePath(`/${workspaceId}`);
    return { success: true, data: undefined };
  } catch (error) {
    console.error("Failed to update workspace:", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to update workspace",
    };
  }
}

/** Delete a workspace */
export async function deleteWorkspace(
  workspaceId: string
): Promise<ActionResult> {
  try {
    await db.workspace.delete({
      where: { id: workspaceId },
    });

    revalidatePath("/");
    return { success: true, data: undefined };
  } catch (error) {
    console.error("Failed to delete workspace:", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to delete workspace",
    };
  }
}

/** Fetch all members belonging to a workspace's organization */
export async function getWorkspaceMembers(
  workspaceId: string
): Promise<ActionResult<{ id: string; name: string; image: string | null; email: string }[]>> {
  try {
    const workspace = await db.workspace.findUnique({
      where: { id: workspaceId },
      select: { organizationId: true },
    });

    if (!workspace) {
      return { success: false, error: "Workspace not found" };
    }

    const members = await db.member.findMany({
      where: { organizationId: workspace.organizationId },
      include: {
        user: {
          select: { id: true, name: true, image: true, email: true },
        },
      },
    });

    const users = members.map((m) => m.user);
    return { success: true, data: users };
  } catch (error) {
    console.error("Failed to fetch workspace members:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to fetch workspace members",
    };
  }
}

