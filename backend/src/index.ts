import express, { Express, Request, Response } from 'express';
import cors from 'cors';
import { hidePoweredBy } from 'helmet'
import authRoutes from './routes/auth';
import clubRoutes from './routes/clubs';
import session from 'express-session';
import dotenv from 'dotenv';
import pool from './db/db';
dotenv.config()

const UNIVERSITIES: object[] = []

// file deepcode ignore UseCsurfForExpress: handled by express-session same site parameter
const app: Express = express();
const PORT = process.env.PORT || 3001;
const PRODUCTION: boolean = !!process.env.PRODUCTION;
const SECRET: string = '' + process.env.SESSION_SECRET;

app.use(session({
  secret: SECRET,
  resave: false,
  saveUninitialized: true,
  // deepcode ignore WebCookieSecureDisabledExplicitly: environment variable set to true on production
  cookie: { secure: PRODUCTION, sameSite: 'strict' },
}));

app.use(express.json());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}))
app.use(hidePoweredBy());

app.use('/auth', authRoutes)
app.use('/clubs', clubRoutes)

app.get('/health', (req: Request, res: Response) => {
  try {
    res.status(200).json({ message: 'Health Check!' });
  } catch (err) {
    console.error('CSRF error:', err); // eslint-disable-line no-console
    res.status(500).json({ error: 'CSRF token error' });
  }
});

app.get('/universities', (req: Request, res: Response) => {
  try {
    res.status(200).json(UNIVERSITIES)
  } catch (err) {
    console.error(`Error Fetching Universities: ${err}`) //eslint-disable-line no-console
    res.status(500).json({ error: "Cannot Fetch Universities" })
  }
})

const startServer = async () => {
  try {
    if (!process.env.REACT_APP_IS_TESTING) {
      const result = await pool.query('SELECT acronym, name FROM universities');
      if (result.rowCount === 0) {
        console.log('No Universities Retrieved!'); // eslint-disable-line no-console
      } else {
        for (const uni of result.rows) {
          UNIVERSITIES.push({name: uni.name, acronym: uni.acronym});
        }
      }
    }

    app.listen(PORT, () => {
      console.log(`Server is running on http://localhost:${PORT}`); // eslint-disable-line no-console
    });
  } catch (err) {
    console.error('Error during server initialization:', err); // eslint-disable-line no-console
    process.exit(1);
  }
};

startServer();