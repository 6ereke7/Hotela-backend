import { Router } from "express";
import { validateMiddleware } from "../../middleware/validate.ts";
import {
  getBookingStats,
  getCheckInTrends,
  getCreatedBookingTrends,
  getGuestStats,
  getMonthlyRevenueStats,
  getOccupancyStats,
  getRevenueStats,
  getRoomPerformanceStats,
  getStayStats,
  getYearlyRevenueStats,
} from "./stats.controller.ts";
import {
  monthlyRevenueQuerySchema,
  yearlyRevenueQuerySchema,
} from "./stats.schema.ts";
import { authMiddleware } from "../../middleware/auth.ts";
import { roleMiddleware } from "../../middleware/role.ts";

export const statsRouter: Router = Router();

statsRouter.use(authMiddleware, roleMiddleware("admin"));

statsRouter.get("/bookings", getBookingStats);
statsRouter.get("/revenue", getRevenueStats);
statsRouter.get(
  "/revenue/monthly",
  validateMiddleware({ query: monthlyRevenueQuerySchema }),
  getMonthlyRevenueStats,
);
statsRouter.get(
  "/revenue/yearly",
  validateMiddleware({ query: yearlyRevenueQuerySchema }),
  getYearlyRevenueStats,
);
statsRouter.get("/occupancy", getOccupancyStats);
statsRouter.get("/stays", getStayStats);
statsRouter.get("/guests", getGuestStats);
statsRouter.get("/trends/created", getCreatedBookingTrends);
statsRouter.get("/trends/check-ins", getCheckInTrends);
statsRouter.get("/rooms", getRoomPerformanceStats);
