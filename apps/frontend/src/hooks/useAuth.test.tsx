import { renderHook, waitFor } from "@testing-library/react";
import { vi, describe, it, expect, beforeEach } from "vitest";
import { useAuth } from "@/hooks/useAuth";
import { authUsecases } from "@/lib/authContainer";

vi.mock("@/lib/authContainer", () => ({
  authUsecases: {
    getCurrentUser: vi.fn(),
  },
}));

describe("useAuth hook", () => {
  const mockUser = { id: "1", email: "test@test.com", name: "User" };

  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  it("should start with loading = true initially, then false", async () => {
    vi.mocked(authUsecases.getCurrentUser).mockResolvedValueOnce(null);
    const { result } = renderHook(() => useAuth());
    expect(result.current.loading).toBe(true);
    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });
  });

  it("should fetch user when user exists", async () => {
    vi.mocked(authUsecases.getCurrentUser).mockResolvedValueOnce(mockUser);

    const { result } = renderHook(() => useAuth());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(authUsecases.getCurrentUser).toHaveBeenCalled();
  expect(result.current.user).toEqual(mockUser);
    expect(result.current.isAuthenticated).toBe(true);
  });

  it("should set user to null when fetch fails", async () => {
    vi.mocked(authUsecases.getCurrentUser).mockRejectedValueOnce(new Error("Unauthorized"));

    const { result } = renderHook(() => useAuth());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.user).toBeNull();
    expect(result.current.isAuthenticated).toBe(false);
  });

  it("should set user to null when no user exists", async () => {
    vi.mocked(authUsecases.getCurrentUser).mockResolvedValueOnce(null);

    const { result } = renderHook(() => useAuth());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.user).toBeNull();
    expect(result.current.isAuthenticated).toBe(false);
  });
});
