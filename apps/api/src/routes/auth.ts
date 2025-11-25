import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { LoginInput, SignupInput, RefreshTokenInput, ForgotPasswordInput, ResetPasswordInput } from "@budget/schemas";
import { container } from "../container";
import { User } from "@budget/domain/user";
import { JWTPayload } from "jose";
import { authMiddleware } from "../middleware/auth";
import type { Context } from "hono";

type Variables = {
  userId: string;
  jwtPayload: JWTPayload;
};

type Env = {
  SUPABASE_URL?: string;
  SUPABASE_JWKS_URL?: string;
  SUPABASE_LOCAL_JWT_SECRET?: string;
};

export const auth = new Hono<{ Variables: Variables; Bindings: Env }>();

// POST /auth/signup
auth.get("/auth", (c) => c.json({ message: "Auth API is running" }));

auth.post(
  "/auth/signup",
  zValidator("json", SignupInput),
  async (c) => {
    const body = c.req.valid("json");
    
    // TODO: Get use case from container
    // const signupUseCase = container.getSignupUseCase();
    // const result = await signupUseCase.execute(body);
    
    return c.json({
      user: {
        id: "user-123",
        email: body.email,
        name: body.name,
        defaultCurrency: body.defaultCurrency,
      },
      accessToken: "jwt-access-token",
      refreshToken: "jwt-refresh-token",
    }, 201);
  }
);

// POST /auth/login
auth.post(
  "/auth/login",
  zValidator("json", LoginInput),
  async (c) => {
    const body = c.req.valid("json");
    
    // TODO: Get use case from container
    // const loginUseCase = container.getLoginUseCase();
    // const result = await loginUseCase.execute(body);
    
    return c.json({
      user: {
        id: "user-123",
        email: body.email,
        name: "John Doe",
        defaultCurrency: "USD",
      },
      accessToken: "jwt-access-token",
      refreshToken: "jwt-refresh-token",
    });
  }
);

// POST /auth/logout
auth.post("/auth/logout", async (c) => {
  // TODO: Invalidate refresh token
  // const logoutUseCase = container.getLogoutUseCase();
  // await logoutUseCase.execute({ token: refreshToken });
  
  return c.json({ message: "Logged out successfully" });
});

// POST /auth/refresh
auth.post(
  "/auth/refresh",
  zValidator("json", RefreshTokenInput),
  async (c) => {
    const body = c.req.valid("json");
    
    // TODO: Get use case from container
    // const refreshUseCase = container.getRefreshTokenUseCase();
    // const result = await refreshUseCase.execute(body);
    
    return c.json({
      accessToken: "new-jwt-access-token",
      refreshToken: "new-jwt-refresh-token",
    });
  }
);

// GET /auth/me (requires authentication)
auth.get("/auth/me", authMiddleware, async (c: Context<{ Variables: Variables; Bindings: Env }>) => {
  const userId = c.get("userId");
  const jwtPayload = c.get("jwtPayload");
  
  if (!userId) {
    return c.json({ error: "Unauthorized" }, 401);
  }

  const usersRepo = container.repos.usersRepo;
  if (!usersRepo) {
    return c.json({ error: "User repository not available" }, 500);
  }

  try {
    // Check if user exists in database
    let user = await usersRepo.getById(userId);
    
    // If user doesn't exist, create them from JWT payload
    if (!user) {
      // Extract user metadata from JWT token
      const email = (jwtPayload.email as string) || "";
      const userMetadata = (jwtPayload.user_metadata as Record<string, any>) || {};
      const name = userMetadata.name || email.split("@")[0] || "User";
      const defaultCurrency = userMetadata.defaultCurrency || "USD";
      
      if (!email) {
        return c.json({ error: "Email not found in token" }, 400);
      }

      // Create user in database
      const now = new Date();
      const newUser = new User({
        id: userId,
        email,
        name,
        defaultCurrency,
        createdAt: now,
        updatedAt: now,
      });

      await usersRepo.create(newUser);
      user = newUser;
    }

    return c.json({
      id: user.id,
      email: user.email,
      name: user.name,
      defaultCurrency: user.defaultCurrency,
      createdAt: user.props.createdAt.toISOString(),
    });
  } catch (error) {
    console.error("Error in /auth/me:", error);
    return c.json({ 
      error: error instanceof Error ? error.message : "Failed to get user" 
    }, 500);
  }
});

// POST /auth/forgot-password
auth.post(
  "/auth/forgot-password",
  zValidator("json", ForgotPasswordInput),
  async (c) => {
    const body = c.req.valid("json");
    
    // TODO: Send password reset email
    // const forgotPasswordUseCase = container.getForgotPasswordUseCase();
    // await forgotPasswordUseCase.execute(body);
    
    return c.json({ message: "Password reset email sent" });
  }
);

// POST /auth/reset-password
auth.post(
  "/auth/reset-password",
  zValidator("json", ResetPasswordInput),
  async (c) => {
    const body = c.req.valid("json");
    
    // TODO: Send password reset email
    // const resetPasswordUseCase = container.getResetPasswordUseCase();
    // await resetPasswordUseCase.execute(body);
    
    return c.json({ message: "Password reset successfully" });
  }
);