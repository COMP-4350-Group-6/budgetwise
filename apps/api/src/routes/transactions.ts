import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { AddTransactionInput } from "@budget/schemas";
import { makeContainer } from "@budget/composition-cloudflare-worker";

export const transactions = new Hono();

transactions.post(
  "/transactions",
  zValidator("json", AddTransactionInput),
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
