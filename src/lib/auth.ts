// ═══════════════════════════════════════════════════════════
// Better Auth — Server Configuration
// Handles email/password auth, Google OAuth, organizations,
// sessions, and role-based access control
// ═══════════════════════════════════════════════════════════

import { betterAuth } from "better-auth";
import { prismaAdapter } from "@better-auth/prisma-adapter";
import { organization } from "better-auth/plugins";
import { db } from "@/lib/db";

export const auth = betterAuth({
  // Database adapter — uses our Prisma singleton
  database: prismaAdapter(db, {
    provider: "postgresql",
  }),

  // Session configuration
  session: {
    // Sessions expire after 30 days
    expiresIn: 60 * 60 * 24 * 30, // 30 days in seconds
    // Refresh session if less than 1 day until expiry
    updateAge: 60 * 60 * 24, // 1 day in seconds
    cookieCache: {
      enabled: true,
      maxAge: 5 * 60, // 5 minutes cache
    },
  },

  // Email/password authentication
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: false, // Set to true in production with email provider
    minPasswordLength: 8,
  },

  // OAuth providers
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    },
  },

  // Plugins
  plugins: [
    // Organization management — teams, roles, invitations
    organization({
      allowUserToCreateOrganization: true,
    }),
  ],

  // Security — rate limiting
  rateLimit: {
    window: 60, // 60 seconds
    max: 100, // Max 100 requests per window
  },

  // Trusted origins for CORS
  trustedOrigins: [process.env.BETTER_AUTH_URL || "http://localhost:3000"],
});

// Export the auth type for client-side type safety
export type Auth = typeof auth;
