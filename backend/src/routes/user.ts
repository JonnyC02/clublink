import express, { Request, Response } from 'express';
import { authenticateToken } from '../utils/authentication';
import { getAllClubs } from '../utils/user';

const router = express.Router();

router.get('/clubs', authenticateToken, async (req: Request, res: Response) => {
    const clubs = await getAllClubs((req as any).user?.id) // eslint-disable-line @typescript-eslint/no-explicit-any
    res.json(clubs)
})

export default router;