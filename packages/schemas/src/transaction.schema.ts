import { z } from "zod";


export const TransactionDTO = z.object({
  id: z.ulid(),
  userId: z.ulid(),
  budgetId: z.ulid(),
  amountCents: z.number().int(),
  categoryId: z.ulid().optional(),
  note: z.string().max(280).optional(),
  occurredAt: z.coerce.date(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
});

export type TransactionDTO = z.infer<typeof TransactionDTO>;
