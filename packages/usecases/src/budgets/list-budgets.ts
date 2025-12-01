import type { BudgetsRepo } from "@budget/ports";
import type { BudgetDTO } from "@budget/schemas";
import { toBudgetDTOList } from "../presenters";

export function makeListBudgets(deps: {
  budgetsRepo: BudgetsRepo;
}) {
  return async (userId: string, activeOnly: boolean = false): Promise<BudgetDTO[]> => {
    if (activeOnly) {
      const budgets = await deps.budgetsRepo.listActiveByUser(userId);
      return toBudgetDTOList(budgets);
    }
    const budgets = await deps.budgetsRepo.listByUser(userId);
    return toBudgetDTOList(budgets);
  };
}