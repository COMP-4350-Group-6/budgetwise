import { z } from "zod";
import { CurrencySchema } from "./currency.schema";

// ============================================
// Input Schemas (for form validation)
// ============================================

export const LoginInputSchema = z.object({
  email: z.email(),
  password: z.string().min(8),
});

export const SignupInputSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string()
    .min(12, "Password must be at least 12 characters long")
    .regex(/[a-z]/, "Password must contain at least one lowercase letter")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/\d/, "Password must contain at least one number")
    .regex(/[!@#$%^&*(),.?":{}|<>]/, "Password must contain at least one special character"),
  confirmPassword: z.string(),
  name: z.string().min(1, "Name is required").trim(),
  defaultCurrency: CurrencySchema.default('USD'),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

export const RefreshTokenInputSchema = z.object({
  refreshToken: z.string(),
});

export const ForgotPasswordInputSchema = z.object({
  email: z.string().email(),
});

export const ResetPasswordInputSchema = z.object({
  token: z.string(),
  newPassword: z.string().min(8),
});

// ============================================
// OAuth Types
// ============================================

export const OAuthProviderSchema = z.enum(['google', 'github', 'apple']);

// ============================================
// Domain Types (shared across client/server)
// ============================================

export const AuthUserSchema = z.object({
  id: z.string(),
  email: z.email(),
  name: z.string(),
  defaultCurrency: z.string(),
  createdAt: z.string(),
});

export const AuthTokensSchema = z.object({
  accessToken: z.string(),
  refreshToken: z.string(),
  expiresAt: z.number().optional(),
});

export const AuthSessionSchema = z.object({
  user: AuthUserSchema,
  tokens: AuthTokensSchema,
});

// ============================================
// Error Types
// ============================================

export const AuthErrorCodeSchema = z.enum([
  'INVALID_CREDENTIALS',
  'USER_NOT_FOUND',
  'EMAIL_ALREADY_EXISTS',
  'WEAK_PASSWORD',
  'EMAIL_NOT_CONFIRMED',
  'SESSION_EXPIRED',
  'INVALID_TOKEN',
  'NETWORK_ERROR',
  'UNKNOWN_ERROR',
]);

export const AuthErrorSchema = z.object({
  code: AuthErrorCodeSchema,
  message: z.string(),
  details: z.record(z.string(), z.unknown()).optional(),
});

// ============================================
// Type Exports
// ============================================

// Input types
export type LoginInput = z.infer<typeof LoginInputSchema>;
export type SignupInput = z.infer<typeof SignupInputSchema>;
export type RefreshTokenInput = z.infer<typeof RefreshTokenInputSchema>;
export type ForgotPasswordInput = z.infer<typeof ForgotPasswordInputSchema>;
export type ResetPasswordInput = z.infer<typeof ResetPasswordInputSchema>;

// OAuth types
export type OAuthProvider = z.infer<typeof OAuthProviderSchema>;

// Domain types
export type AuthUser = z.infer<typeof AuthUserSchema>;
export type AuthTokens = z.infer<typeof AuthTokensSchema>;
export type AuthSession = z.infer<typeof AuthSessionSchema>;

// Error types
export type AuthErrorCode = z.infer<typeof AuthErrorCodeSchema>;
export type AuthError = z.infer<typeof AuthErrorSchema>;

// ============================================
// Result Types (generic success/error pattern)
// ============================================

export interface AuthResult<T = void> {
  success: boolean;
  data?: T;
  error?: AuthError;
}

// ============================================
// State Types (for reactive UI)
// ============================================

export type AuthState =
  | { status: 'loading' }
  | { status: 'unauthenticated' }
  | { status: 'authenticated'; session: AuthSession };

export type AuthStateChangeCallback = (state: AuthState) => void;