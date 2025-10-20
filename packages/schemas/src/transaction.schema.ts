import { z } from "zod";


export const TransactionDTO = z.object({
  id: z.ulid(),
  userId: z.ulid(),
  // Allow unbudgeted transactions by making budgetId optional
  budgetId: z.ulid().optional(),
  amountCents: z.number().int(),
  categoryId: z.ulid().optional(),
  note: z.string().max(280).optional(),
  occurredAt: z.coerce.date(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
});

export type TransactionDTO = z.infer<typeof TransactionDTO>;
