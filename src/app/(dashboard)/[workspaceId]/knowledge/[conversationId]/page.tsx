// ═══════════════════════════════════════════════════════════
// Conversation Chat Page
// Server component loading conversation history and streaming chat
// ═══════════════════════════════════════════════════════════

import type { Metadata } from "next";
import { headers } from "next/headers";
import { redirect, notFound } from "next/navigation";

import { auth } from "@/lib/auth";
import { getConversation } from "@/actions/knowledge.actions";
import { ChatInterface } from "@/components/knowledge/chat-interface";

export const metadata: Metadata = {
  title: "AI Discussion",
  description: "Interactive conversation with workspace AI Assistant",
};

interface ConversationPageProps {
  params: Promise<{
    workspaceId: string;
    conversationId: string;
  }>;
}

export default async function ConversationPage({ params }: ConversationPageProps) {
  const { workspaceId, conversationId } = await params;

  // Validate session
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session || !session.user) {
    redirect("/sign-in");
  }

  // Fetch conversation detail
  const res = await getConversation(conversationId);

  if (!res.success || !res.data) {
    notFound();
  }

  const conversation = res.data;

  // Ensure security: conversation belongs to this user & workspace
  if (conversation.userId !== session.user.id || conversation.workspaceId !== workspaceId) {
    redirect(`/${workspaceId}/knowledge`);
  }

  return (
    <div className="space-y-6">
      <ChatInterface
        workspaceId={workspaceId}
        conversationId={conversationId}
        documentName={conversation.document?.name}
        initialMessages={conversation.messages}
      />
    </div>
  );
}
