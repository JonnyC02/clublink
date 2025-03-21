import express, { Request, Response } from "express";
import pool from "../db/db";
import { authenticateToken } from "../utils/authentication";
import { AuthRequest } from "../types/AuthRequest";
import { addAudit } from "../utils/audit";
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

    let result;

    try {
      for (const ticket of tickets) {
        const price = +ticket.price;
        result = await pool.query(
          "UPDATE tickets SET price = $1, ticketExpiry = $2, cashEnabled = $3, date = $4, bookingFee = $5 WHERE id = $6 RETURNING clubId",
          [
            price,
            ticket.ticketexpiry,
            ticket.cashenabled,
            ticket.date,
            ticket.bookingfee,
            ticket.id,
          ]
        );
      }
      await addAudit(
        result?.rows[0].clubid,
        undefined,
        req.user?.id,
        `Edited Tickets`
      );
      res.status(200).json({ message: "Tickets Updated" });
    } catch (err) {
      console.error("There was an error: ", err); // eslint-disable-line no-console
      res
        .status(500)
        .json({ message: "There was an error updating the tickets" });
    }
  }
);

router.post(
  "/code/save",
  authenticateToken,
  async (req: AuthRequest, res: Response) => {
    const { code } = req.body;

    if (!code) {
      res.status(400).json({ message: "Bad Request" });
      return;
    }

    try {
      const discount = code.discount / 100;

      const result = await pool.query(
        "UPDATE promocodes SET discount = $1, maxuse = $2, ticketid = $3, expirydate = $4, code = $5 WHERE id = $6 RETURNING clubid",
        [
          discount,
          code.maxuse,
          code.ticketid,
          code.expirydate,
          code.code,
          code.id,
        ]
      );
      await addAudit(
        result.rows[0].clubid,
        undefined,
        req.user?.id,
        "Edited Promo Code"
      );
      res.status(200).json({ message: "Code Updated" });
    } catch (err) {
      console.error("There was an error: ", err); // eslint-disable-line no-console
      res.status(500).json({ message: "There was an error updating the code" });
    }
  }
);

router.post(
  "/code/delete",
  authenticateToken,
  async (req: AuthRequest, res: Response) => {
    const { id } = req.body;

    if (!id) {
      res.status(400).json({ message: "Bad Request" });
      return;
    }

    try {
      const result = await pool.query(
        "DELETE FROM promocodes WHERE id = $1 RETURNING clubid",
        [id]
      );

      await addAudit(
        result.rows[0].clubid,
        undefined,
        req.user?.id,
        "Deleted Promo Code"
      );

      res.status(200).json({ message: "Promo Code Deleted" });
    } catch (err) {
      console.error("There was an error: ", err); // eslint-disable-line no-console
      res.status(500).json({ message: "There was an error deleting the code" });
    }
  }
);

router.post(
  "/code/add",
  authenticateToken,
  async (req: AuthRequest, res: Response) => {
    const { clubId } = req.body;

    if (!clubId) {
      res.status(400).json({ message: "Bad Request" });
      return;
    }

    try {
      const tickets = await pool.query(
        "SELECT id FROM tickets WHERE clubId = $1",
        [clubId]
      );
      await pool.query(
        "INSERT INTO promocodes (ticketid, clubid, discount, code) VALUES ($1, $2, 0.5, 'DEFAULT')",
        [tickets.rows[0].id, clubId]
      );

      await addAudit(clubId, undefined, req.user?.id, "Add Promo Code");

      res.status(200).json({ message: "Promo Code Added" });
    } catch (err) {
      console.error("There was an error: ", err); // eslint-disable-line no-console
      res.status(500).json({ message: "There was an error adding the code" });
    }
  }
);

router.post("/code/validate", async (req: Request, res: Response) => {
  const { code, ticketId } = req.body;

  if (!code) {
    res.status(400).json({ message: "Bad Request" });
    return;
  }

  const result = await pool.query(
    "SELECT * FROM promocodes WHERE code = $1 AND ticketId = $2",
    [code, ticketId]
  );

  if (result.rows.length < 1) {
    res.status(404).json({ message: "No Promo Code Found" });
    return;
  }

  const uses = await pool.query(
    "SELECT id FROM transactions WHERE promoCode = $1",
    [result.rows[0].id]
  );

  if (result.rows[0].expirydate) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const expiry = new Date(result.rows[0].expirydate);
    expiry.setHours(0, 0, 0, 0);

    if (today > expiry) {
      res.status(403).json({ message: "Promo Code has Expired" });
      return;
    }
  }

  if (uses >= result.rows[0].maxuses && result.rows[0].maxuses !== 0) {
    res.status(403).json({ message: "Max Uses Reached" });
    return;
  }

  res.status(200).json({ discount: result.rows[0].discount });
});

export default router;
