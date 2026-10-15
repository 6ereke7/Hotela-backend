import { boolean, date, integer, numeric, pgTable, text, timestamp, uuid, varchar } from "drizzle-orm/pg-core";

export const rooms = pgTable("rooms", {
    id: uuid('id').primaryKey().defaultRandom(),
    roomNumber: varchar('room_number', { length: 10 }).notNull().unique(),
    type: varchar('type', { length: 50 }).notNull(),
    price: numeric('price', { precision:10 , scale: 2 }).notNull(),
    capacity: integer('capacity').notNull(),
    bedType: varchar('bed_type', { length: 50 }).notNull(),
    floor: integer('floor').notNull(),
    amenities: text('amenities').array(),
    images: text('images').array(),
    isActive: boolean('is_active').notNull().default(true),
})
 export const bookings = pgTable("bookings", {
    id: uuid('id').primaryKey().defaultRandom(),
    roomId: uuid('room_id').notNull().references(() => rooms.id),
    firstName: varchar('first_name', { length: 100 }).notNull(),
    lastName: varchar('last_name', { length: 100 }).notNull(),
    email: varchar('email', { length: 255 }).notNull(),
    phoneNumber: varchar('phone_number', { length: 20 }).notNull(),
    fayda: varchar('fayda', { length: 50 }),
    checkInDate: date('check_in_date').notNull(),
    checkOutDate: date('check_out_date').notNull(),
    numberOfGuests: integer('number_of_guests').notNull(),
    specialRequests: text('special_requests'),
    totalAmount: numeric('total_amount', { precision: 10, scale: 2 }).notNull(),
    status: varchar('status', { length: 50 }).notNull().default('pending'),
    createdAt: timestamp('created_at').notNull().defaultNow(),
 })
 
 export const otp = pgTable("otp", {
    id: uuid('id').primaryKey().defaultRandom(),
    email: varchar('email', { length: 255 }).notNull(),
    otp: varchar('otp', { length: 6 }).notNull(),
    expiresAt: timestamp('expires_at').notNull(),
    isUsed: boolean('is_used').notNull().default(false),
 });

 export const staff = pgTable("staff", {
    id: uuid('id').primaryKey().defaultRandom(),
    firstName: varchar('first_name', { length: 100 }).notNull(),
    lastName: varchar('last_name', { length: 100 }).notNull(),
    email: varchar('email', { length: 255 }).notNull().unique(),
    phoneNumber: varchar('phone_number', { length: 20 }).notNull().unique(),
    role: varchar('role', { length: 50 }).notNull(),
    passwordHash: text('password_hash').notNull(),
    createdAt: timestamp('created_at').notNull().defaultNow(),
 });