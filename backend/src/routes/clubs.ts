import express, { Request, Response } from "express";
import pool from "../db/db";
import { authenticateToken, getUserId } from "../utils/authentication";
import { hasPendingRequest, isStudent } from "../utils/user";
import {
  approveRequest,
  denyRequest,
  joinClub,
  requestJoinClub,
} from "../utils/club";
import multer from "multer";
import dotenv from "dotenv";
import { AuthRequest } from "../types/AuthRequest";
import { convertToWebp, uploadFile } from "../utils/file";
import { addAudit } from "../utils/audit";
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
  const { latitude, longitude } = req.body;

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

  const requests = await pool.query(
    `
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
    `,
    [id]
  );

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

  res.json({
    Club: result.rows[0],
    Request: requests.rows,
    MemberList: memberList.rows,
    AuditLog: auditlog.rows,
  });
});

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
    const student = await isStudent(userId);
    if (student) {
      await joinClub(id, userId);
      res.json({ message: "Successfully Joined Club" });
    } else {
      await requestJoinClub(id, userId);
      res.json({ message: "Sent Request to Join" });
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
  "/requests/:id/approve",
  authenticateToken,
  async (req: AuthRequest, res: Response) => {
    const { id } = req.params;

    const userId = req.user?.id;

    try {
      await approveRequest(id, userId);
      res.json({ message: "Successfully approved requests" });
    } catch (err) {
      console.error(err); // eslint-disable-line no-console
      res.status(500).json({ messsage: "Failed to approve request" });
    }
  }
);

router.post(
  "/requests/:id/deny",
  authenticateToken,
  async (req: AuthRequest, res: Response) => {
    const { id } = req.params;

    const userId = req.user?.id;

    try {
      await denyRequest(id, userId);
      res.json({ message: "Successfully denied request" });
    } catch (err) {
      console.error(err); // eslint-disable-line no-console
      res.status(500).json({ message: "Failed to deny request" });
    }
  }
);

export default router;
