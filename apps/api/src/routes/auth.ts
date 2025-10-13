import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { LoginInput, SignupInput, RefreshTokenInput, ForgotPasswordInput, ResetPasswordInput } from "@budget/schemas";


export const auth = new Hono();

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
auth.get("/auth/me", async (c) => {
  // TODO: Get user from auth middleware
  // const userId = c.get("userId");
  // const getUserUseCase = container.getGetUserUseCase();
  // const user = await getUserUseCase.execute(userId);
  const header = c.req.header("Authorization");
  if (!header || !header.startsWith("Bearer ")) {
    return c.json({ error: "Unauthorized" }, 401);
  }
  
  return c.json({
    id: "user-123",
    email: "user@example.com",
    name: "John Doe",
    defaultCurrency: "USD",
    createdAt: new Date().toISOString(),
  });
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