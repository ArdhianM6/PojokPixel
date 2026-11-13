import { useMemo, useState } from 'react'
import type { CSSProperties, ReactNode } from 'react'
import AuthPages from './AuthPages'
import { authClient } from './lib/auth-client'
import { useEffect, useRef } from 'react'

type IconName = 'search' | 'bag' | 'arrow' | 'spark' | 'heart' | 'menu' | 'close' | 'download' | 'grid' | 'book' | 'palette'
function Icon({ name, size = 20 }: { name: IconName; size?: number }) {
  const paths: Record<IconName, ReactNode> = {
    search: <><circle cx="11" cy="11" r="7"/><path d="m20 20-4-4"/></>, bag: <><path d="M5 8h14l1 13H4L5 8Z"/><path d="M9 9V6a3 3 0 0 1 6 0v3"/></>,
    arrow: <><path d="M5 12h14"/><path d="m13 6 6 6-6 6"/></>, spark: <><path d="m12 3 1.9 5.8L20 11l-6.1 2.2L12 19l-2-5.8L4 11l6-2.2L12 3Z"/><path d="m19 14 1.2 2.8L23 18l-2.8 1.2L19 22l-1.2-2.8L15 18l2.8-1.2L19 14Z"/></>,
    heart: <path d="M20.8 8.8c0 4.5-8.8 10-8.8 10s-8.8-5.5-8.8-10a4.5 4.5 0 0 1 8.8-1.1 4.5 4.5 0 0 1 8.8 1.1Z"/>,
    menu: <><path d="M4 7h16M4 12h16M4 17h16"/></>, close: <><path d="m6 6 12 12M18 6 6 18"/></>, download: <><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><path d="m7 10 5 5 5-5M12 15V3"/></>,
    grid: <><rect x="3" y="3" width="8" height="8" rx="1"/><rect x="13" y="3" width="8" height="8" rx="1"/><rect x="3" y="13" width="8" height="8" rx="1"/><rect x="13" y="13" width="8" height="8" rx="1"/></>, book: <><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2Z"/></>,
    palette: <><circle cx="13.5" cy="6.5" r=".5"/><circle cx="17.5" cy="10.5" r=".5"/><circle cx="8.5" cy="7.5" r=".5"/><circle cx="6.5" cy="12.5" r=".5"/><path d="M12 22a10 10 0 1 1 10-10c0 1.7-1.3 3-3 3h-1.8c-.8 0-1.2.9-.7 1.5.3.4.5.9.5 1.5 0 1.1-.9 2-2 2H12Z"/></>,
  }
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{paths[name]}</svg>
}

function PixelLogo({ small = false }: { small?: boolean }) {
  return <img className={small ? 'pixel-logo pixel-logo-small' : 'pixel-logo'} src="/pojokpixel-mark.svg" alt="Logo PojokPixel" />
}

const products = [
  { id: 'folio', name: 'Folio - Portfolio Kit', category: 'Template Website', price: 0, label: 'Gratis', bg: 'folio', img: 'photo-1460925895917-afdab827c52f', tag: 'Pilihan minggu ini' },
  { id: 'sundae', name: 'Sunday Sundae Social Pack', category: 'Template Poster', price: 39000, label: 'Terlaris', bg: 'sundae', img: 'photo-1490481651871-ab68de25d43d', tag: '12 template' },
  { id: 'study', name: 'Belajar Design dari Nol', category: 'Pembelajaran', price: 59000, label: 'Baru', bg: 'study', img: 'photo-1455390582262-044cdead277a', tag: 'Video + workbook' },
  { id: 'nara', name: 'Nara - Landing Page', category: 'Template Website', price: 79000, label: '', bg: 'nara', img: 'photo-1498050108023-c5249f4df085', tag: 'Figma + HTML' },
  { id: 'flora', name: 'Flora Market Poster Set', category: 'Template Poster', price: 29000, label: 'Hemat', bg: 'flora', img: 'photo-1490750967868-88aa4486c946', tag: '8 desain' },
  { id: 'class', name: 'Mini Class: Canva Rapi', category: 'Pembelajaran', price: 0, label: 'Gratis', bg: 'class', img: 'photo-1516321318423-f06f85e504b3', tag: '25 menit' },
]
const categories = ['Semua', 'Template Website', 'Template Poster', 'Pembelajaran']
const members = ['Ardhian Maulana Tanjung', 'Aulia Ryansifa Wardah', 'Khoirunnisa Salsabila Osmon', 'Dhioza Agusta Vermana']
const rupiah = (price: number) => price === 0 ? 'Gratis' : `Rp${price.toLocaleString('id-ID')}`

