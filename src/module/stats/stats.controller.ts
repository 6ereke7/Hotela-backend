import type { NextFunction, Request, Response } from "express";
import * as service from "./stats.service.ts";

const bookingStatuses = [
  "pending",
  "confirmed",
  "cancelled",
  "in_house",
  "departed",
] as const;

const isNonCancelledBooking = (status: string) => status !== "cancelled";

const toAmountInCents = (amount: string | number | null | undefined) =>
  Math.round(Number(amount ?? 0) * 100);

const toDecimalString = (amountInCents: number) =>
  (amountInCents / 100).toFixed(2);

const getNightsBetween = (checkInDate: string | Date, checkOutDate: string | Date) =>
  (new Date(checkOutDate).getTime() - new Date(checkInDate).getTime()) /
  86_400_000;

const toDateOnly = (value: Date | string | null | undefined) => {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return date.toISOString().slice(0, 10);
};

const matchesMonthAndYear = (
  value: Date | string | null | undefined,
  month: number,
  year: number,
) => {
  const dateString = toDateOnly(value);
  if (!dateString) return false;
  const [dateYear, dateMonth] = dateString.split("-").map(Number);
  return dateYear === year && dateMonth === month;
};

const matchesYear = (
  value: Date | string | null | undefined,
  year: number,
) => {
  const dateString = toDateOnly(value);
  if (!dateString) return false;
  const [dateYear] = dateString.split("-").map(Number);
  return dateYear === year;
};

const buildStatusCounts = (rows: Array<{ status: string }>) => {
  const byStatus: Record<string, number> = Object.fromEntries(
    bookingStatuses.map((status) => [status, 0]),
  );

  for (const row of rows) {
    byStatus[row.status] = (byStatus[row.status] ?? 0) + 1;
  }

  return byStatus;
};

const buildRevenueSummary = (
  rows: Array<{ status: string; totalAmount: string | number }>,
) => {
  const byStatus: Record<string, number> = Object.fromEntries(
    bookingStatuses.map((status) => [status, 0]),
  );
  let allBookingValueCents = 0;
  let nonCancelledBookingValueCents = 0;

  for (const row of rows) {
    const valueInCents = toAmountInCents(row.totalAmount);
    allBookingValueCents += valueInCents;
    byStatus[row.status] = (byStatus[row.status] ?? 0) + valueInCents;
    if (isNonCancelledBooking(row.status)) {
      nonCancelledBookingValueCents += valueInCents;
    }
  }

  return {
    totalBookingValue: toDecimalString(allBookingValueCents),
    nonCancelledBookingValue: toDecimalString(nonCancelledBookingValueCents),
    bookingValueByStatus: Object.fromEntries(
      Object.entries(byStatus).map(([status, cents]) => [
        status,
        toDecimalString(cents),
      ]),
    ),
  };
};

const buildOccupancySummary = (
  bookingRows: Array<{
    roomId: string;
    status: string;
    checkInDate: string | Date;
    checkOutDate: string | Date;
  }>,
  roomRows: Array<{
    id: string;
    roomNumber: string;
    type: string;
    isActive: boolean;
  }>,
) => {
  const roomNights = new Map<string, number>();
  let totalBookedNights = 0;

  for (const booking of bookingRows) {
    if (!isNonCancelledBooking(booking.status)) continue;

    const nights = getNightsBetween(booking.checkInDate, booking.checkOutDate);
    totalBookedNights += nights;
    roomNights.set(
      booking.roomId,
      (roomNights.get(booking.roomId) ?? 0) + nights,
    );
  }

  return {
    totalBookedRoomNights: totalBookedNights,
    rooms: roomRows.map((room) => ({
      id: room.id,
      roomNumber: room.roomNumber,
      type: room.type,
      isActive: room.isActive,
      bookedNights: roomNights.get(room.id) ?? 0,
    })),
  };
};

