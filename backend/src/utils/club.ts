import pool from "../db/db";
import { addAudit } from "./audit";
import dotenv from "dotenv";
dotenv.config();

export const joinClub = async (clubId: string, userId: number | undefined) => {
  await pool.query(
    "INSERT INTO memberlist (memberId, clubId) VALUES ($1, $2)",
    [userId, clubId]
  );
  const results = await pool.query(
    "SELECT * FROM memberlist WHERE clubId = $1",
    [clubId]
  );
  let student = 0;
  let associate = 0;
  for (const row of results.rows) {
    switch (row.membertype) {
      case "Member": {
        student++;
        break;
      }
      case "Associate": {
        associate++;
        break;
      }
    }
  }

  const ratio = +(associate / student).toFixed(2);
  await pool.query("UPDATE clubs SET ratio = $1 WHERE id = $2", [
    ratio,
    clubId,
  ]);
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
  return clubId;
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

export const expireRequest = async (requestId: string | undefined) => {
  await pool.query(
    "UPDATE requests SET status = 'Cancelled', updated_at = $1 WHERE id = $2",
    [new Date().toISOString(), requestId]
  );
};

export const activateMembership = async (
  userId: number | undefined,
  clubId: string
) => {
  await pool.query(
    "UPDATE MemberList SET activated = true WHERE userId = $1 AND clubId = $2",
    [userId, clubId]
  );

  await addAudit(+clubId, userId, userId, "activate membership");
};

export const deactivateMembership = async (
  userId: number | undefined,
  clubId: string
) => {
  await pool.query(
    "UPDATE MemberList SET activated = false WHERE userId = $1 and clubId = $2",
    [userId, clubId]
  );

  await addAudit(+clubId, userId, userId, "deactivate membership");
};
