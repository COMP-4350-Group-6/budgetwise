import { z } from "zod";
import { CurrencySchema } from "./currency.schema";

export const MoneySchema = z.object({
  // smallest unit (cents for USD/EUR/GBP/INR, yen units for JPY)
  cents: z.number().int(),
  currency: CurrencySchema.default("USD"),
});

export type MoneyDTO = z.infer<typeof MoneySchema>;