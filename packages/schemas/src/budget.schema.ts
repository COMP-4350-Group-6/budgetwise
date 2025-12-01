import { z } from "zod";
import { CurrencySchema } from "./currency.schema";

// ============================================================================
// Enums
// ============================================================================

export const BudgetPeriodSchema = z.enum(["DAILY", "WEEKLY", "MONTHLY", "YEARLY"]);

// ============================================================================
// Input Schemas (for API validation)
// ============================================================================

export const CreateBudgetInputSchema = z.object({
  // IDs in the application are ULIDs (not strictly UUIDs). Accept any non-empty string here.
  categoryId: z.string().min(1),
  name: z.string().min(1).max(100),
  amountCents: z.number().int().min(0),
  currency: CurrencySchema,
  period: BudgetPeriodSchema,
  startDate: z.coerce.date(),
  endDate: z.coerce.date().optional(),
  alertThreshold: z.number().int().min(0).max(100).optional(),
  isActive: z.boolean().default(true).optional(),
});

export const UpdateBudgetInputSchema = CreateBudgetInputSchema.partial();

// ============================================================================
// Database Row Schema (snake_case, matches Supabase)
// ============================================================================

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

// ============================================================================
// API DTO Schema (camelCase, for JSON responses)
// ============================================================================

export const BudgetDTOSchema = z.object({
  id: z.string(),
  userId: z.string(),
  categoryId: z.string(),
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

// ============================================================================
// Dashboard Schemas (for budget status and summaries)
// ============================================================================

export const BudgetStatusSchema = z.object({
  budget: BudgetDTOSchema,
  spentCents: z.number().int(),
  remainingCents: z.number().int(),
  percentageUsed: z.number(),
  isOverBudget: z.boolean(),
  shouldAlert: z.boolean(),
  transactionCount: z.number().int(),
});

export const CategoryBudgetSummarySchema = z.object({
  categoryId: z.string(),
  categoryName: z.string(),
  categoryIcon: z.string().optional(),
  categoryColor: z.string().optional(),
  budgets: z.array(BudgetStatusSchema),
  totalBudgetCents: z.number().int(),
  totalSpentCents: z.number().int(),
  totalRemainingCents: z.number().int(),
  overallPercentageUsed: z.number(),
  hasOverBudget: z.boolean(),
});

export const BudgetDashboardSchema = z.object({
  categories: z.array(CategoryBudgetSummarySchema),
  totalBudgetCents: z.number().int(),
  totalSpentCents: z.number().int(),
  overBudgetCount: z.number().int(),
  alertCount: z.number().int(),
});

// ============================================================================
// Exported Types
// ============================================================================

export type CreateBudgetInput = z.infer<typeof CreateBudgetInputSchema>;
export type UpdateBudgetInput = z.infer<typeof UpdateBudgetInputSchema>;
export type BudgetRow = z.infer<typeof BudgetRowSchema>;
export type BudgetDTO = z.infer<typeof BudgetDTOSchema>;
export type BudgetPeriod = z.infer<typeof BudgetPeriodSchema>;
export type BudgetStatus = z.infer<typeof BudgetStatusSchema>;
export type CategoryBudgetSummary = z.infer<typeof CategoryBudgetSummarySchema>;
export type BudgetDashboard = z.infer<typeof BudgetDashboardSchema>;