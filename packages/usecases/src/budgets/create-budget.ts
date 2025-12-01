import { Budget } from "@budget/domain";
import type { BudgetsRepo } from "@budget/ports";
import type { ClockPort, IdPort } from "@budget/ports";
import type { Currency, BudgetPeriod } from "@budget/domain";
import type { BudgetDTO } from "@budget/schemas";
import { toBudgetDTO } from "../presenters";

export interface CreateBudgetInput {
  userId: string;
  categoryId: string;
  name: string;
  amountCents: number;
  currency: Currency;
  period: BudgetPeriod;
  startDate: Date;
  endDate?: Date;
  alertThreshold?: number;
}

export function makeCreateBudget(deps: {
  budgetsRepo: BudgetsRepo;
  clock: ClockPort;
  id: IdPort;
}) {
  return async (input: CreateBudgetInput): Promise<BudgetDTO> => {
    const now = deps.clock.now();
    
    const budget = new Budget({
      id: deps.id.ulid(),
      userId: input.userId,
      categoryId: input.categoryId,
      name: input.name,
      amountCents: input.amountCents,
      currency: input.currency,
      period: input.period,
      startDate: input.startDate,
      endDate: input.endDate,
      isActive: true,
      alertThreshold: input.alertThreshold,
      createdAt: now,
      updatedAt: now,
    });
    
    await deps.budgetsRepo.create(budget);
    return toBudgetDTO(budget);
  };
}