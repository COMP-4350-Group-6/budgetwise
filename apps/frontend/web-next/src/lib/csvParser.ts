import type { CreateTransactionInput } from "@budget/schemas";

export interface ParsedTransactionRow {
  amount?: string | number;
  date?: string;
  note?: string;
  category?: string;
  categoryId?: string;
  budgetId?: string;
  [key: string]: unknown;
}

export interface CSVParseResult {
  transactions: CreateTransactionInput[];
  errors: Array<{ row: number; error: string }>;
  rawRows: ParsedTransactionRow[];
}

/**
 * Parse CSV file and convert to transaction input format
 * Expected columns (case-insensitive):
 * - amount, price, total, cost (required)
 * - date, occurredAt, transactionDate (required)
 * - description, note (required - purchase name, prefer "description" to match manual form)
 * - notes (optional - additional notes, will be combined with description)
 * 
 * Note: Categories are automatically assigned by AI, so category columns are ignored.
 * Only description matters for categorization.
 */
export function parseCSV(csvText: string): CSVParseResult {
  const lines = csvText.split(/\r?\n/).filter(line => line.trim());
  if (lines.length === 0) {
    throw new Error("CSV file is empty");
  }

  // Parse header
  const headerLine = lines[0];
  const headers = parseCSVLine(headerLine).map(h => h.trim().toLowerCase());

  // Find column indices
  const amountIdx = headers.findIndex(h => 
    ['amount', 'price', 'total', 'cost', 'value'].includes(h)
  );
  const dateIdx = headers.findIndex(h => 
    ['date', 'occurredat', 'transactiondate', 'transaction_date'].includes(h)
  );
  // Look for description first (preferred), then note/memo/details
  const descriptionIdx = headers.findIndex(h => 
    ['description', 'desc', 'purchase', 'item'].includes(h)
  );
  const noteIdx = headers.findIndex(h => 
    descriptionIdx === -1 && ['note', 'memo', 'details', 'comment', 'notes'].includes(h)
  );
  const additionalNotesIdx = headers.findIndex(h => 
    ['notes', 'additionalnotes', 'extra'].includes(h)
  );
  // Optional columns - app will auto-categorize, so these aren't needed
  const categoryIdx = headers.findIndex(h => 
    ['category', 'categoryname', 'cat'].includes(h)
  );
  const categoryIdIdx = headers.findIndex(h => h === 'categoryid');
  const budgetIdIdx = headers.findIndex(h => h === 'budgetid');

  if (amountIdx === -1) {
    throw new Error("CSV must contain an 'amount', 'price', 'total', or 'cost' column");
  }
  if (dateIdx === -1) {
    throw new Error("CSV must contain a 'date' or 'occurredAt' column");
  }
  // Require either description or note column
  const purchaseNameIdx = descriptionIdx !== -1 ? descriptionIdx : noteIdx;
  if (purchaseNameIdx === -1) {
    throw new Error("CSV must contain a 'description' or 'note' column for the purchase name");
  }

  const transactions: CreateTransactionInput[] = [];
  const errors: Array<{ row: number; error: string }> = [];
  const rawRows: ParsedTransactionRow[] = [];

  // Parse data rows
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    try {
      const values = parseCSVLine(line);
      
      // Extract values
      const amountStr = values[amountIdx]?.trim();
      const dateStr = values[dateIdx]?.trim();
      const description = purchaseNameIdx >= 0 ? values[purchaseNameIdx]?.trim() : undefined;
      const additionalNotes = additionalNotesIdx >= 0 ? values[additionalNotesIdx]?.trim() : undefined;
      // Combine description and additional notes (like the manual form does)
      const note = additionalNotes 
        ? `${description || ''}${description && additionalNotes ? ' - ' : ''}${additionalNotes}`.trim()
        : description;
      // Don't extract category/categoryId - app will auto-categorize based on description
      const budgetId = budgetIdIdx >= 0 ? values[budgetIdIdx]?.trim() : undefined;

      // Store raw row for preview
      rawRows.push({
        amount: amountStr,
        date: dateStr,
        description,
        note: additionalNotes,
        budgetId,
      });

      // Validate required fields
      if (!amountStr) {
        errors.push({ row: i + 1, error: "Amount is required" });
        continue;
      }

      if (!dateStr) {
        errors.push({ row: i + 1, error: "Date is required" });
        continue;
      }

      if (!note) {
        errors.push({ row: i + 1, error: "Purchase name/description is required" });
        continue;
      }

      // Parse amount
      const amount = parseFloat(amountStr.replace(/[^0-9.-]/g, ''));
      if (isNaN(amount) || amount === 0) {
        errors.push({ row: i + 1, error: `Invalid amount: ${amountStr}` });
        continue;
      }
      const amountCents = Math.round(amount * 100);

      // Parse date
      let occurredAt: Date;
      try {
        occurredAt = parseDate(dateStr);
        if (isNaN(occurredAt.getTime())) {
          throw new Error("Invalid date");
        }
      } catch (e) {
        errors.push({ row: i + 1, error: `Invalid date format: ${dateStr}` });
        continue;
      }

      transactions.push({
        amountCents,
        occurredAt,
        note: note, // Required field - app will auto-categorize based on this
        // No categoryId - app will auto-categorize after import
        budgetId: budgetId || undefined,
      });

    } catch (error) {
      errors.push({ 
        row: i + 1, 
        error: error instanceof Error ? error.message : "Parse error" 
      });
    }
  }

  return { transactions, errors, rawRows };
}

/**
 * Parse a CSV line handling quoted fields
 */
function parseCSVLine(line: string): string[] {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    const nextChar = line[i + 1];

    if (char === '"') {
      if (inQuotes && nextChar === '"') {
        // Escaped quote
        current += '"';
        i++; // Skip next quote
      } else {
        // Toggle quote state
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      // Field separator
      result.push(current);
      current = '';
    } else {
      current += char;
    }
  }
  
  result.push(current); // Add last field
  return result;
}

/**
 * Parse various date formats
 */
function parseDate(dateStr: string): Date {
  // Try ISO format first
  if (dateStr.match(/^\d{4}-\d{2}-\d{2}/)) {
    return new Date(dateStr);
  }
  
  // Try common formats
  const formats = [
    /^(\d{1,2})\/(\d{1,2})\/(\d{4})/,  // MM/DD/YYYY or DD/MM/YYYY
    /^(\d{4})\/(\d{1,2})\/(\d{1,2})/,  // YYYY/MM/DD
    /^(\d{1,2})-(\d{1,2})-(\d{4})/,    // MM-DD-YYYY
  ];

  for (const format of formats) {
    const match = dateStr.match(format);
    if (match) {
      if (format === formats[0]) {
        // Assume MM/DD/YYYY for US format
        const [, month, day, year] = match;
        return new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
      } else {
        const [, year, month, day] = match;
        return new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
      }
    }
  }

  // Fallback to Date constructor
  const parsed = new Date(dateStr);
  return parsed;
}

