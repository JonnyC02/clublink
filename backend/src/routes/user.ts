import express, { Request, Response } from 'express';
import { authenticateToken } from '../utils/authentication';
import { getAllClubs } from '../utils/user';

const router = express.Router();

router.get('/clubs', authenticateToken, async (req: Request, res: Response) => {
    try {
      const clubs = await getAllClubs((req as any).user?.id); // eslint-disable-line @typescript-eslint/no-explicit-any
      res.json(clubs);
    } catch (error) {
      console.error('Error fetching clubs:', error); // eslint-disable-line no-console
      res.status(500).json({ message: 'Internal server error' });
    }
  });

export default router;