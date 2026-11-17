import { useEffect, useMemo, useState } from 'react'
import { getLiveProducts, rupiah, getProductImageUrl } from '../data/marketplace'
import type { Product } from '../data/marketplace'
import { authClient } from '../lib/auth-client'

export { getLiveProducts }

interface ProductReview {
  id: string
  name: string
  rating: number
  comment: string
  createdAt: string
}

function getVideoPreview(url?: string) {
  if (!url) return null
  try {
    const parsed = new URL(url)
    if (parsed.protocol !== 'https:' && parsed.protocol !== 'http:') return null
    const host = parsed.hostname.replace(/^www\./, '').toLowerCase()
    const directVideo = /\.(mp4|webm|ogg)$/i.test(parsed.pathname)
    if (directVideo) return { type: 'video' as const, src: parsed.href }
    let videoId = ''
    if (host === 'youtu.be') videoId = parsed.pathname.slice(1)
    if (host === 'youtube.com' || host === 'm.youtube.com') {
      videoId = parsed.searchParams.get('v') || parsed.pathname.match(/\/embed\/([^/]+)/)?.[1] || ''
    }
    if (videoId) return { type: 'embed' as const, src: `https://www.youtube-nocookie.com/embed/${encodeURIComponent(videoId)}` }
    if (host === 'vimeo.com' || host === 'player.vimeo.com') {
      const id = parsed.pathname.split('/').filter(Boolean).pop()
      if (id && /^\d+$/.test(id)) return { type: 'embed' as const, src: `https://player.vimeo.com/video/${id}` }
    }
  } catch { /* invalid preview URL */ }
  return null
}

function readCheckoutCount(productId: string) {
  try {
    const orders = JSON.parse(localStorage.getItem('pojokpixel:orders') || '[]') as Array<{
      orderId?: string
      status?: string
      items?: Array<{ id?: string; product?: { id?: string } }>
    }>
    const matchedOrders = new Set<string>()
    for (const [index, order] of orders.entries()) {
      if (order.status !== 'completed' || !order.items?.some((item) => (item.id || item.product?.id) === productId)) continue
      matchedOrders.add(order.orderId || `order-${index}`)
    }
    if (matchedOrders.size > 0) return matchedOrders.size
    const lastPurchase = JSON.parse(localStorage.getItem('pojokpixel:last_purchase') || '[]') as Product[]
    return lastPurchase.some((item) => item.id === productId) ? 1 : 0
  } catch {
    return 0
  }
}

function StarRating({ rating, count }: { rating: number; count: number }) {
  return (
    <span className="detail-stars" aria-label={count ? `Rating ${rating.toFixed(1)} dari 5, ${count} ulasan` : 'Belum ada rating'}>
      {Array.from({ length: 5 }).map((_, i) => (
        <svg key={i} width="15" height="15" viewBox="0 0 24 24" fill={i < Math.round(rating) ? '#e65416' : 'none'} stroke="#e65416" strokeWidth="2" aria-hidden="true">
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
        </svg>
      ))}
      <span style={{ marginLeft: 5, fontSize: 13, color: '#52555a' }}>{count ? `${rating.toFixed(1)} · ${count} ulasan` : 'Belum ada ulasan'}</span>
    </span>
  )
}

