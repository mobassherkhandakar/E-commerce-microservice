import { INVENTORY_URL } from "@/config";
import prisma from "@/prisma";
import { ProductCreateDTOSchema } from "@/schema";
import axios from "axios";
import { NextFunction, Request, Response } from "express";

export const createProduct = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        console.log("💖 User Information", req.headers["x-user-id"], req.headers["x-user-email"])
        const parsedBody = ProductCreateDTOSchema.safeParse(req.body)
        if (!parsedBody.success) {
            return res.status(400).json({ error: parsedBody.error.errors });
        }
        // check if product with the same sku already exists
        const existingProduct = await prisma.product.findFirst({
            where: {
                sku: parsedBody.data.sku,
            },
        });
        if (existingProduct) {
            return res.status(400).json({ message: "Product with the same SKU already exists" });
        }

        // create new product
        const product = await prisma.product.create({
            data: parsedBody.data,
        })
        console.log("Product created successfully", product.id);
        const { data: inventory } = await axios.post(
            `${INVENTORY_URL}/inventories`,
            {
                productId: product.id,
                sku: product.sku
            }
        )
        console.log("Inventory created successfully", inventory.id);
        await prisma.product.update({
            where: { id: product.id },
            data: {
                inventoryId: inventory.id
            }
        })
        console.log("Product update successFully with inventory id", inventory.id);

        res.status(201).json({ ...product, inventoryId: inventory.id })
    } catch (error) {
        next(error);
    }

}