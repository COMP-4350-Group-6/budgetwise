import { z } from "zod";
import { CurrencySchema } from "./currency.schema";

export const BudgetPeriodSchema = z.enum(["DAILY", "WEEKLY", "MONTHLY", "YEARLY"]);

export const CreateBudgetInputSchema = z.object({
  categoryId: z.uuid(),
  name: z.string().min(1).max(100),
  amountCents: z.number().int().min(0),
  currency: CurrencySchema,
  period: BudgetPeriodSchema,
  startDate: z.coerce.date(),
  endDate: z.coerce.date().nullable().optional(),
  alertThreshold: z.number().int().min(0).max(100).nullable().optional(),
  isActive: z.boolean().default(true).optional(),
});

export const UpdateBudgetInputSchema = CreateBudgetInputSchema.partial();

export const BudgetRowSchema = z.object({
  id: z.uuid(),
  user_id: z.uuid(),
  category_id: z.uuid(),
  name: z.string().min(1).max(100),
  amount_cents: z.number().int().min(0),
  currency: CurrencySchema,
  period: BudgetPeriodSchema,
  start_date: z.coerce.date(),
  end_date: z.coerce.date().nullable(),
  is_active: z.boolean(),
  alert_threshold: z.number().int().min(0).max(100).nullable(),
  created_at: z.coerce.date(),
  updated_at: z.coerce.date(),
});

export const BudgetDTO = z.object({
  id: z.uuid(),
  userId: z.uuid(),
  categoryId: z.uuid(),
  name: z.string().min(1).max(100),
  amountCents: z.number().int().min(0),
  currency: CurrencySchema,
  period: BudgetPeriodSchema,
  startDate: z.coerce.date(),
  endDate: z.coerce.date().nullable(),
  isActive: z.boolean(),
  alertThreshold: z.number().int().min(0).max(100).nullable(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
});

export type CreateBudgetInput = z.infer<typeof CreateBudgetInputSchema>;
export type UpdateBudgetInput = z.infer<typeof UpdateBudgetInputSchema>;
export type BudgetRow = z.infer<typeof BudgetRowSchema>;
export type BudgetDTO = z.infer<typeof BudgetDTO>;
export type BudgetPeriod = z.infer<typeof BudgetPeriodSchema>;