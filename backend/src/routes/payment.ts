import express, { Response, Request } from "express";
import { AuthRequest } from "../types/AuthRequest";
import { authenticateToken } from "../utils/authentication";
import stripe from "../utils/stripe";
import { calculateFee } from "../utils/payment";
import pool from "../db/db";
import Stripe from "stripe";
import dotenv from "dotenv";
import { sendEmail } from "../utils/email";
import { MailOptions } from "../types/MailOptions";
import { activateMembership } from "../utils/club";
import { format } from "@fast-csv/format";

dotenv.config();

const router = express.Router();

router.post(
  "/transaction/new",
  authenticateToken,
  async (req: AuthRequest, res: Response) => {
    const { id, amount, transactiontype, method, ticket, promo, member } =
      req.body;

    try {
      await pool.query(
        "INSERT INTO transactions (memberId, ticketId, amount, clubId, type, promoCode, transactionType, status) VALUES ($1, $2, $3, $4, $5, $6, $7, 'succeeded');",
        [member, ticket, amount, id, method, promo, transactiontype]
      );
      res.status(200).json({ message: "Transaction Created Successfully" });
    } catch (err) {
      console.error("Error creating transaction: ", err); // eslint-disable-line no-console
      res.status(500).json({ error: "Error creating transaction" });
    }
  }
);

