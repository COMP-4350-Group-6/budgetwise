import type { BudgetsRepo } from "@budget/ports";

export function makeDeleteBudget(deps: {
  budgetsRepo: BudgetsRepo;
}) {
  return async (id: string, userId: string): Promise<void> => {
    const budget = await deps.budgetsRepo.getById(id);
    
    if (!budget) {
      throw new Error("Budget not found");
    }
    
    if (budget.props.userId !== userId) {
      throw new Error("Unauthorized");
    }
    
    await deps.budgetsRepo.delete(id, userId);
  };
}