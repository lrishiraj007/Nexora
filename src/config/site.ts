// ═══════════════════════════════════════════════════════════
// Site Configuration
// Centralized metadata and branding
// ═══════════════════════════════════════════════════════════

export const siteConfig = {
  name: "Nexora",
  description:
    "AI-powered team collaboration and knowledge management platform. Organize tasks, chat with your documents, and boost team productivity.",
  url: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
  ogImage: "/og.png",
  links: {
    github: "https://github.com/nexora",
    docs: "/docs",
  },
  creator: "Nexora Team",
  keywords: [
    "team collaboration",
    "knowledge management",
    "AI assistant",
    "task management",
    "kanban board",
    "document chat",
    "SaaS",
  ],
} as const;
