import { Router } from "express";
import { createBooking, deleteBooking, getAllBookings, updateBooking } from "./bookings.controllers.ts";
import { authMiddleware } from "../../middleware/auth.ts";
import { roleMiddleware } from "../../middleware/role.ts";

export const bookingsRouter: Router = Router();

bookingsRouter.post("/", createBooking);
bookingsRouter.get("/", authMiddleware, roleMiddleware('receptionist'), getAllBookings);
bookingsRouter.put("/", authMiddleware, roleMiddleware('receptionist'), updateBooking);
bookingsRouter.delete("/", authMiddleware, roleMiddleware('admin'), deleteBooking);  