export default function ProductDetailPage() {
  const { data: session, isPending } = authClient.useSession()
  const pathId = window.location.pathname.split('/produk/')[1]?.split('/')[0] ?? ''
  const liveList = getLiveProducts()
  const product = liveList.find((item) => item.id === decodeURIComponent(pathId))
  const [added, setAdded] = useState(false)
  const [reviews, setReviews] = useState<ProductReview[]>([])
  const [checkoutCount, setCheckoutCount] = useState(0)
  const [selectedRating, setSelectedRating] = useState(0)
  const [reviewName, setReviewName] = useState('')
  const [reviewComment, setReviewComment] = useState('')
  const [reviewError, setReviewError] = useState('')

  useEffect(() => {
    if (!product) return
    try {
      const saved = JSON.parse(localStorage.getItem(`pojokpixel:reviews:${product.id}`) || '[]')
      setReviews(Array.isArray(saved) ? saved : [])
    } catch { setReviews([]) }
    setCheckoutCount(readCheckoutCount(product.id))
    const refreshOrders = () => setCheckoutCount(readCheckoutCount(product.id))
    window.addEventListener('pojokpixel:orders_updated', refreshOrders)
    window.addEventListener('storage', refreshOrders)
    return () => {
      window.removeEventListener('pojokpixel:orders_updated', refreshOrders)
      window.removeEventListener('storage', refreshOrders)
    }
  }, [product?.id])

  const averageRating = useMemo(() => reviews.length ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length : 0, [reviews])

  if (!product) {
    return (
      <div className="detail-not-found">
        <div className="app-container" style={{ padding: '80px 24px', textAlign: 'center' }}>
          <div style={{ fontSize: 64, marginBottom: 16 }}>🔎</div>
          <h1 style={{ fontFamily: "'Space Grotesk Variable', sans-serif", fontSize: 28, marginBottom: 12 }}>Produk tidak ditemukan</h1>
          <p style={{ color: '#52555a', marginBottom: 32 }}>Produk yang kamu cari mungkin sudah tidak tersedia atau URL-nya salah.</p>
          <a href="/" className="detail-btn-primary">Kembali ke Beranda</a>
        </div>
      </div>
    )
  }

  const related = liveList.filter((item) => item.id !== product.id).slice(0, 3)
  const discount = product.originalPrice > product.price && product.price > 0 ? Math.round((1 - product.price / product.originalPrice) * 100) : 0
  const videoPreview = getVideoPreview(product.videoUrl)

  const handleAddToCart = () => {
    if (isPending) return
    if (!session?.user) {
      window.alert('Masuk ke akun PojokPixel terlebih dahulu untuk menambahkan produk ke keranjang.')
      window.location.assign('/login')
      return
    }
    setAdded(true)
    window.setTimeout(() => setAdded(false), 2000)
    try {
      const existing = JSON.parse(localStorage.getItem('pojokpixel:cart') || '[]') as Array<{ product: Product; quantity: number }>
      const idx = existing.findIndex((item) => item.product.id === product.id)
      if (idx >= 0) existing[idx].quantity += 1
      else existing.push({ product, quantity: 1 })
      localStorage.setItem('pojokpixel:cart', JSON.stringify(existing))
      window.dispatchEvent(new CustomEvent('pojokpixel:cart_updated'))
    } catch { /* local cart unavailable */ }
  }

  const handleReviewSubmit = (event: React.FormEvent) => {
    event.preventDefault()
    if (!selectedRating) { setReviewError('Pilih rating bintang terlebih dahulu.'); return }
    if (reviewComment.trim().length < 5) { setReviewError('Komentar minimal 5 karakter.'); return }
    const review: ProductReview = {
      id: `review-${Date.now()}`,
      name: reviewName.trim() || 'Pengunjung PojokPixel',
      rating: selectedRating,
      comment: reviewComment.trim(),
      createdAt: new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }),
    }
    const next = [review, ...reviews]
    try {
      localStorage.setItem(`pojokpixel:reviews:${product.id}`, JSON.stringify(next))
      setReviews(next)
      setReviewName('')
      setReviewComment('')
      setSelectedRating(0)
      setReviewError('')
    } catch {
      setReviewError('Ulasan tidak dapat disimpan. Penyimpanan browser mungkin penuh.')
    }
  }

  return (
    <div className="detail-page" id="main-content">
      <header className="detail-header">
        <div className="app-container detail-header-inner">
          <a href="/" className="detail-brand">
            <img src="/pojokpixel-mark.svg" alt="Logo Pojok Pixel" style={{ width: 28, height: 28, imageRendering: 'pixelated', borderRadius: '50%' }} />
            <span style={{ fontFamily: "'Space Grotesk Variable', sans-serif", fontWeight: 700, fontSize: 18, letterSpacing: '-0.5px' }}>pojok<span style={{ fontWeight: 500 }}>pixel</span><i style={{ fontStyle: 'normal', color: '#e65416' }}>.</i></span>
          </a>
          <a href="/" className="detail-back-btn"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="m15 18-6-6 6-6" /></svg>Kembali ke Katalog</a>
        </div>
      </header>

      <div className="app-container">
        <nav className="detail-breadcrumb" aria-label="Breadcrumb"><a href="/">Beranda</a><span aria-hidden="true">›</span><a href={`/?cat=${encodeURIComponent(product.category)}`}>{product.category}</a><span aria-hidden="true">›</span><span aria-current="page">{product.name}</span></nav>
        <div className="detail-grid">
          <div className="detail-image-col">
            <div className="detail-image-wrap">
              <img src={getProductImageUrl(product.img)} alt={product.name} className="detail-image" />
              <span className="detail-label-badge">{product.label}</span>
            </div>
            {videoPreview && <div className="detail-video-card"><div className="detail-video-heading"><span>Preview produk</span><span>Video kreator</span></div>{videoPreview.type === 'video' ? <video className="detail-video" src={videoPreview.src} controls playsInline preload="metadata" /> : <iframe className="detail-video" src={videoPreview.src} title={`Video preview ${product.name}`} loading="lazy" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowFullScreen />}</div>}
            <div className="detail-trust-row">
              <div className="detail-trust-item"><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#e65416" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" /></svg><span>Unduhan Instan</span></div>
              <div className="detail-trust-item"><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#e65416" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></svg><span>Lisensi Produk</span></div>
              <div className="detail-trust-item"><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#e65416" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m5 12 5 5L20 7" /></svg><span>Akses Selamanya</span></div>
            </div>
          </div>

          <div className="detail-info-col">
            <div className="detail-category-tag">{product.category}</div>
            <h1 className="detail-title">{product.name}</h1>
            <div className="detail-meta-row"><StarRating rating={averageRating} count={reviews.length} /><span className="detail-sales">{checkoutCount} checkout tercatat</span></div>
            <p className="detail-desc">{product.shortDesc}</p>
            <div className="detail-price-row"><span className="detail-price">{rupiah(product.price)}</span>{product.price > 0 && <><span className="detail-original-price">{rupiah(product.originalPrice)}</span>{discount > 0 && <span className="detail-discount-badge">Hemat {discount}%</span>}</>}</div>
            <div className="detail-section"><h3 className="detail-section-title">File yang diterima</h3><div className="detail-formats">{(product.formats.length ? product.formats : ['Detail format belum dicantumkan']).map((format) => <span key={format} className="detail-format-chip">{format}</span>)}</div>{product.fileAttachment && <div className="detail-file-row"><span className="detail-file-icon">↓</span><span><strong>{product.fileAttachment.fileName}</strong><small>{product.fileAttachment.fileSize} · {product.fileAttachment.fileType}</small></span></div>}{product.accessUrl && <p className="detail-access-note">Termasuk tautan akses cloud setelah checkout.</p>}</div>
            <div className="detail-section"><h3 className="detail-section-title">Yang kamu dapat</h3><ul className="detail-includes">{product.includes.map((item) => <li key={item}><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#e65416" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="m5 12 5 5L20 7" /></svg><span>{item}</span></li>)}</ul></div>
            {product.buyerNote && <div className="detail-note"><strong>Catatan kreator</strong><p>{product.buyerNote}</p></div>}
            <div className="detail-cta-row"><button type="button" className="detail-btn-primary" onClick={handleAddToCart} aria-live="polite">{added ? '✓ Ditambahkan ke keranjang' : '＋ Tambah ke Keranjang'}</button><a href="/" className="detail-btn-secondary">Lihat Produk Lain</a></div>
            <p className="detail-local-note">Jumlah checkout dan ulasan pada demo ini tercatat di browser perangkat ini.</p>
          </div>
        </div>

        <section className="detail-reviews" aria-labelledby="reviews-heading">
          <div className="detail-reviews-intro"><div><span className="detail-eyebrow">PENGALAMAN PEMBELI</span><h2 id="reviews-heading">Ulasan produk</h2><p>Sudah mencoba produk ini? Bagikan pendapat dan bantu pembeli lain memilih.</p></div><div className="detail-rating-summary"><strong>{reviews.length ? averageRating.toFixed(1) : '—'}</strong><StarRating rating={averageRating} count={reviews.length} /></div></div>
          <div className="detail-review-layout">
            <form className="detail-review-form" onSubmit={handleReviewSubmit}>
              <h3>Tulis ulasan</h3><label>Rating kamu</label><div className="detail-rating-picker" role="radiogroup" aria-label="Pilih rating produk">{[1, 2, 3, 4, 5].map((star) => <button type="button" key={star} role="radio" aria-checked={selectedRating === star} aria-label={`${star} bintang`} onClick={() => setSelectedRating(star)} className={star <= selectedRating ? 'is-selected' : ''}>★</button>)}</div>
              <label htmlFor="review-name">Nama <span>(opsional)</span></label><input id="review-name" value={reviewName} onChange={(event) => setReviewName(event.target.value)} placeholder="Nama yang ditampilkan" maxLength={50} />
              <label htmlFor="review-comment">Komentar</label><textarea id="review-comment" value={reviewComment} onChange={(event) => setReviewComment(event.target.value)} placeholder="Ceritakan pengalamanmu dengan produk ini…" rows={4} maxLength={500} required />
              {reviewError && <p className="detail-review-error" role="alert">{reviewError}</p>}<button className="detail-btn-primary" type="submit">Kirim ulasan</button>
            </form>
            <div className="detail-review-list">{reviews.length ? reviews.map((review) => <article className="detail-review-card" key={review.id}><div className="detail-review-card-top"><div className="detail-review-avatar">{review.name.trim().slice(0, 1).toUpperCase()}</div><div><strong>{review.name}</strong><small>{review.createdAt}</small></div><span className="detail-review-stars" aria-label={`${review.rating} dari 5 bintang`}>{'★'.repeat(review.rating)}<span>{'★'.repeat(5 - review.rating)}</span></span></div><p>{review.comment}</p></article>) : <div className="detail-review-empty"><span>✳</span><strong>Belum ada ulasan</strong><p>Jadilah yang pertama memberi rating dan komentar untuk produk ini.</p></div>}</div>
          </div>
        </section>

        <section className="detail-related" aria-labelledby="related-heading"><h2 id="related-heading" className="detail-related-title">Produk lain yang mungkin kamu suka</h2><div className="detail-related-grid">{related.map((item) => <a key={item.id} href={`/produk/${item.id}`} className="detail-related-card"><img src={getProductImageUrl(item.img)} alt={item.name} className="detail-related-img" loading="lazy" /><div className="detail-related-info"><span className="detail-related-cat">{item.category}</span><span className="detail-related-name">{item.name}</span><span className="detail-related-price">{rupiah(item.price)}</span></div></a>)}</div></section>
      </div>
      <footer className="detail-footer"><div className="app-container"><span>© 2026 Pojok Pixel · Dibuat dengan ♥ oleh Ardhian, Aulia & Khoirunnisa</span><a href="/">Kembali ke Beranda</a></div></footer>
    </div>
  )
}
