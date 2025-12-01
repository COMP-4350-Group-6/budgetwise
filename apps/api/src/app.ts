import { Hono } from "hono";
import { cors } from "hono/cors";
import { errors } from "./middleware/errors";
import { health } from "./routes/health";
import { createTransactionRoutes } from "./routes/transactions";
import { auth } from "./routes/auth";
import { createCategoryRoutes } from "./routes/categories";
import { createBudgetRoutes } from "./routes/budgets";
import { authMiddleware } from "./middleware/auth";
import type { AppDeps } from "./types";

/**
 * Creates the Hono app with explicit dependencies.
 * This is the composition point for the API - it receives dependencies
 * and wires them to route factories.
 */
export function createApp(deps: AppDeps) {
  const app = new Hono();

  // Global middleware
  app.use(
    "*",
    cors({
      origin: (origin) => {
        const allowedOrigins = [
          "http://localhost:3000",
          "https://budgetwise.ca",
          "https://www.budgetwise.ca",
          "https://frontend.ramatjyot13-ca.workers.dev"
        ];

        if (origin && allowedOrigins.includes(origin)) {
          return origin;
        }

        // Allow Cloudflare Pages preview URLs
        if (origin && /^https:\/\/[a-z0-9-]+-frontend\.ramatjyot13-ca\.workers\.dev$/.test(origin)) {
          return origin;
        }

        // Allow requests without Origin header (e.g., Postman, CI tests)
        if (!origin) {
          return "*";
        }

        return "";
      },
      allowHeaders: ["Content-Type", "Authorization"],
      allowMethods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
      credentials: true,
    })
  );
  app.use("*", errors);

  // Routes without auth
  app.route("/", health);
  app.route("/", auth);

  // API v1 - all protected routes under /v1/* with single auth middleware
  const v1 = new Hono();
  v1.use("*", authMiddleware);
  v1.route("/", createTransactionRoutes(deps.transactions));
  v1.route("/", createCategoryRoutes(deps.categories));
  v1.route("/", createBudgetRoutes(deps.budgets));
  
  app.route("/v1", v1);

  // Also protect /auth/me (not under /v1)
  app.use("/auth/me", authMiddleware);

  return app;
}