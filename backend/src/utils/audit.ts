import pool from "../db/db";

export const addAudit = async (
  clubId: number,
  userId: number | undefined,
  actorId: number | undefined,
  action: string
) => {
  await pool.query(
    `INSERT INTO auditlog (clubid, memberid, userid, actiontype) VALUES ($1, $2, $3, $4);`,
    [clubId, actorId, userId, action]
  );
};
