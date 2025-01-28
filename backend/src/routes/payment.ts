import express, { Response, Request } from "express";
import { AuthRequest } from "../types/AuthRequest";
import { authenticateToken } from "../utils/authentication";
import { calculateFee, stripe } from "../utils/stripe";
import pool from "../db/db";
import Stripe from "stripe";
import dotenv from "dotenv";
import { sendEmail } from "../utils/email";
dotenv.config();

const router = express.Router();

router.post("/", authenticateToken, async (req: AuthRequest, res: Response) => {
  const { amount, desc, id } = req.body;
  const integer = parseFloat(amount) * 100;
  const final = calculateFee(integer);
  try {
    if (isNaN(amount)) {
      throw new Error("Amount is not a number");
    }
    const transaction = await pool.query(
      "INSERT INTO transactions (memberId, ticketId) VALUES ($1, $2) RETURNING id",
      [req.user?.id, id]
    );
    const paymentIntent = await stripe.paymentIntents.create({
      amount: final,
      currency: "GBP",
      payment_method_types: ["card"],
      metadata: {
        transaction: transaction.rows[0].id,
      },
    });
    res.json({
      clientSecret: paymentIntent.client_secret,
    });

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: req.user?.email || "",
      subject: "Your ClubLink Receipt",
      html: `<!DOCTYPE html>
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
                    <span class="value">${transaction.rows[0].id}</span>
                </div>
            </div>

            <div class="payment-summary">
                <div style="font-size: 20px; margin-bottom: 10px;">
                    <strong>Amount Paid:</strong> £${amount}
                </div>
                <div class="detail-item">
                    <span class="label">For:</span>
                    <span class="value">${desc}</span>
                </div>
            </div>
        </div>
    </div>
</body>
</html>`,
    };

    await sendEmail(req.user?.email || "", mailOptions);
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
        const status = statusMap[event.type] || paymentIntent.status;

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
