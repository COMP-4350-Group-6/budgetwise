import { renderHook, waitFor } from "@testing-library/react";
import { vi, describe, it, expect, beforeEach, afterEach } from "vitest";
import { useAuth, AuthProvider } from "@/hooks/useAuth";
import type { WebAuthApiContainerType } from "@budget/composition-web-auth-api";
import React from "react";

/** Auth client type derived from container */
type AuthClient = WebAuthApiContainerType["authClient"];

// Mock auth client
const mockAuthClient: Partial<AuthClient> = {
  initialize: vi.fn().mockResolvedValue(undefined),
  isAuthenticated: vi.fn().mockReturnValue(true),
  getUser: vi.fn().mockReturnValue({
    id: "user-123",
    email: "test@example.com",
    name: "Test User",
    defaultCurrency: "USD",
    createdAt: new Date().toISOString(),
  }),
  subscribe: vi.fn((callback) => {
    callback({ 
      status: 'authenticated',
      session: {
        user: {
          id: "user-123",
          email: "test@example.com",
          name: "Test User",
          defaultCurrency: "USD",
          createdAt: new Date().toISOString(),
        },
        tokens: { accessToken: "", refreshToken: "" },
      },
    });
    return () => {};
  }),
  logout: vi.fn().mockResolvedValue({ success: true }),
};

describe("useAuth hook", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("should provide auth status when authenticated", async () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <AuthProvider authClient={mockAuthClient as AuthClient}>{children}</AuthProvider>
    );

    const { result } = renderHook(() => useAuth(), { wrapper });

    // Wait for initialization - auth check completes
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.isAuthenticated).toBe(true);
    expect(result.current.user?.email).toBe("test@example.com");
  });

  it("should show unauthenticated when not logged in", async () => {
    const unauthClient: Partial<AuthClient> = {
      initialize: vi.fn().mockResolvedValue(undefined),
      isAuthenticated: vi.fn().mockReturnValue(false),
      getUser: vi.fn().mockReturnValue(null),
      subscribe: vi.fn((callback) => {
        callback({ status: 'unauthenticated' });
        return () => {};
      }),
      logout: vi.fn().mockResolvedValue({ success: true }),
    };

    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <AuthProvider authClient={unauthClient as AuthClient}>{children}</AuthProvider>
    );

    const { result } = renderHook(() => useAuth(), { wrapper });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.isAuthenticated).toBe(false);
    expect(result.current.user).toBeNull();
  });

  it("should throw error when used outside AuthProvider", () => {
    expect(() => {
      renderHook(() => useAuth());
    }).toThrow('useAuth must be used within an AuthProvider');
  });
});
