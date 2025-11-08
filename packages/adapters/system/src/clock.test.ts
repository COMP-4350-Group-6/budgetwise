import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { makeSystemClock } from './clock';

describe('makeSystemClock', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should return a clock that provides the current date', () => {
    const fixedDate = new Date('2025-01-15T10:30:00Z');
    vi.setSystemTime(fixedDate);

    const clock = makeSystemClock();
    const result = clock.now();

    expect(result).toBeInstanceOf(Date);
    expect(result.toISOString()).toBe(fixedDate.toISOString());
  });

  it('should return different dates when time advances', () => {
    const startDate = new Date('2025-01-15T10:00:00Z');
    vi.setSystemTime(startDate);

    const clock = makeSystemClock();
    const first = clock.now();

    // Advance time by 1 hour
    vi.setSystemTime(new Date('2025-01-15T11:00:00Z'));
    const second = clock.now();

    expect(first.getTime()).toBeLessThan(second.getTime());
    expect(second.getTime() - first.getTime()).toBe(3600000); // 1 hour in ms
  });

  it('should conform to ClockPort interface', () => {
    const clock = makeSystemClock();
    
    expect(clock).toHaveProperty('now');
    expect(typeof clock.now).toBe('function');
  });
});
