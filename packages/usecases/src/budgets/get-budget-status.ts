import type { BudgetsRepo, TransactionsRepo } from "@budget/ports";
import type { ClockPort } from "@budget/ports";
import type { BudgetStatus } from "@budget/schemas";
import { toBudgetDTO } from "../presenters";

export function makeGetBudgetStatus(deps: {
  budgetsRepo: BudgetsRepo;
  transactionsRepo: TransactionsRepo;
  clock: ClockPort;
}) {
  return async (budgetId: string, userId: string): Promise<BudgetStatus | null> => {
    const budget = await deps.budgetsRepo.getById(budgetId);
    if (!budget || budget.props.userId !== userId) {
      return null;
    }

    const now = deps.clock.now();
    const { startDate, endDate } = budget.getPeriodDates(now);

    // Get spending for this budget in the current period (single aggregate query)
    const { totalCents: spentCents, count: transactionCount } = 
      await deps.transactionsRepo.sumSpentByBudgetInPeriod(budgetId, startDate, endDate);

    const remainingCents = budget.props.amountCents - spentCents;
    const percentageUsed = (spentCents / budget.props.amountCents) * 100;
    const isOverBudget = spentCents > budget.props.amountCents;
    const shouldAlert = budget.shouldAlert(spentCents);

    return {
      budget: toBudgetDTO(budget),
      spentCents,
      remainingCents,
      percentageUsed,
      isOverBudget,
      shouldAlert,
      transactionCount,
    };
  };
}