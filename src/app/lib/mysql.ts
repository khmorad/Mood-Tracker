import { createPool, Pool } from "mysql2/promise";
import dotenv from "dotenv";
dotenv.config();

interface DBConfig {
  host: string;
  user: string;
  password: string;
  database: string;
}

console.log("DB_HOST:", process.env.DB_HOST);
console.log("DB_USER:", process.env.DB_USER);
console.log("DB_PASSWORD:", process.env.DB_PASSWORD);
console.log("DB_NAME:", process.env.DB_NAME);

// Ensure the environment variables are set
if (
  !process.env.DB_HOST ||
  !process.env.DB_USER ||
  !process.env.DB_PASSWORD ||
  !process.env.DB_NAME
) {
  throw new Error(
    "Missing required environment variables for database connection."
  );
}

const dbConfig: DBConfig = {
  host: process.env.DB_HOST!, // Non-null assertion, as we have already checked
  user: process.env.DB_USER!,
  password: process.env.DB_PASSWORD!,
  database: process.env.DB_NAME!,
};

export const pool: Pool = createPool({
  host: dbConfig.host,
  user: dbConfig.user,
  password: dbConfig.password,
  database: dbConfig.database,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

(async function testConnection() {
  console.log("Executing testConnection...");
  try {
    const [rows] = await pool.query("SELECT 1");
    console.log("Database connection successful:", rows);
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error("Database connection failed:", error.message);
    } else {
      console.error("Database connection failed with unknown error:", error);
    }
  }
})();
