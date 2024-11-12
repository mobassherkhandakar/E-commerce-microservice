import { EMAIL_SERVICE } from "@/config";
import prisma from "@/prisma";
import { EmailVerificationSchema } from "@/schema";
import axios from "axios";
import { NextFunction, Request, Response } from "express";

export const verifyEmail = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const parsedBody = EmailVerificationSchema.safeParse(req.body)
        if (!parsedBody.success) {
            return res.status(400).json({ errors: parsedBody.error.errors })
        }

        // check if user with email already exists
        const user = await prisma.user.findFirst({
            where: {
                email: parsedBody.data.email,
            },
        })
        if (!user) {
            return res.status(404).json({ message: "User not found" })
        }
        // check if email verification code matches
        const verificationCode = await prisma.verificationCode.findFirst({
            where: {
                userId: user.id,
                code: parsedBody.data.code,
            }
        })
        if (!verificationCode) {
            return res.status(400).json({ message: "Invalid verification code" })
        }
        // if code has expired
        if (verificationCode.expiresAt < new Date()) {
            return res.status(400).json({ message: "Verification code has expired" })
        }
        // update user verified
        await prisma.user.update({
            where: {
                id: user.id,
            },
            data: {
                verified: true,
                status: "ACTIVE"
            },
        })
        // update verification code
        await prisma.verificationCode.update({
            where: {
                id: verificationCode.id,
            },
            data: {
                status: "USED",
                verifiedAt: new Date()
            }
        })
        // send success email notification
        await axios.post(`${EMAIL_SERVICE}/emails/send`, {
            recipient: user.email,
            subject: 'Email Verified',
            body: 'Your email has been verified successfully',
            source: 'verify-email',
        })
        return res.status(200).json({ message: 'Email verified successfully' });
    } catch (error) {

    }
}