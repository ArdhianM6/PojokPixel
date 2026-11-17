export interface ProductFileAttachment {
  fileName: string
  fileSize: string
  fileType: string
  fileData?: string
}

export interface Product {
  id: string
  name: string
  category: 'Template Website' | 'Template Poster' | 'Pembelajaran Digital' | 'Bundel Produk'
  price: number
  originalPrice: number
  label: string
  bg: string
  img: string
  galleryImages?: string[]
  tag: string
  rating: number
  reviewsCount: number
  salesCount: number
  shortDesc: string
  formats: string[]
  includes: string[]
  deliveryType?: 'file' | 'link' | 'both'
  fileAttachment?: ProductFileAttachment
  accessUrl?: string
  buyerNote?: string
  videoUrl?: string
}

export function isValidAccessUrl(accessUrl?: string): accessUrl is string {
  if (!accessUrl?.trim()) return false
  try {
    const url = new URL(accessUrl.trim())
    if (url.protocol !== 'https:' && url.protocol !== 'http:') return false
    const pathParts = url.pathname.toLowerCase().split('/').filter(Boolean)
    return !url.hostname.toLowerCase().split('.').some((part) => part === 'example' || part.startsWith('example-'))
      && !pathParts.some((part) => part === 'example' || part.startsWith('example-'))
  } catch {
    return false
  }
}

