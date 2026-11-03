import { z } from "zod";

export const getRoomsFilterSchema = z.object({
  id: z.string().uuid("invalid room id").optional(),
  roomNumber: z.string().min(1, "room number is required").optional(),
  type: z.string().min(1, "room type is required").optional(),
  bedType: z.string().min(1, "bed type is required").optional(),
  capacity: z.coerce.number().int().positive().optional(),
  floor: z.coerce.number().int().positive().optional(),
  amenities: z
    .preprocess(
      (value) =>
        typeof value === "string"
          ? value.split(",").filter(Boolean)
          : value,
      z.array(z.string()),
    )
    .optional(),
  checkIn: z.iso.date().optional(),
  checkOut: z.iso.date().optional(),
}).refine(
  (query) =>
    (!query.checkIn && !query.checkOut) ||
    (query.checkIn !== undefined &&
      query.checkOut !== undefined &&
      query.checkOut > query.checkIn),
  {
    path: ["checkOut"],
    message: "check-out must be after check-in",
  },
);

export const getRoomByIdSchema = z.object({
  id: z.string().uuid("invalid room id"),
});

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
