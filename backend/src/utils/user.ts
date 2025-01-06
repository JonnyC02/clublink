import pool from "../db/db"

export const isStudent = async (id: number | undefined) => {
    try {
        const result = await pool.query('SELECT studentnumber FROM users WHERE id = $1', [id])

        if (result.rowCount === 0) {
            throw new Error('User not found!')
        }

        return !!result.rows[0].studentnumber
    } catch (err) {
        console.error('Error Checking: ', err) // eslint-disable-line no-console
    }
}

export const hasPendingRequest = async (userId: number, clubId: number): Promise<boolean> => {
    try {
        const result = await pool.query(
            'SELECT 1 FROM requests WHERE memberId = $1 AND clubId = $2 AND status = $3',
            [userId, clubId, 'Pending']
        );

        return result.rows.length > 0;
    } catch (error) {
        console.error('Error checking pending request:', error); // eslint-disable-line no-console
        throw new Error('Failed to check pending request.');
    }
};

export const getAllClubs = async (userId: number) => {
    try {
        const result = await pool.query(`
             SELECT 
                c.id,
                c.image,
                c.name,
                c.shortDescription,
                EXISTS (
                    SELECT 1 
                    FROM MemberList ml 
                    WHERE ml.memberId = $1 
                      AND ml.clubId = c.id 
                      AND ml.memberType = 'Committee'
                ) AS isCommittee
            FROM 
                clubs c
            INNER JOIN 
                MemberList m ON c.id = m.clubId
            WHERE 
                m.memberId = $1
        `, [userId])

        return result.rows
    } catch (error) {
        console.error('Error getting all user clubs: ', error); // eslint-disable-line no-console
        throw new Error('Failed to get all user clubs')
    }
}