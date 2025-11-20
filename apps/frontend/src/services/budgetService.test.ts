import { describe, it, expect, vi, beforeEach } from 'vitest';
import { budgetService, categoryService } from './budgetService';
import type { BudgetDashboard, Category, Budget, BudgetStatus } from './budgetService';
import { apiFetch } from '../lib/apiClient';

// Mock the apiClient
vi.mock('../lib/apiClient', () => ({
  apiFetch: vi.fn(),
}));

describe('budgetService', () => {

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getDashboard', () => {
    it('should fetch budget dashboard', async () => {
      const mockDashboard: BudgetDashboard = {
        categories: [],
        totalBudgetCents: 100000,
        totalSpentCents: 50000,
        overBudgetCount: 0,
        alertCount: 1,
      };

      vi.mocked(apiFetch).mockResolvedValueOnce({ dashboard: mockDashboard });

      const result = await budgetService.getDashboard();

      expect(apiFetch).toHaveBeenCalledWith('/budgets/dashboard', {}, true);
      expect(result).toEqual(mockDashboard);
    });
  });

  describe('getBudgetStatus', () => {
    it('should fetch budget status by ID', async () => {
      const mockStatus: BudgetStatus = {
        budget: {
          id: 'b1',
          userId: 'u1',
          categoryId: 'c1',
          name: 'Groceries',
          amountCents: 50000,
          currency: 'USD',
          period: 'MONTHLY',
          startDate: '2025-11-01',
          isActive: true,
          createdAt: '2025-11-01T00:00:00Z',
          updatedAt: '2025-11-01T00:00:00Z',
        },
        spentCents: 25000,
        remainingCents: 25000,
        percentageUsed: 50,
        isOverBudget: false,
        shouldAlert: false,
        transactionCount: 5,
      };

      vi.mocked(apiFetch).mockResolvedValueOnce({ status: mockStatus });

      const result = await budgetService.getBudgetStatus('b1');

      expect(apiFetch).toHaveBeenCalledWith('/budgets/b1/status', {}, true);
      expect(result).toEqual(mockStatus);
    });
  });

  describe('listBudgets', () => {
    it('should list all budgets when activeOnly is false', async () => {
      const mockBudgets: Budget[] = [
        {
          id: 'b1',
          userId: 'u1',
          categoryId: 'c1',
          name: 'Groceries',
          amountCents: 50000,
          currency: 'USD',
          period: 'MONTHLY',
          startDate: '2025-11-01',
          isActive: true,
          createdAt: '2025-11-01T00:00:00Z',
          updatedAt: '2025-11-01T00:00:00Z',
        },
      ];

      vi.mocked(apiFetch).mockResolvedValueOnce({ budgets: mockBudgets });

      const result = await budgetService.listBudgets(false);

      expect(apiFetch).toHaveBeenCalledWith('/budgets', {}, true);
      expect(result).toEqual(mockBudgets);
    });

    it('should list only active budgets when activeOnly is true', async () => {
      const mockBudgets: Budget[] = [];
      vi.mocked(apiFetch).mockResolvedValueOnce({ budgets: mockBudgets });

      await budgetService.listBudgets(true);

      expect(apiFetch).toHaveBeenCalledWith('/budgets?active=true', {}, true);
    });
  });

  describe('createBudget', () => {
    it('should create a new budget', async () => {
      const input = {
        categoryId: 'c1',
        name: 'Groceries Budget',
        amountCents: 50000,
        currency: 'USD' as const,
        period: 'MONTHLY' as const,
        startDate: new Date('2025-11-01'),
      };

      const mockBudget: Budget = {
        id: 'b1',
        userId: 'u1',
        categoryId: 'c1',
        name: 'Budget',
        amountCents: 50000,
        currency: 'USD',
        period: 'MONTHLY',
        startDate: '2025-11-01',
        isActive: true,
        createdAt: '2025-11-01T00:00:00Z',
        updatedAt: '2025-11-01T00:00:00Z',
      };

      vi.mocked(apiFetch).mockResolvedValueOnce({ budget: mockBudget });

      const result = await budgetService.createBudget(input);

      expect(apiFetch).toHaveBeenCalledWith(
        '/budgets',
        {
          method: 'POST',
          body: JSON.stringify(input),
        },
        true
      );
      expect(result).toEqual(mockBudget);
    });
  });

  describe('updateBudget', () => {
    it('should update an existing budget', async () => {
      const updates = {
        amountCents: 75000,
        alertThreshold: 0.8,
      };

      const mockBudget: Budget = {
        id: 'b1',
        userId: 'u1',
        categoryId: 'c1',
        name: 'Budget',
        amountCents: 75000,
        currency: 'USD',
        period: 'MONTHLY',
        startDate: '2025-11-01',
        isActive: true,
        alertThreshold: 0.8,
        createdAt: '2025-11-01T00:00:00Z',
        updatedAt: '2025-11-07T00:00:00Z',
      };

      vi.mocked(apiFetch).mockResolvedValueOnce({ budget: mockBudget });

      const result = await budgetService.updateBudget('b1', updates);

      expect(apiFetch).toHaveBeenCalledWith(
        '/budgets/b1',
        {
          method: 'PUT',
          body: JSON.stringify(updates),
        },
        true
      );
      expect(result).toEqual(mockBudget);
    });
  });

  describe('deleteBudget', () => {
    it('should delete a budget by ID', async () => {
      vi.mocked(apiFetch).mockResolvedValueOnce({ message: 'Deleted' });

      await budgetService.deleteBudget('b1');

      expect(apiFetch).toHaveBeenCalledWith('/budgets/b1', { method: 'DELETE' }, true);
    });
  });
});

