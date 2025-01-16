import pool from "../db/db";
import { addAudit } from "./audit";

export const joinClub = async (clubId: string, userId: number | undefined) => {
  await pool.query(
    "INSERT INTO memberlist (memberId, clubId) VALUES ($1, $2)",
    [userId, clubId]
  );
};

export const requestJoinClub = async (
  clubId: string,
  userId: number | undefined
) => {
  await pool.query("INSERT INTO requests (memberId, clubId) VALUES ($1, $2)", [
    userId,
    clubId,
  ]);
};

export const approveRequest = async (
  requestId: string,
  userId: number | undefined
) => {
  if (!userId) {
    throw new Error("No User Id");
  }
  const result = await pool.query(
    "UPDATE requests SET status = 'Approved', approverid = $1, updated_at = $2 WHERE id = $3 RETURNING clubid, memberid",
    [userId, new Date().toISOString(), requestId]
  );

  if (result.rows.length === 0) {
    throw new Error("Unable to approve request: No rows returned");
  }
  const clubId = result.rows[0].clubid;
  const memberId = +result.rows[0].memberid;
  await addAudit(clubId, userId, memberId, "approve");
  await joinClub(clubId, memberId);
};

export const denyRequest = async (
  requestId: string,
  userId: number | undefined
) => {
  if (!userId) {
    throw new Error("No User Id");
  }
  const result = await pool.query(
    "UPDATE requests SET status = 'Denied', approverid = $1, updated_at = $2 WHERE id = $3 RETURNING clubid, memberid",
    [userId, new Date().toISOString(), requestId]
  );

  if (result.rows?.length === 0) {
    throw new Error("Unable to process request: No rows returned");
  }

  const clubId = result.rows[0].clubid;
  const memberId = +result.rows[0].memberid;
  await addAudit(clubId, userId, memberId, "deny");
};
