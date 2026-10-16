import { and, asc, eq } from "drizzle-orm";
import { db } from "../../db/index.ts";
import { staff } from "../../db/schema.ts";

const receptionistColumns = {
  id: staff.id,
  firstName: staff.firstName,
  lastName: staff.lastName,
  email: staff.email,
  phoneNumber: staff.phoneNumber,
  role: staff.role,
  isActive: staff.isActive,
  createdAt: staff.createdAt,
};

export async function getReceptionists() {
  return db
    .select(receptionistColumns)
    .from(staff)
    .where(eq(staff.role, "receptionist"))
    .orderBy(asc(staff.lastName), asc(staff.firstName));
}

export async function createReceptionist(data: {
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  passwordHash: string;
}) {
  const [created] = await db
    .insert(staff)
    .values({ ...data, role: "receptionist" })
    .returning(receptionistColumns);
  return created;
}

export async function updateReceptionist(
  id: string,
  changes: Partial<{
    firstName: string;
    lastName: string;
    email: string;
    phoneNumber: string;
    passwordHash: string;
    isActive: boolean;
  }>,
) {
  const [updated] = await db
    .update(staff)
    .set(changes)
    .where(and(eq(staff.id, id), eq(staff.role, "receptionist")))
    .returning(receptionistColumns);
  return updated ?? null;
}
