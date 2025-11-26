/**
 * dateHelpers.ts
 * ---------------------------------------------
 * Centralized date formatting and parsing helpers.
 * These utilities ensure consistent date handling
 * across dashboard, transactions, and reporting views.
 * ---------------------------------------------
 */

/**
 * Returns a short weekday name (e.g., "Mon").
 */
export const formatDayShort = (date: Date): string =>
  new Intl.DateTimeFormat("en-US", { weekday: "short" }).format(date);

/**
 * Returns the full month name (e.g., "November").
 */
export const formatMonthLong = (date: Date): string =>
  new Intl.DateTimeFormat("en-US", { month: "long" }).format(date);

/**
 * Returns a formatted week range string.
 * Example: "Nov 3 – Nov 9"
 */
export const getWeekRangeLabel = (startDate: Date, endDate: Date): string => {
  const opts: Intl.DateTimeFormatOptions = { month: "short", day: "numeric" };
  return `${startDate.toLocaleDateString("en-US", opts)} – ${endDate.toLocaleDateString("en-US", opts)}`;
};

/**
 * Formats a date as YYYY-MM-DD in the local timezone.
 * Used for grouping and comparisons.
 */
export const formatLocalYMD = (date: Date): string => {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
};

/**
 * Parses an ISO date string (e.g., "2025-01-15T00:00:00.000Z") into a local Date.
 * Extracts just the date portion and creates a local date at noon to avoid
 * timezone-related day shifts that occur when the time is midnight UTC.
 * 
 * This is essential for displaying transaction dates correctly in the user's
 * local timezone, preventing dates from appearing as the previous day.
 */
export const parseLocalDate = (isoString: string): Date => {
  // Extract just the date portion (YYYY-MM-DD) from the ISO string
  const datePart = isoString.split("T")[0];
  const [year, month, day] = datePart.split("-").map(Number);
  // Create a local date at noon to avoid any timezone edge cases
  const date = new Date(year, month - 1, day, 12, 0, 0, 0);
  return date;
};