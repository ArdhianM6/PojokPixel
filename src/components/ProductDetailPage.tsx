import { useState } from 'react'
import { getLiveProducts, rupiah, getProductImageUrl } from '../data/marketplace'
import type { Product } from '../data/marketplace'

export { getLiveProducts }

function StarRating({ rating }: { rating: number }) {
  return (
    <span className="detail-stars" aria-label={`Rating ${rating} dari 5`}>
      {Array.from({ length: 5 }).map((_, i) => (
        <svg
          key={i}
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill={i < Math.floor(rating) ? '#e65416' : 'none'}
          stroke="#e65416"
          strokeWidth="2"
          aria-hidden="true"
        >
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
        </svg>
      ))}
      <span style={{ marginLeft: 4, fontSize: 13, color: '#52555a' }}>{rating} ({Math.floor(rating * 10)} ulasan)</span>
    </span>
  )
}

export default function ProductDetailPage() {
  const pathId = window.location.pathname.split('/produk/')[1]?.split('/')[0] ?? ''
  const liveList = getLiveProducts()
  const product = liveList.find(p => p.id === pathId)
  const [added, setAdded] = useState(false)

  if (!product) {
    return (
      <div className="detail-not-found">
        <div className="app-container" style={{ padding: '80px 24px', textAlign: 'center' }}>
          <div style={{ fontSize: 64, marginBottom: 16 }}>🔍</div>
          <h1 style={{ fontFamily: "'Space Grotesk Variable', sans-serif", fontSize: 28, marginBottom: 12 }}>Produk tidak ditemukan</h1>
          <p style={{ color: '#52555a', marginBottom: 32 }}>Produk yang kamu cari mungkin sudah tidak tersedia atau URL-nya salah.</p>
          <a
            href="/"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              padding: '12px 28px',
              background: '#e65416',
              color: '#fff',
              borderRadius: 9999,
              fontWeight: 600,
              fontSize: 14,
            }}
          >
            Kembali ke Beranda
          </a>
        </div>
      </div>
    )
  }

  const related = liveList.filter(p => p.id !== product.id).slice(0, 3)
  const discount = product.originalPrice > product.price && product.price > 0
    ? Math.round((1 - product.price / product.originalPrice) * 100)
    : 0

  const handleAddToCart = () => {
    setAdded(true)
    setTimeout(() => setAdded(false), 2000)
    // Store in localStorage cart
    try {
      const existing = JSON.parse(localStorage.getItem('pojokpixel:cart') || '[]') as Array<{ product: Product; quantity: number }>
      const idx = existing.findIndex(i => i.product.id === product.id)
      if (idx >= 0) {
        existing[idx].quantity += 1
      } else {
        existing.push({ product, quantity: 1 })
      }
      localStorage.setItem('pojokpixel:cart', JSON.stringify(existing))
    } catch { /* noop */ }
  }

  return (
    <div className="detail-page" id="main-content">
      {/* Header minimal */}
      <header className="detail-header">
        <div className="app-container detail-header-inner">
          <a href="/" className="detail-brand">
            <img src="/pojokpixel-mark.svg" alt="Logo Pojok Pixel" style={{ width: 28, height: 28, imageRendering: 'pixelated', borderRadius: '50%' }} />
            <span style={{ fontFamily: "'Space Grotesk Variable', sans-serif", fontWeight: 700, fontSize: 18, letterSpacing: '-0.5px' }}>
              pojok<span style={{ fontWeight: 500 }}>pixel</span><i style={{ fontStyle: 'normal', color: '#e65416' }}>.</i>
            </span>
          </a>
          <a href="/" className="detail-back-btn">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="m15 18-6-6 6-6"/></svg>
            Kembali ke Katalog
          </a>
        </div>
      </header>

      {/* Breadcrumb */}
      <div className="app-container">
        <nav className="detail-breadcrumb" aria-label="Breadcrumb">
          <a href="/">Beranda</a>
          <span aria-hidden="true">›</span>
          <a href={`/?cat=${encodeURIComponent(product.category)}`}>{product.category}</a>
          <span aria-hidden="true">›</span>
          <span aria-current="page">{product.name}</span>
        </nav>
      </div>

      {/* Main detail content */}
      <div className="app-container">
        <div className="detail-grid">
          {/* Left: Image */}
          <div className="detail-image-col">
            <div className="detail-image-wrap">
              <img
                src={getProductImageUrl(product.img)}
                alt={product.name}
                className="detail-image"
                loading="lazy"
              />
              <span className="detail-label-badge">{product.label}</span>
            </div>
            {/* Trust signals below image */}
            <div className="detail-trust-row">
              <div className="detail-trust-item">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#e65416" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>
                <span>Unduhan Instan</span>
              </div>
              <div className="detail-trust-item">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#e65416" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
                <span>Lisensi Komersial</span>
              </div>
              <div className="detail-trust-item">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#e65416" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m5 12 5 5L20 7"/></svg>
                <span>Akses Selamanya</span>
              </div>
            </div>
          </div>

          {/* Right: Product info */}
          <div className="detail-info-col">
            <div className="detail-category-tag">{product.category}</div>
            <h1 className="detail-title">{product.name}</h1>

            <div className="detail-meta-row">
              <StarRating rating={product.rating} />
              <span className="detail-sales">{product.salesCount}+ terjual</span>
            </div>

            <p className="detail-desc">{product.shortDesc}</p>

            {/* Price */}
            <div className="detail-price-row">
              <span className="detail-price">{rupiah(product.price)}</span>
              {product.price > 0 && (
                <>
                  <span className="detail-original-price">{rupiah(product.originalPrice)}</span>
                  {discount > 0 && <span className="detail-discount-badge">Hemat {discount}%</span>}
                </>
              )}
            </div>

            {/* Formats */}
            <div className="detail-section">
              <h3 className="detail-section-title">Format File</h3>
              <div className="detail-formats">
                {product.formats.map(f => (
                  <span key={f} className="detail-format-chip">{f}</span>
                ))}
              </div>
            </div>

            {/* Includes */}
            <div className="detail-section">
              <h3 className="detail-section-title">Yang Kamu Dapat</h3>
              <ul className="detail-includes">
                {product.includes.map(item => (
                  <li key={item}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#e65416" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="m5 12 5 5L20 7"/></svg>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* CTA Buttons */}
            <div className="detail-cta-row">
              <button
                type="button"
                className="detail-btn-primary"
                onClick={handleAddToCart}
                aria-live="polite"
              >
                {added ? (
                  <>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m5 12 5 5L20 7"/></svg>
                    Ditambahkan!
                  </>
                ) : (
                  <>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 8h14l1 13H4L5 8Z"/><path d="M9 9V6a3 3 0 0 1 6 0v3"/></svg>
                    Tambah ke Keranjang
                  </>
                )}
              </button>
              <a href="/" className="detail-btn-secondary">
                Lihat Produk Lain
              </a>
            </div>

            {/* Coupon hint */}
            <p className="detail-coupon-hint">
              🎟️ Punya kupon? Gunakan kode <strong>PIXELHEMAT</strong> di keranjang untuk diskon 15%.
            </p>
          </div>
        </div>

        {/* Related Products */}
        <section className="detail-related" aria-labelledby="related-heading">
          <h2 id="related-heading" className="detail-related-title">Produk Lainnya yang Mungkin Kamu Suka</h2>
          <div className="detail-related-grid">
            {related.map(p => (
              <a key={p.id} href={`/produk/${p.id}`} className="detail-related-card">
                <img
                  src={getProductImageUrl(p.img)}
                  alt={p.name}
                  className="detail-related-img"
                  loading="lazy"
                />
                <div className="detail-related-info">
                  <span className="detail-related-cat">{p.category}</span>
                  <span className="detail-related-name">{p.name}</span>
                  <span className="detail-related-price">{rupiah(p.price)}</span>
                </div>
              </a>
            ))}
          </div>
        </section>
      </div>

      {/* Footer minimal */}
      <footer className="detail-footer">
        <div className="app-container">
          <span>© 2026 Pojok Pixel · Dibuat dengan ❤️ oleh Ardhian, Aulia & Khoirunnisa</span>
          <a href="/">Kembali ke Beranda</a>
        </div>
      </footer>
    </div>
  )
}
