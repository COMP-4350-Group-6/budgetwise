import { describe, it, expect, vi, beforeEach } from 'vitest';
import { makeSupabaseTransactionsRepo } from './transactions-repo';
import { Transaction } from '@budget/domain';
import type { SupabaseClient } from '@supabase/supabase-js';

describe('makeSupabaseTransactionsRepo', () => {
  let mockClient: any;
  let repo: ReturnType<typeof makeSupabaseTransactionsRepo>;

  beforeEach(() => {
    // Create a mock Supabase client with chainable methods
    const createMockChain = (finalResult: any) => {
      const chain = {
        from: vi.fn().mockReturnThis(),
        select: vi.fn().mockReturnThis(),
        insert: vi.fn().mockReturnThis(),
        update: vi.fn().mockReturnThis(),
        delete: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        gte: vi.fn().mockReturnThis(),
        lte: vi.fn().mockReturnThis(),
        order: vi.fn().mockReturnThis(),
        limit: vi.fn().mockReturnThis(),
        maybeSingle: vi.fn().mockResolvedValue(finalResult),
      };
      return chain;
    };

    mockClient = {
      from: vi.fn((table: string) => {
        return {
          select: vi.fn().mockReturnThis(),
          insert: vi.fn().mockReturnThis(),
          update: vi.fn().mockReturnThis(),
          delete: vi.fn().mockReturnThis(),
          eq: vi.fn().mockReturnThis(),
          gte: vi.fn().mockReturnThis(),
          lte: vi.fn().mockReturnThis(),
          order: vi.fn().mockReturnThis(),
          limit: vi.fn().mockReturnThis(),
          maybeSingle: vi.fn(),
        };
      }),
    };

    repo = makeSupabaseTransactionsRepo({ client: mockClient as unknown as SupabaseClient });
  });

  describe('getById', () => {
    it('should return a transaction when found', async () => {
      const mockRow = {
        id: 'tx-1',
        user_id: 'user-1',
        budget_id: 'budget-1',
        amount_cents: 5000,
        category_id: 'cat-1',
        note: 'Test transaction',
        occurred_at: '2025-01-15T10:00:00Z',
        created_at: '2025-01-15T10:00:00Z',
        updated_at: '2025-01-15T10:00:00Z',
      };

      const mockChain = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        limit: vi.fn().mockReturnThis(),
        maybeSingle: vi.fn().mockResolvedValue({ data: mockRow, error: null }),
      };

      mockClient.from.mockReturnValue(mockChain);

      const result = await repo.getById('tx-1');

      expect(mockClient.from).toHaveBeenCalledWith('transactions');
      expect(mockChain.select).toHaveBeenCalled();
      expect(mockChain.eq).toHaveBeenCalledWith('id', 'tx-1');
      expect(mockChain.limit).toHaveBeenCalledWith(1);
      expect(mockChain.maybeSingle).toHaveBeenCalled();

      expect(result).not.toBeNull();
      expect(result?.props.id).toBe('tx-1');
      expect(result?.props.amountCents).toBe(5000);
    });

    it('should return null when transaction not found', async () => {
      const mockChain = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        limit: vi.fn().mockReturnThis(),
        maybeSingle: vi.fn().mockResolvedValue({ data: null, error: null }),
      };

      mockClient.from.mockReturnValue(mockChain);

      const result = await repo.getById('non-existent');

      expect(result).toBeNull();
    });

    it('should throw error when database error occurs', async () => {
      const mockError = new Error('Database connection failed');
      const mockChain = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        limit: vi.fn().mockReturnThis(),
        maybeSingle: vi.fn().mockResolvedValue({ data: null, error: mockError }),
      };

      mockClient.from.mockReturnValue(mockChain);

      await expect(repo.getById('tx-1')).rejects.toThrow('Database connection failed');
    });
  });

  describe('listByBudget', () => {
    it('should return transactions for a budget', async () => {
      const mockRows = [
        {
          id: 'tx-1',
          user_id: 'user-1',
          budget_id: 'budget-1',
          amount_cents: 5000,
          category_id: 'cat-1',
          note: 'Transaction 1',
          occurred_at: '2025-01-15T10:00:00Z',
          created_at: '2025-01-15T10:00:00Z',
          updated_at: '2025-01-15T10:00:00Z',
        },
        {
          id: 'tx-2',
          user_id: 'user-1',
          budget_id: 'budget-1',
          amount_cents: 3000,
          category_id: 'cat-2',
          note: 'Transaction 2',
          occurred_at: '2025-01-16T10:00:00Z',
          created_at: '2025-01-16T10:00:00Z',
          updated_at: '2025-01-16T10:00:00Z',
        },
      ];

      const mockChain = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        order: vi.fn().mockReturnThis(),
        limit: vi.fn().mockResolvedValue({ data: mockRows, error: null }),
      };

      mockClient.from.mockReturnValue(mockChain);

      const result = await repo.listByBudget('budget-1');

      expect(mockClient.from).toHaveBeenCalledWith('transactions');
      expect(mockChain.select).toHaveBeenCalled();
      expect(mockChain.eq).toHaveBeenCalledWith('budget_id', 'budget-1');
      expect(mockChain.order).toHaveBeenCalledWith('occurred_at', { ascending: false });
      expect(mockChain.limit).toHaveBeenCalledWith(50);

      expect(result).toHaveLength(2);
      expect(result[0].props.id).toBe('tx-1');
      expect(result[1].props.id).toBe('tx-2');
    });

    it('should respect custom limit parameter', async () => {
      const mockChain = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        order: vi.fn().mockReturnThis(),
        limit: vi.fn().mockResolvedValue({ data: [], error: null }),
      };

      mockClient.from.mockReturnValue(mockChain);

      await repo.listByBudget('budget-1', 10);

      expect(mockChain.limit).toHaveBeenCalledWith(10);
    });

    it('should return empty array when no transactions found', async () => {
      const mockChain = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        order: vi.fn().mockReturnThis(),
        limit: vi.fn().mockResolvedValue({ data: null, error: null }),
      };

      mockClient.from.mockReturnValue(mockChain);

      const result = await repo.listByBudget('budget-1');

      expect(result).toEqual([]);
    });
  });

  describe('listByUserInPeriod', () => {
    it('should return transactions within date range', async () => {
      const startDate = new Date('2025-01-01T00:00:00Z');
      const endDate = new Date('2025-01-31T23:59:59Z');

      const mockRows = [
        {
          id: 'tx-1',
          user_id: 'user-1',
          budget_id: 'budget-1',
          amount_cents: 5000,
          category_id: 'cat-1',
          note: 'In period',
          occurred_at: '2025-01-15T10:00:00Z',
          created_at: '2025-01-15T10:00:00Z',
          updated_at: '2025-01-15T10:00:00Z',
        },
      ];

      const mockChain = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        gte: vi.fn().mockReturnThis(),
        lte: vi.fn().mockReturnThis(),
        order: vi.fn().mockResolvedValue({ data: mockRows, error: null }),
      };

      mockClient.from.mockReturnValue(mockChain);

      const result = await repo.listByUserInPeriod('user-1', startDate, endDate);

      expect(mockClient.from).toHaveBeenCalledWith('transactions');
      expect(mockChain.eq).toHaveBeenCalledWith('user_id', 'user-1');
      expect(mockChain.gte).toHaveBeenCalledWith('occurred_at', startDate.toISOString());
      expect(mockChain.lte).toHaveBeenCalledWith('occurred_at', endDate.toISOString());
      expect(mockChain.order).toHaveBeenCalledWith('occurred_at', { ascending: false });

      expect(result).toHaveLength(1);
      expect(result[0].props.id).toBe('tx-1');
    });
  });

  describe('create', () => {
    it('should insert a new transaction', async () => {
      const transaction = new Transaction({
        id: 'tx-1',
        userId: 'user-1',
        budgetId: 'budget-1',
        amountCents: 5000,
        categoryId: 'cat-1',
        note: 'New transaction',
        occurredAt: new Date('2025-01-15T10:00:00Z'),
        createdAt: new Date('2025-01-15T10:00:00Z'),
        updatedAt: new Date('2025-01-15T10:00:00Z'),
      });

      const mockChain = {
        insert: vi.fn().mockResolvedValue({ error: null }),
      };

      mockClient.from.mockReturnValue(mockChain);

      await repo.create(transaction);

      expect(mockClient.from).toHaveBeenCalledWith('transactions');
      expect(mockChain.insert).toHaveBeenCalledWith(
        expect.objectContaining({
          id: 'tx-1',
          user_id: 'user-1',
          budget_id: 'budget-1',
          amount_cents: 5000,
          category_id: 'cat-1',
          note: 'New transaction',
        })
      );
    });

    it('should throw error on insert failure', async () => {
      const transaction = new Transaction({
        id: 'tx-1',
        userId: 'user-1',
        budgetId: 'budget-1',
        amountCents: 5000,
        occurredAt: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const mockError = new Error('Insert failed');
      const mockChain = {
        insert: vi.fn().mockResolvedValue({ error: mockError }),
      };

      mockClient.from.mockReturnValue(mockChain);

      await expect(repo.create(transaction)).rejects.toThrow('Insert failed');
    });
  });

  describe('update', () => {
    it('should update an existing transaction', async () => {
      const transaction = new Transaction({
        id: 'tx-1',
        userId: 'user-1',
        budgetId: 'budget-1',
        amountCents: 6000,
        categoryId: 'cat-1',
        note: 'Updated transaction',
        occurredAt: new Date('2025-01-15T10:00:00Z'),
        createdAt: new Date('2025-01-15T10:00:00Z'),
        updatedAt: new Date('2025-01-15T11:00:00Z'),
      });

      const mockChain = {
        update: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        select: vi.fn().mockResolvedValue({ error: null, data: null }),
      };

      mockClient.from.mockReturnValue(mockChain);

      await repo.update(transaction);

      expect(mockClient.from).toHaveBeenCalledWith('transactions');
      expect(mockChain.update).toHaveBeenCalledWith(
        expect.objectContaining({
          id: 'tx-1',
          user_id: 'user-1',
          amount_cents: 6000,
          note: 'Updated transaction',
        })
      );
      expect(mockChain.eq).toHaveBeenCalledWith('id', 'tx-1');
      expect(mockChain.eq).toHaveBeenCalledWith('user_id', 'user-1');
    });
  });

  describe('delete', () => {
    it('should delete a transaction by id', async () => {
      const mockChain = {
        delete: vi.fn().mockReturnThis(),
        eq: vi.fn().mockResolvedValue({ error: null }),
      };

      mockClient.from.mockReturnValue(mockChain);

      await repo.delete('tx-1');

      expect(mockClient.from).toHaveBeenCalledWith('transactions');
      expect(mockChain.delete).toHaveBeenCalled();
      expect(mockChain.eq).toHaveBeenCalledWith('id', 'tx-1');
    });

    it('should throw error on delete failure', async () => {
      const mockError = new Error('Delete failed');
      const mockChain = {
        delete: vi.fn().mockReturnThis(),
        eq: vi.fn().mockResolvedValue({ error: mockError }),
      };

      mockClient.from.mockReturnValue(mockChain);

      await expect(repo.delete('tx-1')).rejects.toThrow('Delete failed');
    });
  });
});
