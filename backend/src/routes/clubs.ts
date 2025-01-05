/* eslint-disable @typescript-eslint/no-explicit-any */
import express, { Request, Response } from 'express';
import pool from '../db/db';
import { authenticateToken, getUserId } from '../utils/authentication';
import { hasPendingRequest, isStudent } from '../utils/User';
import { joinClub, requestJoinClub } from '../utils/club';

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
                    c.clubType,
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
                    c.clubType,
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

router.get('/:id', async (req: Request, res: Response) => {
    const { id } = req.params;
    let userId;
    if (req.headers['authorization']) {
        userId = getUserId(req.headers['authorization'])
    }

    if (!id) {
        res.status(400).json({ message: 'Invalid request. Missing club ID.' });
        return;
    }

    try {
        const result = await pool.query(
            `
            SELECT 
                c.id, 
                c.name, 
                c.description, 
                c.university, 
                c.email,
                c.clubtype, 
                c.headerimage, 
                u.name AS university,
                 
                COUNT(m.memberId) AS popularity,
                CASE 
                    WHEN $1::INT IS NULL THEN false
                    ELSE EXISTS (
                        SELECT 1 
                        FROM MemberList ml
                        WHERE ml.memberId = $1::INT AND ml.clubId = c.id
                    )
                END AS isMember
            FROM 
                clubs c
            LEFT JOIN 
                MemberList m ON c.id = m.clubId
            LEFT JOIN 
                Universities u ON c.university = u.acronym
            WHERE 
                c.id = $2::INT
            GROUP BY 
                c.id, c.name, c.description, c.university, c.email, c.clubtype, c.headerimage, u.name;
            `,
            [userId, id]
        );

        if (result.rows.length === 0) {
            res.status(404).json({ message: 'Club not found.' });
            return;
        }

        const clubData = result.rows[0];
        let hasPending = false;

        if (userId) {
            hasPending = await hasPendingRequest(userId, parseInt(id));
        }

        res.json({ ...clubData, hasPending });
    } catch (error) {
        console.error('Error fetching club:', error);
        res.status(500).json({ message: 'Internal server error.' });
    }
});

router.get('/:id/committee', async (req: Request, res: Response) => {
    const { id } = req.params;

    if (!id) {
        res.status(400).json({ message: "No Id Provided!" })
        return;
    }

    const result = await pool.query(
        `
        SELECT u.id, u.name
        FROM MemberList ml
        JOIN Users u ON ml.memberId = u.id
        WHERE ml.clubId = $1 AND ml.memberType = 'Committee';
        `,
        [id]
    );

    if (result.rows.length === 0) {
        res.status(404).json({ message: "No committee members found." });
        return;
    }

    res.json(result.rows);
})

router.get('/join/:id', authenticateToken, async (req: Request, res: Response) => {
    const { id } = req.params;
    const student = await isStudent((req as any).user?.id)

    if (student) {
        await joinClub(id, (req as any).user?.id)
    } else {
        await requestJoinClub(id, (req as any).user?.id)
    }
})

export default router;