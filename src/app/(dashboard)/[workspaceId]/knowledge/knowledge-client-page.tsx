// ═══════════════════════════════════════════════════════════
// Knowledge Client Page
// Client wrapper for document list, upload zones, and summary cards
// ═══════════════════════════════════════════════════════════

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { FileText, Sparkles, MessageSquare, Plus, Loader2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DocumentUpload } from "@/components/knowledge/document-upload";
import { DocumentList } from "@/components/knowledge/document-list";
import { AISummaryCard } from "@/components/knowledge/ai-summary-card";
import { createConversation, getDocuments } from "@/actions/knowledge.actions";
import type { Document, AIConversation } from "@/types";
import type { AISummaryResponse } from "@/types/ai";

interface KnowledgeClientPageProps {
  workspaceId: string;
  userId: string;
  initialDocuments: Document[];
  initialConversations: AIConversation[];
}

export function KnowledgeClientPage({
  workspaceId,
  userId,
  initialDocuments,
  initialConversations,
}: KnowledgeClientPageProps) {
  const router = useRouter();
  const [documents, setDocuments] = useState<Document[]>(initialDocuments);
  const [conversations, setConversations] = useState<AIConversation[]>(initialConversations);
  const [loadingNewChat, setLoadingNewChat] = useState(false);

  // AI summary states
  const [selectedSummary, setSelectedSummary] = useState<{
    name: string;
    data: AISummaryResponse;
  } | null>(null);

  // Refresh documents in view
  async function refreshDocs() {
    const res = await getDocuments(workspaceId);
    if (res.success) {
      setDocuments(res.data);
    }
  }

  // Create a clean new AI chat without documents
  async function handleNewChat() {
    setLoadingNewChat(true);
    try {
      const res = await createConversation(workspaceId, userId);
      if (res.success) {
        toast.success("New AI chat created!");
        router.push(`/${workspaceId}/knowledge/${res.data.id}` as any);
      } else {
        toast.error("Failed to create chat");
      }
    } catch {
      toast.error("Failed to create chat");
    } finally {
      setLoadingNewChat(false);
    }
  }

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      {/* Main knowledge panel */}
      <div className="lg:col-span-2 space-y-6">
        {/* Upload card */}
        <Card className="border-border/50 bg-card/45 backdrop-blur-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <FileText className="h-4.5 w-4.5 text-primary" />
              Document Library
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <DocumentUpload workspaceId={workspaceId} onUploadSuccess={refreshDocs} />
            <DocumentList
              documents={documents}
              workspaceId={workspaceId}
              userId={userId}
              onRefresh={refreshDocs}
              onSelectSummary={(name, data) => setSelectedSummary({ name, data })}
            />
          </CardContent>
        </Card>
      </div>

      {/* Side insights panel */}
      <div className="space-y-6">
        {/* Summarization card */}
        {selectedSummary ? (
          <AISummaryCard
            workspaceId={workspaceId}
            creatorId={userId}
            documentName={selectedSummary.name}
            summaryData={selectedSummary.data}
            onClose={() => setSelectedSummary(null)}
          />
        ) : (
          /* General AI Chats list */
          <Card className="border-border/50 bg-card/45 backdrop-blur-sm">
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <MessageSquare className="h-4.5 w-4.5 text-primary" />
                Historic Chats
              </CardTitle>
              <Button
                variant="ghost"
                size="sm"
                disabled={loadingNewChat}
                onClick={handleNewChat}
                className="h-8 text-primary hover:bg-primary/5"
              >
                {loadingNewChat ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <>
                    <Plus className="h-3.5 w-3.5 mr-1" />
                    New Chat
                  </>
                )}
              </Button>
            </CardHeader>
            <CardContent>
              {conversations.length === 0 ? (
                <div className="py-8 text-center border border-dashed rounded-xl">
                  <MessageSquare className="h-8 w-8 text-muted-foreground/30 mx-auto mb-2" />
                  <p className="text-xs font-semibold text-muted-foreground">No recent conversations</p>
                  <Button
                    variant="outline"
                    size="xs"
                    onClick={handleNewChat}
                    className="mt-3 text-xs"
                  >
                    Start your first chat
                  </Button>
                </div>
              ) : (
                <div className="space-y-2.5 max-h-[350px] overflow-y-auto pr-1">
                  {conversations.map((conv) => (
                    <div
                      key={conv.id}
                      onClick={() => router.push(`/${workspaceId}/knowledge/${conv.id}` as any)}
                      className="group p-3 rounded-xl border bg-card/30 hover:bg-card/75 transition-all duration-200 cursor-pointer flex justify-between items-center"
                    >
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-foreground group-hover:text-primary transition-colors truncate">
                          {conv.title || "AI Discussion"}
                        </p>
                        <p className="text-[10px] text-muted-foreground mt-1">
                          Last active {new Date(conv.updatedAt).toLocaleDateString()}
                        </p>
                      </div>
                      <Sparkles className="h-3.5 w-3.5 text-muted-foreground/40 group-hover:text-violet-500 transition-colors shrink-0 ml-2" />
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
