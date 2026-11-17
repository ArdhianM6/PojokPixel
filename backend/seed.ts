import 'dotenv/config'
import { db, pool } from './db/index.js'
import { products, teamMembers } from './db/schema.js'

const memberSeeds = [
  { name: 'Ardhian Maulana Tanjung', role: 'UI/UX & Lead Designer', sortOrder: 1 },
  { name: 'Aulia Ryansifa Wardah', role: 'Frontend Engineer', sortOrder: 2 },
  { name: 'Khoirunnisa Salsabila Osmon', role: 'Creative Director & Content', sortOrder: 3 },
]

const productSeeds = [
  { name: 'Folio — Portfolio Kit', slug: 'folio-portfolio-kit', description: 'Template portfolio yang mudah disesuaikan.', category: 'Template Website', price: 0, coverImage: '', isFeatured: true },
  { name: 'Sunday Sundae Social Pack', slug: 'sunday-sundae-social-pack', description: 'Paket template poster media sosial.', category: 'Template Poster', price: 39000, coverImage: '', isFeatured: true },
  { name: 'Belajar Design dari Nol', slug: 'belajar-design-dari-nol', description: 'Materi dasar desain digital untuk pemula.', category: 'Pembelajaran', price: 59000, coverImage: '', isFeatured: false },
]

try {
  const existingMembers = await db.select({ name: teamMembers.name }).from(teamMembers)
  const memberNames = new Set(existingMembers.map((member) => member.name))
  const missingMembers = memberSeeds.filter((member) => !memberNames.has(member.name))
  if (missingMembers.length) await db.insert(teamMembers).values(missingMembers)

  const existingProducts = await db.select({ slug: products.slug }).from(products)
  const productSlugs = new Set(existingProducts.map((product) => product.slug))
  const missingProducts = productSeeds.filter((product) => !productSlugs.has(product.slug))
  if (missingProducts.length) await db.insert(products).values(missingProducts)

  console.log(`Seed selesai: ${missingMembers.length} anggota tim dan ${missingProducts.length} produk ditambahkan.`)
} finally {
  await pool.end()
}
