import { useState, useMemo, useEffect, useCallback, useRef } from 'react'
import type { CSSProperties } from 'react'
import { categories, rupiah, getLiveProducts, getProductImageUrl } from '../data/marketplace'
import type { Product } from '../data/marketplace'
import { Pagination } from '../components/Pagination'
import { usePageMeta } from '../hooks/usePageMeta'

interface CatalogPageProps {
  initialCategory?: string
  initialQuery?: string
  onQuickView: (p: Product) => void
  onAddToCart: (p: Product) => void
  onToggleFavorite: (id: string) => void
  favorites: string[]
  playSound: (type: 'click' | 'pop' | 'success' | 'delete') => void
  navigate: (path: string) => void
}

export function CatalogPage({
  initialCategory = 'Semua',
  initialQuery = '',
  onQuickView,
  onAddToCart,
  onToggleFavorite,
  favorites,
  playSound,
  navigate,
}: CatalogPageProps) {
  usePageMeta('Katalog Produk Digital', 'Jelajahi seluruh template website, poster digital, dan pembelajaran desain siap pakai di Pojok Pixel.')

  const [category, setCategory] = useState(initialCategory)
  const [query, setQuery] = useState(initialQuery)
  const [debouncedQuery, setDebouncedQuery] = useState(initialQuery)
  const [sortBy, setSortBy] = useState<'featured' | 'sales' | 'rating' | 'price-asc' | 'price-desc'>('featured')
  const [currentPage, setCurrentPage] = useState(1)
  const [catalogVersion, setCatalogVersion] = useState(0)
  const ITEMS_PER_PAGE = 6
  const searchTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    const handleCatalogUpdate = () => setCatalogVersion((v) => v + 1)
    window.addEventListener('pojokpixel:catalog_updated', handleCatalogUpdate)
    window.addEventListener('storage', handleCatalogUpdate)
    return () => {
      window.removeEventListener('pojokpixel:catalog_updated', handleCatalogUpdate)
      window.removeEventListener('storage', handleCatalogUpdate)
    }
  }, [])

  useEffect(() => {
    if (initialCategory) setCategory(initialCategory)
  }, [initialCategory])

  const handleSearchChange = useCallback((value: string) => {
    setQuery(value)
    if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current)
    searchTimeoutRef.current = setTimeout(() => setDebouncedQuery(value), 220)
  }, [])

  useEffect(() => {
    setCurrentPage(1)
  }, [category, debouncedQuery, sortBy])

  const allProducts = useMemo(() => getLiveProducts(), [catalogVersion])

  const filtered = useMemo(() => {
    let result = allProducts.filter((p) => {
      const matchCat =
        category === 'Semua'
          ? true
          : category === 'Favorit Saya'
            ? favorites.includes(p.id)
            : category === 'Gratis (Rp 0)'
              ? p.price === 0
              : p.category === category
      const q = debouncedQuery.toLowerCase()
      const matchQuery =
        !q ||
        p.name.toLowerCase().includes(q) ||
        p.shortDesc.toLowerCase().includes(q) ||
        p.formats.some((f) => f.toLowerCase().includes(q))
      return matchCat && matchQuery
    })

    if (sortBy === 'sales') result = [...result].sort((a, b) => b.salesCount - a.salesCount)
    else if (sortBy === 'rating') result = [...result].sort((a, b) => b.rating - a.rating)
    else if (sortBy === 'price-asc') result = [...result].sort((a, b) => a.price - b.price)
    else if (sortBy === 'price-desc') result = [...result].sort((a, b) => b.price - a.price)
    return result
  }, [category, debouncedQuery, sortBy, favorites])

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE)
  const paginatedProducts = filtered.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE)

  return (
    <div className="min-h-screen bg-[#f5f5f2]">
      {/* Page Header Banner */}
      <section className="bg-[#f5f5f2] border-b border-[#deddd6] py-8">
        <div className="w-full max-w-[1220px] mx-auto px-6">
          <nav className="flex items-center gap-2 text-xs font-mono text-[#72736c] mb-4" aria-label="Breadcrumb">
            <a
              href="/"
              onClick={(e) => { e.preventDefault(); navigate('/') }}
              className="hover:text-[#e65416] transition-colors"
            >
              Beranda
            </a>
            <span aria-hidden="true" className="text-[#b7b6ae]">›</span>
            <span className="text-[#303236] font-semibold" aria-current="page">Katalog Produk</span>
          </nav>
          <div>
            <span className="inline-flex items-center gap-2 font-mono text-[11px] tracking-widest text-[#6d6e68] mb-3">
              <span className="w-2 h-2 bg-[#e65416] rounded-sm" />
              KATALOG MARKETPLACE RESMI
            </span>
            <h1 className="font-[family-name:var(--font-display)] text-3xl md:text-4xl font-bold text-[#303236] tracking-tight mb-2">
              Koleksi Aset &amp; Template Digital
            </h1>
            <p className="text-sm text-[#555650] leading-relaxed max-w-xl">
              Pilihan template website siap rakit, poster grafis resolusi tinggi, dan modul pembelajaran praktis terkurasi.
            </p>
          </div>
        </div>
      </section>

      {/* Main Collection */}
      <section className="pt-4" id="koleksi">
        <div className="w-full max-w-[1220px] mx-auto px-6">

          {/* Category Filter Pills */}
          <div
            className="flex gap-2 overflow-x-auto pb-2 mb-4 no-scrollbar"
            role="tablist"
            aria-label="Filter kategori produk"
          >
            {categories.map((cat) => (
              <button
                type="button"
                key={cat}
                role="tab"
                aria-selected={category === cat}
                onClick={() => { playSound('click'); setCategory(cat) }}
                className={`catalog-filter-pill flex-shrink-0 inline-flex items-center gap-1.5 h-9 px-4 rounded-full text-xs font-semibold border transition-all ${category === cat ? 'is-selected' : ''}`}
              >
                <span>{cat}</span>
                {cat === 'Favorit Saya' && favorites.length > 0 && (
                  <b className="inline-flex items-center justify-center min-w-[18px] h-[18px] px-1 rounded-full bg-[#e65416] text-white text-[9px] font-bold">
                    {favorites.length}
                  </b>
                )}
                {cat === 'Gratis (Rp 0)' && (
                  <span className="inline-flex items-center h-4 px-1.5 rounded-sm bg-emerald-500 text-white text-[9px] font-bold">Rp0</span>
                )}
              </button>
            ))}
          </div>

          {/* Search & Sort Toolbar */}
          <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
            <div className="relative flex-1 min-w-[200px] max-w-sm">
              <svg
                className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9a9b94] pointer-events-none"
                width="15" height="15" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                aria-hidden="true"
              >
                <circle cx="11" cy="11" r="7"/><path d="m20 20-4-4"/>
              </svg>
              <input
                type="search"
                placeholder="Filter nama, format, deskripsi..."
                value={query}
                onChange={(e) => handleSearchChange(e.target.value)}
                aria-label="Cari di katalog"
                className="w-full pl-9 pr-8 py-2 text-sm border border-[#deddd6] rounded-full bg-white focus:outline-none focus:border-[#e65416] focus:ring-2 focus:ring-[#e65416]/20 transition text-[#303236] placeholder:text-[#b7b6ae]"
              />
              {query && (
                <button
                  type="button"
                  onClick={() => { setQuery(''); setDebouncedQuery('') }}
                  aria-label="Hapus filter pencarian"
                  className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-[#e8e6df] text-[#6d6e68] text-xs grid place-items-center hover:bg-[#303236] hover:text-white transition"
                >
                  ×
                </button>
              )}
            </div>

            <div className="flex items-center gap-3">
              <div className="relative">
                <select
                  id="catalog-sort"
                  value={sortBy}
                  onChange={(e) => { playSound('click'); setSortBy(e.target.value as typeof sortBy) }}
                  className="appearance-none h-9 pl-3 pr-8 rounded-full text-xs font-semibold border border-[#deddd6] bg-white text-[#303236] focus:outline-none focus:border-[#e65416] transition cursor-pointer"
                >
                  <option value="featured">✨ Pilihan Terkurasi</option>
                  <option value="sales">🔥 Paling Laris</option>
                  <option value="rating">★ Rating Tertinggi</option>
                  <option value="price-asc">Harga Terendah</option>
                  <option value="price-desc">Harga Tertinggi</option>
                </select>
                <svg className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none text-[#9a9b94]" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="m6 9 6 6 6-6"/></svg>
              </div>

              <div className="inline-flex items-center h-9 px-3 rounded-full bg-[#e8e6df] text-xs font-mono text-[#303236]">
                {filtered.length} karya ditemukan
              </div>
            </div>
          </div>

          {/* Product Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 mb-8">
            {paginatedProducts.map((p, i) => {
              const isCustomArt = Boolean(
                p.id.startsWith('custom-') ||
                p.img.startsWith('data:') ||
                p.img.startsWith('http') ||
                p.label === 'Kreator' ||
                !['folio', 'sundae', 'study', 'nara', 'flora', 'class'].includes(p.id)
              )

              return (
                <article
                  className={`product-card product-${p.bg}`}
                  key={p.id}
                >
                  <div
                    className={`product-image ${p.bg} ${isCustomArt ? 'is-custom-art' : ''}`}
                    style={{
                      '--photo': `url(${getProductImageUrl(p.img)})`,
                      ...(isCustomArt ? { backgroundImage: `url(${getProductImageUrl(p.img)})` } : {}),
                    } as unknown as CSSProperties}
                    onClick={() => { playSound('pop'); onQuickView(p) }}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') onQuickView(p) }}
                    aria-label={`Lihat detail ${p.name}`}
                  >
                    {isCustomArt ? (
                      <>
                        <div
                          className="custom-product-cover-bg"
                          style={{ backgroundImage: `url(${getProductImageUrl(p.img)})` }}
                        />
                        <div className="custom-product-cover-tint" />
                        <div className="image-index">PP-0{i + 1}</div>
                      </>
                    ) : (
                      <>
                        <div className="product-image-shade" />
                        <div className="image-index">PP-0{i + 1}</div>
                        <div className="mockup-content">
                          <span className="mockup-kicker">{p.category}</span>
                          <b>
                            {p.id === 'folio' ? (
                              <>YOUR WORK,<br />IN GOOD<br /><i>company.</i></>
                            ) : p.id === 'sundae' ? (
                              <>slow days<br /><i>feel good</i></>
                            ) : p.id === 'study' ? (
                              <>Make room<br />for <i>ideas.</i></>
                            ) : p.id === 'nara' ? (
                              <>Less noise.<br /><i>More you.</i></>
                            ) : p.id === 'flora' ? (
                              <>A little<br /><i>in bloom.</i></>
                            ) : (
                              <>Design it<br /><i>your way.</i></>
                            )}
                          </b>
                          <span className="mockup-footer">
                            POJOK PIXEL MARKETPLACE <span>+</span>
                          </span>
                        </div>
                      </>
                    )}

                    <span className={`product-label ${p.label === 'Gratis' ? 'free' : ''}`}>
                      {p.label || 'Digital Product'}
                    </span>

                    <button
                      type="button"
                      className="quick-view-trigger"
                      onClick={(e) => { e.stopPropagation(); playSound('pop'); onQuickView(p) }}
                    >
                      <span>Pratinjau Cepat</span>
                    </button>

                    <button
                      type="button"
                      className={`favorite-button ${favorites.includes(p.id) ? 'is-favorite' : ''}`}
                      onClick={(e) => { e.stopPropagation(); onToggleFavorite(p.id) }}
                      aria-label={favorites.includes(p.id) ? 'Hapus dari favorit' : 'Simpan ke favorit'}
                      aria-pressed={favorites.includes(p.id)}
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill={favorites.includes(p.id) ? '#e65416' : 'none'} stroke="currentColor" strokeWidth="2">
                        <path d="M20.8 8.8c0 4.5-8.8 10-8.8 10s-8.8-5.5-8.8-10a4.5 4.5 0 0 1 8.8-1.1 4.5 4.5 0 0 1 8.8 1.1Z"/>
                      </svg>
                    </button>

                    <div className="image-serial">{p.tag}</div>
                  </div>

                  {/* Product Info */}
                  <div className="product-info">
                    <div>
                      <span className="product-category">{p.category}</span>
                      <h3>
                        <a
                          href={`/produk/${p.id}`}
                          className="product-title-link"
                          onClick={(e) => { e.preventDefault(); playSound('click'); navigate(`/produk/${p.id}`) }}
                        >
                          {p.name}
                        </a>
                      </h3>
                      <span className="product-format">
                        <span>
                          {p.id === 'study'
                            ? 'Video + Workbook'
                            : p.id === 'class'
                              ? 'Kelas Mini Gratis'
                              : p.id === 'sundae' || p.id === 'flora'
                                ? 'Canva / Siap Cetak'
                                : 'Figma + HTML Siap Pakai'}
                        </span>
                      </span>
                      <span className="product-sales-count">
                        ★ {p.rating} ({p.reviewsCount}) • {p.salesCount}+ unduhan
                      </span>
                    </div>

                    <div className="product-purchase-row">
                      <div className="product-price-box">
                        {p.originalPrice > p.price && (
                          <span className="product-strikethrough-price">{rupiah(p.originalPrice)}</span>
                        )}
                        <strong>{rupiah(p.price)}</strong>
                      </div>
                      <button
                        type="button"
                        className="product-buy-btn"
                        aria-label={`Tambah ${p.name} ke keranjang`}
                        onClick={() => onAddToCart(p)}
                        title="Tambah ke keranjang"
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M5 12h14"/><path d="m13 6 6 6-6 6"/>
                        </svg>
                      </button>
                    </div>
                  </div>
                </article>
              )
            })}
          </div>

          {/* Empty State */}
          {filtered.length === 0 && (
            <div className="text-center py-16" role="status" aria-live="polite">
              <div className="text-4xl mb-3">🔍</div>
              <h3 className="font-[family-name:var(--font-display)] text-lg font-bold text-[#303236] mb-2">
                Produk tidak ditemukan
              </h3>
              <p className="text-sm text-[#72736c] mb-4">
                {debouncedQuery
                  ? <>Tidak ada produk yang cocok dengan &quot;<strong>{debouncedQuery}</strong>&quot;. Coba kata kunci lain atau reset filter.</>
                  : <>Belum ada produk untuk kategori ini.</>
                }
              </p>
              <button
                type="button"
                onClick={() => { setCategory('Semua'); setQuery(''); setDebouncedQuery('') }}
                className="inline-flex items-center h-10 px-5 rounded-full bg-[#303236] text-white text-sm font-semibold hover:bg-[#e65416] transition"
              >
                Reset Semua Filter
              </button>
            </div>
          )}

          {/* Pagination */}
          {filtered.length > ITEMS_PER_PAGE && (
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={(page) => {
                setCurrentPage(page)
                window.scrollTo({ top: 180, behavior: 'smooth' })
              }}
            />
          )}
        </div>
      </section>
    </div>
  )
}
