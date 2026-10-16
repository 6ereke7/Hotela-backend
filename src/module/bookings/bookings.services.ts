import { and, eq, gt, lt, ne } from "drizzle-orm";
import { randomInt } from "node:crypto";
import { db } from "../../db/index.ts";
import { bookings, otp, rooms } from "../../db/schema.ts";

export const createBooking = async (data: typeof bookings.$inferInsert) => {
  const [newBooking] = await db.insert(bookings).values(data).returning();
  return newBooking;
};

export const getAllBookings = async () => {
  return await db.select().from(bookings);
};

export const requestBookingOtp = async (email: string) => {
  const code = String(randomInt(0, 1_000_000)).padStart(6, "0");
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000);
  await db.transaction(async (tx) => {
    await tx
      .update(otp)
      .set({ isUsed: true })
      .where(and(eq(otp.email, email), eq(otp.isUsed, false)));
    await tx.insert(otp).values({ email, otp: code, expiresAt });
  });
  return { code, expiresAt };
};

type BookingInput = Omit<
  typeof bookings.$inferInsert,
  "id" | "createdAt" | "status" | "totalAmount"
>;

export const confirmBooking = async (
  email: string,
  code: string,
  booking: BookingInput,
  quotedTotal: string,
) => {
  return db.transaction(async (tx) => {
    const [validOtp] = await tx
      .select({ id: otp.id })
      .from(otp)
      .where(
        and(
          eq(otp.email, email),
          eq(otp.otp, code),
          eq(otp.isUsed, false),
          gt(otp.expiresAt, new Date()),
        ),
      )
      .limit(1);

    if (!validOtp) return { kind: "invalid" as const };

    const [room] = await tx
      .select({ price: rooms.price, capacity: rooms.capacity })
      .from(rooms)
      .where(and(eq(rooms.id, booking.roomId), eq(rooms.isActive, true)))
      .limit(1)
      .for("update");
    if (!room || booking.numberOfGuests > room.capacity) {
      return { kind: "invalid" as const };
    }

    const overlappingBookings = await tx
      .select({ id: bookings.id })
      .from(bookings)
      .where(
        and(
          eq(bookings.roomId, booking.roomId),
          lt(bookings.checkInDate, booking.checkOutDate),
          gt(bookings.checkOutDate, booking.checkInDate),
          ne(bookings.status, "cancelled"),
        ),
      )
      .limit(1);
    if (overlappingBookings.length) return { kind: "invalid" as const };

    const nights =
      (Date.parse(`${booking.checkOutDate}T00:00:00Z`) -
        Date.parse(`${booking.checkInDate}T00:00:00Z`)) /
      86_400_000;
    const nightlyRate = Number(room.price).toFixed(2);
    const totalAmount = (Number(nightlyRate) * nights).toFixed(2);
    if (quotedTotal !== totalAmount) {
      return { kind: "price_changed" as const, nightlyRate, totalAmount };
    }

    const [claimedOtp] = await tx
      .update(otp)
      .set({ isUsed: true })
      .where(and(eq(otp.id, validOtp.id), eq(otp.isUsed, false)))
      .returning({ id: otp.id });
    if (!claimedOtp) return { kind: "invalid" as const };

    const [newBooking] = await tx
      .insert(bookings)
      .values({
        ...booking,
        totalAmount,
        status: "confirmed",
      })
      .returning();
    return { kind: "confirmed" as const, booking: newBooking };
  });
};

export const updateBooking = async (id: string, status: string) => {
  const [updatedBooking] = await db
    .update(bookings)
    .set({ status })
    .where(eq(bookings.id, id))
    .returning();
  return updatedBooking ?? null;
};

export const deleteBooking = async (id: string) => {
  const [deletedBooking] = await db
    .delete(bookings)
    .where(eq(bookings.id, id))
    .returning();
  return deletedBooking ?? null;
};
