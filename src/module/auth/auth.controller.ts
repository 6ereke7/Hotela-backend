import type { Request, Response, NextFunction } from "express"
import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken"
import { getStaffByEmail } from "./auth.services.ts"

export const login = async (req: Request, res: Response, next: NextFunction) => {
    const user = await getStaffByEmail(req.body.email)
    if (user === undefined) {
        res.status(401).json({
            success: false,
            data: "invalid email"
        })
        return
    }
    const hashedPass = await bcrypt.compare(req.body.password, user.passwordHash)
    if (!hashedPass) {
        res.status(401).json({
            success: false,
            data: "invalid password"
        })
        return
    }

    const token = jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET as string, { expiresIn: '1d' })
    res.status(200).json({
        success: true,
        data: token
    })

}