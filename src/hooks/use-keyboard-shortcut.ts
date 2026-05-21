// ═══════════════════════════════════════════════════════════
// Custom Hooks — Keyboard Shortcuts
// ═══════════════════════════════════════════════════════════

import { useEffect, useCallback } from "react";

interface UseKeyboardShortcutOptions {
  key: string;
  meta?: boolean;
  shift?: boolean;
  alt?: boolean;
  callback: () => void;
  enabled?: boolean;
}

/**
 * Registers a global keyboard shortcut.
 * Automatically handles Mac ⌘ vs Windows Ctrl.
 */
export function useKeyboardShortcut({
  key,
  meta = false,
  shift = false,
  alt = false,
  callback,
  enabled = true,
}: UseKeyboardShortcutOptions) {
  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (!enabled) return;

      // Don't trigger when typing in inputs/textareas
      const target = event.target as HTMLElement;
      if (
        target.tagName === "INPUT" ||
        target.tagName === "TEXTAREA" ||
        target.contentEditable === "true"
      ) {
        // Allow ⌘K even in inputs (command palette)
        if (!(meta && key === "k")) return;
      }

      const metaMatch = meta
        ? event.metaKey || event.ctrlKey
        : !event.metaKey && !event.ctrlKey;
      const shiftMatch = shift ? event.shiftKey : !event.shiftKey;
      const altMatch = alt ? event.altKey : !event.altKey;

      if (
        event.key.toLowerCase() === key.toLowerCase() &&
        metaMatch &&
        shiftMatch &&
        altMatch
      ) {
        event.preventDefault();
        callback();
      }
    },
    [key, meta, shift, alt, callback, enabled]
  );

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);
}
