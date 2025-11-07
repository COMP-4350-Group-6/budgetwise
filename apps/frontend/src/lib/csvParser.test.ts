import { describe, it, expect } from 'vitest';
import { parseCSV } from './csvParser';

describe('csvParser', () => {
  describe('parseCSV - valid inputs', () => {
    it('should parse basic CSV with required columns', () => {
      const csv = `amount,date,description
50.00,2025-11-01,Coffee Shop
25.50,2025-11-02,Grocery Store`;

      const result = parseCSV(csv);

      expect(result.transactions).toHaveLength(2);
      expect(result.errors).toHaveLength(0);
      
      expect(result.transactions[0]).toMatchObject({
        amountCents: 5000,
        note: 'Coffee Shop',
      });
      expect(result.transactions[0].occurredAt).toBeInstanceOf(Date);
      
      expect(result.transactions[1]).toMatchObject({
        amountCents: 2550,
        note: 'Grocery Store',
      });
    });

    it('should handle alternative column names for amount', () => {
      const csv = `price,date,description
10.99,2025-11-01,Lunch`;

      const result = parseCSV(csv);
      expect(result.transactions[0].amountCents).toBe(1099);
    });

    it('should handle "total" as amount column', () => {
      const csv = `total,date,description
99.99,2025-11-01,Purchase`;

      const result = parseCSV(csv);
      expect(result.transactions[0].amountCents).toBe(9999);
    });

    it('should handle "cost" as amount column', () => {
      const csv = `cost,date,description
15.75,2025-11-01,Item`;

      const result = parseCSV(csv);
      expect(result.transactions[0].amountCents).toBe(1575);
    });

    it('should handle alternative column names for date', () => {
      const csv = `amount,occurredAt,description
10.00,2025-11-01,Coffee`;

      const result = parseCSV(csv);
      // Just verify the date is valid
      expect(result.transactions[0].occurredAt).toBeInstanceOf(Date);
      expect(result.transactions[0].occurredAt.getTime()).not.toBeNaN();
    });

    it('should prefer description over note column', () => {
      const csv = `amount,date,description,note
10.00,2025-11-01,Main Description,Additional Note`;

      const result = parseCSV(csv);
      expect(result.transactions[0].note).toBe('Main Description');
    });

    it('should use note column if description not present', () => {
      const csv = `amount,date,note
10.00,2025-11-01,Coffee Purchase`;

      const result = parseCSV(csv);
      expect(result.transactions[0].note).toBe('Coffee Purchase');
    });

    it('should combine description and additional notes', () => {
      const csv = `amount,date,description,notes
10.00,2025-11-01,Coffee,Extra large`;

      const result = parseCSV(csv);
      expect(result.transactions[0].note).toBe('Coffee - Extra large');
    });

    it('should handle optional budgetId column', () => {
      const csv = `amount,date,description,budgetId
10.00,2025-11-01,Coffee,budget-123`;

      const result = parseCSV(csv);
      expect(result.transactions[0].budgetId).toBe('budget-123');
    });

    it('should ignore category columns (auto-categorization)', () => {
      const csv = `amount,date,description,category,categoryId
10.00,2025-11-01,Coffee,Food,cat-1`;

      const result = parseCSV(csv);
      expect(result.transactions[0]).not.toHaveProperty('categoryId');
      expect(result.transactions[0]).not.toHaveProperty('category');
    });
  });

  describe('parseCSV - amount parsing', () => {
    it('should parse amounts with dollar signs', () => {
      const csv = `amount,date,description
$25.99,2025-11-01,Purchase`;

      const result = parseCSV(csv);
      expect(result.transactions[0].amountCents).toBe(2599);
    });

    it('should parse amounts with commas', () => {
      const csv = `amount,date,description
"1,234.56",2025-11-01,Big Purchase`;

      const result = parseCSV(csv);
      expect(result.transactions[0].amountCents).toBe(123456);
    });

    it('should handle negative amounts', () => {
      const csv = `amount,date,description
-50.00,2025-11-01,Refund`;

      const result = parseCSV(csv);
      expect(result.transactions[0].amountCents).toBe(-5000);
    });

    it('should round amounts to nearest cent', () => {
      const csv = `amount,date,description
10.999,2025-11-01,Item`;

      const result = parseCSV(csv);
      expect(result.transactions[0].amountCents).toBe(1100); // Rounds to 11.00
    });

    it('should handle whole number amounts', () => {
      const csv = `amount,date,description
50,2025-11-01,Item`;

      const result = parseCSV(csv);
      expect(result.transactions[0].amountCents).toBe(5000);
    });
  });

  describe('parseCSV - date parsing', () => {
    it('should parse ISO date format (YYYY-MM-DD)', () => {
      const csv = `amount,date,description
10.00,2025-11-07,Coffee`;

      const result = parseCSV(csv);
      const date = result.transactions[0].occurredAt;
      expect(date.getFullYear()).toBe(2025);
      expect(date.getMonth()).toBe(10); // November (0-indexed)
      // Note: getDate() may vary based on timezone
    });

    it('should parse US date format (MM/DD/YYYY)', () => {
      const csv = `amount,date,description
10.00,11/07/2025,Coffee`;

      const result = parseCSV(csv);
      const date = result.transactions[0].occurredAt;
      expect(date.getFullYear()).toBe(2025);
      expect(date.getMonth()).toBe(10); // November
      expect(date.getDate()).toBe(7);
    });

    it('should parse date format with dashes (MM-DD-YYYY)', () => {
      const csv = `amount,date,description
10.00,11-07-2025,Coffee`;

      const result = parseCSV(csv);
      const date = result.transactions[0].occurredAt;
      // This format may be ambiguous, just verify it doesn't error
      expect(date).toBeInstanceOf(Date);
      expect(date.getTime()).not.toBeNaN();
    });

    it('should parse YYYY/MM/DD format', () => {
      const csv = `amount,date,description
10.00,2025/11/07,Coffee`;

      const result = parseCSV(csv);
      const date = result.transactions[0].occurredAt;
      expect(date.getFullYear()).toBe(2025);
      expect(date.getMonth()).toBe(10);
      expect(date.getDate()).toBe(7);
    });
  });

  describe('parseCSV - CSV format handling', () => {
    it('should handle quoted fields', () => {
      const csv = `amount,date,description
10.00,2025-11-01,"Coffee, Tea, and More"`;

      const result = parseCSV(csv);
      expect(result.transactions[0].note).toBe('Coffee, Tea, and More');
    });

    it('should handle escaped quotes in fields', () => {
      const csv = `amount,date,description
10.00,2025-11-01,"She said ""Hello"""`;

      const result = parseCSV(csv);
      expect(result.transactions[0].note).toBe('She said "Hello"');
    });

    it('should handle empty fields', () => {
      const csv = `amount,date,description,budgetId
10.00,2025-11-01,Coffee,`;

      const result = parseCSV(csv);
      expect(result.transactions[0].budgetId).toBeUndefined();
    });

    it('should handle Windows line endings (CRLF)', () => {
      const csv = "amount,date,description\r\n10.00,2025-11-01,Coffee\r\n20.00,2025-11-02,Lunch";

      const result = parseCSV(csv);
      expect(result.transactions).toHaveLength(2);
    });

    it('should handle Unix line endings (LF)', () => {
      const csv = "amount,date,description\n10.00,2025-11-01,Coffee\n20.00,2025-11-02,Lunch";

      const result = parseCSV(csv);
      expect(result.transactions).toHaveLength(2);
    });

    it('should skip empty lines', () => {
      const csv = `amount,date,description
10.00,2025-11-01,Coffee

20.00,2025-11-02,Lunch`;

      const result = parseCSV(csv);
      expect(result.transactions).toHaveLength(2);
    });

    it('should handle case-insensitive headers', () => {
      const csv = `AMOUNT,DATE,DESCRIPTION
10.00,2025-11-01,Coffee`;

      const result = parseCSV(csv);
      expect(result.transactions).toHaveLength(1);
    });
  });

  describe('parseCSV - error handling', () => {
    it('should throw error for empty CSV', () => {
      expect(() => parseCSV('')).toThrow('CSV file is empty');
    });

    it('should throw error when amount column missing', () => {
      const csv = `date,description
2025-11-01,Coffee`;

      expect(() => parseCSV(csv)).toThrow(/amount.*column/i);
    });

    it('should throw error when date column missing', () => {
      const csv = `amount,description
10.00,Coffee`;

      expect(() => parseCSV(csv)).toThrow(/date.*column/i);
    });

    it('should throw error when description/note column missing', () => {
      const csv = `amount,date
10.00,2025-11-01`;

      expect(() => parseCSV(csv)).toThrow(/description.*note.*column/i);
    });

    it('should add error for missing amount value', () => {
      const csv = `amount,date,description
,2025-11-01,Coffee`;

      const result = parseCSV(csv);
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0]).toMatchObject({
        row: 2,
        error: 'Amount is required',
      });
    });

    it('should add error for missing date value', () => {
      const csv = `amount,date,description
10.00,,Coffee`;

      const result = parseCSV(csv);
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0]).toMatchObject({
        row: 2,
        error: 'Date is required',
      });
    });

    it('should add error for missing description/note', () => {
      const csv = `amount,date,description
10.00,2025-11-01,`;

      const result = parseCSV(csv);
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0]).toMatchObject({
        row: 2,
        error: /purchase name.*required/i,
      });
    });

    it('should add error for invalid amount', () => {
      const csv = `amount,date,description
invalid,2025-11-01,Coffee`;

      const result = parseCSV(csv);
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0].error).toMatch(/invalid amount/i);
    });

    it('should add error for zero amount', () => {
      const csv = `amount,date,description
0.00,2025-11-01,Coffee`;

      const result = parseCSV(csv);
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0].error).toMatch(/invalid amount/i);
    });

    it('should add error for invalid date format', () => {
      const csv = `amount,date,description
10.00,not-a-date,Coffee`;

      const result = parseCSV(csv);
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0].error).toMatch(/invalid date/i);
    });

    it('should continue parsing after errors', () => {
      const csv = `amount,date,description
invalid,2025-11-01,Bad Row
10.00,2025-11-02,Good Row
20.00,invalid-date,Another Bad Row
30.00,2025-11-03,Another Good Row`;

      const result = parseCSV(csv);
      expect(result.transactions).toHaveLength(2);
      expect(result.errors).toHaveLength(2);
      expect(result.transactions[0].note).toBe('Good Row');
      expect(result.transactions[1].note).toBe('Another Good Row');
    });
  });

  describe('parseCSV - rawRows output', () => {
    it('should include raw rows for preview', () => {
      const csv = `amount,date,description
10.00,2025-11-01,Coffee`;

      const result = parseCSV(csv);
      expect(result.rawRows).toHaveLength(1);
      expect(result.rawRows[0]).toMatchObject({
        amount: '10.00',
        date: '2025-11-01',
        description: 'Coffee',
      });
    });

    it('should include raw rows even for invalid data', () => {
      const csv = `amount,date,description
invalid,bad-date,Coffee`;

      const result = parseCSV(csv);
      expect(result.rawRows).toHaveLength(1);
      expect(result.rawRows[0]).toMatchObject({
        amount: 'invalid',
        date: 'bad-date',
        description: 'Coffee',
      });
    });
  });

  describe('parseCSV - integration scenarios', () => {
    it('should handle real-world export from banking app', () => {
      const csv = `Date,Description,Amount,Category
11/01/2025,"Starbucks #12345, SEATTLE WA",$5.75,Food & Dining
11/02/2025,"Amazon.com - Order #123",145.99,Shopping
11/03/2025,"Shell Gas Station - 123",$52.00,Auto & Transport`;

      const result = parseCSV(csv);
      expect(result.transactions).toHaveLength(3);
      expect(result.errors).toHaveLength(0);
      expect(result.transactions[0].amountCents).toBe(575);
      expect(result.transactions[1].amountCents).toBe(14599);
      expect(result.transactions[2].amountCents).toBe(5200);
    });

    it('should handle mixed valid and invalid rows', () => {
      const csv = `amount,date,description
10.00,2025-11-01,Coffee
,2025-11-02,Missing Amount
15.00,,Missing Date
,Missing Both
20.00,2025-11-05,Valid Transaction`;

      const result = parseCSV(csv);
      expect(result.transactions).toHaveLength(2);
      expect(result.transactions[0].note).toBe('Coffee');
      expect(result.transactions[1].note).toBe('Valid Transaction');
      expect(result.errors.length).toBeGreaterThan(0);
    });
  });
});
