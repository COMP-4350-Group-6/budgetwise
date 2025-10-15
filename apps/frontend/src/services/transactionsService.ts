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

function ulid(): string {
  // Simple ULID-ish ID generator (not fully spec-compliant, but unique enough for client gen)
  // If you prefer, swap this to a proper ULID generator.
  return ("01" + Date.now().toString(36) + Math.random().toString(36).slice(2, 18)).slice(0, 26).toUpperCase();
}

export const transactionsService = {
  async addTransaction(input: AddTransactionInput): Promise<TransactionDTO> {
    // Use the same auth pattern as apiClient: get current user via auth client
    const me = await authClient.getMe();
    const userId = (me as { id?: string } | null)?.id;
    if (!userId) {
      throw new Error("Not authenticated");
    }

    const nowIso = new Date().toISOString();
    const dto = {
      id: ulid(),
      userId,
      budgetId: input.budgetId,
      amountCents: input.amountCents,
      categoryId: input.categoryId,
      note: input.note,
      occurredAt: input.occurredAt.toISOString(),
      createdAt: nowIso,
      updatedAt: nowIso,
    };

    const response = await apiFetch<{ transaction: TransactionDTO }>(
      "/transactions",
      {
        method: "POST",
        body: JSON.stringify(dto),
      },
      true // send Authorization header
    );
    return response.transaction;
  },
};