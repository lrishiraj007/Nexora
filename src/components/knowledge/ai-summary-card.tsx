// ═══════════════════════════════════════════════════════════
// AI Document Summary Card
// Renders AI analysis insights and handles auto-importing tasks
// ═══════════════════════════════════════════════════════════

"use client";

import { useState } from "react";
import { Sparkles, CheckCircle2, ChevronRight, Loader2, AlertCircle } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { importSuggestedTasks } from "@/actions/knowledge.actions";
import type { AISummaryResponse } from "@/types/ai";

interface AISummaryCardProps {
  workspaceId: string;
  creatorId: string;
  documentName: string;
  summaryData: AISummaryResponse;
  onClose: () => void;
}

export function AISummaryCard({
  workspaceId,
  creatorId,
  documentName,
  summaryData,
  onClose,
}: AISummaryCardProps) {
  const [isImporting, setIsImporting] = useState(false);
  const [isImported, setIsImported] = useState(false);

  async function handleImport() {
    setIsImporting(true);
    try {
      const result = await importSuggestedTasks(workspaceId, creatorId, summaryData.suggestedTasks);
      if (result.success) {
        setIsImported(true);
        toast.success(`Successfully imported ${summaryData.suggestedTasks.length} tasks to the Kanban board!`);
      } else {
        toast.error(result.error || "Failed to import tasks");
      }
    } catch (error) {
      toast.error("Failed to import suggested tasks");
    } finally {
      setIsImporting(false);
    }
  }

  return (
    <div className="rounded-2xl border border-primary/20 bg-card/60 p-6 shadow-xl shadow-primary/5 backdrop-blur-md animate-scale-in">
      <div className="flex items-start justify-between border-b pb-4">
        <div className="flex items-center gap-2">
          <div className="rounded-lg bg-primary/10 p-2 text-primary">
            <Sparkles className="h-5 w-5 animate-pulse" />
          </div>
          <div>
            <h3 className="font-semibold text-foreground">AI Document Analysis</h3>
            <p className="text-xs text-muted-foreground truncate max-w-[200px]">
              {documentName}
            </p>
          </div>
        </div>
        <Button variant="ghost" size="sm" onClick={onClose}>
          Close
        </Button>
      </div>

      <div className="mt-5 space-y-5">
        {/* Summary text */}
        <div>
          <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Executive Summary
          </h4>
          <p className="mt-1.5 text-sm text-foreground/90 leading-relaxed bg-muted/30 rounded-xl p-3.5 border">
            {summaryData.summary}
          </p>
        </div>

        {/* Key bullet points */}
        <div>
          <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Key Insights
          </h4>
          <ul className="mt-2 space-y-2">
            {summaryData.keyPoints.map((point, index) => (
              <li key={index} className="flex items-start gap-2.5 text-sm">
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" />
                <span className="text-foreground/85">{point}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Suggested Kanban tasks */}
        <div>
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Suggested Tasks ({summaryData.suggestedTasks.length})
            </h4>
            {isImported ? (
              <span className="text-xs font-medium text-emerald-500 flex items-center gap-1">
                <CheckCircle2 className="h-3.5 w-3.5" /> Imported
              </span>
            ) : null}
          </div>

          <div className="mt-2.5 space-y-2 max-h-[220px] overflow-y-auto pr-1">
            {summaryData.suggestedTasks.map((task, idx) => (
              <div
                key={idx}
                className="flex items-start gap-3 rounded-xl border bg-muted/40 p-3 hover:bg-muted/65 transition-colors"
              >
                <div
                  className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${
                    task.priority === "URGENT" || task.priority === "HIGH"
                      ? "bg-rose-500"
                      : task.priority === "MEDIUM"
                      ? "bg-amber-500"
                      : "bg-slate-400"
                  }`}
                />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">{task.title}</p>
                  <p className="text-xs text-muted-foreground line-clamp-2 mt-0.5">
                    {task.description}
                  </p>
                  <span className="inline-block mt-1.5 rounded-md bg-muted px-2 py-0.5 text-[10px] font-medium text-muted-foreground">
                    {task.priority}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Auto Import CTA */}
        {!isImported ? (
          <Button
            onClick={handleImport}
            disabled={isImporting}
            className="w-full justify-center gap-2 mt-2 shadow-lg shadow-primary/10"
          >
            {isImporting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Importing tasks...
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4" />
                Populate tasks to Kanban board
              </>
            )}
          </Button>
        ) : (
          <Button disabled className="w-full bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
            <CheckCircle2 className="h-4 w-4 mr-2" />
            Tasks populated successfully!
          </Button>
        )}
      </div>
    </div>
  );
}
