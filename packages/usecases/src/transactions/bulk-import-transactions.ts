import type { TransactionsRepo } from "@budget/ports";
import type { ClockPort, IdPort } from "@budget/ports";
import type { TransactionDTO } from "@budget/schemas";
import { Transaction } from "@budget/domain";
import { toTransactionDTO } from "../presenters";

export interface BulkImportInput {
  userId: string;
  transactions: Array<{
    budgetId?: string;
    categoryId?: string;
    amountCents: number;
    note?: string;
    occurredAt: Date;
  }>;
  /** Optional: auto-categorize transactions without a category */
  autoCategorize?: (transactionId: string, userId: string) => Promise<{ categoryId: string } | null>;
}

export interface BulkImportResult {
  imported: number;
  failed: number;
  total: number;
  success: TransactionDTO[];
  errors: Array<{ index: number; error: string; data: unknown }>;
}

export function makeBulkImportTransactions(deps: {
  txRepo: TransactionsRepo;
  clock: ClockPort;
  id: IdPort;
}) {
  return async (input: BulkImportInput): Promise<BulkImportResult> => {
    const { userId, transactions, autoCategorize } = input;
    const now = deps.clock.now();

    const success: TransactionDTO[] = [];
    const errors: Array<{ index: number; error: string; data: unknown }> = [];

    for (let i = 0; i < transactions.length; i++) {
      const txInput = transactions[i];
      try {
        const tx = new Transaction({
          id: deps.id.ulid(),
          userId,
          budgetId: txInput.budgetId,
          categoryId: txInput.categoryId,
          amountCents: txInput.amountCents,
          note: txInput.note,
          occurredAt: txInput.occurredAt,
          createdAt: now,
          updatedAt: now,
        });

        await deps.txRepo.create(tx);
        let finalTx = tx;

        // Auto-categorize if no category and has note
        if (!tx.props.categoryId && tx.props.note && autoCategorize) {
          try {
            const result = await autoCategorize(tx.props.id, userId);
            if (result) {
              // Fetch updated transaction after categorization
              const updated = await deps.txRepo.getById(tx.props.id);
              if (updated) {
                finalTx = updated;
              }
            }
          } catch {
            // Categorization failure is non-fatal
          }
        }

        success.push(toTransactionDTO(finalTx));
      } catch (error) {
        errors.push({
          index: i,
          error: error instanceof Error ? error.message : "Unknown error",
          data: txInput,
        });
      }
    }

    return {
      imported: success.length,
      failed: errors.length,
      total: transactions.length,
      success,
      errors,
    };
  };
}
