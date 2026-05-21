// ═══════════════════════════════════════════════════════════
// Shared TypeScript Types
// Re-exports Prisma types and defines custom app types
// ═══════════════════════════════════════════════════════════

import type {
  User,
  Organization,
  Workspace,
  Task,
  Comment,
  Notification,
  Member,
  Document,
  AIConversation,
  AIMessage,
  ActivityLog,
  TaskStatus,
  TaskPriority,
  MemberRole,
  NotificationType,
  ActivityAction,
} from "@prisma/client";

// Re-export Prisma types for convenience
export type {
  User,
  Organization,
  Workspace,
  Task,
  Comment,
  Notification,
  Member,
  Document,
  AIConversation,
  AIMessage,
  ActivityLog,
  TaskStatus,
  TaskPriority,
  MemberRole,
  NotificationType,
  ActivityAction,
};

// ── Extended Types (with relations) ──────────────────────

/** Task with all related data for display */
export type TaskWithRelations = Task & {
  assignee: Pick<User, "id" | "name" | "image"> | null;
  creator: Pick<User, "id" | "name" | "image">;
  comments: { id: string }[];
  tags: { tag: { id: string; name: string; color: string } }[];
};

/** Member with user profile data */
export type MemberWithUser = Member & {
  user: Pick<User, "id" | "name" | "email" | "image">;
};

/** Comment with author profile */
export type CommentWithAuthor = Comment & {
  author: Pick<User, "id" | "name" | "image">;
};

/** AI Conversation with message count */
export type ConversationWithMeta = AIConversation & {
  _count: { messages: number };
  document: Pick<Document, "id" | "name"> | null;
};

/** Activity log with user info */
export type ActivityLogWithUser = ActivityLog & {
  user: Pick<User, "id" | "name" | "image">;
};

/** Workspace with task count */
export type WorkspaceWithMeta = Workspace & {
  _count: { tasks: number; documents: number };
};

// ── API Response Types ───────────────────────────────────

/** Standard API response wrapper */
export type ApiResponse<T = void> =
  | { success: true; data: T }
  | { success: false; error: string };

/** Paginated response */
export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
}

// ── Server Action Types ──────────────────────────────────

/** Result type for server actions */
export type ActionResult<T = void> =
  | { success: true; data: T }
  | { success: false; error: string };
