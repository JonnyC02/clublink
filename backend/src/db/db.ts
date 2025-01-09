import { Pool } from 'pg';
import dotenv from 'dotenv';

dotenv.config({
  path: process.env.NODE_ENV === 'test' ? '.env.test' : '.env',
});

let pool: Pool;

if (process.env.NODE_ENV === 'test') {
  pool = new Pool({
    host: process.env.HOSTNAME,
    user: process.env.USERNAME,
    password: process.env.PASSWORD,
    database: process.env.DATABASE
  })
} else {
  pool = new Pool({
    host: process.env.RDS_HOSTNAME,
    user: process.env.RDS_USERNAME,
    password: process.env.RDS_PASSWORD,
    database: process.env.RDS_DATABASE,
    port: 8080,
    ssl: {
      rejectUnauthorized: false,
    }
  });
}

export default pool;