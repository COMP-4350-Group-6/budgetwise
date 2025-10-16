import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { TransactionDTO } from "@budget/schemas";
import { container } from "../container";

export const transactions = new Hono();

transactions.post(
  "/transactions",
  zValidator("json", TransactionDTO),
  async (c) => {
    const input = c.req.valid("json"); // Type-safe!
    const { usecases } = container;
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
