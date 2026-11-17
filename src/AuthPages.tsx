import { useEffect, useRef, useState } from 'react'
import type { ChangeEvent, FormEvent, ReactNode } from 'react'
import { authClient } from './lib/auth-client'
import './auth.css'
import './auth-toast.css'

declare global {
  interface Window {
    turnstile?: {
      render: (element: HTMLElement, options: { sitekey: string; callback: (token: string) => void; 'expired-callback'?: () => void; 'error-callback'?: () => void; theme?: 'light' | 'dark' }) => string
      remove: (widgetId: string) => void
    }
  }
}

const turnstileSiteKey = import.meta.env.VITE_TURNSTILE_SITE_KEY as string | undefined
const home = () => window.location.assign('/')
const continueTo = () => window.location.assign('/auth/continue?login=1')
const today = new Date().toISOString().slice(0, 10)

async function prepareProfileImage(file: File) {
  if (!file.type.startsWith('image/')) throw new Error('Pilih file gambar, seperti JPG, PNG, atau WebP.')
  if (file.size > 5 * 1024 * 1024) throw new Error('Ukuran foto maksimal 5 MB.')
  const bitmap = await createImageBitmap(file)
  const scale = Math.min(1, 512 / Math.max(bitmap.width, bitmap.height))
  const canvas = document.createElement('canvas')
  canvas.width = Math.round(bitmap.width * scale)
  canvas.height = Math.round(bitmap.height * scale)
  const context = canvas.getContext('2d')
  if (!context) throw new Error('Foto belum bisa diproses. Coba file lain.')
  context.drawImage(bitmap, 0, 0, canvas.width, canvas.height)
  bitmap.close()
  return canvas.toDataURL('image/webp', 0.8)
}

function ArrowRight() {
  return <span className="auth-arrow" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M5 12h14M13 6l6 6-6 6"/></svg></span>
}

function ArrowUpRight() {
  return <span className="auth-arrow" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M7 17 17 7M8 7h9v9"/></svg></span>
}

function Turnstile({ onToken, resetKey }: { onToken: (token: string) => void; resetKey: number }) {
  const element = useRef<HTMLDivElement>(null)
  useEffect(() => {
    if (!turnstileSiteKey || !element.current) return
    let widgetId: string | undefined
    let cancelled = false
    const render = () => {
      if (cancelled || !element.current || !window.turnstile) return
      widgetId = window.turnstile.render(element.current, {
        sitekey: turnstileSiteKey,
        theme: 'light',
        callback: onToken,
        'expired-callback': () => onToken(''),
        'error-callback': () => onToken(''),
      })
    }
    if (window.turnstile) render()
    else {
      let script = document.querySelector<HTMLScriptElement>('script[data-turnstile]')
      if (!script) {
        script = document.createElement('script')
        script.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit'
        script.async = true
        script.defer = true
        script.dataset.turnstile = 'true'
        document.head.appendChild(script)
      }
      script.addEventListener('load', render)
      return () => { cancelled = true; script?.removeEventListener('load', render); if (widgetId) window.turnstile?.remove(widgetId) }
    }
    return () => { cancelled = true; if (widgetId) window.turnstile?.remove(widgetId) }
  }, [onToken, resetKey])

  return <div className="captcha-wrap">
    {turnstileSiteKey ? <div ref={element} /> : <div className="captcha-unavailable">Verifikasi keamanan akan aktif setelah Turnstile dikonfigurasi.</div>}
  </div>
}

function Brand() {
  return <a className="auth-brand" href="/"><img src="/pojokpixel-mark.svg" alt=""/><span>pojok<span>pixel</span><i>.</i></span></a>
}

