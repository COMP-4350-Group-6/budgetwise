import { Context, Next } from "hono";
import { HTTPException } from "hono/http-exception";
import { createRemoteJWKSet, jwtVerify, JWTPayload } from "jose";

function deriveJwksUrl(supabaseUrl: string): string {
  const base = supabaseUrl.replace(/\/+$/, "");
  return `${base}/auth/v1/.well-known/jwks.json`;
}

async function verifySupabaseToken(token: string, supabaseUrl: string): Promise<JWTPayload> {
  const jwksUrl = deriveJwksUrl(supabaseUrl);
  const jwks = createRemoteJWKSet(new URL(jwksUrl));
  const { payload } = await jwtVerify(token, jwks, { algorithms: ["ES256"] });
  return payload;
}

export async function authMiddleware(c: Context, next: Next) {
  const auth = c.req.header("Authorization");
  if (!auth?.startsWith("Bearer ")) {
    throw new HTTPException(401, { message: "Unauthorized" });
  }

  const token = auth.slice("Bearer ".length).trim();
  const supabaseUrl = c.env?.SUPABASE_URL as string;
  
  if (!supabaseUrl) {
    throw new HTTPException(500, { message: "SUPABASE_URL not configured" });
  }

  try {
    const payload = await verifySupabaseToken(token, supabaseUrl);
    const userId = (payload.sub as string) || "";
    if (!userId) throw new Error("Missing sub claim");

    c.set("userId", userId);
    await next();
  } catch (err) {
    console.error("Token verification failed:", err);
    throw new HTTPException(401, { message: "Invalid token", cause: err });
  }
}
