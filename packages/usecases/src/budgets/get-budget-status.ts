import type { BudgetsRepo, TransactionsRepo } from "@budget/ports";
import type { ClockPort } from "@budget/ports";
import type { Budget, BudgetPeriod } from "@budget/domain";

export interface BudgetStatus {
  budget: Budget;
  spentCents: number;
  remainingCents: number;
  percentageUsed: number;
  isOverBudget: boolean;
  shouldAlert: boolean;
  transactionCount: number;
}

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
    const { startDate, endDate } = calculatePeriodDates(
      now,
      budget.props.period,
      budget.props.startDate
    );

    // Get transactions in this period for this budget
    const transactions = await deps.transactionsRepo.listByUserInPeriod(
      userId,
      startDate,
      endDate
    );

    // Only count transactions explicitly linked to this budget
    const budgetTransactions = transactions.filter(
      tx => tx.props.budgetId === budget.id
    );

    const spentCents = budgetTransactions.reduce(
      (sum, tx) => sum + Math.abs(tx.props.amountCents),
      0
    );

    const remainingCents = budget.props.amountCents - spentCents;
    const percentageUsed = (spentCents / budget.props.amountCents) * 100;
    const isOverBudget = spentCents > budget.props.amountCents;
    const shouldAlert = budget.shouldAlert(spentCents);

    return {
      budget,
      spentCents,
      remainingCents,
      percentageUsed: Math.round(percentageUsed * 100) / 100,
      isOverBudget,
      shouldAlert,
      transactionCount: budgetTransactions.length,
    };
  };
}

function calculatePeriodDates(
  now: Date,
  period: BudgetPeriod,
  budgetStart: Date
): { startDate: Date; endDate: Date } {
  const start = new Date(now);
  const end = new Date(now);

  switch (period) {
    case 'DAILY':
      start.setHours(0, 0, 0, 0);
      end.setHours(23, 59, 59, 999);
      break;
    case 'WEEKLY':
      const day = start.getDay();
      start.setDate(start.getDate() - day);
      start.setHours(0, 0, 0, 0);
      end.setDate(start.getDate() + 6);
      end.setHours(23, 59, 59, 999);
      break;
    case 'MONTHLY':
      start.setDate(1);
      start.setHours(0, 0, 0, 0);
      end.setMonth(end.getMonth() + 1);
      end.setDate(0);
      end.setHours(23, 59, 59, 999);
      break;
    case 'YEARLY':
      start.setMonth(0, 1);
      start.setHours(0, 0, 0, 0);
      end.setMonth(11, 31);
      end.setHours(23, 59, 59, 999);
      break;
  }

  if (start < budgetStart) {
    start.setTime(budgetStart.getTime());
  }

  return { startDate: start, endDate: end };
}