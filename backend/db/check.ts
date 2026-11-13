import 'dotenv/config'
import { Pool } from 'pg'

const connectionString = process.env.DATABASE_URL

if (!connectionString) {
  console.error('DATABASE_URL belum diatur. Periksa file .env di folder utama project.')
  process.exit(1)
}

const pool = new Pool({ connectionString, connectionTimeoutMillis: 5000 })

try {
  const result = await pool.query('select current_database() as database, current_user as role')
  console.log(`Koneksi PostgreSQL berhasil. Database: ${result.rows[0].database}; role: ${result.rows[0].role}.`)
} catch (error) {
  const code = error && typeof error === 'object' && 'code' in error ? String(error.code) : 'UNKNOWN'
  console.error(`Koneksi PostgreSQL gagal (${code}). Periksa service PostgreSQL, DATABASE_URL, dan izin role.`)
  process.exitCode = 1
} finally {
  await pool.end()
}
