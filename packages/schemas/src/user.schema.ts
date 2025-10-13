import { z } from "zod";
import { CurrencySchema } from "./currency.schema";

export const UserDTO = z.object({
  id: z.ulid(),
  email: z.email(),
  name: z.string().min(1),
  defaultCurrency: CurrencySchema.default("USD"),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
});

export type UserDTO = z.infer<typeof UserDTO>;