// ═══════════════════════════════════════════════════════════
// AI Chat Message Component
// Renders user/assistant chat bubbles with rich Markdown syntax
// ═══════════════════════════════════════════════════════════

"use client";

import { Sparkles, User } from "lucide-react";
import ReactMarkdown from "react-markdown";

import { cn } from "@/lib/utils";

interface ChatMessageProps {
  role: "user" | "assistant" | "system";
  content: string;
}

export function ChatMessage({ role, content }: ChatMessageProps) {
  const isAssistant = role === "assistant";

  return (
    <div
      className={cn(
        "flex gap-4 p-5 rounded-2xl transition-all duration-200 animate-fade-in",
        isAssistant
          ? "bg-card/45 border border-primary/5 shadow-sm shadow-primary/2"
          : "bg-primary/8 border border-primary/10 ml-12 md:ml-24"
      )}
    >
      {/* Icon/Avatar */}
      <div
        className={cn(
          "flex h-9 w-9 shrink-0 select-none items-center justify-center rounded-xl text-sm font-semibold shadow-sm",
          isAssistant
            ? "bg-violet-500/10 text-violet-500 border border-violet-500/20"
            : "bg-primary/15 text-primary border border-primary/25 ml-auto order-last"
        )}
      >
        {isAssistant ? <Sparkles className="h-4.5 w-4.5" /> : <User className="h-4.5 w-4.5" />}
      </div>

      {/* Message content */}
      <div className={cn("flex-1 min-w-0 space-y-2", !isAssistant && "text-right")}>
        <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">
          {isAssistant ? "AI Assistant" : "You"}
        </span>

        {isAssistant ? (
          <div className="prose prose-sm dark:prose-invert max-w-none text-foreground/90 leading-relaxed text-left">
            <ReactMarkdown
              components={{
                p: ({ children }) => <p className="mb-3 last:mb-0">{children}</p>,
                ul: ({ children }) => <ul className="list-disc pl-5 mb-3 space-y-1">{children}</ul>,
                ol: ({ children }) => <ol className="list-decimal pl-5 mb-3 space-y-1">{children}</ol>,
                li: ({ children }) => <li className="text-sm">{children}</li>,
                h1: ({ children }) => <h1 className="text-lg font-bold mt-4 mb-2 text-foreground">{children}</h1>,
                h2: ({ children }) => <h2 className="text-base font-semibold mt-3 mb-1.5 text-foreground">{children}</h2>,
                h3: ({ children }) => <h3 className="text-sm font-semibold mt-2 mb-1 text-foreground">{children}</h3>,
                code: ({ children }) => (
                  <code className="bg-muted px-1.5 py-0.5 rounded text-xs font-mono border text-primary">
                    {children}
                  </code>
                ),
                pre: ({ children }) => (
                  <pre className="bg-muted/70 p-4 rounded-xl border font-mono text-xs overflow-x-auto my-3 text-left">
                    {children}
                  </pre>
                ),
                blockquote: ({ children }) => (
                  <blockquote className="border-l-4 border-primary/40 pl-3 italic text-muted-foreground my-2.5">
                    {children}
                  </blockquote>
                ),
              }}
            >
              {content}
            </ReactMarkdown>
          </div>
        ) : (
          <p className="text-sm text-foreground/95 leading-relaxed text-right whitespace-pre-wrap">
            {content}
          </p>
        )}
      </div>
    </div>
  );
}
