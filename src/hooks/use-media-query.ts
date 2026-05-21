// ═══════════════════════════════════════════════════════════
// Custom Hooks — Media Query
// ═══════════════════════════════════════════════════════════

import { useEffect, useState } from "react";

/**
 * Tracks whether a CSS media query matches.
 * Useful for responsive logic in components.
 */
export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    const media = window.matchMedia(query);
    setMatches(media.matches);

    const listener = (event: MediaQueryListEvent) => {
      setMatches(event.matches);
    };

    media.addEventListener("change", listener);
    return () => media.removeEventListener("change", listener);
  }, [query]);

  return matches;
}

/** Convenience hook for mobile detection */
export function useIsMobile(): boolean {
  return useMediaQuery("(max-width: 768px)");
}
