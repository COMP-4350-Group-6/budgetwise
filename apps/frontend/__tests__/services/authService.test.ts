import { vi, describe, it, expect, beforeEach } from "vitest";
import { authService } from "@/app/services/authService";
import { apiFetch } from "@/lib/apiClient";

// Mock apiFetch globally
vi.mock("@/lib/apiClient", () => ({
  apiFetch: vi.fn(),
}));

describe("authService", () => {
  const mockUser = { id: "1", email: "user@test.com", name: "User" };
  const mockTokens = { accessToken: "access", refreshToken: "refresh" };

  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  it("signup should call apiFetch and store tokens", async () => {
    (apiFetch as any).mockResolvedValueOnce({
      user: mockUser,
      ...mockTokens,
    });

    const result = await authService.signup("user@test.com", "pass123", "User");

    expect(apiFetch).toHaveBeenCalledWith(
      "/auth/signup",
      expect.objectContaining({ method: "POST" }),
    );
    expect(localStorage.getItem("accessToken")).toBe("access");
    expect(localStorage.getItem("refreshToken")).toBe("refresh");
    expect(result).toEqual(mockUser);
  });

  it("login should call apiFetch and store tokens", async () => {
    (apiFetch as any).mockResolvedValueOnce({
      user: mockUser,
      ...mockTokens,
    });

    const result = await authService.login("user@test.com", "pass123");

    expect(apiFetch).toHaveBeenCalledWith(
      "/auth/login",
      expect.objectContaining({ method: "POST" }),
    );
    expect(localStorage.getItem("accessToken")).toBe("access");
    expect(localStorage.getItem("refreshToken")).toBe("refresh");
    expect(result).toEqual(mockUser);
  });

  it("getMe should call apiFetch with auth header", async () => {
    (apiFetch as any).mockResolvedValueOnce(mockUser);
    const user = await authService.getMe();

    expect(apiFetch).toHaveBeenCalledWith("/auth/me", { method: "GET" }, true);
    expect(user).toEqual(mockUser);
  });

  it("logout should call apiFetch and clear tokens", async () => {
    localStorage.setItem("accessToken", "a");
    localStorage.setItem("refreshToken", "b");

    (apiFetch as any).mockResolvedValueOnce({});

    await authService.logout();

    expect(apiFetch).toHaveBeenCalledWith("/auth/logout", { method: "POST" }, true);
    expect(localStorage.getItem("accessToken")).toBeNull();
    expect(localStorage.getItem("refreshToken")).toBeNull();
  });
});
