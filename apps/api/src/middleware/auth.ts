import { Context, Next } from "hono";
import { HTTPException } from "hono/http-exception";
import { getCookie } from "hono/cookie";
import type { TokenVerifier } from "../types";

const COOKIE_NAME = "budgetwise_session";

/**
 * Creates auth middleware using the injected token verifier.
 * Follows clean architecture - middleware receives dependencies, doesn't import them.
 * 
 * Supports both:
 * 1. Authorization: Bearer <token> header (for API clients)
 * 2. HttpOnly cookie (for browser clients)
 */
export function createAuthMiddleware(tokenVerifier: TokenVerifier) {
  return async function authMiddleware(c: Context, next: Next) {
    let token: string | undefined;

    // First, try Authorization header
    const auth = c.req.header("Authorization");
    if (auth?.startsWith("Bearer ")) {
      token = auth.slice("Bearer ".length).trim();
    }

    // If no header, try HttpOnly cookie
    if (!token) {
      const sessionCookie = getCookie(c, COOKIE_NAME);
      if (sessionCookie) {
        try {
          const session = JSON.parse(sessionCookie);
          token = session.accessToken;
        } catch {
          // Invalid cookie format
          console.error("Failed to parse session cookie");
        }
      }
    }

    if (!token) {
      throw new HTTPException(401, { message: "Unauthorized" });
    }

    const result = await tokenVerifier.verify(token);
    
    if (!result.success || !result.data) {
      console.error("Token verification failed:", result.error);
      throw new HTTPException(401, { message: result.error?.message || "Invalid token" });
    }

    c.set("userId", result.data.userId);
    await next();
  };
}
