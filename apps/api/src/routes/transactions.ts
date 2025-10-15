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
