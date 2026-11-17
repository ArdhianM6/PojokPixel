import { team } from '../data/marketplace'
import { usePageMeta } from '../hooks/usePageMeta'

interface AboutPageProps {
  playSound: (type: 'click' | 'pop' | 'success' | 'delete') => void
  navigate: (path: string) => void
}

export function AboutPage({ playSound, navigate }: AboutPageProps) {
  usePageMeta('Tentang Pojok Pixel & Tim Kami', 'Mengenal visi, kurasi, dan tim di balik marketplace produk digital Pojok Pixel: Ardhian, Aulia, dan Khoirunnisa.')

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
            <span className="text-[#303236] font-semibold" aria-current="page">Tentang &amp; Tim</span>
          </nav>
          <div>
            <span className="inline-flex items-center gap-2 font-mono text-[11px] tracking-widest text-[#6d6e68] mb-3">
              <span className="w-2 h-2 bg-[#e65416] rounded-sm" />
              TENTANG PLATFORM &amp; KURATOR
            </span>
            <h1 className="font-[family-name:var(--font-display)] text-3xl md:text-4xl font-bold text-[#303236] tracking-tight mb-2">
              Mengenal Pojok Pixel &amp; Tim
            </h1>
            <p className="text-sm text-[#555650] leading-relaxed max-w-xl">
              Platform marketplace penyedia produk digital terkurasi untuk mempercepat ide desainer, kreator, dan pelaku usaha Indonesia.
            </p>
          </div>
        </div>
      </section>

      {/* Manifesto Section */}
      <section className="py-16 border-b border-[#deddd6] bg-white" id="tentang">
        <div className="w-full max-w-[1220px] mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
            <div>
              <span className="inline-flex items-center gap-2 font-mono text-[11px] tracking-widest text-[#6d6e68] mb-3">
                <span className="w-2 h-2 bg-[#e65416] rounded-sm" />
                MANIFESTO KREATIF
              </span>
              <h2 className="font-[family-name:var(--font-display)] text-3xl sm:text-4xl font-bold text-[#303236] tracking-tight leading-tight">
                Karya digital berkualitas,<br />
                akses instan <span className="text-[#e65416]">selamanya.</span>
              </h2>
            </div>
            <div className="flex flex-col gap-4 text-sm text-[#555650] leading-relaxed">
              <p>
                Kami percaya memulai sebuah karya digital tidak harus selalu dari kanvas kosong yang melelahkan. Pojok Pixel hadir sebagai jembatan yang menghubungkan kurasi estetika dengan kepraktisan produksi digital.
              </p>
              <p>
                Setiap <strong className="text-[#303236]">Template Website</strong>, <strong className="text-[#303236]">Poster Digital</strong>, dan modul <strong className="text-[#303236]">Pembelajaran Digital</strong> di Pojok Pixel dirancang dengan standar hierarki visual ketat, auto-layout rapi, dan lisensi komersial bebas agar langsung dapat menghasilkan nilai nyata bagi penggunanya.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Craft Pillars */}
      <section className="py-14 bg-[#f5f5f2] border-b border-[#deddd6]" aria-label="Jaminan Kualitas Marketplace">
        <div className="w-full max-w-[1220px] mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white border border-[#deddd6] rounded-2xl p-6 shadow-sm">
              <div className="font-mono text-2xl font-bold text-[#e65416] mb-3">01</div>
              <h4 className="font-[family-name:var(--font-display)] font-bold text-[#303236] text-lg mb-2">Rapi Standar Industri</h4>
              <p className="text-xs text-[#555650] leading-relaxed">Auto-Layout terstruktur di Figma, kode HTML/Tailwind bersih dan ringan, serta layer Canva/PSD terkelola profesional.</p>
            </div>
            <div className="bg-white border border-[#deddd6] rounded-2xl p-6 shadow-sm">
              <div className="font-mono text-2xl font-bold text-[#e65416] mb-3">02</div>
              <h4 className="font-[family-name:var(--font-display)] font-bold text-[#303236] text-lg mb-2">100% Responsif &amp; Siap Cetak</h4>
              <p className="text-xs text-[#555650] leading-relaxed">Semua aset website diuji lintas perangkat layar, dan seluruh poster dirancang dalam standar resolusi tinggi 300 DPI.</p>
            </div>
            <div className="bg-white border border-[#deddd6] rounded-2xl p-6 shadow-sm">
              <div className="font-mono text-2xl font-bold text-[#e65416] mb-3">03</div>
              <h4 className="font-[family-name:var(--font-display)] font-bold text-[#303236] text-lg mb-2">Kurasi Human-First</h4>
              <p className="text-xs text-[#555650] leading-relaxed">Bukan hasil generator acak. Setiap karya ditinjau langsung oleh tim kurator internal kami untuk menjamin estetika otentik.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-16" id="tim">
        <div className="w-full max-w-[1220px] mx-auto px-6">
          <div className="text-center max-w-xl mx-auto mb-12">
            <span className="inline-flex items-center gap-2 font-mono text-[11px] tracking-widest text-[#6d6e68] mb-2">
              <span className="w-2 h-2 bg-[#e65416] rounded-sm" />
              TIM POJOK PIXEL
            </span>
            <h2 className="font-[family-name:var(--font-display)] text-3xl font-bold text-[#303236] tracking-tight mb-2">
              Tim Pengembang &amp; Kurator
            </h2>
            <p className="text-sm text-[#555650] leading-relaxed">
              Tiga orang dengan dedikasi tinggi menggabungkan keahlian desain antarmuka, rekayasa frontend, dan kurasi konten kreatif.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 lg:gap-6">
            {team.map((member) => (
              <article className="team-profile-card" key={member.name}>
                <div className="team-profile-heading">
                  <div className="team-profile-avatar-wrap">
                    <img className="team-profile-avatar" src={member.photo} alt={'Foto ' + member.name} loading="lazy" />
                    <span className="about-team-badge">{member.badge}</span>
                  </div>
                  <div className="team-profile-name">
                    <h3 className="font-[family-name:var(--font-display)] font-bold text-[#303236] text-base leading-tight">{member.name}</h3>
                    <span className="team-profile-role">{member.role}</span>
                  </div>
                </div>
                <p className="team-profile-desc">{member.desc}</p>
                <div className="team-profile-skills">
                  {member.skills.map((s) => (
                    <span className="team-profile-skill" key={s}>
                      {s}
                    </span>
                  ))}
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Business Profile & Official Channels (Synced with 2026 Proposal) */}
      <section className="pb-16" id="legalitas">
        <div className="w-full max-w-[1220px] mx-auto px-6">
          <div className="bg-white border border-[#deddd6] rounded-2xl p-8 md:p-10 shadow-sm">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-1 border-b lg:border-b-0 lg:border-r border-[#deddd6] pb-6 lg:pb-0 lg:pr-8">
                <span className="inline-flex items-center gap-2 font-mono text-[10.5px] tracking-widest text-[#e65416] font-bold mb-2 uppercase">
                  <span className="w-2 h-2 rounded-full bg-[#e65416]" />
                  PROFIL PERUSAHAAN
                </span>
                <h3 className="font-[family-name:var(--font-display)] text-2xl font-bold text-[#303236] mb-2">
                  POJOK PIXEL COMPANY
                </h3>
                <p className="text-xs text-[#555650] leading-relaxed mb-6">
                  Platform marketplace produk digital yang membantu pelajar, kreator, UMKM, dan pemilik usaha memperoleh template website, poster, dan materi pembelajaran desain siap pakai.
                </p>
                <div className="flex flex-col gap-2.5 font-mono text-xs">
                  <div className="flex items-center gap-2 text-[#303236]">
                    <span className="text-[#e65416]">📧</span>
                    <a href="mailto:teampojokpixel@gmail.com" className="hover:text-[#e65416] transition-colors">teampojokpixel@gmail.com</a>
                  </div>
                  <div className="flex items-center gap-2 text-[#303236]">
                    <span className="text-[#e65416]">💬</span>
                    <a href="https://wa.me/6285709328807" target="_blank" rel="noopener noreferrer" className="hover:text-[#e65416] transition-colors">0857-0932-8807 (WhatsApp)</a>
                  </div>
                  <div className="flex items-center gap-2 text-[#303236]">
                    <span className="text-[#e65416]">🌐</span>
                    <a href="https://www.pojokpixel.com" target="_blank" rel="noopener noreferrer" className="hover:text-[#e65416] transition-colors">www.pojokpixel.com</a>
                  </div>
                </div>
              </div>

              <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="p-5 rounded-xl bg-[#f5f5f2] border border-[#deddd6]">
                  <span className="font-mono text-[10px] font-bold text-[#72736c] uppercase tracking-wider block mb-1">
                    ARSITEKTUR TEKNOLOGI
                  </span>
                  <strong className="block text-base font-[family-name:var(--font-display)] text-[#303236] mb-2">
                    Modern Fullstack MVP
                  </strong>
                  <p className="text-xs text-[#555650] leading-relaxed">
                    Dibangun dengan fondasi React 19 untuk antarmuka interaktif, API Hono ringan &amp; cepat, Drizzle ORM untuk efisiensi akses data, dan basis data PostgreSQL berkinerja tinggi.
                  </p>
                </div>

                <div className="p-5 rounded-xl bg-[#f5f5f2] border border-[#deddd6]">
                  <span className="font-mono text-[10px] font-bold text-[#72736c] uppercase tracking-wider block mb-1">
                    SKEMA BAGI HASIL
                  </span>
                  <strong className="block text-base font-[family-name:var(--font-display)] text-[#e65416] mb-2">
                    80% Hak Kreator · 20% Platform
                  </strong>
                  <p className="text-xs text-[#555650] leading-relaxed">
                    Sebagian besar pendapatan (80%) diserahkan langsung kepada kreator, sementara 20% komisi platform dialokasikan untuk biaya payment gateway, operasional VPS, dan pemeliharaan sistem.
                  </p>
                </div>

                <div className="p-5 rounded-xl bg-[#f5f5f2] border border-[#deddd6]">
                  <span className="font-mono text-[10px] font-bold text-[#72736c] uppercase tracking-wider block mb-1">
                    TARGET OPERASIONAL 2026
                  </span>
                  <strong className="block text-base font-[family-name:var(--font-display)] text-[#303236] mb-2">
                    300+ Transaksi Berbayar
                  </strong>
                  <p className="text-xs text-[#555650] leading-relaxed">
                    Skenario dasar 10 bulan operasional dengan target GMV Rp15.000.000 didukung katalog gratis sebagai pintu masuk akuisisi pengguna dan validasi pasar nyata.
                  </p>
                </div>

                <div className="p-5 rounded-xl bg-[#f5f5f2] border border-[#deddd6]">
                  <span className="font-mono text-[10px] font-bold text-[#72736c] uppercase tracking-wider block mb-1">
                    SEGMENTASI PENGGUNA
                  </span>
                  <strong className="block text-base font-[family-name:var(--font-display)] text-[#303236] mb-2">
                    Pelajar, Kreator, &amp; UMKM
                  </strong>
                  <p className="text-xs text-[#555650] leading-relaxed">
                    Dirancang untuk mahasiswa dan pelajar untuk tugas/presentasi, UMKM untuk materi promosi, serta freelancer dan kreator untuk mempercepat alur kerja produksi digital.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Creator Invitation Banner */}
      <div className="w-full max-w-[1220px] mx-auto px-6 mb-16">
        <div className="p-8 md:p-10 rounded-2xl bg-[#303236] text-[#f5f5f2] flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 shadow-xl">
          <div className="max-w-2xl">
            <span className="inline-flex items-center gap-2 font-mono text-[11px] tracking-widest text-[#e65416] mb-2 uppercase">
              <span className="w-2 h-2 bg-[#e65416] rounded-sm" />
              BUKA TOKO DI POJOK PIXEL
            </span>
            <h3 className="font-[family-name:var(--font-display)] text-2xl md:text-3xl font-bold text-white mb-2 leading-tight">
              Punya Karya Digital Bagus?<br />Mulai Jual Karyamu di Sini.
            </h3>
            <p className="text-sm text-[#d8d6c9] leading-relaxed">
              Dapatkan skema bagi hasil transparan 80% dan jangkau ribuan mahasiswa, desainer, developer, serta pelaku UMKM lokal yang mencari aset digital berkualitas setiap hari.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 flex-shrink-0">
            <button
              type="button"
              className="inline-flex items-center justify-center h-11 px-6 rounded-full bg-[#e65416] text-white text-xs font-semibold hover:bg-[#cf4a12] transition"
              onClick={() => {
                playSound('pop')
                navigate('/kreator')
              }}
            >
              <span>Daftar Jadi Kreator</span>
            </button>
            <button
              type="button"
              className="inline-flex items-center justify-center h-11 px-6 rounded-full border border-white/20 bg-white/10 text-white text-xs font-semibold hover:bg-white/20 transition"
              onClick={() => {
                playSound('click')
                navigate('/faq')
              }}
            >
              <span>Pelajari Syarat &amp; Ketentuan</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
