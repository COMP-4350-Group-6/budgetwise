import { Category, Budget, Transaction, User } from "@budget/domain";
import type { Currency } from "@budget/domain";

export type CategoryRow = {
  id: string;
  user_id: string;
  name: string;
  description: string | null;
  icon: string | null;
  color: string | null;
  is_default: boolean;
  is_active: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
};

export function toCategory(row: CategoryRow): Category {
  return new Category({
    id: row.id,
    userId: row.user_id,
    name: row.name,
    description: row.description ?? undefined,
    icon: row.icon ?? undefined,
    color: row.color ?? undefined,
    isDefault: row.is_default,
    isActive: row.is_active,
    sortOrder: row.sort_order,
    createdAt: new Date(row.created_at),
    updatedAt: new Date(row.updated_at),
  });
}

export function fromCategory(category: Category): CategoryRow {
  return {
    id: category.props.id,
    user_id: category.props.userId,
    name: category.props.name,
    description: category.props.description ?? null,
    icon: category.props.icon ?? null,
    color: category.props.color ?? null,
    is_default: category.props.isDefault,
    is_active: category.props.isActive,
    sort_order: category.props.sortOrder,
    created_at: category.props.createdAt.toISOString(),
    updated_at: category.props.updatedAt.toISOString(),
  };
}

export type BudgetRow = {
  id: string;
  user_id: string;
  category_id: string;
  name: string;
  amount_cents: number;
  currency: string;
  period: string;
  start_date: string;
  end_date: string | null;
  is_active: boolean;
  alert_threshold: number | null;
  created_at: string;
  updated_at: string;
};

export function toBudget(row: BudgetRow): Budget {
  return new Budget({
    id: row.id,
    userId: row.user_id,
    categoryId: row.category_id,
    name: row.name,
    amountCents: row.amount_cents,
    currency: row.currency as Currency,
    period: row.period as Budget["props"]["period"],
    startDate: new Date(row.start_date),
    endDate: row.end_date ? new Date(row.end_date) : undefined,
    isActive: row.is_active,
    alertThreshold: row.alert_threshold ?? undefined,
    createdAt: new Date(row.created_at),
    updatedAt: new Date(row.updated_at),
  });
}

export function fromBudget(budget: Budget): BudgetRow {
  return {
    id: budget.props.id,
    user_id: budget.props.userId,
    category_id: budget.props.categoryId,
    name: budget.props.name,
    amount_cents: budget.props.amountCents,
    currency: budget.props.currency,
    period: budget.props.period,
    start_date: budget.props.startDate.toISOString(),
    end_date: budget.props.endDate ? budget.props.endDate.toISOString() : null,
    is_active: budget.props.isActive,
    alert_threshold: budget.props.alertThreshold ?? null,
    created_at: budget.props.createdAt.toISOString(),
    updated_at: budget.props.updatedAt.toISOString(),
  };
}

export type TransactionRow = {
  id: string;
  user_id: string;
  budget_id: string | null;
  category_id: string | null;
  amount_cents: number;
  note: string | null;
  occurred_at: string;
  created_at: string;
  updated_at: string;
};

export function toTransaction(row: TransactionRow): Transaction {
  return new Transaction({
    id: row.id,
    userId: row.user_id,
    budgetId: row.budget_id ?? undefined,
    categoryId: row.category_id ?? undefined,
    amountCents: row.amount_cents,
    note: row.note ?? undefined,
    occurredAt: new Date(row.occurred_at),
    createdAt: new Date(row.created_at),
    updatedAt: new Date(row.updated_at),
  });
}

export function fromTransaction(tx: Transaction): TransactionRow {
  return {
    id: tx.props.id,
    user_id: tx.props.userId,
    budget_id: tx.props.budgetId ?? null,
    category_id: tx.props.categoryId ?? null,
    amount_cents: tx.props.amountCents,
    note: tx.props.note ?? null,
    occurred_at: tx.props.occurredAt.toISOString(),
    created_at: tx.props.createdAt.toISOString(),
    updated_at: tx.props.updatedAt.toISOString(),
  };
}

export type UserRow = {
  id: string;
  email: string;
  name: string;
  default_currency: string;
  created_at: string;
  updated_at: string;
};

export function toUser(row: UserRow): User {
  return new User({
    id: row.id,
    email: row.email,
    name: row.name,
    defaultCurrency: row.default_currency,
    createdAt: new Date(row.created_at),
    updatedAt: new Date(row.updated_at),
  });
}

export function fromUser(user: User): UserRow {
  return {
    id: user.props.id,
    email: user.props.email,
    name: user.props.name,
    default_currency: user.props.defaultCurrency,
    created_at: user.props.createdAt.toISOString(),
    updated_at: user.props.updatedAt.toISOString(),
  };
}

