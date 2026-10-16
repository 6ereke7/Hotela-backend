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
            roomNumber: "103",
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
            roomNumber: "104",
            type: "Deluxe",
            price: "159.00",
            capacity: 2,
            bedType: "King",
            floor: 1,
            amenities: ["Wi-Fi", "Air conditioning", "TV", "Mini bar"],
            images: [],
            isActive: true,
        },
        {
            roomNumber: "105",
            type: "Accessible",
            price: "119.00",
            capacity: 2,
            bedType: "Queen",
            floor: 1,
            amenities: ["Wi-Fi", "Air conditioning", "TV", "Accessible bathroom"],
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
        {
            roomNumber: "202",
            type: "Deluxe",
            price: "159.00",
            capacity: 2,
            bedType: "King",
            floor: 2,
            amenities: ["Wi-Fi", "Air conditioning", "TV", "Mini bar"],
            images: [],
            isActive: true,
        },
        {
            roomNumber: "203",
            type: "Family",
            price: "209.00",
            capacity: 4,
            bedType: "Two Queen",
            floor: 2,
            amenities: ["Wi-Fi", "Air conditioning", "TV", "Mini bar"],
            images: [],
            isActive: true,
        },
        {
            roomNumber: "204",
            type: "Suite",
            price: "269.00",
            capacity: 3,
            bedType: "King",
            floor: 2,
            amenities: ["Wi-Fi", "Air conditioning", "TV", "Mini bar", "Living area"],
            images: [],
            isActive: true,
        },
        {
            roomNumber: "301",
            type: "Suite",
            price: "289.00",
            capacity: 3,
            bedType: "King",
            floor: 3,
            amenities: ["Wi-Fi", "Air conditioning", "TV", "Mini bar", "Balcony"],
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
    }
    const existing = await db
    .select()
    .from(staff)
    .where(eq(staff.email, staffData.email))
    if (existing.length > 0) {
        console.log("Admin user already exists. Skipping seeding.")
    } else {
        const plainPassword = process.env.ADMIN_SEED_PASSWORD
        if (!plainPassword) {
            throw new Error("ADMIN_SEED_PASSWORD must be set to seed the admin account.")
        }
        const passwordHash = await bcrypt.hash(plainPassword, 10)
        await db
            .insert(staff)
            .values({
                firstName: staffData.firstName,
                lastName: staffData.lastName,
                email: staffData.email,
                phoneNumber: staffData.phoneNumber,
                role: staffData.role,
                passwordHash
            })
        console.log("Admin user seeded")
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
    process.exitCode = 1
})