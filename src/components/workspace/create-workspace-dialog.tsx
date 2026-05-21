// ═══════════════════════════════════════════════════════════
// Create Workspace Dialog Component
// Premium dialog for creating a database-backed workspace
// ═══════════════════════════════════════════════════════════

"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Loader2 } from "lucide-react";
import { toast } from "sonner";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { createWorkspace } from "@/actions/workspace.actions";

// Premium color presets matching the Nexora theme palette
const COLORS = [
  { name: "Indigo", hex: "#6366f1", bg: "bg-indigo-500", glow: "shadow-indigo-500/20" },
  { name: "Violet", hex: "#8b5cf6", bg: "bg-violet-500", glow: "shadow-violet-500/20" },
  { name: "Pink", hex: "#ec4899", bg: "bg-pink-500", glow: "shadow-pink-500/20" },
  { name: "Emerald", hex: "#10b981", bg: "bg-emerald-500", glow: "shadow-emerald-500/20" },
  { name: "Orange", hex: "#f97316", bg: "bg-orange-500", glow: "shadow-orange-500/20" },
  { name: "Cyan", hex: "#06b6d4", bg: "bg-cyan-500", glow: "shadow-cyan-500/20" },
];

// Fun, high-quality emoji presets for workspace identity
const EMOJIS = ["🚀", "💡", "🎯", "💻", "🎨", "📢", "🔑", "🌟", "🛠️", "🧠", "📈", "🔒"];

