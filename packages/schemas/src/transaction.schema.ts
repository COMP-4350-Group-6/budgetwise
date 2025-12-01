import { z } from "zod";

// ============================================================================
// API DTO Schema (camelCase, for JSON responses)
// ============================================================================

export const TransactionDTOSchema = z.object({
  id: z.string(),
  userId: z.string(),
  budgetId: z.string().nullable(),
  categoryId: z.string().nullable(),
  amountCents: z.number().int(),
  note: z.string().max(280).nullable(),
  occurredAt: z.coerce.date(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
});

// ============================================================================
// Input Schemas (for API validation)
// ============================================================================

export const CreateTransactionInputSchema = z.object({
  budgetId: z.string().optional(),
  categoryId: z.string().optional(),
  amountCents: z.number().int(),
  note: z.string().max(280).optional(),
  occurredAt: z.coerce.date(),
});

export const UpdateTransactionInputSchema = z.object({
  budgetId: z.string().optional(),
  categoryId: z.string().optional(),
  amountCents: z.number().int().optional(),
  note: z.string().max(280).optional(),
  occurredAt: z.coerce.date().optional(),
});

// ============================================================================
// AI Service Result Schemas
// ============================================================================

export const CategorizationResultSchema = z.object({
  categoryId: z.string(),
  reasoning: z.string(),
});

export const ParsedInvoiceSchema = z.object({
  merchant: z.string(),
  total: z.number(),
  confidence: z.number().min(0).max(1),
});

// ============================================================================
// Exported Types
// ============================================================================

export type TransactionDTO = z.infer<typeof TransactionDTOSchema>;
export type CreateTransactionInput = z.infer<typeof CreateTransactionInputSchema>;
export type UpdateTransactionInput = z.infer<typeof UpdateTransactionInputSchema>;
export type CategorizationResult = z.infer<typeof CategorizationResultSchema>;
export type ParsedInvoice = z.infer<typeof ParsedInvoiceSchema>;
