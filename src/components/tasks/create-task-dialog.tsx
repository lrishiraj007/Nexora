"use client";

import * as React from "react";
import { useParams } from "next/navigation";
import { Loader2, ListTodo } from "lucide-react";
import { toast } from "sonner";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { createTask } from "@/actions/task.actions";
import { getWorkspaceMembers } from "@/actions/workspace.actions";
import { useUIStore } from "@/stores/ui-store";
import { useSession } from "@/lib/auth-client";
import { TASK_STATUS_CONFIG, TASK_PRIORITY_CONFIG } from "@/lib/constants";

export function CreateTaskDialog() {
  const params = useParams();
  const workspaceId = params?.workspaceId as string | undefined;
  const { data: session } = useSession();
  const currentUserId = session?.user?.id;

  const { createTaskOpen, createTaskStatus, setCreateTaskOpen } = useUIStore();

  const [isPending, startTransition] = React.useTransition();
  const [members, setMembers] = React.useState<
    { id: string; name: string; image: string | null }[]
  >([]);

  // Form state
  const [title, setTitle] = React.useState("");
  const [description, setDescription] = React.useState("");
  const [status, setStatus] = React.useState<string>("TODO");
  const [priority, setPriority] = React.useState<string>("MEDIUM");
  const [assigneeId, setAssigneeId] = React.useState<string>("unassigned");
  const [dueDate, setDueDate] = React.useState("");

  // Sync status with which column's + was clicked
  React.useEffect(() => {
    if (createTaskOpen) {
      setStatus(createTaskStatus ?? "TODO");
      setTitle("");
      setDescription("");
      setPriority("MEDIUM");
      setAssigneeId("unassigned");
      setDueDate("");
    }
  }, [createTaskOpen, createTaskStatus]);

  // Load workspace members once when dialog opens
  React.useEffect(() => {
    if (!createTaskOpen || !workspaceId) return;
    getWorkspaceMembers(workspaceId).then((res) => {
      if (res.success && res.data) setMembers(res.data);
    });
  }, [createTaskOpen, workspaceId]);

  function handleClose() {
    if (!isPending) setCreateTaskOpen(false);
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (!title.trim()) {
      toast.error("Task title is required");
      return;
    }
    if (!workspaceId || !currentUserId) {
      toast.error("Cannot create task outside of a workspace");
      return;
    }

    startTransition(async () => {
      const result = await createTask({
        title: title.trim(),
        description: description || undefined,
        status,
        priority,
        assigneeId: assigneeId === "unassigned" ? null : assigneeId,
        dueDate: dueDate ? new Date(dueDate).toISOString() : null,
        workspaceId,
        creatorId: currentUserId,
      });

      if (result.success) {
        toast.success(`Task "${title.trim()}" created`);
        setCreateTaskOpen(false);
      } else {
        toast.error(result.error || "Failed to create task");
      }
    });
  }

  return (
    <Dialog open={createTaskOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="sm:max-w-lg border border-border/80 bg-popover/95 backdrop-blur-md shadow-2xl p-6">
        <DialogHeader className="mb-4">
          <DialogTitle className="text-xl font-bold flex items-center gap-2 bg-gradient-to-r from-indigo-400 to-violet-500 bg-clip-text text-transparent">
            <ListTodo className="h-5 w-5 text-indigo-400" />
            New Task
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground/80 mt-1">
            Add a task to your workspace board. You can refine the details later.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Title */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-muted-foreground tracking-wider uppercase">
              Title <span className="text-destructive">*</span>
            </label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Fix login bug"
              disabled={isPending}
              autoFocus
              className="bg-muted/10 border-border/60 hover:border-border focus:bg-background"
            />
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-muted-foreground tracking-wider uppercase">
              Description <span className="text-muted-foreground/50 font-normal">(optional)</span>
            </label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Add more context..."
              disabled={isPending}
              rows={3}
              className="bg-muted/10 border-border/60 hover:border-border focus:bg-background resize-none text-xs"
            />
          </div>

          {/* Status + Priority row */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground tracking-wider uppercase">
                Status
              </label>
              <Select value={status} onValueChange={(v) => v && setStatus(v)}>
                <SelectTrigger className="w-full bg-muted/10 border-border/60 text-xs">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(TASK_STATUS_CONFIG).map(([key, cfg]) => (
                    <SelectItem key={key} value={key} className="text-xs">
                      {cfg.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground tracking-wider uppercase">
                Priority
              </label>
              <Select value={priority} onValueChange={(v) => v && setPriority(v)}>
                <SelectTrigger className="w-full bg-muted/10 border-border/60 text-xs">
                  <SelectValue placeholder="Select priority" />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(TASK_PRIORITY_CONFIG).map(([key, cfg]) => (
                    <SelectItem key={key} value={key} className="text-xs">
                      {cfg.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Assignee + Due Date row */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground tracking-wider uppercase">
                Assignee
              </label>
              <Select value={assigneeId} onValueChange={(v) => v && setAssigneeId(v)}>
                <SelectTrigger className="w-full bg-muted/10 border-border/60 text-xs">
                  <SelectValue placeholder="Unassigned" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="unassigned" className="text-xs">
                    Unassigned
                  </SelectItem>
                  {members.map((m) => (
                    <SelectItem key={m.id} value={m.id} className="text-xs">
                      {m.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground tracking-wider uppercase">
                Due Date
              </label>
              <Input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                disabled={isPending}
                className="bg-muted/10 border-border/60 text-xs cursor-pointer"
              />
            </div>
          </div>

          <DialogFooter className="pt-2 border-t border-border/30">
            <DialogClose
              render={
                <Button type="button" variant="outline" disabled={isPending}>
                  Cancel
                </Button>
              }
            />
            <Button
              type="submit"
              disabled={isPending || !title.trim()}
              className="bg-gradient-to-r from-indigo-500 to-violet-600 hover:from-indigo-600 hover:to-violet-700 text-white min-w-[120px] shadow-lg shadow-indigo-500/10 cursor-pointer"
            >
              {isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : (
                "Create Task"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
