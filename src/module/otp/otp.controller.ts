import { randomInt } from "node:crypto";
import type { NextFunction, Request, Response } from "express";
import { consumeOtp, createOtp } from "./otp.services.ts";
import { getOtpSchema, verifyOtpSchema } from "./otp.schema.ts";
import { sendOtpEmail } from "../../services/mail.ts";

export const getOtp = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { email } = getOtpSchema.parse(req.validated?.query);
    const code = randomInt(100000, 999999).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);
    const data = { email, expiresAt, otp: code };
    await createOtp(data);
    await sendOtpEmail(email, code);
    res.status(201).json({
      success: true,
      data: { email, expiresAt },
    });
  } catch (error) {
    next(error);
  }
};
export const verifyOtp = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { email, code } = verifyOtpSchema.parse(req.validated?.body);
    const isValid = await consumeOtp(email, code);
    if (isValid) {
      res.status(200).json({ success: true, data: "OTP matched" });
    } else {
      res.status(400).json({
        success: false,
        error: "invalid or expired verification code",
      });
    }
  } catch (error) {
    next(error);
  }
};