function AuthShell({ children, kind, modal = false, onClose }: { children: ReactNode; kind: 'login' | 'register' | 'message'; modal?: boolean; onClose?: () => void }) {
  return <div
    className={`auth-page auth-${kind} motion-safe:animate-panel-in${modal ? ' auth-modal-page' : ''}`}
    role={modal ? 'dialog' : undefined}
    aria-modal={modal ? true : undefined}
    aria-label={modal ? kind === 'register' ? 'Daftar akun PojokPixel' : 'Masuk ke akun PojokPixel' : undefined}
    onMouseDown={modal ? (event) => { if (event.target === event.currentTarget) onClose?.() } : undefined}
  >
    <aside className="auth-aside">
      <Brand/>
      <div className="auth-aside-art"><div className="auth-aside-pixel motion-safe:animate-pixel-float">PP</div><span className="auth-orbit auth-orbit-one"/><span className="auth-orbit auth-orbit-two"/><span className="auth-spark">*</span></div>
      <div className="auth-aside-copy"><span className="auth-eyebrow">RUANG UNTUK IDE BESAR</span><h2>Mulai dari<br/>sudutmu sendiri.</h2><p>Simpan karya favorit dan temukan inspirasi baru di PojokPixel.</p></div>
      <span className="auth-aside-foot">DESIGN - DIGITAL - PIXEL</span>
    </aside>
    <main className="auth-main">
      {modal
        ? <button className="auth-modal-close" type="button" onClick={onClose} aria-label="Tutup dialog">×</button>
        : <a className="auth-back" href="/">Kembali ke PojokPixel <ArrowUpRight/></a>}
      {children}
      {!modal && <p className="auth-legal">Dengan melanjutkan, kamu menyetujui ketentuan dan kebijakan privasi PojokPixel.</p>}
    </main>
  </div>
}

function AuthHeading({ eyebrow, title, detail }: { eyebrow: string; title: string; detail: string }) {
  return <div className="auth-heading"><span className="auth-eyebrow"><i/> {eyebrow}</span><h1>{title}</h1><p>{detail}</p></div>
}

function SocialButtons({ onError, busy, setBusy }: { onError: (message: string) => void; busy: boolean; setBusy: (busy: boolean) => void }) {
  const start = async (provider: 'google' | 'github') => {
    setBusy(true)
    try {
      const result = await authClient.signIn.social({
        provider,
        callbackURL: `${window.location.origin}/auth/continue?login=1`,
        newUserCallbackURL: `${window.location.origin}/auth/continue?new=1`,
        errorCallbackURL: `${window.location.origin}/login?oauthError=1`,
      })
      if (result.error) { onError(result.error.message || `Login ${provider} belum dapat dimulai.`); setBusy(false) }
    } catch { onError(`Tidak dapat terhubung ke API untuk login ${provider}.`); setBusy(false) }
  }
  return <div className="social-buttons">
    <button className="google-login rounded-lg transition duration-200 hover:-translate-y-0.5 hover:shadow-md" type="button" onClick={() => void start('google')} disabled={busy}><svg className="google-mark" viewBox="0 0 48 48" aria-hidden="true"><path fill="currentColor" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.7 29.3 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.2 8 3.1l5.7-5.7C34 6.1 29.3 4 24 4 13 4 4 13 4 24s9 20 20 20 20-9 20-20c0-1.3-.1-2.6-.4-3.9Z"/></svg><span>Lanjutkan dengan Google</span></button>
    <button className="rounded-lg transition duration-200 hover:-translate-y-0.5 hover:shadow-md" type="button" onClick={() => void start('github')} disabled={busy}><svg className="github-mark" viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M12 .5C5.37.5 0 5.87 0 12.5c0 5.3 3.44 9.8 8.2 11.39.6.11.82-.26.82-.58v-2.05c-3.34.73-4.04-1.42-4.04-1.42-.55-1.39-1.33-1.76-1.33-1.76-1.09-.75.08-.74.08-.74 1.2.08 1.83 1.23 1.83 1.23 1.07 1.84 2.8 1.31 3.49 1 .11-.78.42-1.31.76-1.61-2.67-.3-5.47-1.34-5.47-5.95 0-1.31.47-2.38 1.23-3.22-.12-.3-.53-1.53.12-3.18 0 0 1-.32 3.3 1.23a11.5 11.5 0 0 1 6 0c2.29-1.55 3.29-1.23 3.29-1.23.65 1.65.24 2.88.12 3.18.77.84 1.23 1.91 1.23 3.22 0 4.62-2.8 5.64-5.48 5.94.43.37.81 1.1.81 2.22v3.29c0 .32.22.69.82.58C20.56 22.3 24 17.8 24 12.5 24 5.87 18.63.5 12 .5z"/></svg><span>Lanjutkan dengan GitHub</span></button>
  </div>
}

