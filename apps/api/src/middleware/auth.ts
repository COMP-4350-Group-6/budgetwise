import { Context, Next } from "hono";
import { HTTPException } from "hono/http-exception";
import { jwtVerify, JWTPayload, importSPKI, createRemoteJWKSet } from "jose";

// Verifies Supabase JWT access tokens using JWT secret
async function verifySupabaseJwt(token: string, jwtSecret: string): Promise<JWTPayload> {
  // Create a secret key from the JWT secret
  const secret = new TextEncoder().encode(jwtSecret);
  
  const { payload } = await jwtVerify(token, secret, {
    algorithms: ['HS256'],
  });
  
  return payload;
}

export async function authMiddleware(c: Context, next: Next) {
  const authHeader = c.req.header("Authorization");
  
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    console.error("No Authorization header or invalid format");
    throw new HTTPException(401, { message: "Unauthorized" });
  }
  
  const token = authHeader.substring(7);
  const jwtSecret = c.env?.SUPABASE_JWT_SECRET as string | undefined;
  
  console.log("Auth middleware - JWT secret present:", !!jwtSecret);
  console.log("Auth middleware - token prefix:", token.substring(0, 20));
  
  if (!jwtSecret) {
    console.error("SUPABASE_JWT_SECRET not configured");
    throw new HTTPException(500, { message: "Server auth misconfigured" });
  }

  try {
    const payload = await verifySupabaseJwt(token, jwtSecret);
    const userId = (payload.sub as string) || "";
    if (!userId) throw new Error("Missing sub in token");
    console.log("Auth successful for userId:", userId);
    c.set("userId", userId);
    await next();
  } catch (err) {
    console.error("Token verification failed:", err);
    throw new HTTPException(401, { message: "Invalid token" });
  }
}