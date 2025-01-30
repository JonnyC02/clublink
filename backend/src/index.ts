import express, { Express, Request, Response } from "express";
import cors from "cors";
import { hidePoweredBy } from "helmet";
import authRoutes from "./routes/auth";
import paymentRoutes from "./routes/payment";
import clubRoutes from "./routes/clubs";
import ticketRoutes from "./routes/tickets";
import userRoutes from "./routes/user";
import session from "express-session";
import dotenv from "dotenv";
import pool from "./db/db";
import queue from "./utils/queue";
import { sendEmail } from "./utils/email";
import { MailOptions } from "./types/MailOptions";
dotenv.config();

const UNIVERSITIES: object[] = [];

// file deepcode ignore UseCsurfForExpress: handled by express-session same site parameter
const app: Express = express();
const PORT = process.env.PORT || 3001;
const PRODUCTION: boolean = !!process.env.PRODUCTION;
const SECRET: string = "" + process.env.SESSION_SECRET;

app.use(
  session({
    secret: SECRET,
    resave: false,
    saveUninitialized: true,
    // deepcode ignore WebCookieSecureDisabledExplicitly: environment variable set to true on production
    cookie: { secure: PRODUCTION, sameSite: "strict" },
  })
);

app.use(express.json());
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    credentials: true,
  })
);
app.use(hidePoweredBy());

app.use("/auth", authRoutes);
app.use("/clubs", clubRoutes);
app.use("/user", userRoutes);
app.use("/payments", paymentRoutes);
app.use("/tickets", ticketRoutes);

app.get("/health", (req: Request, res: Response) => {
  try {
    res.status(200).json({ message: "Health Check!" });
  } catch (err) {
    console.error("CSRF error:", err); // eslint-disable-line no-console
    res.status(500).json({ error: "CSRF token error" });
  }
});

app.get("/universities", (req: Request, res: Response) => {
  try {
    res.status(200).json(UNIVERSITIES);
  } catch (err) {
    console.error(`Error Fetching Universities: ${err}`); //eslint-disable-line no-console
    res.status(500).json({ error: "Cannot Fetch Universities" });
  }
});

if (process.env.NODE_ENV !== "test") {
  const startServer = async () => {
    try {
      const mailOptions: MailOptions = {
        from: process.env.EMAIL_USER,
        to: "conneryjonathan@gmail.com",
        subject: `Space in Club`,
        html: `
    <div style="font-family: Arial, sans-serif; padding: 20px; background-color: #f4f4f4; text-align: center;">
      <div style="max-width: 600px; margin: 0 auto; background: #ffffff; padding: 20px; border-radius: 8px; box-shadow: 0px 0px 10px rgba(0,0,0,0.1);">
        <h2 style="color: #333; text-align: center;">You're Invited to Join XYZ Club!</h2>
        <p style="text-align: center;">Great news! A spot has opened up in <strong>XYZ Club</strong>, and we’d love to have you onboard.</p>
        <p style="font-weight: bold; text-align: center;">You have 48 hours to accept or decline this invitation before it expires.</p>

        <div style="margin: 20px 0; text-align: center;">
          <a href="https://yourclubsite.com/accept?userId=USER_ID&clubId=XYZ" 
             style="display: inline-block; padding: 12px 20px; background-color: #28a745; color: #fff; text-decoration: none; border-radius: 5px; font-weight: bold; margin-right: 10px;">
             ✅ Accept Invitation
          </a>

          <a href="https://yourclubsite.com/decline?userId=USER_ID&clubId=XYZ" 
             style="display: inline-block; padding: 12px 20px; background-color: #dc3545; color: #fff; text-decoration: none; border-radius: 5px; font-weight: bold;">
             ❌ Decline Invitation
          </a>
        </div>

        <hr style="border: none; border-top: 1px solid #ddd; margin: 20px 0;">

        <p style="color: #555; text-align: center;">If you do not respond within 48 hours, your spot will be offered to the next person on the waitlist.</p>

        <p style="color: #777; font-size: 12px; text-align: center;">This is an automated email. Please do not reply.</p>
      </div>
    </div>
  `,
      };

      queue.start();
      if (!process.env.REACT_APP_IS_TESTING) {
        const result = await pool.query(
          "SELECT acronym, name FROM universities"
        );
        if (result.rowCount === 0) {
          console.log("No Universities Retrieved!"); // eslint-disable-line no-console
        } else {
          for (const uni of result.rows) {
            UNIVERSITIES.push({ name: uni.name, acronym: uni.acronym });
          }
        }
      }

      app.listen(PORT, () => {
        console.log(`Server is running on http://localhost:${PORT}`); // eslint-disable-line no-console
      });
    } catch (err) {
      console.error("Error during server initialization:", err); // eslint-disable-line no-console
      process.exit(1);
    }
  };

  startServer();
}

export default app;
