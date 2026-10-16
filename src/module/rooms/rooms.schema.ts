import { z } from "zod";

export const getRoomsQuerySchema = z
  .object({
    checkIn: z.iso.date().optional(),
    checkOut: z.iso.date().optional(),
    type: z.string().optional(),
    capacity: z.coerce.number().int().positive().optional(),
  })
  .refine(
    (query) =>
      !query.checkIn || !query.checkOut || query.checkOut > query.checkIn,
    {
      path: ["checkOut"],
      message: "check-out must be after check-in",
    },
  );

export const createRoomSchema = z.object({
  roomNumber: z.string().min(1, "room number is required"),
  type: z.string().min(1, "room type is required"),
  price: z.coerce.number().positive("room price is required").transform(String),
  capacity: z.number().min(1, "room capacity is required"),
  bedType: z.string().min(1, "bed type is required"),
  floor: z.number().min(1, "floor is required"),
  amenities: z.array(z.string()).optional(),
  images: z.array(z.string()).optional(),
});
export const updateRoomSchema = createRoomSchema.partial().extend({
  isActive: z.boolean().optional(),
});

export const getRoomByIdSchema = z.object({
  id: z.string().uuid("invalid room id"),
});
