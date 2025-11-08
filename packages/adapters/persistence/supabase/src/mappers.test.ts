import { describe, it, expect } from 'vitest';
import { Category, Budget, Transaction, User } from '@budget/domain';
import {
  toCategory,
  fromCategory,
  toBudget,
  fromBudget,
  toTransaction,
  fromTransaction,
  toUser,
  fromUser,
  type CategoryRow,
  type BudgetRow,
  type TransactionRow,
  type UserRow,
} from './mappers';

describe('Supabase Mappers', () => {
  describe('Category Mappers', () => {
    it('should convert CategoryRow to Category domain entity', () => {
      const row: CategoryRow = {
        id: 'cat-1',
        user_id: 'user-1',
        name: 'Groceries',
        description: 'Food and household items',
        icon: '🛒',
        color: '#4CAF50',
        is_default: true,
        is_active: true,
        sort_order: 1,
        created_at: '2025-01-15T10:00:00Z',
        updated_at: '2025-01-15T10:00:00Z',
      };

      const category = toCategory(row);

      expect(category).toBeInstanceOf(Category);
      expect(category.props.id).toBe('cat-1');
      expect(category.props.userId).toBe('user-1');
      expect(category.props.name).toBe('Groceries');
      expect(category.props.description).toBe('Food and household items');
      expect(category.props.icon).toBe('🛒');
      expect(category.props.color).toBe('#4CAF50');
      expect(category.props.isDefault).toBe(true);
      expect(category.props.isActive).toBe(true);
      expect(category.props.sortOrder).toBe(1);
      expect(category.props.createdAt).toEqual(new Date('2025-01-15T10:00:00Z'));
      expect(category.props.updatedAt).toEqual(new Date('2025-01-15T10:00:00Z'));
    });

    it('should handle null optional fields in CategoryRow', () => {
      const row: CategoryRow = {
        id: 'cat-1',
        user_id: 'user-1',
        name: 'Groceries',
        description: null,
        icon: null,
        color: null,
        is_default: false,
        is_active: true,
        sort_order: 1,
        created_at: '2025-01-15T10:00:00Z',
        updated_at: '2025-01-15T10:00:00Z',
      };

      const category = toCategory(row);

      expect(category.props.description).toBeUndefined();
      expect(category.props.icon).toBeUndefined();
      expect(category.props.color).toBeUndefined();
    });

    it('should convert Category domain entity to CategoryRow', () => {
      const category = new Category({
        id: 'cat-1',
        userId: 'user-1',
        name: 'Groceries',
        description: 'Food items',
        icon: '🛒',
        color: '#4CAF50',
        isDefault: true,
        isActive: true,
        sortOrder: 1,
        createdAt: new Date('2025-01-15T10:00:00Z'),
        updatedAt: new Date('2025-01-15T10:00:00Z'),
      });

      const row = fromCategory(category);

      expect(row.id).toBe('cat-1');
      expect(row.user_id).toBe('user-1');
      expect(row.name).toBe('Groceries');
      expect(row.description).toBe('Food items');
      expect(row.icon).toBe('🛒');
      expect(row.color).toBe('#4CAF50');
      expect(row.is_default).toBe(true);
      expect(row.is_active).toBe(true);
      expect(row.sort_order).toBe(1);
      expect(row.created_at).toBe('2025-01-15T10:00:00.000Z');
      expect(row.updated_at).toBe('2025-01-15T10:00:00.000Z');
    });

    it('should convert undefined optional fields to null in CategoryRow', () => {
      const category = new Category({
        id: 'cat-1',
        userId: 'user-1',
        name: 'Groceries',
        isDefault: false,
        isActive: true,
        sortOrder: 1,
        createdAt: new Date('2025-01-15T10:00:00Z'),
        updatedAt: new Date('2025-01-15T10:00:00Z'),
      });

      const row = fromCategory(category);

      expect(row.description).toBeNull();
      expect(row.icon).toBeNull();
      expect(row.color).toBeNull();
    });

    it('should round-trip Category through mappers', () => {
      const original = new Category({
        id: 'cat-1',
        userId: 'user-1',
        name: 'Groceries',
        description: 'Food',
        icon: '🛒',
        color: '#4CAF50',
        isDefault: true,
        isActive: true,
        sortOrder: 1,
        createdAt: new Date('2025-01-15T10:00:00Z'),
        updatedAt: new Date('2025-01-15T10:00:00Z'),
      });

      const row = fromCategory(original);
      const roundTripped = toCategory(row);

      expect(roundTripped.props).toEqual(original.props);
    });
  });

  describe('Budget Mappers', () => {
    it('should convert BudgetRow to Budget domain entity', () => {
      const row: BudgetRow = {
        id: 'budget-1',
        user_id: 'user-1',
        category_id: 'cat-1',
        name: 'Monthly Groceries',
        amount_cents: 50000,
        currency: 'USD',
        period: 'MONTHLY',
        start_date: '2025-01-01T00:00:00Z',
        end_date: '2025-01-31T23:59:59Z',
        is_active: true,
        alert_threshold: 80,
        created_at: '2025-01-01T10:00:00Z',
        updated_at: '2025-01-01T10:00:00Z',
      };

      const budget = toBudget(row);

      expect(budget).toBeInstanceOf(Budget);
      expect(budget.props.id).toBe('budget-1');
      expect(budget.props.userId).toBe('user-1');
      expect(budget.props.categoryId).toBe('cat-1');
      expect(budget.props.name).toBe('Monthly Groceries');
      expect(budget.props.amountCents).toBe(50000);
      expect(budget.props.currency).toBe('USD');
      expect(budget.props.period).toBe('MONTHLY');
      expect(budget.props.startDate).toEqual(new Date('2025-01-01T00:00:00Z'));
      expect(budget.props.endDate).toEqual(new Date('2025-01-31T23:59:59Z'));
      expect(budget.props.isActive).toBe(true);
      expect(budget.props.alertThreshold).toBe(80);
    });

    it('should handle null optional fields in BudgetRow', () => {
      const row: BudgetRow = {
        id: 'budget-1',
        user_id: 'user-1',
        category_id: 'cat-1',
        name: 'Monthly Groceries',
        amount_cents: 50000,
        currency: 'USD',
        period: 'MONTHLY',
        start_date: '2025-01-01T00:00:00Z',
        end_date: null,
        is_active: true,
        alert_threshold: null,
        created_at: '2025-01-01T10:00:00Z',
        updated_at: '2025-01-01T10:00:00Z',
      };

      const budget = toBudget(row);

      expect(budget.props.endDate).toBeUndefined();
      expect(budget.props.alertThreshold).toBeUndefined();
    });

    it('should convert Budget domain entity to BudgetRow', () => {
      const budget = new Budget({
        id: 'budget-1',
        userId: 'user-1',
        categoryId: 'cat-1',
        name: 'Monthly Groceries',
        amountCents: 50000,
        currency: 'USD',
        period: 'MONTHLY',
        startDate: new Date('2025-01-01T00:00:00Z'),
        endDate: new Date('2025-01-31T23:59:59Z'),
        isActive: true,
        alertThreshold: 80,
        createdAt: new Date('2025-01-01T10:00:00Z'),
        updatedAt: new Date('2025-01-01T10:00:00Z'),
      });

      const row = fromBudget(budget);

      expect(row.id).toBe('budget-1');
      expect(row.user_id).toBe('user-1');
      expect(row.category_id).toBe('cat-1');
      expect(row.name).toBe('Monthly Groceries');
      expect(row.amount_cents).toBe(50000);
      expect(row.currency).toBe('USD');
      expect(row.period).toBe('MONTHLY');
      expect(row.start_date).toBe('2025-01-01T00:00:00.000Z');
      expect(row.end_date).toBe('2025-01-31T23:59:59.000Z');
      expect(row.is_active).toBe(true);
      expect(row.alert_threshold).toBe(80);
    });

    it('should round-trip Budget through mappers', () => {
      const original = new Budget({
        id: 'budget-1',
        userId: 'user-1',
        categoryId: 'cat-1',
        name: 'Monthly Groceries',
        amountCents: 50000,
        currency: 'USD',
        period: 'MONTHLY',
        startDate: new Date('2025-01-01T00:00:00Z'),
        endDate: new Date('2025-01-31T23:59:59Z'),
        isActive: true,
        alertThreshold: 80,
        createdAt: new Date('2025-01-01T10:00:00Z'),
        updatedAt: new Date('2025-01-01T10:00:00Z'),
      });

      const row = fromBudget(original);
      const roundTripped = toBudget(row);

      expect(roundTripped.props).toEqual(original.props);
    });
  });

  describe('Transaction Mappers', () => {
    it('should convert TransactionRow to Transaction domain entity', () => {
      const row: TransactionRow = {
        id: 'tx-1',
        user_id: 'user-1',
        budget_id: 'budget-1',
        amount_cents: 5000,
        category_id: 'cat-1',
        note: 'Weekly groceries',
        occurred_at: '2025-01-15T14:30:00Z',
        created_at: '2025-01-15T14:35:00Z',
        updated_at: '2025-01-15T14:35:00Z',
      };

      const transaction = toTransaction(row);

      expect(transaction).toBeInstanceOf(Transaction);
      expect(transaction.props.id).toBe('tx-1');
      expect(transaction.props.userId).toBe('user-1');
      expect(transaction.props.budgetId).toBe('budget-1');
      expect(transaction.props.amountCents).toBe(5000);
      expect(transaction.props.categoryId).toBe('cat-1');
      expect(transaction.props.note).toBe('Weekly groceries');
      expect(transaction.props.occurredAt).toEqual(new Date('2025-01-15T14:30:00Z'));
      expect(transaction.props.createdAt).toEqual(new Date('2025-01-15T14:35:00Z'));
      expect(transaction.props.updatedAt).toEqual(new Date('2025-01-15T14:35:00Z'));
    });

    it('should handle null optional fields in TransactionRow', () => {
      const row: TransactionRow = {
        id: 'tx-1',
        user_id: 'user-1',
        budget_id: null,
        amount_cents: 5000,
        category_id: null,
        note: null,
        occurred_at: '2025-01-15T14:30:00Z',
        created_at: '2025-01-15T14:35:00Z',
        updated_at: '2025-01-15T14:35:00Z',
      };

      const transaction = toTransaction(row);

      expect(transaction.props.budgetId).toBeUndefined();
      expect(transaction.props.categoryId).toBeUndefined();
      expect(transaction.props.note).toBeUndefined();
    });

    it('should convert Transaction domain entity to TransactionRow', () => {
      const transaction = new Transaction({
        id: 'tx-1',
        userId: 'user-1',
        budgetId: 'budget-1',
        amountCents: 5000,
        categoryId: 'cat-1',
        note: 'Weekly groceries',
        occurredAt: new Date('2025-01-15T14:30:00Z'),
        createdAt: new Date('2025-01-15T14:35:00Z'),
        updatedAt: new Date('2025-01-15T14:35:00Z'),
      });

      const row = fromTransaction(transaction);

      expect(row.id).toBe('tx-1');
      expect(row.user_id).toBe('user-1');
      expect(row.budget_id).toBe('budget-1');
      expect(row.amount_cents).toBe(5000);
      expect(row.category_id).toBe('cat-1');
      expect(row.note).toBe('Weekly groceries');
      expect(row.occurred_at).toBe('2025-01-15T14:30:00.000Z');
      expect(row.created_at).toBe('2025-01-15T14:35:00.000Z');
      expect(row.updated_at).toBe('2025-01-15T14:35:00.000Z');
    });

    it('should round-trip Transaction through mappers', () => {
      const original = new Transaction({
        id: 'tx-1',
        userId: 'user-1',
        budgetId: 'budget-1',
        amountCents: 5000,
        categoryId: 'cat-1',
        note: 'Weekly groceries',
        occurredAt: new Date('2025-01-15T14:30:00Z'),
        createdAt: new Date('2025-01-15T14:35:00Z'),
        updatedAt: new Date('2025-01-15T14:35:00Z'),
      });

      const row = fromTransaction(original);
      const roundTripped = toTransaction(row);

      expect(roundTripped.props).toEqual(original.props);
    });
  });

  describe('User Mappers', () => {
    it('should convert UserRow to User domain entity', () => {
      const row: UserRow = {
        id: 'user-1',
        email: 'test@example.com',
        name: 'Test User',
        default_currency: 'USD',
        created_at: '2025-01-01T10:00:00Z',
        updated_at: '2025-01-01T10:00:00Z',
      };

      const user = toUser(row);

      expect(user).toBeInstanceOf(User);
      expect(user.props.id).toBe('user-1');
      expect(user.props.email).toBe('test@example.com');
      expect(user.props.name).toBe('Test User');
      expect(user.props.defaultCurrency).toBe('USD');
      expect(user.props.createdAt).toEqual(new Date('2025-01-01T10:00:00Z'));
      expect(user.props.updatedAt).toEqual(new Date('2025-01-01T10:00:00Z'));
    });

    it('should convert User domain entity to UserRow', () => {
      const user = new User({
        id: 'user-1',
        email: 'test@example.com',
        name: 'Test User',
        defaultCurrency: 'USD',
        createdAt: new Date('2025-01-01T10:00:00Z'),
        updatedAt: new Date('2025-01-01T10:00:00Z'),
      });

      const row = fromUser(user);

      expect(row.id).toBe('user-1');
      expect(row.email).toBe('test@example.com');
      expect(row.name).toBe('Test User');
      expect(row.default_currency).toBe('USD');
      expect(row.created_at).toBe('2025-01-01T10:00:00.000Z');
      expect(row.updated_at).toBe('2025-01-01T10:00:00.000Z');
    });

    it('should round-trip User through mappers', () => {
      const original = new User({
        id: 'user-1',
        email: 'test@example.com',
        name: 'Test User',
        defaultCurrency: 'USD',
        createdAt: new Date('2025-01-01T10:00:00Z'),
        updatedAt: new Date('2025-01-01T10:00:00Z'),
      });

      const row = fromUser(original);
      const roundTripped = toUser(row);

      expect(roundTripped.props).toEqual(original.props);
    });
  });
});
