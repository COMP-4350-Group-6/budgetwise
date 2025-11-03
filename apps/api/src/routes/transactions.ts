import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";
import { container } from "../container";
import { authMiddleware } from "../middleware/auth";

export const transactions = new Hono<{ Variables: { userId: string } }>();

// Accept a minimal client payload; userId/id/timestamps are server-derived.
// budgetId is optional to allow unbudgeted transactions.
const CreateTransactionInput = z.object({
  budgetId: z.string().uuid().optional(),
  categoryId: z.string().uuid().optional(),
  amountCents: z.number().int(),
  note: z.string().max(280).optional(),
  occurredAt: z.coerce.date(),
});

const UpdateTransactionInput = z
  .object({
    budgetId: z.string().uuid().optional(),
    categoryId: z.string().uuid().optional(),
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

transactions.use("*", authMiddleware);

transactions.post(
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
    const userId = c.get("userId") as string;
    const { usecases } = container;
    
    console.log('[CreateTransaction] Creating transaction with input:', JSON.stringify(input, null, 2));

    const tx = await usecases.addTransaction({
      userId,
      budgetId: input.budgetId,
      categoryId: input.categoryId,
      amountCents: input.amountCents,
      note: input.note,
      occurredAt: input.occurredAt,
    });

    return c.json(
      {
        transaction: {
          ...tx.props,
          occurredAt: tx.props.occurredAt.toISOString(),
          createdAt: tx.props.createdAt.toISOString(),
          updatedAt: tx.props.updatedAt.toISOString(),
        },
      },
      201
    );
  }
);

transactions.patch(
  "/transactions/:id",
  zValidator("json", UpdateTransactionInput),
  async (c) => {
    const transactionId = c.req.param("id");
    const userId = c.get("userId") as string;
    const input = c.req.valid("json");
    const { usecases } = container;

    const updated = await usecases.updateTransaction({
      transactionId,
      userId,
      budgetId: input.budgetId,
      categoryId: input.categoryId,
      amountCents: input.amountCents,
      note: input.note,
      occurredAt: input.occurredAt,
    });

    if (!updated) {
      return c.json({ error: "Transaction not found" }, 404);
    }

    return c.json(
      {
        transaction: {
          ...updated.props,
          occurredAt: updated.props.occurredAt.toISOString(),
          createdAt: updated.props.createdAt.toISOString(),
          updatedAt: updated.props.updatedAt.toISOString(),
        },
      },
      200
    );
  }
);

transactions.delete("/transactions/:id", async (c) => {
  const transactionId = c.req.param("id");
  const userId = c.get("userId") as string;
  const { usecases } = container;

  const deleted = await usecases.deleteTransaction({
    transactionId,
    userId,
  });

  if (!deleted) {
    return c.json({ error: "Transaction not found" }, 404);
  }

  return c.body(null, 204);
});

// POST /transactions/:id/categorize - Auto-categorize an uncategorized transaction
transactions.post("/transactions/:id/categorize", async (c) => {
  const userId = c.get("userId") as string;
  const transactionId = c.req.param("id");
  const { usecases } = container;

  console.log('Categorization request for transaction:', transactionId);

  // Check if categorization is available
  if (!usecases.categorizeTransaction) {
    console.log('Categorization service not available');
    return c.json({ error: "Auto-categorization not available" }, 503);
  }

  console.log('Categorization service available, calling use case...');

  try {
    const result = await usecases.categorizeTransaction({
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
transactions.post("/transactions/parse-invoice", async (c) => {
  const userId = c.get("userId") as string;
  const { usecases } = container;

  console.log('Invoice parsing request from user:', userId);

  // Check if invoice parser is available
  if (!usecases.parseInvoice) {
    console.log('Invoice parser not available');
    return c.json({ error: "Invoice parsing not available" }, 503);
  }

  try {
    const body = await c.req.json<{ imageBase64: string }>();
    
    if (!body.imageBase64) {
      return c.json({ error: "Missing image data" }, 400);
    }

    console.log('Parsing invoice image...');

    const result = await usecases.parseInvoice({
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
const BulkImportInput = z.object({
  transactions: z.array(CreateTransactionInput),
});

transactions.post(
  "/transactions/bulk-import",
  zValidator("json", BulkImportInput),
  async (c) => {
    const input = c.req.valid("json");
    const userId = c.get("userId") as string;
    const { usecases } = container;

    const results = {
      success: [] as any[],
      errors: [] as Array<{ index: number; error: string; data: any }>,
    };

    for (let i = 0; i < input.transactions.length; i++) {
      const txInput = input.transactions[i];
      try {
        const tx = await usecases.addTransaction({
          userId,
          budgetId: txInput.budgetId,
          categoryId: txInput.categoryId,
          amountCents: txInput.amountCents,
          note: txInput.note,
          occurredAt: txInput.occurredAt,
        });

        // Auto-categorize if no category was provided and categorization service is available
        let finalTx = tx;
        if (!tx.props.categoryId && tx.props.note && usecases.categorizeTransaction) {
          try {
            const categorizationResult = await usecases.categorizeTransaction({
              transactionId: tx.props.id,
              userId,
            });
            
            // If categorization succeeded, fetch the updated transaction from the repo
            if (categorizationResult) {
              const updatedTx = await container.repos.txRepo.getById(tx.props.id);
              if (updatedTx) {
                finalTx = updatedTx;
                console.log(`[BulkImport] Transaction ${tx.props.id} categorized with categoryId: ${updatedTx.props.categoryId}`);
              } else {
                console.warn(`[BulkImport] Could not fetch updated transaction ${tx.props.id} after categorization`);
              }
            }
          } catch (catError) {
            // Log but don't fail the import if categorization fails
            console.error(`Failed to categorize transaction ${tx.props.id}:`, catError);
          }
        }

        const txResponse = {
          ...finalTx.props,
          occurredAt: finalTx.props.occurredAt.toISOString(),
          createdAt: finalTx.props.createdAt.toISOString(),
          updatedAt: finalTx.props.updatedAt.toISOString(),
        };
        
        console.log(`[BulkImport] Returning transaction ${txResponse.id} with categoryId: ${txResponse.categoryId || 'null'}`);
        
        results.success.push(txResponse);
      } catch (error) {
        results.errors.push({
          index: i,
          error: error instanceof Error ? error.message : "Unknown error",
          data: txInput,
        });
      }
    }

    return c.json(
      {
        imported: results.success.length,
        failed: results.errors.length,
        total: input.transactions.length,
        success: results.success,
        errors: results.errors,
      },
      results.errors.length === 0 ? 201 : 207 // 207 Multi-Status if some failed
    );
  }
);

// GET /transactions - list recent transactions for the authenticated user
// Query params:
//   - days?: number (default 30) - time window ending now
//   - start?: ISO date, end?: ISO date (overrides days if both present)
//   - limit?: number (default 50)
transactions.get("/transactions", async (c) => {
  const userId = c.get("userId") as string;

  const daysQ = c.req.query("days");
  const limitQ = c.req.query("limit");
  const startQ = c.req.query("start");
  const endQ = c.req.query("end");

  const now = new Date();
  let startDate: Date;
  let endDate: Date;

  if (startQ && endQ) {
    startDate = new Date(startQ);
    endDate = new Date(endQ);
  } else {
    const days = daysQ ? Number(daysQ) : 30;
    endDate = now;
    startDate = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);
  }

  const limit = limitQ ? Number(limitQ) : 50;

  // Fetch transactions in the window and order by occurredAt desc
  const txs = await container.repos.txRepo.listByUserInPeriod(userId, startDate, endDate);
  txs.sort((a, b) => b.props.occurredAt.getTime() - a.props.occurredAt.getTime());

  const items = txs.slice(0, limit).map((tx) => ({
    ...tx.props,
    occurredAt: tx.props.occurredAt.toISOString(),
    createdAt: tx.props.createdAt.toISOString(),
    updatedAt: tx.props.updatedAt.toISOString(),
  }));

  return c.json({ transactions: items }, 200);
});