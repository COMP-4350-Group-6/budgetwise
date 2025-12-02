/**
 * Presenters convert domain entities to DTOs for API responses.
 * This keeps serialization logic in the usecases layer, so routes
 * don't need to know about domain entity internals (.props).
 */

import type { Category, Budget, Transaction } from "@budget/domain";
import type { CategoryDTO, BudgetDTO, TransactionDTO } from "@budget/schemas";

// ============================================================================
// Category Presenter
// ============================================================================

export function toCategoryDTO(category: Category): CategoryDTO {
  return {
    id: category.props.id,
    userId: category.props.userId,
    name: category.props.name,
    description: category.props.description ?? null,
    icon: category.props.icon ?? null,
    color: category.props.color ?? null,
    isDefault: category.props.isDefault,
    isActive: category.props.isActive,
    sortOrder: category.props.sortOrder,
    createdAt: category.props.createdAt,
    updatedAt: category.props.updatedAt,
  };
}

export function toCategoryDTOList(categories: Category[]): CategoryDTO[] {
  return categories.map(toCategoryDTO);
}

// ============================================================================
// Budget Presenter
// ============================================================================

export function toBudgetDTO(budget: Budget): BudgetDTO {
  return {
    id: budget.props.id,
    userId: budget.props.userId,
    categoryId: budget.props.categoryId,
    name: budget.props.name,
    amountCents: budget.props.amountCents,
    currency: budget.props.currency,
    period: budget.props.period,
    startDate: budget.props.startDate,
    endDate: budget.props.endDate ?? null,
    isActive: budget.props.isActive,
    alertThreshold: budget.props.alertThreshold ?? null,
    createdAt: budget.props.createdAt,
    updatedAt: budget.props.updatedAt,
  };
}

export function toBudgetDTOList(budgets: Budget[]): BudgetDTO[] {
  return budgets.map(toBudgetDTO);
}

// ============================================================================
// Transaction Presenter
// ============================================================================

export function toTransactionDTO(transaction: Transaction): TransactionDTO {
  return {
    id: transaction.props.id,
    userId: transaction.props.userId,
    budgetId: transaction.props.budgetId ?? null,
    categoryId: transaction.props.categoryId ?? null,
    amountCents: transaction.props.amountCents,
    note: transaction.props.note ?? null,
    occurredAt: transaction.props.occurredAt,
    createdAt: transaction.props.createdAt,
    updatedAt: transaction.props.updatedAt,
  };
}

export function toTransactionDTOList(transactions: Transaction[]): TransactionDTO[] {
  return transactions.map(toTransactionDTO);
}