export const products: Product[] = [
  {
    id: 'folio',
    name: 'Folio — Minimalist Portfolio Kit',
    category: 'Template Website',
    price: 0,
    originalPrice: 49000,
    label: 'Gratis',
    bg: 'folio',
    img: 'photo-1460925895917-afdab827c52f',
    tag: 'Paling Populer',
    rating: 4.9,
    reviewsCount: 48,
    salesCount: 380,
    shortDesc: 'Template portofolio minimalis untuk desainer, fotografer, & developer. Dilengkapi sistem Auto-Layout rapi di Figma dan kode HTML/Tailwind siap pakai.',
    formats: ['Figma (.fig)', 'HTML5', 'Tailwind CSS v4'],
    includes: [
      '10+ Varian Komponen Siap Pakai',
      'Auto-Layout & Variabel Figma Rapi',
      'Kode Bersih, Responsif & Cepat',
      'Dokumentasi Panduan Setup',
      'Lisensi Personal & Komersial Penuh',
    ],
    deliveryType: 'both',
    fileAttachment: {
      fileName: 'Folio-Minimalist-Portfolio-Kit.fig',
      fileSize: '14.8 MB',
      fileType: 'application/octet-stream',
    },
    accessUrl: 'https://www.figma.com/community/file/example-folio-template',
    buyerNote: 'Berkas .fig siap di-duplicate ke Figma draft Anda. Kode HTML5 & Tailwind CSS sudah tersemat di dalamnya.',
  },
  {
    id: 'sundae',
    name: 'Sunday Sundae Social Pack',
    category: 'Template Poster',
    price: 39000,
    originalPrice: 59000,
    label: 'Terlaris',
    bg: 'sundae',
    img: 'photo-1490481651871-ab68de25d43d',
    tag: '12 Template',
    rating: 5.0,
    reviewsCount: 62,
    salesCount: 240,
    shortDesc: 'Paket poster digital bergaya editorial retro-hangat untuk feed & story Instagram, promosi produk kreatif, dan poster event pameran seni.',
    formats: ['Canva Link', 'Photoshop PSD', 'PDF 300 DPI'],
    includes: [
      '12 Template Desain Resolusi Tinggi',
      'Palet Warna & Tipografi Khusus',
      'Format Siap Cetak A3/A4 (300 DPI)',
      'Mudah Diedit via Canva Gratis',
      'Lisensi Komersial Klien',
    ],
    deliveryType: 'both',
    fileAttachment: {
      fileName: 'Sunday-Sundae-Social-Pack.zip',
      fileSize: '32.6 MB',
      fileType: 'application/zip',
    },
    accessUrl: 'https://www.canva.com/template/example-sunday-sundae',
    buyerNote: 'Buka link Canva untuk edit online seketika atau ekstrak berkas ZIP untuk aset PSD & PDF 300 DPI.',
  },
  {
    id: 'study',
    name: 'Belajar Design dari Nol',
    category: 'Pembelajaran Digital',
    price: 59000,
    originalPrice: 89000,
    label: 'Diskon 30%',
    bg: 'study',
    img: 'photo-1455390582262-044cdead277a',
    tag: 'Video + Workbook',
    rating: 4.8,
    reviewsCount: 34,
    salesCount: 165,
    shortDesc: 'Modul video praktis dan workbook interaktif untuk memahami prinsip dasar grid, tipografi, psikologi warna, dan hierarki visual digital modern.',
    formats: ['Video HD Streaming', 'PDF Workbook', 'Latihan Figma'],
    includes: [
      '8 Modul Video Pembelajaran Mandiri',
      'Workbook Latihan Desain Interaktif',
      'Cheatsheet Grid & Hierarki Typo',
      'Akses Selamanya & Pembaruan Materi',
      'Akses Komunitas Belajar Pojok Pixel',
    ],
  },
  {
    id: 'nara',
    name: 'Nara — Modern Landing Page Kit',
    category: 'Template Website',
    price: 79000,
    originalPrice: 119000,
    label: 'Rekomendasi',
    bg: 'nara',
    img: 'photo-1498050108023-c5249f4df085',
    tag: 'Figma + React',
    rating: 4.9,
    reviewsCount: 52,
    salesCount: 115,
    shortDesc: 'Landing page modern dengan tipografi berkarakter kuat, animasi micro-interaction elegan, dan struktur konversi tinggi untuk agensi & startup.',
    formats: ['Figma Auto-Layout', 'React 19', 'Tailwind CSS'],
    includes: [
      'Desain Responsif Desktop, Tablet & Mobile',
      'Navigasi, FAQ Accordion & Form Kontak',
      'Kompatibel dengan Next.js / Vite',
      'Font Google Fonts Bebas Lisensi',
      'Akses Update Gratis Selamanya',
    ],
  },
  {
    id: 'flora',
    name: 'Flora Market Poster Collection',
    category: 'Template Poster',
    price: 29000,
    originalPrice: 45000,
    label: 'Hemat',
    bg: 'flora',
    img: 'photo-1490750967868-88aa4486c946',
    tag: '8 Desain',
    rating: 4.7,
    reviewsCount: 28,
    salesCount: 92,
    shortDesc: 'Koleksi 8 poster digital bertema botani dan pasar seni lokal dengan tekstur kertas organik yang siap dicetak dan mempercantik dinding ruang.',
    formats: ['Canva Link', 'Adobe Illustrator', 'PNG 300 DPI'],
    includes: [
      '8 File Poster Vector & Raster',
      'Tekstur Paper Overlay Estetik',
      'Ukuran Standar Frame (A3, A4, 4:5)',
      'Teks & Warna Bebas Kustomisasi',
      'Hak Pakai Komersial & Cetak',
    ],
  },
  {
    id: 'class',
    name: 'Mini Class: Desain Canva Rapi & Estetik',
    category: 'Pembelajaran Digital',
    price: 0,
    originalPrice: 35000,
    label: 'Gratis',
    bg: 'class',
    img: 'photo-1516321318423-f06f85e504b3',
    tag: 'Kelas 25 Menit',
    rating: 4.9,
    reviewsCount: 88,
    salesCount: 640,
    shortDesc: 'Kelas mini 25 menit yang mengupas rahasia membuat desain promosi rapi, berjarak proporsional, dan bernilai jual hanya dengan akun Canva gratis.',
    formats: ['Video Streaming HD', 'Checklist PDF'],
    includes: [
      'Video Tutorial Step-by-Step 25 Menit',
      '5 Kesalahan Umum Canva & Cara Atasinya',
      'Daftar Keyword Elemen Rahasia Estetik',
      'Akses Instan Tanpa Batas Waktu',
      'Sertifikat Penyelesaian Digital',
    ],
  },
  {
    id: 'creator-pack',
    name: 'All-in-One Creator & UMKM Launch Pack',
    category: 'Bundel Produk',
    price: 149000,
    originalPrice: 249000,
    label: 'Bundel Hemat',
    bg: 'nara',
    img: 'photo-1498050108023-c5249f4df085',
    tag: 'Paket Bundel 4-in-1',
    rating: 5.0,
    reviewsCount: 32,
    salesCount: 195,
    shortDesc: 'Paket bundling komprehensif berisi Template Website Landing Page responsif, 15+ Template Poster Promosi Canva, dan E-Book Panduan Desain Konversi UMKM.',
    formats: ['Figma (.fig)', 'HTML5 / Tailwind', 'Canva Link', 'PDF Guide'],
    includes: [
      'Template Landing Page Portfolio & Usaha',
      '15+ Varian Poster Feed & Story Canva HD',
      'E-Book & Cheatsheet Brand Visual UMKM',
      'Lisensi Komersial Lengkap Semua Aset',
      'Akses Update Berkas Seumur Hidup',
    ],
    deliveryType: 'both',
    fileAttachment: {
      fileName: 'PojokPixel-All-In-One-Launch-Pack.zip',
      fileSize: '48.2 MB',
      fileType: 'application/zip',
    },
    accessUrl: 'https://www.figma.com/community/file/example-creator-bundle',
    buyerNote: 'Selamat! Kamu mendapatkan akses lengkap ke seluruh template website, poster, dan materi belajar dalam 1 paket bundel.',
  },
]

