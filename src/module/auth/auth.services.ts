import { eq } from "drizzle-orm";
import { db } from "../../db/index.ts";
import { staff } from "../../db/schema.ts";

export const getStaffByEmail = async (email: string) => {
  const [user] = await db
    .select({
      id: staff.id,
      email: staff.email,
      firstName: staff.firstName,
      lastName: staff.lastName,
      passwordHash: staff.passwordHash,
      role: staff.role,
      isActive: staff.isActive,
    })
    .from(staff)
    .where(eq(staff.email, email));
  return user;
};

export const getStaffById = async (id: string) => {
  const [user] = await db
    .select({
      id: staff.id,
      email: staff.email,
      firstName: staff.firstName,
      lastName: staff.lastName,
      role: staff.role,
      isActive: staff.isActive,
    })
    .from(staff)
    .where(eq(staff.id, id));
  return user;
};
