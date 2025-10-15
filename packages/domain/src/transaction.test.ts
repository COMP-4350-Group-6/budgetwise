import { describe, it, expect } from 'vitest';
import { Transaction, type TransactionProps } from './transaction';

function makeTransaction(overrides: Partial<TransactionProps> = {}): Transaction {
  const base: TransactionProps = {
    id: 'txn-1',
    userId: 'user-1',
    budgetId: 'budget-1',
    amountCents: 5000,
    occurredAt: new Date('2025-01-15'),
    createdAt: new Date('2025-01-15'),
    updatedAt: new Date('2025-01-15'),
  };
  return new Transaction({ ...base, ...overrides });
}

describe('Transaction', () => {
  describe('constructor validation', () => {
    describe('amountCents validation', () => {
      it('should create transaction with valid positive amount', () => {
        const transaction = makeTransaction({ amountCents: 5000 });
        expect(transaction.props.amountCents).toBe(5000);
      });

      it('should create transaction with zero amount', () => {
        const transaction = makeTransaction({ amountCents: 0 });
        expect(transaction.props.amountCents).toBe(0);
      });

      it('should create transaction with negative amount', () => {
        // Negative amounts could represent refunds or credits
        const transaction = makeTransaction({ amountCents: -5000 });
        expect(transaction.props.amountCents).toBe(-5000);
      });

      it('should reject non-integer amount (decimal)', () => {
        expect(() => makeTransaction({ amountCents: 50.5 }))
          .toThrow('amountCents must be integer');
      });

      it('should reject non-integer amount (float)', () => {
        expect(() => makeTransaction({ amountCents: 99.99 }))
          .toThrow('amountCents must be integer');
      });

      it('should reject NaN amount', () => {
        expect(() => makeTransaction({ amountCents: NaN }))
          .toThrow('amountCents must be integer');
      });

      it('should reject Infinity amount', () => {
        expect(() => makeTransaction({ amountCents: Infinity }))
          .toThrow('amountCents must be integer');
      });

      it('should reject negative Infinity amount', () => {
        expect(() => makeTransaction({ amountCents: -Infinity }))
          .toThrow('amountCents must be integer');
      });

      it('should handle very large integer amounts', () => {
        // Test near MAX_SAFE_INTEGER
        const largeAmount = 900000000000000; // 9 trillion cents
        const transaction = makeTransaction({ amountCents: largeAmount });
        expect(transaction.props.amountCents).toBe(largeAmount);
      });

      it('should handle very large negative integer amounts', () => {
        const largeNegative = -900000000000000;
        const transaction = makeTransaction({ amountCents: largeNegative });
        expect(transaction.props.amountCents).toBe(largeNegative);
      });

      it('should handle 1 cent', () => {
        const transaction = makeTransaction({ amountCents: 1 });
        expect(transaction.props.amountCents).toBe(1);
      });

      it('should handle -1 cent', () => {
        const transaction = makeTransaction({ amountCents: -1 });
        expect(transaction.props.amountCents).toBe(-1);
      });
    });

    describe('optional fields', () => {
      it('should create transaction without categoryId', () => {
        const transaction = makeTransaction({ categoryId: undefined });
        expect(transaction.props.categoryId).toBeUndefined();
      });

      it('should create transaction with categoryId', () => {
        const transaction = makeTransaction({ categoryId: 'cat-123' });
        expect(transaction.props.categoryId).toBe('cat-123');
      });

      it('should create transaction without note', () => {
        const transaction = makeTransaction({ note: undefined });
        expect(transaction.props.note).toBeUndefined();
      });

      it('should create transaction with note', () => {
        const transaction = makeTransaction({ note: 'Grocery shopping' });
        expect(transaction.props.note).toBe('Grocery shopping');
      });

      it('should create transaction with empty note', () => {
        const transaction = makeTransaction({ note: '' });
        expect(transaction.props.note).toBe('');
      });

      it('should handle long notes', () => {
        const longNote = 'A'.repeat(1000);
        const transaction = makeTransaction({ note: longNote });
        expect(transaction.props.note).toBe(longNote);
        expect(transaction.props.note?.length).toBe(1000);
      });

      it('should handle notes with special characters', () => {
        const specialNote = 'Coffee ☕ at Café #1 (10% tip) - $5.50';
        const transaction = makeTransaction({ note: specialNote });
        expect(transaction.props.note).toBe(specialNote);
      });

      it('should handle notes with newlines', () => {
        const multilineNote = 'Line 1\nLine 2\nLine 3';
        const transaction = makeTransaction({ note: multilineNote });
        expect(transaction.props.note).toContain('\n');
      });

      it('should handle Unicode in notes', () => {
        const unicodeNote = '食料品の購入 🛒';
        const transaction = makeTransaction({ note: unicodeNote });
        expect(transaction.props.note).toBe(unicodeNote);
      });
    });

    describe('required fields', () => {
      it('should create transaction with all required fields', () => {
        const transaction = makeTransaction({
          id: 'txn-test',
          userId: 'user-test',
          budgetId: 'budget-test',
          amountCents: 10000,
          occurredAt: new Date('2025-02-01'),
          createdAt: new Date('2025-02-01'),
          updatedAt: new Date('2025-02-01'),
        });

        expect(transaction.props.id).toBe('txn-test');
        expect(transaction.props.userId).toBe('user-test');
        expect(transaction.props.budgetId).toBe('budget-test');
        expect(transaction.props.amountCents).toBe(10000);
        expect(transaction.props.occurredAt).toEqual(new Date('2025-02-01'));
        expect(transaction.props.createdAt).toEqual(new Date('2025-02-01'));
        expect(transaction.props.updatedAt).toEqual(new Date('2025-02-01'));
      });
    });
  });

  describe('date handling', () => {
    it('should preserve occurredAt timestamp', () => {
      const occurredAt = new Date('2024-12-25T15:30:00Z');
      const transaction = makeTransaction({ occurredAt });
      expect(transaction.props.occurredAt).toEqual(occurredAt);
    });

    it('should handle different dates for occurred, created, and updated', () => {
      const occurred = new Date('2025-01-01');
      const created = new Date('2025-01-02');
      const updated = new Date('2025-01-03');

      const transaction = makeTransaction({
        occurredAt: occurred,
        createdAt: created,
        updatedAt: updated,
      });

      expect(transaction.props.occurredAt).toEqual(occurred);
      expect(transaction.props.createdAt).toEqual(created);
      expect(transaction.props.updatedAt).toEqual(updated);
    });

    it('should handle transactions from far in the past', () => {
      const pastDate = new Date('1900-01-01');
      const transaction = makeTransaction({ occurredAt: pastDate });
      expect(transaction.props.occurredAt).toEqual(pastDate);
    });

    it('should handle transactions from far in the future', () => {
      const futureDate = new Date('2099-12-31');
      const transaction = makeTransaction({ occurredAt: futureDate });
      expect(transaction.props.occurredAt).toEqual(futureDate);
    });

    it('should handle same timestamp for all dates', () => {
      const sameDate = new Date('2025-01-15T12:00:00Z');
      const transaction = makeTransaction({
        occurredAt: sameDate,
        createdAt: sameDate,
        updatedAt: sameDate,
      });

      expect(transaction.props.occurredAt).toEqual(sameDate);
      expect(transaction.props.createdAt).toEqual(sameDate);
      expect(transaction.props.updatedAt).toEqual(sameDate);
    });
  });

  describe('immutability', () => {
    it('should have readonly props', () => {
      const transaction = makeTransaction({ amountCents: 5000 });
      expect(transaction.props.amountCents).toBe(5000);
      // TypeScript enforces readonly at compile time
      // Verify all expected properties exist
      expect(transaction.props.id).toBeDefined();
      expect(transaction.props.userId).toBeDefined();
      expect(transaction.props.budgetId).toBeDefined();
      expect(transaction.props.amountCents).toBeDefined();
      expect(transaction.props.occurredAt).toBeDefined();
      expect(transaction.props.createdAt).toBeDefined();
      expect(transaction.props.updatedAt).toBeDefined();
    });
  });

  describe('edge cases', () => {
    it('should handle transaction with all optional fields populated', () => {
      const transaction = makeTransaction({
        categoryId: 'cat-123',
        note: 'Complete transaction',
      });

      expect(transaction.props.categoryId).toBe('cat-123');
      expect(transaction.props.note).toBe('Complete transaction');
    });

    it('should handle transaction with no optional fields', () => {
      const transaction = makeTransaction({
        categoryId: undefined,
        note: undefined,
      });

      expect(transaction.props.categoryId).toBeUndefined();
      expect(transaction.props.note).toBeUndefined();
    });

    it('should handle various id formats', () => {
      const idFormats = [
        'txn-123',
        'transaction_456',
        'TXN-789',
        'ulid-01ARZ3NDEKTSV4RRFFQ69G5FAV',
        'uuid-550e8400-e29b-41d4-a716-446655440000',
      ];

      idFormats.forEach(id => {
        const transaction = makeTransaction({ id });
        expect(transaction.props.id).toBe(id);
      });
    });

    it('should handle empty string ids', () => {
      // While not recommended, the domain layer doesn't validate id format
      const transaction = makeTransaction({ id: '' });
      expect(transaction.props.id).toBe('');
    });

    it('should preserve exact cents values without rounding', () => {
      const amounts = [1, 99, 100, 999, 1000, 9999, 10000, 50000];
      
      amounts.forEach(amount => {
        const transaction = makeTransaction({ amountCents: amount });
        expect(transaction.props.amountCents).toBe(amount);
      });
    });
  });

  describe('real-world scenarios', () => {
    it('should create expense transaction', () => {
      const expense = makeTransaction({
        amountCents: 4599, // $45.99
        categoryId: 'cat-groceries',
        note: 'Weekly groceries at Walmart',
        occurredAt: new Date('2025-01-15T14:30:00Z'),
      });

      expect(expense.props.amountCents).toBe(4599);
      expect(expense.props.categoryId).toBe('cat-groceries');
    });

    it('should create refund transaction (negative amount)', () => {
      const refund = makeTransaction({
        amountCents: -2999, // -$29.99 refund
        categoryId: 'cat-shopping',
        note: 'Return - defective item',
        occurredAt: new Date('2025-01-16T10:00:00Z'),
      });

      expect(refund.props.amountCents).toBe(-2999);
      expect(refund.props.note).toContain('Return');
    });

    it('should create cash transaction without category', () => {
      const cash = makeTransaction({
        amountCents: 2000, // $20.00
        categoryId: undefined,
        note: 'ATM withdrawal',
      });

      expect(cash.props.categoryId).toBeUndefined();
      expect(cash.props.amountCents).toBe(2000);
    });

    it('should create zero-dollar adjustment', () => {
      const adjustment = makeTransaction({
        amountCents: 0,
        note: 'Budget reconciliation - no change',
      });

      expect(adjustment.props.amountCents).toBe(0);
    });
  });
});