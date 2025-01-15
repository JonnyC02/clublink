import express, { Response } from "express";
import { authenticateToken } from "../utils/authentication";
import { getAllClubs } from "../utils/user";
import { AuthRequest } from "../types/AuthRequest";

const router = express.Router();

router.get(
  "/clubs",
  authenticateToken,
  async (req: AuthRequest, res: Response) => {
    try {
      const clubs = await getAllClubs(req.user?.id);
      res.json(clubs);
    } catch (error) {
      console.error("Error fetching clubs:", error); // eslint-disable-line no-console
      res.status(500).json({ message: "Internal server error" });
    }
  }
);

export default router;
