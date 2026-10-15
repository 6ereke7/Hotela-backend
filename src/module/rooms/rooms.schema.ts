import {z} from 'zod'

export const getRoomsQuerySchema = z.object({
    checkIn: z.string().date().optional(),
    checkOut: z.string().date().optional(),
    type: z.string().optional(),
    capacity: z.number().optional(),
})

export const createRoomSchema = z.object({
    roomNumber: z.string().min(1,'room number is required'),
    type: z.string().min(1,'room type is required'),
    price: z.number().min(1,'room price is required'),
    capacity: z.number().min(1,'room capacity is required'),
    bedType: z.string().min(1,'bed type is required'),
    floor: z.number().min(1,'floor is required'),
    amenities: z.array(z.string()).optional(),
    images: z.array(z.string()).optional(),
})
export const updateRoomSchema = createRoomSchema.partial().extend({
    isActive: z.boolean().optional()
})

export const getRoomByIdSchema = z.object({
    id: z.string().uuid('invalid room id')
})