import prisma from "@/prisma";
import bcryptjs from 'bcryptjs';
import { UserCreateSchema } from "@/schema";
import { NextFunction, Request, Response } from "express";
import axios from "axios";
import { EMAIL_SERVICE, USER_SERVICE } from "@/config";

const generateVerificationCode = () => {
    // Get current timestamp in milliseconds
    const timestamp = new Date().getTime().toString();

    // Generate a random 2-digit number
    const randomNum = Math.floor(10 + Math.random() * 90);

    // Combine timestamp and random number and extract last 5 digits
    let code = (timestamp + randomNum).slice(-5);

    return code; //01916661597
};

export const userRegistration = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        // Validate the request body
        const parsedBody = UserCreateSchema.safeParse(req.body);
        if (!parsedBody.success) {
            return res.status(400).json({
                message: "Invalid request body",
                errors: parsedBody.error.errors,
            });
        }

        // check if the user is already registered
        const existingUser = await prisma.user.findFirst({
            where: { email: parsedBody.data.email },
        });
        if (existingUser) {
            return res.status(400).json({ message: "User with the same email already exists" });
        }
        // hash the auth user
        const salt = await bcryptjs.genSalt(10)
        const hashedPassword = await bcryptjs.hash(parsedBody.data.password, salt)

        // create a new user
        const user = await prisma.user.create({
            data: {
                ...parsedBody.data,
                password: hashedPassword
            },
            select: {
                id: true,
                email: true,
                name: true,
                role: true,
                status: true,
                verified: true
            }
        })
        console.log('User created: ', user);

        // create the user profile by calling the user service
        await axios.post(`${USER_SERVICE}/users`, {
            authUserId: user.id,
            name: user.name,
            email: user.email
        })


        // generate verification code
        const code = generateVerificationCode()
        await prisma.verificationCode.create({
            data: {
                userId: user.id,
                code,
                expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24) // 24 hours
            }
        })
        // send verification email
        await axios.post(`${EMAIL_SERVICE}/emails/send`, {
            recipient: user.email,
            subject: "Email verification",
            body: `Your Verification Code is ${code}`,
            source: "user-registration"
        })

        return res.status(201).json({
            message: "User created. Check your email for verification Code",
            user
        })

    } catch (error) {
        next(error)
    }
}