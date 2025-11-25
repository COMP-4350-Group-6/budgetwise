import { Hono } from "hono";
import { cors } from "hono/cors";
import { errors } from "./middleware/errors";
import { health } from "./routes/health";
import { transactions } from "./routes/transactions";
import { auth } from "./routes/auth";
import { categories } from "./routes/categories";
import { budgets } from "./routes/budgets";
import { authMiddleware } from "./middleware/auth";
/// <reference types="@cloudflare/workers-types" />

type Env = {
  SUPABASE_URL?: string;
  SUPABASE_JWKS_URL?: string;
  SUPABASE_JWT_SECRET?: string;
  SUPABASE_LOCAL_JWT_SECRET?: string;
  SUPABASE_SERVICE_ROLE_KEY?: string;
  OPENROUTER_API_KEY?: string;
};

export const app = new Hono<{ Bindings: Env }>();
app.use(
  "*",
  cors({
    origin: ["http://localhost:3000", "http://localhost:3001", "http://10.0.0.7:3000", "https://budgetwise.ca", "https://www.budgetwise.ca"],
    allowHeaders: ["Content-Type", "Authorization"],
    allowMethods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    credentials: true,
  })
);
app.use("*", errors);
app.route("/", health);
app.route("/", auth);
app.route("/", transactions);
app.route("/", categories);
app.route("/", budgets);