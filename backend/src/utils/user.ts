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