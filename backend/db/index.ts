import 'dotenv/config'
import { drizzle } from 'drizzle-orm/node-postgres'
import { Pool } from 'pg'

const connectionString = process.env.DATABASE_URL

if (!connectionString) {
  throw new Error('DATABASE_URL belum diatur. Tambahkan connection string PostgreSQL di file .env.')
}

const pool = new Pool({ connectionString, connectionTimeoutMillis: 10000, max: 3 })
export const db = drizzle({ client: pool })
export { pool }