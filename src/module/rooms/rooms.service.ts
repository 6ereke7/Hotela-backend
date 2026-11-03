import { and, arrayContains, eq, gt, gte, lt, ne } from "drizzle-orm";
import { db } from "../../db/index.ts";
import { bookings, rooms } from "../../db/schema.ts";

export type RoomFilter = {
  id?: string;
  roomNumber?: string;
  type?: string;
  floor?: number;
  bedType?: string;
  amenities?: string[];
  capacity?: number;
  checkIn?: string;
  checkOut?: string;
};

export async function createRoom(
  data: typeof rooms.$inferInsert,
): Promise<typeof rooms.$inferSelect | undefined> {
  try {
    const [newRoom] = await db.insert(rooms).values(data).returning();
    return newRoom;
  } catch (error) {
    throw error;
  }
}

export async function getRoom(
  filter: RoomFilter,
  options: { includeUnavailable?: boolean } = {},
): Promise<(typeof rooms.$inferSelect)[] | null> {
  const conditions = [eq(rooms.isActive, true)];
  if (!options.includeUnavailable) {
    conditions.push(eq(rooms.status, "available"));
  }
  if (filter.id) conditions.push(eq(rooms.id, filter.id));
  if (filter.roomNumber)
    conditions.push(eq(rooms.roomNumber, filter.roomNumber));
  if (filter.type) conditions.push(eq(rooms.type, filter.type));
  if (filter.floor) conditions.push(eq(rooms.floor, filter.floor));
  if (filter.bedType && filter.bedType !== "all")
    conditions.push(eq(rooms.bedType, filter.bedType));
  if (filter.amenities?.length)
    conditions.push(arrayContains(rooms.amenities, filter.amenities));
  if (filter.capacity) conditions.push(gte(rooms.capacity, filter.capacity));
  try {
    const availableRooms = await db
      .select()
      .from(rooms)
      .where(and(...conditions));

    if (!filter.checkIn || !filter.checkOut) return availableRooms;

    const overlappingBookings = await db
      .select({ roomId: bookings.roomId })
      .from(bookings)
      .where(
        and(
          lt(bookings.checkInDate, filter.checkOut),
          gt(bookings.checkOutDate, filter.checkIn),
          ne(bookings.status, "cancelled"),
        ),
      );
    const unavailableRoomIds = new Set(
      overlappingBookings.map(({ roomId }) => roomId),
    );
    return availableRooms.filter((room) => !unavailableRoomIds.has(room.id));
  } catch (error) {
    throw error;
  }
}

export async function getRoomById(
  id: string,
): Promise<typeof rooms.$inferSelect | null> {
  const [room] = await db
    .select()
    .from(rooms)
    .where(
      and(
        eq(rooms.id, id),
        eq(rooms.isActive, true),
        eq(rooms.status, "available"),
      ),
    );
  return room ?? null;
}

export const updateRoom = async (
  id: string,
  data: Partial<typeof rooms.$inferInsert>,
): Promise<typeof rooms.$inferSelect | undefined> => {
  try {
    const [updatedRoom] = await db
      .update(rooms)
      .set(data)
      .where(eq(rooms.id, id))
      .returning();

    return updatedRoom;
  } catch (error) {
    throw error;
  }
};
export const removeRoom = async (id: string): Promise<boolean> => {
  try {
    const [updatedRoom] = await db
      .update(rooms)
      .set({ isActive: false })
      .where(eq(rooms.id, id))
      .returning();
    return !!updatedRoom;
  } catch (error) {
    throw error;
  }
};
