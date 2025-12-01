import { Budget } from "@budget/domain";
import type { BudgetsRepo } from "@budget/ports";
import type { ClockPort } from "@budget/ports";
import type { Currency, BudgetPeriod } from "@budget/domain";
import type { BudgetDTO } from "@budget/schemas";
import { toBudgetDTO } from "../presenters";

export interface UpdateBudgetInput {
  categoryId?: string;
  name?: string;
  amountCents?: number;
  currency?: Currency;
  period?: BudgetPeriod;
  startDate?: Date;
  endDate?: Date;
  isActive?: boolean;
  alertThreshold?: number;
}

export function makeUpdateBudget(deps: {
  budgetsRepo: BudgetsRepo;
  clock: ClockPort;
}) {
  return async (id: string, userId: string, updates: UpdateBudgetInput): Promise<BudgetDTO> => {
    const existing = await deps.budgetsRepo.getById(id);
    
    if (!existing) {
      throw new Error("Budget not found");
    }
    
    if (existing.props.userId !== userId) {
      throw new Error("Unauthorized");
    }
    
    const updated = new Budget({
      ...existing.props,
      categoryId: updates.categoryId ?? existing.props.categoryId,
      name: updates.name?.trim() ?? existing.props.name,
      amountCents: updates.amountCents ?? existing.props.amountCents,
      currency: updates.currency ?? existing.props.currency,
      period: updates.period ?? existing.props.period,
      startDate: updates.startDate ?? existing.props.startDate,
      endDate: updates.endDate !== undefined ? updates.endDate : existing.props.endDate,
      isActive: updates.isActive ?? existing.props.isActive,
      alertThreshold: updates.alertThreshold !== undefined ? updates.alertThreshold : existing.props.alertThreshold,
      updatedAt: deps.clock.now(),
    });
    
    await deps.budgetsRepo.update(updated);
    return toBudgetDTO(updated);
  };
}