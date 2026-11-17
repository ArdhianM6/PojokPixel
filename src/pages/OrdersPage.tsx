import { useState, useEffect, useMemo } from 'react'
import { usePageMeta } from '../hooks/usePageMeta'
import { rupiah, getProductImageUrl } from '../data/marketplace'
import type { Product } from '../data/marketplace'

export interface OrderItem {
  id: string
  product: Product
  pricePaid: number
}

export interface OrderRecord {
  orderId: string
  date: string
  timestamp: number
  totalAmount: number
  paymentMethod: 'qris' | 'bca' | 'cc'
  status: 'completed'
  items: OrderItem[]
}

interface OrdersPageProps {
  playSound: (type: 'click' | 'pop' | 'success' | 'delete') => void
  navigate: (path: string) => void
  notify: (msg: string) => void
  onDownloadAsset: (p: Product) => void
}

export function OrdersPage({ playSound, navigate, notify, onDownloadAsset }: OrdersPageProps) {
  usePageMeta('Riwayat Pembelian & Unduhan', 'Akses seluruh berkas digital dan template yang pernah kamu beli di PojokPixel. Unduh ulang kapan saja tanpa batas.')

  const [ordersVersion, setOrdersVersion] = useState(0)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('Semua')

  useEffect(() => {
    const handleUpdate = () => setOrdersVersion((v) => v + 1)
    window.addEventListener('pojokpixel:orders_updated', handleUpdate)
    window.addEventListener('storage', handleUpdate)
    return () => {
      window.removeEventListener('pojokpixel:orders_updated', handleUpdate)
      window.removeEventListener('storage', handleUpdate)
    }
  }, [])

  const orders = useMemo<OrderRecord[]>(() => {
    try {
      const savedOrders = JSON.parse(localStorage.getItem('pojokpixel:orders') || '[]') as OrderRecord[]
      if (Array.isArray(savedOrders) && savedOrders.length > 0) return savedOrders

      const lastPurchase = JSON.parse(localStorage.getItem('pojokpixel:last_purchase') || '[]') as Product[]
      if (Array.isArray(lastPurchase) && lastPurchase.length > 0) {
        const fallbackOrder: OrderRecord = {
          orderId: 'PP-2026-9842',
          date: new Date().toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' }),
          timestamp: Date.now(),
          totalAmount: lastPurchase.reduce((sum, p) => sum + p.price, 0),
          paymentMethod: 'qris',
          status: 'completed',
          items: lastPurchase.map((p) => ({ id: p.id, product: p, pricePaid: p.price })),
        }
        return [fallbackOrder]
      }
      return []
    } catch {
      return []
    }
  }, [ordersVersion])

  const totalProductsCount = useMemo(() => orders.reduce((total, ord) => total + ord.items.length, 0), [orders])

  const filteredOrders = useMemo(() => {
    const q = searchQuery.toLowerCase().trim()
    return orders
      .map((ord) => {
        const filteredItems = ord.items.filter((item) => {
          const matchCat = selectedCategory === 'Semua' || item.product.category === selectedCategory
          const matchQuery =
            !q ||
            item.product.name.toLowerCase().includes(q) ||
            ord.orderId.toLowerCase().includes(q) ||
            item.product.category.toLowerCase().includes(q) ||
            (item.product.fileAttachment?.fileName && item.product.fileAttachment.fileName.toLowerCase().includes(q))
          return matchCat && matchQuery
        })
        if (filteredItems.length === 0) return null
        return { ...ord, items: filteredItems }
      })
      .filter((ord): ord is OrderRecord => ord !== null)
  }, [orders, searchQuery, selectedCategory])

  const handleDownloadAllFromOrder = (order: OrderRecord) => {
    playSound('pop')
    notify(`Memulai pengunduhan ${order.items.length} berkas sekaligus...`)
    order.items.forEach((item, idx) => {
      setTimeout(() => { onDownloadAsset(item.product) }, idx * 400)
    })
  }

  return (
    <div className="min-h-screen bg-[#f5f5f2] pb-16">
      {/* Breadcrumb Header */}
      <div className="border-b border-[#deddd6] bg-[#f5f5f2]">
        <div className="w-full max-w-[1220px] mx-auto px-6">
          <nav className="flex items-center gap-2 py-3 text-xs font-mono text-[#72736c]" aria-label="Navigasi Halaman">
            <a
              href="/"
              onClick={(e) => { e.preventDefault(); playSound('click'); navigate('/') }}
              className="hover:text-[#e65416] transition-colors"
            >
              Beranda
            </a>
            <span aria-hidden="true" className="text-[#b7b6ae]">/</span>
            <span className="text-[#303236] font-semibold" aria-current="page">Riwayat Pembelian &amp; Unduhan</span>
          </nav>
        </div>
      </div>

      <div className="w-full max-w-[1220px] mx-auto px-6 pt-7 pb-16">
        {/* Page Heading */}
        <div className="mb-8">
          <div className="inline-flex items-center gap-2 font-mono text-[10.5px] tracking-widest text-[#e65416] font-bold mb-2 uppercase">
            <span className="w-2 h-2 rounded-full bg-[#e65416] animate-pulse" />
            AKSES LISENSI RESMI &amp; UNDUHAN SEUMUR HIDUP
          </div>
          <h1 className="font-[family-name:var(--font-display)] text-3xl md:text-4xl font-bold text-[#303236] tracking-tight mb-2">
            Riwayat Pembelian &amp; Unduhan
          </h1>
          <p className="text-sm text-[#555650] leading-relaxed max-w-2xl">
            Seluruh berkas project digital yang pernah kamu beli tersimpan rapi di sini. Jika file di komputermu terhapus atau hilang,
            kamu bisa <strong className="text-[#303236]">mengunduh ulang berkas aslinya kapan saja</strong> tanpa dipungut biaya tambahan.
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'TOTAL PRODUK DIBELI', val: totalProductsCount, sub: 'File digital tersimpan', color: 'text-[#303236]' },
            { label: 'TOTAL PESANAN LUNAS', val: orders.length, sub: 'Transaksi terverifikasi', color: 'text-[#303236]' },
            { label: 'STATUS LISENSI', val: '100% Aktif', sub: 'Personal & Komersial', color: 'text-emerald-600' },
            { label: 'JAMINAN UNDUHAN', val: 'Lifetime', sub: 'Akses tanpa batas waktu', color: 'text-[#e65416]' },
          ].map((s) => (
            <div key={s.label} className="bg-white border border-[#deddd6] rounded-xl p-4 shadow-sm hover:shadow-md transition">
              <span className="block font-mono text-[9px] font-bold tracking-wider text-[#72736c] mb-1">{s.label}</span>
              <strong className={`block text-2xl font-[family-name:var(--font-display)] font-bold ${s.color}`}>{s.val}</strong>
              <small className="block text-[11px] text-[#9a9b94] mt-0.5">{s.sub}</small>
            </div>
          ))}
        </div>

        {/* Filter & Search */}
        {orders.length > 0 && (
          <div className="bg-white border border-[#deddd6] rounded-xl p-4 mb-6 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 shadow-sm">
            <div className="relative flex-1 max-w-md">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm text-[#9a9b94] pointer-events-none">🔍</span>
              <input
                type="text"
                placeholder="Cari produk, nomor pesanan, atau file..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-8 py-2 text-sm border border-[#deddd6] rounded-lg bg-[#f5f5f2] focus:outline-none focus:border-[#e65416] focus:ring-2 focus:ring-[#e65416]/20 transition text-[#303236] placeholder:text-[#b7b6ae]"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  aria-label="Bersihkan pencarian"
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 w-5 h-5 rounded-full bg-[#e8e6df] text-[#6d6e68] text-xs grid place-items-center hover:bg-[#303236] hover:text-white transition"
                >
                  ×
                </button>
              )}
            </div>
            <div className="flex gap-1.5 flex-wrap">
              {['Semua', 'Template Website', 'Template Poster', 'Pembelajaran Digital', 'Bundel Produk'].map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => { playSound('click'); setSelectedCategory(cat) }}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                    selectedCategory === cat
                      ? 'bg-[#303236] text-white border-[#303236]'
                      : 'bg-white text-[#52555a] border-[#deddd6] hover:border-[#303236] hover:text-[#303236]'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Orders List / Empty States */}
        {orders.length === 0 ? (
          <div className="text-center py-16 max-w-md mx-auto bg-white border border-[#deddd6] rounded-2xl p-8 shadow-sm">
            <div className="w-16 h-16 rounded-full bg-orange-50 border border-orange-200 grid place-items-center text-3xl mx-auto mb-4">📦</div>
            <h2 className="font-[family-name:var(--font-display)] text-xl font-bold text-[#303236] mb-2">Belum Ada Riwayat Pembelian</h2>
            <p className="text-sm text-[#63656b] leading-relaxed mb-6">
              Kamu belum pernah melakukan pembelian atau mengklaim aset digital di PojokPixel.
              Jelajahi ribuan template website, poster, dan materi desain kami untuk memulai karyamu!
            </p>
            <div className="flex flex-wrap justify-center gap-3">
              <button
                type="button"
                onClick={() => { playSound('click'); navigate('/katalog') }}
                className="button button-orange inline-flex items-center gap-2 h-11 px-6 rounded-full text-xs font-semibold shadow-sm transition active:scale-95"
              >
                <span>Jelajahi Katalog Marketplace</span>
                <span aria-hidden="true">→</span>
              </button>
              <button
                type="button"
                onClick={() => { playSound('click'); navigate('/') }}
                className="button button-secondary inline-flex items-center h-11 px-5 rounded-full text-xs font-semibold border border-[#deddd6] bg-white transition active:scale-95"
              >
                Kembali ke Beranda
              </button>
            </div>
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="text-center py-12 bg-white border border-[#deddd6] rounded-2xl p-8">
            <div className="text-4xl mb-3">🔎</div>
            <h3 className="text-lg font-bold text-[#303236] mb-1">Tidak Ada Hasil yang Cocok</h3>
            <p className="text-sm text-[#66686d] mb-4">
              Tidak ditemukan pesanan atau berkas dengan kata kunci &quot;{searchQuery}&quot;.
            </p>
            <button
              type="button"
              onClick={() => { setSearchQuery(''); setSelectedCategory('Semua') }}
              className="button button-secondary inline-flex items-center h-10 px-5 rounded-full border border-[#deddd6] bg-white text-[#303236] text-xs font-semibold hover:border-[#303236] transition"
            >
              Reset Pencarian
            </button>
          </div>
        ) : (
          <div className="flex flex-col gap-5">
            {filteredOrders.map((order) => (
              <article
                key={order.orderId + order.timestamp}
                className="bg-white border border-[#deddd6] rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition"
              >
                {/* Order Top Bar */}
                <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-3.5 border-b border-[#deddd6] bg-[#f9f9f7]">
                  <div className="flex flex-wrap items-center gap-2.5">
                    <span className="font-mono text-xs font-bold text-[#303236] bg-[#e8e6df] px-2.5 py-1 rounded-md border border-[#d6d4cb]">
                      {order.orderId}
                    </span>
                    <span className="text-xs text-[#72736c]">{order.date}</span>
                    <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full inline-flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                      Lunas (Terverifikasi)
                    </span>
                  </div>
                  <div className="flex flex-wrap items-center gap-3">
                    <span className="text-xs text-[#72736c]">
                      Metode: {order.paymentMethod === 'qris' ? 'QRIS Otomatis' : order.paymentMethod === 'bca' ? 'VA Bank' : 'Kartu Kredit'}
                    </span>
                    <strong className="font-[family-name:var(--font-display)] text-base font-bold text-[#303236]">
                      {rupiah(order.totalAmount)}
                    </strong>
                    {order.items.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleDownloadAllFromOrder(order)}
                        className="button button-dark inline-flex items-center gap-1.5 h-8 px-3.5 rounded-full text-xs font-semibold transition active:scale-95"
                      >
                        <span>Unduh Semua ({order.items.length})</span>
                      </button>
                    )}
                  </div>
                </div>

                {/* Items in this Order */}
                <div className="divide-y divide-[#ebe9e1]">
                  {order.items.map((item) => {
                    const p = item.product
                    return (
                      <div key={item.id + order.orderId} className="p-5">
                        <div className="flex flex-col sm:flex-row gap-4 mb-4">
                          {/* Thumbnail with uncropped contain fit */}
                          <div
                            className="w-20 h-20 rounded-xl bg-contain bg-center bg-no-repeat bg-[#f5f4ef] flex-shrink-0 cursor-pointer border border-[#deddd6] shadow-sm hover:border-[#e65416] transition"
                            style={{ backgroundImage: `url(${getProductImageUrl(p.img)})` }}
                            onClick={() => { playSound('click'); navigate(`/produk/${p.id}`) }}
                            role="button"
                            tabIndex={0}
                            title="Klik untuk melihat detail produk"
                          />
                          <div className="flex-1 min-w-0">
                            <span className="block font-mono text-[10px] font-bold text-[#72736c] uppercase tracking-wider mb-1">
                              {p.category}
                            </span>
                            <h3 className="font-[family-name:var(--font-display)] font-bold text-[#303236] text-lg mb-1 leading-snug">
                              <a
                                href={`/produk/${p.id}`}
                                onClick={(e) => { e.preventDefault(); playSound('click'); navigate(`/produk/${p.id}`) }}
                                className="hover:text-[#e65416] transition-colors"
                              >
                                {p.name}
                              </a>
                            </h3>
                            <div className="flex flex-wrap items-center gap-2 mt-1.5">
                              <span className="text-[11.5px] text-emerald-700 font-semibold inline-flex items-center gap-1 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full">
                                🛡️ Lisensi Komersial &amp; Personal Resmi Aktif
                              </span>
                              {p.fileAttachment?.fileName && (
                                <span className="text-[11px] font-mono text-[#52555a] bg-[#f5f5f2] border border-[#deddd6] px-2.5 py-0.5 rounded-md inline-flex items-center gap-1.5">
                                  📄 <strong className="font-semibold text-[#303236]">{p.fileAttachment.fileName}</strong>
                                  {p.fileAttachment.fileSize && (
                                    <span className="text-[#8c8b84]">({p.fileAttachment.fileSize})</span>
                                  )}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Action Buttons Row */}
                        <div className="flex flex-wrap items-center gap-2.5 pt-3 border-t border-[#ebe9e1]">
                          {/* 1. Unduh Berkas Button with crisp white text & standard orange */}
                          <button
                            type="button"
                            onClick={() => onDownloadAsset(p)}
                            className="button button-orange inline-flex items-center gap-2 h-10 px-5 rounded-full !text-white !bg-[#e65416] hover:!bg-[#cf4a12] text-xs font-semibold shadow-sm transition active:scale-95"
                          >
                            <span>⬇️ Unduh Berkas Digital</span>
                          </button>

                          {/* 2. Link Cloud Template */}
                          {p.accessUrl && (
                            <a
                              href={p.accessUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              onClick={() => playSound('click')}
                              className="button button-outline inline-flex items-center gap-1.5 h-10 px-4 rounded-full border border-[#deddd6] bg-white text-[#303236] text-xs font-semibold hover:border-[#303236] transition active:scale-95"
                            >
                              <span>🔗 Buka di Cloud (Drive / Figma)</span>
                              <span aria-hidden="true">↗</span>
                            </a>
                          )}

                          {/* 3. Link ke Halaman Detail */}
                          <button
                            type="button"
                            onClick={() => { playSound('click'); navigate(`/produk/${p.id}`) }}
                            className="button button-secondary inline-flex items-center h-10 px-4 rounded-full border border-[#deddd6] bg-[#f5f5f2] text-[#303236] text-xs font-semibold hover:border-[#303236] transition sm:ml-auto"
                          >
                            Detail Produk →
                          </button>
                        </div>

                        {/* 4. Buyer Note */}
                        {p.buyerNote && (
                          <div className="mt-3.5 p-3.5 bg-amber-50/80 border border-amber-200 rounded-xl text-xs text-amber-900 flex items-start gap-2.5">
                            <span className="text-base flex-shrink-0">💡</span>
                            <div>
                              <strong className="block font-semibold mb-0.5">Catatan &amp; Password dari Kreator:</strong>
                              <p className="text-amber-800 leading-relaxed">{p.buyerNote}</p>
                            </div>
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