// Produk Unggulan untuk Beranda (Non-Gratis atau Best Seller / Rekomendasi)
export const featuredProducts: Product[] = products.filter(p => p.price > 0)

// Produk Gratis (Rp 0) untuk Beranda
export const freeProducts: Product[] = products.filter(p => p.price === 0)

export const categories = [
  'Semua',
  'Template Website',
  'Template Poster',
  'Pembelajaran Digital',
  'Bundel Produk',
  'Gratis (Rp 0)',
  'Favorit Saya',
]

// EXACT 3 TEAM MEMBERS (Sesuai Proposal Bisnis Resmi 2026):
export const team = [
  {
    name: 'Ardhian Maulana Tanjung',
    role: 'CEO & Backend Lead',
    desc: 'Memimpin visi dan arah produk, validasi pasar, arsitektur Backend & API Hono, prioritas fitur dan koordinasi tim, serta riset produk pengguna (Product Researcher).',
    initial: 'AM',
    photo: '/team/ardhian-profile.jpeg',
    badge: 'CEO',
    skills: ['Arah Produk', 'Backend & API', 'Hono & Drizzle', 'PostgreSQL', 'Product Research', 'Validasi Pasar'],
  },
  {
    name: 'Aulia Ryansifa Wardah',
    role: 'CTO & Frontend Lead',
    desc: 'Memimpin arsitektur teknologi platform, rekayasa frontend interaktif React 19, antarmuka pengguna, deployment server VPS, dan pemeliharaan sistem (Sysadmin).',
    initial: 'AR',
    photo: '/team/aulia-ryansifa-wardah-profile.jpeg',
    badge: 'CTO',
    skills: ['React 19', 'Tailwind CSS', 'Vite & TypeScript', 'Sysadmin & VPS', 'Deployment & CI/CD'],
  },
  {
    name: 'Khoirunnisa Salsabila Osmon',
    role: 'Product Manager & Head of Curation',
    desc: 'Pengelolaan katalog dan kurasi mutu aset/materi, riset kebutuhan pengguna (User Researcher), strategi pemasaran (Marketing), serta pengujian kualitas produk (Tester).',
    initial: 'KS',
    photo: '/team/khoirunnisa-profile.jpeg',
    badge: 'PM',
    skills: ['Product Management', 'Kurasi Mutu Aset', 'User Research', 'Marketing & Kampanye', 'Quality Testing'],
  },
]

