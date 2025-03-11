import express, { Request, Response } from "express";
import pool from "../db/db";
import { authenticateToken, getUserId } from "../utils/authentication";
import { hasPendingRequest, isStudent } from "../utils/user";
import {
  activateMembership,
  approveRequest,
  denyRequest,
  expireRequest,
  joinClub,
  requestJoinClub,
} from "../utils/club";
import multer from "multer";
import dotenv from "dotenv";
import { AuthRequest } from "../types/AuthRequest";
import { convertToWebp, uploadFile } from "../utils/file";
import { addAudit } from "../utils/audit";
import jwt from "jsonwebtoken";
import { requestToken } from "../types/token";
dotenv.config();

const router = express.Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 2 * 1024 * 1024 },
});

const uploadMiddleware = upload.fields([
  { name: "headerImage", maxCount: 1 },
  { name: "image", maxCount: 1 },
]);

router.post("/", async (req: AuthRequest, res: Response) => {
  const { latitude, longitude, limit } = req.body;

  try {
    const userId = req.user?.id;
    let query: string;
    let params: string[] = [];

    const userResult = await pool.query(
      "SELECT university FROM Users WHERE id = $1",
      [userId]
    );
    const userUniversity =
      userResult.rows.length > 0 ? userResult.rows[0].university : null;

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
                    popularity DESC
                ${limit ? "LIMIT $4" : ""};
            `;
      params = [latitude, longitude, userUniversity];
      if (limit) params.push(limit);
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
                    popularity DESC
                ${limit ? "LIMIT $2" : ""};
            `;
      params = [userUniversity];
      if (limit) params.push(limit);
    }
    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (error) {
    console.error("Error fetching clubs:", error); // eslint-disable-line no-console
    res.status(500).json({ message: "Internal Server Error" });
  }
});

router.get("/:id", async (req: Request, res: Response) => {
  const { id } = req.params;
  let userId;
  if (req.headers["authorization"]) {
    userId = getUserId(req.headers["authorization"]);
  }

  if (!id) {
    res.status(400).json({ message: "Invalid request. Missing club ID." });
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
                c.ratio,
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
      res.status(404).json({ message: "Club not found." });
      return;
    }

    const clubData = result.rows[0];
    let hasPending = false;
    const ismember = clubData.ismember;
    delete clubData.ismember;

    if (userId) {
      hasPending = await hasPendingRequest(userId, parseInt(id));
    }

    res.json({ Club: clubData, hasPending, ismember });
  } catch (error) {
    console.error("Error fetching club:", error); // eslint-disable-line no-console
    res.status(500).json({ message: "Internal server error." });
  }
});

router.get("/:id/all", async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await pool.query(
    "SELECT name, email, description, shortdescription, image, headerimage FROM clubs WHERE id = $1",
    [id]
  );

  if (result.rows.length === 0) {
    res.status(404).json({ message: "Club not Found" });
    return;
  }

  const memberList = await pool.query(
    `
        SELECT 
            ml.memberId, 
            ml.memberType, 
            ml.created_at,
            ml.status, 
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
        ORDER BY ml.memberId
        `,
    [id]
  );

  const auditlog = await pool.query(
    `
    SELECT
      al.id,
      al.actionType,
      al.created_at,
      actor.name AS user,
      target.name AS member
    FROM
      AuditLog al
    LEFT JOIN
      Users actor ON al.memberId = actor.id
    LEFT JOIN
      Users target ON al.userId = target.id
    WHERE
      al.clubId = $1
    ORDER BY
      al.created_at DESC;
  `,
    [id]
  );

  const tickets = await pool.query(
    `SELECT * FROM tickets WHERE clubId = $1 ORDER BY id`,
    [id]
  );

  const promo = await pool.query(
    `SELECT * FROM promocodes WHERE clubId = $1 ORDER BY id`,
    [id]
  );

  res.json({
    Club: result.rows[0],
    MemberList: memberList.rows,
    AuditLog: auditlog.rows,
    Tickets: tickets.rows,
    Promo: promo.rows,
  });
});

router.post(
  "/:id/activate",
  authenticateToken,
  async (req: AuthRequest, res: Response) => {
    const { id } = req.params;
    const { memberId } = req.body;

    if (!id || !memberId) {
      res.status(400).json({
        message: "Invalid request. Club ID and Member ID are required.",
      });
      return;
    }

    try {
      const result = await pool.query(
        "UPDATE memberlist SET status = 'Active' WHERE memberId = $1 AND clubId = $2 RETURNING memberId",
        [memberId, id]
      );

      if (result.rows.length === 0) {
        res.status(404).json({ message: "Member not found." });
        return;
      }

      await addAudit(+id, memberId, req.user?.id, "Activate Membership");

      res.status(200).json({ message: "Member activated successfully" });
    } catch (err) {
      console.error("Error activating member:", err); // eslint-disable-line no-console
      res.status(500).json({ message: "Internal server error" });
    }
  }
);

