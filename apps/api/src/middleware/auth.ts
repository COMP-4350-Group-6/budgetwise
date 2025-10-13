import { Context, Next } from "hono";
import { HTTPException } from "hono/http-exception";

export async function authMiddleware(c: Context, next: Next) {
  const authHeader = c.req.header("Authorization");
  
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    throw new HTTPException(401, { message: "Unauthorized" });
  }
  
  const token = authHeader.substring(7);
  
  // TODO: Verify JWT token
  // const verifyTokenUseCase = container.getVerifyTokenUseCase();
  // const payload = await verifyTokenUseCase.execute(token);
  
  // Mock for now
  const userId = "user-123";
  
  c.set("userId", userId);
  await next();
}