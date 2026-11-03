import { Router } from "express";
import { validateMiddleware } from "../../middleware/validate.ts";
import { getOtpSchema, verifyOtpSchema } from "./otp.schema.ts";
import * as ctrl from "./otp.controller.ts";

export const otpRouter = Router();

otpRouter.get("/", validateMiddleware({ query: getOtpSchema }), ctrl.getOtp);
otpRouter.post(
  "/",
  validateMiddleware({ body: verifyOtpSchema }),
  ctrl.verifyOtp,
);
