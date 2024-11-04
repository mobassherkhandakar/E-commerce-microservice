import prisma from '@/prisma';
import bcryptjs from 'bcryptjs'
import { UserLoginSchema } from '@/schema';
import { Response, Request, NextFunction } from 'express';
import { LoginAttempt } from '@prisma/client';
import jwt from 'jsonwebtoken';

type LoginHistory = {
    userId: string;
    userAgent: string | undefined;
    ipAddress: string | undefined;
    attempt: LoginAttempt;
};

const createLoginHistory = async (info: LoginHistory) => {
    await prisma.loginHistory.create({
        data: {
            userId: info.userId,
            userAgent: info.userAgent,
            ipAddress: info.ipAddress,
            attempt: info.attempt,
        },
    });
};

const userLogin = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const ipAddress =
            (req.headers['x-forwarded-for'] as string) || req.ip || '';
        const userAgent = req.headers['user-agent'] || '';

        // check req body
        const parsedBody = UserLoginSchema.safeParse(req.body);
        if (!parsedBody.success) {
            return res.status(400).json({
                message: "Invalid request body",
                errors: parsedBody.error.errors,
            });
        }
        // user exit check
        const user = await prisma.user.findUnique({
            where: {
                email: parsedBody.data.email
            },
        });
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        // password match check
        const isPasswordMatch = await bcryptjs.compare(
            parsedBody.data.password,
            user.password
        );
        if (!isPasswordMatch) {
            await createLoginHistory({
                userId: user.id,
                userAgent,
                ipAddress,
                attempt: 'FAILED',
            });
            return res.status(401).json({ message: "Invalid password" });
        }
        if (!user.verified) {
            await createLoginHistory({
                userId: user.id,
                userAgent,
                ipAddress,
                attempt: "FAILED"
            })
            return res.status(403).json({ message: "User is not verified" });
        }
        if (user.status !== "ACTIVE") {
            await createLoginHistory({
                userId: user.id,
                userAgent,
                ipAddress,
                attempt: "FAILED"
            })
            return res.status(403).json({ message: "User is not active" });
        }
        const accessToken = jwt.sign({
            userId: user.id,
            email: user.email,
            role: user.role,
        }, process.env.JWT_SECRET ?? "my_Secret_key", { expiresIn: "2h" })
        await createLoginHistory({
            userId: user.id,
            userAgent,
            ipAddress,
            attempt: "SUCCESS"
        })
        return res.status(200).json({ accessToken })
    } catch (error) {
        next(error);
    }
}