export const companyInfo = {
  name: 'POJOK PIXEL COMPANY',
  brandName: 'PojokPixel',
  email: 'teampojokpixel@gmail.com',
  whatsapp: '0857-0932-8807',
  whatsappUrl: 'https://wa.me/6285709328807',
  website: 'www.pojokpixel.com',
  address: 'Indonesia',
  creatorRevenueShare: '80%',
  platformFee: '20%',
}

export const reviews = [
  {
    name: 'Rian Prasetyo',
    role: 'Freelance Web Designer',
    avatar: 'RP',
    rating: 5,
    text: 'Template Folio dari Pojok Pixel rapi banget! Auto-Layout di Figmanya profesional, klien saya langsung setuju dalam sekali presentasi.',
  },
  {
    name: 'Dinda Larasati',
    role: 'Pemilik Toko Online & Kreator',
    avatar: 'DL',
    rating: 5,
    text: 'Sunday Sundae Social Pack bener-bener hemat waktu tim marketing kami. Tinggal ganti teks di Canva, estetika feed langsung naik kelas.',
  },
  {
    name: 'Bagus Wicaksono',
    role: 'Mahasiswa Desain Grafis',
    avatar: 'BW',
    rating: 5,
    text: 'Modul Belajar Design dari Nol praktis dan to the point. Prinsip grid dan hierarki tipografinya langsung terpakai di proyek nyata saya.',
  },
]

export const faqs = [
  {
    q: 'Bagaimana alur transaksi dan pengunduhan di Marketplace Pojok Pixel?',
    a: 'Setelah transaksi selesai (atau memilih produk gratis), file digital langsung dapat diunduh seketika dari layar konfirmasi dan link akses permanen otomatis dikirimkan ke email terdaftarmu. File dapat diunduh kapan saja tanpa batas waktu.',
  },
  {
    q: 'Apakah produk di Pojok Pixel boleh digunakan untuk proyek komersial klien?',
    a: 'Boleh! Semua produk digital Pojok Pixel dilengkapi lisensi komersial dan personal penuh. Kamu bebas memakainya untuk website klien, materi promosi UMKM, feed jualan, maupun portofolio pribadi (tidak boleh dijual ulang sebagai template mentah).',
  },
  {
    q: 'Aplikasi dan format apa saja yang didukung oleh aset digital di sini?',
    a: 'Setiap karya mencantumkan formatnya dengan transparan: Template Website menggunakan Figma (.fig) & HTML/Tailwind; Template Poster menggunakan Canva link & Adobe Illustrator/PSD; Pembelajaran Digital berupa video streaming HD & PDF workbook interaktif.',
  },
  {
    q: 'Apakah saya mendapatkan pembaruan file (update) gratis?',
    a: 'Ya, 100% gratis selamanya. Jika ada perbaikan bug kode, pembaruan versi Tailwind, atau penambahan varian layout, kamu dapat mengunduh ulang versi terbarunya tanpa biaya tambahan sepeser pun.',
  },
]

export const rupiah = (price: number) => (price === 0 ? 'Gratis' : `Rp${price.toLocaleString('id-ID')}`)

/**
 * Retrieves all creator products from localStorage (both creator_projects and user_catalog).
 */
