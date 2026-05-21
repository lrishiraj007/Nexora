// ═══════════════════════════════════════════════════════════
// UploadThing File Router Config
// ═══════════════════════════════════════════════════════════

import { createUploadthing, type FileRouter } from "uploadthing/next";
import { UploadThingError } from "uploadthing/server";
import { z } from "zod";
import { headers } from "next/headers";

import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

const f = createUploadthing();

export const ourFileRouter = {
  documentUploader: f({
    pdf: { maxFileSize: "16MB" },
    text: { maxFileSize: "16MB" },
  })
    .input(z.object({ workspaceId: z.string() }))
    .middleware(async ({ input }) => {
      // Get auth session on the server
      const session = await auth.api.getSession({
        headers: await headers(),
      });

      if (!session || !session.user) {
        throw new UploadThingError("Unauthorized");
      }

      // Check if user is member of organization that owns this workspace
      const workspace = await db.workspace.findUnique({
        where: { id: input.workspaceId },
        select: { organizationId: true },
      });

      if (!workspace) {
        throw new UploadThingError("Workspace not found");
      }

      const member = await db.member.findUnique({
        where: {
          organizationId_userId: {
            organizationId: workspace.organizationId,
            userId: session.user.id,
          },
        },
      });

      if (!member) {
        throw new UploadThingError("Not a member of the workspace organization");
      }

      return { userId: session.user.id, workspaceId: input.workspaceId };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      console.log("Upload complete for userId:", metadata.userId);
      console.log("File URL:", file.url);

      // Save document to DB
      const document = await db.document.create({
        data: {
          name: file.name,
          url: file.url,
          fileKey: file.key,
          fileType: file.type || "application/pdf",
          fileSize: file.size,
          workspaceId: metadata.workspaceId,
          uploaderId: metadata.userId,
        },
      });

      // Log activity
      await db.activityLog.create({
        data: {
          action: "UPLOADED",
          entityType: "document",
          entityId: document.id,
          userId: metadata.userId,
          workspaceId: metadata.workspaceId,
          metadata: { name: file.name },
        },
      });

      return { uploadedBy: metadata.userId, documentId: document.id };
    }),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;
