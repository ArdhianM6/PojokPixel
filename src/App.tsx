import { useState, useMemo, useEffect, useRef, useCallback } from 'react'
import type { ReactNode } from 'react'
import AuthPages, { AuthDialog } from './AuthPages'
import { authClient } from './lib/auth-client'
import { getCreatorData, getPublicCreatorProducts } from './lib/creator-api'
import { SkipToContent } from './components/SkipToContent'
import ProductDetailPage from './components/ProductDetailPage'
import { Analytics } from './components/Analytics'
import { HomePage } from './pages/HomePage'
import { CatalogPage } from './pages/CatalogPage'
import { CreatorPage } from './pages/CreatorPage'
import { OrdersPage } from './pages/OrdersPage'
import type { OrderRecord } from './pages/OrdersPage'
import { AboutPage } from './pages/AboutPage'
import { FaqPage } from './pages/FaqPage'
import { rupiah, getProductImageUrl, isValidAccessUrl } from './data/marketplace'
import type { Product } from './data/marketplace'

export type IconName =
  | 'search' | 'bag' | 'arrow' | 'spark' | 'heart' | 'menu' | 'close'
  | 'download' | 'grid' | 'book' | 'palette' | 'trash' | 'plus' | 'minus'
  | 'check' | 'eye' | 'star' | 'brush' | 'eraser' | 'refresh' | 'shield'
  | 'zap' | 'user' | 'volume' | 'volume-mute' | 'tag' | 'chevron-down'
  | 'filter' | 'store' | 'trending'

export function Icon({ name, size = 18, className = '' }: { name: IconName; size?: number; className?: string }) {
  const paths: Record<IconName, ReactNode> = {
    search: <><circle cx="11" cy="11" r="7"/><path d="m20 20-4-4"/></>,
    bag: <><path d="M5 8h14l1 13H4L5 8Z"/><path d="M9 9V6a3 3 0 0 1 6 0v3"/></>,
    arrow: <><path d="M5 12h14"/><path d="m13 6 6 6-6 6"/></>,
    spark: <><path d="m12 3 1.9 5.8L20 11l-6.1 2.2L12 19l-2-5.8L4 11l6-2.2L12 3Z"/><path d="m19 14 1.2 2.8L23 18l-2.8 1.2L19 22l-1.2-2.8L15 18l2.8-1.2L19 14Z"/></>,
    heart: <path d="M20.8 8.8c0 4.5-8.8 10-8.8 10s-8.8-5.5-8.8-10a4.5 4.5 0 0 1 8.8-1.1 4.5 4.5 0 0 1 8.8 1.1Z"/>,
    menu: <><path d="M4 7h16M4 12h16M4 17h16"/></>,
    close: <><path d="m6 6 12 12M18 6 6 18"/></>,
    download: <><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><path d="m7 10 5 5 5-5M12 15V3"/></>,
    grid: <><rect x="3" y="3" width="8" height="8" rx="1"/><rect x="13" y="3" width="8" height="8" rx="1"/><rect x="3" y="13" width="8" height="8" rx="1"/><rect x="13" y="13" width="8" height="8" rx="1"/></>,
    book: <><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2Z"/></>,
    palette: <><circle cx="13.5" cy="6.5" r=".5"/><circle cx="17.5" cy="10.5" r=".5"/><circle cx="8.5" cy="7.5" r=".5"/><circle cx="6.5" cy="12.5" r=".5"/><path d="M12 22a10 10 0 1 1 10-10c0 1.7-1.3 3-3 3h-1.8c-.8 0-1.2.9-.7 1.5.3.4.5.9.5 1.5 0 1.1-.9 2-2 2H12Z"/></>,
    trash: <><path d="M3 6h18"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"/><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></>,
    plus: <><path d="M12 5v14M5 12h14"/></>,
    minus: <path d="M5 12h14"/>,
    check: <path d="m5 12 5 5L20 7"/>,
    eye: <><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></>,
    star: <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>,
    brush: <><path d="m14 12 5-5a2.8 2.8 0 0 0-4-4l-5 5"/><path d="M10 16 6 20l-3-1 1-3 4-4"/><path d="m14 12-4 4"/></>,
    eraser: <path d="m7 21-4.3-4.3c-1-1-1-2.5 0-3.4l9.6-9.6c1-1 2.5-1 3.4 0l5.6 5.6c1 1 1 2.5 0 3.4L13 21H7Z"/>,
    refresh: <><path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/><path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16"/><path d="M16 16h5v5"/></>,
    shield: <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>,
    zap: <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>,
    user: <><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></>,
    volume: <><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><path d="M15.54 8.46a5 5 0 0 1 0 7.07"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14"/></>,
    'volume-mute': <><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><line x1="23" y1="9" x2="17" y2="15"/><line x1="17" y1="9" x2="23" y2="15"/></>,
    tag: <path d="M12 2H2v10l9.29 9.29c.94.94 2.48.94 3.42 0l6.58-6.58c.94-.94.94-2.48 0-3.42L12 2Z"/>,
    'chevron-down': <path d="m6 9 6 6 6-6"/>,
    filter: <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/>,
    store: <><path d="m2 7 4.41-4.41A2 2 0 0 1 7.83 2h8.34a2 2 0 0 1 1.42.59L22 7"/><path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/><path d="M15 22v-4a2 2 0 0 0-2-2h-2a2 2 0 0 0-2 2v4"/><path d="M2 7h20"/></>,
    trending: <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/>,
  }

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      {paths[name]}
    </svg>
  )
}

function PixelLogo({ small = false, light = false }: { small?: boolean; light?: boolean }) {
  return (
    <img
      className={small ? 'pixel-logo pixel-logo-small' : 'pixel-logo'}
      src={light ? '/pojokpixel-mark-light.svg' : '/pojokpixel-mark.svg'}
      alt="Logo Pojok Pixel"
    />
  )
}

export default function App() {
  const authRoutes = ['/login', '/register', '/register/success', '/auth/continue', '/onboarding', '/dashboard', '/profile']
  const path = window.location.pathname
  if (authRoutes.includes(path)) return <AuthPages />
  if (path.startsWith('/produk/')) return <ProductDetailPage />
  return <Storefront />
}

interface CartItem {
  product: Product
  quantity: number
}

