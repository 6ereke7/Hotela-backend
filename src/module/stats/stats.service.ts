import { db } from "../../db/index.ts";
import { bookings, rooms } from "../../db/schema.ts";

export const getBookingRows = async () =>
  db
    .select({
      id: bookings.id,
      roomId: bookings.roomId,
      status: bookings.status,
      totalAmount: bookings.totalAmount,
      createdAt: bookings.createdAt,
      checkInDate: bookings.checkInDate,
      checkOutDate: bookings.checkOutDate,
      numberOfGuests: bookings.numberOfGuests,
    })
    .from(bookings);

export const getRoomRows = async () =>
  db
    .select({
      id: rooms.id,
      roomNumber: rooms.roomNumber,
      type: rooms.type,
      isActive: rooms.isActive,
    })
    .from(rooms);
