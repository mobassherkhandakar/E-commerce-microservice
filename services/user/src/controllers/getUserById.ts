import prisma from '@/prisma';
import { User } from '@prisma/client';
import { Request, Response, NextFunction } from 'express';
export const getUserById = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const { id } = req.params;
        const field = req.query.field;
        let user: User | null = null;
        if (field === "authUserId") {
            user = await prisma.user.findUnique({ where: { authUserId: id } })
        } else {
            user = await prisma.user.findUnique({ where: { id } })
        }
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        return res.status(200).json(user);

    } catch (error) {
        next(error);
    }
}