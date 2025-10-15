import { renderHook, waitFor } from "@testing-library/react";
import { vi, describe, it, expect, beforeEach } from "vitest";
import { useAuth } from "@/hooks/useAuth";
import { apiFetch } from "@/lib/apiClient";

vi.mock("@/lib/apiClient", () => ({
  apiFetch: vi.fn(),
}));

describe("useAuth hook", () => {
  const mockUser = { id: "1", email: "test@test.com", name: "User" };

  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  it("should start with loading = false when no token exists", () => {
    const { result } = renderHook(() => useAuth());
    expect(result.current.loading).toBe(false);
  });

  it("should fetch user when token exists", async () => {
    localStorage.setItem("accessToken", "token123");
    (apiFetch as any).mockResolvedValueOnce(mockUser);

    const { result } = renderHook(() => useAuth());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(apiFetch).toHaveBeenCalledWith("/auth/me", { method: "GET" }, true);
    expect(result.current.user).toEqual(mockUser);
    expect(result.current.isAuthenticated).toBe(true);
  });

  it("should set user to null when fetch fails", async () => {
    localStorage.setItem("accessToken", "token123");
    (apiFetch as any).mockRejectedValueOnce(new Error("Unauthorized"));

    const { result } = renderHook(() => useAuth());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.user).toBeNull();
    expect(result.current.isAuthenticated).toBe(false);
  });

  it("should not fetch if no token exists", async () => {
    const { result } = renderHook(() => useAuth());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(apiFetch).not.toHaveBeenCalled();
    expect(result.current.user).toBeNull();
  });
});
