import { z } from "zod";

export const createBookingSchema = z
  .object({
    roomId: z.uuid(),
    firstName: z.string().trim().min(1).max(100),
    lastName: z.string().trim().min(1).max(100),
    email: z.email(),
    phoneNumber: z.string().trim().min(1).max(20),
    fayda: z.string().max(50).optional(),
    checkInDate: z.iso.date(),
    checkOutDate: z.iso.date(),
    numberOfGuests: z.number().int().positive(),
    specialRequests: z.string().max(2000).optional(),
  })
  .refine((booking) => booking.checkOutDate > booking.checkInDate, {
    path: ["checkOutDate"],
    message: "check-out must be after check-in",
  });

export const requestOtpSchema = z.object({ email: z.email() });

export const confirmBookingSchema = z.object({
  otp: z
    .string()
    .length(6)
    .regex(/^\d{6}$/),
  quotedTotal: z.string().regex(/^\d+\.\d{2}$/),
  booking: createBookingSchema,
});

export const updateBookingSchema = z.object({
  status: z.enum(["pending", "confirmed", "cancelled", "in_house", "departed"]),
});

export const bookingIdSchema = z.object({ id: z.uuid() });
