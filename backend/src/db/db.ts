import { Pool } from "pg";
import dotenv from "dotenv";

dotenv.config();

let pool: Pool;

if (process.env.NODE_ENV === "test") {
  pool = {
    query: jest.fn(),
    connect: jest.fn(),
    end: jest.fn(),
  } as unknown as Pool;
} else {
  pool = new Pool({
    host: process.env.RDS_HOSTNAME,
    user: process.env.RDS_USERNAME,
    password: process.env.RDS_PASSWORD,
    database: process.env.RDS_DATABASE,
    port: 5432,
  });
}

export default pool;
