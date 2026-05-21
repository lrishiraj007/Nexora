// ═══════════════════════════════════════════════════════════
// AI Chat Interface Component
// Connects with Vercel AI SDK to stream conversation
// ═══════════════════════════════════════════════════════════

"use client";

import { useRef, useEffect, useState } from "react";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import { Send, Sparkles, Loader2, FileText, ArrowLeft } from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ChatMessage } from "@/components/knowledge/chat-message";
import type { ChatMessage as CustomMessage } from "@/types/ai";

interface ChatInterfaceProps {
  workspaceId: string;
  conversationId: string;
  documentName?: string | null;
  initialMessages: CustomMessage[];
}

export function ChatInterface({
  workspaceId,
  conversationId,
  documentName,
  initialMessages,
}: ChatInterfaceProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [input, setInput] = useState("");

  // Create transport ref to prevent recreation on each render
  const transportRef = useRef(
    new DefaultChatTransport({
      api: "/api/chat",
      body: {
        conversationId,
      },
      prepareSendMessagesRequest: ({ messages, body }) => {
        return {
          body: {
            ...body,
            messages: messages.map((m) => {
              const textContent = m.parts
                .filter((p) => p.type === "text")
                .map((p) => (p as any).text)
                .join("");
              return {
                role: m.role,
                content: textContent,
              };
            }),
          },
        };
      },
    })
  );

  // Vercel AI SDK Hook
  const { messages, sendMessage, status, error } = useChat({
    transport: transportRef.current,
    messages: initialMessages.map((m) => ({
      id: m.id,
      role: m.role,
      parts: [
        {
          type: "text",
          text: m.content,
          state: "done",
        },
      ],
    })),
  });

  const isLoading = status === "streaming" || status === "submitted";

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;
    sendMessage({ text: input });
    setInput("");
  };

  // Auto scroll to bottom
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  return (
    <div className="flex flex-col h-[calc(100vh-140px)] border rounded-2xl bg-card/15 backdrop-blur-md overflow-hidden">
      {/* Chat header */}
      <div className="flex items-center justify-between border-b px-6 py-4 bg-card/40">
        <div className="flex items-center gap-3">
          <Link href={`/${workspaceId}/knowledge`}>
            <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h2 className="text-sm font-semibold text-foreground flex items-center gap-1.5">
              <Sparkles className="h-4 w-4 text-violet-500 animate-pulse" />
              AI Assistant
            </h2>
            {documentName && (
              <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5 max-w-[280px] sm:max-w-[400px] truncate">
                <FileText className="h-3 w-3 shrink-0" />
                Querying: {documentName}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Messages area */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-6 space-y-4"
        style={{ scrollBehavior: "smooth" }}
      >
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center max-w-sm mx-auto animate-fade-in">
            <div className="rounded-2xl bg-violet-500/10 p-4 text-violet-500 mb-4 border border-violet-500/15">
              <Sparkles className="h-8 w-8 animate-bounce" />
            </div>
            <h3 className="font-semibold text-foreground text-base">Knowledge Hub Chat</h3>
            <p className="text-sm text-muted-foreground mt-2 leading-relaxed">
              Ask anything about your workspace files, request task breakdowns, or generate design drafts directly.
            </p>
          </div>
        ) : (
          messages.map((message) => {
            const content = message.parts
              .filter((p) => p.type === "text")
              .map((p) => (p as any).text)
              .join("");
            return (
              <ChatMessage
                key={message.id}
                role={message.role}
                content={content}
              />
            );
          })
        )}

        {isLoading && messages[messages.length - 1]?.role !== "assistant" && (
          <div className="flex gap-4 p-5 rounded-2xl bg-card/45 border border-primary/5 shadow-sm ml-auto mr-auto w-fit items-center animate-pulse">
            <Loader2 className="h-4 w-4 text-primary animate-spin" />
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">
              AI is writing...
            </span>
          </div>
        )}
      </div>

      {/* Input container */}
      <div className="border-t p-4 bg-card/40">
        <form onSubmit={handleSubmit} className="flex gap-3">
          <Input
            value={input}
            onChange={handleInputChange}
            placeholder={
              documentName ? `Ask about "${documentName}"...` : "Ask AI a question or query..."
            }
            className="flex-1 h-11 border-border/80 bg-card/20 placeholder:text-muted-foreground/60 focus-visible:ring-primary/45 rounded-xl text-sm"
          />
          <Button type="submit" disabled={!input.trim() || isLoading} className="h-11 px-5 rounded-xl shadow-lg shadow-primary/10">
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <>
                <Send className="h-4 w-4" />
                <span className="sr-only">Send message</span>
              </>
            )}
          </Button>
        </form>
      </div>
    </div>
  );
}

