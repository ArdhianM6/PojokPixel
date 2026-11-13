import 'dotenv/config'
import { migrate } from 'drizzle-orm/node-postgres/migrator'
import { db, pool } from './db/index.js'

await migrate(db, { migrationsFolder: './backend/db/migrations' })
await pool.end()
console.log('Database migrations applied.')
