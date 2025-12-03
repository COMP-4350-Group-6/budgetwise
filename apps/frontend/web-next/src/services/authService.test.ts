import { vi, describe, it, expect, beforeEach } from "vitest";
import { authService } from "@/app/services/authService";

// Mock fetch for API calls
const mockFetch = vi.fn();
global.fetch = mockFetch;

describe("authService", () => {
  const mockUser = { id: "1", email: "user@test.com", name: "User", defaultCurrency: "CAD", createdAt: new Date().toISOString() };

  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  it("signup should call API /auth/signup", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ user: mockUser })
    });

    const result = await authService.signup("user@test.com", "pass123", "User");

    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining("/auth/signup"),
      expect.objectContaining({
        method: "POST",
        credentials: "include",
        body: JSON.stringify({
          email: "user@test.com",
          password: "pass123",
          name: "User",
          defaultCurrency: "CAD",
        }),
      })
    );
    expect(result).toEqual(mockUser);
  });

  it("login should call API /auth/login", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ user: mockUser })
    });

    const result = await authService.login("user@test.com", "pass123");

    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining("/auth/login"),
      expect.objectContaining({
        method: "POST",
        credentials: "include",
        body: JSON.stringify({ email: "user@test.com", password: "pass123" }),
      })
    );
    expect(result).toEqual(mockUser);
  });

  it("getMe should call API /auth/me", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ user: mockUser })
    });

    const user = await authService.getMe();

    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining("/auth/me"),
      expect.objectContaining({
        credentials: "include",
      })
    );
    expect(user).toEqual(mockUser);
  });

  it("logout should call API /auth/logout", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ message: "Logged out" })
    });

    await authService.logout();

    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining("/auth/logout"),
      expect.objectContaining({
        method: "POST",
        credentials: "include",
      })
    );
  });
});
