"use client";

import { useEffect, useState, useRef } from "react";
import { createComment, deleteComment, getComments } from "@/actions/comment.actions";
import { useRealtime } from "@/hooks/use-realtime";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import type { CommentWithAuthor } from "@/types";
import { formatDistanceToNow } from "date-fns";
import { Trash2, Send, MessageSquare, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";

interface CommentSectionProps {
  taskId: string;
  currentUserId: string;
}

export function CommentSection({ taskId, currentUserId }: CommentSectionProps) {
  const [comments, setComments] = useState<CommentWithAuthor[]>([]);
  const [newComment, setNewComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  // 1. Fetch initial comments
  useEffect(() => {
    async function loadComments() {
      setIsLoading(true);
      const res = await getComments(taskId);
      if (res.success) {
        setComments(res.data);
      } else {
        toast.error("Failed to load comments");
      }
      setIsLoading(false);
    }
    loadComments();
  }, [taskId]);

  // 2. Realtime listeners via our useRealtime custom hook
  useRealtime<CommentWithAuthor>(
    `task-${taskId}`,
    "comment-added",
    (comment) => {
      setComments((prev) => {
        // Prevent duplicate appending
        if (prev.some((c) => c.id === comment.id)) return prev;
        return [...prev, comment];
      });
      // Scroll to bottom
      setTimeout(() => {
        if (scrollRef.current) {
          scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
      }, 100);
    }
  );

  useRealtime<{ commentId: string }>(
    `task-${taskId}`,
    "comment-deleted",
    ({ commentId }) => {
      setComments((prev) => prev.filter((c) => c.id !== commentId));
    }
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() || isSubmitting) return;

    setIsSubmitting(true);
    const res = await createComment({
      content: newComment.trim(),
      taskId,
      authorId: currentUserId,
    });

    if (res.success) {
      setNewComment("");
      setComments((prev) => {
        if (prev.some((c) => c.id === res.data.id)) return prev;
        return [...prev, res.data];
      });
      setTimeout(() => {
        if (scrollRef.current) {
          scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
      }, 100);
    } else {
      toast.error(res.error || "Failed to post comment");
    }
    setIsSubmitting(false);
  };

  const handleDelete = async (commentId: string) => {
    setDeletingId(commentId);
    const res = await deleteComment(commentId, currentUserId);
    if (res.success) {
      setComments((prev) => prev.filter((c) => c.id !== commentId));
      toast.success("Comment deleted");
    } else {
      toast.error(res.error || "Failed to delete comment");
    }
    setDeletingId(null);
  };

  return (
    <div className="flex flex-col h-[400px] border rounded-xl bg-card/25 overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-2 border-b px-4 py-3 bg-muted/30">
        <MessageSquare className="h-4 w-4 text-violet-500" />
        <h3 className="text-sm font-semibold">Discussion ({comments.length})</h3>
      </div>

      {/* Comment Feed */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-4 space-y-4"
        style={{ scrollBehavior: "smooth" }}
      >
        {isLoading ? (
          <div className="flex items-center justify-center h-full">
            <Loader2 className="h-6 w-6 text-primary animate-spin" />
          </div>
        ) : comments.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center py-6 text-muted-foreground">
            <MessageSquare className="h-8 w-8 text-muted-foreground/30 mb-2" />
            <p className="text-xs">No comments yet. Start the conversation!</p>
          </div>
        ) : (
          <div className="space-y-4">
            <AnimatePresence initial={false}>
              {comments.map((comment) => {
                const isAuthor = comment.authorId === currentUserId;
                return (
                  <motion.div
                    key={comment.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="flex gap-3 text-sm group"
                  >
                    <Avatar className="h-8 w-8 border shrink-0">
                      {comment.author.image && (
                        <AvatarImage src={comment.author.image} alt={comment.author.name} />
                      )}
                      <AvatarFallback className="text-[10px] bg-primary/10 text-primary font-bold">
                        {comment.author.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")
                          .toUpperCase()
                          .slice(0, 2)}
                      </AvatarFallback>
                    </Avatar>

                    <div className="flex-1 space-y-1">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-foreground">{comment.author.name}</span>
                          <span className="text-[10px] text-muted-foreground/80">
                            {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
                          </span>
                        </div>
                        {isAuthor && (
                          <button
                            onClick={() => handleDelete(comment.id)}
                            disabled={deletingId === comment.id}
                            className="text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded hover:bg-muted duration-200"
                          >
                            {deletingId === comment.id ? (
                              <Loader2 className="h-3 w-3 animate-spin" />
                            ) : (
                              <Trash2 className="h-3 w-3" />
                            )}
                          </button>
                        )}
                      </div>
                      <p className="text-muted-foreground leading-relaxed text-[13px] bg-muted/10 p-2 rounded-lg border border-border/20">
                        {comment.content}
                      </p>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* Input Form */}
      <div className="border-t p-3 bg-card/45">
        <form onSubmit={handleSubmit} className="flex gap-2 items-end">
          <Textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Type a comment..."
            className="flex-1 min-h-[44px] h-[44px] resize-none border-border bg-card/20 rounded-lg text-xs py-2 px-3"
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSubmit(e);
              }
            }}
          />
          <Button
            type="submit"
            disabled={!newComment.trim() || isSubmitting}
            size="icon"
            className="h-[44px] w-[44px] shrink-0 rounded-lg shadow-md shadow-primary/5"
          >
            {isSubmitting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
        </form>
      </div>
    </div>
  );
}
