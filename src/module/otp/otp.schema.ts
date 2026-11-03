import { z } from "zod";

export const getOtpSchema = z.object({
  email: z.email(),
});
export const verifyOtpSchema = z.object({
  email: z.email(),
  code: z.string().regex(/^\d{6}$/, "verification code must be 6 digits"),
});