export function getCreatorProducts(): Product[] {
  if (typeof window === 'undefined') return []

  try {
    const creatorProjsRaw = localStorage.getItem('pojokpixel:creator_projects')
    const userCatRaw = localStorage.getItem('pojokpixel:user_catalog')

    const creatorProjs = creatorProjsRaw ? JSON.parse(creatorProjsRaw) : []
    const userCat = userCatRaw ? JSON.parse(userCatRaw) : []

    const map = new Map<string, Product>()

    // 1. Process user_catalog first
    if (Array.isArray(userCat)) {
      for (const uc of userCat) {
        if (!uc || !uc.id || !uc.name) continue
        map.set(uc.id, {
          id: String(uc.id),
          name: String(uc.name),
          category: (uc.category as any) || 'Template Website',
          price: typeof uc.price === 'number' ? uc.price : parseInt(uc.price, 10) || 0,
          originalPrice: typeof uc.originalPrice === 'number' ? uc.originalPrice : parseInt(uc.originalPrice, 10) || uc.price || 0,
          label: uc.label || 'Kreator',
          bg: 'nara',
          img: uc.img || 'photo-1460925895917-afdab827c52f',
          galleryImages: Array.isArray(uc.galleryImages) ? uc.galleryImages.filter((image: unknown): image is string => typeof image === 'string') : [],
          tag: uc.tag || 'Rilisan Kreator',
          rating: typeof uc.rating === 'number' ? uc.rating : 5.0,
          reviewsCount: 1,
          salesCount: typeof uc.salesCount === 'number' ? uc.salesCount : 0,
          shortDesc: uc.shortDesc || 'Project digital resmi buatan kreator terverifikasi PojokPixel.',
          formats: Array.isArray(uc.formats) && uc.formats.length > 0 ? uc.formats : ['File Digital Siap Pakai'],
          includes: ['File Digital Asli', 'Lisensi Komersial Kreator', 'Update Gratis Selamanya'],
          deliveryType: uc.deliveryType || 'file',
          fileAttachment: uc.fileAttachment,
          accessUrl: uc.accessUrl,
          buyerNote: uc.buyerNote,
          videoUrl: uc.videoUrl,
        })
      }
    }

    // 2. Process creator_projects second (master truth from Creator dashboard will always overwrite)
    if (Array.isArray(creatorProjs)) {
      for (const cp of creatorProjs) {
        if (!cp || !cp.id || !cp.name) continue
        map.set(cp.id, {
          id: String(cp.id),
          name: String(cp.name),
          category: (cp.category as any) || 'Template Website',
          price: typeof cp.price === 'number' ? cp.price : parseInt(cp.price, 10) || 0,
          originalPrice: typeof cp.originalPrice === 'number' ? cp.originalPrice : parseInt(cp.originalPrice, 10) || cp.price || 0,
          label: cp.label || 'Kreator',
          bg: 'nara',
          img: cp.img || 'photo-1460925895917-afdab827c52f',
          galleryImages: Array.isArray(cp.galleryImages) ? cp.galleryImages.filter((image: unknown): image is string => typeof image === 'string') : [],
          tag: cp.tag || 'Rilisan Kreator',
          rating: typeof cp.rating === 'number' ? cp.rating : 5.0,
          reviewsCount: 1,
          salesCount: typeof cp.salesCount === 'number' ? cp.salesCount : 0,
          shortDesc: cp.shortDesc || 'Project digital resmi buatan kreator terverifikasi PojokPixel.',
          formats: Array.isArray(cp.formats) && cp.formats.length > 0 ? cp.formats : ['File Digital Siap Pakai'],
          includes: ['File Digital Asli', 'Lisensi Komersial Kreator', 'Update Gratis Selamanya'],
          deliveryType: cp.deliveryType || 'file',
          fileAttachment: cp.fileAttachment,
          accessUrl: cp.accessUrl,
          buyerNote: cp.buyerNote,
          videoUrl: cp.videoUrl,
        })
      }
    }

    return Array.from(map.values())
  } catch {
    return []
  }
}

/**
 * Resolves a product image into a valid browser image source URL.
 * Handles uploaded base64 data URLs, full HTTP/HTTPS image links, and Unsplash IDs.
 */
export function getProductImageUrl(img: string): string {
  if (!img) return 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=900&q=80'
  if (img.startsWith('data:image/') || img.startsWith('http://') || img.startsWith('https://') || img.startsWith('blob:')) {
    return img
  }
  return `https://images.unsplash.com/${img}?auto=format&fit=crop&w=900&q=80`
}

/**
 * Returns all products for the marketplace (creator releases first, then official products).
 */
export function getLiveProducts(): Product[] {
  const creatorItems = getCreatorProducts()
  return [...creatorItems, ...products]
}
