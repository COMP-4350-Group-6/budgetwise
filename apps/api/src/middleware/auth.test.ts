import { describe, it, expect, vi, beforeEach } from "vitest";
import { Hono } from "hono";
import { createAuthMiddleware } from "./auth";
import type { TokenVerifier } from "../types";

// Create a mock token verifier
function createMockTokenVerifier(overrides?: Partial<TokenVerifier>): TokenVerifier {
  return {
    verify: vi.fn(async () => ({ 
      success: true as const, 
      data: { userId: "user-123", email: "test@example.com", expiresAt: Date.now() + 3600000 } 
    })),
    decode: vi.fn(() => ({ userId: "user-123", email: "test@example.com" })),
    ...overrides,
  };
}

type Variables = { userId: string };

describe("auth middleware", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns 401 without Authorization header", async () => {
    const tokenVerifier = createMockTokenVerifier();
    const authMiddleware = createAuthMiddleware(tokenVerifier);
    
    const app = new Hono<{ Variables: Variables }>();
    app.use("/auth/me", authMiddleware);
    app.get("/auth/me", (c) => c.json({ ok: true }));
    
    const req = new Request("http://localhost/auth/me");
    const res = await app.fetch(req);
    expect(res.status).toBe(401);
  });

  it("returns 401 when token verification fails", async () => {
    const tokenVerifier = createMockTokenVerifier({
      verify: vi.fn(async () => ({ 
        success: false as const, 
        error: { code: "INVALID_TOKEN" as const, message: "bad token" } 
      })),
    });
    const authMiddleware = createAuthMiddleware(tokenVerifier);
    
    const app = new Hono<{ Variables: Variables }>();
    app.use("/auth/me", authMiddleware);
    app.get("/auth/me", (c) => c.json({ ok: true }));
    
    const req = new Request("http://localhost/auth/me", { 
      headers: { Authorization: "Bearer bad" } 
    });
    const res = await app.fetch(req);
    expect(res.status).toBe(401);
  });

  it("@critical allows request when token is valid", async () => {
    const tokenVerifier = createMockTokenVerifier({
      verify: vi.fn(async () => ({ 
        success: true as const, 
        data: { userId: "user-42", email: "test@example.com", expiresAt: Date.now() + 3600000 } 
      })),
    });
    const authMiddleware = createAuthMiddleware(tokenVerifier);
    
    const app = new Hono<{ Variables: Variables }>();
    app.use("/auth/me", authMiddleware);
    app.get("/auth/me", (c) => c.json({ ok: true, userId: c.get("userId") }));
    
    const req = new Request("http://localhost/auth/me", { 
      headers: { Authorization: "Bearer good" } 
    });
    const res = await app.fetch(req);
    expect(res.status).toBe(200);
    
    const body = await res.json() as { userId: string };
    expect(body.userId).toBe("user-42");
  });

  it("sets userId in context from verified token", async () => {
    const tokenVerifier = createMockTokenVerifier();
    const authMiddleware = createAuthMiddleware(tokenVerifier);
    
    const app = new Hono<{ Variables: Variables }>();
    app.use("/protected", authMiddleware);
    app.get("/protected", (c) => c.json({ userId: c.get("userId") }));
    
    const req = new Request("http://localhost/protected", { 
      headers: { Authorization: "Bearer valid-token" } 
    });
    const res = await app.fetch(req);
    
    expect(res.status).toBe(200);
    const body = await res.json() as { userId: string };
    expect(body.userId).toBe("user-123");
    expect(tokenVerifier.verify).toHaveBeenCalledWith("valid-token");
  });
});
