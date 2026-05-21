// ═══════════════════════════════════════════════════════════
// AI Insights Card Component
// Dynamic AI-generated workspace health report & recommendations
// ═══════════════════════════════════════════════════════════

"use client";

import { useState, useEffect } from "react";
import { Sparkles, RefreshCw } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { getAIInsights } from "@/actions/dashboard.actions";

interface AIInsightsCardProps {
  workspaceId: string;
  initialInsights?: string;
}

export function AIInsightsCard({ workspaceId, initialInsights = "" }: AIInsightsCardProps) {
  const [insights, setInsights] = useState<string>(initialInsights);
  const [isLoading, setIsLoading] = useState<boolean>(!initialInsights);

  const fetchInsights = async () => {
    setIsLoading(true);
    try {
      const res = await getAIInsights(workspaceId);
      if (res.success) {
        setInsights(res.data);
      } else {
        toast.error(res.error || "Failed to load AI insights");
      }
    } catch (error) {
      console.error(error);
      toast.error("An error occurred while generating insights");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!initialInsights) {
      fetchInsights();
    }
  }, [workspaceId]);

  return (
    <Card className="relative overflow-hidden border-border/40 bg-card/45 backdrop-blur-md h-full flex flex-col group">
      {/* Decorative background glow */}
      <div className="absolute -top-12 -right-12 h-24 w-24 rounded-full bg-indigo-500/10 blur-xl transition-all duration-500 group-hover:bg-indigo-500/20" />
      <div className="absolute -bottom-12 -left-12 h-24 w-24 rounded-full bg-pink-500/10 blur-xl transition-all duration-500 group-hover:bg-pink-500/20" />

      <CardHeader className="pb-4 flex flex-row items-center justify-between space-y-0 gap-4">
        <div>
          <CardTitle className="text-sm font-semibold tracking-tight flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-indigo-500 animate-pulse" />
            AI Project Advisor
          </CardTitle>
          <CardDescription className="text-xs text-muted-foreground/80 font-medium mt-1">
            Real-time project health & bottlenecks
          </CardDescription>
        </div>
        <Button
          variant="outline"
          size="icon"
          onClick={fetchInsights}
          disabled={isLoading}
          className="h-8 w-8 border-border/80 hover:bg-muted/50 rounded-xl"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${isLoading ? "animate-spin text-indigo-500" : "text-muted-foreground"}`} />
        </Button>
      </CardHeader>

      <CardContent className="flex-1 overflow-y-auto pr-2 scrollbar-thin">
        <AnimatePresence mode="wait">
          {isLoading ? (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-3 py-2"
            >
              <div className="h-4 w-1/3 rounded bg-muted/60 animate-pulse" />
              <div className="h-3 w-full rounded bg-muted/40 animate-pulse" />
              <div className="h-3 w-5/6 rounded bg-muted/40 animate-pulse" />
              <div className="h-3 w-4/5 rounded bg-muted/40 animate-pulse" />
              <div className="h-4.5 w-1/4 rounded bg-muted/60 animate-pulse mt-4" />
              <div className="h-3 w-11/12 rounded bg-muted/40 animate-pulse" />
              <div className="h-3 w-5/6 rounded bg-muted/40 animate-pulse" />
            </motion.div>
          ) : (
            <motion.div
              key="content"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
              className="prose prose-sm dark:prose-invert max-w-none text-xs text-foreground/90 font-medium space-y-3 leading-relaxed"
            >
              <ReactMarkdown
                components={{
                  h3: ({ node, ...props }) => (
                    <h3 className="text-xs font-bold text-foreground mt-4 mb-2 first:mt-0" {...props} />
                  ),
                  h4: ({ node, ...props }) => (
                    <h4 className="text-xs font-bold text-indigo-400 mt-3 mb-1" {...props} />
                  ),
                  p: ({ node, ...props }) => (
                    <p className="my-1.5 text-muted-foreground/95" {...props} />
                  ),
                  ul: ({ node, ...props }) => (
                    <ul className="list-disc pl-4 space-y-1 my-2" {...props} />
                  ),
                  li: ({ node, ...props }) => (
                    <li className="text-muted-foreground/95" {...props} />
                  ),
                  strong: ({ node, ...props }) => (
                    <strong className="font-extrabold text-foreground" {...props} />
                  ),
                }}
              >
                {insights}
              </ReactMarkdown>
            </motion.div>
          )}
        </AnimatePresence>
      </CardContent>
    </Card>
  );
}
