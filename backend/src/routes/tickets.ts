import express, { Request, Response } from "express";
import pool from "../db/db";
import { authenticateToken } from "../utils/authentication";
import { AuthRequest } from "../types/AuthRequest";
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

router.post(
  "/edit",
  authenticateToken,
  async (req: AuthRequest, res: Response) => {
    const { tickets } = req.body;

    if (!tickets) {
      res.status(400).json({ message: "Bad Request" });
      return;
    }

    try {
      for (const ticket of tickets) {
        const price = +ticket.price;
        await pool.query(
          "UPDATE tickets SET price = $1, ticketExpiry = $2 WHERE id = $3",
          [price, ticket.ticketexpiry, ticket.id]
        );
      }
      res.status(200).json({ message: "Tickets Updated" });
    } catch (err) {
      console.error("There was an error: ", err); // eslint-disable-line no-console
      res
        .status(500)
        .json({ message: "There was an error updating the tickets" });
    }
  }
);

export default router;
