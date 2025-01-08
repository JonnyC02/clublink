/* eslint-disable @typescript-eslint/no-explicit-any */
import { Request, Response, NextFunction } from 'express';
import jwt, { JwtPayload } from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

// deepcode ignore HardcodedSecret: secret is just for testing
const SECRET_KEY: string = process.env.JWT_SECRET || 'testingsecret';

export const authenticateToken = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        res.status(401).json({ message: 'Access Token Required' });
        return;
    }

    try {
        const payload = jwt.verify(token, SECRET_KEY) as JwtPayload;

        if (typeof payload === 'object' && 'id' in payload && 'email' in payload) {
            (req as any).user = { id: payload.id as number, email: payload.email as string };
            next();
        } else {
            res.status(403).json({ message: 'Invalid Token Structure' });
        }
    } catch (err: any) {
        if (err.name === 'TokenExpiredError') {
            res.status(403).json({ message: 'Token has expired' });
        } else if (err.name === 'JsonWebTokenError') {
            res.status(403).json({ message: 'Invalid Token' });
        } else {
            console.error('Token verification error:', err); // eslint-disable-line no-console
            res.status(403).json({ message: 'Invalid Token' });
        }
    }
};

export const getUserId = (authHeader: string | undefined) => {
    const token = authHeader?.split(' ')[1] || ''

    try {
        const payload = jwt.verify(token, SECRET_KEY) as JwtPayload

        if (typeof payload === 'object' && 'id' in payload && 'email' in payload) {
            return payload.id
        }
    } catch (err) {
        console.error('Token Verification Error: ', err) // eslint-disable-line no-console
    }
}