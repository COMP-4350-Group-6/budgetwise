import type { Budget } from "@budget/domain";
import type { BudgetsRepo } from "@budget/ports";

export function makeListBudgets(deps: {
  budgetsRepo: BudgetsRepo;
}) {
  return async (userId: string, activeOnly: boolean = false): Promise<Budget[]> => {
    if (activeOnly) {
      return deps.budgetsRepo.listActiveByUser(userId);
    }
    return deps.budgetsRepo.listByUser(userId);
  };
}