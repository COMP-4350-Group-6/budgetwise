import { Context, Next } from "hono";
import { HTTPException } from "hono/http-exception";
import { createRemoteJWKSet, jwtVerify, JWTPayload } from "jose";

// Verifies Supabase JWT access tokens using the project's JWKS endpoint.
async function verifySupabaseJwt(token: string, projectUrl: string): Promise<JWTPayload> {
  const jwksUrl = new URL("/auth/v1/keys", projectUrl);
  const JWKS = createRemoteJWKSet(jwksUrl);
  const { payload } = await jwtVerify(token, JWKS, {
    issuer: projectUrl,
  });
  return payload;
}

export async function authMiddleware(c: Context, next: Next) {
  const authHeader = c.req.header("Authorization");
  
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    throw new HTTPException(401, { message: "Unauthorized" });
  }
  
  const token = authHeader.substring(7);
  const projectUrl = c.env?.SUPABASE_URL as string | undefined;
  if (!projectUrl) {
    throw new HTTPException(500, { message: "Server auth misconfigured" });
  }

  try {
    const payload = await verifySupabaseJwt(token, projectUrl);
    const userId = (payload.sub as string) || "";
    if (!userId) throw new Error("Missing sub in token");
    c.set("userId", userId);
    await next();
  } catch (err) {
    throw new HTTPException(401, { message: "Invalid token" });
  }
}