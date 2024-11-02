import { Request, Response, NextFunction } from 'express';
import prisma from '@/prisma';

export const getEmails = async (_req: Request, res: Response, next: NextFunction) => {
    try {
        const emails = await prisma.email.findMany();
        res.json(emails);
    } catch (error) {
        next(error);
    }
};