router.get("/:id/transactions/export", async (req: Request, res: Response) => {
  const { id } = req.params;
  const token = req.headers.authorization?.split(" ")[1];

  if (!token) {
    res.status(403).json({ message: "Forbidden" });
    return;
  }

  try {
    const result = await pool.query(
      `SELECT 
         t.id, 
         t.memberid, 
         u.name AS member_name,
         t.ticketid, 
         tk.name AS ticket_name,
         t.amount, 
         t.transactiontype, 
         t.status, 
         t.type, 
         pc.code AS promocode,
         t.time,
         t.updated_at
       FROM transactions t
       LEFT JOIN users u ON u.id = t.memberid
       LEFT JOIN tickets tk ON tk.id = t.ticketid
       LEFT JOIN promocodes pc ON pc.id = t.promocode
       WHERE t.clubid = $1
       ORDER BY t.time DESC`,
      [id]
    );

    res.setHeader("Content-Type", "text/csv");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=club-${id}-transactions.csv`
    );

    const csvStream = format({ headers: true });
    csvStream.pipe(res);

    result.rows.forEach((row) => {
      csvStream.write({
        ID: row.id,
        MemberID: row.memberid,
        MemberName: row.member_name || "",
        TicketID: row.ticketid,
        TicketName: row.ticket_name || "",
        Amount: row.amount,
        Type: row.transactiontype ? "IN" : "OUT",
        Status: row.status,
        Method: row.type,
        PromoCode: row.promocode || "N/A",
        CreatedAt: new Date(row.time).toLocaleString(),
        updated_at: row.updated_at
          ? new Date(row.updated_at).toISOString()
          : "N/A",
      });
    });

    csvStream.end();
  } catch (err) {
    console.error("CSV Export Error:", err); // eslint-disable-line no-console
    res.status(500).json({ message: "Failed to export transactions" });
  }
});

router.post("/", authenticateToken, async (req: AuthRequest, res: Response) => {
  const { amount, desc, id, promo } = req.body;
  let integer = Math.round(parseFloat(amount) * 100);
  let discount;
  try {
    if (isNaN(amount)) {
      throw new Error("Amount is not a number");
    }

    const ticket = await pool.query(
      "SELECT clubId, bookingFee FROM tickets WHERE id = $1",
      [id]
    );

    const ticketPrice = (integer / 100).toFixed(2);

    let promoId;
    if (promo) {
      const codes = await pool.query(
        "SELECT discount, id FROM promocodes WHERE code = $1",
        [promo]
      );
      discount = integer * codes.rows[0].discount;
      integer -= discount;
      promoId = codes.rows[0].id;
    }
    const bookingFee = ticket.rows[0].bookingfee;
    const final = bookingFee ? calculateFee(integer) : Math.round(integer);
    const paymentFee = bookingFee ? ((final - integer) / 100).toFixed(2) : 0;
    const totalPrice = (final / 100).toFixed(2);

    const transaction = await pool.query(
      "INSERT INTO transactions (memberId, ticketId, amount, type, clubId, promoCode) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id",
      [req.user?.id, id, totalPrice, "Card", ticket.rows[0].clubid, promoId]
    );

    const paymentIntent = await stripe.paymentIntents.create({
      amount: final,
      currency: "GBP",
      payment_method_types: ["card"],
      metadata: {
        transaction: transaction.rows[0].id,
        ticketId: id,
        ticketPrice,
        paymentFee,
        totalPrice,
        email: req.user?.email || "",
        desc,
        userId: req.user?.id || 0,
        clubId: ticket.rows[0].clubid,
        discount: discount?.toFixed(2) || "",
        bookingFee,
      },
    });
    res.json({
      clientSecret: paymentIntent.client_secret,
    });
  } catch (err) {
    console.error("Error creating payment: ", err); // eslint-disable-line no-console
    res.status(500).json({ error: err });
  }
});

router.post(
  "/webhook",
  express.raw({ type: "application/json" }),
  async (req: Request, res: Response) => {
    const statusMap: Record<string, string> = {
      "payment_intent.succeeded": "succeeded",
      "payment_intent.payment_failed": "failed",
      "payment_intent.canceled": "cancelled",
    };
    try {
      const sig = req.headers["stripe-signature"]!;
      const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET!;
      const event = stripe.webhooks.constructEvent(
        req.body,
        sig,
        endpointSecret
      );
      if (event.type.startsWith("payment_intent.")) {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        const transaction = paymentIntent.metadata.transaction;
        const ticketPrice = paymentIntent.metadata.ticketPrice;
        const paymentFee = paymentIntent.metadata.paymentFee;
        const totalPrice = paymentIntent.metadata.totalPrice;
        const email = paymentIntent.metadata.email;
        const desc = paymentIntent.metadata.desc;
        const status = statusMap[event.type] || paymentIntent.status;
        const userId = paymentIntent.metadata.userId;
        const clubId = paymentIntent.metadata.clubId;
        const discount = paymentIntent.metadata.discount;
        const bookingFee = paymentIntent.metadata.bookingFee;
        const tikcetId = paymentIntent.metadata.ticketId;

        if (status === "succeeded") {
          const mailOptions = {
            from: process.env.EMAIL_USER,
            to: email,
            subject: "Your ClubLink Receipt",
            html: `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>ClubLink Payment Receipt</title>
        <style>
            body { margin: 0; padding: 0; font-family: 'Arial', sans-serif; line-height: 1.6; color: #333333; }
            img { border: none; max-width: 100%; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { text-align: center; padding: 20px 0; border-bottom: 2px solid #f0f0f0; }
            .content { padding: 30px 20px; }
            .heading { color: #2c3e50; font-size: 24px; margin-bottom: 25px; }
            .details-box { 
                background: #f8f9fa; 
                border-radius: 8px;
                padding: 25px;
                margin: 20px 0;
            }
            .detail-item { margin-bottom: 15px; }
            .label { color: #7f8c8d; font-weight: 500; }
            .value { color: #2c3e50; font-weight: 600; }
            .payment-summary { 
                background: #e8f4ff;
                border-left: 4px solid #3498db;
                padding: 20px;
                margin: 25px 0;
            }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="content">
                <h1 class="heading">Payment Receipt</h1>
                
                <p>Hello,</p>
                <p>Thank you for your payment to ClubLink. Here's your receipt:</p>

                <div class="details-box">
                    <div class="detail-item">
                        <span class="label">Transaction ID:</span>
                        <span class="value">${transaction}</span>
                    </div>
                    <div class="detail-item">
                        <span class="label">Description:</span>
                        <span class="value">${desc}</span>
                    </div>
                </div>

                <div class="payment-summary">
                    <div style="font-size: 20px; margin-bottom: 10px;">
                        <strong>Payment Breakdown:</strong>
                    </div>
                    <div class="detail-item">
                        <span class="label">Ticket Price:</span>
                        <span class="value">£${ticketPrice}</span>
                    </div>
                    ${
                      discount
                        ? `<div class="detail-item">
                        <span class="label">Discount:</span>
                        <span class="value">-£${(+discount / 100).toFixed(
                          2
                        )}</span>
                        </div>`
                        : ""
                    }
                    ${
                      bookingFee === "true"
                        ? `<div class="detail-item">
                        <span class="label">Payment Fee:</span>
                        <span class="value">£${paymentFee}</span>
                    </div>`
                        : ""
                    }
                    <div class="detail-item" style="font-size: 18px; font-weight: bold;">
                        <span class="label">Total Amount Paid:</span>
                        <span class="value">£${totalPrice}</span>
                    </div>
                </div>

                <p>If you have any questions or concerns, please contact us at support@clublink.live.</p>
            </div>
        </div>
    </body>
    </html>
  `,
          };

          await sendEmail(email, mailOptions);
          await activateMembership(+userId, clubId);
        }

        if (status === "failed") {
          const mailOptions: MailOptions = {
            from: process.env.EMAIL_USER,
            to: email,
            subject: "Payment Failed - Action Required",
            html: `
      <div style="font-family: Arial, sans-serif; padding: 20px; background-color: #f8f9fa;">
        <div style="max-width: 600px; margin: 0 auto; background: #ffffff; padding: 20px; border-radius: 8px; box-shadow: 0px 2px 8px rgba(0,0,0,0.1);">
          <h2 style="color: #e63946; text-align: center; margin-bottom: 20px;">Payment Failed</h2>
          <p style="font-size: 16px; color: #333333;">
            Dear Customer,
          </p>
          <p style="font-size: 16px; color: #333333;">
            Unfortunately, your recent payment attempt was unsuccessful. Please check your payment details and try again. If the issue persists, feel free to contact our support team for assistance.
          </p>
          <div style="margin: 20px 0; text-align: center;">
            <a href="${process.env.FRONTEND_URL}/payments/${tikcetId}"
               style="display: inline-block; padding: 12px 20px; background-color: #007bff; color: #ffffff; text-decoration: none; border-radius: 5px; font-weight: bold;">
               Retry Payment
            </a>
          </div>
          <hr style="border: none; border-top: 1px solid #eeeeee; margin: 20px 0;">
          <p style="font-size: 14px; color: #666666; text-align: center;">
            If you have any questions or need further assistance, please don’t hesitate to reach out to our support team at <a href="mailto:support@clublink.live" style="color: #007bff;">support@clublink.live</a>.
          </p>
          <p style="font-size: 12px; color: #999999; text-align: center; margin-top: 20px;">
            This is an automated email. Please do not reply.
          </p>
        </div>
      </div>
    `,
          };

          await sendEmail(email, mailOptions);
        }

        if (!transaction) {
          throw new Error("No Transaction Reference");
        }
        await pool.query(
          "UPDATE transactions SET status = $1, updated_at = $2 WHERE id = $3",
          [status, new Date().toISOString(), transaction]
        );
        res.status(200).end();
      }
    } catch (err) {
      console.error("Error Receiving Webhook: ", err); // eslint-disable-line no-console
      res.status(400).end();
    }
  }
);

export default router;
