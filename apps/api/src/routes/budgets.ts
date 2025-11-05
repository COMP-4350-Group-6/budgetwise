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
  
  // Serialize domain objects into plain JSON expected by clients/tests
  const serializable = {
    categories: dashboard.categories.map((cat) => ({
      categoryId: cat.categoryId,
      categoryName: cat.categoryName,
      categoryIcon: cat.categoryIcon,
      categoryColor: cat.categoryColor,
      budgets: cat.budgets.map((b) => ({
        budget: {
          id: b.budget.id,
          amountCents: b.budget.props.amountCents,
        },
        spentCents: b.spentCents,
      })),
      totalBudgetCents: cat.totalBudgetCents,
      totalSpentCents: cat.totalSpentCents,
      totalRemainingCents: cat.totalRemainingCents,
      overallPercentageUsed: cat.overallPercentageUsed,
      hasOverBudget: cat.hasOverBudget,
    })),
    totalBudgetCents: dashboard.totalBudgetCents,
    totalSpentCents: dashboard.totalSpentCents,
    overBudgetCount: dashboard.overBudgetCount,
    alertCount: dashboard.alertCount,
  };

  return c.json({ dashboard: serializable });
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
  
  // Serialize Budget object
  const serializedStatus = {
    ...status,
    budget: {
      ...status.budget.props,
      startDate: status.budget.props.startDate.toISOString(),
      endDate: status.budget.props.endDate?.toISOString(),
      createdAt: status.budget.props.createdAt.toISOString(),
      updatedAt: status.budget.props.updatedAt.toISOString(),
    }
  };
  
  return c.json({ status: serializedStatus });
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
    
    try {
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
    } catch (err) {
      console.error("Error creating budget:", err);
      return c.json({ 
        error: err instanceof Error ? err.message : "Failed to create budget" 
      }, 400);
    }
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
      const budget = await usecases.updateBudget(
        id,
        userId,
        {
          ...updates,
          endDate: updates.endDate ?? undefined,
          alertThreshold: updates.alertThreshold ?? undefined,
        }
      );
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