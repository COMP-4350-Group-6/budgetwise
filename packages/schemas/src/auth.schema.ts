import { z } from "zod";
import { CurrencySchema } from "./currency.schema";

export const LoginInput = z.object({
  email: z.email(),
  password: z.string().min(8),
});

export const SignupInput = z.object({
  email: z.email(),
  password: z.string().min(8),
  name: z.string().min(1),
  defaultCurrency: CurrencySchema.default('USD'),
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