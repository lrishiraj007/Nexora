// ═══════════════════════════════════════════════════════════
// Vercel AI SDK Configuration & Helpers
// ═══════════════════════════════════════════════════════════

import { createOpenAI } from "@ai-sdk/openai";

// Instantiate custom OpenAI provider with API Key
const openaiProvider = createOpenAI({
  apiKey: process.env.OPENAI_API_KEY || "",
});

// We use gpt-4o-mini as our default lightweight & fast model
export const defaultModel = openaiProvider("gpt-4o-mini");

/**
 * System prompts for the conversational bot
 */
export const SYSTEM_PROMPT = `
You are the AI Knowledge Assistant of Nexora.
You help teams collaborate, analyze documents, and coordinate tasks.
When answering:
1. Be concise, professional, and clear.
2. If document context is provided, rely on it to answer questions. Mention that your answer is based on the document.
3. If requested, you can generate task cards.
4. Format your output in clean Markdown. Use headings, bullet points, bold text, and code blocks as appropriate.
`;

/**
 * Helper to fetch content of a document URL
 * In production, this would download the PDF/text, run OCR or text extraction, and return the raw text.
 * For this implementation, we will simulate document ingestion with a rich mockup text based on the document name.
 */
export async function getDocumentContent(documentUrl: string, name: string): Promise<string> {
  // Simulate high-fidelity extraction
  return `[DOCUMENT SUMMARY: ${name}]
This document contains engineering guides and team task lists.
Key architectural items:
1. Core framework is Next.js 15 App Router with React 19.
2. Database is PostgreSQL managed via Prisma Client.
3. Authentication uses Better Auth with organization scaling.
4. Real-time updates utilize Pusher for channels and presence.
5. AI is powered by OpenAI and Vercel AI SDK.

Core Tasks suggested:
- Refactor the state store into Zustand slice files [Priority: HIGH]
- Implement end-to-end integration tests using Playwright [Priority: MEDIUM]
- Configure Pusher authentication in route endpoints [Priority: URGENT]
- Add file preview modals to document listing panels [Priority: LOW]
`;
}
