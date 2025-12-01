import { Context, Next } from "hono";
import { HTTPException } from "hono/http-exception";
import {
  createRemoteJWKSet,
  decodeProtectedHeader,
  jwtVerify,
  JWTPayload,
} from "jose";

type Env = {
  SUPABASE_URL?: string;
  SUPABASE_JWKS_URL?: string;
  SUPABASE_LOCAL_JWT_SECRET?: string; // local-only HS256 fallback
};

function deriveJwksUrl(env: Env): string {
  if (env.SUPABASE_JWKS_URL) return env.SUPABASE_JWKS_URL;
  if (env.SUPABASE_URL) {
    const base = env.SUPABASE_URL.replace(/\/+$/, "");
    return `${base}/auth/v1/.well-known/jwks.json`;
  }
  throw new Error("Missing SUPABASE_URL or SUPABASE_JWKS_URL");
}

function expectedIssuer(env: Env): string | undefined {
  if (!env.SUPABASE_URL) return undefined;
  return `${env.SUPABASE_URL.replace(/\/+$/, "")}/auth/v1`;
}

async function verifySupabaseToken(token: string, env: Env): Promise<JWTPayload> {
  const { alg } = decodeProtectedHeader(token);

  // Primary: ES256 via JWKS (cloud)
  if (alg === "ES256") {
    const jwksUrl = deriveJwksUrl(env);
    try {
      const jwks = createRemoteJWKSet(new URL(jwksUrl));
      const { payload } = await jwtVerify(token, jwks, {
        algorithms: ["ES256"],
        ...(expectedIssuer(env) ? { issuer: expectedIssuer(env) } : {}),
      });
      return payload;
    } catch (jwksError) {
      console.error("JWKS verification failed:", jwksError);
      throw jwksError;
    }
  }

  // Optional fallback: HS256 for local CLI tokens
  if (alg === "HS256" && env.SUPABASE_LOCAL_JWT_SECRET) {
    const secret = new TextEncoder().encode(env.SUPABASE_LOCAL_JWT_SECRET);
    const { payload } = await jwtVerify(token, secret, { algorithms: ["HS256"] });
    return payload;
  }

  throw new Error(
    `Unsupported token alg "${alg}". Expected ES256${
      env.SUPABASE_LOCAL_JWT_SECRET ? " or HS256 (local)" : ""
    }.`
  );
}

export async function authMiddleware(c: Context, next: Next) {
  const auth = c.req.header("Authorization");
  if (!auth?.startsWith("Bearer ")) {
    throw new HTTPException(401, { message: "Unauthorized" });
  }

  const token = auth.slice("Bearer ".length).trim();

  try {
    const payload = await verifySupabaseToken(token, {
      SUPABASE_URL: c.env?.SUPABASE_URL as string | undefined,
      SUPABASE_JWKS_URL: c.env?.SUPABASE_JWKS_URL as string | undefined,
      SUPABASE_LOCAL_JWT_SECRET: c.env?.SUPABASE_LOCAL_JWT_SECRET as string | undefined,
    });


    const userId = (payload.sub as string) || "";
    if (!userId) throw new Error("Missing sub claim");

    // Optionally grab more claims:
    // const role = payload.role as string | undefined;
    // const email = payload.email as string | undefined;

    c.set("userId", userId);
    await next();
  } catch (err) {
    
    console.error("Token verification failed:", err);
    throw new HTTPException(401, { message: "Invalid token" ,cause: err});
  }
}
