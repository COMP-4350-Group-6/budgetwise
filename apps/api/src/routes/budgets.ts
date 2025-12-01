import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { CreateBudgetInputSchema, UpdateBudgetInputSchema } from "@budget/schemas";
import type { BudgetDeps } from "../types";

/**
 * Creates budget routes with explicit dependencies.
 * Routes only know about the specific functions they need, not the entire container.
 * Usecases return DTOs directly, so routes just pass them through.
 * 
 * Note: Auth middleware is applied in app.ts (composition root), not here.
 */
export function createBudgetRoutes(deps: BudgetDeps) {
  const router = new Hono<{ Variables: { userId: string } }>();

  // GET /budgets/dashboard
  router.get("/budgets/dashboard", async (c) => {
    const userId = c.get("userId");

    const dashboard = await deps.getBudgetDashboard(userId);

    return c.json({ dashboard });
  });

  // GET /budgets/:id/status
  router.get("/budgets/:id/status", async (c) => {
    const userId = c.get("userId");
    const id = c.req.param("id");

    const status = await deps.getBudgetStatus(id, userId);

    if (!status) {
      return c.json({ error: "Budget not found" }, 404);
    }

    return c.json({ status });
  });

  // GET /budgets
  router.get("/budgets", async (c) => {
    const userId = c.get("userId");
    const activeOnly = c.req.query("active") === "true";

    const budgets = await deps.listBudgets(userId, activeOnly);

    return c.json({ budgets });
  });

  // POST /budgets
  router.post(
    "/budgets",
    zValidator("json", CreateBudgetInputSchema),
    async (c) => {
      const userId = c.get("userId");
      const input = c.req.valid("json");

      try {
        // Validate category belongs to user
        const category = await deps.getCategory(input.categoryId);
        if (!category || category.userId !== userId) {
          return c.json({ error: "Invalid category" }, 400);
        }

        const budget = await deps.createBudget({
          ...input,
          userId,
        });

        return c.json({ budget }, 201);
      } catch (err) {
        return c.json({
          error: err instanceof Error ? err.message : "Failed to create budget"
        }, 400);
      }
    }
  );

  // PUT /budgets/:id
  router.put(
    "/budgets/:id",
    zValidator("json", UpdateBudgetInputSchema),
    async (c) => {
      const userId = c.get("userId");
      const id = c.req.param("id");
      const updates = c.req.valid("json");

      try {
        const budget = await deps.updateBudget(
          id,
          userId,
          {
            ...updates,
            endDate: updates.endDate ?? undefined,
            alertThreshold: updates.alertThreshold ?? undefined,
          }
        );
        return c.json({ budget });
      } catch (err) {
        return c.json({ error: (err as Error).message }, 404);
      }
    }
  );

  // DELETE /budgets/:id
  router.delete("/budgets/:id", async (c) => {
    const userId = c.get("userId");
    const id = c.req.param("id");

    try {
      await deps.deleteBudget(id, userId);
      return c.json({ message: "Budget deleted" });
    } catch (err) {
      return c.json({ error: (err as Error).message }, 404);
    }
  });

  return router;
}