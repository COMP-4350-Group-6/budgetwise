import { z } from "zod";

export const TransactionRowSchema = z.object({
  id: z.uuid(),
  user_id: z.uuid(),
  budget_id: z.uuid().nullable(),
  category_id: z.uuid().nullable(),
  amount_cents: z.number().int(),
  note: z.string().max(280).nullable(),
  occurred_at: z.coerce.date(),
  created_at: z.coerce.date(),
  updated_at: z.coerce.date(),
});

export const TransactionDTO = z.object({
  id: z.uuid(),
  userId: z.uuid(),
  budgetId: z.uuid().nullable(),
  categoryId: z.uuid().nullable(),
  amountCents: z.number().int(),
  note: z.string().max(280).nullable(),
  occurredAt: z.coerce.date(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
});

export type TransactionRow = z.infer<typeof TransactionRowSchema>;
export type TransactionDTO = z.infer<typeof TransactionDTO>;
