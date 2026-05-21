// ═══════════════════════════════════════════════════════════
// Auth Layout
// Centered layout for sign-in and sign-up pages
// ═══════════════════════════════════════════════════════════

import Link from "next/link";
import { Sparkles } from "lucide-react";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative flex min-h-screen">
      {/* ── Left panel: Branding ──────────────────────── */}
      <div className="hidden w-1/2 flex-col justify-between bg-gradient-to-br from-indigo-600 via-violet-600 to-purple-700 p-12 lg:flex">
        <Link href="/" className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/20 backdrop-blur-sm">
            <Sparkles className="h-5 w-5 text-white" />
          </div>
          <span className="text-xl font-bold text-white">Nexora</span>
        </Link>

        <div className="space-y-4">
          <h2 className="text-4xl font-bold leading-tight text-white">
            Amplify your team&apos;s
            <br />
            collective intelligence
          </h2>
          <p className="max-w-md text-lg text-white/70">
            AI-powered collaboration that transforms how your team manages
            knowledge, tasks, and communication.
          </p>
        </div>

        <p className="text-sm text-white/50">
          © {new Date().getFullYear()} Nexora. All rights reserved.
        </p>

        {/* Decorative elements */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute -top-20 right-1/4 h-64 w-64 rounded-full bg-white/5 blur-3xl" />
          <div className="absolute bottom-1/4 left-1/4 h-96 w-96 rounded-full bg-white/5 blur-3xl" />
        </div>
      </div>

      {/* ── Right panel: Form ─────────────────────────── */}
      <div className="flex w-full flex-1 items-center justify-center p-6 lg:w-1/2">
        <div className="w-full max-w-[400px]">{children}</div>
      </div>
    </div>
  );
}
