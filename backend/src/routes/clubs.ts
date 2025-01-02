/* eslint-disable @typescript-eslint/no-explicit-any */
import express, { Request, Response } from 'express';
import pool from '../db/db';

const router = express.Router();

router.post('/', async (req: Request, res: Response) => {
    const { latitude, longitude } = req.body;

    try {
        const userId = (req as any).user?.id;
        let query: string;
        let params: any[] = [];

        const userResult = await pool.query('SELECT university FROM Users WHERE id = $1', [userId]);
        const userUniversity = userResult.rows.length > 0 ? userResult.rows[0].university : null;

        if (latitude && longitude) {
            query = `
                SELECT 
                    c.id, 
                    c.name, 
                    c.shortdescription,
                    c.image, 
                    c.university,
                    (
                        3959 * acos(
                            cos(radians($1)) * cos(radians(c.latitude)) * cos(radians(c.longitude) - radians($2)) +
                            sin(radians($1)) * sin(radians(c.latitude))
                        )
                    ) AS distance,
                    COUNT(m.memberId) AS popularity,
                    CASE
                        WHEN c.university = $3 THEN 1
                        ELSE 0
                    END AS universityPriority
                FROM Clubs c
                LEFT JOIN MemberList m ON c.id = m.clubId
                GROUP BY c.id
                ORDER BY 
                    universityPriority DESC,
                    distance ASC,
                    popularity DESC;
            `;
            params = [latitude, longitude, userUniversity];
        } else {
            query = `
                SELECT 
                    c.id, 
                    c.name, 
                    c.shortdescription,
                    c.image,
                    c.university,
                    COUNT(m.memberId) AS popularity,
                    CASE
                        WHEN c.university = $1 THEN 1
                        ELSE 0
                    END AS universityPriority
                FROM Clubs c
                LEFT JOIN MemberList m ON c.id = m.clubId
                GROUP BY c.id
                ORDER BY 
                    universityPriority DESC,
                    popularity DESC;
            `;
            params = [userUniversity];
        }

        const result = await pool.query(query, params);
        res.json(result.rows);
    } catch (error) {
        console.error('Error fetching clubs:', error); // eslint-disable-line no-console
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

export default router;