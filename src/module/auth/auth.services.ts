import { eq } from "drizzle-orm"
import { db } from "../../db/index.ts"
import { staff } from "../../db/schema.ts"

export const getStaffByEmail = async (email:string) => {
    const [user] = await db
        .select({
            id: staff.id,
            email: staff.email,
            passwordHash: staff.passwordHash,
            role: staff.role
        })
        .from(staff)
        .where(
            eq(staff.email, email)
        )
    return user
}