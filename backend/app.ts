import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { desc, eq } from 'drizzle-orm'
import { db, pool } from './db/index.js'
import { creatorData, products, teamMembers } from './db/schema.js'
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
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
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

app.get('/api/creator-data', async (c) => {
  const session = await auth.api.getSession({ headers: c.req.raw.headers })
  if (!session) return c.json({ error: 'Silakan masuk terlebih dahulu.' }, 401)
  const [data] = await db.select().from(creatorData).where(eq(creatorData.userId, session.user.id)).limit(1)
  return c.json(data ? { profile: data.profile, projects: data.projects } : null)
})

app.put('/api/creator-data', async (c) => {
  const session = await auth.api.getSession({ headers: c.req.raw.headers })
  if (!session) return c.json({ error: 'Silakan masuk terlebih dahulu.' }, 401)
  let body: { profile?: unknown; projects?: unknown }
  try { body = await c.req.json() } catch { return c.json({ error: 'Data tidak valid.' }, 400) }
  if (!body.profile || typeof body.profile !== 'object' || !Array.isArray(body.projects) || body.projects.length > 100) {
    return c.json({ error: 'Profil atau daftar produk tidak valid.' }, 400)
  }
  const profile = body.profile as Record<string, unknown>
  if (typeof profile.name !== 'string' || typeof profile.username !== 'string') {
    return c.json({ error: 'Nama dan username kreator wajib diisi.' }, 400)
  }
  const values = { userId: session.user.id, profile, projects: body.projects as unknown[], updatedAt: new Date() }
  await db.insert(creatorData).values(values).onConflictDoUpdate({
    target: creatorData.userId,
    set: { profile, projects: values.projects, updatedAt: values.updatedAt },
  })
  return c.json({ profile, projects: values.projects })
})

app.delete('/api/creator-data', async (c) => {
  const session = await auth.api.getSession({ headers: c.req.raw.headers })
  if (!session) return c.json({ error: 'Silakan masuk terlebih dahulu.' }, 401)
  await db.delete(creatorData).where(eq(creatorData.userId, session.user.id))
  return c.json({ success: true })
})

app.get('/api/creator-products', async (c) => {
  const rows = await db.select({ profile: creatorData.profile, projects: creatorData.projects }).from(creatorData)
  const published = rows.flatMap(({ profile, projects }) => {
    if (!Array.isArray(projects)) return []
    const creator = profile as { name?: string; username?: string }
    return projects.map((project) => {
      const { fileAttachment: _fileAttachment, accessUrl: _accessUrl, buyerNote: _buyerNote, ...listing } = project as Record<string, unknown>
      return { ...listing, creatorName: creator.name, creatorUsername: creator.username }
    })
  })
  return c.json(published)
})

app.on(['GET', 'POST'], '/api/auth/*', (c) => auth.handler(c.req.raw))

export default app
