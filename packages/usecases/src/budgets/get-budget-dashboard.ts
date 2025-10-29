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
    
    // Fetch all transactions for a wide period to calculate category spending
    const now = deps.clock.now();
    const startDate = new Date(now.getFullYear() - 10, 0, 1); // 10 years back
    const endDate = new Date(now.getFullYear() + 1, 11, 31); // 1 year forward
    const allTransactions = await deps.transactionsRepo.listByUserInPeriod(userId, startDate, endDate);

    const getBudgetStatus = makeGetBudgetStatus(deps);
    
    const categorySummaries: CategoryBudgetSummary[] = [];
    let totalBudget = 0;
    let totalSpent = 0;
    let overBudgetCount = 0;
    let alertCount = 0;

    // Track orphaned transactions (categoryId but no budgetId) to avoid double-counting
    // Map: categoryId -> Set of transaction IDs
    const orphanedTxIds = new Map<string, Set<string>>();

    for (const category of categories) {
      const categoryBudgets = allBudgets.filter(
        b => b.props.categoryId === category.id
      );

      const budgetStatuses: BudgetStatus[] = [];
      let categoryBudgetTotal = 0;
      let categorySpentTotal = 0;

      // Track orphaned transactions for this category (categoryId but no budgetId)
      // These are counted once per category, not per budget
      const categoryOrphanedTxs = allTransactions.filter(
        (tx) => 
          tx.props.categoryId === category.id &&
          !tx.props.budgetId
      );
      const orphanedSpent = categoryOrphanedTxs.reduce(
        (sum, tx) => sum + Math.abs(tx.props.amountCents),
        0
      );

      // Calculate spending from budgets if they exist
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

      // Add orphaned transactions to category total (once per category)
      // This ensures transactions with categoryId but no budgetId are included
      if (categoryBudgets.length > 0) {
        categorySpentTotal += orphanedSpent;
        // Only add to total if not already counted
        const categoryIdKey = category.id;
        if (!orphanedTxIds.has(categoryIdKey)) {
          orphanedTxIds.set(categoryIdKey, new Set(categoryOrphanedTxs.map(tx => tx.props.id)));
          totalSpent += orphanedSpent;
        }
      }

      // If no budgets, calculate spending from all transactions in category
      if (categoryBudgets.length === 0) {
        const categoryTransactions = allTransactions.filter(
          (tx) => tx.props.categoryId === category.id
        );
        categorySpentTotal = categoryTransactions.reduce(
          (sum: number, tx) => sum + Math.abs(tx.props.amountCents),
          0
        );
        totalSpent += categorySpentTotal;
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