interface CreateWorkspaceDialogProps {
  trigger: React.ReactElement;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function CreateWorkspaceDialog({
  trigger,
  open: controlledOpen,
  onOpenChange: controlledOnOpenChange,
}: CreateWorkspaceDialogProps) {
  const router = useRouter();
  const [uncontrolledOpen, setUncontrolledOpen] = React.useState(false);
  const [isPending, startTransition] = React.useTransition();

  // Form states
  const [name, setName] = React.useState("");
  const [description, setDescription] = React.useState("");
  const [selectedColor, setSelectedColor] = React.useState(COLORS[0].hex);
  const [selectedEmoji, setSelectedEmoji] = React.useState(EMOJIS[0]);

  // Handle controlled vs uncontrolled open state
  const open = controlledOpen !== undefined ? controlledOpen : uncontrolledOpen;
  const setOpen = (newOpen: boolean) => {
    if (controlledOnOpenChange) {
      controlledOnOpenChange(newOpen);
    } else {
      setUncontrolledOpen(newOpen);
    }
  };

  // Reset form when dialog opens/closes
  React.useEffect(() => {
    if (open) {
      setName("");
      setDescription("");
      setSelectedColor(COLORS[0].hex);
      setSelectedEmoji(EMOJIS[0]);
    }
  }, [open]);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (!name.trim()) {
      toast.error("Please enter a workspace name");
      return;
    }

    if (name.length < 2) {
      toast.error("Name must be at least 2 characters");
      return;
    }

    if (name.length > 50) {
      toast.error("Name must be less than 50 characters");
      return;
    }

    const formData = new FormData();
    formData.append("name", name);
    formData.append("description", description);
    formData.append("color", selectedColor);
    formData.append("icon", selectedEmoji);

    startTransition(async () => {
      const result = await createWorkspace(formData);
      if (result.success) {
        toast.success(`Workspace "${name}" created!`);
        setOpen(false);
        router.push(`/${result.data.id}`);
      } else {
        toast.error(result.error || "Failed to create workspace");
      }
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={trigger} />
      <DialogContent className="sm:max-w-md md:max-w-lg border border-border/80 bg-popover/95 backdrop-blur-md shadow-2xl p-6">
        <DialogHeader className="mb-4">
          <DialogTitle className="text-xl font-bold flex items-center gap-2 bg-gradient-to-r from-indigo-400 to-violet-500 bg-clip-text text-transparent">
            <Sparkles className="h-5 w-5 text-indigo-400" />
            Create Workspace
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground/80 mt-1">
            Design a premium environment for your team's projects and AI knowledge base.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Main Form Fields & Preview Layout */}
          <div className="grid gap-5 md:grid-cols-5">
            {/* Form Fields */}
            <div className="space-y-4 md:col-span-3">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-muted-foreground tracking-wider uppercase">
                  Workspace Name
                </label>
                <Input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Engineering"
                  disabled={isPending}
                  required
                  className="bg-muted/10 border-border/60 hover:border-border focus:bg-background"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-muted-foreground tracking-wider uppercase">
                  Description <span className="text-muted-foreground/50 font-normal">(optional)</span>
                </label>
                <Textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Software development, tracking tasks, etc."
                  disabled={isPending}
                  rows={3}
                  className="bg-muted/10 border-border/60 hover:border-border focus:bg-background resize-none text-xs"
                />
              </div>
            </div>

            {/* Live Preview Card */}
            <div className="md:col-span-2 flex flex-col justify-start space-y-2">
              <span className="text-xs font-semibold text-muted-foreground tracking-wider uppercase">
                Live Preview
              </span>
              <div className="rounded-xl border border-border/50 bg-muted/5 p-4 relative overflow-hidden transition-all duration-300 flex-1 flex flex-col justify-between min-h-[140px] shadow-sm select-none">
                {/* Glow border matching color choice */}
                <div
                  className="absolute top-0 left-0 right-0 h-1 transition-colors duration-300"
                  style={{ backgroundColor: selectedColor }}
                />
                
                <div>
                  <div className="flex items-center gap-2.5 mb-3">
                    <div
                      className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-lg shadow-sm transition-all duration-300"
                      style={{ backgroundColor: selectedColor + "15" }}
                    >
                      {selectedEmoji}
                    </div>
                    <div className="min-w-0">
                      <h4 className="font-semibold text-xs truncate text-foreground">
                        {name || "Workspace Title"}
                      </h4>
                      <p className="text-[10px] text-muted-foreground">
                        1 member
                      </p>
                    </div>
                  </div>
                  
                  <p className="text-[11px] text-muted-foreground line-clamp-2 min-h-[30px] leading-relaxed">
                    {description || "Enter a workspace description to preview it here."}
                  </p>
                </div>

                <div className="mt-2 pt-2 border-t border-border/30 flex items-center gap-1.5 text-[10px] text-muted-foreground">
                  <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Ready to configure
                </div>
              </div>
            </div>
          </div>

          {/* Color Presets */}
          <div className="space-y-2">
            <span className="text-xs font-semibold text-muted-foreground tracking-wider uppercase">
              Brand Accent Color
            </span>
            <div className="flex flex-wrap gap-2.5">
              {COLORS.map((color) => {
                const isSelected = selectedColor === color.hex;
                return (
                  <button
                    key={color.name}
                    type="button"
                    onClick={() => setSelectedColor(color.hex)}
                    disabled={isPending}
                    className="relative flex h-8 w-8 items-center justify-center rounded-full cursor-pointer transition-transform hover:scale-105 active:scale-95 disabled:pointer-events-none"
                    style={{ backgroundColor: color.hex }}
                  >
                    {isSelected && (
                      <motion.div
                        layoutId="activeColorBorder"
                        className="absolute -inset-1.5 rounded-full border border-primary/45 shadow-sm"
                        transition={{ type: "spring", stiffness: 380, damping: 30 }}
                      />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Emoji Picker Presets */}
          <div className="space-y-2">
            <span className="text-xs font-semibold text-muted-foreground tracking-wider uppercase">
              Workspace Symbol
            </span>
            <div className="grid grid-cols-6 sm:grid-cols-12 gap-2 bg-muted/10 p-2 rounded-xl border border-border/30">
              {EMOJIS.map((emoji) => {
                const isSelected = selectedEmoji === emoji;
                return (
                  <button
                    key={emoji}
                    type="button"
                    onClick={() => setSelectedEmoji(emoji)}
                    disabled={isPending}
                    className={`flex h-8 items-center justify-center rounded-lg text-lg cursor-pointer transition-all duration-150 hover:bg-muted/80 hover:scale-105 active:scale-95 ${
                      isSelected ? "bg-popover border border-border/80 shadow-sm" : "border border-transparent"
                    }`}
                  >
                    {emoji}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Footer Actions */}
          <DialogFooter className="pt-2 border-t border-border/30">
            <DialogClose render={
              <Button type="button" variant="outline" disabled={isPending}>
                Cancel
              </Button>
            } />
            <Button
              type="submit"
              disabled={isPending}
              className="bg-gradient-to-r from-indigo-500 to-violet-600 hover:from-indigo-600 hover:to-violet-700 text-white min-w-[120px] shadow-lg shadow-indigo-500/10 cursor-pointer"
            >
              {isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : (
                "Create Workspace"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
