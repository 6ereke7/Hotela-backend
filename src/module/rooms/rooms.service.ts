import { and, eq, gt, gte, lt, ne } from "drizzle-orm";
import { db } from "../../db/index.ts";
import { bookings, rooms } from "../../db/schema.ts";

type RoomSearch = {
  checkIn?: string;
  checkOut?: string;
  type?: string;
  capacity?: number;
};

export const getAllRooms = async (search: RoomSearch = {}) => {
  const conditions = [eq(rooms.isActive, true)];
  if (search.capacity) conditions.push(gte(rooms.capacity, search.capacity));
  if (search.type) conditions.push(eq(rooms.type, search.type));

  const availableRooms = await db
    .select()
    .from(rooms)
    .where(and(...conditions));

  if (!search.checkIn || !search.checkOut) return availableRooms;

  const overlappingBookings = await db
    .select({ roomId: bookings.roomId })
    .from(bookings)
    .where(
      and(
        lt(bookings.checkInDate, search.checkOut),
        gt(bookings.checkOutDate, search.checkIn),
        ne(bookings.status, "cancelled"),
      ),
    );
  const unavailableRoomIds = new Set(
    overlappingBookings.map(({ roomId }) => roomId),
  );
  return availableRooms.filter((room) => !unavailableRoomIds.has(room.id));
};
export const getRoomById = async (id: string) => {
  const result = await db
    .select()
    .from(rooms)
    .where(and(eq(rooms.id, id), eq(rooms.isActive, true)));
  return result[0] || null;
};
export const createRoom = async (data: typeof rooms.$inferInsert) => {
  const [newRoom] = await db.insert(rooms).values(data).returning();

  return newRoom;
};

export const updateRoom = async (
  id: string,
  data: Partial<typeof rooms.$inferInsert>,
) => {
  const [updatedRoom] = await db
    .update(rooms)
    .set(data)
    .where(eq(rooms.id, id))
    .returning();

  return updatedRoom || null;
};
export const removeRoom = async (id: string) => {
  const [updatedRoom] = await db
    .update(rooms)
    .set({ isActive: false })
    .where(eq(rooms.id, id))
    .returning();
  return !!updatedRoom;
};