export default function App() {
  const authRoutes = ['/login', '/register', '/register/success', '/auth/continue', '/onboarding', '/dashboard', '/profile']
  return authRoutes.includes(window.location.pathname) ? <AuthPages/> : <Storefront/>
}

function Storefront() {
  const [category, setCategory] = useState('Semua')
  const [query, setQuery] = useState('')
  const [searchOpen, setSearchOpen] = useState(false)
  const [cart, setCart] = useState(0)
  const [favorites, setFavorites] = useState<string[]>([])
  const [toast, setToast] = useState('')
  const [authNotice, setAuthNotice] = useState<{ title: string; message: string } | null>(null)
  const [profileMenuOpen, setProfileMenuOpen] = useState(false)
  const profileMenu = useRef<HTMLDivElement>(null)
  const { data: session, isPending } = authClient.useSession()
  const filtered = useMemo(() => products.filter((p) => (category === 'Semua' || p.category === category) && p.name.toLowerCase().includes(query.toLowerCase())), [category, query])
  const notify = (message: string) => { setToast(message); window.setTimeout(() => setToast(''), 4200) }
  const addCart = (name: string) => { setCart((n) => n + 1); notify(`${name} masuk ke keranjang`) }
  const toggleFavorite = (id: string) => setFavorites((current) => current.includes(id) ? current.filter((x) => x !== id) : [...current, id])
  useEffect(() => {
    const notice = localStorage.getItem('pojokpixel:auth-notice')
    if (!notice) return
    localStorage.removeItem('pojokpixel:auth-notice')
    try {
      const { kind, name } = JSON.parse(notice) as { kind: 'created' | 'welcome'; name?: string }
      setAuthNotice({
        title: kind === 'created' ? 'Akun berhasil dibuat' : 'Welcome kembali',
        message: kind === 'created' ? `Welcome, ${name || 'kreator'}! Kamu sudah masuk ke PojokPixel.` : `Welcome, ${name || 'kreator'}! Senang melihatmu lagi.`,
      })
      window.setTimeout(() => setAuthNotice(null), 5200)
    } catch { /* Abaikan notifikasi lama dengan format tidak dikenal. */ }
  }, [])
  useEffect(() => {
    if (!profileMenuOpen) return
    const closeOnOutsideClick = (event: PointerEvent) => { if (!profileMenu.current?.contains(event.target as Node)) setProfileMenuOpen(false) }
    const closeOnEscape = (event: KeyboardEvent) => { if (event.key === 'Escape') setProfileMenuOpen(false) }
    document.addEventListener('pointerdown', closeOnOutsideClick)
    document.addEventListener('keydown', closeOnEscape)
    return () => { document.removeEventListener('pointerdown', closeOnOutsideClick); document.removeEventListener('keydown', closeOnEscape) }
  }, [profileMenuOpen])

  return <>
    <div className="announcement"><span><Icon name="spark" size={14}/> Sudut kecil untuk ide-ide besar</span><span className="announcement-right">Karya lokal, akses selamanya <span className="announcement-dot"/></span></div>
    <header className="site-header">
      <a className="brand" href="#home" aria-label="PojokPixel beranda"><PixelLogo/><span className="brand-name">pojok<span>pixel</span><i>.</i></span></a>
      <nav className="main-nav" aria-label="Navigasi utama"><a className="active" href="#koleksi">Jelajahi</a><a href="#tentang">Tentang</a><a href="#tim">Tim kami</a></nav>
      <div className="header-actions">
        {searchOpen && <input className="search-input" autoFocus placeholder="Cari produk-" value={query} onChange={(e) => { setQuery(e.target.value); document.querySelector('#koleksi')?.scrollIntoView({ behavior: 'smooth' }) }} aria-label="Cari produk"/>}
        <button className="icon-button rounded-full transition duration-200 hover:bg-pixel-beige/60 hover:text-pixel-orange" aria-label="Cari produk" onClick={() => setSearchOpen((v) => !v)}><Icon name="search"/></button>
        {!isPending && (session?.user ? <div className="profile-menu-wrap" ref={profileMenu}>
          <button className="header-profile" type="button" aria-label="Buka menu profil" aria-expanded={profileMenuOpen} onClick={() => setProfileMenuOpen((open) => !open)}>
            <span className="header-profile-avatar">{session.user.image ? <img src={session.user.image} alt=""/> : (session.user.name?.slice(0, 1).toUpperCase() || 'P')}</span>
            <span className="header-profile-name">{session.user.name || 'Akun saya'}</span><span className="profile-chevron" aria-hidden="true">⌄</span>
          </button>
          {profileMenuOpen && <div className="profile-dropdown" role="menu">
            <div className="profile-dropdown-heading"><strong>{session.user.name || 'Kreator PojokPixel'}</strong><span>{session.user.email}</span></div>
            <a href="/profile" role="menuitem" onClick={() => setProfileMenuOpen(false)}>Pengaturan profil</a>
            <button type="button" role="menuitem" onClick={async () => { await authClient.signOut(); window.location.assign('/login') }}>Keluar dari akun</button>
          </div>}
        </div> : <a className="header-login rounded-full transition duration-200 hover:bg-pixel-orange hover:text-white" href="/login">Masuk</a>)}
        <button className="cart-button rounded-full px-3 py-2 transition duration-200 hover:bg-pixel-beige/60" onClick={() => notify(cart ? `${cart} produk di keranjang` : 'Keranjangmu masih kosong')}><Icon name="bag"/><span>Keranjang</span><b>{cart}</b></button>
      </div>
    </header>
    <main>
      <section className="hero" id="home">
        <div className="hero-copy motion-safe:animate-panel-in"><div className="hero-kicker"><span className="kicker-square"/> Marketplace kreatif buatan lokal</div>
          <h1>Ide bagus<br/>pantas <span>jadi nyata.</span></h1>
          <p>Template siap pakai dan ilmu praktis untuk membantumu membuat sesuatu yang hebat - tanpa mulai dari halaman kosong.</p>
          <div className="hero-actions"><a href="#koleksi" className="button button-dark rounded-lg transition duration-200 hover:-translate-y-0.5 hover:shadow-lg active:translate-y-0">Lihat semua karya <Icon name="arrow" size={17}/></a><a className="text-link" href="#tentang">Kenalan dengan PojokPixel</a></div>
          <div className="hero-proof"><div className="avatar-stack"><span>A</span><span>B</span><span>C</span></div><span>Dibuat oleh tim <strong>404 Not Found</strong></span><span className="proof-line"/><span>Jakarta, Indonesia</span></div>
        </div>
        <div className="hero-art motion-safe:animate-panel-in motion-safe:[animation-delay:120ms]" aria-label="Pratinjau karya digital PojokPixel">
          <div className="art-spark spark-one">*</div><div className="art-spark spark-two">*</div>
          <div className="art-orange-card motion-safe:animate-creative-card"><div className="art-card-top"><span>DESIGN KIT / 2025</span><span>01 - 06</span></div><div className="orange-orbit"><div className="orbit-dot"/><div className="orbit-ring"/><div className="orbit-core"><PixelLogo small/></div></div><div className="art-card-bottom"><strong>Good things<br/>take shape.</strong><span>pojokpixel.studio</span></div></div>
          <div className="art-note"><div className="note-mini-logo"><PixelLogo small/></div><div><b>Little corner,<br/>big ideas.</b><small>Template website<br/>oleh PojokPixel</small></div><span className="note-arrow"><Icon name="arrow" size={17}/></span></div>
          <div className="art-float"><span>01</span><span>YOUR NEXT<br/>GOOD IDEA</span><span className="float-cross">+</span></div>
          <div className="hero-vertical">CREATIVE GOODS - MADE WITH CARE</div>
        </div>
      </section>
      <div className="ticker" aria-label="Kategori produk"><div className="ticker-track">{['TEMPLATE WEBSITE','POSTER DIGITAL','BELAJAR DESAIN','KARYA LOKAL','IDE TANPA BATAS','TEMPLATE WEBSITE','POSTER DIGITAL','BELAJAR DESAIN','KARYA LOKAL','IDE TANPA BATAS'].map((text, i) => <span key={i}>{text}<i>*</i></span>)}</div></div>
      <section className="collection section-wrap" id="koleksi">
        <div className="section-heading"><div><div className="eyebrow"><span/> PILIHAN BUAT KAMU</div><h2>Karya untuk<br className="mobile-break"/> mulai berkarya.</h2><p>File digital pilihan, dibuat dengan teliti dan siap menemani proyekmu berikutnya.</p></div><a href="#koleksi" className="collection-link" onClick={() => {setCategory('Semua');setQuery('')}}>Semua produk <Icon name="arrow" size={17}/></a></div>
        <div className="filter-bar"><div className="category-tabs" role="tablist" aria-label="Filter kategori">{categories.map((c) => <button role="tab" aria-selected={category === c} className={category === c ? 'selected' : ''} onClick={() => setCategory(c)} key={c}>{c}</button>)}</div><div className="product-count"><Icon name="grid" size={15}/>{filtered.length} karya</div></div>
        <div className="product-grid">{filtered.map((p, i) => <article className={`product-card product-${p.bg} transition duration-300 hover:-translate-y-1 hover:shadow-xl motion-reduce:transition-none`} key={p.id}>
          <div className={`product-image ${p.bg}`} style={{ '--photo': `url(https://images.unsplash.com/${p.img}?auto=format&fit=crop&w=900&q=80)` } as unknown as CSSProperties}><div className="product-image-shade"/><div className="image-index">PP-0{i + 1}</div><div className="mockup-content"><span className="mockup-kicker">{p.category}</span><b>{p.id === 'folio' ? <>YOUR WORK,<br/>IN GOOD<br/><i>company.</i></> : p.id === 'sundae' ? <>slow days<br/><i>feel good</i></> : p.id === 'study' ? <>Make room<br/>for <i>ideas.</i></> : p.id === 'nara' ? <>Less noise.<br/><i>More you.</i></> : p.id === 'flora' ? <>A little<br/><i>in bloom.</i></> : <>Design it<br/><i>your way.</i></>}</b><span className="mockup-footer">POJOKPIXEL STUDIO <span>+</span></span></div><span className={`product-label ${p.label === 'Gratis' ? 'free' : ''}`}>{p.label || 'Digital product'}</span><button className={`favorite-button ${favorites.includes(p.id) ? 'is-favorite' : ''}`} onClick={() => toggleFavorite(p.id)} aria-label="Simpan ke favorit" aria-pressed={favorites.includes(p.id)}><Icon name="heart" size={18}/></button><div className="image-serial">{p.tag}</div></div>
          <div className="product-info"><div><span className="product-category">{p.category}</span><h3>{p.name}</h3><span className="product-format"><Icon name={p.category === 'Pembelajaran' ? 'book' : p.category === 'Template Poster' ? 'palette' : 'grid'} size={13}/>{p.id === 'study' ? 'Kelas online - Akses selamanya' : p.id === 'class' ? 'Kelas mini - Gratis' : p.id === 'sundae' || p.id === 'flora' ? 'Canva / 8-12 template' : 'Figma - File siap edit'}</span></div><div className="product-purchase"><strong>{rupiah(p.price)}</strong><button aria-label={`Tambah ${p.name} ke keranjang`} onClick={() => addCart(p.name)}><Icon name="arrow" size={16}/></button></div></div>
        </article>)}</div>
        {filtered.length === 0 && <div className="empty-state">Belum ada karya untuk pencarian ini. Coba kata lain, ya.</div>}
      </section>
      <section className="manifesto" id="tentang"><div className="manifesto-mark"><PixelLogo/><span>DESIGN - DIGITAL - PIXEL</span></div><div className="manifesto-copy"><div className="eyebrow light"><span/> SEDIKIT TENTANG KAMI</div><h2>Dibuat dengan rasa,<br/>dirapikan dengan <em>piksel.</em></h2><p>PojokPixel adalah ruang kecil untuk karya digital yang bikin ide terasa lebih dekat. Dari template pertama sampai skill baru - semuanya dirancang supaya kamu bisa mulai sekarang.</p><a className="manifesto-link" href="#tim">Cerita di balik PojokPixel <Icon name="arrow" size={16}/></a></div><div className="manifesto-stamp">EST.<br/><b>2025</b><br/>INDONESIA</div><div className="manifesto-pixel">*</div></section>
      <section className="team-section section-wrap" id="tim"><div className="team-intro"><div className="eyebrow"><span/> DI BALIK POJOKPIXEL</div><h2>Empat kepala.<br/>Satu sudut kreatif.</h2><p>Kenalan dengan tim 404 Not Found yang ada di balik setiap pikselnya.</p></div><div className="team-list">{members.map((member,i) => <div className="team-member" key={member}><div className={`member-avatar member-${i}`}><PixelLogo small/></div><span className="member-number">0{i + 1}</span><strong>{member}</strong><span className="member-role">Tim 404 Not Found</span><Icon name="arrow" size={18}/></div>)}</div></section>
      <section className="newsletter"><div className="newsletter-star">*</div><div><div className="eyebrow light"><span/> SATU EMAIL KECIL</div><h2>Ide baru, langsung<br/>ke inbox kamu.</h2><p>Kabar tentang karya baru dan bonus kecil. Tidak ramai, janji.</p></div><form className="newsletter-form" onSubmit={(e) => { e.preventDefault(); notify('Terima kasih! Kamu masuk daftar kabar PojokPixel.'); (e.currentTarget.elements.namedItem('email') as HTMLInputElement).value = '' }}><label htmlFor="email">Alamat email</label><div><input id="email" name="email" type="email" placeholder="nama@email.com" required/><button aria-label="Daftar newsletter"><Icon name="arrow"/></button></div><small>Dengan mendaftar, kamu setuju menerima kabar dari kami.</small></form></section>
    </main>
    <footer className="footer"><div className="footer-main"><a className="brand footer-brand" href="#home"><PixelLogo/><span className="brand-name">pojok<span>pixel</span><i>.</i></span></a><span className="footer-tagline">Sudut kecil untuk ide besar.</span><div className="footer-links"><a href="#koleksi">Jelajahi</a><a href="#tentang">Tentang kami</a><a href="#tim">Tim kreatif</a><a href="mailto:halo@pojokpixel.id">Hubungi kami</a></div></div><div className="footer-bottom"><span>Copyright 2025 PojokPixel - Dibuat dengan <span className="heart-orange">&lt;3</span> di Indonesia</span><span>404 Not Found <i>*</i></span><a href="#home">Kembali ke atas ^</a></div></footer>
    {authNotice ? <div className="auth-welcome-popup" role="status" aria-live="polite"><span className="welcome-popup-mark">✓</span><span className="welcome-popup-copy"><strong>{authNotice.title}</strong><span>{authNotice.message}</span></span><button type="button" aria-label="Tutup notifikasi" onClick={() => setAuthNotice(null)}>×</button></div> : toast && <div className="toast fixed bottom-5 left-1/2 z-50 flex w-[min(430px,calc(100vw-2rem))] -translate-x-1/2 items-center gap-3 rounded-xl border border-white/10 bg-pixel-ink px-5 py-4 text-sm text-pixel-paper shadow-2xl shadow-pixel-ink/25" role="status" aria-live="polite"><span className="grid size-7 shrink-0 place-items-center rounded-full border border-orange-300/50 text-pixel-orange">+</span>{toast}</div>}
  </>
}
