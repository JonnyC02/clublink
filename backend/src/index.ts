import express, { Express, Request, Response } from 'express';
import cors from 'cors';

const app: Express = express();
const PORT = process.env.PORT || 3001;

app.use(express.json());
app.use(cors())

app.get('/health', (req: Request, res: Response) => {
  res.json({ message: "Health Check!"}).status(200);
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});