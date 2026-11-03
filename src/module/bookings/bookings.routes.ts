import { Router } from "express";
import {
  confirmBooking,
  deleteBooking,
  getAllBookings,
  requestOtp,
  updateBooking,
} from "./bookings.controllers.ts";
import { authMiddleware } from "../../middleware/auth.ts";
import { roleMiddleware } from "../../middleware/role.ts";
import { validateMiddleware } from "../../middleware/validate.ts";
import {
  bookingIdSchema,
  confirmBookingSchema,
  updateBookingSchema,
} from "./bookings.schema.ts";

export const bookingsRouter: Router = Router();

bookingsRouter.post(
  "/confirm",
  validateMiddleware({ body: confirmBookingSchema }),
  confirmBooking,
);
bookingsRouter.get(
  "/",
  authMiddleware,
  roleMiddleware("receptionist"),
  getAllBookings,
);
bookingsRouter.patch(
  "/:id",
  authMiddleware,
  roleMiddleware("receptionist"),
  validateMiddleware({ params: bookingIdSchema, body: updateBookingSchema }),
  updateBooking,
);
bookingsRouter.delete(
  "/:id",
  authMiddleware,
  roleMiddleware("admin"),
  validateMiddleware({ params: bookingIdSchema }),
  deleteBooking,
);