function ProfileSettings() {
  const { data: session } = authClient.useSession()
  const user = session?.user
  const [photo, setPhoto] = useState(user?.image || '')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  if (!user) return <AuthShell kind="message"><div className="auth-loading"><span className="auth-spinner"/> Memuat profil...</div></AuthShell>

  const saveProfile = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setBusy(true); setError(''); setSuccess('')
    const form = new FormData(event.currentTarget)
    const birthDate = String(form.get('birthDate') || '')
    try {
      const result = await authClient.updateUser({
        name: String(form.get('name')).trim(),
        username: String(form.get('username')).trim().toLowerCase(),
        ...(birthDate ? { birthDate } : {}),
        image: photo,
      })
      if (result.error) setError(result.error.message || 'Profil belum berhasil disimpan. Periksa username dan coba lagi.')
      else setSuccess('Perubahan profil berhasil disimpan.')
    } catch { setError('Tidak dapat menyimpan profil. Periksa koneksi lalu coba lagi.') }
    finally { setBusy(false) }
  }

  const selectPhoto = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.currentTarget.files?.[0]
    if (!file) return
    setError(''); setSuccess('')
    try { setPhoto(await prepareProfileImage(file)) }
    catch (cause) { setError(cause instanceof Error ? cause.message : 'Foto belum bisa diproses.') }
  }

  return <AuthShell kind="register"><div className="auth-form-card profile-card">
    <AuthHeading eyebrow="AKUN POJOKPIXEL" title="Pengaturan profil" detail="Atur identitas yang terlihat saat kamu berkarya di PojokPixel."/>
    <form className="auth-form" onSubmit={(event) => void saveProfile(event)}>
      <div className="profile-photo-row">
        <span className="profile-photo-preview">{photo ? <img src={photo} alt="Foto profil"/> : (user.name?.slice(0, 1).toUpperCase() || 'P')}</span>
        <div className="profile-photo-controls"><strong>Foto profil</strong><span>Gambar akan disesuaikan agar ringan.</span><label className="profile-photo-button">Pilih foto<input type="file" accept="image/*" onChange={(event) => void selectPhoto(event)}/></label>{photo && <button type="button" className="profile-remove-photo" onClick={() => setPhoto('')}>Hapus foto</button>}</div>
      </div>
      <label>Nama lengkap<input name="name" defaultValue={user.name || ''} autoComplete="name" required maxLength={80}/></label>
      <label>Username<input name="username" defaultValue={user.username || ''} autoComplete="username" required minLength={3} maxLength={24} pattern="[A-Za-z0-9_]+"/><small>Gunakan 3–24 huruf, angka, atau garis bawah.</small></label>
      <label>Tanggal lahir<input name="birthDate" type="date" max={today} defaultValue={user.birthDate || ''}/></label>
      <label>Email akun<input value={user.email} readOnly/><small>Email akun saat ini tidak dapat diubah di sini.</small></label>
      {error && <p className="auth-error" role="alert">{error}</p>}{success && <p className="auth-success" role="status">{success}</p>}
      <button className="auth-submit rounded-lg transition duration-200 hover:-translate-y-0.5 hover:shadow-lg active:translate-y-0" disabled={busy}>{busy ? 'Menyimpan...' : 'Simpan perubahan'} <ArrowRight/></button>
    </form>
    <p className="auth-switch"><a href="/">Kembali ke PojokPixel</a></p>
  </div></AuthShell>
}

