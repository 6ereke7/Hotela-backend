import { z } from "zod";

export const monthlyRevenueQuerySchema = z.object({
  month: z.coerce.number().int().min(1).max(12),
  year: z.coerce.number().int().min(1970),
});

export const yearlyRevenueQuerySchema = z.object({
  year: z.coerce.number().int().min(1970),
});
