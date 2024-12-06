import express, { Express, Request, Response } from 'express';
import cors from 'cors';
import {hidePoweredBy} from 'helmet'
import csurf from 'csurf';
import session from 'express-session';
import dotenv from 'dotenv';
dotenv.config()

const app: Express = express();
const PORT = process.env.PORT || 3001;
const PRODUCTION: boolean = !!process.env.PRODUCTION || false;
const SECRET: string = '' + process.env.SESSION_SECRET;

app.use(session({
  secret: SECRET,
  resave: false,
  saveUninitialized: true,
  // deepcode ignore WebCookieSecureDisabledExplicitly: environment variable set to true on production
  cookie: { secure: PRODUCTION } 
}));

app.use(express.json());
app.use(cors())
app.use(hidePoweredBy());
app.use(csurf({ cookie: true }));

app.get('/health', (req: Request, res: Response) => {
  res.status(200).json({ message: "Health Check!" });
});

app.get('/clubs/popular', (req: Request, res: Response) => {
  res.status(200)
})

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`); // eslint-disable-line no-console
});