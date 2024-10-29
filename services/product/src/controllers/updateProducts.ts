import prisma from '@/prisma';
import { ProductUpdateDTOSchema } from '@/schema';
import { Request, Response, NextFunction } from 'express';

export const updateProducts = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const { id } = req.params
        const parsedBody = ProductUpdateDTOSchema.safeParse(req.body)
        if (!parsedBody.success) {
            return res.status(400).json({ error: parsedBody.error.errors });
        }
        // check if the product exists
        const product = await prisma.product.findUnique({
            where: { id },
        })
        if (!product) {
            return res.status(404).json({ error: 'Product not found' });
        }
        // update the product
        const updatedProduct = await prisma.product.update({
            where: { id },
            data: parsedBody.data,
        })
        return res.status(200).json({ data: updatedProduct })

    } catch (error) {
        next(error)
    }
}