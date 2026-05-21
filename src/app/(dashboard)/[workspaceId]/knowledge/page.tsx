// ═══════════════════════════════════════════════════════════
// Knowledge Hub Main Page
// Server component retrieving documents and user sessions
// ═══════════════════════════════════════════════════════════

import type { Metadata } from "next";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { auth } from "@/lib/auth";
import { getDocuments, getConversations } from "@/actions/knowledge.actions";
import { PageHeader } from "@/components/shared/page-header";
import { KnowledgeClientPage } from "./knowledge-client-page";

export const metadata: Metadata = {
  title: "AI Knowledge Hub",
  description: "Upload workspace documents and interact with our intelligent AI Assistant.",
};

interface KnowledgePageProps {
  params: Promise<{
    workspaceId: string;
  }>;
}

export default async function KnowledgePage({ params }: KnowledgePageProps) {
  const { workspaceId } = await params;

  // Get user session
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session || !session.user) {
    redirect("/sign-in");
  }

  // Fetch documents and conversations on server
  const [docsRes, convRes] = await Promise.all([
    getDocuments(workspaceId),
    getConversations(workspaceId, session.user.id),
  ]);

  const documents = docsRes.success ? docsRes.data || [] : [];
  const conversations = convRes.success ? convRes.data || [] : [];

  return (
    <div className="space-y-6">
      <PageHeader
        title="AI Knowledge Hub"
        description="Ingest PDFs or text guides. Our LLM will summarize action points, generate Kanban tasks, and resolve documentation queries."
      />
      <KnowledgeClientPage
        workspaceId={workspaceId}
        userId={session.user.id}
        initialDocuments={documents}
        initialConversations={conversations}
      />
    </div>
  );
}
