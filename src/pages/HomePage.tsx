import { useRef, useState, useEffect, useMemo } from 'react'
import type { CSSProperties } from 'react'
import { featuredProducts, freeProducts, reviews, rupiah, getCreatorProducts, getProductImageUrl } from '../data/marketplace'
import type { Product } from '../data/marketplace'
import { TrustBadges } from '../components/TrustBadges'
import { usePageMeta } from '../hooks/usePageMeta'

interface HomePageProps {
  onQuickView: (p: Product) => void
  onAddToCart: (p: Product) => void
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

  const heroArtRef = useRef<HTMLDivElement>(null)
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

  // Top best-selling projects for the Hero Slider
  const bestSellerSlides = useMemo(() => {
    return [...allFeaturedProducts].sort((a, b) => b.salesCount - a.salesCount).slice(0, 4)
  }, [allFeaturedProducts])

  const [currentSlide, setCurrentSlide] = useState(0)

  // Continuous auto-slide every 3.8 seconds without user needing to click
  useEffect(() => {
    if (bestSellerSlides.length === 0) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % bestSellerSlides.length)
    }, 3800)
    return () => clearInterval(timer)
  }, [bestSellerSlides.length])

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

  // 3D Parallax Tilt for Hero Art
  const handleHeroMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!heroArtRef.current) return
    const rect = heroArtRef.current.getBoundingClientRect()
    const x = e.clientX - rect.left - rect.width / 2
    const y = e.clientY - rect.top - rect.height / 2
    const rotateX = -(y / rect.height) * 10
    const rotateY = (x / rect.width) * 10
    heroArtRef.current.style.transform = `perspective(1000px) rotateX(${rotateX.toFixed(2)}deg) rotateY(${rotateY.toFixed(2)}deg)`
  }

  const handleHeroMouseLeave = () => {
    if (!heroArtRef.current) return
    heroArtRef.current.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg)'
  }

  const renderProductCard = (p: Product, index: number) => {
    const isCustomArt = Boolean(
      p.id.startsWith('custom-') ||
      p.img.startsWith('data:') ||
      p.img.startsWith('http') ||
      p.label === 'Kreator' ||
      !['folio', 'sundae', 'study', 'nara', 'flora', 'class'].includes(p.id)
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
              <div className="image-index">PP-0{index + 1}</div>
            </>
          ) : (
            <>
              <div className="product-image-shade" />
              <div className="image-index">PP-0{index + 1}</div>

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
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="m13 6 6 6-6 6"/></svg>
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
                <span>MARKETPLACE DIGITAL PRODUCT INDONESIA</span>
              </div>
              <h1>
                Karya digital pilihan<br />untuk <span>akselerasi ide.</span>
              </h1>
              <p>
                Marketplace kurasi terlengkap penyedia <strong>Template Website</strong> siap pakai, <strong>Poster Digital</strong> estetik, dan <strong>Pembelajaran Digital</strong> praktis tanpa mulai dari kanvas kosong.
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
                <span className="text-xs font-mono font-semibold">Paling Dicari:</span>
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

              {/* Guarantees */}
              <div className="marketplace-guarantees-strip">
                <span className="guarantee-chip">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>
                  Unduhan Instan
                </span>
                <span className="guarantee-chip">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
                  Lisensi Komersial Bebas
                </span>
                <span className="guarantee-chip">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m5 12 5 5L20 7"/></svg>
                  100% Terkurasi
                </span>
              </div>

              {/* Team Proof with EXACT 3 MEMBERS */}
              <div className="hero-proof">
                <div className="avatar-stack">
                  <span title="Ardhian Maulana Tanjung">AM</span>
                  <span title="Aulia Ryansifa Wardah">AR</span>
                  <span title="Khoirunnisa Salsabila Osmon">KS</span>
                </div>
                <span>
                  Dibuat & dikurasi oleh tim <strong>Ardhian, Aulia, & Khoirunnisa</strong>
                </span>
                <span className="proof-line" />
                <span>Indonesia</span>
              </div>
            </div>

            {/* 3D Parallax Hero Art */}
            <div
              className="hero-art-perspective motion-safe:animate-panel-in"
              onMouseMove={handleHeroMouseMove}
              onMouseLeave={handleHeroMouseLeave}
            >
              <div
                className="hero-art"
                ref={heroArtRef}
                aria-label="Pratinjau marketplace produk digital Pojok Pixel"
              >
                <div className="art-spark spark-one">*</div>
                <div className="art-spark spark-two">*</div>

                <div className="hero-slider-wrap">
                  <div className="hero-slider-header">
                    <span className="hero-slider-badge">
                      <span className="inline-block w-2 h-2 rounded-full bg-white animate-pulse" />
                      Proyek Terlaris #{currentSlide + 1}
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
                            className="hero-slide-image"
                            style={{
                              backgroundImage: `url(${getProductImageUrl(item.img)})`,
                            }}
                          >
                            <div className="hero-slide-top-tags">
                              <span className="hero-slide-cat">{item.category}</span>
                              <span className="hero-slide-rating">★ {item.rating.toFixed(1)}</span>
                            </div>
                            <div className="hero-slide-sales">
                              <span>📦 {item.salesCount}+ Pembeli</span>
                              <span style={{ opacity: 0.6 }}>•</span>
                              <span>{item.tag}</span>
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

      {/* Stats Ribbon */}
      <section className="stats-ribbon" aria-label="Statistik Marketplace Pojok Pixel">
        <div className="app-container stats-grid">
          <div className="stat-item">
            <span className="stat-number">1.500+</span>
            <span className="stat-label">File Digital Terunduh</span>
          </div>
          <div className="stat-item">
            <span className="stat-number">3 Kategori</span>
            <span className="stat-label">Website, Poster, Pembelajaran</span>
          </div>
          <div className="stat-item">
            <span className="stat-number">100%</span>
            <span className="stat-label">Hak Pakai Komersial & Personal</span>
          </div>
          <div className="stat-item">
            <span className="stat-number">4.9 / 5.0</span>
            <span className="stat-label">Rating Kepuasan Komunitas</span>
          </div>
        </div>
      </section>

      {/* 3-Pillar Category Showcase */}
      <section className="category-showcase-section" id="kategori-unggulan">
        <div className="app-container">
          <div className="section-head text-center max-w-xl mx-auto mb-10">
            <span className="eyebrow mx-auto justify-center"><span /> 3 PILAR PRODUK UTAMA</span>
            <h2>Eksplorasi Menurut Kebutuhanmu</h2>
            <p className="subhead">
              Pilih pilar produk digital terkurasi untuk mempermudah alur kerjamu hari ini.
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
                <span className="cat-number">01</span>
                <span className="cat-badge">Website</span>
              </div>
              <h3>Template Website</h3>
              <p>Koleksi template portofolio, landing page, dan UI kit responsif berbasis Figma Auto-Layout dan kode HTML/Tailwind siap deploy.</p>
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
                <span className="cat-number">02</span>
                <span className="cat-badge">Poster</span>
              </div>
              <h3>Template Poster</h3>
              <p>Poster digital estetik editorial dan feed Instagram bernilai konversi tinggi. Mudah disunting di Canva gratis atau Photoshop.</p>
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
                <span className="cat-number">03</span>
                <span className="cat-badge">Belajar</span>
              </div>
              <h3>Pembelajaran Digital</h3>
              <p>Modul video praktis, cheatsheet grid, dan workbook interaktif untuk menguasai desain digital modern dari nol tanpa teori membingungkan.</p>
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
                <span /> {creatorProducts.length > 0 ? 'PILIHAN TERBAIK & RILISAN KREATOR' : 'PILIHAN TERBAIK'}
              </span>
              <h2 className="collection-title">Produk Unggulan & Terpopuler</h2>
              <p className="collection-subtitle">
                Aset digital pilihan bernilai konversi tinggi untuk proyek agensi, UMKM, dan kreator profesional.
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
            {allFeaturedProducts.map((p, i) => renderProductCard(p, i))}
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
              <span className="eyebrow"><span /> 100% BEBAS BIAYA</span>
              <h2 className="collection-title">Unduh Gratis (Rp 0)</h2>
              <p className="collection-subtitle">
                Mulai eksplorasi kualitas Pojok Pixel tanpa syarat. Termasuk lisensi komersial dan file mentah siap pakai.
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
            {freeProducts.map((p, i) => renderProductCard(p, i))}
          </div>
        </div>
      </section>

      {/* Trust Badges */}
      <TrustBadges />

      {/* Customer Reviews Section */}
      <section className="reviews-section" aria-label="Testimoni Pengguna Marketplace">
        <div className="app-container">
          <div className="section-head text-center max-w-xl mx-auto mb-10">
            <span className="eyebrow mx-auto justify-center"><span /> KATA KOMUNITAS</span>
            <h2>Cerita dari Kreator Nyata</h2>
            <p className="subhead">
              Bagaimana produk digital Pojok Pixel membantu mempercepat alur kerja dan proyek klien mereka.
            </p>
          </div>

          <div className="reviews-grid">
            {reviews.map((rev) => (
              <div className="review-card" key={rev.name}>
                <div className="review-stars">
                  {'★'.repeat(rev.rating)}
                </div>
                <p className="review-text">"{rev.text}"</p>
                <div className="review-author">
                  <span className="author-avatar">{rev.avatar}</span>
                  <div>
                    <h4 className="author-name">{rev.name}</h4>
                    <span className="author-role">{rev.role}</span>
                  </div>
                </div>
              </div>
            ))}
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
