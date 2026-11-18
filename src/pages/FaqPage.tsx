import { useState } from 'react'
import { faqs } from '../data/marketplace'
import { usePageMeta } from '../hooks/usePageMeta'

interface FaqPageProps {
  playSound: (type: 'click' | 'pop' | 'success' | 'delete') => void
  navigate: (path: string) => void
}

export function FaqPage({ playSound, navigate }: FaqPageProps) {
  usePageMeta('Tanya Jawab & Bantuan — FAQ', 'Temukan jawaban seputar detail produk, lisensi, format file, dan cara mendapat bantuan di PojokPixel.')

  const [openFaq, setOpenFaq] = useState<number | null>(0)

  return (
    <div className="min-h-screen bg-[#f5f5f2]">
      {/* Header Banner */}
      <section className="bg-[#f5f5f2] border-b border-[#deddd6] py-8">
        <div className="w-full max-w-[1220px] mx-auto px-6">
          <nav className="flex items-center gap-2 text-xs font-mono text-[#72736c] mb-4" aria-label="Breadcrumb">
            <a href="/" onClick={(e) => { e.preventDefault(); navigate('/') }} className="hover:text-[#e65416] transition-colors">
              Beranda
            </a>
            <span aria-hidden="true" className="text-[#b7b6ae]">›</span>
            <span className="text-[#303236] font-semibold" aria-current="page">Bantuan &amp; FAQ</span>
          </nav>
          <div>
            <span className="inline-flex items-center gap-2 font-mono text-[11px] tracking-widest text-[#6d6e68] mb-3">
              <span className="w-2 h-2 bg-[#e65416] rounded-sm" />
              PUSAT INFORMASI &amp; BANTUAN
            </span>
            <h1 className="font-[family-name:var(--font-display)] text-3xl md:text-4xl font-bold text-[#303236] tracking-tight mb-2">
              Pertanyaan yang Sering Diajukan
            </h1>
            <p className="text-sm text-[#555650] leading-relaxed max-w-xl">
              Segala hal yang perlu kamu ketahui tentang alur transaksi, unduhan instan, lisensi komersial, dan dukungan file di Pojok Pixel.
            </p>
          </div>
        </div>
      </section>

      {/* Main FAQ Accordion */}
      <section className="py-12" id="faq">
        <div className="w-full max-w-[1220px] mx-auto px-6">
          <div className="max-w-3xl mx-auto flex flex-col gap-3">
            {faqs.map((f, i) => (
              <div
                className="bg-white border border-[#deddd6] rounded-xl overflow-hidden transition-all shadow-sm"
                key={f.q}
              >
                <button
                  type="button"
                  className="w-full px-5 py-4 text-left flex items-center justify-between gap-4 font-[family-name:var(--font-display)] font-bold text-[#303236] hover:text-[#e65416] transition-colors"
                  onClick={() => {
                    playSound('click')
                    setOpenFaq(openFaq === i ? null : i)
                  }}
                  aria-expanded={openFaq === i}
                >
                  <span className="text-sm md:text-base">{f.q}</span>
                  <svg
                    className={`w-5 h-5 flex-shrink-0 text-[#72736c] transition-transform duration-200 ${openFaq === i ? 'rotate-180 text-[#e65416]' : ''}`}
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                  >
                    <polyline points="6 9 12 15 18 9" />
                  </svg>
                </button>
                {openFaq === i && (
                  <div className="px-5 pb-5 pt-1 text-xs md:text-sm text-[#555650] leading-relaxed border-t border-[#f5f5f2]">
                    <p>{f.a}</p>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Need More Help Box */}
          <div className="max-w-3xl mx-auto mt-12 p-8 rounded-2xl border border-[#deddd6] bg-[#d8d6c9]/30 text-center">
            <h3 className="font-[family-name:var(--font-display)] text-xl font-bold text-[#303236] mb-2">
              Masih punya pertanyaan lain?
            </h3>
            <p className="text-sm text-[#52555a] max-w-md mx-auto mb-6 leading-relaxed">
              Tim Pojok Pixel siap membantumu. Hubungi kami melalui kanal bantuan resmi atau email dukungan kreator.
            </p>
            <div className="flex gap-3 justify-center flex-wrap">
              <a
                href="mailto:teampojokpixel@gmail.com"
                className="button button-dark inline-flex items-center gap-2 h-10 px-6 rounded-full text-xs font-semibold shadow-sm transition active:scale-95"
              >
                <span>📧 teampojokpixel@gmail.com</span>
              </a>
              <a
                href="https://wa.me/6285709328807"
                target="_blank"
                rel="noopener noreferrer"
                className="button button-orange inline-flex items-center gap-2 h-10 px-6 rounded-full !text-white !bg-[#e65416] text-xs font-semibold shadow-sm transition active:scale-95"
              >
                <span>💬 WhatsApp: 0857-0932-8807</span>
              </a>
              <button
                type="button"
                className="button button-secondary inline-flex items-center h-10 px-5 rounded-full border border-[#deddd6] bg-white text-[#303236] text-xs font-semibold hover:border-[#303236] transition"
                onClick={() => {
                  playSound('click')
                  navigate('/katalog')
                }}
              >
                Kembali ke Katalog
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
