// ═══════════════════════════════════════════════════════════
// Document List Component
// Lists, deletes, and launches AI chats/summaries on documents
// ═══════════════════════════════════════════════════════════

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { FileText, Trash2, MessageSquare, Sparkles, Loader2, Download } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { deleteDocument, createConversation, summarizeDocumentAction } from "@/actions/knowledge.actions";
import type { Document } from "@/types";
import type { AISummaryResponse } from "@/types/ai";

interface DocumentListProps {
  documents: Document[];
  workspaceId: string;
  userId: string;
  onRefresh: () => void;
  onSelectSummary: (name: string, data: AISummaryResponse) => void;
}

export function DocumentList({
  documents,
  workspaceId,
  userId,
  onRefresh,
  onSelectSummary,
}: DocumentListProps) {
  const router = useRouter();
  const [loadingDocId, setLoadingDocId] = useState<string | null>(null);
  const [loadingSummaryId, setLoadingSummaryId] = useState<string | null>(null);

  async function handleDelete(docId: string) {
    if (!confirm("Are you sure you want to delete this document?")) return;
    try {
      const res = await deleteDocument(docId);
      if (res.success) {
        toast.success("Document deleted successfully");
        onRefresh();
      } else {
        toast.error(res.error || "Failed to delete document");
      }
    } catch {
      toast.error("Failed to delete document");
    }
  }

  async function handleLaunchChat(docId: string) {
    setLoadingDocId(docId);
    try {
      const res = await createConversation(workspaceId, userId, undefined, docId);
      if (res.success) {
        toast.success("AI Conversation created!");
        router.push(`/${workspaceId}/knowledge/${res.data.id}` as any);
      } else {
        toast.error("Failed to start AI chat");
      }
    } catch (e) {
      toast.error("Failed to start AI chat");
    } finally {
      setLoadingDocId(null);
    }
  }

  async function handleSummarize(docId: string, name: string) {
    setLoadingSummaryId(docId);
    toast.info(`Analyzing and summarizing "${name}"...`);
    try {
      const res = await summarizeDocumentAction(docId);
      if (res.success) {
        onSelectSummary(name, res.data);
        toast.success("AI Summarization complete!");
      } else {
        toast.error(res.error || "Failed to analyze document");
      }
    } catch {
      toast.error("Failed to analyze document");
    } finally {
      setLoadingSummaryId(null);
    }
  }

  function formatBytes(bytes: number, decimals = 2) {
    if (!bytes) return "0 Bytes";
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + " " + sizes[i];
  }

  if (documents.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed py-12 text-center">
        <FileText className="mb-3 h-10 w-10 text-muted-foreground/30" />
        <p className="text-sm font-medium text-foreground">No documents uploaded yet</p>
        <p className="text-xs text-muted-foreground mt-1 max-w-[240px]">
          Upload files like PDFs or TXT documents to query them using the AI chat.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3.5 max-h-[500px] overflow-y-auto pr-1">
      {documents.map((doc) => (
        <div
          key={doc.id}
          className="flex items-center justify-between rounded-xl border bg-card/30 p-4 transition-all duration-300 hover:bg-card/75"
        >
          <div className="flex items-center gap-3.5 min-w-0">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <FileText className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-foreground truncate max-w-[250px] md:max-w-[350px]">
                {doc.name}
              </p>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-xs text-muted-foreground">
                  {formatBytes(doc.fileSize)}
                </span>
                <span className="text-[10px] text-muted-foreground">•</span>
                <span className="text-xs text-muted-foreground">
                  {new Date(doc.createdAt).toLocaleDateString()}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* AI Chat launcher */}
            <Button
              variant="outline"
              size="sm"
              disabled={loadingDocId !== null}
              onClick={() => handleLaunchChat(doc.id)}
              className="hidden sm:flex gap-1.5 h-8 border-primary/20 text-primary hover:bg-primary/5 hover:text-primary"
            >
              {loadingDocId === doc.id ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <MessageSquare className="h-3.5 w-3.5" />
              )}
              AI Chat
            </Button>

            {/* AI Summarize action */}
            <Button
              variant="outline"
              size="sm"
              disabled={loadingSummaryId !== null}
              onClick={() => handleSummarize(doc.id, doc.name)}
              className="hidden sm:flex gap-1.5 h-8 border-violet-500/20 text-violet-500 hover:bg-violet-500/5 hover:text-violet-500"
            >
              {loadingSummaryId === doc.id ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <Sparkles className="h-3.5 w-3.5" />
              )}
              Summarize
            </Button>

            {/* View/Download */}
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-muted-foreground hover:text-foreground"
              render={
                <a href={doc.url} target="_blank" rel="noopener noreferrer" download>
                  <Download className="h-4 w-4" />
                </a>
              }
            />

            {/* Trash button */}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => handleDelete(doc.id)}
              className="h-8 w-8 text-rose-500 hover:bg-rose-500/10 hover:text-rose-600"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
}
