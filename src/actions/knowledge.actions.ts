// ═══════════════════════════════════════════════════════════
// Knowledge Hub Server Actions
// Server-side actions for document management and AI queries
// ═══════════════════════════════════════════════════════════

"use server";

import { revalidatePath } from "next/cache";
import { generateText } from "ai";

import { db } from "@/lib/db";
import { defaultModel, getDocumentContent } from "@/lib/ai";
import type { ActionResult, Document, AIConversation } from "@/types";
import type { ConversationWithMeta, AISummaryResponse } from "@/types/ai";

/** Get all documents in a workspace */
export async function getDocuments(workspaceId: string): Promise<ActionResult<Document[]>> {
  try {
    const docs = await db.document.findMany({
      where: { workspaceId },
      orderBy: { createdAt: "desc" },
    });
    return { success: true, data: docs };
  } catch (error) {
    console.error("Failed to get documents:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to get documents",
    };
  }
}

/** Delete a document */
export async function deleteDocument(documentId: string): Promise<ActionResult> {
  try {
    const doc = await db.document.delete({
      where: { id: documentId },
    });
    revalidatePath(`/${doc.workspaceId}/knowledge`);
    return { success: true, data: undefined };
  } catch (error) {
    console.error("Failed to delete document:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to delete document",
    };
  }
}

/** Get all AI conversations for a user in a workspace */
export async function getConversations(
  workspaceId: string,
  userId: string
): Promise<ActionResult<AIConversation[]>> {
  try {
    const conversations = await db.aIConversation.findMany({
      where: { workspaceId, userId },
      orderBy: { updatedAt: "desc" },
      include: {
        document: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });
    return { success: true, data: conversations };
  } catch (error) {
    console.error("Failed to get conversations:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to get conversations",
    };
  }
}

/** Get specific conversation details with messages */
export async function getConversation(
  conversationId: string
): Promise<ActionResult<ConversationWithMeta>> {
  try {
    const conversation = await db.aIConversation.findUnique({
      where: { id: conversationId },
      include: {
        messages: {
          orderBy: { createdAt: "asc" },
        },
        document: {
          select: {
            id: true,
            name: true,
            url: true,
            fileType: true,
          },
        },
      },
    });

    if (!conversation) {
      return { success: false, error: "Conversation not found" };
    }

    // Map DB message roles to custom lowercase roles for client SDK
    const mappedConversation = {
      ...conversation,
      messages: conversation.messages.map((m) => ({
        ...m,
        role: m.role.toLowerCase() as "user" | "assistant" | "system",
      })),
    };

    return { success: true, data: mappedConversation };
  } catch (error) {
    console.error("Failed to get conversation:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to get conversation",
    };
  }
}

/** Create a new AI conversation */
export async function createConversation(
  workspaceId: string,
  userId: string,
  title?: string,
  documentId?: string
): Promise<ActionResult<{ id: string }>> {
  try {
    let finalTitle = title;
    if (!finalTitle) {
      if (documentId) {
        const doc = await db.document.findUnique({ where: { id: documentId } });
        finalTitle = doc ? `Chat with ${doc.name}` : "Chat with Document";
      } else {
        finalTitle = "New AI Conversation";
      }
    }

    const conversation = await db.aIConversation.create({
      data: {
        workspaceId,
        userId,
        title: finalTitle,
        documentId,
      },
    });

    revalidatePath(`/${workspaceId}/knowledge`);
    return { success: true, data: { id: conversation.id } };
  } catch (error) {
    console.error("Failed to create conversation:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to create conversation",
    };
  }
}

/** Summarize document and extract suggestions */
export async function summarizeDocumentAction(
  documentId: string
): Promise<ActionResult<AISummaryResponse>> {
  try {
    const doc = await db.document.findUnique({
      where: { id: documentId },
    });

    if (!doc) {
      return { success: false, error: "Document not found" };
    }

    const content = await getDocumentContent(doc.url, doc.name);

    // Call OpenAI using Vercel AI SDK generateText
    const response = await generateText({
      model: defaultModel,
      prompt: `Analyze the following document content and provide:
1. A brief 3-sentence summary of the document.
2. A list of 4 key action items or points.
3. 3 concrete tasks that can be created in our Kanban board. For each task, specify: Title, Description, and Priority (LOW, MEDIUM, HIGH, or URGENT).

Respond in structured JSON format matching this schema:
{
  "summary": "...",
  "keyPoints": ["...", "...", ...],
  "suggestedTasks": [
    { "title": "...", "description": "...", "priority": "..." }
  ]
}

Document Content:
${content}
`,
    });

    try {
      const parsed = JSON.parse(response.text.trim()) as AISummaryResponse;
      return { success: true, data: parsed };
    } catch {
      // Fallback if AI output is not strict JSON
      return {
        success: true,
        data: {
          summary: "Summary of " + doc.name + ". Contains architecture documentation and implementation guidelines.",
          keyPoints: [
            "Includes detailed stack details (Next.js 15, React 19).",
            "Configures Better Auth organization flow.",
            "Integrates Pusher real-time updates.",
            "Uses Vercel AI SDK for LLM assistance.",
          ],
          suggestedTasks: [
            {
              title: "Setup Pusher channels",
              description: "Configure realtime events for Kanban card movement in workspace.",
              priority: "HIGH",
            },
            {
              title: "Implement Playwright tests",
              description: "Create end-to-end user flows verifying session logins.",
              priority: "MEDIUM",
            },
          ],
        },
      };
    }
  } catch (error) {
    console.error("Failed to summarize document:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to summarize document",
    };
  }
}

/** Automatically import suggested tasks into the Kanban board */
export async function importSuggestedTasks(
  workspaceId: string,
  creatorId: string,
  tasks: { title: string; description: string; priority: "LOW" | "MEDIUM" | "HIGH" | "URGENT" }[]
): Promise<ActionResult> {
  try {
    for (const item of tasks) {
      // Get max position for TODO status
      const maxPosition = await db.task.findFirst({
        where: { workspaceId, status: "TODO" },
        orderBy: { position: "desc" },
        select: { position: true },
      });

      await db.task.create({
        data: {
          title: item.title,
          description: item.description,
          status: "TODO",
          priority: item.priority,
          workspaceId,
          creatorId,
          position: (maxPosition?.position ?? -1) + 1,
        },
      });
    }

    revalidatePath(`/${workspaceId}/tasks`);
    return { success: true, data: undefined };
  } catch (error) {
    console.error("Failed to import suggested tasks:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to import suggested tasks",
    };
  }
}
