import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
dotenv.config()

// deepcode ignore HardcodedSecret: secret is just for testing
const SECRET_KEY: string = process.env.JWT_SECRET || 'testingsecret';

export const generateToken = (payload: object): string => {
    return jwt.sign(payload, SECRET_KEY, { expiresIn: '16h' });
};