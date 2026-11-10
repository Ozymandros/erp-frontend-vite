import { z } from "zod";

export const CreateUpdateCurrencySchema = z.object({
  code: z.string().length(3, "Code must be 3 characters"),
  description: z.string().min(1).max(100),
  symbol: z.string().max(5).optional(),
});

export const CreateExchangeRateSchema = z.object({
  startingDate: z.string().min(1),
  rateToLocal: z.coerce.number().positive(),
});

export type CreateUpdateCurrencyFormData = z.infer<
  typeof CreateUpdateCurrencySchema
>;
export type CreateExchangeRateFormData = z.infer<
  typeof CreateExchangeRateSchema
>;