describe('categoryService', () => {

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('listCategories', () => {
    it('should list all categories when activeOnly is false', async () => {
      const mockCategories: Category[] = [
        {
          id: 'c1',
          userId: 'u1',
          name: 'Food',
          isDefault: false,
          isActive: true,
          sortOrder: 0,
          createdAt: '2025-11-01T00:00:00Z',
          updatedAt: '2025-11-01T00:00:00Z',
        },
      ];

      vi.mocked(apiFetch).mockResolvedValueOnce({ categories: mockCategories });

      const result = await categoryService.listCategories(false);

      expect(apiFetch).toHaveBeenCalledWith('/categories', {}, true);
      expect(result).toEqual(mockCategories);
    });

    it('should list only active categories when activeOnly is true', async () => {
      const mockCategories: Category[] = [];
      vi.mocked(apiFetch).mockResolvedValueOnce({ categories: mockCategories });

      await categoryService.listCategories(true);

      expect(apiFetch).toHaveBeenCalledWith('/categories?active=true', {}, true);
    });
  });

  describe('seedDefaultCategories', () => {
    it('should seed default categories', async () => {
      const mockCategories: Category[] = [
        {
          id: 'c1',
          userId: 'u1',
          name: 'Food',
          isDefault: true,
          isActive: true,
          sortOrder: 0,
          createdAt: '2025-11-01T00:00:00Z',
          updatedAt: '2025-11-01T00:00:00Z',
        },
      ];

      vi.mocked(apiFetch).mockResolvedValueOnce({
        categories: mockCategories,
        message: 'Seeded',
      });

      const result = await categoryService.seedDefaultCategories();

      expect(apiFetch).toHaveBeenCalledWith('/categories/seed', { method: 'POST' }, true);
      expect(result).toEqual(mockCategories);
    });
  });

  describe('createCategory', () => {
    it('should create a new category', async () => {
      const input = {
        name: 'Entertainment',
        description: 'Movies, games, etc.',
        icon: '🎮',
        color: '#FF5733',
      };

      const mockCategory: Category = {
        id: 'c1',
        userId: 'u1',
        name: 'Entertainment',
        description: 'Movies, games, etc.',
        icon: '🎮',
        color: '#FF5733',
        isDefault: false,
        isActive: true,
        sortOrder: 0,
        createdAt: '2025-11-01T00:00:00Z',
        updatedAt: '2025-11-01T00:00:00Z',
      };

      vi.mocked(apiFetch).mockResolvedValueOnce({ category: mockCategory });

      const result = await categoryService.createCategory(input);

      expect(apiFetch).toHaveBeenCalledWith(
        '/categories',
        {
          method: 'POST',
          body: JSON.stringify(input),
        },
        true
      );
      expect(result).toEqual(mockCategory);
    });
  });

  describe('updateCategory', () => {
    it('should update an existing category', async () => {
      const updates = {
        name: 'Food & Dining',
        color: '#00AA00',
      };

      const mockCategory: Category = {
        id: 'c1',
        userId: 'u1',
        name: 'Food & Dining',
        color: '#00AA00',
        isDefault: false,
        isActive: true,
        sortOrder: 0,
        createdAt: '2025-11-01T00:00:00Z',
        updatedAt: '2025-11-07T00:00:00Z',
      };

      vi.mocked(apiFetch).mockResolvedValueOnce({ category: mockCategory });

      const result = await categoryService.updateCategory('c1', updates);

      expect(apiFetch).toHaveBeenCalledWith(
        '/categories/c1',
        {
          method: 'PUT',
          body: JSON.stringify(updates),
        },
        true
      );
      expect(result).toEqual(mockCategory);
    });
  });

  describe('deleteCategory', () => {
    it('should delete a category by ID', async () => {
      vi.mocked(apiFetch).mockResolvedValueOnce({ message: 'Deleted' });

      await categoryService.deleteCategory('c1');

      expect(apiFetch).toHaveBeenCalledWith('/categories/c1', { method: 'DELETE' }, true);
    });
  });
});
