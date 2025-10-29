import { z } from "zod";
import { CurrencySchema } from "./currency.schema";

export const UserRowSchema = z.object({
  id: z.uuid(),
  email: z.email(),
  name: z.string().min(1),
  default_currency: CurrencySchema.default("USD"),
  created_at: z.coerce.date(),
  updated_at: z.coerce.date(),
});

export const UserDTO = z.object({
  id: z.uuid(),
  email: z.email(),
  name: z.string().min(1),
  defaultCurrency: CurrencySchema.default("USD"),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
});

export type UserRow = z.infer<typeof UserRowSchema>;
export type UserDTO = z.infer<typeof UserDTO>;