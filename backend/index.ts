import { serve } from '@hono/node-server'
import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { desc, eq } from 'drizzle-orm'
import { db, pool } from './db/index.js'
import { products, teamMembers } from './db/schema.js'
import { auth } from './auth.js'

const app = new Hono()
const appOrigin = process.env.APP_URL ?? (process.env.NODE_ENV === 'production' ? '' : 'http://localhost:5173')
const developmentOrigins = process.env.NODE_ENV === 'production'
  ? []
  : Array.from({ length: 27 }, (_, index) => `http://localhost:${5173 + index}`)
      .concat(Array.from({ length: 27 }, (_, index) => `http://127.0.0.1:${5173 + index}`))
app.use('/api/*', cors({
  origin: [appOrigin, ...developmentOrigins].filter(Boolean),
  credentials: true,
  allowHeaders: ['Content-Type', 'Authorization', 'x-captcha-response'],
  allowMethods: ['GET', 'POST', 'OPTIONS'],
}))

app.get('/api/health', async (c) => {
  try {
    await pool.query('select 1')
    return c.json({ status: 'ok', database: 'connected', name: 'PojokPixel API' })
  } catch {
    return c.json({ status: 'error', database: 'disconnected', message: 'PostgreSQL tidak dapat dihubungi.' }, 503)
  }
})
app.get('/api/products', async (c) => {
  try {
    const category = c.req.query('category')
    const allProducts = category && category !== 'Semua'
      ? await db.select().from(products).where(eq(products.category, category)).orderBy(desc(products.createdAt))
      : await db.select().from(products).orderBy(desc(products.createdAt))
    return c.json(allProducts)
  } catch {
    return c.json({ error: 'Produk belum tersedia. Pastikan database sudah terhubung.' }, 503)
  }
})
app.get('/api/team', async (c) => {
  try { return c.json(await db.select().from(teamMembers).orderBy(teamMembers.sortOrder)) }
  catch { return c.json({ error: 'Data tim belum tersedia.' }, 503) }
})

app.on(['GET', 'POST'], '/api/auth/*', (c) => auth.handler(c.req.raw))

const port = Number(process.env.PORT ?? 3001)
serve({ fetch: app.fetch, port }, (info) => console.log(`PojokPixel API listening on http://localhost:${info.port}`))
