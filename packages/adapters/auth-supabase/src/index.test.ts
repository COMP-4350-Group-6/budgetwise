import { describe, it, expect, vi, beforeEach } from "vitest";

// Create a shared mock for the Supabase auth client methods
const mockAuth = {
  signUp: vi.fn(),
  signInWithPassword: vi.fn(),
  signOut: vi.fn(),
  getUser: vi.fn(),
};

// Mock the supabase-js createClient to return the above mock
vi.mock("@supabase/supabase-js", () => {
  return {
    createClient: vi.fn(() => ({ auth: mockAuth })),
  };
});

import { makeSupabaseAuthClient } from "./index";

const DUMMY_URL = "https://example.supabase.co";
const DUMMY_KEY = "anon-key";

describe("makeSupabaseAuthClient", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("getMe maps Supabase user to domain shape", async () => {
    const createdAt = "2025-01-01T00:00:00.000Z";
    mockAuth.getUser.mockResolvedValueOnce({
      data: {
        user: {
          id: "user-1",
          email: "test@example.com",
          user_metadata: { name: "Test User", defaultCurrency: "CAD" },
          created_at: createdAt,
        },
      },
      error: null,
    });

    const client = makeSupabaseAuthClient({ supabaseUrl: DUMMY_URL, supabaseAnonKey: DUMMY_KEY });
    const me = await client.getMe();

    expect(me).toEqual({
      id: "user-1",
      email: "test@example.com",
      name: "Test User",
      defaultCurrency: "CAD",
      createdAt,
    });
  });

  it("getMe returns null when no user is authenticated", async () => {
    mockAuth.getUser.mockResolvedValueOnce({ data: { user: null }, error: null });

    const client = makeSupabaseAuthClient({ supabaseUrl: DUMMY_URL, supabaseAnonKey: DUMMY_KEY });
    const me = await client.getMe();

    expect(me).toBeNull();
  });

  it("signup forwards metadata and throws on Supabase error", async () => {
    // First, successful call to check argument forwarding
    mockAuth.signUp.mockResolvedValueOnce({ data: {}, error: null });

    const client = makeSupabaseAuthClient({ supabaseUrl: DUMMY_URL, supabaseAnonKey: DUMMY_KEY });
    await client.signup({
      email: "new@example.com",
      password: "password123",
      name: "New User",
      defaultCurrency: "USD",
    });

    expect(mockAuth.signUp).toHaveBeenCalledTimes(1);
    expect(mockAuth.signUp).toHaveBeenCalledWith({
      email: "new@example.com",
      password: "password123",
      options: { data: { name: "New User", defaultCurrency: "USD" } },
    });

    // Then, error path
    const supaErr = new Error("Signup failed");
    mockAuth.signUp.mockResolvedValueOnce({ data: null, error: supaErr });
    await expect(
      client.signup({ email: "e@e.com", password: "x", name: "N", defaultCurrency: "CAD" })
    ).rejects.toBe(supaErr);
  });
});


