// ═══════════════════════════════════════════════════════════
// AI Chat Streaming Route Handler
// Integrates Vercel AI SDK for responsive document-aware chat
// ═══════════════════════════════════════════════════════════

import { streamText } from "ai";
import { headers } from "next/headers";
import { z } from "zod";

import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { defaultModel, SYSTEM_PROMPT, getDocumentContent } from "@/lib/ai";

export async function POST(req: Request) {
  try {
    // 1. Authenticate user
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session || !session.user) {
      return new Response("Unauthorized", { status: 401 });
    }

    // 2. Parse request payload
    const body = await req.json();
    const parsed = z
      .object({
        messages: z.array(
          z.object({
            role: z.enum(["user", "assistant", "system"]),
            content: z.string(),
          })
        ),
        conversationId: z.string(),
      })
      .safeParse(body);

    if (!parsed.success) {
      return new Response("Bad Request", { status: 400 });
    }

    const { messages, conversationId } = parsed.data;

    // 3. Fetch conversation detail from DB
    const conversation = await db.aIConversation.findUnique({
      where: { id: conversationId },
      include: { document: true },
    });

    if (!conversation) {
      return new Response("Conversation not found", { status: 404 });
    }

    // 4. Inject Document context if present
    let docContext = "";
    if (conversation.document) {
      const content = await getDocumentContent(
        conversation.document.url,
        conversation.document.name
      );
      docContext = `
You are discussing the document "${conversation.document.name}".
Here is the ingested text content of the document:
---
${content}
---
Use the document context above to guide your responses.
`;
    }

    const latestMessage = messages[messages.length - 1];

    // Save the User's query to DB immediately
    await db.aIMessage.create({
      data: {
        role: "USER",
        content: latestMessage.content,
        conversationId,
      },
    });

    // 5. Setup Vercel AI SDK Streaming
    const result = streamText({
      model: defaultModel,
      system: SYSTEM_PROMPT + docContext,
      messages: messages.map((m) => ({
        role: m.role,
        content: m.content,
      })),
      onFinish: async (event) => {
        // Save the AI Assistant's response to DB
        await db.aIMessage.create({
          data: {
            role: "ASSISTANT",
            content: event.text,
            conversationId,
          },
        });

        // Update the conversation's updatedAt timestamp
        await db.aIConversation.update({
          where: { id: conversationId },
          data: { updatedAt: new Date() },
        });

        // Log AI Query activity
        await db.activityLog.create({
          data: {
            action: "AI_QUERY",
            entityType: "ai_conversation",
            entityId: conversationId,
            userId: session.user.id,
            workspaceId: conversation.workspaceId,
            metadata: {
              title: conversation.title || "AI Query",
              hasDocument: !!conversation.documentId,
            },
          },
        });
      },
    });

    // 6. Return the text stream response
    return result.toTextStreamResponse();
  } catch (error) {
    console.error("AI Chat API Error:", error);
    return new Response("Internal Server Error", { status: 500 });
  }
}
