import type { Context, Next } from "hono";
export async function errors(c: Context, next: Next) {
  try {
    await next();
  } catch (e: any) {
    const status = e?.status ?? 500;
    return c.json({ error: e?.message ?? "Internal Error" }, status);
  }
}
