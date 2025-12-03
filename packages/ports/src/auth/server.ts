import type { AuthResult } from '@budget/schemas';

/**
 * JWT verification port for middleware.
 * Minimal interface for verifying tokens in API routes.
 */
export interface TokenVerifierPort {
  verify(token: string): Promise<AuthResult<{ 
    userId: string; 
    email: string;
    expiresAt: number;
  }>>;
  
  decode(token: string): { userId: string; email: string } | null;
}