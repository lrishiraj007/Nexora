// ═══════════════════════════════════════════════════════════
// Common Zod Validators
// Shared validation schemas used across features
// ═══════════════════════════════════════════════════════════

import { z } from "zod";

/** Pagination parameters */
export const paginationSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
});

export type PaginationInput = z.infer<typeof paginationSchema>;

/** Comment creation */
export const createCommentSchema = z.object({
  content: z
    .string()
    .min(1, "Comment cannot be empty")
    .max(2000, "Comment must be less than 2000 characters"),
  taskId: z.string().cuid(),
});

export type CreateCommentInput = z.infer<typeof createCommentSchema>;

/** Generic ID parameter */
export const idSchema = z.object({
  id: z.string().cuid(),
});
