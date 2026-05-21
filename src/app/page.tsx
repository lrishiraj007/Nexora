// ═══════════════════════════════════════════════════════════
// Root Page
// Dynamically handles authentication and landing page rendering
// ═══════════════════════════════════════════════════════════

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import LandingPageClient from "@/components/landing/landing-page-client";

export default async function RootPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (session?.user) {
    redirect("/workspaces");
  }

  return <LandingPageClient />;
}
