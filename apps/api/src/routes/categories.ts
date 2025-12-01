import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { CreateCategoryInputSchema, UpdateCategoryInputSchema } from "@budget/schemas";
import type { CategoryDeps } from "../types";

/**
 * Creates category routes with explicit dependencies.
 * Routes only know about the specific functions they need, not the entire container.
 * Usecases return DTOs directly, so routes just pass them through.
 * 
 * Note: Auth middleware is applied in app.ts (composition root), not here.
 */
export function createCategoryRoutes(deps: CategoryDeps) {
  const router = new Hono<{ Variables: { userId: string } }>();

  // GET /categories
  router.get("/categories", async (c) => {
    const userId = c.get("userId");
    const activeOnly = c.req.query("active") === "true";

    const categories = await deps.listCategories(userId, activeOnly);

    return c.json({ categories });
  });

  // POST /categories/seed
  router.post("/categories/seed", async (c) => {
    const userId = c.get("userId");

    const result = await deps.seedDefaultCategories(userId);

    return c.json(result, 201);
  });

  // POST /categories
  router.post(
    "/categories",
    zValidator("json", CreateCategoryInputSchema),
    async (c) => {
      const userId = c.get("userId");
      const input = c.req.valid("json");

      try {
        const category = await deps.createCategory({
          ...input,
          userId,
        });

        return c.json({ category }, 201);
      } catch (err) {
        return c.json({ error: (err as Error).message }, 400);
      }
    }
  );

  // PUT /categories/:id
  router.put(
    "/categories/:id",
    zValidator("json", UpdateCategoryInputSchema),
    async (c) => {
      const userId = c.get("userId");
      const id = c.req.param("id");
      const updates = c.req.valid("json");

      try {
        const category = await deps.updateCategory(id, userId, updates);
        return c.json({ category });
      } catch (err) {
        return c.json({ error: (err as Error).message }, 404);
      }
    }
  );

  // DELETE /categories/:id
  router.delete("/categories/:id", async (c) => {
    const userId = c.get("userId");
    const id = c.req.param("id");

    try {
      await deps.deleteCategory(id, userId);
      return c.json({ message: "Category deleted" });
    } catch (err) {
      return c.json({ error: (err as Error).message }, 400);
    }
  });

  return router;
}