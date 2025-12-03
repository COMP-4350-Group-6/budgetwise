import { describe, it, expect, vi, beforeEach } from "vitest";
import { makeSupabaseTokenVerifier } from "./token-verifier";
import { jwtVerify, decodeJwt, createRemoteJWKSet } from "jose";

// Mock jose library
vi.mock("jose", () => ({
  createRemoteJWKSet: vi.fn(() => vi.fn()),
  jwtVerify: vi.fn(),
  decodeJwt: vi.fn(),
}));

describe("Supabase Token Verifier", () => {
  const mockSupabaseUrl = "https://test.supabase.co";

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should successfully verify a valid token", async () => {
    const mockPayload = {
      sub: "user-123",
      email: "user@example.com",
      exp: 1640995200, // Some future timestamp
    };

    (jwtVerify as any).mockResolvedValue({ payload: mockPayload });

    const verifier = makeSupabaseTokenVerifier({ supabaseUrl: mockSupabaseUrl });
    const result = await verifier.verify("valid-jwt-token");

    expect(result.success).toBe(true);
    expect(result.data).toEqual({
      userId: "user-123",
      email: "user@example.com",
      expiresAt: 1640995200,
    });

    expect(jwtVerify).toHaveBeenCalledWith("valid-jwt-token", expect.any(Function), {
      algorithms: ["ES256"]
    });
  });

  it("should return error for token without sub claim", async () => {
    const mockPayload = {
      email: "user@example.com",
      exp: 1640995200,
    };

    (jwtVerify as any).mockResolvedValue({ payload: mockPayload });

    const verifier = makeSupabaseTokenVerifier({ supabaseUrl: mockSupabaseUrl });
    const result = await verifier.verify("invalid-jwt-token");

    expect(result.success).toBe(false);
    expect(result.error).toEqual({
      code: "INVALID_TOKEN",
      message: "Missing sub claim",
    });
  });

  it("should return SESSION_EXPIRED for expired tokens", async () => {
    const error = new Error("jwt expired");
    (jwtVerify as any).mockRejectedValue(error);

    const verifier = makeSupabaseTokenVerifier({ supabaseUrl: mockSupabaseUrl });
    const result = await verifier.verify("expired-jwt-token");

    expect(result.success).toBe(false);
    expect(result.error).toEqual({
      code: "SESSION_EXPIRED",
      message: "Token expired",
    });
  });

  it("should return INVALID_TOKEN for other verification errors", async () => {
    const error = new Error("invalid signature");
    (jwtVerify as any).mockRejectedValue(error);

    const verifier = makeSupabaseTokenVerifier({ supabaseUrl: mockSupabaseUrl });
    const result = await verifier.verify("invalid-jwt-token");

    expect(result.success).toBe(false);
    expect(result.error).toEqual({
      code: "INVALID_TOKEN",
      message: "invalid signature",
    });
  });

  it("should handle non-Error exceptions", async () => {
    (jwtVerify as any).mockRejectedValue("string error");

    const verifier = makeSupabaseTokenVerifier({ supabaseUrl: mockSupabaseUrl });
    const result = await verifier.verify("invalid-jwt-token");

    expect(result.success).toBe(false);
    expect(result.error).toEqual({
      code: "INVALID_TOKEN",
      message: "Token verification failed",
    });
  });

  it("should successfully decode a valid token", () => {
    const mockPayload = {
      sub: "user-123",
      email: "user@example.com",
    };

    (decodeJwt as any).mockReturnValue(mockPayload);

    const verifier = makeSupabaseTokenVerifier({ supabaseUrl: mockSupabaseUrl });
    const result = verifier.decode("valid-jwt-token");

    expect(result).toEqual({
      userId: "user-123",
      email: "user@example.com",
    });

    expect(decodeJwt).toHaveBeenCalledWith("valid-jwt-token");
  });

  it("should return null for decode when sub claim is missing", () => {
    const mockPayload = {
      email: "user@example.com",
    };

    (decodeJwt as any).mockReturnValue(mockPayload);

    const verifier = makeSupabaseTokenVerifier({ supabaseUrl: mockSupabaseUrl });
    const result = verifier.decode("invalid-jwt-token");

    expect(result).toBeNull();
  });

  it("should return null for decode when JWT parsing fails", () => {
    (decodeJwt as any).mockImplementation(() => {
      throw new Error("Invalid JWT");
    });

    const verifier = makeSupabaseTokenVerifier({ supabaseUrl: mockSupabaseUrl });
    const result = verifier.decode("invalid-jwt-token");

    expect(result).toBeNull();
  });

  it("should derive correct JWKS URL from Supabase URL", () => {
    makeSupabaseTokenVerifier({ supabaseUrl: "https://test.supabase.co" });

    expect(createRemoteJWKSet).toHaveBeenCalledWith(
      new URL("https://test.supabase.co/auth/v1/.well-known/jwks.json")
    );
  });

  it("should handle Supabase URLs with trailing slashes", () => {
    makeSupabaseTokenVerifier({ supabaseUrl: "https://test.supabase.co/" });

    expect(createRemoteJWKSet).toHaveBeenCalledWith(
      new URL("https://test.supabase.co/auth/v1/.well-known/jwks.json")
    );
  });
});