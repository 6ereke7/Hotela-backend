import { eq } from "drizzle-orm"
import { db } from "../../db/index.ts"
import { bookings } from "../../db/schema.ts"

export const createBooking = async (data: typeof bookings.$inferInsert) => {
    const [newBooking] = await db
        .insert(bookings)
        .values(data)
        .returning()
    return newBooking
}

export const getAllBookings = async () => {
    return await db
        .select()
        .from(bookings)
}
export const getBookingByPhone = async (phoneNumber: string) => {
    const booking = await db
        .select()
        .from(bookings)
        .where(eq(bookings.phoneNumber, phoneNumber))
    return booking
}
export const updateBooking = async (phoneNumber: string, data: Partial<typeof bookings.$inferInsert>) => {
    const [updatedBooking] = await db
        .update(bookings)
        .set(data)
        .where(eq(bookings.phoneNumber, phoneNumber))
        .returning()
    return updatedBooking
}
export const deleteBooking = async (phoneNumber: string) => {
    const [deletedBooking] = await db
        .delete(bookings)
        .where(eq(bookings.phoneNumber, phoneNumber))
        .returning()
    return deletedBooking
}