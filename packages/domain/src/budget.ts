import { Money } from './money';
import type { Currency } from './money';

export type BudgetPeriod = 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'YEARLY';

export interface BudgetProps {
  id: string;
  userId: string;
  name: string;
  amountCents: number;
  currency: Currency;
  period: BudgetPeriod;
  categoryId?: string;
  startDate: Date;
  endDate?: Date;
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
    if (props.endDate && props.endDate < props.startDate) {
      throw new Error("End date cannot be before start date");
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

  isActive(date: Date = new Date()): boolean {
    if (date < this.props.startDate) return false;
    if (this.props.endDate && date > this.props.endDate) return false;
    return true;
  }
}