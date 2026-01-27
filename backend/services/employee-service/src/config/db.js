import pkg from "pg";
const { Pool } = pkg;
import dotenv from "dotenv";
dotenv.config();

const pool = new Pool({
  user: process.env.PG_USER,
  host: process.env.PG_HOST,
  database: process.env.PG_DATABASE,
  password: process.env.PG_PASSWORD,
  port: process.env.PG_PORT || 6432,
   max: 3, 
  idleTimeoutMillis: 30000, 
  connectionTimeoutMillis: 15000,
  ssl: false,
});

pool.on("connect", () => {
  console.log("✅ Connected to PostgreSQL successfully");
});

pool.on("error", (err) => {
  console.error("❌ Unexpected error on idle PostgreSQL client", err);
  process.exit(-1);
});
export default pool;
