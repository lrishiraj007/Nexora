// ═══════════════════════════════════════════════════════════
// AI TypeScript Types
// ═══════════════════════════════════════════════════════════

import type { AIConversation, AIMessage, Document } from "@/types";

export type ChatMessage = Omit<AIMessage, "role"> & {
  role: "user" | "assistant" | "system";
};

export type ConversationWithMeta = AIConversation & {
  messages: ChatMessage[];
  document: Pick<Document, "id" | "name" | "url" | "fileType"> | null;
  _count?: {
    messages: number;
  };
};

export interface AISummaryResponse {
  summary: string;
  keyPoints: string[];
  suggestedTasks: {
    title: string;
    description: string;
    priority: "LOW" | "MEDIUM" | "HIGH" | "URGENT";
  }[];
}
