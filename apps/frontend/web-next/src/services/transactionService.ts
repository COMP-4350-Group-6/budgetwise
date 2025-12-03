import type { ApiFetchFn } from "@/hooks/useApi";
import { withCache, invalidateCache } from "@/lib/cache";
import type {
  TransactionDTO,
  CreateTransactionInput,
  UpdateTransactionInput,
  BulkImportResult,
  CategorizationResult,
  ParsedInvoice,
} from "@budget/schemas";

// Cache keys
const CACHE_KEYS = {
  list: 'transaction:list',
} as const;

// ============================================================================
// Transaction Service Interface
// ============================================================================

export interface TransactionService {
  addTransaction(input: CreateTransactionInput): Promise<{ transaction: TransactionDTO }>;
  categorizeTransaction(id: string): Promise<CategorizationResult | null>;
  updateTransaction(id: string, updates: UpdateTransactionInput): Promise<TransactionDTO>;
  deleteTransaction(id: string): Promise<void>;
  listTransactions(options?: { days?: number; limit?: number }): Promise<TransactionDTO[]>;
  parseInvoice(imageBase64: string): Promise<ParsedInvoice | null>;
  bulkImportTransactions(transactions: CreateTransactionInput[]): Promise<BulkImportResult>;
}

// ============================================================================
// Transaction Service Factory
// ============================================================================

export function createTransactionService(apiFetch: ApiFetchFn): TransactionService {
  return {
    async addTransaction(input) {
      const payload = {
        budgetId: input.budgetId || undefined,
        categoryId: input.categoryId || undefined,
        amountCents: input.amountCents,
        note: input.note,
        occurredAt: input.occurredAt instanceof Date 
          ? input.occurredAt.toISOString() 
          : input.occurredAt,
      };

      const result = await apiFetch<{ transaction: TransactionDTO }>(
        "/transactions",
        { method: "POST", body: JSON.stringify(payload) },
        true
      );
      // Invalidate cache after mutation
      invalidateCache('transaction:');
      invalidateCache('budget:'); // Also invalidate budget dashboard
      return result;
    },

    async categorizeTransaction(id) {
      try {
        const response = await apiFetch<{ categoryId?: string; reasoning?: string }>(
          `/transactions/${id}/categorize`,
          { method: "POST" },
          true
        );
        
        if (response.categoryId && response.reasoning) {
          invalidateCache('transaction:');
          return { categoryId: response.categoryId, reasoning: response.reasoning };
        }
        return null;
      } catch (error) {
        console.error("Categorization failed:", error);
        return null;
      }
    },

    async updateTransaction(id, updates) {
      const payload = {
        ...updates,
        occurredAt: updates.occurredAt instanceof Date 
          ? updates.occurredAt.toISOString() 
          : updates.occurredAt,
      };
      const response = await apiFetch<{ transaction: TransactionDTO }>(
        `/transactions/${id}`,
        { method: "PATCH", body: JSON.stringify(payload) },
        true
      );
      // Invalidate cache after mutation
      invalidateCache('transaction:');
      invalidateCache('budget:');
      return response.transaction;
    },

    async deleteTransaction(id) {
      await apiFetch<void>(`/transactions/${id}`, { method: "DELETE" }, true);
      // Invalidate cache after mutation
      invalidateCache('transaction:');
      invalidateCache('budget:');
    },

    async listTransactions(options = {}) {
      const cacheKey = `${CACHE_KEYS.list}:${options.days || 'all'}:${options.limit || 'all'}`;
      
      return withCache(cacheKey, async () => {
        const params = new URLSearchParams();
        if (options.days) params.set('days', String(options.days));
        if (options.limit) params.set('limit', String(options.limit));
        const query = params.toString() ? `?${params.toString()}` : '';
        
        const response = await apiFetch<{ transactions: TransactionDTO[] }>(
          `/transactions${query}`,
          {},
          true
        );
        return response.transactions;
      });
    },

    async parseInvoice(imageBase64) {
      try {
        const response = await apiFetch<{ invoice: ParsedInvoice }>(
          "/transactions/parse-invoice",
          { method: "POST", body: JSON.stringify({ imageBase64 }) },
          true
        );
        return response.invoice;
      } catch (error) {
        console.error("Invoice parsing failed:", error);
        return null;
      }
    },

    async bulkImportTransactions(transactions) {
      const result = await apiFetch<BulkImportResult>(
        "/transactions/bulk-import",
        { method: "POST", body: JSON.stringify({ transactions }) },
        true
      );
      // Invalidate cache after bulk import
      invalidateCache('transaction:');
      invalidateCache('budget:');
      return result;
    },
  };
}

// Re-export types
export type {
  TransactionDTO,
  CreateTransactionInput,
  UpdateTransactionInput,
  BulkImportResult,
  CategorizationResult,
  ParsedInvoice,
} from "@budget/schemas";
