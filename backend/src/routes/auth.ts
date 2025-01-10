/* eslint-disable @typescript-eslint/no-explicit-any */
import express, { Request, Response } from 'express'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import pool from '../db/db'
import { generateVerificationToken } from '../utils/tokens'
import { sendVerificationEmail } from '../utils/email'
import { authenticateToken } from '../utils/authentication'

const router = express.Router()

const SECRET_KEY: string = process.env.JWT_SECRET || 'testingsecret';

router.post('/login', async (req: Request, res: Response): Promise<void> => {
    try {
        const { email, password } = req.body;

        const result = await pool.query('SELECT id, email, password, isactive FROM users WHERE email = $1', [email]);

        if (result.rowCount === 0) {
            res.status(401).json({ message: 'Invalid email or password' });
            return;
        }

        const user = result.rows[0];
        if (!user.password) {
            throw new Error("No Password Provided")
        }

        if (!user.isactive) {
            res.status(403).json({ message: "Your email is not verified!" })
            return;
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
    const { email, name, password, studentNumber, university } = req.body
    try {
        const result = await pool.query('SELECT id FROM users WHERE email = $1', [email]);

        if (result.rows.length > 0) {
            res.status(400).json({ message: 'Email already in use' });
            return
        }

        const hashedPassword = await bcrypt.hash(password, 10)
        let user
        if (!studentNumber) {
            user = await pool.query('INSERT INTO users (name, email, password) VALUES ($1, $2, $3) RETURNING *', [name, email, hashedPassword])
        } else {
            const student = await pool.query('SELECT id FROM users WHERE studentnumber = $1', [studentNumber])

            if (student.rows.length > 0) {
                res.status(400).json({ message: "Student Number Already in use!" })
                return;
            }

            user = await pool.query('INSERT INTO users (name, email, password, studentNumber, university) VALUES ($1, $2, $3, $4, $5) RETURNING *', [name, email, hashedPassword, studentNumber, university])
        }
        if (!process.env.REACT_APP_IS_TESTING) {
            const userId = user.rows[0].id;
            const verificationToken = generateVerificationToken(userId);
            await sendVerificationEmail(email, verificationToken);
        }

        res.status(201).json({ message: "User created!" })
    } catch (err) {
        console.error(err) // eslint-disable-line no-console
        res.status(500).json({ message: "Internal Server Error" })
    }
})

router.get('/verify', async (req: Request, res: Response) => {
    const { token } = req.query;
    try {
        const decoded: any = jwt.verify(token as string, process.env.JWT_SECRET!);
        const userId = decoded.userId;

        await pool.query('UPDATE users SET isActive = true WHERE id = $1', [userId]);

        res.status(200).send('Email verified successfully!');
    } catch (err) {
        console.error('Error Verifying Email: ', err) // eslint-disable-line no-console
        res.status(400).send('Invalid or expired token.');
    }
})

router.get("/user", authenticateToken, async (req: Request, res: Response): Promise<void> => {
    try {
        const userId = (req as any).user?.id;

        if (!userId) {
            res.status(400).json({ message: "User ID not provided." });
            return;
        }

        const users = await pool.query("SELECT id, name, email, studentNumber, university FROM users WHERE id = $1", [userId]);

        if (users.rowCount === 0) {
            res.status(404).json({ message: "User not found." });
            return;
        }

        const user = users.rows[0];

        const clubs = await pool.query(`SELECT c.id, c.name FROM MemberList m INNER JOIN Clubs c ON m.clubId = c.id WHERE m.memberId = $1`, [userId]);
        const isStudent = user.studentNumer ? true : false;
        const responseData = {
            name: user.name,
            email: user.email,
            isStudent,
            studentNumber: user.studentNumber,
            university: user.university,
            clubs,
        };

        res.status(200).json(responseData);
    } catch (err) {
        console.error("Error fetching user data:", err); // eslint-disable-line no-console
        res.status(500).json({ message: "Internal Server Error" });
    }
});

export default router;