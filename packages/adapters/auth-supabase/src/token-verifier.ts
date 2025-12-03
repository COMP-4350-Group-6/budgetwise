import { createRemoteJWKSet, jwtVerify, decodeJwt } from "jose";
import type { TokenVerifierPort } from "@budget/ports";
import type { AuthResult, AuthErrorCode } from "@budget/schemas";

export type TokenVerifierOptions = {
  supabaseUrl: string;
};

function deriveJwksUrl(supabaseUrl: string): string {
  let base = supabaseUrl;
  while (base.endsWith('/')) {
    base = base.slice(0, -1);
  }
  return `${base}/auth/v1/.well-known/jwks.json`;
}

/**
 * Supabase JWT token verifier implementing TokenVerifierPort.
 * Uses JWKS endpoint to verify tokens.
 */
export function makeSupabaseTokenVerifier(opts: TokenVerifierOptions): TokenVerifierPort {
  const jwksUrl = deriveJwksUrl(opts.supabaseUrl);
  const jwks = createRemoteJWKSet(new URL(jwksUrl));

  return {
    async verify(token: string): Promise<AuthResult<{ userId: string; email: string; expiresAt: number }>> {
      try {
        const { payload } = await jwtVerify(token, jwks, { algorithms: ["ES256"] });
        
        const userId = payload.sub as string;
        const email = payload.email as string;
        const expiresAt = payload.exp as number;

        if (!userId) {
          return {
            success: false,
            error: { code: "INVALID_TOKEN" as AuthErrorCode, message: "Missing sub claim" },
          };
        }

        return {
          success: true,
          data: { userId, email: email || "", expiresAt: expiresAt || 0 },
        };
      } catch (err) {
        const message = err instanceof Error ? err.message : "Token verification failed";
        
        if (message.includes("expired")) {
          return {
            success: false,
            error: { code: "SESSION_EXPIRED" as AuthErrorCode, message: "Token expired" },
          };
        }

        return {
          success: false,
          error: { code: "INVALID_TOKEN" as AuthErrorCode, message },
        };
      }
    },

    decode(token: string): { userId: string; email: string } | null {
      try {
        const payload = decodeJwt(token);
        const userId = payload.sub as string;
        const email = payload.email as string;
        
        if (!userId) return null;
        
        return { userId, email: email || "" };
      } catch {
        return null;
      }
    },
  };
}
