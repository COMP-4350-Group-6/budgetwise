import { describe, it, expect, vi, beforeEach } from 'vitest';
import { transactionsService } from './transactionsService';
import type { TransactionDTO, AddTransactionInput, ParsedInvoiceData } from './transactionsService';
import { apiFetch } from '../lib/apiClient';

// Mock the apiClient
vi.mock('../lib/apiClient', () => ({
  apiFetch: vi.fn(),
}));

describe('transactionsService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('addTransaction', () => {
    it('should add a new transaction with all fields', async () => {
      const input: AddTransactionInput = {
        budgetId: 'b1',
        categoryId: 'c1',
        amountCents: 5000,
        note: 'Coffee Shop',
        occurredAt: new Date('2025-11-07T10:30:00Z'),
      };

      const mockResponse: TransactionDTO = {
        id: 't1',
        userId: 'u1',
        budgetId: 'b1',
        categoryId: 'c1',
        amountCents: 5000,
        note: 'Coffee Shop',
        occurredAt: '2025-11-07T10:30:00.000Z',
        createdAt: '2025-11-07T10:30:00.000Z',
        updatedAt: '2025-11-07T10:30:00.000Z',
      };

      vi.mocked(apiFetch).mockResolvedValueOnce({ transaction: mockResponse });

      const result = await transactionsService.addTransaction(input);

      expect(apiFetch).toHaveBeenCalledWith(
        '/transactions',
        {
          method: 'POST',
          body: JSON.stringify({
            budgetId: 'b1',
            categoryId: 'c1',
            amountCents: 5000,
            note: 'Coffee Shop',
            occurredAt: '2025-11-07T10:30:00.000Z',
          }),
        },
        true
      );
      expect(result).toEqual({ transaction: mockResponse });
    });

    it('should add transaction without optional fields', async () => {
      const input: AddTransactionInput = {
        amountCents: 5000,
        occurredAt: new Date('2025-11-07T10:30:00Z'),
      };

      const mockResponse: TransactionDTO = {
        id: 't1',
        userId: 'u1',
        amountCents: 5000,
        occurredAt: '2025-11-07T10:30:00.000Z',
        createdAt: '2025-11-07T10:30:00.000Z',
        updatedAt: '2025-11-07T10:30:00.000Z',
      };

      vi.mocked(apiFetch).mockResolvedValueOnce({ transaction: mockResponse });

      await transactionsService.addTransaction(input);

      expect(apiFetch).toHaveBeenCalledWith(
        '/transactions',
        expect.objectContaining({
          method: 'POST',
          body: expect.stringContaining('"amountCents":5000'),
        }),
        true
      );
    });

    it('should convert Date to ISO string', async () => {
      const input: AddTransactionInput = {
        amountCents: 5000,
        occurredAt: new Date('2025-11-07T15:30:00Z'),
      };

      vi.mocked(apiFetch).mockResolvedValueOnce({ transaction: {} as TransactionDTO });

      await transactionsService.addTransaction(input);

      const callArgs = vi.mocked(apiFetch).mock.calls[0];
      const body = JSON.parse((callArgs[1]?.body as string) || '{}');
      expect(body.occurredAt).toBe('2025-11-07T15:30:00.000Z');
    });
  });

  describe('categorizeTransaction', () => {
    it('should categorize a transaction and return result', async () => {
      const mockResponse = {
        categoryId: 'c1',
        reasoning: 'This appears to be a grocery purchase',
      };

      vi.mocked(apiFetch).mockResolvedValueOnce(mockResponse);

      const result = await transactionsService.categorizeTransaction('t1');

      expect(apiFetch).toHaveBeenCalledWith('/transactions/t1/categorize', { method: 'POST' }, true);
      expect(result).toEqual({
        categoryId: 'c1',
        reasoning: 'This appears to be a grocery purchase',
      });
    });

    it('should return null if response missing categoryId', async () => {
      vi.mocked(apiFetch).mockResolvedValueOnce({ message: 'Could not categorize' });

      const result = await transactionsService.categorizeTransaction('t1');

      expect(result).toBeNull();
    });

    it('should return null if response missing reasoning', async () => {
      vi.mocked(apiFetch).mockResolvedValueOnce({ categoryId: 'c1' });

      const result = await transactionsService.categorizeTransaction('t1');

      expect(result).toBeNull();
    });

    it('should handle errors and return null', async () => {
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      vi.mocked(apiFetch).mockRejectedValueOnce(new Error('Network error'));

      const result = await transactionsService.categorizeTransaction('t1');

      expect(result).toBeNull();
      expect(consoleErrorSpy).toHaveBeenCalled();
      consoleErrorSpy.mockRestore();
    });
  });

  describe('updateTransaction', () => {
    it('should update transaction with all fields', async () => {
      const updates: Partial<AddTransactionInput> = {
        budgetId: 'b2',
        categoryId: 'c2',
        amountCents: 7500,
        note: 'Updated Note',
        occurredAt: new Date('2025-11-08T10:00:00Z'),
      };

      const mockResponse: TransactionDTO = {
        id: 't1',
        userId: 'u1',
        budgetId: 'b2',
        categoryId: 'c2',
        amountCents: 7500,
        note: 'Updated Note',
        occurredAt: '2025-11-08T10:00:00.000Z',
        createdAt: '2025-11-07T10:30:00.000Z',
        updatedAt: '2025-11-08T10:00:00.000Z',
      };

      vi.mocked(apiFetch).mockResolvedValueOnce({ transaction: mockResponse });

      const result = await transactionsService.updateTransaction('t1', updates);

      expect(apiFetch).toHaveBeenCalledWith(
        '/transactions/t1',
        {
          method: 'PATCH',
          body: expect.stringContaining('"amountCents":7500'),
        },
        true
      );
      expect(result).toEqual(mockResponse);
    });

    it('should update transaction with partial fields', async () => {
      const updates = {
        note: 'Just a note update',
      };

      const mockResponse: TransactionDTO = {
        id: 't1',
        userId: 'u1',
        amountCents: 5000,
        note: 'Just a note update',
        occurredAt: '2025-11-07T10:30:00.000Z',
        createdAt: '2025-11-07T10:30:00.000Z',
        updatedAt: '2025-11-08T10:00:00.000Z',
      };

      vi.mocked(apiFetch).mockResolvedValueOnce({ transaction: mockResponse });

      const result = await transactionsService.updateTransaction('t1', updates);

      expect(result.note).toBe('Just a note update');
    });

    it('should convert Date to ISO string in updates', async () => {
      const updates: Partial<AddTransactionInput> = {
        occurredAt: new Date('2025-11-10T12:00:00Z'),
      };

      vi.mocked(apiFetch).mockResolvedValueOnce({ transaction: {} as TransactionDTO });

      await transactionsService.updateTransaction('t1', updates);

      const callArgs = vi.mocked(apiFetch).mock.calls[0];
      const body = JSON.parse((callArgs[1]?.body as string) || '{}');
      expect(body.occurredAt).toBe('2025-11-10T12:00:00.000Z');
    });
  });

  describe('deleteTransaction', () => {
    it('should delete a transaction by ID', async () => {
      vi.mocked(apiFetch).mockResolvedValueOnce(undefined);

      await transactionsService.deleteTransaction('t1');

      expect(apiFetch).toHaveBeenCalledWith('/transactions/t1', { method: 'DELETE' }, true);
    });
  });

  describe('listTransactions', () => {
    it('should fetch all transactions', async () => {
      const mockTransactions: TransactionDTO[] = [
        {
          id: 't1',
          userId: 'u1',
          amountCents: 5000,
          occurredAt: '2025-11-07T10:30:00.000Z',
          createdAt: '2025-11-07T10:30:00.000Z',
          updatedAt: '2025-11-07T10:30:00.000Z',
        },
        {
          id: 't2',
          userId: 'u1',
          amountCents: 7500,
          occurredAt: '2025-11-08T15:00:00.000Z',
          createdAt: '2025-11-08T15:00:00.000Z',
          updatedAt: '2025-11-08T15:00:00.000Z',
        },
      ];

      vi.mocked(apiFetch).mockResolvedValueOnce({ transactions: mockTransactions });

      const result = await transactionsService.listTransactions();

      expect(apiFetch).toHaveBeenCalledWith('/transactions', {}, true);
      expect(result).toEqual(mockTransactions);
      expect(result).toHaveLength(2);
    });
  });

  describe('parseInvoice', () => {
    it('should parse invoice from base64 image', async () => {
      const imageBase64 = 'data:image/png;base64,iVBORw0KGgoAAAANS...';
      const mockInvoice: ParsedInvoiceData = {
        merchant: 'Starbucks',
        date: '2025-11-07',
        total: 15.75,
        tax: 1.25,
        subtotal: 14.50,
        invoiceNumber: 'INV-123',
        description: 'Coffee and pastry',
        suggestedCategory: 'Food & Dining',
        confidence: 0.95,
      };

      vi.mocked(apiFetch).mockResolvedValueOnce({ invoice: mockInvoice });

      const result = await transactionsService.parseInvoice(imageBase64);

      expect(apiFetch).toHaveBeenCalledWith(
        '/transactions/parse-invoice',
        {
          method: 'POST',
          body: JSON.stringify({ imageBase64 }),
        },
        true
      );
      expect(result).toEqual(mockInvoice);
    });

    it('should return null on error', async () => {
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      vi.mocked(apiFetch).mockRejectedValueOnce(new Error('Parse failed'));

      const result = await transactionsService.parseInvoice('invalid-base64');

      expect(result).toBeNull();
      expect(consoleErrorSpy).toHaveBeenCalled();
      consoleErrorSpy.mockRestore();
    });
  });

  describe('bulkImportTransactions', () => {
    it('should import multiple transactions successfully', async () => {
      const transactions: AddTransactionInput[] = [
        {
          amountCents: 5000,
          note: 'Coffee',
          occurredAt: new Date('2025-11-01T10:00:00Z'),
        },
        {
          amountCents: 7500,
          note: 'Lunch',
          occurredAt: new Date('2025-11-02T12:00:00Z'),
        },
      ];

      const mockResponse = {
        imported: 2,
        failed: 0,
        total: 2,
        success: [
          {
            id: 't1',
            userId: 'u1',
            amountCents: 5000,
            note: 'Coffee',
            occurredAt: '2025-11-01T10:00:00.000Z',
            createdAt: '2025-11-01T10:00:00.000Z',
            updatedAt: '2025-11-01T10:00:00.000Z',
          },
          {
            id: 't2',
            userId: 'u1',
            amountCents: 7500,
            note: 'Lunch',
            occurredAt: '2025-11-02T12:00:00.000Z',
            createdAt: '2025-11-02T12:00:00.000Z',
            updatedAt: '2025-11-02T12:00:00.000Z',
          },
        ] as TransactionDTO[],
        errors: [],
      };

      vi.mocked(apiFetch).mockResolvedValueOnce(mockResponse);

      const result = await transactionsService.bulkImportTransactions(transactions);

      expect(apiFetch).toHaveBeenCalledWith(
        '/transactions/bulk-import',
        {
          method: 'POST',
          body: JSON.stringify({ transactions }),
        },
        true
      );
      expect(result.imported).toBe(2);
      expect(result.failed).toBe(0);
      expect(result.success).toHaveLength(2);
      expect(result.errors).toHaveLength(0);
    });

    it('should handle partial import with some failures', async () => {
      const transactions: AddTransactionInput[] = [
        {
          amountCents: 5000,
          note: 'Coffee',
          occurredAt: new Date('2025-11-01T10:00:00Z'),
        },
        {
          amountCents: -1, // Invalid amount
          note: 'Bad Transaction',
          occurredAt: new Date('2025-11-02T12:00:00Z'),
        },
      ];

      const mockResponse = {
        imported: 1,
        failed: 1,
        total: 2,
        success: [
          {
            id: 't1',
            userId: 'u1',
            amountCents: 5000,
            note: 'Coffee',
            occurredAt: '2025-11-01T10:00:00.000Z',
            createdAt: '2025-11-01T10:00:00.000Z',
            updatedAt: '2025-11-01T10:00:00.000Z',
          },
        ] as TransactionDTO[],
        errors: [
          {
            index: 1,
            error: 'Invalid amount',
            data: transactions[1],
          },
        ],
      };

      vi.mocked(apiFetch).mockResolvedValueOnce(mockResponse);

      const result = await transactionsService.bulkImportTransactions(transactions);

      expect(result.imported).toBe(1);
      expect(result.failed).toBe(1);
      expect(result.success).toHaveLength(1);
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0].error).toBe('Invalid amount');
    });

    it('should handle empty transaction array', async () => {
      const mockResponse = {
        imported: 0,
        failed: 0,
        total: 0,
        success: [],
        errors: [],
      };

      vi.mocked(apiFetch).mockResolvedValueOnce(mockResponse);

      const result = await transactionsService.bulkImportTransactions([]);

      expect(result.total).toBe(0);
      expect(result.success).toHaveLength(0);
    });
  });
});
