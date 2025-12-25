import dotenv from 'dotenv';
dotenv.config();

console.log("DB_HOST seen by db.js =",process.env.DB_HOST);
delete process.env.DATABASE_URL;
import { Pool } from 'pg';

const pool = new Pool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: 5432,
  ssl: { rejectUnauthorized: false }

});

export default pool;

