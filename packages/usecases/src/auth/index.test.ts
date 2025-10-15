import { describe, it, expect, vi } from "vitest";
import { makeAuthClientUsecases } from "./index";

describe("auth usecases delegation", () => {
  it("delegates to port methods with same inputs", async () => {
    const authPort = {
      signup: vi.fn(async () => {}),
      login: vi.fn(async () => {}),
      logout: vi.fn(async () => {}),
      refreshToken: vi.fn(async () => {}),
      getMe: vi.fn(async () => ({ id: "id", email: "e", name: "n", defaultCurrency: "USD", createdAt: "t" })),
    };

    const u = makeAuthClientUsecases({ auth: authPort });

    const signupInput = { email: "e", password: "p", name: "n", defaultCurrency: "USD" };
    await u.signUp(signupInput);
    expect(authPort.signup).toHaveBeenCalledWith(signupInput);

    const loginInput = { email: "e", password: "p" };
    await u.signIn(loginInput);
    expect(authPort.login).toHaveBeenCalledWith(loginInput);

    await u.signOut();
    expect(authPort.logout).toHaveBeenCalled();

    const me = await u.getCurrentUser();
    expect(me?.email).toBe("e");
    expect(authPort.getMe).toHaveBeenCalled();
  });
});


