import { z } from "zod";

export const LoginInput = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

export const SignupInput = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  name: z.string().min(1),
  defaultCurrency: z.enum(['USD', 'EUR', 'GBP', 'JPY', 'INR']).default('USD'),
});

export const RefreshTokenInput = z.object({
  refreshToken: z.string(),
});

export const ForgotPasswordInput = z.object({
  email: z.string().email(),
});

export const ResetPasswordInput = z.object({
  token: z.string(),
  newPassword: z.string().min(8),
});

export type LoginInput = z.infer<typeof LoginInput>;
export type SignupInput = z.infer<typeof SignupInput>;
export type RefreshTokenInput = z.infer<typeof RefreshTokenInput>;
export type ForgotPasswordInput = z.infer<typeof ForgotPasswordInput>;
export type ResetPasswordInput = z.infer<typeof ResetPasswordInput>;