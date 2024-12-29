import { Request, Response, NextFunction } from 'express';
import jwt, { JwtPayload } from 'jsonwebtoken';
import dotenv from 'dotenv';
import nodemailer from 'nodemailer';
dotenv.config()

// deepcode ignore HardcodedSecret: secret is just for testing
const SECRET_KEY: string = process.env.JWT_SECRET || 'testingsecret';

export const authenticateToken = (req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ message: 'Access Token Required' });
    }

    try {
        const payload = jwt.verify(token, SECRET_KEY!) as JwtPayload;

        if (typeof payload === 'object' && 'id' in payload && 'email' in payload) {
            req.user = { id: payload.id as number, email: payload.email as string };
            next();
        } else {
            return res.status(403).json({ message: 'Invalid Token Structure' });
        }
    } catch (err) {
        console.error(err) // eslint-disable-line no-console
        return res.status(403).json({ message: 'Invalid Token' });
    }
};

export const sendVerificationEmail = async (email: string, token: string) => {
    const transporter = nodemailer.createTransport({
        service: 'Gmail',
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASSWORD,
        },
    });

    const verificationUrl = `${process.env.FRONTEND_URL}/verify?token=${token}`;
    const mailOptions = {
        from: process.env.EMAIL_USER,
        to: email,
        subject: 'Verify Your Email',
        html: `<p>Please verify your email by clicking the link below:</p>
               <a href="${verificationUrl}">${verificationUrl}</a>`,
    };

    await transporter.sendMail(mailOptions);
}