import { z } from "zod";
import { CurrencySchema } from "./currency.schema";

export const BudgetPeriodSchema = z.enum(["DAILY", "WEEKLY", "MONTHLY", "YEARLY"]);

export const CreateBudgetInputSchema = z.object({
  categoryId: z.string(),
  name: z.string().min(1).max(100),
  amountCents: z.number().int().min(0),
  currency: CurrencySchema,
  period: BudgetPeriodSchema,
  startDate: z.coerce.date(),
  endDate: z.coerce.date().optional(),
  alertThreshold: z.number().min(0).max(100).optional(),
});

export const UpdateBudgetInputSchema = CreateBudgetInputSchema.partial();

export const BudgetDTO = z.object({
  id: z.string(),
  userId: z.string(),
  categoryId: z.string(),
  name: z.string(),
  amountCents: z.number().int(),
  currency: CurrencySchema,
  period: BudgetPeriodSchema,
  startDate: z.string(), // ISO date
  endDate: z.string().optional(),
  isActive: z.boolean(),
  alertThreshold: z.number().optional(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export type CreateBudgetInput = z.infer<typeof CreateBudgetInputSchema>;
export type UpdateBudgetInput = z.infer<typeof UpdateBudgetInputSchema>;
export type BudgetDTO = z.infer<typeof BudgetDTO>;
export type BudgetPeriod = z.infer<typeof BudgetPeriodSchema>;