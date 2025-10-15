import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";
import { container } from "../container";
import { authMiddleware } from "../middleware/auth";

export const transactions = new Hono<{ Variables: { userId: string } }>();

// Accept a minimal client payload; userId/id/timestamps are server-derived.
// budgetId is optional to allow unbudgeted transactions.
const CreateTransactionInput = z.object({
  budgetId: z.string().ulid().optional(),
  categoryId: z.string().ulid().optional(),
  amountCents: z.number().int(),
  note: z.string().max(280).optional(),
  occurredAt: z.coerce.date(),
});

transactions.use("*", authMiddleware);

transactions.post(
  "/transactions",
  zValidator("json", CreateTransactionInput),
  async (c) => {
    const input = c.req.valid("json");
    const userId = c.get("userId") as string;
    const { usecases } = container;

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