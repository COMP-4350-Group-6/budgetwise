import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";
import { makeContainer } from "@budget/composition-cloudflare-worker";

const addTransactionSchema = z.object({
  userId: z.string(),
  budgetId: z.string(),
  amountCents: z.number().int(),
  occurredAt: z.coerce.date(),
  note: z.string().max(280).optional(),
  categoryId: z.string().optional(),
});

export const transactions = new Hono();

transactions.post(
  "/transactions",
  zValidator("json", addTransactionSchema),
  async (c) => {
    const input = c.req.valid("json"); // Type-safe!
    const { usecases } = makeContainer();
    const tx = await usecases.addTransaction(input);

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
