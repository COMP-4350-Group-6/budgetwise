import { describe, it, expect, vi, beforeEach } from "vitest";

// Create a shared mock for the Supabase auth client methods
const mockAuth = {
  signUp: vi.fn(),
  signInWithPassword: vi.fn(),
  signOut: vi.fn(),
  getUser: vi.fn(),
  getSession: vi.fn(),
};

// Mock the supabase-js createClient to return the above mock
vi.mock("@supabase/supabase-js", () => {
  return {
    createClient: vi.fn(() => ({ auth: mockAuth })),
  };
});

import { makeSupabaseAuthProvider } from "./index";

const DUMMY_URL = "https://example.supabase.co";
const DUMMY_KEY = "anon-key";

describe("makeSupabaseAuthProvider", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("getSession maps Supabase session to domain shape", async () => {
    const createdAt = "2025-01-01T00:00:00.000Z";
    mockAuth.getSession.mockResolvedValueOnce({
      data: {
        session: {
          user: {
            id: "user-1",
            email: "test@example.com",
            user_metadata: { name: "Test User", defaultCurrency: "CAD" },
            created_at: createdAt,
          },
          access_token: "access-token",
          refresh_token: "refresh-token",
          expires_at: 1234567890,
        },
      },
      error: null,
    });

    const client = makeSupabaseAuthProvider({ supabaseUrl: DUMMY_URL, supabaseAnonKey: DUMMY_KEY });
    const session = await client.getSession();

    expect(session).toEqual({
      user: {
        id: "user-1",
        email: "test@example.com",
        name: "Test User",
        defaultCurrency: "CAD",
        createdAt,
      },
      tokens: {
        accessToken: "access-token",
        refreshToken: "refresh-token",
        expiresAt: 1234567890000,
      },
    });
  });

  it("getSession returns null when no session", async () => {
    mockAuth.getSession.mockResolvedValueOnce({ data: { session: null }, error: null });

    const client = makeSupabaseAuthProvider({ supabaseUrl: DUMMY_URL, supabaseAnonKey: DUMMY_KEY });
    const session = await client.getSession();

    expect(session).toBeNull();
  });

  it("signup forwards metadata and returns error result on Supabase error", async () => {
    // First, successful call to check argument forwarding
    mockAuth.signUp.mockResolvedValueOnce({ 
      data: { 
        user: {
          id: "user-1",
          email: "new@example.com",
          user_metadata: { name: "New User", defaultCurrency: "USD" },
          created_at: "2025-01-01T00:00:00.000Z",
        },
        session: {
          access_token: "token",
          refresh_token: "refresh",
        },
      }, 
      error: null 
    });

    const client = makeSupabaseAuthProvider({ supabaseUrl: DUMMY_URL, supabaseAnonKey: DUMMY_KEY });
    const result = await client.signup({
      email: "new@example.com",
      password: "password123",
      name: "New User",
      defaultCurrency: "USD",
    });

    expect(result.success).toBe(true);
    expect(mockAuth.signUp).toHaveBeenCalledTimes(1);
    expect(mockAuth.signUp).toHaveBeenCalledWith({
      email: "new@example.com",
      password: "password123",
      options: { data: { name: "New User", defaultCurrency: "USD" } },
    });

    // Then, error path
    const supaErr = { message: "Signup failed" };
    mockAuth.signUp.mockResolvedValueOnce({ data: null, error: supaErr });
    const errorResult = await client.signup({ 
      email: "e@e.com", 
      password: "x", 
      name: "N", 
      defaultCurrency: "CAD" 
    });
    
    expect(errorResult.success).toBe(false);
    expect(errorResult.error).toBeDefined();
  });

  it("login returns session on success", async () => {
    mockAuth.signInWithPassword.mockResolvedValueOnce({
      data: {
        user: {
          id: "user-1",
          email: "test@example.com",
          user_metadata: { name: "Test User", defaultCurrency: "CAD" },
          created_at: "2025-01-01T00:00:00.000Z",
        },
        session: {
          access_token: "access-token",
          refresh_token: "refresh-token",
        },
      },
      error: null,
    });

    const client = makeSupabaseAuthProvider({ supabaseUrl: DUMMY_URL, supabaseAnonKey: DUMMY_KEY });
    const result = await client.login({ email: "test@example.com", password: "password" });

    expect(result.success).toBe(true);
    expect(result.data?.user.email).toBe("test@example.com");
  });

  it("login returns error on invalid credentials", async () => {
    mockAuth.signInWithPassword.mockResolvedValueOnce({
      data: { user: null, session: null },
      error: { message: "Invalid login credentials" },
    });

    const client = makeSupabaseAuthProvider({ supabaseUrl: DUMMY_URL, supabaseAnonKey: DUMMY_KEY });
    const result = await client.login({ email: "test@example.com", password: "wrong" });

    expect(result.success).toBe(false);
    expect(result.error?.code).toBe("INVALID_CREDENTIALS");
  });
});


