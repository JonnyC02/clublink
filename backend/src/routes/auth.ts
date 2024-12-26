import express, { Request, Response } from 'express'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import pool from '../db/db'

const router = express.Router()

const SECRET_KEY: string = process.env.JWT_SECRET || 'testingsecret';

router.post('/login', async (req: Request, res: Response): Promise<void> => {
    try {
        const { email, password } = req.body;

        const result = await pool.query('SELECT id, email, password FROM users WHERE email = ?', [email]);

        if (result.rowCount === 0) {
            res.status(401).json({ message: 'Invalid email or password' });
            return;
        }

        const user = result.rows[0];
        if (!user.password) {
            throw new Error("No Password Provided")
        }
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            res.status(401).json({ message: 'Invalid email or password' });
            return;
        }

        const token = jwt.sign({ id: user.id, email: user.email }, SECRET_KEY!, {
            expiresIn: '24h',
        });

        res.json({ token });
    } catch (err) {
        console.error(err);  // eslint-disable-line no-console
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

router.post('/signup', async (req: Request, res: Response) => {
    const data = req.body
    try {
        const result = await pool.query('SELECT id, email FROM users WHERE email = ?', [data.email]);

        if (result.rows.length > 0) {
            res.status(400).json({ message: 'Email already in use' });
            return
        }

        const hashedPassword = await bcrypt.hash(data.password, 10)

        await pool.query('INSERT INTO users (email, password) VALUES (?, ?)', [data.email, hashedPassword])
        res.status(201).json({ message: "User created!" })
    } catch (err) {
        console.error(err) // eslint-disable-line no-console
        res.status(500).json({ message: "Internal Server Error" })
    }
})

export default router;