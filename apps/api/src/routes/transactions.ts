import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";
import type { TransactionDeps } from "../types";

// Accept a minimal client payload; userId/id/timestamps are server-derived.
const CreateTransactionInput = z.object({
  budgetId: z.string().optional(),
  categoryId: z.string().optional(),
  amountCents: z.number().int(),
  note: z.string().max(280).optional(),
  occurredAt: z.coerce.date(),
});

const UpdateTransactionInput = z
  .object({
    budgetId: z.string().optional(),
    categoryId: z.string().optional(),
    amountCents: z.number().int().optional(),
    note: z.string().max(280).optional(),
    occurredAt: z.coerce.date().optional(),
  })
  .refine(
    (value) =>
      value.budgetId !== undefined ||
      value.categoryId !== undefined ||
      value.amountCents !== undefined ||
      value.note !== undefined ||
      value.occurredAt !== undefined,
    {
      message: "At least one field must be provided",
      path: [],
    }
  );

const BulkImportInput = z.object({
  transactions: z.array(CreateTransactionInput),
});

/**
 * Creates transaction routes with explicit dependencies.
 * Routes only know about the specific functions they need, not the entire container.
 * Usecases return DTOs directly, so routes just pass them through.
 * 
 * Note: Auth middleware is applied in app.ts (composition root), not here.
 */
export function createTransactionRoutes(deps: TransactionDeps) {
  const router = new Hono<{ Variables: { userId: string } }>();

  // POST /transactions
  router.post(
    "/transactions",
    zValidator("json", CreateTransactionInput, (result, c) => {
      if (!result.success) {
        console.error('[CreateTransaction] Validation failed:', JSON.stringify(result.error.issues, null, 2));
        return c.json({
          error: "Validation failed",
          details: result.error.issues
        }, 400);
      }
    }),
    async (c) => {
      const input = c.req.valid("json");
      const userId = c.get("userId");

      console.log('[CreateTransaction] Creating transaction with input:', JSON.stringify(input, null, 2));

      const transaction = await deps.addTransaction({
        userId,
        budgetId: input.budgetId,
        categoryId: input.categoryId,
        amountCents: input.amountCents,
        note: input.note,
        occurredAt: input.occurredAt,
      });

      return c.json({ transaction }, 201);
    }
  );

  // PATCH /transactions/:id
  router.patch(
    "/transactions/:id",
    zValidator("json", UpdateTransactionInput),
    async (c) => {
      const transactionId = c.req.param("id");
      const userId = c.get("userId");
      const input = c.req.valid("json");

      const transaction = await deps.updateTransaction({
        transactionId,
        userId,
        budgetId: input.budgetId,
        categoryId: input.categoryId,
        amountCents: input.amountCents,
        note: input.note,
        occurredAt: input.occurredAt,
      });

      if (!transaction) {
        return c.json({ error: "Transaction not found" }, 404);
      }

      return c.json({ transaction }, 200);
    }
  );

  // DELETE /transactions/:id
  router.delete("/transactions/:id", async (c) => {
    const transactionId = c.req.param("id");
    const userId = c.get("userId");

    const deleted = await deps.deleteTransaction({
      transactionId,
      userId,
    });

    if (!deleted) {
      return c.json({ error: "Transaction not found" }, 404);
    }

    return c.body(null, 204);
  });

  // POST /transactions/:id/categorize - Auto-categorize an uncategorized transaction
  router.post("/transactions/:id/categorize", async (c) => {
    const userId = c.get("userId");
    const transactionId = c.req.param("id");

    console.log('Categorization request for transaction:', transactionId);

    if (!deps.categorizeTransaction) {
      console.log('Categorization service not available');
      return c.json({ error: "Auto-categorization not available" }, 503);
    }

    console.log('Categorization service available, calling use case...');

    try {
      const result = await deps.categorizeTransaction({
        transactionId,
        userId,
      });

      console.log('Categorization result:', result);

      if (!result) {
        console.log('Categorization returned null - no category suggested');
        return c.json({ message: "Could not categorize transaction" }, 200);
      }

      return c.json({
        categoryId: result.categoryId,
        reasoning: result.reasoning,
      }, 200);
    } catch (error) {
      console.error("Categorization error:", error);
      return c.json({ error: (error as Error).message }, 400);
    }
  });

  // POST /transactions/parse-invoice - Parse an invoice image
  router.post("/transactions/parse-invoice", async (c) => {
    const userId = c.get("userId");

    console.log('Invoice parsing request from user:', userId);

    if (!deps.parseInvoice) {
      console.log('Invoice parser not available');
      return c.json({ error: "Invoice parsing not available" }, 503);
    }

    try {
      const body = await c.req.json<{ imageBase64: string }>();

      if (!body.imageBase64) {
        return c.json({ error: "Missing image data" }, 400);
      }

      console.log('Parsing invoice image...');

      const result = await deps.parseInvoice({
        userId,
        imageBase64: body.imageBase64,
      });

      if (!result) {
        console.log('Invoice parsing returned null');
        return c.json({ error: "Could not parse invoice" }, 400);
      }

      console.log('Invoice parsed successfully:', {
        merchant: result.merchant,
        total: result.total,
        confidence: result.confidence
      });

      return c.json({ invoice: result }, 200);
    } catch (error) {
      console.error("Invoice parsing error:", error);
      return c.json({ error: (error as Error).message }, 500);
    }
  });

  // POST /transactions/bulk-import - Import multiple transactions at once
  router.post(
    "/transactions/bulk-import",
    zValidator("json", BulkImportInput),
    async (c) => {
      const input = c.req.valid("json");
      const userId = c.get("userId");

      // Pass categorization function if available
      const autoCategorize = deps.categorizeTransaction
        ? async (transactionId: string, uid: string) => {
            const result = await deps.categorizeTransaction!({ transactionId, userId: uid });
            return result ? { categoryId: result.categoryId } : null;
          }
        : undefined;

      const result = await deps.bulkImportTransactions({
        userId,
        transactions: input.transactions,
        autoCategorize,
      });

      return c.json(result, result.failed === 0 ? 201 : 207);
    }
  );

  // GET /transactions - list recent transactions for the authenticated user
  router.get("/transactions", async (c) => {
    const userId = c.get("userId");

    // Parse optional query params - usecase handles defaults
    const daysQ = c.req.query("days");
    const limitQ = c.req.query("limit");
    const startQ = c.req.query("start");
    const endQ = c.req.query("end");

    const transactions = await deps.listTransactions({
      userId,
      startDate: startQ ? new Date(startQ) : undefined,
      endDate: endQ ? new Date(endQ) : undefined,
      days: daysQ ? Number(daysQ) : undefined,
      limit: limitQ ? Number(limitQ) : undefined,
    });

    return c.json({ transactions }, 200);
  });

  return router;
}