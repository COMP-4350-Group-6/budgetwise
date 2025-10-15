import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { CreateBudgetInputSchema, UpdateBudgetInputSchema } from "@budget/schemas";
import { container } from "../container";
import { authMiddleware } from "../middleware/auth";

type Variables = {
  userId: string;
};

export const budgets = new Hono<{ Variables: Variables }>();
budgets.use("*", authMiddleware);

// GET /budgets/dashboard
budgets.get("/budgets/dashboard", async (c) => {
  const userId = c.get("userId") as string;
  const { usecases } = container;
  
  const dashboard = await usecases.getBudgetDashboard(userId);
  
  return c.json({ dashboard });
});

// GET /budgets/:id/status
budgets.get("/budgets/:id/status", async (c) => {
  const userId = c.get("userId") as string;
  const id = c.req.param("id");
  const { usecases } = container;
  
  const status = await usecases.getBudgetStatus(id, userId);
  
  if (!status) {
    return c.json({ error: "Budget not found" }, 404);
  }
  
  return c.json({ status });
});

// GET /budgets
budgets.get("/budgets", async (c) => {
  const userId = c.get("userId") as string;
  const activeOnly = c.req.query("active") === "true";
  const { usecases } = container;
  
  const budgetList = await usecases.listBudgets(userId, activeOnly);
  
  return c.json({
    budgets: budgetList.map(b => ({
      ...b.props,
      startDate: b.props.startDate.toISOString(),
      endDate: b.props.endDate?.toISOString(),
      createdAt: b.props.createdAt.toISOString(),
      updatedAt: b.props.updatedAt.toISOString(),
    }))
  });
});

// POST /budgets
budgets.post(
  "/budgets",
  zValidator("json", CreateBudgetInputSchema),
  async (c) => {
    const userId = c.get("userId") as string;
    const input = c.req.valid("json");
    const { usecases, repos } = container;
    
    // Validate category
    const category = await repos.categoriesRepo.getById(input.categoryId);
    if (!category || category.props.userId !== userId) {
      return c.json({ error: "Invalid category" }, 400);
    }
    
    const budget = await usecases.createBudget({
      ...input,
      userId,
    });
    
    return c.json({
      budget: {
        ...budget.props,
        startDate: budget.props.startDate.toISOString(),
        endDate: budget.props.endDate?.toISOString(),
        createdAt: budget.props.createdAt.toISOString(),
        updatedAt: budget.props.updatedAt.toISOString(),
      }
    }, 201);
  }
);

// PUT /budgets/:id
budgets.put(
  "/budgets/:id",
  zValidator("json", UpdateBudgetInputSchema),
  async (c) => {
    const userId = c.get("userId") as string;
    const id = c.req.param("id");
    const updates = c.req.valid("json");
    const { usecases } = container;
    
    try {
      const budget = await usecases.updateBudget(id, userId, updates);
      return c.json({
        budget: {
          ...budget.props,
          startDate: budget.props.startDate.toISOString(),
          endDate: budget.props.endDate?.toISOString(),
          createdAt: budget.props.createdAt.toISOString(),
          updatedAt: budget.props.updatedAt.toISOString(),
        }
      });
    } catch (err) {
      return c.json({ error: (err as Error).message }, 404);
    }
  }
);

// DELETE /budgets/:id
budgets.delete("/budgets/:id", async (c) => {
  const userId = c.get("userId") as string;
  const id = c.req.param("id");
  const { usecases } = container;
  
  try {
    await usecases.deleteBudget(id, userId);
    return c.json({ message: "Budget deleted" });
  } catch (err) {
    return c.json({ error: (err as Error).message }, 404);
  }
});