// ═══════════════════════════════════════════════════════════
// Task Detail Panel
// Premium sliding panel for viewing, editing, and discussing tasks
// ═══════════════════════════════════════════════════════════

"use client";

import { useEffect, useState } from "react";
import { format } from "date-fns";
import {
  Loader2,
  Calendar,
  User as UserIcon,
  Trash2,
  AlertCircle,
  Tag as TagIcon,
  FileText,
  Bookmark,
  CheckCircle,
} from "lucide-react";
import { toast } from "sonner";

import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
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
import { CommentSection } from "@/components/realtime/comment-section";
import { getTaskById, updateTask, deleteTask } from "@/actions/task.actions";
import { getWorkspaceMembers } from "@/actions/workspace.actions";
import { TASK_STATUS_CONFIG, TASK_PRIORITY_CONFIG } from "@/lib/constants";
import type { TaskWithRelations, TaskStatus, TaskPriority } from "@/types";

interface TaskDetailPanelProps {
  taskId: string | null;
  workspaceId: string;
  currentUserId: string;
  onClose: () => void;
  onTaskUpdated?: () => void;
  onTaskDeleted?: () => void;
}

export function TaskDetailPanel({
  taskId,
  workspaceId,
  currentUserId,
  onClose,
  onTaskUpdated,
  onTaskDeleted,
}: TaskDetailPanelProps) {
  const [task, setTask] = useState<TaskWithRelations | null>(null);
  const [members, setMembers] = useState<{ id: string; name: string; image: string | null }[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Local form states
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [dueDate, setDueDate] = useState("");

  // 1. Load task details and workspace members
  useEffect(() => {
    if (!taskId) {
      setTask(null);
      return;
    }

    async function loadData() {
      setIsLoading(true);
      try {
        const [taskRes, membersRes] = await Promise.all([
          getTaskById(taskId!),
          getWorkspaceMembers(workspaceId),
        ]);

        if (taskRes.success) {
          setTask(taskRes.data);
          setTitle(taskRes.data.title);
          setDescription(taskRes.data.description || "");
          setDueDate(
            taskRes.data.dueDate
              ? format(new Date(taskRes.data.dueDate), "yyyy-MM-dd")
              : ""
          );
        } else {
          toast.error(taskRes.error || "Failed to load task details");
          onClose();
        }

        if (membersRes.success && membersRes.data) {
          setMembers(membersRes.data);
        }
      } catch (err) {
        console.error("Error loading task detail data:", err);
        toast.error("An unexpected error occurred");
      } finally {
        setIsLoading(false);
      }
    }

    loadData();
  }, [taskId, workspaceId, onClose]);

  // 2. Handler to update general text fields on blur
  async function handleFieldBlur() {
    if (!task) return;
    
    // Skip if unchanged
    if (title.trim() === task.title && description === (task.description || "")) {
      return;
    }

    if (!title.trim()) {
      setTitle(task.title);
      toast.error("Task title cannot be empty");
      return;
    }

    setIsSaving(true);
    const res = await updateTask(
      task.id,
      {
        title: title.trim(),
        description: description,
      },
      currentUserId
    );

    if (res.success) {
      setTask((prev) => (prev ? { ...prev, title: title.trim(), description } : null));
      toast.success("Task details saved");
      onTaskUpdated?.();
    } else {
      toast.error(res.error || "Failed to update task");
      setTitle(task.title);
      setDescription(task.description || "");
    }
    setIsSaving(false);
  }

  // 3. Handler to update select dropdowns (status, priority, assignee)
  async function handleSelectChange(field: "status" | "priority" | "assigneeId", value: string | null) {
    if (!task || !value) return;

    setIsSaving(true);
    const updateData: any = {};
    if (field === "assigneeId") {
      updateData.assigneeId = value === "unassigned" ? null : value;
    } else {
      updateData[field] = value;
    }

    const res = await updateTask(task.id, updateData, currentUserId);

    if (res.success) {
      setTask((prev) => {
        if (!prev) return null;
        const updated = { ...prev };
        if (field === "status") updated.status = value as TaskStatus;
        if (field === "priority") updated.priority = value as TaskPriority;
        if (field === "assigneeId") {
          updated.assigneeId = value === "unassigned" ? null : value;
          updated.assignee =
            value === "unassigned"
              ? null
              : members.find((m) => m.id === value) || null;
        }
        return updated;
      });
      toast.success(`Task ${field} updated successfully`);
      onTaskUpdated?.();
    } else {
      toast.error(res.error || "Failed to update task");
    }
    setIsSaving(false);
  }

  // 4. Handler to update due date
  async function handleDueDateChange(e: React.ChangeEvent<HTMLInputElement>) {
    const val = e.target.value;
    setDueDate(val);

    if (!task) return;

    setIsSaving(true);
    const res = await updateTask(
      task.id,
      { dueDate: val ? new Date(val).toISOString() : null },
      currentUserId
    );

    if (res.success) {
      setTask((prev) => (prev ? { ...prev, dueDate: val ? new Date(val) : null } : null));
      toast.success("Due date updated");
      onTaskUpdated?.();
    } else {
      toast.error(res.error || "Failed to update due date");
    }
    setIsSaving(false);
  }

  // 5. Handler to delete task
  async function handleDeleteTask() {
    if (!task) return;

    if (!window.confirm("Are you sure you want to delete this task? This action cannot be undone.")) {
      return;
    }

    setIsDeleting(true);
    const res = await deleteTask(task.id, currentUserId);
    if (res.success) {
      toast.success("Task deleted successfully");
      onTaskDeleted?.();
      onClose();
    } else {
      toast.error(res.error || "Failed to delete task");
    }
    setIsDeleting(false);
  }

  return (
    <Sheet open={!!taskId} onOpenChange={(open) => !open && onClose()}>
      <SheetContent className="w-full sm:max-w-xl p-0 flex flex-col h-full bg-background border-l border-border/60">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center flex-1 space-y-3">
            <Loader2 className="h-8 w-8 text-primary animate-spin" />
            <p className="text-xs text-muted-foreground">Loading task details...</p>
          </div>
        ) : task ? (
          <div className="flex flex-col h-full overflow-hidden">
            {/* Header section with styling */}
            <SheetHeader className="p-6 pb-4 border-b border-border/40 bg-muted/10">
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <Bookmark className="h-3.5 w-3.5 text-violet-500" />
                  <span>Task ID: {task.id.slice(-6).toUpperCase()}</span>
                </div>
                <div className="flex items-center gap-2">
                  {isSaving && (
                    <span className="flex items-center gap-1 text-[10px] text-muted-foreground/80 font-medium">
                      <Loader2 className="h-3 w-3 animate-spin text-primary" />
                      Saving...
                    </span>
                  )}
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-muted-foreground hover:text-destructive rounded-lg"
                    onClick={handleDeleteTask}
                    disabled={isDeleting}
                  >
                    {isDeleting ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Trash2 className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>

              {/* Editable Title */}
              <div className="mt-4">
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  onBlur={handleFieldBlur}
                  className="w-full text-lg font-bold bg-transparent border-0 outline-none p-0 focus:ring-0 focus:border-b focus:border-primary/60 text-foreground transition-all placeholder:text-muted-foreground/50"
                  placeholder="Task title"
                />
              </div>
            </SheetHeader>

            {/* Scrollable details and discussion */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {/* Properties Grid */}
              <div className="grid grid-cols-2 gap-y-4 gap-x-6 bg-muted/15 border border-border/30 rounded-xl p-4.5">
                {/* Status selector */}
                <div className="space-y-1.5">
                  <label className="text-[11px] font-semibold text-muted-foreground flex items-center gap-1 uppercase tracking-wider">
                    <CheckCircle className="h-3 w-3 text-indigo-500" />
                    Status
                  </label>
                  <Select
                    value={task.status}
                    onValueChange={(val) => handleSelectChange("status", val)}
                  >
                    <SelectTrigger className="w-full h-8.5 text-xs bg-card/65 font-medium border-border/50">
                      <SelectValue placeholder="Select Status" />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(TASK_STATUS_CONFIG).map(([key, value]) => (
                        <SelectItem key={key} value={key} className="text-xs">
                          {value.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Priority selector */}
                <div className="space-y-1.5">
                  <label className="text-[11px] font-semibold text-muted-foreground flex items-center gap-1 uppercase tracking-wider">
                    <AlertCircle className="h-3 w-3 text-amber-500" />
                    Priority
                  </label>
                  <Select
                    value={task.priority}
                    onValueChange={(val) => handleSelectChange("priority", val)}
                  >
                    <SelectTrigger className="w-full h-8.5 text-xs bg-card/65 font-medium border-border/50">
                      <SelectValue placeholder="Select Priority" />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(TASK_PRIORITY_CONFIG).map(([key, value]) => (
                        <SelectItem key={key} value={key} className="text-xs">
                          {value.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Assignee selector */}
                <div className="space-y-1.5">
                  <label className="text-[11px] font-semibold text-muted-foreground flex items-center gap-1 uppercase tracking-wider">
                    <UserIcon className="h-3 w-3 text-pink-500" />
                    Assignee
                  </label>
                  <Select
                    value={task.assigneeId || "unassigned"}
                    onValueChange={(val) => handleSelectChange("assigneeId", val)}
                  >
                    <SelectTrigger className="w-full h-8.5 text-xs bg-card/65 font-medium border-border/50">
                      <SelectValue placeholder="Unassigned" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="unassigned" className="text-xs">
                        Unassigned
                      </SelectItem>
                      {members.map((member) => (
                        <SelectItem key={member.id} value={member.id} className="text-xs">
                          {member.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Due Date input */}
                <div className="space-y-1.5">
                  <label className="text-[11px] font-semibold text-muted-foreground flex items-center gap-1 uppercase tracking-wider">
                    <Calendar className="h-3 w-3 text-emerald-500" />
                    Due Date
                  </label>
                  <Input
                    type="date"
                    value={dueDate}
                    onChange={handleDueDateChange}
                    className="h-8.5 text-xs bg-card/65 border-border/50 font-medium cursor-pointer"
                  />
                </div>
              </div>

              {/* Tags Section */}
              {task.tags && task.tags.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-[11px] font-semibold text-muted-foreground flex items-center gap-1.5 uppercase tracking-wider">
                    <TagIcon className="h-3.5 w-3.5" />
                    Tags
                  </h4>
                  <div className="flex flex-wrap gap-1.5">
                    {task.tags.map(({ tag }) => (
                      <span
                        key={tag.id}
                        className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold"
                        style={{
                          backgroundColor: tag.color + "15",
                          color: tag.color,
                        }}
                      >
                        {tag.name}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Description Section */}
              <div className="space-y-2">
                <h4 className="text-[11px] font-semibold text-muted-foreground flex items-center gap-1.5 uppercase tracking-wider">
                  <FileText className="h-3.5 w-3.5 text-primary" />
                  Description
                </h4>
                <Textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  onBlur={handleFieldBlur}
                  className="min-h-[100px] text-sm bg-card/25 border-border/60 hover:bg-card/35 transition-colors focus:bg-card/40 rounded-xl leading-relaxed py-3 px-4 resize-none"
                  placeholder="Add a detailed description for this task..."
                />
              </div>

              {/* Discussion Section */}
              <div className="pt-2">
                <CommentSection taskId={task.id} currentUserId={currentUserId} />
              </div>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center flex-1 text-center py-12 text-muted-foreground">
            <AlertCircle className="h-10 w-10 text-muted-foreground/45 mb-2" />
            <p className="text-sm">Task could not be found or loaded.</p>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
