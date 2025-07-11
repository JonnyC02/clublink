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
dotenv.config();

// file deepcode ignore UseCsurfForExpress: handled by express-session same site parameter
const app: Express = express();
const PORT = +(process.env.PORT || 3001);
const PRODUCTION: boolean = !!process.env.PRODUCTION;
const SECRET: string = "" + process.env.SESSION_SECRET;

app.use(
  session({
    secret: SECRET,
    resave: false,
    saveUninitialized: true,
    cookie: { secure: PRODUCTION, sameSite: "strict" },
  })
);

app.use((req, res, next) => {
  if (req.originalUrl === "/payments/webhook") {
    next();
  } else {
    express.json()(req, res, next);
  }
});
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

app.get("/", (req: Request, res: Response) => {
  try {
    res.status(200).json({ message: "200 Yipee" });
  } catch (err) {
    console.error("Something went wrong!", err); // eslint-disable-line no-console
    res.status(500).json({ error: "Something went wrong!" });
  }
});

app.get("/universities", async (req: Request, res: Response) => {
  try {
    const unis = [];
    const result = await pool.query("SELECT acronym, name FROM universities");
    if (result.rowCount === 0) {
      console.log("No Universities Retrieved!"); // eslint-disable-line no-console
    } else {
      for (const uni of result.rows) {
        unis.push({ name: uni.name, acronym: uni.acronym });
      }
    }
    res.status(200).json(unis);
  } catch (err) {
    console.error(`Error Fetching Universities: ${err}`); //eslint-disable-line no-console
    res.status(500).json({ error: "Cannot Fetch Universities" });
  }
});

app.post("/subscribe", async (req: Request, res: Response) => {
  const { email } = req.body;

  const exists = await pool.query("SELECT * FROM newsletter WHERE email = $1", [
    email,
  ]);

  if (exists?.rows[0]?.email) {
    res.status(403).json({ error: "Already Subscribed" });
    return;
  }

  const result = await pool.query(
    "INSERT INTO newsletter (email) VALUES ($1) RETURNING id",
    [email]
  );

  if (result.rows.length) {
    res.status(200).json({ message: "Success" });
  } else {
    res.status(500).json({ error: "Failed" });
  }
});

if (process.env.NODE_ENV !== "test") {
  const startServer = async () => {
    try {
      queue.start();
      app
        .listen(PORT, "0.0.0.0", () => {
          console.log(`✅ Server running on http://localhost:${PORT}`); // eslint-disable-line no-console
        })
        .on("error", (err) => {
          console.error(`🔥 Server failed to start: ${err.message}`); // eslint-disable-line no-console
          process.exit(1);
        });
    } catch (err) {
      console.error("Error during server initialization:", err); // eslint-disable-line no-console
      console.error("Is the PostgreSQL Docker Running??"); // eslint-disable-line no-console
      process.exit(1);
    }
  };

  startServer();
}

export default app;
