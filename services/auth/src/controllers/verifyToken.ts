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
        const { accessToken } = parsedBody.data

    } catch (error) {
        next(error);
    }
}