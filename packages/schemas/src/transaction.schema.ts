import { z } from "zod";

export const AddTransactionInput = z.object({
  userId: z.string(),
  budgetId: z.string(),
  amountCents: z.number().int(),
  occurredAt: z.coerce.date(),
  note: z.string().max(280).optional(),
  categoryId: z.string().optional(),
});

export const TransactionDTO = z.object({
  id: z.string(),
  userId: z.string(),
  budgetId: z.string(),
  amountCents: z.number().int(),
  categoryId: z.string().optional(),
  note: z.string().max(280).optional(),
  occurredAt: z.string().datetime(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export type AddTransactionInput = z.infer<typeof AddTransactionInput>;
export type TransactionDTO = z.infer<typeof TransactionDTO>;