type AuthPagesProps = {
  modalMode?: 'login' | 'register'
  onClose?: () => void
  onModeChange?: (mode: 'login' | 'register') => void
}

export default function AuthPages({ modalMode, onClose, onModeChange }: AuthPagesProps = {}) {
  const path = modalMode ? `/${modalMode}` : window.location.pathname
  const { data: session, isPending } = authClient.useSession()
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [captchaToken, setCaptchaToken] = useState('')
  const [captchaResetKey, setCaptchaResetKey] = useState(0)
  const user = session?.user
  useEffect(() => {
    if (!modalMode) return
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const onKeyDown = (event: KeyboardEvent) => { if (event.key === 'Escape') onClose?.() }
    window.addEventListener('keydown', onKeyDown)
    return () => {
      document.body.style.overflow = previousOverflow
      window.removeEventListener('keydown', onKeyDown)
    }
  }, [modalMode, onClose])

  useEffect(() => {
    if (path === '/auth/continue' && !isPending) {
      if (!user) window.location.replace('/login')
      else {
        const params = new URLSearchParams(window.location.search)
        const kind = params.get('new') === '1' ? 'created' : params.get('login') === '1' ? 'welcome' : null
        if (kind) localStorage.setItem('pojokpixel:auth-notice', JSON.stringify({ kind, name: user.name }))
        window.location.replace('/')
      }
    }
    if ((path === '/dashboard' || path === '/onboarding') && !isPending) {
      if (!user) window.location.replace('/login')
      else window.location.replace(path === '/onboarding' ? '/profile' : '/')
    }
    if ((path === '/login' || path === '/register') && !isPending && user) {
      if (modalMode) onClose?.()
      else window.location.replace('/')
    }
    if (path === '/profile' && !isPending && !user) window.location.replace('/login')
  }, [path, isPending, user, modalMode, onClose])

  if (path === '/auth/continue' || path === '/dashboard' || path === '/onboarding' || ((path === '/profile' || path === '/login' || path === '/register') && (isPending || (path === '/profile' && !user)))) {
    return <AuthShell kind="message" modal={!!modalMode} onClose={onClose}><div className="auth-loading"><span className="auth-spinner"/> Menyiapkan akunmu...</div></AuthShell>
  }

  if (path === '/register/success') {
    return <AuthShell kind="message"><div className="auth-form-card success-card"><div className="success-icon">@</div><AuthHeading eyebrow="SATU LANGKAH LAGI" title="Cek email kamu." detail="Kami mengirim tautan verifikasi. Buka email tersebut untuk mengaktifkan akun PojokPixel."/><a href="/login" className="auth-submit rounded-lg transition duration-200 hover:-translate-y-0.5 hover:shadow-lg active:translate-y-0">Ke halaman login <ArrowRight/></a><p className="auth-switch">Tidak menerima email? Periksa folder spam atau coba daftar lagi.</p></div></AuthShell>
  }

  if (path === '/profile' && user) {
    return <ProfileSettings />
  }

  if (path === '/dashboard') {
    return <AuthShell kind="message"><div className="auth-form-card"><span className="auth-eyebrow"><i/> DASHBOARD POJOKPIXEL</span><div className="dashboard-avatar">{user?.name?.slice(0, 1).toUpperCase() || 'P'}</div><h1>Halo, {user?.name || 'kreator'}.</h1><p className="auth-subtitle">Selamat datang di sudut kreatifmu.</p><div className="dashboard-profile"><span>Username</span><strong>@{user?.username}</strong><span>Email</span><strong>{user?.email}</strong><span>Tanggal lahir</span><strong>{user?.birthDate}</strong></div><button className="auth-submit rounded-lg transition duration-200 hover:-translate-y-0.5 hover:shadow-lg active:translate-y-0" onClick={async () => { await authClient.signOut(); home() }}>Keluar dari akun <ArrowRight/></button></div></AuthShell>
  }

  if (path === '/onboarding') {
    const submitProfile = async (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault(); setError(''); setBusy(true)
      const form = new FormData(event.currentTarget)
      try {
        const result = await authClient.updateUser({ name: String(form.get('name')), username: String(form.get('username')).trim().toLowerCase(), birthDate: String(form.get('birthDate')) })
        if (result.error) setError(result.error.message || 'Profil belum bisa disimpan. Periksa username dan coba lagi.')
        else { setSuccess('Akun berhasil disiapkan. Selamat datang di PojokPixel!'); window.setTimeout(() => window.location.assign('/dashboard'), 1100) }
      } catch { setError('Tidak dapat terhubung ke API. Pastikan backend sedang berjalan.') }
      finally { setBusy(false) }
    }
    return <AuthShell kind="register"><div className="auth-form-card"><AuthHeading eyebrow="LENGKAPI PROFIL" title="Kenalan dulu, ya." detail="Satu langkah terakhir sebelum masuk ke dashboard PojokPixel."/><form className="auth-form" onSubmit={(event) => void submitProfile(event)}><label>Nama lengkap<input name="name" defaultValue={user?.name || ''} autoComplete="name" required maxLength={80}/></label><label>Username<input name="username" defaultValue={user?.username || ''} autoComplete="username" required minLength={3} maxLength={24} pattern="[A-Za-z0-9_]+" placeholder="contoh: pixelkreatif"/><small>Huruf, angka, dan garis bawah.</small></label><label>Tanggal lahir<input name="birthDate" type="date" max={today} defaultValue={user?.birthDate || ''} required/></label>{error && <p className="auth-error motion-safe:animate-pop-in" role="alert">{error}</p>}<button className="auth-submit rounded-lg transition duration-200 hover:-translate-y-0.5 hover:shadow-lg active:translate-y-0" disabled={busy}>{busy ? 'Menyimpan...' : 'Simpan dan buka dashboard'} <ArrowRight/></button></form>{success && <div className="auth-toast" role="status"><b>OK</b>{success}</div>}</div></AuthShell>
  }

  if (path === '/register') {
    const register = async (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault(); setError(''); setSuccess('')
      if (!turnstileSiteKey || !captchaToken) { setError('Selesaikan verifikasi keamanan terlebih dahulu.'); return }
      const form = new FormData(event.currentTarget)
      if (form.get('password') !== form.get('confirmPassword')) { setError('Konfirmasi password belum sama.'); return }
      setBusy(true)
      const email = String(form.get('email')).trim()
      try {
        const result = await authClient.signUp.email({
          name: String(form.get('name')).trim(),
          email,
          password: String(form.get('password')),
          username: String(form.get('username')).trim().toLowerCase(),
          birthDate: String(form.get('birthDate')),
          callbackURL: `${window.location.origin}/login?verified=1`,
          fetchOptions: { headers: { 'x-captcha-response': captchaToken } },
        })
        if (result.error) setError(result.error.message || 'Pendaftaran belum berhasil. Periksa data dan coba lagi.')
        else setSuccess(`Akun berhasil didaftarkan. Tautan verifikasi dikirim ke ${email}.`)
      } catch { setError('Tidak dapat terhubung ke server email atau API. Periksa konfigurasi dan coba lagi.') }
      finally { setBusy(false); setCaptchaToken(''); setCaptchaResetKey((key) => key + 1) }
    }
    return <AuthShell kind="register" modal={!!modalMode} onClose={onClose}><div className="auth-form-card register-card"><AuthHeading eyebrow="BUAT AKUN POJOKPIXEL" title="Mulai berkarya." detail="Buat akun gratis dan simpan semua inspirasi di satu tempat."/><SocialButtons onError={setError} busy={busy} setBusy={setBusy}/><div className="auth-divider"><span/>atau daftar dengan email<span/></div><form className="auth-form" onSubmit={(event) => void register(event)}><div className="auth-field-pair"><label>Nama lengkap<input name="name" autoComplete="name" required maxLength={80} placeholder="Nama kamu"/></label><label>Username<input name="username" autoComplete="username" required minLength={3} maxLength={24} pattern="[A-Za-z0-9_]+" placeholder="pixelkreatif"/></label></div><label>Tanggal lahir<input name="birthDate" type="date" max={today} required/></label><label>Email<input name="email" type="email" autoComplete="email" required placeholder="nama@email.com"/></label><div className="auth-field-pair"><label>Password<input name="password" type="password" autoComplete="new-password" minLength={8} required placeholder="Minimal 8 karakter"/></label><label>Ulangi password<input name="confirmPassword" type="password" autoComplete="new-password" minLength={8} required placeholder="Ketik ulang password"/></label></div><Turnstile onToken={setCaptchaToken} resetKey={captchaResetKey}/>{error && <p className="auth-error motion-safe:animate-pop-in" role="alert">{error}</p>}{success && <p className="auth-success motion-safe:animate-pop-in" role="status">{success}</p>}<button className="auth-submit rounded-lg transition duration-200 hover:-translate-y-0.5 hover:shadow-lg active:translate-y-0" disabled={busy || !captchaToken || !turnstileSiteKey}>{busy ? 'Membuat akun...' : success ? 'Cek email kamu' : 'Daftar dengan email'} <ArrowRight/></button></form><p className="auth-switch">Sudah punya akun? <a href="/login" onClick={modalMode ? (event) => { event.preventDefault(); onModeChange?.('login') } : undefined}>Masuk</a></p></div></AuthShell>
  }

  const login = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault(); setError(''); setBusy(true)
    const form = new FormData(event.currentTarget)
    try {
      const result = await authClient.signIn.email({ email: String(form.get('email')).trim(), password: String(form.get('password')), callbackURL: `${window.location.origin}/auth/continue?login=1` })
      if (result.error) setError(result.error.message || 'Email atau password belum cocok.')
      else continueTo()
    } catch { setError('Tidak dapat terhubung ke API. Pastikan backend sedang berjalan.') }
    finally { setBusy(false) }
  }
  const query = new URLSearchParams(window.location.search)
  const initialMessage = query.get('verified') === '1' ? 'Email berhasil diverifikasi. Silakan masuk ke akunmu.' : query.has('oauthError') ? 'Login melalui penyedia belum berhasil. Coba lagi atau gunakan email.' : ''
  return <AuthShell kind="login" modal={!!modalMode} onClose={onClose}><div className="auth-form-card"><AuthHeading eyebrow="SENANG MELIHATMU LAGI" title="Masuk ke akun." detail="Lanjutkan menjelajahi ide dan karya pilihanmu."/><SocialButtons onError={setError} busy={busy} setBusy={setBusy}/><div className="auth-divider"><span/>atau masuk dengan email<span/></div><form className="auth-form" onSubmit={(event) => void login(event)}><label>Email<input name="email" type="email" autoComplete="email" required placeholder="nama@email.com"/></label><label>Password<input name="password" type="password" autoComplete="current-password" required placeholder="Password akunmu"/></label>{initialMessage && <p className="auth-success motion-safe:animate-pop-in" role="status">{initialMessage}</p>}{error && <p className="auth-error motion-safe:animate-pop-in" role="alert">{error}</p>}<button className="auth-submit rounded-lg transition duration-200 hover:-translate-y-0.5 hover:shadow-lg active:translate-y-0" disabled={busy}>{busy ? 'Memeriksa akun...' : 'Masuk'} <ArrowRight/></button></form><p className="auth-switch">Belum punya akun? <a href="/register" onClick={modalMode ? (event) => { event.preventDefault(); onModeChange?.('register') } : undefined}>Daftar sekarang</a></p></div></AuthShell>
}

export function AuthDialog({ mode, onClose, onModeChange }: { mode: 'login' | 'register'; onClose: () => void; onModeChange: (mode: 'login' | 'register') => void }) {
  return <AuthPages modalMode={mode} onClose={onClose} onModeChange={onModeChange} />
}
