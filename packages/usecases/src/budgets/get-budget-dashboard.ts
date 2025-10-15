import type { CategoriesRepo, BudgetsRepo, TransactionsRepo } from "@budget/ports";
import type { ClockPort } from "@budget/ports";
import type { BudgetStatus } from "./get-budget-status";
import { makeGetBudgetStatus } from "./get-budget-status";

export interface CategoryBudgetSummary {
  categoryId: string;
  categoryName: string;
  categoryIcon?: string;
  categoryColor?: string;
  budgets: BudgetStatus[];
  totalBudgetCents: number;
  totalSpentCents: number;
  totalRemainingCents: number;
  overallPercentageUsed: number;
  hasOverBudget: boolean;
}

export interface BudgetDashboard {
  categories: CategoryBudgetSummary[];
  totalBudgetCents: number;
  totalSpentCents: number;
  overBudgetCount: number;
  alertCount: number;
}

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
      const categoryBudgets = allBudgets.filter(
        b => b.props.categoryId === category.id
      );

      if (categoryBudgets.length === 0) continue;

      const budgetStatuses: BudgetStatus[] = [];
      let categoryBudgetTotal = 0;
      let categorySpentTotal = 0;

      for (const budget of categoryBudgets) {
        const status = await getBudgetStatus(budget.id, userId);
        if (status) {
          budgetStatuses.push(status);
          categoryBudgetTotal += status.budget.props.amountCents;
          categorySpentTotal += status.spentCents;
          totalBudget += status.budget.props.amountCents;
          totalSpent += status.spentCents;
          if (status.isOverBudget) overBudgetCount++;
          if (status.shouldAlert) alertCount++;
        }
      }

      if (budgetStatuses.length > 0) {
        categorySummaries.push({
          categoryId: category.id,
          categoryName: category.props.name,
          categoryIcon: category.props.icon,
          categoryColor: category.props.color,
          budgets: budgetStatuses,
          totalBudgetCents: categoryBudgetTotal,
          totalSpentCents: categorySpentTotal,
          totalRemainingCents: categoryBudgetTotal - categorySpentTotal,
          overallPercentageUsed: (categorySpentTotal / categoryBudgetTotal) * 100,
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