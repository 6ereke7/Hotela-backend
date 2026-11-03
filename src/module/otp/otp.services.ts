import { db } from "../../db/index.ts";
import { otp } from "../../db/schema.ts";
import { and, eq, gt } from "drizzle-orm";

export const createOtp = async (data: typeof otp.$inferInsert) => {
  return db.transaction(async (tx) => {
    await tx
      .update(otp)
      .set({ isUsed: true })
      .where(eq(otp.email, data.email));
    const [createdOtp] = await tx.insert(otp).values(data).returning();
    return createdOtp;
  });
};
export const consumeOtp = async (email: string, code: string) =>
  db.transaction(async (tx) => {
    const now = new Date();
    const [matchingOtp] = await tx
      .select({ id: otp.id })
      .from(otp)
      .where(
        and(
          eq(otp.email, email),
          eq(otp.otp, code),
          eq(otp.isUsed, false),
          gt(otp.expiresAt, now),
        ),
      )
      .limit(1)
      .for("update");

    if (!matchingOtp) return false;

    const [consumedOtp] = await tx
      .update(otp)
      .set({ isUsed: true })
      .where(
        and(
          eq(otp.id, matchingOtp.id),
          eq(otp.isUsed, false),
          gt(otp.expiresAt, now),
        ),
      )
      .returning({ id: otp.id });

    return Boolean(consumedOtp);
  });

export const updateOtp = async (
  id: string,
  data: Partial<typeof otp.$inferInsert>,
) => {
  const [updated] = await db
    .update(otp)
    .set(data)
    .where(eq(otp.id, id))
    .returning();
  return updated;
};
export const removeOtp = async (id: string) => {
  const [removed] = await db.delete(otp).where(eq(otp.id, id)).returning();
  return removed;
};
