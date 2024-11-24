import { CART_TTL } from "@/config";
import redis from "@/redis";
import { CartItemSchema } from "@/schema";
import { NextFunction, Request, Response } from "express";
import { v4 as uuid } from "uuid"

export const addToCart = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const parsedBody = CartItemSchema.safeParse(req.body);
        if (!parsedBody.success) {
            return res.status(400).json({ errors: parsedBody.error.errors });
        }
        let cartSessionId = req.headers["x-cart-session-id"] as string || null
        // cart session id is present in the request header and exists in the store
        if (cartSessionId) {
            const exists = await redis.exists(`sessions:${cartSessionId}`)
            console.log("Sessions Exists", exists);

            if (!exists) {
                cartSessionId = null
            }
        }
        // if cart session id is not present, create a new one
        if (!cartSessionId) {
            cartSessionId = uuid()
            console.log("New Session Id", cartSessionId);
            // cart session id in the redis store
            await redis.setex(`sessions:${cartSessionId}`, CART_TTL, cartSessionId)
            res.setHeader('x-cart-session-id', cartSessionId)
        }

        // add item to cart 
        await redis.hset(`cart:${cartSessionId}`, parsedBody.data.productId, JSON.stringify({
            inventoryId: parsedBody.data.inventoryId,
            quantity: parsedBody.data.quantity,
        }))
        res.status(201).json({ message: "Item added to cart", cartSessionId })

    } catch (error) {
        next(error);
    }
}