export const getBookingStats = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const rows = await service.getBookingRows();
    res.status(200).json({
      success: true,
      data: {
        totalBookings: rows.length,
        byStatus: buildStatusCounts(rows),
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getRevenueStats = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const rows = await service.getBookingRows();
    res.status(200).json({
      success: true,
      data: buildRevenueSummary(rows),
    });
  } catch (error) {
    next(error);
  }
};

export const getMonthlyRevenueStats = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { month, year } = res.locals.validatedQuery as {
      month: number;
      year: number;
    };

    const rows = (await service.getBookingRows()).filter((row) =>
      matchesMonthAndYear(row.createdAt, month, year),
    );

    res.status(200).json({
      success: true,
      data: {
        month,
        year,
        ...buildRevenueSummary(rows),
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getYearlyRevenueStats = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { year } = res.locals.validatedQuery as { year: number };

    const rows = (await service.getBookingRows()).filter((row) =>
      matchesYear(row.createdAt, year),
    );

    res.status(200).json({
      success: true,
      data: {
        year,
        ...buildRevenueSummary(rows),
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getOccupancyStats = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const [roomRows, bookingRows] = await Promise.all([
      service.getRoomRows(),
      service.getBookingRows(),
    ]);

    res.status(200).json({
      success: true,
      data: buildOccupancySummary(
        bookingRows.map((booking) => ({
          roomId: booking.roomId,
          status: booking.status,
          checkInDate: booking.checkInDate,
          checkOutDate: booking.checkOutDate,
        })),
        roomRows,
      ),
    });
  } catch (error) {
    next(error);
  }
};

export const getStayStats = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const rows = await service.getBookingRows();
    const stayLengths = rows
      .filter((row) => isNonCancelledBooking(row.status))
      .map((row) =>
        getNightsBetween(row.checkInDate, row.checkOutDate),
      );
    const totalNights = stayLengths.reduce((sum, nights) => sum + nights, 0);

    res.status(200).json({
      success: true,
      data: {
        bookingCount: stayLengths.length,
        totalNights,
        averageStayNights:
          stayLengths.length === 0 ? 0 : totalNights / stayLengths.length,
        shortestStayNights:
          stayLengths.length === 0 ? 0 : Math.min(...stayLengths),
        longestStayNights:
          stayLengths.length === 0 ? 0 : Math.max(...stayLengths),
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getGuestStats = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const rows = await service.getBookingRows();
    const activeBookings = rows.filter((row) => isNonCancelledBooking(row.status));
    const totalGuests = activeBookings.reduce(
      (sum, row) => sum + Number(row.numberOfGuests),
      0,
    );

    res.status(200).json({
      success: true,
      data: {
        bookingCount: activeBookings.length,
        totalGuests,
        averageGuestsPerBooking:
          activeBookings.length === 0 ? 0 : totalGuests / activeBookings.length,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getCreatedBookingTrends = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const rows = await service.getBookingRows();
    const byDate = new Map<string, { bookings: number; valueCents: number }>();

    for (const row of rows) {
      const date = toDateOnly(row.createdAt);
      if (!date) continue;

      const totals = byDate.get(date) ?? { bookings: 0, valueCents: 0 };
      totals.bookings += 1;
      if (isNonCancelledBooking(row.status)) {
        totals.valueCents += toAmountInCents(row.totalAmount);
      }
      byDate.set(date, totals);
    }

    res.status(200).json({
      success: true,
      data: [...byDate.entries()]
        .sort(([left], [right]) => left.localeCompare(right))
        .map(([date, totals]) => ({
          date,
          bookings: totals.bookings,
          nonCancelledBookingValue: toDecimalString(totals.valueCents),
        })),
    });
  } catch (error) {
    next(error);
  }
};

export const getCheckInTrends = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const rows = await service.getBookingRows();
    const byDate = new Map<string, { bookings: number; valueCents: number }>();

    for (const row of rows) {
      if (!isNonCancelledBooking(row.status)) continue;

      const date = toDateOnly(row.checkInDate);
      if (!date) continue;

      const totals = byDate.get(date) ?? { bookings: 0, valueCents: 0 };
      totals.bookings += 1;
      totals.valueCents += toAmountInCents(row.totalAmount);
      byDate.set(date, totals);
    }

    res.status(200).json({
      success: true,
      data: [...byDate.entries()]
        .sort(([left], [right]) => left.localeCompare(right))
        .map(([date, totals]) => ({
          date,
          bookings: totals.bookings,
          nonCancelledBookingValue: toDecimalString(totals.valueCents),
        })),
    });
  } catch (error) {
    next(error);
  }
};

export const getRoomPerformanceStats = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const [roomRows, bookingRows] = await Promise.all([
      service.getRoomRows(),
      service.getBookingRows(),
    ]);
    const performance = new Map<
      string,
      { bookings: number; bookedNights: number; bookingValueCents: number }
    >();

    for (const row of bookingRows) {
      if (!isNonCancelledBooking(row.status)) continue;

      const totals = performance.get(row.roomId) ?? {
        bookings: 0,
        bookedNights: 0,
        bookingValueCents: 0,
      };
      totals.bookings += 1;
      totals.bookedNights += getNightsBetween(row.checkInDate, row.checkOutDate);
      totals.bookingValueCents += toAmountInCents(row.totalAmount);
      performance.set(row.roomId, totals);
    }

    res.status(200).json({
      success: true,
      data: roomRows.map((room) => {
        const totals = performance.get(room.id) ?? {
          bookings: 0,
          bookedNights: 0,
          bookingValueCents: 0,
        };

        return {
          id: room.id,
          roomNumber: room.roomNumber,
          type: room.type,
          isActive: room.isActive,
          bookings: totals.bookings,
          bookedNights: totals.bookedNights,
          nonCancelledBookingValue: toDecimalString(totals.bookingValueCents),
        };
      }),
    });
  } catch (error) {
    next(error);
  }
};
