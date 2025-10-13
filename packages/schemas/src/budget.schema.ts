import { z } from "zod";

export const BudgetPeriodSchema = z.enum(["DAILY", "WEEKLY", "MONTHLY", "YEARLY"]);

export const BudgetDTO = z.object({
  id: z.ulid(),
  userId: z.ulid(),
  // store as integer smallest-denomination cents
  limitCents: z.number().int(),
  period: BudgetPeriodSchema,
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
});

export type BudgetDTO = z.infer<typeof BudgetDTO>;