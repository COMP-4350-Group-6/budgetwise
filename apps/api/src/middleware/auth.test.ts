import "dotenv/config";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { Hono } from "hono";
import { authMiddleware } from "./auth";

// Hoisted mock for 'jose' to avoid top-level variable access issues
vi.mock("jose", () => {
  return {
    createRemoteJWKSet: vi.fn(() => ({})),
    jwtVerify: vi.fn(async () => ({ payload: { sub: "user-123" } })),
  };
});

// Import mocked symbols after vi.mock so we can control behavior
import { jwtVerify } from "jose";

const jwtSecret = process.env.SUPABASE_JWT_SECRET;

describe.skipIf(!jwtSecret)("auth middleware", () => {
  const ENV = {
    SUPABASE_URL: "https://example.supabase.co",
    SUPABASE_JWT_SECRET: jwtSecret!,
  };
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns 401 without Authorization header", async () => {
    const app = new Hono();
    app.use("/auth/me", authMiddleware);
    app.get("/auth/me", (c) => c.json({ ok: true }));
    const req = new Request("http://localhost/auth/me");
    const res = await app.fetch(req, ENV as any);
    expect(res.status).toBe(401);
  });

  it("returns 401 when token verification fails", async () => {
    const app = new Hono();
    app.use("/auth/me", authMiddleware);
    app.get("/auth/me", (c) => c.json({ ok: true }));
    (jwtVerify as unknown as ReturnType<typeof vi.fn>).mockRejectedValueOnce(new Error("bad token"));
    const req = new Request("http://localhost/auth/me", { headers: { Authorization: "Bearer bad" } });
    const res = await app.fetch(req, ENV as any);
    expect(res.status).toBe(401);
  });

  it("allows request when token is valid", async () => {
    const app = new Hono();
    app.use("/auth/me", authMiddleware);
    app.get("/auth/me", (c) => c.json({ ok: true }));
    (jwtVerify as unknown as ReturnType<typeof vi.fn>).mockResolvedValueOnce({ payload: { sub: "user-42" } } as any);
    const req = new Request("http://localhost/auth/me", { headers: { Authorization: "Bearer good" } });
    const res = await app.fetch(req, ENV as any);
    expect(res.status).toBe(200);
  });
});


