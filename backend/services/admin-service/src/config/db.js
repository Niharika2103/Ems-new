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
   max: 10, 
  idleTimeoutMillis: 30000, 
  connectionTimeoutMillis: 2000, 
  
  ssl: {
    rejectUnauthorized: false, // required for Azure
  },
});

pool.on("connect", () => {
  console.log("✅ Connected to PostgreSQL successfully");
});

pool.on("error", (err) => {
  console.error("❌ Unexpected error on idle PostgreSQL client", err);
  process.exit(-1);
});

export default pool;
