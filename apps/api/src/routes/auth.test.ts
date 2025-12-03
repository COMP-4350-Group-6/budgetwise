import { describe, it, expect, vi, beforeEach } from "vitest";
import { createAuthRoutes } from "../routes/auth";
import type { AuthProviderPort, TokenVerifierPort } from "@budget/ports";

describe("Auth Routes", () => {
  let mockAuthProvider: vi.MockedObject<AuthProviderPort>;
  let mockTokenVerifier: vi.MockedObject<TokenVerifierPort>;

  beforeEach(() => {
    vi.clearAllMocks();

    mockAuthProvider = {
      signup: vi.fn(),
      login: vi.fn(),
      logout: vi.fn(),
      refreshSession: vi.fn(),
      sendPasswordResetEmail: vi.fn(),
      resetPassword: vi.fn(),
    };

    mockTokenVerifier = {
      verify: vi.fn(),
    };
  });

  const createApp = () => createAuthRoutes({
    authProvider: mockAuthProvider,
    tokenVerifier: mockTokenVerifier,
    cookieDomain: ".budgetwise.ca"
  });

  describe("GET /auth", () => {
    it("should return auth status", async () => {
      const app = createApp();
      const req = new Request("http://localhost/auth");
      const res = await app.fetch(req);

      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data).toEqual({ status: "ok" });
    });
  });

  describe("POST /auth/signup", () => {
    it("should successfully signup user", async () => {
      const mockUser = { id: "user-1", email: "test@example.com" };
      const mockTokens = { accessToken: "access", refreshToken: "refresh" };

      mockAuthProvider.signup.mockResolvedValue({
        success: true,
        data: { user: mockUser, tokens: mockTokens }
      });

      const app = createApp();
      const req = new Request("http://localhost/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: "test@example.com",
          password: "password123",
          name: "Test User"
        })
      });

      const res = await app.fetch(req);

      expect(res.status).toBe(201);
      const data = await res.json();
      expect(data).toEqual({ user: mockUser });
      expect(mockAuthProvider.signup).toHaveBeenCalledWith({
        email: "test@example.com",
        password: "password123",
        name: "Test User",
        defaultCurrency: "USD"
      });
    });

    it("should handle signup validation error", async () => {
      const app = createApp();
      const req = new Request("http://localhost/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: "invalid-email",
          password: "pass"
        })
      });

      const res = await app.fetch(req);

      expect(res.status).toBe(400);
      const data = await res.json();
      expect(data).toHaveProperty("error");
      expect(data.error).toHaveProperty("name", "ZodError");
    });
  });

  describe("POST /auth/login", () => {
    it("should successfully login user", async () => {
      const mockUser = { id: "user-1", email: "test@example.com" };
      const mockTokens = { accessToken: "access", refreshToken: "refresh" };

      mockAuthProvider.login.mockResolvedValue({
        success: true,
        data: { user: mockUser, tokens: mockTokens }
      });

      const app = createApp();
      const req = new Request("http://localhost/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: "test@example.com",
          password: "password123"
        })
      });

      const res = await app.fetch(req);

      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data).toEqual({ user: mockUser });
      expect(mockAuthProvider.login).toHaveBeenCalledWith({
        email: "test@example.com",
        password: "password123"
      });
    });

    it("should handle login failure", async () => {
      mockAuthProvider.login.mockResolvedValue({
        success: false,
        error: { code: "INVALID_CREDENTIALS", message: "Invalid credentials" }
      });

      const app = createApp();
      const req = new Request("http://localhost/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: "test@example.com",
          password: "wrongpassword"
        })
      });

      const res = await app.fetch(req);

      expect(res.status).toBe(401);
      const data = await res.json();
      expect(data).toEqual({
        error: { code: "INVALID_CREDENTIALS", message: "Invalid credentials" }
      });
    });
  });

  describe("POST /auth/logout", () => {
    it("should logout successfully", async () => {
      mockAuthProvider.logout.mockResolvedValue(undefined);

      const app = createApp();
      const req = new Request("http://localhost/auth/logout", {
        method: "POST"
      });

      const res = await app.fetch(req);

      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data).toEqual({ message: "Logged out successfully" });
      expect(mockAuthProvider.logout).toHaveBeenCalled();
    });
  });

  describe("GET /auth/me", () => {
    it("should return user info when authenticated", async () => {
      const mockTokens = { accessToken: "valid-token" };
      mockTokenVerifier.verify.mockResolvedValue({
        success: true,
        data: { userId: "user-1", email: "test@example.com" }
      });

      const app = createApp();
      const req = new Request("http://localhost/auth/me", {
        headers: {
          "Cookie": `budgetwise_session=${encodeURIComponent(JSON.stringify(mockTokens))}`
        }
      });

      const res = await app.fetch(req);

      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data).toEqual({
        user: { id: "user-1", email: "test@example.com" }
      });
    });

    it("should return 401 when no session cookie", async () => {
      const app = createApp();
      const req = new Request("http://localhost/auth/me");

      const res = await app.fetch(req);

      expect(res.status).toBe(401);
      const data = await res.json();
      expect(data).toEqual({ error: "Unauthorized" });
    });

    it("should return 401 when token verification fails", async () => {
      const mockTokens = { accessToken: "invalid-token" };
      mockTokenVerifier.verify.mockResolvedValue({
        success: false,
        error: { code: "INVALID_TOKEN", message: "Token expired" }
      });

      const app = createApp();
      const req = new Request("http://localhost/auth/me", {
        headers: {
          "Cookie": `budgetwise_session=${encodeURIComponent(JSON.stringify(mockTokens))}`
        }
      });

      const res = await app.fetch(req);

      expect(res.status).toBe(401);
      const data = await res.json();
      expect(data).toEqual({ error: "Session expired" });
    });
  });

  describe("POST /auth/forgot-password", () => {
    it("should send password reset email", async () => {
      mockAuthProvider.sendPasswordResetEmail.mockResolvedValue(undefined);

      const app = createApp();
      const req = new Request("http://localhost/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: "test@example.com" })
      });

      const res = await app.fetch(req);

      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data).toEqual({
        message: "If an account exists, a password reset email has been sent"
      });
      expect(mockAuthProvider.sendPasswordResetEmail).toHaveBeenCalledWith("test@example.com");
    });
  });

  describe("POST /auth/reset-password", () => {
    it("should reset password successfully", async () => {
      mockAuthProvider.resetPassword.mockResolvedValue({ success: true });

      const app = createApp();
      const req = new Request("http://localhost/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          token: "reset-token",
          newPassword: "newpassword123"
        })
      });

      const res = await app.fetch(req);

      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data).toEqual({ message: "Password reset successfully" });
      expect(mockAuthProvider.resetPassword).toHaveBeenCalledWith("reset-token", "newpassword123");
    });

    it("should handle reset password failure", async () => {
      mockAuthProvider.resetPassword.mockResolvedValue({
        success: false,
        error: { code: "INVALID_TOKEN", message: "Token expired" }
      });

      const app = createApp();
      const req = new Request("http://localhost/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          token: "expired-token",
          newPassword: "newpassword123"
        })
      });

      const res = await app.fetch(req);

      expect(res.status).toBe(400);
      const data = await res.json();
      expect(data).toEqual({
        error: { code: "INVALID_TOKEN", message: "Token expired" }
      });
    });
  });
});