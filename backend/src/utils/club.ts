import pool from "../db/db"

export const joinClub = async (clubId: string, userId: number | undefined) => {
    await pool.query('INSERT INTO memberlist (memberId, clubId) VALUES ($1, $2)', [userId, clubId])
}

export const requestJoinClub = async (clubId: string, userId: number | undefined) => {
    await pool.query('INSERT INTO requests (memberId, clubId) VALUES ($1, $2)', [userId, clubId])
}