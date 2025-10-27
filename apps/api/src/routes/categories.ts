import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { CreateCategoryInputSchema, UpdateCategoryInputSchema } from "@budget/schemas";
import { container } from "../container";
import { authMiddleware } from "../middleware/auth";

type Variables = {
  userId: string;
};

export const categories = new Hono<{ Variables: Variables }>();

categories.use("*", authMiddleware);

// GET /categories
categories.get("/categories", async (c) => {
  const userId = c.get("userId") as string;
  const activeOnly = c.req.query("active") === "true";
  const { usecases } = container;
  
  const cats = await usecases.listCategories(userId, activeOnly);
  
  return c.json({
    categories: cats.map(cat => ({
      ...cat.props,
      createdAt: cat.props.createdAt.toISOString(),
      updatedAt: cat.props.updatedAt.toISOString(),
    }))
  });
});

// POST /categories/seed
categories.post("/categories/seed", async (c) => {
  const userId = c.get("userId") as string;
  const { usecases } = container;
  // Get existing categories first so we can return only newly created ones
  const before = await usecases.listCategories(userId, false);

  const seeded = await usecases.seedDefaultCategories(userId);

  // seeded may return existing categories when no new ones were added
  const newly = seeded.filter((s) => !before.find((b) => b.id === s.id));

  return c.json({
    categories: newly.map((cat) => ({
      ...cat.props,
      createdAt: cat.props.createdAt.toISOString(),
      updatedAt: cat.props.updatedAt.toISOString(),
    })),
    message: `Seeded ${newly.length} default categories`,
  }, 201);
});

// POST /categories
categories.post(
  "/categories",
  zValidator("json", CreateCategoryInputSchema),
  async (c) => {
    const userId = c.get("userId") as string;
    const input = c.req.valid("json");
    const { usecases } = container;
    
    try {
      const category = await usecases.createCategory({
        ...input,
        userId,
      });
      
      return c.json({
        category: {
          ...category.props,
          createdAt: category.props.createdAt.toISOString(),
          updatedAt: category.props.updatedAt.toISOString(),
        }
      }, 201);
    } catch (err) {
      return c.json({ error: (err as Error).message }, 400);
    }
  }
);

// PUT /categories/:id
categories.put(
  "/categories/:id",
  zValidator("json", UpdateCategoryInputSchema),
  async (c) => {
    const userId = c.get("userId") as string;
    const id = c.req.param("id");
    const updates = c.req.valid("json");
    const { usecases } = container;
    
    try {
      const category = await usecases.updateCategory(id, userId, updates);
      return c.json({
        category: {
          ...category.props,
          createdAt: category.props.createdAt.toISOString(),
          updatedAt: category.props.updatedAt.toISOString(),
        }
      });
    } catch (err) {
      return c.json({ error: (err as Error).message }, 404);
    }
  }
);

// DELETE /categories/:id
categories.delete("/categories/:id", async (c) => {
  const userId = c.get("userId") as string;
  const id = c.req.param("id");
  const { usecases } = container;
  
  try {
    await usecases.deleteCategory(id, userId);
    return c.json({ message: "Category deleted" });
  } catch (err) {
    return c.json({ error: (err as Error).message }, 400);
  }
});