router.post(
  "/:id/expire",
  authenticateToken,
  async (req: AuthRequest, res: Response) => {
    const { id } = req.params;
    const { memberId } = req.body;

    if (!id || !memberId) {
      res.status(400).json({
        message: "Invalid request. Club ID and Member ID are required.",
      });
      return;
    }

    try {
      const result = await pool.query(
        "UPDATE memberlist SET status = 'Expired' WHERE memberId = $1 AND clubId = $2 RETURNING memberId",
        [memberId, id]
      );

      if (result.rows.length === 0) {
        res.status(404).json({ message: "Member not found." });
        return;
      }

      await addAudit(+id, memberId, req.user?.id, "Expire Membership");
      res.status(200).json({ message: "Membership Expired Successfully" });
    } catch (err) {
      console.error("Error expiring member: ", err); // eslint-disable-line no-console
      res.status(500).json({ message: "Internal Server Error" });
    }
  }
);

router.get("/:id/committee", async (req: Request, res: Response) => {
  const { id } = req.params;

  if (!id) {
    res.status(400).json({ message: "No Id Provided!" });
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
});

router.get("/:id/is-committee", async (req: Request, res: Response) => {
  const { id } = req.params;
  const userId = getUserId(req.headers.authorization);

  if (!userId) {
    res.status(401).json({ message: "Unauthorized" });
    return;
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
    console.error("Error checking committee status:", err); // eslint-disable-line no-console
    res.status(500).json({ message: "Internal Server Error" });
  }
});

router.get(
  "/join/:id",
  authenticateToken,
  async (req: AuthRequest, res: Response) => {
    const { id } = req.params;
    const userId = req.user?.id;
    const clubRatio = await pool.query(
      "SELECT ratio FROM clubs WHERE id = $1",
      [id]
    );
    const student = await isStudent(userId);
    if (student || clubRatio.rows[0].ratio < 0.2) {
      const result = await pool.query(
        "SELECT id, date FROM tickets WHERE clubId = $1 AND ticketType = 'Membership' AND ticketFlag = 'Student'",
        [id]
      );

      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const ticketDate = new Date(result.rows[0].date);
      ticketDate.setHours(0, 0, 0, 0);

      if (result.rows.length < 1) {
        await joinClub(id, userId);
        await activateMembership(userId, id);
        res.json({ message: "Successfully Joined Club" });
      } else if (ticketDate <= today) {
        res
          .status(403)
          .json({ message: "Club Membership has ended for the year!" });
      } else {
        await joinClub(id, userId);
        res.json({
          message: "Successfully Joined Club",
          ticket: result.rows[0].id,
        });
      }
    } else {
      await requestJoinClub(id, userId);
      res.json({ message: "Sent Request to Join", type: "request" });
    }
  }
);

router.post(
  "/:id/edit",
  authenticateToken,
  async (req: AuthRequest, res: Response) => {
    const { id } = req.params;
    const { description, shortdescription, headerimage, image } = req.body;

    try {
      const result = await pool.query(
        `
            UPDATE clubs
            SET 
                description = $1,
                shortdescription = $2,
                headerimage = COALESCE($3, headerimage),
                image = COALESCE($4, image)
            WHERE id = $5
            RETURNING *;
            `,
        [description, shortdescription, headerimage, image, id]
      );

      if (result.rowCount === 0) {
        res.status(404).json({ message: "Club not found." });
        return;
      }

      await addAudit(+id, req.user?.id, undefined, "Edit Club Details");

      res.json({
        message: "Club details updated successfully.",
        club: result.rows[0],
      });
    } catch (err) {
      console.error("Error updating club details:", err); // eslint-disable-line no-console
      res.status(500).json({ message: "Internal server error." });
    }
  }
);

router.post(
  "/upload",
  authenticateToken,
  uploadMiddleware,
  async (req: Request, res: Response) => {
    try {
      const files = req.files as Record<string, Express.Multer.File[]>;
      if (Object.keys(JSON.stringify(files))) {
        res.status(200).json({ message: "No Files to upload" });
        return;
      }
      let headerimage = undefined;
      let image = undefined;
      if (files.headerImage?.length > 0) {
        headerimage = files.headerImage[0];
      }

      if (files.image?.length > 0) {
        image = files.image[0];
      }

      const { clubId } = req.body;
      let imageUrl = undefined;
      let headerImageUrl = undefined;

      if ((!headerimage && !image) || !clubId) {
        res.status(400).json({ message: "Files and clubId are required." });
        return;
      }
      if (image) {
        const uploadImage = await convertToWebp(image);
        imageUrl = await uploadFile(uploadImage, clubId);
      }

      if (headerimage) {
        const uploadHeaderImage = await convertToWebp(headerimage);
        headerImageUrl = await uploadFile(uploadHeaderImage, clubId);
      }

      res.status(200).json({
        message: "File uploaded successfully.",
        headerImageUrl,
        imageUrl,
      });
    } catch (error) {
      console.error("Error uploading file:", error); // eslint-disable-line no-console
      res.status(500).json({ message: "Failed to upload file." });
    }
  }
);

router.post(
  "/requests/approve",
  authenticateToken,
  async (req: AuthRequest, res: Response) => {
    const { request } = req.body;

    try {
      const decoded = jwt.decode(request) as requestToken | null;

      if (!decoded || !decoded.reqId) {
        res.status(400).json({
          message: "Invalid request token.",
        });
        await expireRequest(decoded?.reqId);
        return;
      }

      const reqId = decoded.reqId;

      jwt.verify(request, process.env.JWT_SECRET!);

      const userId = req.user?.id;
      const clubId = await approveRequest(reqId, userId);
      const result = await pool.query(
        "SELECT id FROM tickets WHERE clubId = $1 AND ticketType = 'Membership' AND ticketFlag = 'Associate'",
        [clubId]
      );
      if (result.rows.length <= 0) {
        await activateMembership(userId, clubId);
        res.json({ message: "Successfully accepted request" });
      } else {
        res.json({
          message: "Successfully accepted request",
          ticket: result.rows[0].id,
        });
      }
    } catch (err) {
      console.error(err); // eslint-disable-line no-console
      res.status(500).json({ messsage: "Failed to approve request" });
    }
  }
);

router.post(
  "/requests/deny",
  authenticateToken,
  async (req: AuthRequest, res: Response) => {
    const { request } = req.body;

    try {
      const decoded = jwt.decode(request) as requestToken | null;

      if (!decoded || !decoded.reqId) {
        res.status(400).json({
          message: "Invalid request token.",
        });
        await expireRequest(decoded?.reqId);
        return;
      }
      const reqId = decoded.reqId;

      jwt.verify(request, process.env.JWT_SECRET!);

      const userId = req.user?.id;
      await denyRequest(reqId, userId);
      res.json({ message: "Successfully denied request" });
    } catch (err) {
      console.error(err); // eslint-disable-line no-console
      res.status(500).json({
        message: "Failed to deny request the request may have expired",
      });
    }
  }
);

router.post(
  "/:id/kick",
  authenticateToken,
  async (req: AuthRequest, res: Response) => {
    const { id } = req.params;
    const { userId } = req.body;
    if (!id || !userId) {
      res.status(400).json({
        message: "Invalid request. Club ID and Member ID are required.",
      });
      return;
    }

    try {
      const result = await pool.query(
        "DELETE FROM MemberList WHERE clubId = $1 AND memberId = $2 RETURNING id",
        [id, userId]
      );

      if (result.rows.length === 0) {
        res.status(404).json({ message: "Member not found." });
        return;
      }

      await addAudit(+id, req.user?.id, userId, "Kick");
      res.status(200).json({ message: "Member removed successfully" });
    } catch (err) {
      console.error("Error removing member:", err); // eslint-disable-line no-console
      res.status(500).json({ message: "Internal server error" });
    }
  }
);

router.post(
  "/:id/activate/bulk",
  authenticateToken,
  async (req: AuthRequest, res: Response) => {
    const { id } = req.params;
    const { members } = req.body;

    if (members.length === 0 || !id) {
      res.status(400).json({
        message: "Invalid request. Club ID and Member ID are required.",
      });
      return;
    }

    try {
      const queryText = `UPDATE memberlist SET status = 'Active' WHERE memberId = ANY($1::int[]) AND clubId = $2 AND status <> 'Active' RETURNING memberid;`;

      const result = await pool.query(queryText, [members, id]);
      res.status(200).json({ amount: result.rowCount });
    } catch (err) {
      console.error("Error activating members: ", err); // eslint-disable-line no-console
      res.status(500).json({ message: "Internal Server Error" });
    }
  }
);

router.post(
  "/:id/expire/bulk",
  authenticateToken,
  async (req: AuthRequest, res: Response) => {
    const { id } = req.params;
    const { members } = req.body;

    if (members.length === 0 || !id) {
      res.status(400).json({
        message: "Invalid request. Club ID and Member ID are required.",
      });
      return;
    }

    try {
      const queryText = `UPDATE memberlist SET status = 'Expired' WHERE memberId = ANY($1::int[]) AND clubId = $2 AND status <> 'Expired' RETURNING memberid;`;
      const result = await pool.query(queryText, [members, id]);
      res.status(200).json({ amount: result.rowCount });
    } catch (err) {
      console.error("Error expiring members: ", err); // eslint-disable-line no-console
      res.status(500).json({ message: "Internal Server Error" });
    }
  }
);

router.post(
  "/:id/remove/bulk",
  authenticateToken,
  async (req: AuthRequest, res: Response) => {
    const { id } = req.params;
    const { members } = req.body;

    if (members.length === 0 || !id) {
      res.status(400).json({
        message: "Invalid request. Club ID and Member ID are required.",
      });
      return;
    }

    try {
      const queryText = `DELETE FROM memberlist WHERE clubId = $1 AND memberId = ANY($2::int[]) RETURNING memberid;`;
      const result = await pool.query(queryText, [members, id]);
      res.status(200).json({ amount: result.rowCount });
    } catch (err) {
      console.error("Error expiring members: ", err); // eslint-disable-line no-console
      res.status(500).json({ message: "Internal Server Error" });
    }
  }
);

export default router;
