import { describe, it, expect } from 'vitest';
import {
  formatDayShort,
  formatMonthLong,
  getWeekRangeLabel,
  formatLocalYMD,
} from './dateHelpers';

describe('dateHelpers', () => {
  describe('formatDayShort', () => {
    it('should format day as short weekday name', () => {
      const monday = new Date('2025-11-03T12:00:00Z'); // Monday
      const friday = new Date('2025-11-07T12:00:00Z'); // Friday
      
      expect(formatDayShort(monday)).toBe('Mon');
      expect(formatDayShort(friday)).toBe('Fri');
    });

    it('should handle different locales consistently', () => {
      const date = new Date('2025-11-05T12:00:00Z'); // Wednesday
      expect(formatDayShort(date)).toBe('Wed');
    });
  });

  describe('formatMonthLong', () => {
    it('should format month as full month name', () => {
      const january = new Date('2025-01-15T12:00:00Z');
      const december = new Date('2025-12-15T12:00:00Z');
      const november = new Date('2025-11-15T12:00:00Z');
      
      expect(formatMonthLong(january)).toBe('January');
      expect(formatMonthLong(december)).toBe('December');
      expect(formatMonthLong(november)).toBe('November');
    });
  });

  describe('getWeekRangeLabel', () => {
    it('should format week range in same month', () => {
      const start = new Date('2025-11-03T00:00:00');
      const end = new Date('2025-11-09T00:00:00');
      
      const result = getWeekRangeLabel(start, end);
      expect(result).toBe('Nov 3 – Nov 9');
    });

    it('should format week range across different months', () => {
      const start = new Date('2025-10-28T00:00:00');
      const end = new Date('2025-11-03T00:00:00');
      
      const result = getWeekRangeLabel(start, end);
      expect(result).toBe('Oct 28 – Nov 3');
    });

    it('should format week range across different years', () => {
      const start = new Date('2024-12-30T00:00:00');
      const end = new Date('2025-01-05T00:00:00');
      
      const result = getWeekRangeLabel(start, end);
      expect(result).toBe('Dec 30 – Jan 5');
    });

    it('should handle single-day range', () => {
      const date = new Date('2025-11-07T00:00:00');
      
      const result = getWeekRangeLabel(date, date);
      expect(result).toBe('Nov 7 – Nov 7');
    });
  });

  describe('formatLocalYMD', () => {
    it('should format date as YYYY-MM-DD', () => {
      const date = new Date('2025-11-07T15:30:00');
      const result = formatLocalYMD(date);
      
      // Should match YYYY-MM-DD format
      expect(result).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      expect(result.split('-')[0]).toBe('2025'); // Year
    });

    it('should pad single-digit months and days with zeros', () => {
      const date = new Date('2025-01-05T12:00:00');
      const result = formatLocalYMD(date);
      
      const [year, month, day] = result.split('-');
      expect(year).toBe('2025');
      expect(month).toBe('01');
      expect(day).toBe('05');
    });

    it('should handle end of year dates', () => {
      const date = new Date('2025-12-31T23:59:59');
      const result = formatLocalYMD(date);
      
      expect(result.split('-')[0]).toBe('2025');
      expect(result.split('-')[1]).toBe('12');
      expect(result.split('-')[2]).toBe('31');
    });

    it('should handle start of year dates', () => {
      const date = new Date('2025-01-01T00:00:00');
      const result = formatLocalYMD(date);
      
      expect(result.split('-')[0]).toBe('2025');
      expect(result.split('-')[1]).toBe('01');
      expect(result.split('-')[2]).toBe('01');
    });

    it('should produce consistent output for same date at different times', () => {
      const morning = new Date('2025-11-07T08:00:00');
      const evening = new Date('2025-11-07T20:00:00');
      
      expect(formatLocalYMD(morning)).toBe(formatLocalYMD(evening));
    });
  });
});
