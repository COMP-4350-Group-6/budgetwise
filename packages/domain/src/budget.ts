import { Money } from './money';
import type { Currency } from './money';

export type BudgetPeriod = 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'YEARLY';

export interface BudgetProps {
  id: string;
  userId: string;
  categoryId: string;        // REQUIRED - every budget must have a category
  name: string;              // Budget name (e.g., "Weekly Groceries")
  amountCents: number;       // Budget limit in cents
  currency: Currency;
  period: BudgetPeriod;
  startDate: Date;
  endDate?: Date;            // Optional end date
  isActive: boolean;         // Can be paused
  alertThreshold?: number;   // % to trigger warning (e.g., 80 = warn at 80%)
  createdAt: Date;
  updatedAt: Date;
}

export class Budget {
  constructor(public readonly props: BudgetProps) {
    if (!Number.isInteger(props.amountCents)) {
      throw new Error("amountCents must be integer");
    }
    if (props.amountCents < 0) {
      throw new Error("Budget amount cannot be negative");
    }
    if (!props.name || props.name.trim().length === 0) {
      throw new Error("Budget name cannot be empty");
    }
    if (!props.categoryId) {
      throw new Error("Budget must have a category");
    }
    if (props.endDate && props.endDate < props.startDate) {
      throw new Error("End date cannot be before start date");
    }
    if (props.alertThreshold !== undefined && (props.alertThreshold < 0 || props.alertThreshold > 100)) {
      throw new Error("Alert threshold must be between 0 and 100");
    }
  }

  get id(): string {
    return this.props.id;
  }

  get name(): string {
    return this.props.name;
  }

  get amount(): Money {
    return Money.fromMinorDenomination(this.props.amountCents, this.props.currency);
  }

  get period(): BudgetPeriod {
    return this.props.period;
  }

  get categoryId(): string {
    return this.props.categoryId;
  }

  isActive(date: Date = new Date()): boolean {
    if (!this.props.isActive) return false;
    if (date < this.props.startDate) return false;
    if (this.props.endDate && date > this.props.endDate) return false;
    return true;
  }

  shouldAlert(spentCents: number): boolean {
    const threshold = this.props.alertThreshold;

    // No threshold configured
    if (threshold === undefined || threshold === null) return false;

    // If threshold is 0, alert on any spend > 0 (but not when exactly 0 spent)
    if (threshold === 0) {
      return spentCents > 0;
    }

    // Avoid divide-by-zero producing Infinity/NaN
    if (this.props.amountCents === 0) {
      // With a zero budget and non-zero threshold, any spend exceeds practical usage
      return spentCents > 0;
    }

    const percentage = (spentCents / this.props.amountCents) * 100;
    return percentage >= threshold;
  }

  /**
   * Calculate the current period's start and end dates for this budget.
   * Used for determining which transactions count toward this budget period.
   */
  getPeriodDates(now: Date): { startDate: Date; endDate: Date } {
    const start = new Date(now);
    const end = new Date(now);

    switch (this.props.period) {
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

    // Don't start before the budget's start date
    if (start < this.props.startDate) {
      start.setTime(this.props.startDate.getTime());
    }

    return { startDate: start, endDate: end };
  }
}