import { eq } from 'drizzle-orm'
import { db } from '../../db/index.ts'
import { rooms, bookings } from '../../db/schema.ts'
 
export const getAllRooms = async () => {
    return await db
        .select()
        .from(rooms)
        .where(eq(rooms.isActive, true))
}
export const getRoomById = async (id: string) => {
    const result = await db
        .select()
        .from(rooms)
        .where(eq(rooms.id, id))
    return result[0] || null
}
export const createRoom = async (data: typeof rooms.$inferInsert) => {
    const [newRoom] = await db
        .insert(rooms)
        .values(data)
        .returning()

    return newRoom
}

export const updateRoom = async (id: string, data: Partial<typeof rooms.$inferInsert>) => {
    const [updatedRoom] = await db
        .update(rooms)
        .set(data)
        .where(
            eq(rooms.id, id)
        )
        .returning()

    return updatedRoom || null
}
export const removeRoom = async (id: string) => {
    const [removedRoom] = await db
        .delete(rooms)
        .where(
            eq(rooms.id, id)
        )
        .returning()
    return !!removedRoom
}