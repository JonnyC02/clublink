/* eslint-disable @typescript-eslint/no-explicit-any */
import express, { Request, Response } from 'express';
import pool from '../db/db';
import { authenticateToken, getUserId } from '../utils/authentication';
import { hasPendingRequest, isStudent } from '../utils/user'
import { approveRequest, denyRequest, joinClub, requestJoinClub } from '../utils/club';
import AWS from 'aws-sdk';
import multer from 'multer';
import dotenv from 'dotenv';
dotenv.config()


const router = express.Router();

const s3 = new AWS.S3({
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    region: process.env.AWS_REGION,
});

const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 2 * 1024 * 1024 },
});

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
        console.error('Error fetching club:', error); // eslint-disable-line no-console
        res.status(500).json({ message: 'Internal server error.' });
    }
});

router.get('/:id/all', async (req: Request, res: Response) => {
    const { id } = req.params;
    const result = await pool.query('SELECT name, email, description, shortdescription, image, headerimage FROM clubs WHERE id = $1', [id])

    if (result.rows.length === 0) {
        res.status(404).json({ message: 'Club not Found' })
        return;
    }

    const requests = await pool.query(`
        SELECT 
            r.id,
            r.memberid,
            r.status,
            r.created_at, 
            u.name AS name
        FROM 
            requests r
        JOIN 
            users u 
        ON 
            r.memberid = u.id
        WHERE 
            r.clubId = $1 AND r.status = 'Pending'
    `, [id]);    
    
    const memberList = await pool.query(
        `
        SELECT 
            ml.memberId, 
            ml.memberType, 
            ml.created_at, 
            u.name, 
            u.studentNumber
        FROM 
            MemberList ml
        INNER JOIN 
            Users u 
        ON 
            ml.memberId = u.id
        WHERE 
            ml.clubId = $1
        `,
        [id]
    );

    res.json({ clubData: result.rows[0], requests: requests.rows, memberList: memberList.rows })
})

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

router.get('/:id/is-committee', async (req: Request, res: Response) => {
    const { id } = req.params;
    const userId = getUserId(req.headers.authorization);

    if (!userId) {
        res.status(401).json({ message: 'Unauthorized' });
        return
    }

    try {
        const result = await pool.query(
            `
            SELECT EXISTS (
                SELECT 1 
                FROM MemberList 
                WHERE memberId = $1 AND clubId = $2 AND memberType = 'Committee'
            ) AS isCommittee
            `,
            [userId, id]
        );

        res.json({ isCommittee: result.rows[0]?.iscommittee || false });
    } catch (err) {
        console.error('Error checking committee status:', err); // eslint-disable-line no-console
        res.status(500).json({ message: 'Internal Server Error' });
    }
});


router.get('/join/:id', authenticateToken, async (req: Request, res: Response) => {
    const { id } = req.params;
    const student = await isStudent((req as any).user?.id)

    if (student) {
        await joinClub(id, (req as any).user?.id)
        res.json({ message: "Successfully Joined Club" })
    } else {
        await requestJoinClub(id, (req as any).user?.id)
        res.json({ message: "Sent Request to Join" })
    }
})

router.post('/:id/edit', authenticateToken, async (req: Request, res: Response) => {
    const { id } = req.params;
    const { description, shortdescription, headerimage } = req.body;

    try {
        const result = await pool.query(
            `
            UPDATE clubs
            SET 
                description = $1,
                shortdescription = $2,
                headerimage = $3
            WHERE id = $4
            RETURNING *;
            `,
            [description, shortdescription, headerimage, id]
        );

        if (result.rowCount === 0) {
            res.status(404).json({ message: 'Club not found.' });
            return;
        }

        res.json({ message: 'Club details updated successfully.', club: result.rows[0] });
    } catch (err: any) {
        console.error('Error updating club details:', err); // eslint-disable-line no-console
        res.status(500).json({ message: 'Internal server error.' });
    }
})

router.post('/upload', authenticateToken, upload.single('file'), async (req: Request, res: Response) => {
    try {
        const file = req.file;
        const { clubId } = req.body;

        if (!file || !clubId) {
            res.status(400).json({ message: 'File and clubId are required.' });
            return;
        }

        const params = {
            Bucket: process.env.AWS_S3_BUCKET_NAME || '',
            Key: `clubs/${clubId}/${Date.now()}_${file.originalname}`,
            Body: file.buffer,
            ContentType: file.mimetype,
        };

        const uploadResult = await s3.upload(params).promise();

        res.status(200).json({
            message: 'File uploaded successfully.',
            url: uploadResult.Location,
        });
    } catch (error) {
        console.error('Error uploading file:', error); // eslint-disable-line no-console
        res.status(500).json({ message: 'Failed to upload file.' });
    }
})

router.post('/requests/:id/approve', authenticateToken, async (req: Request, res: Response) => {
    const { id } = req.params;

    const userId = (req as any).user.id

    try {
        await approveRequest(id, userId);
        res.json({ message: "Successfully approved requests"})
    } catch (err) {
        console.error(err) // eslint-disable-line no-console
        res.status(500).json({ messsage: "Failed to approve request"});
    }
})

router.post('/requests/:id/deny', authenticateToken, async (req: Request, res: Response) => {
    const { id } = req.params;
    
    const userId = (req as any).user.id

    try {
        await denyRequest(id, userId);
        res.json({ message: "Successfully denied request"})
    } catch (err) {
        console.error(err) // eslint-disable-line no-console
        res.status(500).json({ message: 'Failed to deny request'})
    }
})

export default router;