import prisma from '@/prisma';
import { AccessTokenSchema } from '@/schema';
import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
export const verifyToken = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const parsedBody = AccessTokenSchema.safeParse(req.body)
        if (!parsedBody.success) {
            return res.status(401).json({ error: parsedBody.error.errors })
        }
        const { accessToken } = parsedBody.data;
        const decoded = jwt.verify(accessToken, process.env.JWT_SECRET as string);

        const user = await prisma.user.findUnique({
            where: { id: (decoded as any).userId },
            select: {
                id: true,
                email: true,
                name: true,
                role: true,
            },
        });

        if (!user) {
            return res.status(401).json({ message: 'Unauthorized' });
        }

        return res.status(200).json({ message: 'Authorized', user });

    } catch (error) {
        next(error);
    }
}