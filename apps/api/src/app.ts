import { Hono } from "hono";
import { errors } from "./middleware/errors";
import { health } from "./routes/health";
import { transactions } from "./routes/transactions";
import { auth } from "./routes/auth";
import { authMiddleware } from "./middleware/auth";
/// <reference types="@cloudflare/workers-types" />
export const app = new Hono();
app.use("*", errors);
app.route("/", health);
app.route("/", auth);
app.use("/auth/me", authMiddleware);
app.route("/", transactions);
