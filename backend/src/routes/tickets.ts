import express, { Request, Response } from "express";
import pool from "../db/db";
const router = express.Router();

router.get("/:id", async (req: Request, res: Response) => {
  const { id } = req.params;

  try {
    const result = await pool.query("SELECT * FROM tickets WHERE id = $1", [
      id,
    ]);

    if (result.rows.length === 0) {
      throw new Error("No Tickets");
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error("Error Fetching Ticket Details: ", err); // eslint-disable-line no-console
    res.status(500).json({ message: "Error Fetching Ticket Details" });
  }
});

export default router;
