import { eq } from "drizzle-orm"
import { db } from "./index.ts"
import { rooms, staff } from "./schema.ts"
import bcrypt from "bcryptjs"

async function seed() {
    const roomData = [
        {
            roomNumber: "101",
            type: "Standard",
            price: "89.00",
            capacity: 2,
            bedType: "Queen",
            floor: 1,
            amenities: ["Wi-Fi", "Air conditioning", "TV"],
            images: [],
            isActive: true,
        },
        {
            roomNumber: "102",
            type: "Deluxe",
            price: "149.00",
            capacity: 2,
            bedType: "King",
            floor: 1,
            amenities: ["Wi-Fi", "Air conditioning", "TV", "Mini bar"],
            images: [],
            isActive: true,
        },
        {
            roomNumber: "201",
            type: "Family",
            price: "199.00",
            capacity: 4,
            bedType: "Two Queen",
            floor: 2,
            amenities: ["Wi-Fi", "Air conditioning", "TV", "Mini bar"],
            images: [],
            isActive: true,
        },
    ]

    const staffData = {
        firstName: "Bereket",
        lastName: "tadese",
        email: "6ereke7@gmail.com",
        phoneNumber: "+1234567890",
        role: "admin",
        plainPassword: "123456",
        passwordHash: ''
    }
    const existing =await db
    .select()
    .from(staff)
    .where(eq(staff.email, staffData.email))
    if(existing.length > 0){
        console.log("Admin user already exists. Skipping seeding.")
    } else {
        staffData.passwordHash = await bcrypt.hash(staffData.plainPassword, 10)
        const [newStaff] = await db
            .insert(staff)
            .values({
                firstName: staffData.firstName,
                lastName: staffData.lastName,
                email: staffData.email,
                phoneNumber: staffData.phoneNumber,
                role: staffData.role,
                passwordHash: staffData.passwordHash
            })
            .returning()
        console.log("Admin user seeded:", newStaff)
    }

    const existingRooms = await db
        .select({ roomNumber: rooms.roomNumber })
        .from(rooms)
    const existingRoomNumbers = new Set(existingRooms.map((room) => room.roomNumber))
    const roomsToInsert = roomData.filter((room) => !existingRoomNumbers.has(room.roomNumber))

    if (roomsToInsert.length > 0) {
        await db.insert(rooms).values(roomsToInsert)
        console.log(`${roomsToInsert.length} room(s) seeded.`)
    } else {
        console.log("Rooms already exist. Skipping room seeding.")
    }
}
seed().catch((error) => {
    console.error("Error seeding database:", error)
})