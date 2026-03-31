import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import * as schema from "./schema";

const { Pool } = pg;

if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?",
  );
}

const isExternalDb = !process.env.DATABASE_URL.includes("localhost") && !process.env.DATABASE_URL.includes("127.0.0.1");

export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: isExternalDb ? { rejectUnauthorized: false } : false,
});
export const db = drizzle(pool, { schema });

export async function runMigrations() {
  const client = await pool.connect();
  try {
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        email TEXT NOT NULL UNIQUE,
        password TEXT NOT NULL,
        role TEXT NOT NULL DEFAULT 'aluno',
        matricula TEXT,
        created_at TIMESTAMP DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS books (
        id SERIAL PRIMARY KEY,
        title TEXT NOT NULL,
        author TEXT NOT NULL,
        isbn TEXT,
        category TEXT,
        description TEXT,
        year INTEGER,
        publisher TEXT,
        quantity INTEGER NOT NULL DEFAULT 1,
        available INTEGER NOT NULL DEFAULT 1,
        created_at TIMESTAMP DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS loans (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id),
        book_id INTEGER NOT NULL REFERENCES books(id),
        loan_date TIMESTAMP DEFAULT NOW(),
        pickup_date TIMESTAMP,
        due_date TIMESTAMP NOT NULL,
        return_date TIMESTAMP,
        status TEXT NOT NULL DEFAULT 'reservado',
        fine DECIMAL(10,2) DEFAULT 0,
        fine_paid BOOLEAN DEFAULT FALSE
      );
    `);
    console.log("[db] Tabelas verificadas/criadas com sucesso.");
  } finally {
    client.release();
  }
}

export * from "./schema";
