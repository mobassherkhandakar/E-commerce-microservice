import prisma from '@/prisma';
import { Request, Response, NextFunction } from 'express';

export const getProducts = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const products = await prisma.product.findMany({
            select: {
                id: true,
                sku: true,
                name: true,
                price: true,
                inventoryId: true
            }
        })
        return res.json({ data: products });
    } catch (error) {
        next(error);
    }
}