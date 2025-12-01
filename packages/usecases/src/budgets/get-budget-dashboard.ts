import type { CategoriesRepo, BudgetsRepo, TransactionsRepo } from "@budget/ports";
import type { ClockPort } from "@budget/ports";
import type { BudgetStatus, CategoryBudgetSummary, BudgetDashboard } from "@budget/schemas";
import { makeGetBudgetStatus } from "./get-budget-status";

export function makeGetBudgetDashboard(deps: {
  categoriesRepo: CategoriesRepo;
  budgetsRepo: BudgetsRepo;
  transactionsRepo: TransactionsRepo;
  clock: ClockPort;
}) {
  return async (userId: string): Promise<BudgetDashboard> => {
    const categories = await deps.categoriesRepo.listActiveByUser(userId);
    const allBudgets = await deps.budgetsRepo.listActiveByUser(userId);
    const getBudgetStatus = makeGetBudgetStatus(deps);

    const categorySummaries: CategoryBudgetSummary[] = [];
    let totalBudget = 0;
    let totalSpent = 0;
    let overBudgetCount = 0;
    let alertCount = 0;

    for (const category of categories) {
      const categoryBudgets = allBudgets.filter(b => b.props.categoryId === category.id);
      const budgetStatuses: BudgetStatus[] = [];
      let categoryBudgetTotal = 0;
      let categorySpentTotal = 0;

      // Get status for each budget in this category
      for (const budget of categoryBudgets) {
        const status = await getBudgetStatus(budget.id, userId);
        if (status) {
          budgetStatuses.push(status);
          categoryBudgetTotal += status.budget.amountCents;
          categorySpentTotal += status.spentCents;
          totalBudget += status.budget.amountCents;
          totalSpent += status.spentCents;
          if (status.isOverBudget) overBudgetCount++;
          if (status.shouldAlert) alertCount++;
        }
      }

      // Add orphaned spending (transactions with categoryId but no budgetId)
      const orphanedSpent = await deps.transactionsRepo.sumSpentByCategoryWithoutBudget(userId, category.id);
      if (orphanedSpent > 0) {
        categorySpentTotal += orphanedSpent;
        totalSpent += orphanedSpent;
      }

      // Include category if it has budgets OR spending
      if (budgetStatuses.length > 0 || categorySpentTotal > 0) {
        categorySummaries.push({
          categoryId: category.id,
          categoryName: category.props.name,
          categoryIcon: category.props.icon,
          categoryColor: category.props.color,
          budgets: budgetStatuses,
          totalBudgetCents: categoryBudgetTotal,
          totalSpentCents: categorySpentTotal,
          totalRemainingCents: categoryBudgetTotal - categorySpentTotal,
          overallPercentageUsed: categoryBudgetTotal > 0
            ? (categorySpentTotal / categoryBudgetTotal) * 100
            : 0,
          hasOverBudget: budgetStatuses.some(b => b.isOverBudget),
        });
      }
    }

    return {
      categories: categorySummaries,
      totalBudgetCents: totalBudget,
      totalSpentCents: totalSpent,
      overBudgetCount,
      alertCount,
    };
  };
}