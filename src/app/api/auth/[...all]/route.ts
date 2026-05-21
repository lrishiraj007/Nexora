// ═══════════════════════════════════════════════════════════
// Better Auth — API Route Handler
// Catch-all route that handles all auth requests
// ═══════════════════════════════════════════════════════════

import { auth } from "@/lib/auth";
import { toNextJsHandler } from "better-auth/next-js";

export const { GET, POST } = toNextJsHandler(auth);