function Storefront() {
  // Navigation State
  const [currentPath, setCurrentPath] = useState(() => window.location.pathname || '/')
  const [authDialogMode, setAuthDialogMode] = useState<'login' | 'register' | null>(null)
  const [headerSearchQuery, setHeaderSearchQuery] = useState('')
  const [searchOpen, setSearchOpen] = useState(false)
  const searchInputRef = useRef<HTMLInputElement>(null)
  const searchContainerRef = useRef<HTMLDivElement>(null)

  // Auto-focus search input when opened
  useEffect(() => {
    if (searchOpen) {
      const timer = setTimeout(() => {
        searchInputRef.current?.focus()
      }, 70)
      return () => clearTimeout(timer)
    }
  }, [searchOpen])

  // Close search when clicking outside
  useEffect(() => {
    if (!searchOpen) return
    const handleClickOutside = (e: MouseEvent) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(e.target as Node)) {
        setSearchOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [searchOpen])

  // Listen to browser Back / Forward buttons
  useEffect(() => {
    const onPop = () => setCurrentPath(window.location.pathname || '/')
    window.addEventListener('popstate', onPop)
    return () => window.removeEventListener('popstate', onPop)
  }, [])

  const navigate = useCallback((to: string) => {
    const url = new URL(to, window.location.origin)
    window.history.pushState({}, '', to)
    setCurrentPath(url.pathname)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [])

  // Shopping Cart & Favorites
  const [favorites, setFavorites] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('pojokpixel:favorites')
      return saved ? JSON.parse(saved) : []
    } catch {
      return []
    }
  })

  const [cartItems, setCartItems] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem('pojokpixel:cart')
      return saved ? JSON.parse(saved) : []
    } catch {
      return []
    }
  })

  const [isCartOpen, setIsCartOpen] = useState(false)
  const [cartBump, setCartBump] = useState(false)
  const [couponCode, setCouponCode] = useState('')
  const [couponApplied, setCouponApplied] = useState(false)
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null)
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false)
  const [checkoutStep, setCheckoutStep] = useState<'method' | 'qris' | 'processing' | 'success' | 'expired'>('method')
  const [qrisSecondsLeft, setQrisSecondsLeft] = useState(300)
  const [activeOrderId, setActiveOrderId] = useState<string | null>(null)
  const [qrisExpiresAt, setQrisExpiresAt] = useState<number | null>(null)
  const [lastPurchasedProducts, setLastPurchasedProducts] = useState<Product[]>(() => {
    try {
      const saved = localStorage.getItem('pojokpixel:last_purchase')
      return saved ? JSON.parse(saved) : []
    } catch {
      return []
    }
  })
  const [paymentMethod, setPaymentMethod] = useState<'qris' | 'bca' | 'cc'>('qris')
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [soundEnabled, setSoundEnabled] = useState(() => {
    const val = localStorage.getItem('pojokpixel:sound')
    return val !== null ? val === 'true' : true
  })
  const [toast, setToast] = useState<{ message: string; icon?: ReactNode } | null>(null)
  const [authNotice, setAuthNotice] = useState<{ title: string; message: string } | null>(null)
  const [profileMenuOpen, setProfileMenuOpen] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)
  const [scrollProgress, setScrollProgress] = useState(0)
  const [showBackToTop, setShowBackToTop] = useState(false)

  // Track creator status so non-creators cannot access creator menu
  const [isCreator, setIsCreator] = useState<boolean>(() => {
    try {
      return !!localStorage.getItem('pojokpixel:creator')
    } catch {
      return false
    }
  })

  useEffect(() => {
    const onCreatorUpdate = () => {
      try {
        setIsCreator(!!localStorage.getItem('pojokpixel:creator'))
      } catch {
        setIsCreator(false)
      }
    }
    window.addEventListener('pojokpixel:creator_updated', onCreatorUpdate)
    window.addEventListener('storage', onCreatorUpdate)
    return () => {
      window.removeEventListener('pojokpixel:creator_updated', onCreatorUpdate)
      window.removeEventListener('storage', onCreatorUpdate)
    }
  }, [])

  const profileMenu = useRef<HTMLDivElement>(null)
  const { data: session, isPending } = authClient.useSession()

  useEffect(() => {
    let cancelled = false
    if (isPending) return
    if (!session) {
      setIsCreator(false)
      return
    }
    void getCreatorData().then((data) => {
      if (!cancelled) setIsCreator(Boolean(data?.profile))
    }).catch(() => undefined)
    return () => { cancelled = true }
  }, [session?.user.id, isPending])

  useEffect(() => {
    let cancelled = false
    void getPublicCreatorProducts().then((projects) => {
      if (cancelled) return
      localStorage.removeItem('pojokpixel:user_catalog')
      localStorage.setItem('pojokpixel:server_creator_products', JSON.stringify(projects))
      window.dispatchEvent(new CustomEvent('pojokpixel:catalog_updated'))
    }).catch(() => undefined)
    return () => { cancelled = true }
  }, [])

  // Web Audio Retro Synthesizer
  const playSound = useCallback((type: 'click' | 'pop' | 'success' | 'delete') => {
    if (!soundEnabled || typeof window === 'undefined') return
    try {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
      if (!AudioCtx) return
      const ctx = new AudioCtx()
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.connect(gain)
      gain.connect(ctx.destination)
      const now = ctx.currentTime

      if (type === 'click') {
        osc.type = 'square'
        osc.frequency.setValueAtTime(360, now)
        osc.frequency.exponentialRampToValueAtTime(720, now + 0.04)
        gain.gain.setValueAtTime(0.06, now)
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.04)
        osc.start(now)
        osc.stop(now + 0.04)
      } else if (type === 'pop') {
        osc.type = 'triangle'
        osc.frequency.setValueAtTime(300, now)
        osc.frequency.exponentialRampToValueAtTime(600, now + 0.07)
        gain.gain.setValueAtTime(0.08, now)
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.07)
        osc.start(now)
        osc.stop(now + 0.07)
      } else if (type === 'success') {
        osc.type = 'sine'
        osc.frequency.setValueAtTime(440, now)
        osc.frequency.setValueAtTime(554.37, now + 0.08)
        osc.frequency.setValueAtTime(659.25, now + 0.16)
        gain.gain.setValueAtTime(0.08, now)
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.28)
        osc.start(now)
        osc.stop(now + 0.28)
      } else if (type === 'delete') {
        osc.type = 'sawtooth'
        osc.frequency.setValueAtTime(240, now)
        osc.frequency.exponentialRampToValueAtTime(120, now + 0.08)
        gain.gain.setValueAtTime(0.06, now)
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08)
        osc.start(now)
        osc.stop(now + 0.08)
      }
    } catch {
      // Audio not permitted without user gesture; safe ignore
    }
  }, [soundEnabled])

  const notify = useCallback((message: string, icon?: ReactNode) => {
    setToast({ message, icon })
    window.setTimeout(() => setToast(null), 3800)
  }, [])

  // Sync favorites & cart
  useEffect(() => {
    try {
      localStorage.setItem('pojokpixel:favorites', JSON.stringify(favorites))
    } catch { /* noop */ }
  }, [favorites])

  useEffect(() => {
    try {
      localStorage.setItem('pojokpixel:cart', JSON.stringify(cartItems))
    } catch { /* noop */ }
  }, [cartItems])

  useEffect(() => {
    try {
      const stored = JSON.parse(localStorage.getItem('pojokpixel:orders') || '[]') as OrderRecord[]
      const now = Date.now()
      let changed = false
      const normalized = stored.map((order) => {
        if (order.status === 'pending' && order.expiresAt && order.expiresAt <= now) {
          changed = true
          return { ...order, status: 'cancelled' as const }
        }
        return order
      })
      if (changed) {
        localStorage.setItem('pojokpixel:orders', JSON.stringify(normalized))
        window.dispatchEvent(new CustomEvent('pojokpixel:orders_updated'))
      }
    } catch { /* ignore unavailable local storage */ }
  }, [])

  const toggleSound = () => {
    const next = !soundEnabled
    setSoundEnabled(next)
    localStorage.setItem('pojokpixel:sound', String(next))
    if (next) playSound('success')
  }

  // Scroll listeners
  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY
      setIsScrolled(scrollY > 20)
      setShowBackToTop(scrollY > 380)

      const docHeight = document.documentElement.scrollHeight - window.innerHeight
      if (docHeight > 0) {
        setScrollProgress((scrollY / docHeight) * 100)
      }
    }
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Cart operations
  const cartTotalCount = useMemo(() => cartItems.reduce((acc, item) => acc + item.quantity, 0), [cartItems])
  const cartSubtotal = useMemo(() => cartItems.reduce((acc, item) => acc + item.product.price * item.quantity, 0), [cartItems])
  const discountAmount = useMemo(() => (couponApplied ? Math.round(cartSubtotal * 0.15) : 0), [cartSubtotal, couponApplied])
  const finalTotal = useMemo(() => Math.max(0, cartSubtotal - discountAmount), [cartSubtotal, discountAmount])

  const addToCart = (product: Product, sourceCard?: HTMLElement | null) => {
    if (isPending) {
      notify('Sesi akun sedang diperiksa. Coba lagi sebentar.')
      return
    }
    if (!session?.user) {
      setAuthDialogMode('login')
      notify('Masuk ke akun terlebih dahulu untuk menambahkan produk ke keranjang.')
      return
    }

    if (sourceCard && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      const sourceImage = sourceCard.querySelector<HTMLElement>('.product-image')
      const cartTarget = document.querySelector<HTMLElement>('.cart-button')
      const sourceRect = sourceImage?.getBoundingClientRect()
      const targetRect = cartTarget?.getBoundingClientRect()

      if (sourceImage && cartTarget && sourceRect && targetRect && sourceRect.width > 0 && targetRect.width > 0) {
        const receivingCartTarget = cartTarget
        const flyer = sourceImage.cloneNode(false) as HTMLElement
        flyer.classList.add('cart-flyer')
        flyer.setAttribute('aria-hidden', 'true')
        Object.assign(flyer.style, {
          left: `${sourceRect.left}px`,
          top: `${sourceRect.top}px`,
          width: `${sourceRect.width}px`,
          height: `${sourceRect.height}px`,
        })
        document.body.appendChild(flyer)

        const translateX = targetRect.left + targetRect.width / 2 - (sourceRect.left + sourceRect.width / 2)
        const translateY = targetRect.top + targetRect.height / 2 - (sourceRect.top + sourceRect.height / 2)
        const arc = Math.min(92, Math.max(38, Math.abs(translateX) * .13))
        const animation = flyer.animate(
          [
            { transform: 'translate(0, 0) scale(1) rotate(0deg)', opacity: 1, offset: 0 },
            {
              transform: `translate(${translateX * .24}px, ${translateY * .28 - arc}px) scale(.82) rotate(-7deg)`,
              opacity: 1,
              offset: .34,
            },
            {
              transform: `translate(${translateX * .76}px, ${translateY * .78 - arc * .28}px) scale(.42) rotate(5deg)`,
              opacity: .82,
              offset: .72,
            },
            { transform: `translate(${translateX}px, ${translateY}px) scale(.12) rotate(10deg)`, opacity: .18, offset: 1 },
          ],
          { duration: 780, easing: 'cubic-bezier(.22, .72, .18, 1)', fill: 'forwards' },
        )
        animation.onfinish = () => {
          flyer.remove()
          receivingCartTarget.classList.remove('is-receiving')
          void receivingCartTarget.offsetWidth
          receivingCartTarget.classList.add('is-receiving')
          window.setTimeout(() => receivingCartTarget.classList.remove('is-receiving'), 520)
        }

        const buyButton = sourceCard.querySelector<HTMLElement>('.product-buy-btn')
        buyButton?.classList.add('is-adding')
        window.setTimeout(() => buyButton?.classList.remove('is-adding'), 420)
      }
    }

    playSound('pop')
    setCartItems((prev) => {
      const idx = prev.findIndex((item) => item.product.id === product.id)
      if (idx >= 0) {
        const next = [...prev]
        next[idx].quantity += 1
        return next
      }
      return [...prev, { product, quantity: 1 }]
    })
    setCartBump(true)
    setTimeout(() => setCartBump(false), 300)
    notify(`${product.name} masuk ke keranjang!`)
  }

  const updateQuantity = (productId: string, delta: number) => {
    playSound('click')
    setCartItems((prev) =>
      prev
        .map((item) => {
          if (item.product.id === productId) {
            const newQty = item.quantity + delta
            return newQty > 0 ? { ...item, quantity: newQty } : null
          }
          return item
        })
        .filter(Boolean) as CartItem[],
    )
  }

  const removeFromCart = (productId: string) => {
    playSound('delete')
    setCartItems((prev) => prev.filter((item) => item.product.id !== productId))
  }

  const applyCoupon = () => {
    if (couponCode.trim().toUpperCase() === 'PIXELHEMAT') {
      playSound('success')
      setCouponApplied(true)
      notify('Kupon PIXELHEMAT berhasil dipasang (Diskon 15%)!')
    } else {
      playSound('delete')
      notify('Kode kupon tidak valid. Gunakan: PIXELHEMAT')
    }
  }

  const toggleFavorite = (id: string) => {
    playSound('pop')
    setFavorites((current) => {
      const isFav = current.includes(id)
      const next = isFav ? current.filter((x) => x !== id) : [...current, id]
      notify(isFav ? 'Dihapus dari daftar favorit' : 'Disimpan ke daftar favorit!')
      return next
    })
  }

  // Handle Checkout Simulator
  const handleProceedCheckout = () => {
    if (isPending) {
      notify('Sesi akun sedang diperiksa. Coba lagi sebentar.')
      return
    }
    if (!session?.user) {
      setIsCartOpen(false)
      setAuthDialogMode('login')
      notify('Masuk ke akun terlebih dahulu sebelum checkout.')
      return
    }
    if (cartItems.length === 0) {
      notify('Keranjangmu masih kosong!')
      return
    }
    setIsCartOpen(false)
    setIsCheckoutOpen(true)
    setCheckoutStep('method')
  }

  const handleConfirmPayment = () => {
    if (!session?.user) {
      setIsCheckoutOpen(false)
      setAuthDialogMode('login')
      notify('Sesi login diperlukan untuk melanjutkan pembayaran.')
      return
    }
    if (paymentMethod === 'qris') {
      const orderId = `PP-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`
      const expiresAt = Date.now() + 5 * 60 * 1000
      setActiveOrderId(orderId)
      setQrisExpiresAt(expiresAt)
      setQrisSecondsLeft(300)
      const pendingOrder: OrderRecord = {
        orderId,
        date: new Date().toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' }),
        timestamp: Date.now(),
        expiresAt,
        totalAmount: finalTotal,
        paymentMethod: 'qris',
        status: 'pending',
        items: cartItems.map((item) => ({ id: item.product.id, product: item.product, pricePaid: item.product.price })),
      }
      try {
        const orders: OrderRecord[] = JSON.parse(localStorage.getItem('pojokpixel:orders') || '[]')
        localStorage.setItem('pojokpixel:orders', JSON.stringify([pendingOrder, ...orders]))
        window.dispatchEvent(new CustomEvent('pojokpixel:orders_updated'))
      } catch { /* ignore unavailable local storage */ }
      setCheckoutStep('qris')
      return
    }
    playSound('pop')
    setCheckoutStep('processing')
    const productsToDeliver = cartItems.map((item) => item.product)
    setLastPurchasedProducts(productsToDeliver)
    try {
      localStorage.setItem('pojokpixel:last_purchase', JSON.stringify(productsToDeliver))

      // Save to persistent Orders History
      const generatedOrderId = `PP-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`
      setActiveOrderId(generatedOrderId)
      const newOrderRecord: OrderRecord = {
        orderId: generatedOrderId,
        date: new Date().toLocaleDateString('id-ID', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        }),
        timestamp: Date.now(),
        totalAmount: finalTotal,
        paymentMethod: paymentMethod,
        status: 'completed',
        items: cartItems.map((item) => ({
          id: item.product.id,
          product: item.product,
          pricePaid: item.product.price,
        })),
      }
      const existingOrders: OrderRecord[] = JSON.parse(localStorage.getItem('pojokpixel:orders') || '[]')
      localStorage.setItem('pojokpixel:orders', JSON.stringify([newOrderRecord, ...existingOrders]))
      window.dispatchEvent(new CustomEvent('pojokpixel:orders_updated'))
    } catch {
      // ignore
    }

    window.setTimeout(() => {
      playSound('success')
      setCheckoutStep('success')
      setCartItems([])
      setCouponApplied(false)
      setCouponCode('')
    }, 1200)
  }

  const finishQrisPayment = () => {
    if (!activeOrderId || !qrisExpiresAt || Date.now() >= qrisExpiresAt) return
    const orders: OrderRecord[] = JSON.parse(localStorage.getItem('pojokpixel:orders') || '[]')
    const updatedOrders = orders.map((order) => order.orderId === activeOrderId ? { ...order, status: 'completed' as const } : order)
    localStorage.setItem('pojokpixel:orders', JSON.stringify(updatedOrders))
    window.dispatchEvent(new CustomEvent('pojokpixel:orders_updated'))
    const productsToDeliver = cartItems.map((item) => item.product)
    setLastPurchasedProducts(productsToDeliver)
    localStorage.setItem('pojokpixel:last_purchase', JSON.stringify(productsToDeliver))
    setCheckoutStep('processing')
    setQrisExpiresAt(null)
    window.setTimeout(() => {
      playSound('success')
      setCheckoutStep('success')
      setCartItems([])
      setCouponApplied(false)
      setCouponCode('')
    }, 700)
  }

  useEffect(() => {
    if (!activeOrderId || !qrisExpiresAt) return
    let timer: number | undefined
    const updateCountdown = () => {
      const remaining = Math.max(0, Math.ceil((qrisExpiresAt - Date.now()) / 1000))
      setQrisSecondsLeft(remaining)
      if (remaining === 0 && activeOrderId) {
        try {
          const orders: OrderRecord[] = JSON.parse(localStorage.getItem('pojokpixel:orders') || '[]')
          localStorage.setItem('pojokpixel:orders', JSON.stringify(orders.map((order) => order.orderId === activeOrderId && order.status === 'pending' ? { ...order, status: 'cancelled' as const } : order)))
          window.dispatchEvent(new CustomEvent('pojokpixel:orders_updated'))
        } catch { /* ignore unavailable local storage */ }
        if (timer) window.clearInterval(timer)
        setQrisExpiresAt(null)
        if (isCheckoutOpen && checkoutStep === 'qris') setCheckoutStep('expired')
      }
    }
    updateCountdown()
    timer = window.setInterval(updateCountdown, 1000)
    return () => window.clearInterval(timer)
  }, [checkoutStep, isCheckoutOpen, qrisExpiresAt, activeOrderId])

  // Handle genuine file download for purchased products
  const handleDownloadAsset = (p: Product) => {
    playSound('pop')
    const fileData = p.fileAttachment?.fileData
    const hasOriginalFile = Boolean(fileData?.startsWith('data:'))
    if (!hasOriginalFile) {
      notify(isValidAccessUrl(p.accessUrl)
        ? 'Berkas belum dilampirkan. Gunakan tautan akses produk di bawah.'
        : 'Berkas asli belum tersedia. Hubungi kreator melalui catatan produk.')
      return
    }
    const safeProductName = p.name.replace(/[^a-zA-Z0-9_-]/g, '_') || 'Produk_Digital'
    const fileName = p.fileAttachment?.fileName
      ? p.fileAttachment.fileName
      : `${safeProductName}_Petunjuk_Akses.txt`

    notify(`Memulai unduhan berkas untuk "${p.name}"...`)

    const link = document.createElement('a')
    link.download = fileName
    link.href = fileData!
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  // Check auth notice
  useEffect(() => {
    const notice = localStorage.getItem('pojokpixel:auth-notice')
    if (!notice) return
    localStorage.removeItem('pojokpixel:auth-notice')
    try {
      const { kind, name } = JSON.parse(notice) as { kind: 'created' | 'welcome'; name?: string }
      setAuthNotice({
        title: kind === 'created' ? 'Akun berhasil dibuat' : 'Selamat datang kembali',
        message:
          kind === 'created'
            ? `Welcome, ${name || 'kreator'}! Kamu sudah masuk ke Pojok Pixel.`
            : `Halo lagi, ${name || 'kreator'}! Senang melihatmu kembali.`,
      })
      window.setTimeout(() => setAuthNotice(null), 5200)
    } catch { /* noop */ }
  }, [])

  // Close profile dropdown on outside click
  useEffect(() => {
    if (!profileMenuOpen) return
    const closeOnOutside = (e: PointerEvent) => {
      if (!profileMenu.current?.contains(e.target as Node)) setProfileMenuOpen(false)
    }
    const closeOnEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setProfileMenuOpen(false)
    }
    document.addEventListener('pointerdown', closeOnOutside)
    document.addEventListener('keydown', closeOnEsc)
    return () => {
      document.removeEventListener('pointerdown', closeOnOutside)
      document.removeEventListener('keydown', closeOnEsc)
    }
  }, [profileMenuOpen])

  // Parse URL search params for catalog initial states
  const searchParams = new URLSearchParams(window.location.search)
  const initialCat = searchParams.get('cat') || 'Semua'
  const initialQ = searchParams.get('q') || ''

  // Keep in-app navigation in sync with the top-level product route as well as direct URL visits.
  if (currentPath.startsWith('/produk/')) return <ProductDetailPage />

  return (
    <>
      <SkipToContent />
      <Analytics />
      {/* Scroll Progress Bar */}
      <div className="fixed top-0 left-0 h-[3px] bg-gradient-to-r from-[#e65416] to-[#f18a5d] z-[100] transition-[width] duration-75 ease-out" style={{ width: `${scrollProgress}%` }} />

      {/* Main Site Header */}
      <header className={`${isScrolled ? "h-16 bg-[rgba(245,245,242,0.94)] backdrop-blur-md shadow-[0_4px_20px_-8px_rgba(48,50,54,0.08)]" : "h-[74px] bg-[#f5f5f2]"} border-b border-[#deddd6] sticky top-0 z-[45] transition-all duration-250 ease-in-out`}>
        <div className="w-full max-w-[1220px] mx-auto px-4 sm:px-6 h-full flex items-center justify-between gap-4 sm:gap-6">
          <a
            className="inline-flex items-center gap-2.5 transition-transform hover:-translate-y-px flex-none"
            href="/"
            aria-label="Pojok Pixel beranda"
            onClick={(e) => {
              e.preventDefault()
              playSound('click')
              navigate('/')
            }}
          >
            <PixelLogo />
            <span className="font-[family-name:var(--font-display)] font-bold text-[22px] tracking-[-0.02em]">
              pojok<span>pixel</span><i>.</i>
            </span>
          </a>

          {/* Desktop Navigation */}
          <nav className="main-nav" aria-label="Navigasi utama marketplace">
            <a
              className={currentPath === '/' ? 'active' : ''}
              href="/"
              onClick={(e) => {
                e.preventDefault()
                playSound('click')
                navigate('/')
              }}
            >
              Beranda
            </a>
            <a
              className={currentPath.startsWith('/katalog') ? 'active' : ''}
              href="/katalog"
              onClick={(e) => {
                e.preventDefault()
                playSound('click')
                navigate('/katalog')
              }}
            >
              Katalog
            </a>
            <a
              className={currentPath.startsWith('/favorit') ? 'active' : ''}
              href="/favorit"
              onClick={(e) => {
                e.preventDefault()
                playSound('click')
                navigate('/favorit')
              }}
            >
              Favorit
            </a>
            <a
              className={currentPath.startsWith('/riwayat') ? 'active' : ''}
              href="/riwayat"
              onClick={(e) => {
                e.preventDefault()
                playSound('click')
                navigate('/riwayat')
              }}
            >
              Riwayat
            </a>
            {isCreator ? (
              <a
                className={`nav-creator-pro-link ${currentPath.startsWith('/kreator') ? 'active' : ''}`}
                href="/kreator"
                onClick={(e) => {
                  e.preventDefault()
                  playSound('click')
                  navigate('/kreator')
                }}
              >
                Area Kreator
                <span className="creator-nav-badge">PRO</span>
              </a>
            ) : (
              <a
                className={`nav-creator-register-link ${currentPath.startsWith('/kreator') ? 'active' : ''}`}
                href="/kreator"
                onClick={(e) => {
                  e.preventDefault()
                  playSound('click')
                  navigate('/kreator')
                }}
              >
                Daftar Jadi Kreator
              </a>
            )}
            <a
              className={currentPath.startsWith('/tentang') ? 'active' : ''}
              href="/tentang"
              onClick={(e) => {
                e.preventDefault()
                playSound('click')
                navigate('/tentang')
              }}
            >
              Tentang & Tim
            </a>
            <a
              className={currentPath.startsWith('/faq') ? 'active' : ''}
              href="/faq"
              onClick={(e) => {
                e.preventDefault()
                playSound('click')
                navigate('/faq')
              }}
            >
              FAQ
            </a>
          </nav>

          {/* Header Actions */}
          <div className="flex items-center gap-3">
            <div className={`search-expandable-wrap ${searchOpen ? 'is-open' : ''}`} ref={searchContainerRef}>
              <div className="search-expand-field">
                <input
                  ref={searchInputRef}
                  className="search-input"
                  placeholder="Cari website, poster, kelas..."
                  value={headerSearchQuery}
                  onChange={(e) => setHeaderSearchQuery(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      playSound('pop')
                      navigate(`/katalog${headerSearchQuery ? `?q=${encodeURIComponent(headerSearchQuery)}` : ''}`)
                      setSearchOpen(false)
                    } else if (e.key === 'Escape') {
                      setSearchOpen(false)
                    }
                  }}
                  aria-label="Cari produk"
                />
                {headerSearchQuery && (
                  <button
                    type="button"
                    className="search-clear-btn"
                    onClick={() => {
                      setHeaderSearchQuery('')
                      searchInputRef.current?.focus()
                    }}
                    aria-label="Hapus pencarian"
                  >
                    ×
                  </button>
                )}
              </div>

              <button
                type="button"
                className={`icon-button search-trigger-btn ${searchOpen ? 'is-active' : ''}`}
                aria-label={searchOpen ? 'Cari / Tutup pencarian' : 'Cari produk'}
                onClick={() => {
                  playSound('click')
                  if (searchOpen && headerSearchQuery.trim()) {
                    playSound('pop')
                    navigate(`/katalog?q=${encodeURIComponent(headerSearchQuery.trim())}`)
                    setSearchOpen(false)
                  } else {
                    setSearchOpen((v) => !v)
                  }
                }}
              >
                <Icon name="search" size={18} />
              </button>
            </div>

            {!isPending &&
              (session?.user ? (
                <div className="profile-menu-wrap" ref={profileMenu}>
                  <button
                    className="header-profile"
                    type="button"
                    aria-label="Buka menu profil"
                    aria-expanded={profileMenuOpen}
                    onClick={() => {
                      playSound('click')
                      setProfileMenuOpen((open) => !open)
                    }}
                  >
                    <span className="header-profile-avatar">
                      {session.user.image ? (
                        <img src={session.user.image} alt="" />
                      ) : (
                        session.user.name?.slice(0, 1).toUpperCase() || 'P'
                      )}
                    </span>
                    <span className="header-profile-name">{session.user.name || 'Akun saya'}</span>
                    <svg className="profile-chevron" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <path d="m6 9 6 6 6-6" />
                    </svg>
                  </button>
                  {profileMenuOpen && (
                    <div className="profile-dropdown" role="menu">
                      <div className="profile-dropdown-heading">
                        <strong>{session.user.name || 'Kreator Pojok Pixel'}</strong>
                        <span>{session.user.email}</span>
                      </div>
                      <a href="/profile" role="menuitem" onClick={() => setProfileMenuOpen(false)}>
                        Pengaturan profil
                      </a>
                      <a
                        href="/riwayat"
                        role="menuitem"
                        onClick={(e) => {
                          e.preventDefault()
                          setProfileMenuOpen(false)
                          playSound('click')
                          navigate('/riwayat')
                        }}
                      >
                        📦 Riwayat Pembelian & Unduh
                      </a>
                      {isCreator ? (
                        <a
                          href="/kreator"
                          role="menuitem"
                          onClick={(e) => {
                            e.preventDefault()
                            setProfileMenuOpen(false)
                            playSound('click')
                            navigate('/kreator')
                          }}
                        >
                          Lapak & Dashboard Kreator
                        </a>
                      ) : (
                        <a
                          href="/kreator"
                          role="menuitem"
                          onClick={(e) => {
                            e.preventDefault()
                            setProfileMenuOpen(false)
                            playSound('click')
                            navigate('/kreator')
                          }}
                        >
                          Daftar Menjadi Kreator
                        </a>
                      )}
                      <button
                        type="button"
                        role="menuitem"
                        onClick={async () => {
                          await authClient.signOut()
                          window.location.assign('/login')
                        }}
                      >
                        Keluar dari akun
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <a className="header-login" href="/login" onClick={(event) => { event.preventDefault(); playSound('click'); setAuthDialogMode('login') }}>
                  Masuk
                </a>
              ))}

            <button
              className="cart-button"
              type="button"
              aria-label="Buka keranjang belanja"
              onClick={() => {
                playSound('pop')
                setIsCartOpen(true)
              }}
            >
              <Icon name="bag" size={17} />
              <span>Keranjang</span>
              <b className={cartBump ? 'bump' : ''}>{cartTotalCount}</b>
            </button>

            <button
              className="hidden border-0 bg-transparent p-2 cursor-pointer md:hidden"
              type="button"
              aria-label="Menu navigasi mobile"
              onClick={() => {
                playSound('click')
                setMobileMenuOpen(true)
              }}
            >
              <Icon name="menu" size={22} />
            </button>
          </div>
        </div>
      </header>

      {/* App Mobile Bottom Navigation Bar (App-Ready) */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 h-[60px] bg-[rgba(245,245,242,0.96)] backdrop-blur-[14px] border-t border-[#deddd6] z-50 pb-[max(6px,env(safe-area-inset-bottom,6px))]" aria-label="Navigasi aplikasi mobile">
        <div className="flex items-center justify-around h-full w-full">
          <a
            href="/"
            className={`mobile-nav-item ${currentPath === '/' ? 'active' : ''}`}
            onClick={(e) => {
              e.preventDefault()
              playSound('click')
              navigate('/')
            }}
          >
            <Icon name="grid" size={18} />
            <span>Beranda</span>
          </a>
          <a
            href="/katalog"
            className={`mobile-nav-item ${currentPath.startsWith('/katalog') ? 'active' : ''}`}
            onClick={(e) => {
              e.preventDefault()
              playSound('click')
              navigate('/katalog')
            }}
          >
            <Icon name="tag" size={18} />
            <span>Katalog</span>
          </a>
          {isCreator ? (
            <a
              href="/kreator"
              className={`mobile-nav-item ${currentPath.startsWith('/kreator') ? 'active' : ''}`}
              onClick={(e) => {
                e.preventDefault()
                playSound('click')
                navigate('/kreator')
              }}
            >
              <Icon name="palette" size={18} />
              <span>Kreator</span>
            </a>
          ) : (
            <a
              href="/kreator"
              className={`mobile-nav-item ${currentPath.startsWith('/kreator') ? 'active' : ''}`}
              onClick={(e) => {
                e.preventDefault()
                playSound('click')
                navigate('/kreator')
              }}
            >
              <Icon name="zap" size={18} />
              <span>Daftar Kreator</span>
            </a>
          )}
          <button
            type="button"
            className="mobile-nav-item"
            onClick={() => {
              playSound('pop')
              setIsCartOpen(true)
            }}
          >
            <Icon name="bag" size={18} />
            <span>Keranjang</span>
            {cartTotalCount > 0 && <span className="mobile-nav-badge">{cartTotalCount}</span>}
          </button>
          <a
            href="/login"
            className="mobile-nav-item"
            onClick={(event) => { event.preventDefault(); playSound('click'); setAuthDialogMode('login') }}
          >
            <Icon name="user" size={18} />
            <span>Akun</span>
          </a>
        </div>
      </nav>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <>
          <div className="fixed inset-0 bg-[rgba(48,50,54,0.5)] backdrop-blur-[4px] z-[60] animate-[pop-in_0.2s_ease-out]" onClick={() => setMobileMenuOpen(false)} />
          <aside className="fixed top-0 right-0 bottom-0 w-[min(320px,85vw)] bg-[#f5f5f2] z-[61] p-6 shadow-[-8px_0_32px_rgba(48,50,54,0.2)] flex flex-col animate-[slide-drawer_0.25s_cubic-bezier(0.16,1,0.3,1)]" role="dialog" aria-modal="true">
            <div className="flex items-center justify-between border-b border-[#deddd6] pb-4 mb-5">
              <a
                className="inline-flex items-center gap-2.5 transition-transform hover:-translate-y-px flex-none"
                href="/"
                onClick={(e) => {
                  e.preventDefault()
                  setMobileMenuOpen(false)
                  navigate('/')
                }}
              >
                <PixelLogo small />
                <span className="font-[family-name:var(--font-display)] font-bold text-[22px] tracking-[-0.02em]">pojok<span>pixel</span><i>.</i></span>
              </a>
              <button
                type="button"
                className="icon-button"
                onClick={() => setMobileMenuOpen(false)}
                aria-label="Tutup menu"
              >
                <Icon name="close" size={20} />
              </button>
            </div>
            <div className="flex flex-col gap-3.5">
              <a
                href="/"
                onClick={(e) => {
                  e.preventDefault()
                  setMobileMenuOpen(false)
                  navigate('/')
                }}
              >
                Beranda <Icon name="arrow" size={14} />
              </a>
              <a
                href="/katalog"
                onClick={(e) => {
                  e.preventDefault()
                  setMobileMenuOpen(false)
                  navigate('/katalog')
                }}
              >
                Katalog Marketplace <Icon name="arrow" size={14} />
              </a>
              <a
                href="/riwayat"
                onClick={(e) => {
                  e.preventDefault()
                  setMobileMenuOpen(false)
                  navigate('/riwayat')
                }}
              >
                Riwayat Pembelian & Unduh <Icon name="arrow" size={14} />
              </a>
              {isCreator ? (
                <a
                  href="/kreator"
                  onClick={(e) => {
                    e.preventDefault()
                    setMobileMenuOpen(false)
                    navigate('/kreator')
                  }}
                >
                  Dashboard & Lapak Kreator <Icon name="arrow" size={14} />
                </a>
              ) : (
                <a
                  href="/kreator"
                  onClick={(e) => {
                    e.preventDefault()
                    setMobileMenuOpen(false)
                    navigate('/kreator')
                  }}
                >
                  Daftar Jadi Kreator <Icon name="arrow" size={14} />
                </a>
              )}
              <a
                href="/tentang"
                onClick={(e) => {
                  e.preventDefault()
                  setMobileMenuOpen(false)
                  navigate('/tentang')
                }}
              >
                Tentang & Tim Kami <Icon name="arrow" size={14} />
              </a>
              <a
                href="/faq"
                onClick={(e) => {
                  e.preventDefault()
                  setMobileMenuOpen(false)
                  navigate('/faq')
                }}
              >
                Pertanyaan Umum (FAQ) <Icon name="arrow" size={14} />
              </a>
            </div>
            <div className="mt-auto pt-6 border-t border-[#deddd6] flex flex-col gap-3">
              <button
                type="button"
                className="button button-secondary w-full justify-center"
                onClick={() => {
                  toggleSound()
                  setMobileMenuOpen(false)
                }}
              >
                <Icon name={soundEnabled ? 'volume' : 'volume-mute'} size={15} />
                <span>Efek Suara: {soundEnabled ? 'Aktif' : 'Mati'}</span>
              </button>
              <a href="/login" className="button button-dark w-full justify-center" onClick={(event) => { event.preventDefault(); setMobileMenuOpen(false); setAuthDialogMode('login') }}>
                Masuk ke Akun
              </a>
            </div>
          </aside>
        </>
      )}

      {/* Main Page Content Body */}
      <main id="main-content">
        {currentPath === '/katalog' || currentPath === '/favorit' ? (
          <CatalogPage
            initialCategory={currentPath === '/favorit' ? 'Favorit Saya' : initialCat}
            initialQuery={initialQ}
            onQuickView={(p) => setQuickViewProduct(p)}
            onAddToCart={addToCart}
            onToggleFavorite={toggleFavorite}
            favorites={favorites}
            playSound={playSound}
            navigate={navigate}
          />
        ) : currentPath === '/riwayat' ? (
          isPending ? (
            <section className="min-h-[55vh] flex items-center justify-center px-6" aria-live="polite">
              <p className="text-sm text-stone-500">Memeriksa sesi akun…</p>
            </section>
          ) : !session?.user ? (
            <section className="min-h-[55vh] flex items-center justify-center bg-[#f5f5f2] px-6 py-16">
              <div className="w-full max-w-md rounded-3xl border border-[#deddd6] bg-white px-8 py-10 text-center shadow-sm">
                <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-[#fff1e9] text-[#e65416]" aria-hidden="true">
                  <Icon name="user" size={25} />
                </div>
                <h1 className="font-[family-name:var(--font-display)] text-2xl font-bold text-[#303236]">Masuk untuk melihat riwayat</h1>
                <p className="mt-2 text-sm leading-6 text-stone-600">Riwayat pembelian dan unduhan hanya tersedia setelah kamu masuk ke akun PojokPixel.</p>
                <button type="button" className="button button-dark mt-6 w-full justify-center" onClick={() => setAuthDialogMode('login')}>
                  Masuk ke akun
                </button>
                <button type="button" className="mt-3 text-sm font-semibold text-[#e65416] hover:underline" onClick={() => setAuthDialogMode('register')}>
                  Belum punya akun? Daftar
                </button>
              </div>
            </section>
          ) : (
            <OrdersPage
              playSound={playSound}
              navigate={navigate}
              notify={notify}
              onDownloadAsset={handleDownloadAsset}
            />
          )
        ) : currentPath.startsWith('/kreator') ? (
          <CreatorPage
            playSound={playSound}
            navigate={navigate}
            notify={notify}
          />
        ) : currentPath === '/tentang' ? (
          <AboutPage
            playSound={playSound}
            navigate={navigate}
          />
        ) : currentPath === '/faq' ? (
          <FaqPage
            playSound={playSound}
            navigate={navigate}
          />
        ) : (
          <HomePage
            onQuickView={(p) => setQuickViewProduct(p)}
            onAddToCart={addToCart}
            onToggleFavorite={toggleFavorite}
            favorites={favorites}
            playSound={playSound}
            navigate={navigate}
          />
        )}
      </main>

      {/* Shared Site Footer (Professional Dark Charcoal) */}
      <footer className="footer">
        <div className="app-container footer-inner">
          <div className="footer-col brand-col">
            <a
              className="inline-flex items-center gap-2.5 transition-transform hover:-translate-y-px flex-none mb-3"
              href="/"
              onClick={(e) => {
                e.preventDefault()
                playSound('click')
                navigate('/')
              }}
            >
              <PixelLogo small light />
              <span className="font-[family-name:var(--font-display)] font-bold text-[22px] tracking-[-0.02em] text-white">
                pojok<span className="font-medium">pixel</span><i className="not-italic text-[#e65416]">.</i>
              </span>
            </a>
            <p className="footer-tagline">
              POJOK PIXEL COMPANY · Marketplace kurasi aset &amp; template digital siap pakai untuk pelajar, kreator, UMKM, dan desainer Indonesia.
            </p>
            <div className="flex flex-col gap-1.5 font-mono text-[11px] text-[#a8a9a2] mb-4">
              <a href="mailto:teampojokpixel@gmail.com" className="hover:text-[#e65416] transition-colors inline-flex items-center gap-1.5">
                <span>📧</span> <span>teampojokpixel@gmail.com</span>
              </a>
              <a href="https://wa.me/6285709328807" target="_blank" rel="noopener noreferrer" className="hover:text-[#e65416] transition-colors inline-flex items-center gap-1.5">
                <span>💬</span> <span>WA: 0857-0932-8807</span>
              </a>
            </div>
            <div className="footer-creator-credit">
              <span className="footer-creator-credit-label">Tim Pengembang &amp; Kurator:</span>
              <div className="footer-creator-list">
                <div className="footer-creator-item">
                  <span className="footer-creator-avatar">AM</span>
                  <strong className="footer-creator-name">Ardhian Maulana Tanjung</strong>
                  <span className="footer-creator-role">CEO &amp; Backend</span>
                </div>
                <div className="footer-creator-item">
                  <span className="footer-creator-avatar">AR</span>
                  <strong className="footer-creator-name">Aulia Ryansifa Wardah</strong>
                  <span className="footer-creator-role">CTO &amp; Frontend</span>
                </div>
                <div className="footer-creator-item">
                  <span className="footer-creator-avatar">KS</span>
                  <strong className="footer-creator-name">Khoirunnisa Salsabila Osmon</strong>
                  <span className="footer-creator-role">Product Manager</span>
                </div>
              </div>
            </div>
          </div>

          <div className="footer-col">
            <h4>Navigasi Halaman</h4>
            <ul>
              <li><a href="/" onClick={(e) => { e.preventDefault(); playSound('click'); navigate('/') }}>Beranda</a></li>
              <li><a href="/katalog" onClick={(e) => { e.preventDefault(); playSound('click'); navigate('/katalog') }}>Katalog Produk</a></li>
              <li><a href="/riwayat" onClick={(e) => { e.preventDefault(); playSound('click'); navigate('/riwayat') }}>Riwayat Pembelian &amp; Unduh</a></li>
              <li><a href="/kreator" onClick={(e) => { e.preventDefault(); playSound('click'); navigate('/kreator') }}>{isCreator ? 'Area & Lapak Kreator' : 'Daftar Jadi Kreator'}</a></li>
              <li><a href="/tentang" onClick={(e) => { e.preventDefault(); playSound('click'); navigate('/tentang') }}>Tentang &amp; Tim</a></li>
              <li><a href="/faq" onClick={(e) => { e.preventDefault(); playSound('click'); navigate('/faq') }}>Pusat Bantuan / FAQ</a></li>
            </ul>
          </div>

          <div className="footer-col">
            <h4>Kategori Produk</h4>
            <ul>
              <li><a href="/katalog?cat=Template+Website" onClick={(e) => { e.preventDefault(); playSound('click'); navigate('/katalog?cat=Template+Website') }}>Template Website</a></li>
              <li><a href="/katalog?cat=Template+Poster" onClick={(e) => { e.preventDefault(); playSound('click'); navigate('/katalog?cat=Template+Poster') }}>Template Poster Digital</a></li>
              <li><a href="/katalog?cat=Pembelajaran+Digital" onClick={(e) => { e.preventDefault(); playSound('click'); navigate('/katalog?cat=Pembelajaran+Digital') }}>Pembelajaran Digital</a></li>
              <li><a href="/katalog?cat=Bundel+Produk" onClick={(e) => { e.preventDefault(); playSound('click'); navigate('/katalog?cat=Bundel+Produk') }}>Bundel Produk (Hemat)</a></li>
              <li><a href="/katalog?cat=Gratis+(Rp+0)" onClick={(e) => { e.preventDefault(); playSound('click'); navigate('/katalog?cat=Gratis+(Rp+0)') }}>Aset Gratis (Rp 0)</a></li>
            </ul>
          </div>

          <div className="footer-col">
            <h4>Sebelum membeli</h4>
            <ul>
              <li>
                <span className="guarantee-text">
                  <Icon name="zap" size={14} /> <span>Format tercantum di halaman produk</span>
                </span>
              </li>
              <li>
                <span className="guarantee-text">
                  <Icon name="shield" size={14} /> <span>Baca catatan penggunaan produk</span>
                </span>
              </li>
              <li>
                <span className="guarantee-text">
                  <Icon name="refresh" size={14} /> <span>Periksa detail sebelum membeli</span>
                </span>
              </li>
              <li>
                <span className="guarantee-text">
                  <Icon name="check" size={14} /> <span>Butuh bantuan? Hubungi tim kami</span>
                </span>
              </li>
            </ul>
          </div>
        </div>

        <div className="footer-bottom">
          <div className="app-container footer-bottom-inner">
            <span style={{ color: '#a8a9a2' }}>© 2026 Pojok Pixel · Hak Cipta Dilindungi · Dibuat di Indonesia</span>
            <span style={{ color: '#a8a9a2' }}>Template Website · Poster Digital · Pembelajaran Desain</span>
          </div>
        </div>
      </footer>

      {/* Floating Back to Top Button */}
      {showBackToTop && (
        <button
          type="button"
          className="fixed bottom-20 right-5 w-10 h-10 rounded-full bg-[#303236] text-white shadow-lg z-50 grid place-items-center text-lg hover:bg-[#e65416] transition-colors md:bottom-6"
          onClick={() => {
            window.scrollTo({ top: 0, behavior: 'smooth' })
            playSound('click')
          }}
          aria-label="Kembali ke atas"
          title="Kembali ke atas"
        >
          ↑
        </button>
      )}

      {/* Quick View Modal */}
      {quickViewProduct && (
        <div
          className="fixed inset-0 bg-[rgba(48,50,54,0.6)] backdrop-blur-[6px] z-[70] flex items-center justify-center p-4 overflow-y-auto"
          onClick={() => setQuickViewProduct(null)}
          role="dialog"
          aria-modal="true"
        >
          <div className="quickview-card" onClick={(e) => e.stopPropagation()}>
            <div className="modal-drag-indicator" />
            <button
              type="button"
              className="quickview-close-btn"
              onClick={() => setQuickViewProduct(null)}
              aria-label="Tutup modal"
            >
              ×
            </button>

            <div className="quickview-image-col">
              <div className="quickview-image-box">
                <img
                  src={getProductImageUrl(quickViewProduct.img)}
                  alt={quickViewProduct.name}
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'contain',
                    display: 'block',
                    background: '#f5f4ef',
                  }}
                />
              </div>
            </div>

            <div className="quickview-details-col">
              <div>
                <div className="quickview-tag-row">
                  <span className="product-category">{quickViewProduct.category}</span>
                  <span className="tab-badge">{quickViewProduct.tag}</span>
                </div>
                <h3 className="quickview-title">{quickViewProduct.name}</h3>

                <p className="quickview-desc">{quickViewProduct.shortDesc}</p>

                <div className="mb-4">
                  <span className="text-xs font-mono text-stone-500 block mb-2">Format File Disertakan:</span>
                  <div className="flex gap-2 flex-wrap">
                    {quickViewProduct.formats.map((f) => (
                      <span key={f} className="text-xs font-mono px-2.5 py-1 bg-stone-100 border border-stone-200 rounded-md">
                        {f}
                      </span>
                    ))}
                  </div>
                </div>

                <span className="text-xs font-mono text-stone-500 block mb-2">Yang Kamu Dapatkan:</span>
                <ul className="quickview-checklist">
                  {quickViewProduct.includes.map((item, idx) => (
                    <li key={idx}>
                      <Icon name="check" size={14} />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="quickview-footer">
                <div className="quickview-price">
                  <span>Harga Akses:</span>
                  <div className="flex items-center gap-2">
                    {quickViewProduct.originalPrice > quickViewProduct.price && (
                      <span className="product-strikethrough-price">{rupiah(quickViewProduct.originalPrice)}</span>
                    )}
                    <strong>{rupiah(quickViewProduct.price)}</strong>
                  </div>
                </div>
                <div className="flex gap-3">
                  <button
                    type="button"
                    className="button button-secondary"
                    onClick={() => {
                      toggleFavorite(quickViewProduct.id)
                    }}
                  >
                    <Icon name="heart" size={16} className={favorites.includes(quickViewProduct.id) ? 'text-pixel-orange fill-pixel-orange' : ''} />
                    <span>Favorit</span>
                  </button>
                  <button
                    type="button"
                    className="button button-dark"
                    onClick={() => {
                      addToCart(quickViewProduct)
                      setQuickViewProduct(null)
                    }}
                  >
                    <Icon name="bag" size={16} />
                    <span>Beli Sekarang</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Slide-Over Cart Drawer */}
      {isCartOpen && (
        <>
          <div className="cart-drawer-overlay" onClick={() => setIsCartOpen(false)} />
          <aside className="cart-drawer" role="dialog" aria-modal="true">
            <div className="cart-drawer-header">
              <div className="flex items-center gap-2">
                <Icon name="bag" size={20} className="text-pixel-orange" />
                <h3 className="font-display font-bold text-lg">Keranjang Belanja</h3>
                <span className="text-xs font-mono px-2 py-0.5 bg-stone-200 rounded-full font-bold">
                  {cartTotalCount}
                </span>
              </div>
              <button
                type="button"
                className="icon-button"
                onClick={() => setIsCartOpen(false)}
                aria-label="Tutup keranjang"
              >
                <Icon name="close" size={20} />
              </button>
            </div>

            <div className="cart-drawer-body">
              {cartItems.length === 0 ? (
                <div className="cart-empty-state">
                  <div className="cart-empty-icon">
                    <Icon name="bag" size={36} />
                  </div>
                  <h4>Keranjangmu masih kosong</h4>
                  <p>Temukan template website, paket poster, dan kelas desain favoritmu di katalog.</p>
                  <button
                    type="button"
                    className="button button-dark mt-4"
                    onClick={() => {
                      setIsCartOpen(false)
                      navigate('/katalog')
                    }}
                  >
                    Mulai Belanja di Katalog
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  {cartItems.map((item) => (
                    <div className="cart-item-card" key={item.product.id}>
                      <img
                        src={getProductImageUrl(item.product.img)}
                        alt=""
                        className="cart-item-thumb"
                        onError={(event) => {
                          event.currentTarget.onerror = null
                          event.currentTarget.src = '/pojokpixel-cube-crop.png'
                        }}
                      />
                      <div className="cart-item-details">
                        <span className="cart-item-category">{item.product.category}</span>
                        <h4 className="cart-item-title">{item.product.name}</h4>
                        <strong className="cart-item-price">{rupiah(item.product.price)}</strong>
                      </div>
                      <div className="cart-item-controls">
                        <div className="qty-picker">
                          <button
                            type="button"
                            onClick={() => updateQuantity(item.product.id, -1)}
                            aria-label="Kurangi jumlah"
                          >
                            <Icon name="minus" size={12} />
                          </button>
                          <span>{item.quantity}</span>
                          <button
                            type="button"
                            onClick={() => updateQuantity(item.product.id, 1)}
                            aria-label="Tambah jumlah"
                          >
                            <Icon name="plus" size={12} />
                          </button>
                        </div>
                        <button
                          type="button"
                          className="cart-item-remove-btn"
                          onClick={() => removeFromCart(item.product.id)}
                          aria-label={`Hapus ${item.product.name}`}
                          title="Hapus dari keranjang"
                        >
                          <Icon name="trash" size={14} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {cartItems.length > 0 && (
              <div className="cart-drawer-footer">
                <div className="coupon-box">
                  <input
                    type="text"
                    placeholder="Kode kupon: PIXELHEMAT"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value)}
                    disabled={couponApplied}
                    className="coupon-input"
                  />
                  <button
                    type="button"
                    onClick={applyCoupon}
                    disabled={couponApplied || !couponCode}
                    className="coupon-apply-btn"
                  >
                    {couponApplied ? 'Terpasang' : 'Terapkan'}
                  </button>
                </div>

                <div className="cart-summary-lines">
                  <div className="summary-line">
                    <span>Subtotal:</span>
                    <strong>{rupiah(cartSubtotal)}</strong>
                  </div>
                  {couponApplied && (
                    <div className="summary-line text-emerald-600">
                      <span>Diskon Kupon (15%):</span>
                      <strong>- {rupiah(discountAmount)}</strong>
                    </div>
                  )}
                  <div className="summary-line total-line">
                    <span>Total Pembayaran:</span>
                    <strong className="text-pixel-orange text-lg">{rupiah(finalTotal)}</strong>
                  </div>
                </div>

                <button
                  type="button"
                  className="button button-dark w-full justify-center"
                  onClick={handleProceedCheckout}
                >
                  <span>Lanjut ke Pembayaran ({rupiah(finalTotal)})</span>
                  <Icon name="arrow" size={16} />
                </button>
                <span className="text-[10px] font-mono text-center block text-stone-500 mt-2">
                  🔒 Pembayaran aman QRIS, Virtual Account, & Kartu Debit
                </span>
              </div>
            )}
          </aside>
        </>
      )}

      {/* Checkout Simulator Modal */}
      {isCheckoutOpen && (
        <div
          className="fixed inset-0 bg-[rgba(48,50,54,0.6)] backdrop-blur-[6px] z-[70] flex items-center justify-center p-4 overflow-y-auto"
          onClick={() => setIsCheckoutOpen(false)}
          role="dialog"
          aria-modal="true"
        >
          <div className={`checkout-card ${checkoutStep === 'success' ? 'checkout-card-success' : ''}`} onClick={(e) => e.stopPropagation()}>
            <div className="modal-drag-indicator" />
            <button
              type="button"
              className="quickview-close-btn"
              onClick={() => setIsCheckoutOpen(false)}
              aria-label="Tutup pembayaran"
            >
              ×
            </button>

            {checkoutStep === 'method' && (
              <div>
                <span className="text-xs font-mono font-bold text-pixel-orange tracking-widest uppercase">SIMULASI TRANSAKSI</span>
                <h3 className="text-xl font-bold font-display mt-1 mb-4" style={{ letterSpacing: '-0.02em', color: '#303236' }}>Pilih Cara Pembayaran</h3>

                <div className="space-y-3 mb-6">
                  <label
                    className={`payment-method-option ${paymentMethod === 'qris' ? 'is-selected' : ''}`}
                    onClick={() => setPaymentMethod('qris')}
                  >
                    <input
                      type="radio"
                      name="pay"
                      checked={paymentMethod === 'qris'}
                      onChange={() => setPaymentMethod('qris')}
                    />
                    <div>
                      <strong className="payment-method-title">QRIS (Semua E-Wallet & Bank)</strong>
                      <span className="payment-method-desc">Scan instan via GoPay, OVO, Dana, ShopeePay, BCA</span>
                    </div>
                  </label>

                  <label
                    className={`payment-method-option ${paymentMethod === 'bca' ? 'is-selected' : ''}`}
                    onClick={() => setPaymentMethod('bca')}
                  >
                    <input
                      type="radio"
                      name="pay"
                      checked={paymentMethod === 'bca'}
                      onChange={() => setPaymentMethod('bca')}
                    />
                    <div>
                      <strong className="payment-method-title">Virtual Account Bank Otomatis</strong>
                      <span className="payment-method-desc">BCA, Mandiri, BNI, BRI tanpa perlu upload bukti transfer</span>
                    </div>
                  </label>

                  <label
                    className={`payment-method-option ${paymentMethod === 'cc' ? 'is-selected' : ''}`}
                    onClick={() => setPaymentMethod('cc')}
                  >
                    <input
                      type="radio"
                      name="pay"
                      checked={paymentMethod === 'cc'}
                      onChange={() => setPaymentMethod('cc')}
                    />
                    <div>
                      <strong className="payment-method-title">Kartu Kredit / Debit Online</strong>
                      <span className="payment-method-desc">Visa, Mastercard dengan proteksi 3D Secure</span>
                    </div>
                  </label>
                </div>

                <div className="checkout-total-box">
                  <span>Total yang Harus Dibayar:</span>
                  <strong className="checkout-total-amount">{rupiah(finalTotal)}</strong>
                </div>

                <button
                  type="button"
                  className="button button-dark w-full justify-center"
                  style={{ height: 48, fontSize: 14 }}
                  onClick={handleConfirmPayment}
                >
                  <span>Konfirmasi & Bayar Sekarang</span>
                  <Icon name="check" size={16} />
                </button>
              </div>
            )}

            {checkoutStep === 'processing' && (
              <div className="py-12 text-center flex flex-col items-center">
                <div className="w-12 h-12 rounded-full border-3 border-stone-200 border-t-pixel-orange animate-spin mb-4" />
                <h4 className="text-base font-bold font-display">Memproses Transaksi...</h4>
                <p className="text-xs text-stone-500 mt-1">Menghubungkan ke gateway pembayaran Pojok Pixel.</p>
              </div>
            )}

            {checkoutStep === 'qris' && (
              <div className="text-center">
                <span className="text-xs font-mono font-bold text-pixel-orange tracking-widest uppercase">SIMULASI QRIS</span>
                <h3 className="text-xl font-bold font-display mt-1 mb-1" style={{ color: '#303236' }}>Selesaikan pembayaran</h3>
                <p className="text-sm text-stone-600 mb-3">Pesanan <strong>{activeOrderId}</strong> · Total <strong>{rupiah(finalTotal)}</strong></p>
                <div className="mx-auto mb-3 rounded-2xl border border-amber-300 bg-amber-50 p-3 text-left text-xs leading-relaxed text-amber-950">
                  <strong>Mode demo — jangan scan atau transfer.</strong> QR pada gambar milik NEKOMA, SALON &amp; KECANTIKAN, bukan PojokPixel. Gambar sengaja diburamkan dan tidak dapat dipakai membayar.
                </div>
                <div className="relative mx-auto mb-3 w-full max-w-[220px] overflow-hidden rounded-xl border border-stone-200 bg-white">
                  <img src="/demo-qris.jpg" alt="Contoh QRIS demo, bukan untuk pembayaran" className="block aspect-[9/16] w-full object-contain" style={{ filter: 'blur(9px)', pointerEvents: 'none', userSelect: 'none' }} />
                  <span className="absolute inset-0 flex items-center justify-center bg-white/55 px-6 text-lg font-black tracking-widest text-red-700">DEMO<br/>JANGAN SCAN</span>
                </div>
                <div className="mb-4 rounded-xl bg-stone-100 px-4 py-2">
                  <span className="block text-xs text-stone-600">Pesanan otomatis dibatalkan dalam</span>
                  <strong className="font-mono text-2xl tabular-nums text-[#303236]">{String(Math.floor(qrisSecondsLeft / 60)).padStart(2, '0')}:{String(qrisSecondsLeft % 60).padStart(2, '0')}</strong>
                </div>
                <button type="button" className="button button-dark w-full justify-center" style={{ height: 46 }} onClick={finishQrisPayment}>
                  Simulasikan pembayaran berhasil <Icon name="check" size={16} />
                </button>
                <p className="mt-2 text-[11px] text-stone-500">Tombol ini hanya menguji alur aplikasi, tidak memverifikasi pembayaran nyata.</p>
              </div>
            )}

            {checkoutStep === 'expired' && (
              <div className="py-8 text-center">
                <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-red-100 text-2xl text-red-700">×</div>
                <h3 className="text-xl font-bold font-display text-[#303236]">Waktu pembayaran habis</h3>
                <p className="mt-2 text-sm text-stone-600">Pesanan <strong>{activeOrderId}</strong> sudah dibatalkan otomatis. Silakan buat checkout baru untuk mencoba lagi.</p>
                <button type="button" className="button button-dark mt-5 w-full justify-center" onClick={() => { setIsCheckoutOpen(false); setCheckoutStep('method') }}>Kembali ke keranjang</button>
              </div>
            )}

            {checkoutStep === 'success' && (
              <div className="checkout-success-view">
                <div className="checkout-success-icon-badge">✓</div>
                <h3 className="checkout-success-title">{paymentMethod === 'qris' ? 'Simulasi Pembayaran Berhasil' : 'Pembayaran Berhasil!'}</h3>
                <span className="checkout-order-number">
                  No. Pesanan: #{activeOrderId || 'PP'} • Status: {paymentMethod === 'qris' ? 'Simulasi Selesai' : 'Lunas'}
                </span>
                <p className="checkout-success-desc">
                  Status pesananmu tercatat. Kartu di bawah menampilkan file atau tautan akses yang disediakan untuk setiap produk.
                </p>

                {/* Daftar Berkas Digital yang Dibeli */}
                <div className="checkout-delivery-list">
                  {lastPurchasedProducts.length > 0 ? (
                    lastPurchasedProducts.map((p) => (
                      <div key={p.id} className="checkout-delivery-card">
                        <div className="delivery-card-top">
                          <div
                            className="delivery-card-thumb"
                            style={{ backgroundImage: `url(${getProductImageUrl(p.img)})` }}
                          />
                          <div className="delivery-card-info">
                            <span className="delivery-card-cat">{p.category}</span>
                            <h4 className="delivery-card-name">{p.name}</h4>
                          </div>
                        </div>

                        <div className="delivery-card-actions">
                          {/* 1. Tombol Unduh Berkas Asli */}
                          {p.fileAttachment?.fileData?.startsWith('data:') && <button
                            type="button"
                            className="button button-orange delivery-download-btn"
                            onClick={() => handleDownloadAsset(p)}
                          >
                            <Icon name="download" size={15} />
                            <span>
                              Unduh berkas {p.fileAttachment.fileName ? `: ${p.fileAttachment.fileName}` : 'digital'}
                              {p.fileAttachment?.fileSize ? ` (${p.fileAttachment.fileSize})` : ''}
                            </span>
                          </button>}
                          {!p.fileAttachment?.fileData?.startsWith('data:') && !isValidAccessUrl(p.accessUrl) && (
                            <p className="delivery-card-note">Berkas belum tersedia. Hubungi kreator untuk meminta file produk ini.</p>
                          )}

                          {/* 2. Tombol Link Cloud Akses jika kreator melampirkan link */}
                          {isValidAccessUrl(p.accessUrl) && (
                            <a
                              href={p.accessUrl.trim()}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="button button-outline delivery-link-btn"
                              onClick={() => playSound('click')}
                            >
                              <span>🔗 Buka Template di Cloud / Google Drive</span>
                              <span aria-hidden="true">↗</span>
                            </a>
                          )}
                        </div>

                        {/* 3. Catatan / Petunjuk / Password Kreator jika ada */}
                        {p.buyerNote && (
                          <div className="delivery-buyer-note">
                            <strong>💡 Catatan & Panduan dari Kreator:</strong>
                            <p>{p.buyerNote}</p>
                          </div>
                        )}
                      </div>
                    ))
                  ) : (
                    <div className="checkout-delivery-card">
                      <div className="delivery-card-actions">
                        <button
                          type="button"
                          className="button button-orange delivery-download-btn w-full justify-center"
                          onClick={() => notify('Mengunduh paket file digital resmi PojokPixel...')}
                        >
                          <Icon name="download" size={15} /> Unduh Paket File Digital
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                <div className="checkout-success-footer">
                  {lastPurchasedProducts.length > 1 && (
                    <button
                      type="button"
                      className="button button-dark w-full justify-center"
                      style={{ height: 44, marginBottom: 8 }}
                      onClick={() => {
                        lastPurchasedProducts.forEach((p, i) => {
                          setTimeout(() => handleDownloadAsset(p), i * 350)
                        })
                      }}
                    >
                      <Icon name="download" size={15} /> Unduh Semua Berkas Sekaligus ({lastPurchasedProducts.length} File)
                    </button>
                  )}
                  <button
                    type="button"
                    className="button button-orange w-full justify-center"
                    style={{ height: 44, marginBottom: 8 }}
                    onClick={() => {
                      playSound('click')
                      setIsCheckoutOpen(false)
                      navigate('/riwayat')
                    }}
                  >
                    📦 Lihat di Riwayat Pembelian & Unduh Kapan Saja →
                  </button>
                  <button
                    type="button"
                    className="button button-secondary w-full justify-center"
                    style={{ height: 42 }}
                    onClick={() => setIsCheckoutOpen(false)}
                  >
                    Selesai & Kembali ke Beranda
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Floating System Toast */}
      {authNotice ? (
        <div className="auth-welcome-popup" role="status" aria-live="polite">
          <span className="welcome-popup-mark">✓</span>
          <span className="welcome-popup-copy">
            <strong>{authNotice.title}</strong>
            <span>{authNotice.message}</span>
          </span>
          <button type="button" aria-label="Tutup notifikasi" onClick={() => setAuthNotice(null)}>
            ×
          </button>
        </div>
      ) : toast ? (
        <div className="toast" role="status" aria-live="polite">
          <span className="toast-icon">{toast.icon || '✓'}</span>
          <span>{toast.message}</span>
        </div>
      ) : null}
      {authDialogMode && (
        <AuthDialog
          mode={authDialogMode}
          onClose={() => setAuthDialogMode(null)}
          onModeChange={setAuthDialogMode}
        />
      )}
    </>
  )
}
