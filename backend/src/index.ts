import express, { Express, Request, Response } from 'express';
import cors from 'cors';
import { hidePoweredBy } from 'helmet'
import session from 'express-session';
import dotenv from 'dotenv';
import University from './models/University';
dotenv.config()

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
    const Universities: University[] = Object.values(University).sort();
    res.status(200).json(Universities)
  } catch (err) {
    console.error(`Error Fetching Universities: ${err}`) //eslint-disable-line no-console
    res.status(500).json({ error: "Cannot Fetch Universities" })
  }
})

app.get('/clubs/popular', (req: Request, res: Response) => {
  res.status(200)
})

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`); // eslint-disable-line no-console
});