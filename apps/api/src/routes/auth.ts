import { Hono } from "hono";
import type { Context } from "hono";
import { zValidator } from "@hono/zod-validator";
import { getCookie, setCookie, deleteCookie } from "hono/cookie";
import { 
  LoginInputSchema, 
  SignupInputSchema,
  ForgotPasswordInputSchema, 
  ResetPasswordInputSchema,
  type AuthTokens,
} from "@budget/schemas";
import type { AuthProviderPort, TokenVerifierPort } from "@budget/ports";

// ============================================================================
// Cookie Configuration
// ============================================================================

const COOKIE_NAME = "budgetwise_session";
const COOKIE_MAX_AGE = 60 * 60 * 24 * 7; // 7 days

function isProductionDomain(domain?: string): boolean {
  return Boolean(domain && domain.length > 0 && !domain.includes('localhost'));
}

function getCookieOptions(domain?: string) {
  const isProd = isProductionDomain(domain);
  return {
    httpOnly: true,
    secure: isProd,
    sameSite: "Lax" as const,
    path: "/",
    maxAge: COOKIE_MAX_AGE,
    ...(isProd ? { domain } : {}),
  };
}

/** Helper to set session cookie */
function setSessionCookie(c: Context, tokens: AuthTokens, domain?: string) {
  setCookie(c, COOKIE_NAME, JSON.stringify(tokens), getCookieOptions(domain));
}

/** Helper to clear session cookie */
function clearSessionCookie(c: Context, domain?: string) {
  deleteCookie(c, COOKIE_NAME, {
    path: "/",
    ...(isProductionDomain(domain) ? { domain } : {}),
  });
}

/** Helper to get session tokens from cookie */
function getSessionTokens(c: Context): AuthTokens | null {
  const cookieValue = getCookie(c, COOKIE_NAME);
  if (!cookieValue) return null;
  try {
    return JSON.parse(cookieValue);
  } catch {
    return null;
  }
}

// ============================================================================
// Route Dependencies
// ============================================================================

export interface AuthRouteDeps {
  authProvider: AuthProviderPort;
  tokenVerifier: TokenVerifierPort;
  cookieDomain?: string;
}

// ============================================================================
// Route Factory
// ============================================================================

export function createAuthRoutes(deps: AuthRouteDeps) {
  const app = new Hono();
  const { authProvider, tokenVerifier, cookieDomain } = deps;

  // Health check
  app.get("/auth", (c) => c.json({ status: "ok" }));

  // POST /auth/signup
  app.post("/auth/signup", zValidator("json", SignupInputSchema), async (c) => {
    const body = c.req.valid("json");
    const result = await authProvider.signup(body);
    
    if (!result.success || !result.data) {
      return c.json({ error: result.error }, 400);
    }

    const { user, tokens } = result.data;
    
    // Set cookie if we have valid tokens (email might need confirmation)
    if (tokens.accessToken) {
      setSessionCookie(c, tokens, cookieDomain);
    }
    
    return c.json({ user }, 201);
  });

  // POST /auth/login
  app.post("/auth/login", zValidator("json", LoginInputSchema), async (c) => {
    const body = c.req.valid("json");
    const result = await authProvider.login(body);
    
    if (!result.success || !result.data) {
      return c.json({ error: result.error }, 401);
    }

    const { user, tokens } = result.data;
    setSessionCookie(c, tokens, cookieDomain);
    
    return c.json({ user });
  });

  // POST /auth/logout
  app.post("/auth/logout", async (c) => {
    await authProvider.logout();
    clearSessionCookie(c, cookieDomain);
    return c.json({ message: "Logged out successfully" });
  });

  // POST /auth/refresh
  app.post("/auth/refresh", async (c) => {
    const tokens = getSessionTokens(c);
    
    if (!tokens) {
      return c.json({ error: { code: "SESSION_EXPIRED", message: "No session found" } }, 401);
    }

    const result = await authProvider.refreshSession();
    
    if (!result.success || !result.data) {
      clearSessionCookie(c, cookieDomain);
      return c.json({ error: result.error }, 401);
    }

    setSessionCookie(c, result.data.tokens, cookieDomain);
    return c.json({ message: "Session refreshed" });
  });

  // GET /auth/me - Verify token from cookie and return user
  app.get("/auth/me", async (c) => {
    const tokens = getSessionTokens(c);
    
    if (!tokens?.accessToken) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    const result = await tokenVerifier.verify(tokens.accessToken);
    
    if (!result.success || !result.data) {
      clearSessionCookie(c, cookieDomain);
      return c.json({ error: "Session expired" }, 401);
    }
    
    return c.json({ 
      user: {
        id: result.data.userId,
        email: result.data.email,
      }
    });
  });

  // POST /auth/forgot-password
  app.post("/auth/forgot-password", zValidator("json", ForgotPasswordInputSchema), async (c) => {
    const { email } = c.req.valid("json");
    await authProvider.sendPasswordResetEmail(email);
    // Always return success to not reveal if email exists
    return c.json({ message: "If an account exists, a password reset email has been sent" });
  });

  // POST /auth/reset-password
  app.post("/auth/reset-password", zValidator("json", ResetPasswordInputSchema), async (c) => {
    const { token, newPassword } = c.req.valid("json");
    const result = await authProvider.resetPassword(token, newPassword);
    
    if (!result.success) {
      return c.json({ error: result.error }, 400);
    }
    
    return c.json({ message: "Password reset successfully" });
  });

  return app;
}