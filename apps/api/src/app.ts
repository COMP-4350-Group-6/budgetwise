import { Hono } from "hono";
import { cors } from "hono/cors";
import { errors } from "./middleware/errors";
import { health } from "./routes/health";
import { transactions } from "./routes/transactions";
import { auth } from "./routes/auth";
import { authMiddleware } from "./middleware/auth";
/// <reference types="@cloudflare/workers-types" />

export const app = new Hono();
app.use(
  "*",
  cors({
    origin: "http://localhost:3000",
    allowHeaders: ["Content-Type", "Authorization"],
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  })
);
app.use("*", errors);
app.route("/", health);
app.route("/", auth);
app.use("/auth/me", authMiddleware);
app.route("/", transactions);