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
dotenv.config();

const router = express.Router();

router.post("/", authenticateToken, async (req: AuthRequest, res: Response) => {
  const { amount, desc, id, promo } = req.body;
  let integer = Math.round(parseFloat(amount) * 100);
  let discount;
  try {
    if (isNaN(amount)) {
      throw new Error("Amount is not a number");
    }

    const ticket = await pool.query(
      "SELECT clubId FROM tickets WHERE id = $1",
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

    const final = calculateFee(integer);
    const paymentFee = ((final - integer) / 100).toFixed(2);
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
        ticketPrice,
        paymentFee,
        totalPrice,
        email: req.user?.email || "",
        desc,
        userId: req.user?.id || 0,
        clubId: ticket.rows[0].clubid,
        discount: discount?.toFixed(2) || "",
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
                    <div class="detail-item">
                        <span class="label">Payment Fee:</span>
                        <span class="value">£${paymentFee}</span>
                    </div>
                    <div class="detail-item" style="font-size: 18px; font-weight: bold;">
                        <span class="label">Total Amount Paid:</span>
                        <span class="value">£${totalPrice}</span>
                    </div>
                </div>

                <p>If you have any questions or concerns, please contact us at support@clublink.com.</p>
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
            <a href="${process.env.FRONTEND_URL}/payments/1"
               style="display: inline-block; padding: 12px 20px; background-color: #007bff; color: #ffffff; text-decoration: none; border-radius: 5px; font-weight: bold;">
               Retry Payment
            </a>
          </div>
          <hr style="border: none; border-top: 1px solid #eeeeee; margin: 20px 0;">
          <p style="font-size: 14px; color: #666666; text-align: center;">
            If you have any questions or need further assistance, please don’t hesitate to reach out to our support team at <a href="mailto:support@clublink.com" style="color: #007bff;">support@clublink.com</a>.
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
