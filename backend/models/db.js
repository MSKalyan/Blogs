// db.js - Setup the database connection with PostgreSQL
import { Pool }  from 'pg'
import dotenv from 'dotenv';

dotenv.config();
// Create a pool of connections to PostgreSQL
const pool = new Pool({
  user: process.env.user,         // Replace with your PostgreSQL username
  host: process.env.host,             // Replace with your PostgreSQL host if needed
  database: process.env.database,     // Replace with your PostgreSQL database name
  password: process.env.password,     // Replace with your PostgreSQL password
  port: process.env.port,                   // Default PostgreSQL port
});

// Export the pool for use in other modules
export default pool;
