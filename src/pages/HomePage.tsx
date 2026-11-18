import { useState, useEffect, useMemo } from 'react'
import type { CSSProperties } from 'react'
import { featuredProducts, freeProducts, rupiah, getCreatorProducts, getProductImageUrl } from '../data/marketplace'
import type { Product } from '../data/marketplace'
import { usePageMeta } from '../hooks/usePageMeta'

interface HomePageProps {
  onQuickView: (p: Product) => void
  onAddToCart: (p: Product, sourceCard?: HTMLElement | null) => void
  onToggleFavorite: (id: string) => void
  favorites: string[]
  playSound: (type: 'click' | 'pop' | 'success' | 'delete') => void
  navigate: (path: string) => void
}

export function HomePage({
  onQuickView,
  onAddToCart,
  onToggleFavorite,
  favorites,
  playSound,
  navigate,
}: HomePageProps) {
  usePageMeta('Beranda', 'Marketplace produk digital Indonesia penyedia template website, poster digital, dan pembelajaran desain.')

  const [catalogVersion, setCatalogVersion] = useState(0)

  // Listen to creator catalog changes
  useEffect(() => {
    const handleCatalogUpdate = () => setCatalogVersion((v) => v + 1)
    window.addEventListener('pojokpixel:catalog_updated', handleCatalogUpdate)
    window.addEventListener('storage', handleCatalogUpdate)
    return () => {
      window.removeEventListener('pojokpixel:catalog_updated', handleCatalogUpdate)
      window.removeEventListener('storage', handleCatalogUpdate)
    }
  }, [])

  // Creator published products from localStorage (both creator_projects & user_catalog)
  const creatorProducts = useMemo(() => {
    return getCreatorProducts()
  }, [catalogVersion])

  // Merged featured products (creator releases first so buyers can see them on dashboard utama)
  const allFeaturedProducts = useMemo(() => {
    return [...creatorProducts, ...featuredProducts]
  }, [creatorProducts])

  // Feature listings by catalog order; popularity metrics are not available yet.
  const bestSellerSlides = useMemo(() => allFeaturedProducts.slice(0, 4), [allFeaturedProducts])

  const [currentSlide, setCurrentSlide] = useState(0)

  const handlePrevSlide = (e: React.MouseEvent) => {
    e.stopPropagation()
    playSound('click')
    setCurrentSlide((prev) => (prev - 1 + bestSellerSlides.length) % bestSellerSlides.length)
  }

  const handleNextSlide = (e: React.MouseEvent) => {
    e.stopPropagation()
    playSound('click')
    setCurrentSlide((prev) => (prev + 1) % bestSellerSlides.length)
  }

  const renderProductCard = (p: Product) => {
    const isCustomArt = Boolean(
      p.id.startsWith('custom-') ||
      p.img.startsWith('data:') ||
      p.img.startsWith('http') ||
      p.label === 'Kreator' ||
      !['folio', 'sundae', 'study', 'nara', 'flora', 'class', 'creator-pack'].includes(p.id)
    )

    return (
      <article className={`product-card product-${p.bg}`} key={p.id}>
        <div
          className={`product-image ${p.bg} ${isCustomArt ? 'is-custom-art' : ''}`}
          style={{
            '--photo': `url(${getProductImageUrl(p.img)})`,
            ...(isCustomArt ? { backgroundImage: `url(${getProductImageUrl(p.img)})` } : {}),
          } as unknown as CSSProperties}
          onClick={() => {
            playSound('pop')
            onQuickView(p)
          }}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') onQuickView(p)
          }}
          aria-label={`Lihat detail ${p.name}`}
        >
          {isCustomArt ? (
            <>
              <div
                className="custom-product-cover-bg"
                style={{ backgroundImage: `url(${getProductImageUrl(p.img)})` }}
              />
              <div className="custom-product-cover-tint" />
            </>
          ) : (
            <>
              <div className="product-image-shade" />

              <div className="mockup-content">
                <span className="mockup-kicker">{p.category}</span>
                <b>{p.name}</b>
                <span className="mockup-footer">{p.formats.slice(0, 2).join(' · ')}</span>
              </div>
            </>
          )}

          {p.price === 0 && <span className="product-label free">Gratis</span>}

        <button
          type="button"
          className="quick-view-trigger"
          onClick={(e) => {
            e.stopPropagation()
            playSound('pop')
            onQuickView(p)
          }}
        >
          <span>Pratinjau Cepat</span>
        </button>

        <button
          type="button"
          className={`favorite-button ${favorites.includes(p.id) ? 'is-favorite' : ''}`}
          onClick={(e) => {
            e.stopPropagation()
            onToggleFavorite(p.id)
          }}
          aria-label={favorites.includes(p.id) ? 'Hapus dari favorit' : 'Simpan ke favorit'}
          aria-pressed={favorites.includes(p.id)}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill={favorites.includes(p.id) ? '#e65416' : 'none'} stroke="currentColor" strokeWidth="2"><path d="M20.8 8.8c0 4.5-8.8 10-8.8 10s-8.8-5.5-8.8-10a4.5 4.5 0 0 1 8.8-1.1 4.5 4.5 0 0 1 8.8 1.1Z"/></svg>
        </button>

        <div className="image-serial">{p.tag}</div>
      </div>

      <div className="product-info">
        <div>
          <span className="product-category">{p.category}</span>
          <h3>
            <a
              href={`/produk/${p.id}`}
              className="product-title-link"
              onClick={(e) => {
                e.preventDefault()
                playSound('click')
                navigate(`/produk/${p.id}`)
              }}
            >
              {p.name}
            </a>
          </h3>
          <span className="product-format">
            <span>
              {p.formats && p.formats.length > 0
                ? p.formats.slice(0, 2).join(' + ')
                : p.id === 'study'
                  ? 'Video + Workbook'
                  : p.id === 'class'
                    ? 'Kelas Mini Gratis'
                    : p.id === 'sundae' || p.id === 'flora'
                      ? 'Canva / Siap Cetak'
                      : 'Figma + HTML Siap Pakai'}
            </span>
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
            onClick={(event) => onAddToCart(p, event.currentTarget.closest<HTMLElement>('.product-card'))}
            title="Tambah ke keranjang"
          >
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <circle cx="9" cy="20" r="1"/><circle cx="18" cy="20" r="1"/>
              <path d="M2 3h2l2.3 11.4a2 2 0 0 0 2 1.6h9.6a2 2 0 0 0 1.9-1.5L22 8H5"/>
            </svg>
          </button>
        </div>
      </div>
    </article>
  )
}

  return (
    <div className="home-page-wrap">
      {/* Hero Section */}
      <section className="hero" id="home">
        <div className="app-container">
          <div className="hero-grid">
            <div className="hero-copy motion-safe:animate-panel-in">
              <div className="hero-kicker">
                <span className="kicker-square" />
                <span>Produk digital dari kreator Indonesia</span>
              </div>
              <h1>
                Temukan bahan untuk<br />karya berikutnya.
              </h1>
              <p>
                Jelajahi template website, poster, dan materi belajar yang dibuat kreator. Lihat format dan detail setiap produk sebelum memilih.
              </p>

              {/* Marketplace Hero Search */}
              <div className="marketplace-hero-search">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-stone-400 ml-2" aria-hidden="true"><circle cx="11" cy="11" r="7"/><path d="m20 20-4-4"/></svg>
                <input
                  className="hero-search-input"
                  placeholder="Cari produk digital..."
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      const val = (e.target as HTMLInputElement).value
                      playSound('pop')
                      navigate(`/katalog${val ? `?q=${encodeURIComponent(val)}` : ''}`)
                    }
                  }}
                  aria-label="Cari produk digital"
                />
                <button
                  type="button"
                  className="hero-search-btn"
                  onClick={(e) => {
                    const input = e.currentTarget.parentElement?.querySelector('input')
                    const val = input?.value || ''
                    playSound('pop')
                    navigate(`/katalog${val ? `?q=${encodeURIComponent(val)}` : ''}`)
                  }}
                >
                  <span>Cari di Katalog</span>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14"/><path d="m13 6 6 6-6 6"/></svg>
                </button>
              </div>

              {/* Quick Trending Tags */}
              <div className="hero-tags-row">
                <span className="text-xs font-mono font-semibold">Jelajahi:</span>
                <button
                  type="button"
                  className="hero-tag-pill"
                  onClick={() => {
                    playSound('click')
                    navigate('/katalog?q=Folio')
                  }}
                >
                  🔥 Folio Portfolio
                </button>
                <button
                  type="button"
                  className="hero-tag-pill"
                  onClick={() => {
                    playSound('click')
                    navigate('/katalog?cat=Template+Poster')
                  }}
                >
                  🎨 Poster Canva
                </button>
                <button
                  type="button"
                  className="hero-tag-pill"
                  onClick={() => {
                    playSound('click')
                    navigate('/katalog?q=Landing+Page')
                  }}
                >
                  ⚡ Landing Page
                </button>
                <button
                  type="button"
                  className="hero-tag-pill"
                  onClick={() => {
                    playSound('click')
                    navigate('/katalog?cat=Pembelajaran+Digital')
                  }}
                >
                  📚 Kelas Desain
                </button>
                <button
                  type="button"
                  className="hero-tag-pill"
                  onClick={() => {
                    playSound('click')
                    navigate('/katalog?cat=Bundel+Produk')
                  }}
                >
                  📦 Bundel Hemat
                </button>
              </div>

            </div>

            <div className="hero-art-perspective motion-safe:animate-panel-in">
              <div
                className="hero-art"
                aria-label="Pratinjau marketplace produk digital Pojok Pixel"
              >
                <div className="art-spark spark-one">*</div>
                <div className="art-spark spark-two">*</div>

                <div className="hero-slider-wrap">
                  <div className="hero-slider-header">
                    <span className="hero-slider-badge">
                      <span className="inline-block w-2 h-2 rounded-full bg-white animate-pulse" />
                      Pilihan dari katalog
                    </span>
                    <div className="hero-slider-nav">
                      <button
                        type="button"
                        className="hero-slider-arrow"
                        onClick={handlePrevSlide}
                        aria-label="Proyek sebelumnya"
                      >
                        ‹
                      </button>
                      <button
                        type="button"
                        className="hero-slider-arrow"
                        onClick={handleNextSlide}
                        aria-label="Proyek berikutnya"
                      >
                        ›
                      </button>
                    </div>
                  </div>

                  <div className="hero-slider-viewport">
                    <div
                      className="hero-slider-track"
                      style={{
                        transform: `translateX(-${currentSlide * 100}%)`,
                      }}
                    >
                      {bestSellerSlides.map((item) => (
                        <article
                          className="hero-slide-card"
                          key={item.id}
                          onClick={() => {
                            playSound('pop')
                            onQuickView(item)
                          }}
                          tabIndex={0}
                          role="button"
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' || e.key === ' ') {
                              onQuickView(item)
                            }
                          }}
                          aria-label={`Lihat detail ${item.name}`}
                        >
                          <div
                            className={`hero-slide-image ${item.id.startsWith('custom-') || item.img.startsWith('data:') || item.img.startsWith('http') ? 'has-custom-cover' : `cover-${item.bg}`}`}
                            style={item.id.startsWith('custom-') || item.img.startsWith('data:') || item.img.startsWith('http')
                              ? { backgroundImage: `url(${getProductImageUrl(item.img)})` }
                              : undefined}
                          >
                            <div className="hero-slide-top-tags">
                              <span className="hero-slide-cat">{item.category}</span>
                            </div>
                            <div className="hero-slide-sales">
                              <span>{item.tag || item.category}</span>
                            </div>
                          </div>

                          <div className="hero-slide-body">
                            <div>
                              <div className="hero-slide-chips">
                                {item.formats.slice(0, 3).map((fmt) => (
                                  <span className="hero-slide-chip" key={fmt}>
                                    {fmt.split(' ')[0]}
                                  </span>
                                ))}
                              </div>
                              <h4 className="hero-slide-title">{item.name}</h4>
                              <p className="hero-slide-desc">{item.shortDesc}</p>
                            </div>

                            <div className="hero-slide-footer">
                              <div className="hero-slide-price-wrap">
                                <span className="hero-slide-price">
                                  {item.price === 0 ? 'Gratis' : rupiah(item.price)}
                                </span>
                                {item.originalPrice > item.price && (
                                  <span className="hero-slide-original-price">
                                    {rupiah(item.originalPrice)}
                                  </span>
                                )}
                              </div>
                              <span className="hero-slide-action">
                                Beli Sekarang →
                              </span>
                            </div>
                          </div>
                        </article>
                      ))}
                    </div>
                  </div>

                  <div className="hero-slider-dots">
                    {bestSellerSlides.map((item, idx) => (
                      <button
                        key={item.id}
                        type="button"
                        className={`hero-slider-dot ${idx === currentSlide ? 'is-active' : ''}`}
                        onClick={(e) => {
                          e.stopPropagation()
                          playSound('click')
                          setCurrentSlide(idx)
                        }}
                        aria-label={`Lihat slide ${idx + 1}`}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Browse by category */}
      <section className="category-showcase-section" id="kategori-unggulan">
        <div className="app-container">
          <div className="section-head text-center max-w-xl mx-auto mb-10">
            <span className="eyebrow mx-auto justify-center"><span /> Kategori</span>
            <h2>Jelajahi berdasarkan jenis</h2>
            <p className="subhead">
              Pilih kategori untuk menemukan template, poster, atau materi belajar.
            </p>
          </div>

          <div className="category-showcase-grid">
            <div
              className="category-showcase-card cursor-pointer group"
              onClick={() => {
                playSound('pop')
                navigate('/katalog?cat=Template+Website')
              }}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter') navigate('/katalog?cat=Template+Website')
              }}
            >
              <div className="cat-card-header">
                <span className="cat-badge">Website</span>
              </div>
              <h3>Template Website</h3>
              <p>Template untuk portofolio, landing page, dan antarmuka web. Format tiap produk tercantum di detailnya.</p>
              <div className="cat-card-footer">
                <span>Lihat Template Website</span>
                <span className="cat-arrow">→</span>
              </div>
            </div>

            <div
              className="category-showcase-card cursor-pointer group"
              onClick={() => {
                playSound('pop')
                navigate('/katalog?cat=Template+Poster')
              }}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter') navigate('/katalog?cat=Template+Poster')
              }}
            >
              <div className="cat-card-header">
                <span className="cat-badge">Poster</span>
              </div>
              <h3>Template Poster</h3>
              <p>Poster dan materi grafis untuk kebutuhan digital maupun cetak. Periksa format sebelum membeli.</p>
              <div className="cat-card-footer">
                <span>Lihat Koleksi Poster</span>
                <span className="cat-arrow">→</span>
              </div>
            </div>

            <div
              className="category-showcase-card cursor-pointer group"
              onClick={() => {
                playSound('pop')
                navigate('/katalog?cat=Pembelajaran+Digital')
              }}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter') navigate('/katalog?cat=Pembelajaran+Digital')
              }}
            >
              <div className="cat-card-header">
                <span className="cat-badge">Belajar</span>
              </div>
              <h3>Pembelajaran Digital</h3>
              <p>Materi belajar desain dalam format yang dijelaskan pada setiap produk.</p>
              <div className="cat-card-footer">
                <span>Mulai Belajar Desain</span>
                <span className="cat-arrow">→</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          SECTION 1: PRODUK UNGGULAN (FEATURED PRODUCTS)
          ========================================================================= */}
      <section className="collection" style={{ paddingTop: '20px', paddingBottom: '40px' }}>
        <div className="app-container">
          <div className="collection-header-row" style={{ marginBottom: '24px' }}>
            <div>
              <span className="eyebrow">
                <span /> Katalog
              </span>
              <h2 className="collection-title">Produk pilihan</h2>
              <p className="collection-subtitle">
                Buka detail produk untuk melihat format, isi, dan catatan kreator.
              </p>
            </div>
            <button
              type="button"
              className="button button-dark"
              onClick={() => {
                playSound('click')
                navigate('/katalog')
              }}
            >
              <span>Semua Produk di Katalog</span>
              <span aria-hidden="true">→</span>
            </button>
          </div>

          <div className="product-grid">
            {allFeaturedProducts.map((p) => renderProductCard(p))}
          </div>

          <div className="text-center mt-8">
            <button
              type="button"
              className="button button-secondary"
              style={{ padding: '12px 28px', fontSize: '14px' }}
              onClick={() => {
                playSound('click')
                navigate('/katalog')
              }}
            >
              Lihat Seluruh Katalog ({allFeaturedProducts.length + freeProducts.length} Produk) →
            </button>
          </div>
        </div>
      </section>

      {/* =========================================================================
          SECTION 2: PRODUK GRATIS (FREEBIES RP 0)
          ========================================================================= */}
      <section className="collection freebies-section" style={{ paddingTop: '32px', paddingBottom: '48px', background: 'rgba(216, 214, 201, 0.25)', borderTop: '1px solid #deddd6', borderBottom: '1px solid #deddd6' }}>
        <div className="app-container">
          <div className="collection-header-row" style={{ marginBottom: '24px' }}>
            <div>
              <span className="eyebrow"><span /> Produk gratis</span>
              <h2 className="collection-title">Unduh Gratis (Rp 0)</h2>
              <p className="collection-subtitle">
                Lihat format, isi, dan catatan kreator pada halaman setiap produk.
              </p>
            </div>
            <button
              type="button"
              className="button button-orange"
              onClick={() => {
                playSound('click')
                navigate('/katalog?cat=Gratis+(Rp+0)')
              }}
            >
              <span>Koleksi Gratisan</span>
              <span aria-hidden="true">→</span>
            </button>
          </div>

          <div className="product-grid">
            {freeProducts.map((p) => renderProductCard(p))}
          </div>
        </div>
      </section>

      {/* Creator Registration Call-to-Action Banner */}
      <div className="app-container" style={{ margin: '40px auto' }}>
        <div className="p-8 rounded-2xl bg-[#303236] text-[#f5f5f2] flex flex-col md:flex-row items-center justify-between gap-6 shadow-lg">
          <div>
            <span className="text-xs font-mono font-bold tracking-widest uppercase text-[#e65416]">GABUNG JADI KREATOR</span>
            <h3 style={{ fontFamily: "'Space Grotesk Variable', sans-serif", fontSize: '24px', fontWeight: 700, margin: '6px 0 8px' }}>
              Punya Karya Digital? Jual & Buka Toko di PojokPixel.
            </h3>
            <p style={{ fontSize: '14px', color: '#d8d6c9', maxWidth: '540px', lineHeight: 1.5 }}>
              Dapatkan bagi hasil 80% (20% operasional platform) dari penjualan template website, poster grafis, bundel paket, dan materi desainmu. Daftarkan profilmu dan mulai unggah project pertama hari ini!
            </p>
          </div>
          <button
            type="button"
            className="button button-orange whitespace-nowrap"
            onClick={() => {
              playSound('pop')
              navigate('/kreator')
            }}
          >
            Daftar Menjadi Kreator →
          </button>
        </div>
      </div>
    </div>
  )
}
