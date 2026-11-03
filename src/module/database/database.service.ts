import { randomBytes, randomInt, randomUUID } from "node:crypto";
import bcrypt from "bcryptjs";
import { db } from "../../db/index.ts";
import { bookings, otp, rooms, staff } from "../../db/schema.ts";

const managerEmail = "manager@hotela.com";
const roomTypes = [
  { type: "Standard", bedType: "Queen", capacity: 2, basePrice: 8900 },
  { type: "Deluxe", bedType: "King", capacity: 2, basePrice: 14900 },
  { type: "Family", bedType: "Two Queen", capacity: 4, basePrice: 19900 },
  { type: "Suite", bedType: "King", capacity: 3, basePrice: 26900 },
] as const;
const firstNames = ["Alex", "Jordan", "Taylor", "Morgan", "Riley", "Casey"];
const lastNames = ["Smith", "Johnson", "Brown", "Davis", "Wilson", "Garcia"];
const bookingStatuses = [
  "pending",
  "confirmed",
  "cancelled",
  "in_house",
  "departed",
] as const;
const amenities = [
  "Wi-Fi",
  "Air conditioning",
  "TV",
  "Mini bar",
  "Balcony",
  "Accessible bathroom",
];
const roomImages = [
  "https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=1200&q=85",
  "https://images.unsplash.com/photo-1591088398332-8a7791972843?auto=format&fit=crop&w=1200&q=85",
  "https://images.unsplash.com/photo-1611892440504-42a792e24d32?auto=format&fit=crop&w=1200&q=85",
  "https://images.unsplash.com/photo-1566665797739-1674de7a421a?auto=format&fit=crop&w=1200&q=85",
];

const randomItem = <T>(items: readonly T[]): T => {
  const item = items[randomInt(items.length)];
  if (item === undefined) {
    throw new Error("Cannot select a random item from an empty list");
  }
  return item;
};

const dateOffset = (days: number): string => {
  const date = new Date();
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().slice(0, 10);
};

export function createRandomStartingContent() {
  const roomsToInsert = Array.from(
    { length: randomInt(10, 15) },
    (_, index) => {
      const roomType = randomItem(roomTypes);
      const roomId = randomUUID();
      const floor = Math.floor(index / 4) + 1;
      const roomNumber = `${floor}${String((index % 4) + 1).padStart(2, "0")}`;
      const priceInCents = roomType.basePrice + randomInt(-1500, 6001);

      return {
        id: roomId,
        roomNumber,
        type: roomType.type,
        pricePerNight: (priceInCents / 100).toFixed(2),
        capacity: roomType.capacity,
        bedType: roomType.bedType,
        floor,
        amenities: [...new Set([randomItem(amenities), randomItem(amenities)])],
        images: [randomItem(roomImages)],
        isActive: true,
        status: randomInt(5) === 0 ? "maintenance" : "available",
      };
    },
  );

  const bookingsToInsert = Array.from(
    { length: randomInt(10, 21) },
    (_, index) => {
      const room = randomItem(roomsToInsert);
      const checkInOffset = randomInt(-45, 46);
      const nights = randomInt(1, 8);
      const checkInDate = dateOffset(checkInOffset);
      const checkOutDate = dateOffset(checkInOffset + nights);
      const firstName = randomItem(firstNames);
      const lastName = randomItem(lastNames);
      const email = `guest-${index + 1}@example.test`;
      const totalAmount = (Number(room.pricePerNight) * nights).toFixed(2);

      return {
        roomId: room.id,
        firstName,
        lastName,
        email,
        phoneNumber: `+1555${String(randomInt(0, 10_000_000)).padStart(7, "0")}`,
        fayda: null,
        checkInDate,
        checkOutDate,
        numberOfGuests: randomInt(1, room.capacity + 1),
        specialRequests: null,
        totalAmount,
        status: randomItem(bookingStatuses),
      };
    },
  );

  const otpRecordsToInsert = bookingsToInsert.map((booking) => ({
    email: booking.email,
    otp: String(randomInt(0, 1_000_000)).padStart(6, "0"),
    expiresAt: new Date(Date.now() - randomInt(1, 86_400_000)),
    isUsed: true,
  }));

  return { roomsToInsert, bookingsToInsert, otpRecordsToInsert };
}

export async function resetDatabase() {
  const managerPassword = "password";
  const passwordHash = await bcrypt.hash(managerPassword, 12);
  const startingContent = createRandomStartingContent();

  await db.transaction(async (tx) => {
    await tx.delete(bookings);
    await tx.delete(otp);
    await tx.delete(rooms);
    await tx.delete(staff);

    await tx.insert(rooms).values(startingContent.roomsToInsert);
    await tx.insert(staff).values({
      firstName: "Hotel",
      lastName: "Manager",
      email: managerEmail,
      phoneNumber: `+1555${String(randomInt(0, 10_000_000)).padStart(7, "0")}`,
      role: "admin",
      passwordHash,
    });
    await tx.insert(bookings).values(startingContent.bookingsToInsert);
    await tx.insert(otp).values(startingContent.otpRecordsToInsert);
  });

  return {
    manager: { email: managerEmail, password: managerPassword },
    roomsCreated: startingContent.roomsToInsert.length,
    bookingsCreated: startingContent.bookingsToInsert.length,
    otpRecordsCreated: startingContent.otpRecordsToInsert.length,
  };
}
