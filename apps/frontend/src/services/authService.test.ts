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
  const mockUser = { id: "1", email: "user@test.com", name: "User", defaultCurrency: "CAD", createdAt: new Date().toISOString() };

  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  it("signup should call signUp usecase", async () => {
  vi.mocked(authUsecases.signUp).mockResolvedValueOnce(undefined);
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
  vi.mocked(authUsecases.signIn).mockResolvedValueOnce(undefined);
  vi.mocked(authUsecases.getCurrentUser).mockResolvedValueOnce(mockUser);

    const result = await authService.login("user@test.com", "pass123");

    expect(authUsecases.signIn).toHaveBeenCalledWith({ email: "user@test.com", password: "pass123" });
    expect(authUsecases.getCurrentUser).toHaveBeenCalled();
    expect(result).toEqual({ id: "1", email: "user@test.com", name: "User" });
  });

  it("getMe should call getCurrentUser", async () => {
  vi.mocked(authUsecases.getCurrentUser).mockResolvedValueOnce(mockUser);
    const user = await authService.getMe();

    expect(authUsecases.getCurrentUser).toHaveBeenCalled();
  expect(user).toEqual({ id: mockUser.id, email: mockUser.email, name: mockUser.name, createdAt: mockUser.createdAt });
  });

  it("logout should call signOut", async () => {
  vi.mocked(authUsecases.signOut).mockResolvedValueOnce(undefined);
    await authService.logout();
    expect(authUsecases.signOut).toHaveBeenCalled();
  });
});
