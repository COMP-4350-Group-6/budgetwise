import { apiFetch } from "../lib/apiClient";
import { authClient } from "../lib/authContainer";

export interface AddTransactionInput {
  budgetId?: string;
  categoryId?: string;
  amountCents: number;
  note?: string;
  occurredAt: Date;
}

export interface TransactionDTO {
  id: string;
  userId: string;
  budgetId?: string;
  amountCents: number;
  categoryId?: string;
  note?: string;
  occurredAt: string;
  createdAt: string;
  updatedAt: string;
}

export interface ParsedInvoiceData {
  merchant: string;
  date: string;
  total: number;
  tax?: number;
  subtotal?: number;
  invoiceNumber?: string;
  items?: Array<{
    description: string;
    quantity?: number;
    price?: number;
  }>;
  paymentMethod?: string;
  suggestedCategory?: string;
  confidence: number;
}

function ulid(): string {
  // Simple ULID-ish ID generator (not fully spec-compliant, but unique enough for client gen)
  // If you prefer, swap this to a proper ULID generator.
  return ("01" + Date.now().toString(36) + Math.random().toString(36).slice(2, 18)).slice(0, 26).toUpperCase();
}

export const transactionsService = {
  async addTransaction(input: AddTransactionInput): Promise<{ transaction: TransactionDTO }> {
    // Send only the fields that the API expects
    const payload = {
      budgetId: input.budgetId || undefined,
      categoryId: input.categoryId || undefined,
      amountCents: input.amountCents,
      note: input.note,
      occurredAt: input.occurredAt.toISOString(),
    };

    const response = await apiFetch<{ transaction: TransactionDTO }>(
      "/transactions",
      {
        method: "POST",
        body: JSON.stringify(payload),
      },
      true // send Authorization header
    );
    return response;
  },
  
  async categorizeTransaction(id: string): Promise<{ categoryId: string; reasoning: string } | null> {
    try {
      const response = await apiFetch<{ categoryId?: string; reasoning?: string; message?: string }>(
        `/transactions/${id}/categorize`,
        {
          method: "POST",
        },
        true
      );
      
      if (response.categoryId && response.reasoning) {
        return {
          categoryId: response.categoryId,
          reasoning: response.reasoning
        };
      }
      return null;
    } catch (error) {
      console.error("Categorization failed:", error);
      return null;
    }
  },
  
  async updateTransaction(id: string, updates: Partial<AddTransactionInput>): Promise<TransactionDTO> {
    const payload = {
      ...updates,
      occurredAt: updates.occurredAt ? updates.occurredAt.toISOString() : undefined,
    };
    const response = await apiFetch<{ transaction: TransactionDTO }>(
      `/transactions/${id}`,
      {
        method: "PATCH",
        body: JSON.stringify(payload),
      },
      true
    );
    return response.transaction;
  },

  async deleteTransaction(id: string): Promise<void> {
    await apiFetch<void>(
      `/transactions/${id}`,
      {
        method: "DELETE",
      },
      true
    );
  },

  async listTransactions(): Promise<TransactionDTO[]> {
    const response = await apiFetch<{ transactions: TransactionDTO[] }>(
      "/transactions",
      {},
      true // include auth
    );
    return response.transactions;
  },

  async parseInvoice(imageBase64: string): Promise<ParsedInvoiceData | null> {
    try {
      const response = await apiFetch<{ invoice: ParsedInvoiceData }>(
        "/transactions/parse-invoice",
        {
          method: "POST",
          body: JSON.stringify({ imageBase64 }),
        },
        true
      );
      
      return response.invoice;
    } catch (error) {
      console.error("Invoice parsing failed:", error);
      return null;
    }
  },
};