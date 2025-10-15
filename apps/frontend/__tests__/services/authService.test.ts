import { vi, describe, it, expect, beforeEach } from "vitest";
import { authService } from "@/app/services/authService";
import { authUsecases } from "@/lib/authContainer";

vi.mock("@/lib/authContainer", () => ({
  authUsecases: {
    signUp: vi.fn(),
    signIn: vi.fn(),
    signOut: vi.fn(),
    getCurrentUser: vi.fn(),
  },
}));

describe("authService", () => {
  const mockUser = { id: "1", email: "user@test.com", name: "User" };

  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  it("signup should call signUp usecase", async () => {
    (authUsecases.signUp as any).mockResolvedValueOnce();
    const result = await authService.signup("user@test.com", "pass123", "User");
    expect(authUsecases.signUp).toHaveBeenCalledWith({
      email: "user@test.com",
      password: "pass123",
      name: "User",
      defaultCurrency: "CAD",
    });
    expect(result).toEqual({ id: "", email: "user@test.com", name: "User" });
  });

  it("login should call signIn and getCurrentUser", async () => {
    (authUsecases.signIn as any).mockResolvedValueOnce();
    (authUsecases.getCurrentUser as any).mockResolvedValueOnce(mockUser);

    const result = await authService.login("user@test.com", "pass123");

    expect(authUsecases.signIn).toHaveBeenCalledWith({ email: "user@test.com", password: "pass123" });
    expect(authUsecases.getCurrentUser).toHaveBeenCalled();
    expect(result).toEqual({ id: "1", email: "user@test.com", name: "User" });
  });

  it("getMe should call getCurrentUser", async () => {
    (authUsecases.getCurrentUser as any).mockResolvedValueOnce(mockUser);
    const user = await authService.getMe();

    expect(authUsecases.getCurrentUser).toHaveBeenCalled();
    expect(user).toEqual({ ...mockUser, createdAt: undefined });
  });

  it("logout should call signOut", async () => {
    (authUsecases.signOut as any).mockResolvedValueOnce();
    await authService.logout();
    expect(authUsecases.signOut).toHaveBeenCalled();
  });
});
