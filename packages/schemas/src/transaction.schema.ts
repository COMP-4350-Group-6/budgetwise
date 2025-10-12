import { z } from "zod";
export const TransactionDTO = z.object({
  id: z.string(),
  userId: z.string(),
  budgetId: z.string(),
  amountCents: z.number().int(),
  categoryId: z.string().optional(),
  note: z.string().max(280).optional(),
  occurredAt: z.string().datetime(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime()
});
export type TransactionDTO = z.infer<typeof TransactionDTO>;
