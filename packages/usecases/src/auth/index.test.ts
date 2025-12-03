import { describe, it, expect, vi } from "vitest";
import { makeAuthClient, makeSessionManager } from "./index";
import type { AuthProviderPort } from "@budget/ports";

describe("auth usecases", () => {
  it("makeAuthClient delegates to provider and session", async () => {
    const mockSession = {
      user: {
        id: "user-1",
        email: "test@example.com",
        name: "Test",
        defaultCurrency: "USD",
        createdAt: new Date().toISOString(),
      },
      tokens: {
        accessToken: "token123",
        refreshToken: "refresh123",
      },
    };

    const provider: AuthProviderPort = {
      signup: vi.fn(async () => ({ success: true, data: mockSession })),
      login: vi.fn(async () => ({ success: true, data: mockSession })),
      logout: vi.fn(async () => ({ success: true })),
      getSession: vi.fn(async () => null),
      refreshSession: vi.fn(async () => ({ success: true, data: mockSession })),
      sendPasswordResetEmail: vi.fn(async () => ({ success: true })),
      resetPassword: vi.fn(async () => ({ success: true })),
    };

    const session = makeSessionManager(provider);
    const client = makeAuthClient({ provider, session });

    // Test signup
    const signupResult = await client.signup({ 
      email: "test@example.com", 
      password: "password123", 
      name: "Test" 
    });
    expect(signupResult.success).toBe(true);
    expect(provider.signup).toHaveBeenCalled();

    // Test login
    const loginResult = await client.login({ 
      email: "test@example.com", 
      password: "password123" 
    });
    expect(loginResult.success).toBe(true);
    expect(provider.login).toHaveBeenCalled();

    // After login, session should be set
    expect(client.isAuthenticated()).toBe(true);
    expect(client.getAccessToken()).toBe("token123");
    expect(client.getUser()?.email).toBe("test@example.com");

    // Test logout
    await client.logout();
    expect(provider.logout).toHaveBeenCalled();
    expect(client.isAuthenticated()).toBe(false);
  });

  it("makeSessionManager provides reactive state", async () => {
    const provider: AuthProviderPort = {
      signup: vi.fn(),
      login: vi.fn(),
      logout: vi.fn(),
      getSession: vi.fn(async () => null),
      refreshSession: vi.fn(),
      sendPasswordResetEmail: vi.fn(),
      resetPassword: vi.fn(),
    };

    const session = makeSessionManager(provider);
    
    const states: string[] = [];
    session.subscribe((state) => {
      states.push(state.status);
    });

    await session.initialize();
    
    // After init with no session, should be unauthenticated
    expect(session.isAuthenticated()).toBe(false);
    expect(states).toContain("unauthenticated");
  });
});
