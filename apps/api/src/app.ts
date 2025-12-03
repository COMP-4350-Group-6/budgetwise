import { Hono } from "hono";
import { cors } from "hono/cors";
import { errors } from "./middleware/errors";
import { health } from "./routes/health";
import { docs } from "./routes/docs";
import { createTransactionRoutes } from "./routes/transactions";
import { createAuthRoutes } from "./routes/auth";
import { createCategoryRoutes } from "./routes/categories";
import { createBudgetRoutes } from "./routes/budgets";
import { createAuthMiddleware } from "./middleware/auth";
import type { AppDeps } from "./types";

// ============================================================================
// CORS Configuration
// ============================================================================

const ALLOWED_ORIGINS = [
  "http://localhost:3000",
  "http://localhost:5173",
  "https://budgetwise.ca",
  "https://www.budgetwise.ca",
  "https://auth.budgetwise.ca",
  "https://api.budgetwise.ca",  // For smoke tests and direct API testing
  "https://frontend.ramatjyot13-ca.workers.dev",
];

const CLOUDFLARE_WORKERS_PREVIEW_PATTERN = /^https:\/\/[a-z0-9-]+-frontend\.ramatjyot13-ca\.workers\.dev$/;
const CLOUDFLARE_PAGES_PREVIEW_PATTERN = /^https:\/\/[a-z0-9-]+\.budgetwise-[a-z0-9-]+\.pages\.dev$/;

function corsOrigin(origin: string | undefined): string {
  if (!origin) return "*"; // Allow Postman, CI tests
  if (ALLOWED_ORIGINS.includes(origin)) return origin;
  if (CLOUDFLARE_WORKERS_PREVIEW_PATTERN.test(origin)) return origin;
  if (CLOUDFLARE_PAGES_PREVIEW_PATTERN.test(origin)) return origin;
  return "";
}

// ============================================================================
// App Factory
// ============================================================================

/**
 * Creates the Hono app with explicit dependencies.
 */
export function createApp(deps: AppDeps) {
  const { tokenVerifier, authProvider, cookieDomain } = deps;
  
  // Validate required dependencies
  if (!tokenVerifier) {
    throw new Error("tokenVerifier is required");
  }

  const app = new Hono();

  // Global middleware
  app.use("*", cors({
    origin: corsOrigin,
    allowHeaders: ["Content-Type", "Authorization"],
    allowMethods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    credentials: true,
  }));
  app.use("*", errors);

  // Public routes
  app.route("/", health);
  app.route("/", docs);
  
  // Auth routes (public - login/signup don't need auth)
  if (authProvider) {
    app.route("/", createAuthRoutes({ authProvider, tokenVerifier, cookieDomain }));
  }

  // Protected API routes (v1)
  const v1 = new Hono();
  v1.use("*", createAuthMiddleware(tokenVerifier));
  v1.route("/", createTransactionRoutes(deps.transactions));
  v1.route("/", createCategoryRoutes(deps.categories));
  v1.route("/", createBudgetRoutes(deps.budgets));
  
  app.route("/v1", v1);

  return app;
}