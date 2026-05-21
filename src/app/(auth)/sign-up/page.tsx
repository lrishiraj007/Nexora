// ═══════════════════════════════════════════════════════════
// Sign Up Page
// ═══════════════════════════════════════════════════════════

import type { Metadata } from "next";
import { SignUpForm } from "@/components/auth/sign-up-form";

export const metadata: Metadata = {
  title: "Sign Up",
  description: "Create your Nexora account",
};

export default function SignUpPage() {
  return <SignUpForm />;
}
