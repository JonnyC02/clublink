import pool from "../db/db";

export const isStudent = async (id: number | undefined) => {
  try {
    const result = await pool.query(
      "SELECT studentnumber FROM users WHERE id = $1",
      [id]
    );

    if (result.rowCount === 0) {
      throw new Error("User not found!");
    }

    return !!result.rows[0].studentnumber;
  } catch (err) {
    console.error("Error Checking: ", err); // eslint-disable-line no-console
    throw err;
  }
};

export const hasPendingRequest = async (
  userId: number,
  clubId: number
): Promise<boolean> => {
  try {
    const result = await pool.query(
      "SELECT 1 FROM requests WHERE memberId = $1 AND clubId = $2 AND status = $3",
      [userId, clubId, "Pending"]
    );

    return result.rows.length > 0;
  } catch (error) {
    console.error("Error checking pending request:", error); // eslint-disable-line no-console
    throw new Error("Failed to check pending request.");
  }
};

export const getAllClubs = async (userId: number | undefined) => {
  try {
    if (!userId) {
      throw new Error("No User Id");
    }

    const result = await pool.query(
      `
      SELECT 
          c.id AS clubId,
          c.name AS clubName,
          c.shortDescription,
          c.image,
          m.status,
          CASE
              WHEN m.memberType = 'Committee' THEN true
              ELSE false
          END AS isCommittee,
          t.id AS ticketId,
          t.name AS ticketName,
          t.price AS ticketPrice,
          t.ticketType,
          t.ticketFlag
      FROM 
          MemberList m
      INNER JOIN 
          Clubs c ON m.clubId = c.id
      INNER JOIN 
          Users u ON m.memberId = u.id
      LEFT JOIN 
          Tickets t ON m.clubId = t.clubId 
          AND (
              (u.studentNumber IS NOT NULL AND t.ticketFlag = 'Student') OR
              (u.studentNumber IS NULL AND t.ticketFlag = 'Associate')
          )
      WHERE 
          m.memberId = $1;
      `,
      [userId]
    );

    return result.rows.map((row) => ({
      id: row.clubid,
      name: row.clubname,
      shortdescription: row.shortdescription,
      image: row.image,
      status: row.status,
      iscommittee: row.iscommittee,
      membershipticket:
        row.status !== "Expired" && row.status !== "Pending"
          ? null
          : row.ticketid,
    }));
  } catch (error) {
    console.error("Error fetching user memberships:", error); // eslint-disable-line no-console
    throw new Error("Failed to fetch user memberships");
  }
};
