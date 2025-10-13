import { z } from "zod";

export const CurrencySchema = z.enum(['USD', 'EUR', 'GBP', 'JPY', 'INR']);

export type Currency = z.infer<typeof CurrencySchema>;