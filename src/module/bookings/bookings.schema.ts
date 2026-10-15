import z from "zod";

 export const createBookingSchema = z.object({
    roomId: z.uuid(),
    firstName: z.string().max(100),
    lastName: z.string().max(100),
    email: z.email(),
    phoneNumber: z.e164(),
    fayda: z.string().max(50),
    checkInDate: z.date(),
    checkOutDate: z.date(),
    numberOfGuest: z.int(),
    specialRequest: z.string().optional(),
    totalAmount: z.number(),
    status: z.literal(['pending','confirmed','cancelled'])
 })
export const getBookingByPhoneSchema = z.object({
    phoneNumber: z.e164()
})
export const updateBookingFaydaSchema = z.object({
    phoneNumber: z.e164(),
    fayda: z.string().max(50)
})