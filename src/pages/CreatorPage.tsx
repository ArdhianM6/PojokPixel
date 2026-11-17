import { useState, useEffect, useRef } from 'react'
import { usePageMeta } from '../hooks/usePageMeta'
import { rupiah, getProductImageUrl } from '../data/marketplace'
import type { Product } from '../data/marketplace'
import { authClient } from '../lib/auth-client'
import { deleteCreatorData, getCreatorData, saveCreatorData } from '../lib/creator-api'

interface CreatorProfile {
  name: string
  username: string
  email: string
  phone: string
  category: string
  portfolioUrl: string
  bio: string
  registeredAt: string
}

interface CustomProject {
  id: string
  name: string
  category: 'Template Website' | 'Template Poster' | 'Pembelajaran Digital' | 'Bundel Produk'
  price: number
  originalPrice: number
  label: string
  img: string
  galleryImages?: string[]
  tag: string
  shortDesc: string
  formats: string[]
  createdAt: string
  salesCount: number
  rating: number
  deliveryType?: 'file' | 'link' | 'both'
  fileAttachment?: {
    fileName: string
    fileSize: string
    fileType: string
    fileData?: string
  }
  accessUrl?: string
  buyerNote?: string
  videoUrl?: string
}

interface CreatorPageProps {
  playSound: (type: 'click' | 'pop' | 'success' | 'delete') => void
  navigate: (path: string) => void
  notify: (msg: string) => void
}

type CreatorIconName = 'products' | 'revenue' | 'rating' | 'live' | 'catalog' | 'edit' | 'delete'

function CreatorIcon({ name, size = 16 }: { name: CreatorIconName; size?: number }) {
  const shapes: Record<CreatorIconName, React.ReactNode> = {
    products: <><rect x="3" y="4" width="18" height="16" rx="2" /><path d="M3 9h18M8 4v16" /></>,
    revenue: <><path d="m3 17 6-6 4 4 8-9" /><path d="M15 6h6v6" /></>,
    rating: <polygon points="12 2 15.1 8.3 22 9.3 17 14.1 18.2 21 12 17.8 5.8 21 7 14.1 2 9.3 8.9 8.3 12 2" />,
    live: <><circle cx="12" cy="12" r="9" /><path d="m8 12 2.5 2.5L16 9" /></>,
    catalog: <><rect x="3" y="4" width="18" height="16" rx="2" /><path d="M3 9h18" /></>,
    edit: <><path d="m16 4 4 4L9 19l-5 1 1-5L16 4Z" /><path d="m14 6 4 4" /></>,
    delete: <><path d="M3 6h18M8 6V4h8v2m3 0-1 14H6L5 6" /><path d="M10 11v5m4-5v5" /></>,
  }
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{shapes[name]}</svg>
}

/**
 * Compresses an uploaded image via an off-screen HTML5 Canvas
 * so that it fits comfortably within localStorage without exceeding browser storage quotas.
 */
function compressImage(file: File, maxWidth = 800, quality = 0.78): Promise<string> {
  return new Promise((resolve) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      const img = new Image()
      img.onload = () => {
        try {
          const canvas = document.createElement('canvas')
          let { width, height } = img
          if (width > maxWidth) {
            height = Math.round((height * maxWidth) / width)
            width = maxWidth
          }
          canvas.width = width
          canvas.height = height
          const ctx = canvas.getContext('2d')
          if (!ctx) {
            resolve(e.target?.result as string)
            return
          }
          ctx.drawImage(img, 0, 0, width, height)
          resolve(canvas.toDataURL('image/jpeg', quality))
        } catch {
          resolve(e.target?.result as string)
        }
      }
      img.onerror = () => resolve(e.target?.result as string)
      img.src = e.target?.result as string
    }
    reader.onerror = () => resolve('')
    reader.readAsDataURL(file)
  })
}

export function CreatorPage({ playSound, navigate, notify }: CreatorPageProps) {
  usePageMeta('Area Kreator', 'Daftar menjadi kreator digital PojokPixel dan mulai jual karyamu kepada ribuan kreator Indonesia.')

  // Check if user already registered as creator
  const [creatorProfile, setCreatorProfile] = useState<CreatorProfile | null>(null)

  // Creator's published projects
  const [myProjects, setMyProjects] = useState<CustomProject[]>([])
  const [isSyncing, setIsSyncing] = useState(true)
  const { data: session, isPending: isSessionPending } = authClient.useSession()

  // Mode for non-creators: 'locked' (explanation of exclusive creator area) or 'form' (the registration form)
  const [nonCreatorView, setNonCreatorView] = useState<'locked' | 'form'>('locked')

  // Registration Form State
  const [regName, setRegName] = useState('')
  const [regUsername, setRegUsername] = useState('')
  const [regEmail, setRegEmail] = useState('')
  const [regPhone, setRegPhone] = useState('')
  const [regCategory, setRegCategory] = useState<'Template Website' | 'Template Poster' | 'Pembelajaran Digital'>('Template Website')
  const [regPortfolio, setRegPortfolio] = useState('')
  const [regBio, setRegBio] = useState('')
  const [regAgreed, setRegAgreed] = useState(false)
  const [regSubmitting, setRegSubmitting] = useState(false)

  // Project Modal State (Create or Edit)
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create')
  const [editingProjectId, setEditingProjectId] = useState<string | null>(null)

  const [projName, setProjName] = useState('')
  const [projCategory, setProjCategory] = useState<'Template Website' | 'Template Poster' | 'Pembelajaran Digital' | 'Bundel Produk'>('Template Website')
  const [projPrice, setProjPrice] = useState('39000')
  const [projOriginalPrice, setProjOriginalPrice] = useState('59000')
  const [projLabel, setProjLabel] = useState('Baru')
  const [projTag, setProjTag] = useState('File Digital')
  const [projFormats, setProjFormats] = useState('Figma, HTML5, Canva')
  const [projDesc, setProjDesc] = useState('')
  
  // Image cover selection: supports upload, custom URL, or preset
  const [projImg, setProjImg] = useState('photo-1460925895917-afdab827c52f')
  const [projGalleryImages, setProjGalleryImages] = useState<string[]>([])
  const [imageTab, setImageTab] = useState<'upload' | 'preset' | 'url'>('upload')
  const [customImgUrl, setCustomImgUrl] = useState('')
  const [isProcessingImg, setIsProcessingImg] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Digital Delivery Asset State (File Attachment + Cloud Access Link + Buyer Note)
  const [attachedFile, setAttachedFile] = useState<{
    fileName: string
    fileSize: string
    fileType: string
    fileData?: string
  } | null>(null)
  const [projAccessUrl, setProjAccessUrl] = useState('')
  const [projBuyerNote, setProjBuyerNote] = useState('')
  const [projVideoUrl, setProjVideoUrl] = useState('')
  const projectFileRef = useRef<HTMLInputElement>(null)

  // Broadcast on mount so HomePage and CatalogPage immediately reflect existing creator projects
  useEffect(() => {
    window.dispatchEvent(new CustomEvent('pojokpixel:catalog_updated'))
  }, [])

  // Server data is canonical; migrate matching legacy browser data on first login.
  useEffect(() => {
    if (isSessionPending) return
    if (!session) {
      setCreatorProfile(null)
      setMyProjects([])
      setIsSyncing(false)
      return
    }
    let cancelled = false
    setIsSyncing(true)
    const sync = async () => {
      try {
        let data = await getCreatorData()
        if (!data) {
          const legacyProfile = JSON.parse(localStorage.getItem('pojokpixel:creator') || 'null') as CreatorProfile | null
          const legacyProjects = JSON.parse(localStorage.getItem('pojokpixel:creator_projects') || '[]') as CustomProject[]
          if (legacyProfile && legacyProfile.email?.toLowerCase() === session.user.email.toLowerCase()) {
            data = await saveCreatorData({ profile: legacyProfile as unknown as Record<string, unknown>, projects: legacyProjects as unknown as Record<string, unknown>[] })
          }
        }
        if (cancelled) return
        setCreatorProfile((data?.profile as CreatorProfile | undefined) ?? null)
        setMyProjects((data?.projects ?? []) as unknown as CustomProject[])
        if (data) {
          localStorage.setItem('pojokpixel:creator', JSON.stringify(data.profile))
          localStorage.setItem('pojokpixel:creator_projects', JSON.stringify(data.projects))
          localStorage.removeItem('pojokpixel:user_catalog')
          window.dispatchEvent(new CustomEvent('pojokpixel:creator_updated'))
          window.dispatchEvent(new CustomEvent('pojokpixel:catalog_updated'))
        }
      } catch {
        if (!cancelled) notify('Data kreator belum dapat disinkronkan. Periksa koneksi lalu muat ulang halaman.')
      } finally {
        if (!cancelled) setIsSyncing(false)
      }
    }
    void sync()
    return () => { cancelled = true }
  }, [session?.user.id, isSessionPending])

  // Handle Creator Registration Submit
  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!regAgreed) {
      alert('Harap setujui syarat & ketentuan kreator terlebih dahulu.')
      return
    }

    if (!session) {
      notify('Masuk ke akun PojokPixel terlebih dahulu untuk mendaftar sebagai kreator.')
      return
    }
    setRegSubmitting(true)
    try {
      const newProfile: CreatorProfile = {
        name: regName.trim(),
        username: regUsername.trim().replace(/^@/, ''),
        email: regEmail.trim(),
        phone: regPhone.trim(),
        category: regCategory,
        portfolioUrl: regPortfolio.trim(),
        bio: regBio.trim(),
        registeredAt: new Date().toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' }),
      }

      const saved = await saveCreatorData({ profile: newProfile as unknown as Record<string, unknown>, projects: [] })
      localStorage.setItem('pojokpixel:creator', JSON.stringify(saved.profile))
      localStorage.setItem('pojokpixel:creator_projects', '[]')
      localStorage.removeItem('pojokpixel:user_catalog')
      setCreatorProfile(saved.profile as unknown as CreatorProfile)
      window.dispatchEvent(new CustomEvent('pojokpixel:creator_updated'))
      playSound('success')
      notify('🎉 Selamat! Akun Anda resmi menjadi Akun Kreator PojokPixel.')
    } catch (error) {
      notify(error instanceof Error ? error.message : 'Pendaftaran gagal disinkronkan.')
    } finally {
      setRegSubmitting(false)
    }
  }

  // Open modal in CREATE mode
  const handleOpenCreateModal = () => {
    setModalMode('create')
    setEditingProjectId(null)
    setProjName('')
    setProjCategory('Template Website')
    setProjPrice('39000')
    setProjOriginalPrice('59000')
    setProjLabel('Baru')
    setProjTag('File Digital')
    setProjFormats('Figma, HTML5, Canva')
    setProjDesc('')
    setProjImg('photo-1460925895917-afdab827c52f')
    setProjGalleryImages([])
    setImageTab('upload')
    setCustomImgUrl('')
    setAttachedFile(null)
    setProjAccessUrl('')
    setProjBuyerNote('')
    setProjVideoUrl('')
    playSound('pop')
    setIsAddModalOpen(true)
  }

  // Open modal in EDIT mode (pre-filled with existing product details & image & delivery asset)
  const handleOpenEditModal = (project: CustomProject) => {
    setModalMode('edit')
    setEditingProjectId(project.id)
    setProjName(project.name)
    setProjCategory(project.category)
    setProjPrice(String(project.price))
    setProjOriginalPrice(String(project.originalPrice || project.price))
    setProjLabel(project.label || 'Baru')
    setProjTag(project.tag || 'File Digital')
    setProjFormats(project.formats.join(', '))
    setProjDesc(project.shortDesc)
    setProjImg(project.img)
    setProjGalleryImages(Array.isArray(project.galleryImages) ? project.galleryImages : [])

    // Image Tab Detection
    if (project.img.startsWith('data:image/')) {
      setImageTab('upload')
    } else if (project.img.startsWith('http://') || project.img.startsWith('https://')) {
      setImageTab('url')
      setCustomImgUrl(project.img)
    } else {
      setImageTab('preset')
    }

    // Delivery Assets Pre-fill
    setAttachedFile(project.fileAttachment || null)
    setProjAccessUrl(project.accessUrl || '')
    setProjBuyerNote(project.buyerNote || '')
    setProjVideoUrl(project.videoUrl || '')

    playSound('pop')
    setIsAddModalOpen(true)
  }

  // Handle cover image upload from user's device
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setIsProcessingImg(true)
    try {
      const compressedDataUrl = await compressImage(file, 1000, 0.85)
      setProjImg(compressedDataUrl)
      playSound('pop')
      notify('📸 Foto cover produk berhasil diunggah!')
    } catch {
      notify('Gagal memproses gambar. Coba gunakan gambar lain.')
    } finally {
      setIsProcessingImg(false)
    }
  }

  const handleGalleryUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []).filter((file) => file.type.startsWith('image/'))
    e.target.value = ''
    if (!files.length) return

    const remaining = Math.max(0, 4 - projGalleryImages.length)
    if (remaining === 0) {
      notify('Maksimal 4 gambar tambahan. Hapus gambar lama untuk menggantinya.')
      return
    }

    const selectedFiles = files.slice(0, remaining)
    setIsProcessingImg(true)
    try {
      const compressedImages = await Promise.all(selectedFiles.map((file) => compressImage(file, 900, 0.72)))
      const validImages = compressedImages.filter(Boolean)
      setProjGalleryImages((current) => [...current, ...validImages].slice(0, 4))
      if (files.length > remaining) notify(`Hanya ${remaining} gambar tambahan yang ditambahkan. Maksimal 4 gambar.`)
      else notify(`${validImages.length} gambar tambahan berhasil diunggah.`)
      playSound('pop')
    } catch {
      notify('Beberapa gambar gagal diproses. Coba unggah JPG, PNG, atau WebP yang lebih kecil.')
    } finally {
      setIsProcessingImg(false)
    }
  }

  // Handle custom image URL submission
  const handleApplyCustomUrl = () => {
    if (!customImgUrl.trim()) return
    setProjImg(customImgUrl.trim())
    playSound('pop')
    notify('🔗 Tautan gambar cover berhasil diterapkan!')
  }

  // Handle Project File Upload (e.g. .zip, .fig, .pdf, .rar) for buyers to download after purchase
  const handleProjectFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const sizeInMB = file.size / (1024 * 1024)
    const formattedSize = sizeInMB >= 1 ? `${sizeInMB.toFixed(1)} MB` : `${Math.round(file.size / 1024)} KB`

    // If file is 4MB or smaller, store as Data URL for genuine full offline download
    if (sizeInMB <= 4) {
      const reader = new FileReader()
      reader.onload = (event) => {
        setAttachedFile({
          fileName: file.name,
          fileSize: formattedSize,
          fileType: file.type || 'application/octet-stream',
          fileData: event.target?.result as string,
        })
        playSound('pop')
        notify(`📦 Berkas "${file.name}" (${formattedSize}) berhasil dilampirkan!`)
      }
      reader.readAsDataURL(file)
    } else {
      // For larger files (>4MB), store metadata safely to avoid localStorage overflow
      setAttachedFile({
        fileName: file.name,
        fileSize: formattedSize,
        fileType: file.type || 'application/octet-stream',
      })
      playSound('pop')
      notify(`📦 Berkas "${file.name}" (${formattedSize}) berhasil disiapkan untuk pembeli!`)
    }
  }

  // Handle Save Project (Create or Update existing)
  const handleSaveProject = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!projName.trim()) return
    if (!creatorProfile || !session || isSyncing) {
      notify('Pastikan akun kreator sudah tersinkron sebelum menyimpan produk.')
      return
    }

    const priceNum = Math.max(0, parseInt(projPrice, 10) || 0)
    const originalPriceNum = Math.max(0, parseInt(projOriginalPrice, 10) || 0)
    const formatsArr = projFormats.split(',').map((f) => f.trim()).filter(Boolean)
    const deliveryMethodChoice: 'file' | 'link' | 'both' = attachedFile && projAccessUrl.trim() ? 'both' : attachedFile ? 'file' : projAccessUrl.trim() ? 'link' : 'file'

    if (modalMode === 'edit' && editingProjectId) {
      // UPDATE EXISTING PROJECT
      const updated = myProjects.map((p) => {
        if (p.id !== editingProjectId) return p
        return {
          ...p,
          name: projName.trim(),
          category: projCategory,
          price: priceNum,
          originalPrice: originalPriceNum,
          label: projLabel.trim() || 'Baru',
          img: projImg,
          galleryImages: projGalleryImages,
          tag: projTag.trim() || 'Aset Kreator',
          shortDesc: projDesc.trim() || 'Project digital resmi buatan kreator terverifikasi PojokPixel.',
          formats: formatsArr.length > 0 ? formatsArr : ['File Digital'],
          deliveryType: deliveryMethodChoice,
          fileAttachment: attachedFile || undefined,
          accessUrl: projAccessUrl.trim() || undefined,
          buyerNote: projBuyerNote.trim() || undefined,
          videoUrl: projVideoUrl.trim() || undefined,
        }
      })

      try {
        await saveCreatorData({ profile: creatorProfile as unknown as Record<string, unknown>, projects: updated as unknown as Record<string, unknown>[] })
      } catch (error) {
        notify(error instanceof Error ? error.message : 'Produk gagal disinkronkan.')
        return
      }

      try {
        localStorage.setItem('pojokpixel:creator_projects', JSON.stringify(updated))
      } catch {
        // The server has saved the canonical data; local browser cache is optional.
      }
      setMyProjects(updated)

      // Also update / sync in user_catalog
      try {
        const storedCatalog = JSON.parse(localStorage.getItem('pojokpixel:user_catalog') || '[]') as Product[]
        const catalogItem: Product = {
          id: editingProjectId,
          name: projName.trim(),
          category: projCategory,
          price: priceNum,
          originalPrice: originalPriceNum,
          label: projLabel.trim() || 'Baru',
          bg: 'nara',
          img: projImg,
          galleryImages: projGalleryImages,
          tag: projTag.trim() || 'Aset Kreator',
          rating: 5.0,
          reviewsCount: 1,
          salesCount: 0,
          shortDesc: projDesc.trim() || 'Project digital resmi buatan kreator terverifikasi PojokPixel.',
          formats: formatsArr.length > 0 ? formatsArr : ['File Digital'],
          includes: ['File Digital Asli', 'Lisensi Komersial Kreator', 'Update Gratis Selamanya'],
          deliveryType: deliveryMethodChoice,
          fileAttachment: attachedFile || undefined,
          accessUrl: projAccessUrl.trim() || undefined,
          buyerNote: projBuyerNote.trim() || undefined,
          videoUrl: projVideoUrl.trim() || undefined,
        }

        const exists = storedCatalog.some((item) => item.id === editingProjectId)
        const updatedCatalog = exists
          ? storedCatalog.map((item) => (item.id === editingProjectId ? catalogItem : item))
          : [catalogItem, ...storedCatalog]
        localStorage.setItem('pojokpixel:user_catalog', JSON.stringify(updatedCatalog))
      } catch {
        // ignore
      }

      window.dispatchEvent(new CustomEvent('pojokpixel:catalog_updated'))
      setIsAddModalOpen(false)
      playSound('success')
      notify(`✅ Project "${projName.trim()}" berhasil diperbarui!`)
    } else {
      // CREATE NEW PROJECT
      const newProject: CustomProject = {
        id: `custom-${Date.now()}`,
        name: projName.trim(),
        category: projCategory,
        price: priceNum,
        originalPrice: originalPriceNum,
        label: projLabel.trim() || 'Baru',
        img: projImg,
        galleryImages: projGalleryImages,
        tag: projTag.trim() || 'Aset Kreator',
        shortDesc: projDesc.trim() || 'Project digital resmi buatan kreator terverifikasi PojokPixel.',
        formats: formatsArr.length > 0 ? formatsArr : ['File Digital'],
        createdAt: new Date().toLocaleDateString('id-ID', { month: 'short', day: 'numeric', year: 'numeric' }),
        salesCount: 0,
        rating: 5.0,
        deliveryType: deliveryMethodChoice,
        fileAttachment: attachedFile || undefined,
        accessUrl: projAccessUrl.trim() || undefined,
        buyerNote: projBuyerNote.trim() || undefined,
        videoUrl: projVideoUrl.trim() || undefined,
      }

      const updated = [newProject, ...myProjects]
      try {
        await saveCreatorData({ profile: creatorProfile as unknown as Record<string, unknown>, projects: updated as unknown as Record<string, unknown>[] })
      } catch (error) {
        notify(error instanceof Error ? error.message : 'Produk gagal disinkronkan.')
        return
      }
      try {
        localStorage.setItem('pojokpixel:creator_projects', JSON.stringify(updated))
      } catch {
        // The server has saved the canonical data; local browser cache is optional.
      }
      setMyProjects(updated)

      try {
        const storedCatalog = JSON.parse(localStorage.getItem('pojokpixel:user_catalog') || '[]') as Product[]
        const catalogItem: Product = {
          id: newProject.id,
          name: newProject.name,
          category: newProject.category,
          price: newProject.price,
          originalPrice: newProject.originalPrice,
          label: newProject.label,
          bg: 'nara',
          img: newProject.img,
          galleryImages: newProject.galleryImages,
          tag: newProject.tag,
          rating: 5.0,
          reviewsCount: 1,
          salesCount: 0,
          shortDesc: newProject.shortDesc,
          formats: newProject.formats,
          includes: ['File Digital Asli', 'Lisensi Komersial Kreator', 'Update Gratis Selamanya'],
          deliveryType: newProject.deliveryType,
          fileAttachment: newProject.fileAttachment,
          accessUrl: newProject.accessUrl,
          buyerNote: newProject.buyerNote,
          videoUrl: newProject.videoUrl,
        }
        localStorage.setItem('pojokpixel:user_catalog', JSON.stringify([catalogItem, ...storedCatalog]))
      } catch {
        // ignore
      }

      window.dispatchEvent(new CustomEvent('pojokpixel:catalog_updated'))
      setIsAddModalOpen(false)
      playSound('success')
      notify(`✅ Project "${newProject.name}" berhasil dipublikasikan ke Katalog & Dashboard!`)
    }

    // Reset fields
    setProjName('')
    setProjDesc('')
  }

  // Delete project from both creator projects and visitor catalog
  const handleDeleteProject = async (id: string, name: string) => {
    if (!confirm(`Hapus project "${name}" dari lapak dan katalog?`)) return
    if (!creatorProfile) return
    const updated = myProjects.filter((p) => p.id !== id)
    try {
      await saveCreatorData({ profile: creatorProfile as unknown as Record<string, unknown>, projects: updated as unknown as Record<string, unknown>[] })
    } catch (error) {
      notify(error instanceof Error ? error.message : 'Produk gagal dihapus dari server.')
      return
    }
    setMyProjects(updated)
    localStorage.setItem('pojokpixel:creator_projects', JSON.stringify(updated))

    try {
      const storedCatalog = JSON.parse(localStorage.getItem('pojokpixel:user_catalog') || '[]') as Product[]
      const updatedCatalog = storedCatalog.filter((p) => p.id !== id)
      localStorage.setItem('pojokpixel:user_catalog', JSON.stringify(updatedCatalog))
    } catch {
      // ignore
    }

    window.dispatchEvent(new CustomEvent('pojokpixel:catalog_updated'))
    playSound('delete')
    notify('Project berhasil dihapus dari lapak dan katalog.')
  }

  // Reset creator status to test non-creator / buyer mode
  const handleResetToBuyer = () => {
    if (!confirm('Uji coba Akun Pembeli: Status kreator akan dinonaktifkan sementara agar Anda dapat melihat tampilan pembeli biasa. Lanjutkan?')) return
    void deleteCreatorData().then(() => {
      localStorage.removeItem('pojokpixel:creator')
      localStorage.removeItem('pojokpixel:creator_projects')
      setCreatorProfile(null)
      setMyProjects([])
      setNonCreatorView('locked')
      window.dispatchEvent(new CustomEvent('pojokpixel:creator_updated'))
      window.dispatchEvent(new CustomEvent('pojokpixel:catalog_updated'))
      playSound('pop')
      notify('Akun dikembalikan ke Akun Pembeli biasa.')
    }).catch((error: unknown) => notify(error instanceof Error ? error.message : 'Gagal mengubah status kreator.'))
  }

  return (
    <div className="creator-page-wrap">
      {/* Breadcrumb Header */}
      <div className="catalog-header-bar">
        <div className="app-container">
          <nav className="catalog-breadcrumb" aria-label="Navigasi Halaman">
            <a
              href="/"
              onClick={(e) => {
                e.preventDefault()
                playSound('click')
                navigate('/')
              }}
            >
              Beranda
            </a>
            <span aria-hidden="true">/</span>
            <span aria-current="page">
              {creatorProfile ? 'Area Kreator' : nonCreatorView === 'form' ? 'Pendaftaran Kreator' : 'Akses Terbatas Kreator'}
            </span>
          </nav>
        </div>
      </div>

      <div className="app-container" style={{ paddingTop: '28px', paddingBottom: '70px' }}>
        {/* ==========================================================================
            VIEW A: JIKA BUKAN KREATOR (AKUN PEMBELI)
            Halaman kreator / dashboard tidak muncul jika akunnya bukan kreator
           ========================================================================== */}
        {isSyncing ? (
          <div className="creator-guard-container" role="status" aria-live="polite">
            <div className="creator-guard-card"><p className="creator-guard-lead">Memuat data kreator dari akunmu…</p></div>
          </div>
        ) : !creatorProfile ? (
          nonCreatorView === 'locked' ? (
            /* GATEWAY / AKSES TERKUNCI */
            <div className="creator-guard-container">
              <div className="creator-guard-badge">
                <span className="creator-guard-dot"></span>
                AKUN PEMBELI • BELUM MENJADI KREATOR
              </div>

              <div className="creator-guard-card">
                <div className="creator-guard-icon-wrap">
                  <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect width="18" height="11" x="3" y="11" rx="2" ry="2"/>
                    <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                  </svg>
                </div>

                <h1 className="creator-guard-title">Halaman Ini Khusus Kreator PojokPixel</h1>
                <p className="creator-guard-lead">
                  Anda saat ini login sebagai <strong>Akun Pembeli</strong>. Menu lapak, dashboard manajemen karya,
                  analitik penjualan, dan fitur unggah project hanya dapat diakses setelah Anda mendaftar sebagai Kreator Resmi.
                </p>

                {/* 3 Keuntungan Menjadi Kreator */}
                <div className="creator-benefits-grid">
                  <div className="creator-benefit-card">
                    <div className="benefit-icon">💰</div>
                    <h3>Bagi Hasil 80%</h3>
                    <p>Skema bagi hasil transparan resmi. 80% hasil penjualan langsung menjadi hak kreator, 20% biaya operasional platform &amp; payment gateway.</p>
                  </div>
                  <div className="creator-benefit-card">
                    <div className="benefit-icon">⚡</div>
                    <h3>Unggah & Jual Bebas</h3>
                    <p>Publikasikan template website, poster, atau modul digital Anda ke katalog utama tanpa batasan kuota.</p>
                  </div>
                  <div className="creator-benefit-card">
                    <div className="benefit-icon">🛡️</div>
                    <h3>Katalog Otomatis</h3>
                    <p>Setiap project yang Anda rilis otomatis tampil di Beranda dan Katalog untuk ribuan calon pembeli aktif.</p>
                  </div>
                </div>

                <div className="creator-guard-actions">
                  <button
                    type="button"
                    className="button button-orange"
                    style={{ height: '50px', padding: '0 32px', fontSize: '14.5px', fontWeight: 700 }}
                    onClick={() => {
                      playSound('pop')
                      setNonCreatorView('form')
                    }}
                  >
                    <span>📝 Isi Formulir Pendaftaran Kreator Sekarang</span>
                    <span aria-hidden="true">→</span>
                  </button>
                  <button
                    type="button"
                    className="button button-secondary"
                    style={{ height: '50px', padding: '0 24px', fontSize: '14px' }}
                    onClick={() => {
                      playSound('click')
                      navigate('/')
                    }}
                  >
                    <span>Kembali ke Beranda Utama</span>
                  </button>
                </div>
              </div>
            </div>
          ) : (
            /* FORMULIR PENDAFTARAN KREATOR */
            <div className="creator-register-container">
              <div className="creator-register-head">
                <button
                  type="button"
                  className="creator-back-to-locked-btn"
                  onClick={() => {
                    playSound('click')
                    setNonCreatorView('locked')
                  }}
                >
                  ← Kembali ke Informasi Akses
                </button>
                <span className="creator-eyebrow">FORMULIR PENDAFTARAN</span>
                <h1 className="creator-register-title">Bergabung Menjadi Kreator PojokPixel</h1>
                <p className="creator-register-desc">
                  Lengkapi data profil dan portofoliomu di bawah ini. Setelah dikirim, akunmu otomatis
                  ditingkatkan menjadi <strong>Akun Kreator</strong> dengan hak membuka lapak dan mempublikasikan project ke katalog.
                </p>
              </div>

              <form className="creator-form-card" onSubmit={handleRegisterSubmit}>
                <div className="creator-form-grid">
                  {/* Nama Lengkap / Studio */}
                  <div className="creator-form-field">
                    <label htmlFor="reg-name">
                      Nama Lengkap / Nama Studio <span>*</span>
                    </label>
                    <input
                      id="reg-name"
                      type="text"
                      required
                      placeholder="Contoh: Ardhian Maulana / Studio PixelArt"
                      value={regName}
                      onChange={(e) => setRegName(e.target.value)}
                    />
                    <small>Nama ini akan ditampilkan sebagai identitas kreator pada setiap karyamu.</small>
                  </div>

                  {/* Username */}
                  <div className="creator-form-field">
                    <label htmlFor="reg-user">
                      Username Kreator <span>*</span>
                    </label>
                    <div className="creator-input-prefix-wrap">
                      <span className="input-prefix">@</span>
                      <input
                        id="reg-user"
                        type="text"
                        required
                        placeholder="pixelstudio"
                        value={regUsername}
                        onChange={(e) => setRegUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
                      />
                    </div>
                    <small>Digunakan untuk URL lapak profilmu: pojokpixel.studio/@{regUsername || 'username'}</small>
                  </div>

                  {/* Email Kontak */}
                  <div className="creator-form-field">
                    <label htmlFor="reg-email">
                      Email Kontak & Notifikasi Penjualan <span>*</span>
                    </label>
                    <input
                      id="reg-email"
                      type="email"
                      required
                      placeholder="kreator@example.com"
                      value={regEmail}
                      onChange={(e) => setRegEmail(e.target.value)}
                    />
                    <small>Laporan penjualan & notifikasi unduhan akan dikirimkan ke email ini.</small>
                  </div>

                  {/* Nomor WhatsApp */}
                  <div className="creator-form-field">
                    <label htmlFor="reg-phone">Nomor WhatsApp / Kontak Cepat</label>
                    <input
                      id="reg-phone"
                      type="tel"
                      placeholder="08123456789"
                      value={regPhone}
                      onChange={(e) => setRegPhone(e.target.value)}
                    />
                  </div>

                  {/* Kategori Spesialisasi */}
                  <div className="creator-form-field full-col">
                    <label>
                      Kategori Spesialisasi Utama <span>*</span>
                    </label>
                    <div className="creator-category-radios">
                      {[
                        { id: 'Template Website', desc: 'Landing page, dashboard, komponen HTML/Tailwind/Figma' },
                        { id: 'Template Poster', desc: 'Poster seni, feed/story Instagram, banner cetak' },
                        { id: 'Pembelajaran Digital', desc: 'Modul materi, workbook, cheatsheet, panduan desain' },
                      ].map((cat) => (
                        <label
                          key={cat.id}
                          className={`creator-cat-pill ${regCategory === cat.id ? 'is-active' : ''}`}
                        >
                          <input
                            type="radio"
                            name="creator-cat"
                            checked={regCategory === cat.id}
                            onChange={() => setRegCategory(cat.id as any)}
                          />
                          <div>
                            <strong>{cat.id}</strong>
                            <small>{cat.desc}</small>
                          </div>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Link Portofolio */}
                  <div className="creator-form-field full-col">
                    <label htmlFor="reg-portfolio">
                      Tautan Portofolio / Akun Kreatif <span>*</span>
                    </label>
                    <input
                      id="reg-portfolio"
                      type="url"
                      required
                      placeholder="https://dribbble.com/username atau https://instagram.com/username"
                      value={regPortfolio}
                      onChange={(e) => setRegPortfolio(e.target.value)}
                    />
                    <small>Tautan ke Behance, Dribbble, Figma Community, GitHub, atau media sosial karya desainmu.</small>
                  </div>

                  {/* Bio Singkat */}
                  <div className="creator-form-field full-col">
                    <label htmlFor="reg-bio">Bio Singkat / Tentang Karyamu</label>
                    <textarea
                      id="reg-bio"
                      rows={3}
                      placeholder="Ceritakan sedikit tentang gaya desainmu, pengalaman, atau jenis produk digital yang kamu kuasai..."
                      value={regBio}
                      onChange={(e) => setRegBio(e.target.value)}
                    />
                  </div>
                </div>

                {/* Persetujuan Ketentuan */}
                <div className="creator-terms-row">
                  <label className="creator-checkbox-label">
                    <input
                      type="checkbox"
                      checked={regAgreed}
                      onChange={(e) => setRegAgreed(e.target.checked)}
                    />
                    <span>
                      Saya menyatakan bahwa seluruh karya yang saya unggah adalah <strong>orisinalitas pribadi / tim</strong>,
                      bebas pelanggaran hak cipta, dan saya menyetujui Ketentuan Kreator &amp; Sistem Bagi Hasil 80% (20% Platform) PojokPixel.
                    </span>
                  </label>
                </div>

                {/* Action Buttons */}
                <div className="creator-form-actions">
                  <button
                    type="submit"
                    className="button button-orange"
                    style={{ height: '48px', padding: '0 28px', fontSize: '14px' }}
                    disabled={regSubmitting}
                  >
                    <span>{regSubmitting ? 'Memproses Pendaftaran...' : 'Daftar & Aktifkan Akun Kreator →'}</span>
                  </button>
                  <button
                    type="button"
                    className="button button-secondary"
                    onClick={() => {
                      playSound('click')
                      setNonCreatorView('locked')
                    }}
                  >
                    Batal
                  </button>
                </div>
              </form>
            </div>
          )
        ) : (
          /* ==========================================================================
              VIEW B: DASHBOARD KREATOR RESMI
              Hanya muncul jika akunnya telah terverifikasi sebagai seorang kreator!
             ========================================================================== */
          <div className="creator-dashboard-container">
            {/* Creator Header Banner */}
            <div className="creator-banner-card">
              <div className="creator-banner-left">
                <div className="creator-avatar-circle">
                  {creatorProfile.name.slice(0, 2).toUpperCase()}
                </div>
                <div>
                  <div className="creator-badge-row">
                    <span className="creator-verified-badge">★ Kreator Terverifikasi</span>
                    <span className="creator-status-badge">🟢 Lapak Aktif</span>
                  </div>
                  <h1 className="creator-studio-name">{creatorProfile.name}</h1>
                  <span className="creator-handle">
                    @{creatorProfile.username} • Spesialisasi {creatorProfile.category}
                  </span>
                  <p className="creator-bio-text">{creatorProfile.bio || 'Kreator resmi produk digital PojokPixel.'}</p>
                </div>
              </div>

              <div className="creator-banner-right">
                <button
                  type="button"
                  className="button button-orange creator-add-main"
                  style={{ height: '42px', padding: '0 16px', fontSize: '13px' }}
                  onClick={handleOpenCreateModal}
                >
                  <span aria-hidden="true">+</span><span>Tambah produk</span>
                </button>

                <button
                  type="button"
                  className="creator-reset-btn"
                  aria-label="Uji tampilan akun pembeli"
                  title="Klik untuk menguji tampilan akun pembeli biasa"
                  onClick={handleResetToBuyer}
                >
                  Mode Pembeli (Reset)
                </button>
              </div>
            </div>

            {/* Metrics Overview */}
            <div className="creator-metrics-grid">
              <div className="creator-metric-item">
                <span className="creator-metric-icon"><CreatorIcon name="products" /></span>
                <span className="metric-label">Produk di lapak</span>
                <strong className="metric-val">{myProjects.length}</strong>
                <small className="metric-sub">Karya kamu</small>
              </div>
              <div className="creator-metric-item">
                <span className="creator-metric-icon"><CreatorIcon name="revenue" /></span>
                <span className="metric-label">Bagi hasil</span>
                <strong className="metric-val" style={{ color: '#e65416' }}>
                  80%
                </strong>
                <small className="metric-sub">80% untuk kreator</small>
              </div>
              <div className="creator-metric-item">
                <span className="creator-metric-icon"><CreatorIcon name="rating" /></span>
                <span className="metric-label">Rating kreator</span>
                <strong className="metric-val">5.0 ★</strong>
                <small className="metric-sub">Standar kurasi resmi</small>
              </div>
              <div className="creator-metric-item">
                <span className="creator-metric-icon"><CreatorIcon name="live" /></span>
                <span className="metric-label">Status lapak</span>
                <strong className="metric-val" style={{ color: '#10b981' }}>
                  Live Publik
                </strong>
                <small className="metric-sub">Tampil di katalog</small>
              </div>
            </div>

            {/* Project List Section */}
            <div className="creator-projects-section">
              <div className="creator-section-heading">
                <div>
                  <span className="creator-eyebrow">KATALOG SAYA</span>
                  <h2 style={{ fontFamily: 'var(--display)', fontSize: '22px', fontWeight: 700, margin: '4px 0 0' }}>
                    Produk saya
                  </h2>
                </div>
                <span className="creator-products-count">{myProjects.length} produk</span>
              </div>

              {myProjects.length === 0 ? (
                <div className="creator-empty-state">
                  <div className="empty-state-icon">📦</div>
                  <h3>Belum Ada Project yang Diunggah</h3>
                  <p>Mulai tambahkan karya pertamamu sekarang! Project yang kamu tambahkan akan langsung tayang di katalog PojokPixel dan halaman Beranda utama.</p>
                  <button
                    type="button"
                    className="button button-orange"
                    onClick={handleOpenCreateModal}
                  >
                    <span>+ Unggah Project Pertama Saya</span>
                  </button>
                </div>
              ) : (
                <div className="creator-project-cards-grid">
                  {myProjects.map((proj) => (
                    <article className="creator-proj-card" key={proj.id}>
                      <div
                        className="creator-proj-img"
                        style={{
                          backgroundImage: `url(${getProductImageUrl(proj.img)})`,
                        }}
                      >
                        <span className="creator-proj-cat-tag">{proj.category}</span>
                        <span className="creator-proj-status-tag">🟢 Live di Katalog</span>
                      </div>
                      <div className="creator-proj-content">
                        <div className="creator-proj-header">
                          <h4>{proj.name}</h4>
                          <strong className="creator-proj-price">
                            {proj.price === 0 ? 'Gratis' : rupiah(proj.price)}
                          </strong>
                        </div>
                        <p className="creator-proj-desc">{proj.shortDesc}</p>
                        
                        {/* Delivery badge indicator */}
                        <div style={{ display: 'flex', gap: '6px', alignItems: 'center', margin: '4px 0 8px' }}>
                          <span style={{ fontSize: '11px', background: '#f0fdf4', color: '#15803d', border: '1px solid #bbf7d0', padding: '2px 8px', borderRadius: '4px', fontWeight: 600 }}>
                            {proj.fileAttachment ? `📦 File: ${proj.fileAttachment.fileName}` : proj.accessUrl ? '🔗 Link Cloud Aktif' : '📦 Berkas Digital Otomatis'}
                          </span>
                        </div>

                        <div className="creator-proj-formats">
                          {proj.formats.map((f) => (
                            <span key={f} className="creator-format-pill">
                              {f}
                            </span>
                          ))}
                        </div>
                        <div className="creator-proj-footer" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '8px' }}>
                          <small className="creator-proj-date" style={{ fontSize: '11px', color: '#8c8b84' }}>
                            {proj.createdAt}
                          </small>
                          <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                            <button
                              type="button"
                              className="button button-outline"
                              style={{ height: '28px', padding: '0 8px', fontSize: '11px', borderRadius: '4px' }}
                              aria-label={`Lihat ${proj.name} di katalog`}
                              title="Buka katalog"
                              onClick={() => {
                                playSound('click')
                                navigate('/katalog')
                              }}
                            >
                              Katalog →
                            </button>
                            <button
                              type="button"
                              className="creator-proj-edit-btn"
                              style={{ height: '28px', padding: '0 8px', fontSize: '11px' }}
                              onClick={() => handleOpenEditModal(proj)}
                              aria-label={`Edit ${proj.name}`}
                              title="Ubah berkas, gambar, dan detail project ini"
                            >
                              ✏️ Edit
                            </button>
                            <button
                              type="button"
                              className="creator-proj-delete-btn"
                              style={{ height: '28px', padding: '0 6px', fontSize: '11px' }}
                              onClick={() => handleDeleteProject(proj.id, proj.name)}
                              aria-label={`Hapus ${proj.name}`}
                            >
                              Hapus
                            </button>
                          </div>
                        </div>
                      </div>
                    </article>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ==========================================================================
            MODAL: TAMBAH / EDIT PROJECT & GAMBAR & BERKAS PENGIRIMAN
           ========================================================================== */}
        {isAddModalOpen && (
          <div className="modal-overlay" onClick={() => setIsAddModalOpen(false)}>
            <div className="creator-modal-card" onClick={(e) => e.stopPropagation()}>
              <button
                type="button"
                className="quickview-close-btn"
                onClick={() => setIsAddModalOpen(false)}
                aria-label="Tutup form"
              >
                ×
              </button>

              <div className="creator-modal-head">
                <span className="creator-eyebrow">
                  {modalMode === 'edit' ? 'PEMBARUAN KARYA DIGITAL' : 'UNGGAH KARYA DIGITAL'}
                </span>
                <h3 className="creator-modal-title">
                  {modalMode === 'edit' ? 'Edit Detail & Berkas Project' : 'Tambah Project Baru'}
                </h3>
                <p className="creator-modal-desc">
                  {modalMode === 'edit'
                    ? 'Ubah gambar cover, berkas digital, link download, atau harga tanpa menghapus produk dari lapak.'
                    : 'Lengkapi detail dan lampirkan berkas digital. Berkas ini akan langsung terkirim ke pembeli seketika setelah pembayaran terkonfirmasi.'}
                </p>
              </div>

              <form onSubmit={handleSaveProject} className="creator-modal-form">
                {/* 1. SECTION: GAMBAR PROFILE / COVER PRODUK */}
                <div className="creator-form-field full-col">
                  <label>
                    Foto Cover / Gambar Profil Produk <span>*</span>
                  </label>
                  
                  {/* Selector Tabs: Upload File / Tautan URL / Preset */}
                  <div className="creator-img-tabs">
                    <button
                      type="button"
                      className={`creator-img-tab-btn ${imageTab === 'upload' ? 'is-active' : ''}`}
                      onClick={() => setImageTab('upload')}
                    >
                      📁 Unggah Cover
                    </button>
                    <button
                      type="button"
                      className={`creator-img-tab-btn ${imageTab === 'url' ? 'is-active' : ''}`}
                      onClick={() => setImageTab('url')}
                    >
                      🔗 Tautan URL Gambar
                    </button>
                    <button
                      type="button"
                      className={`creator-img-tab-btn ${imageTab === 'preset' ? 'is-active' : ''}`}
                      onClick={() => setImageTab('preset')}
                    >
                      🎨 Preset Siap Pakai
                    </button>
                  </div>

                  {/* Tab 1: Upload File */}
                  {imageTab === 'upload' && (
                    <div className="creator-upload-panel">
                      <input
                        type="file"
                        ref={fileInputRef}
                        accept="image/png, image/jpeg, image/jpg, image/webp"
                        style={{ display: 'none' }}
                        onChange={handleFileUpload}
                      />
                      {projImg.startsWith('data:image/') ? (
                        <div style={{ background: '#f0fdf4', border: '1.5px solid #86efac', borderRadius: '10px', padding: '12px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <img
                            src={projImg}
                            alt="Cover Terpilih"
                            style={{ width: '64px', height: '64px', objectFit: 'cover', borderRadius: '8px', border: '1px solid #bbf7d0', flexShrink: 0 }}
                          />
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <strong style={{ fontSize: '13px', color: '#166534', display: 'block', marginBottom: '2px' }}>
                              ✓ Foto Cover Berhasil Diunggah!
                            </strong>
                            <span style={{ fontSize: '11.5px', color: '#15803d', display: 'block', lineHeight: 1.4 }}>
                              Foto ini akan tampil di kartu katalog pembeli, halaman beranda, dan halaman detail produk.
                            </span>
                          </div>
                          <button
                            type="button"
                            className="button button-outline"
                            style={{ height: '32px', fontSize: '11px', padding: '0 12px', background: '#fff', flexShrink: 0 }}
                            onClick={() => fileInputRef.current?.click()}
                          >
                            Ganti Foto
                          </button>
                        </div>
                      ) : (
                        <div
                          className="creator-upload-dropzone"
                          onClick={() => fileInputRef.current?.click()}
                        >
                          <div className="upload-icon">📷</div>
                          <strong>{isProcessingImg ? 'Memproses gambar...' : 'Klik untuk Pilih Foto Cover dari Perangkat'}</strong>
                          <small>Mendukung format PNG, JPG, JPEG, atau WebP (Otomatis dioptimalkan)</small>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Tab 2: Custom URL */}
                  {imageTab === 'url' && (
                    <div className="creator-url-panel">
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <input
                          type="url"
                          placeholder="https://images.unsplash.com/... atau URL gambar langsung"
                          value={customImgUrl}
                          onChange={(e) => setCustomImgUrl(e.target.value)}
                        />
                        <button
                          type="button"
                          className="button button-dark"
                          style={{ height: '42px', padding: '0 16px', fontSize: '13px' }}
                          onClick={handleApplyCustomUrl}
                        >
                          Terapkan
                        </button>
                      </div>
                      <small style={{ color: '#7a7c82', marginTop: '4px', display: 'block' }}>
                        Masukkan link gambar dari internet (Unsplash, Imgur, Cloudinary, dsb).
                      </small>
                    </div>
                  )}

                  {/* Tab 3: Presets */}
                  {imageTab === 'preset' && (
                    <div className="creator-cover-presets">
                      {[
                        { id: 'photo-1460925895917-afdab827c52f', name: 'UI / Code' },
                        { id: 'photo-1490481651871-ab68de25d43d', name: 'Editorial Art' },
                        { id: 'photo-1455390582262-044cdead277a', name: 'Typography' },
                        { id: 'photo-1498050108023-c5249f4df085', name: 'Modern Minimal' },
                      ].map((preset) => (
                        <button
                          key={preset.id}
                          type="button"
                          className={`cover-preset-btn ${projImg === preset.id ? 'is-selected' : ''}`}
                          onClick={() => setProjImg(preset.id)}
                        >
                          <span
                            className="cover-preset-thumb"
                            style={{
                              backgroundImage: `url(https://images.unsplash.com/${preset.id}?auto=format&fit=crop&w=150&q=70)`,
                            }}
                          />
                          <span>{preset.name}</span>
                        </button>
                      ))}
                    </div>
                  )}

                  {/* Live Cover Preview */}
                  <div className="creator-cover-preview-box">
                    <div
                      className="creator-cover-preview-thumb"
                      style={{
                        backgroundImage: `url(${getProductImageUrl(projImg)})`,
                      }}
                    />
                    <div className="creator-cover-preview-info">
                      <span className="preview-label">PRATINJAU COVER AKTIF</span>
                      <strong className="preview-status">
                        {projImg.startsWith('data:image/')
                          ? '✅ Gambar Kustom dari Perangkat'
                          : projImg.startsWith('http')
                            ? '🔗 Gambar dari URL Luar'
                            : '🎨 Preset PojokPixel'}
                      </strong>
                      <small>Gambar ini akan tampil di kartu katalog pembeli dan halaman detail produk.</small>
                    </div>
                  </div>

                  <div className="creator-gallery-editor">
                    <div className="creator-gallery-editor-heading">
                      <div>
                        <strong>Gambar tambahan untuk galeri</strong>
                        <small>Tambahkan sampai 4 gambar untuk memperjelas isi produk di halaman detail.</small>
                      </div>
                      <span>{projGalleryImages.length}/4</span>
                    </div>
                    <label className={`creator-gallery-upload ${isProcessingImg || projGalleryImages.length >= 4 ? 'is-disabled' : ''}`}>
                      <input
                        type="file"
                        accept="image/png,image/jpeg,image/webp"
                        multiple
                        disabled={isProcessingImg || projGalleryImages.length >= 4}
                        onChange={handleGalleryUpload}
                      />
                      {isProcessingImg ? 'Memproses gambar...' : 'Pilih beberapa gambar'}
                    </label>
                    {projGalleryImages.length > 0 && (
                      <div className="creator-gallery-grid">
                        {projGalleryImages.map((image, index) => (
                          <div className="creator-gallery-thumb" key={`${index}-${image.slice(0, 32)}`}>
                            <img src={getProductImageUrl(image)} alt={`Gambar tambahan ${index + 1}`} />
                            <button type="button" onClick={() => setProjGalleryImages((current) => current.filter((_, itemIndex) => itemIndex !== index))} aria-label={`Hapus gambar tambahan ${index + 1}`}>×</button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* 2. Judul Project */}
                <div className="creator-form-field">
                  <label htmlFor="proj-name">
                    Judul Project / Nama Produk <span>*</span>
                  </label>
                  <input
                    id="proj-name"
                    type="text"
                    required
                    placeholder="Contoh: Nordic Editorial Poster Collection"
                    value={projName}
                    onChange={(e) => setProjName(e.target.value)}
                  />
                </div>

                {/* 3. Kategori & Harga */}
                <div className="creator-form-row-2">
                  <div className="creator-form-field">
                    <label htmlFor="proj-cat">
                      Kategori <span>*</span>
                    </label>
                    <select
                      id="proj-cat"
                      value={projCategory}
                      onChange={(e) => setProjCategory(e.target.value as any)}
                    >
                      <option value="Template Website">Template Website</option>
                      <option value="Template Poster">Template Poster</option>
                      <option value="Pembelajaran Digital">Pembelajaran Digital</option>
                      <option value="Bundel Produk">Bundel Produk</option>
                    </select>
                  </div>

                  <div className="creator-form-field">
                    <label htmlFor="proj-price">
                      Harga Jual (Rp) <span>*</span>
                    </label>
                    <input
                      id="proj-price"
                      type="number"
                      min="0"
                      step="1000"
                      required
                      placeholder="39000 (0 jika Gratis)"
                      value={projPrice}
                      onChange={(e) => setProjPrice(e.target.value)}
                    />
                  </div>
                </div>

                {/* 4. Harga Coret & Tag */}
                <div className="creator-form-row-2">
                  <div className="creator-form-field">
                    <label htmlFor="proj-orig">Harga Coret Diskon (Rp)</label>
                    <input
                      id="proj-orig"
                      type="number"
                      min="0"
                      step="1000"
                      placeholder="59000"
                      value={projOriginalPrice}
                      onChange={(e) => setProjOriginalPrice(e.target.value)}
                    />
                  </div>

                  <div className="creator-form-field">
                    <label htmlFor="proj-tag">Tag Label Promosi</label>
                    <input
                      id="proj-tag"
                      type="text"
                      placeholder="12 Template / Best Seller"
                      value={projTag}
                      onChange={(e) => setProjTag(e.target.value)}
                    />
                  </div>
                </div>

                {/* 5. Badge Label */}
                <div className="creator-form-field">
                  <label htmlFor="proj-label">Label Badge Produk</label>
                  <input
                    id="proj-label"
                    type="text"
                    placeholder="Baru / Terlaris / Diskon / Gratis"
                    value={projLabel}
                    onChange={(e) => setProjLabel(e.target.value)}
                  />
                </div>

                {/* 6. Format File */}
                <div className="creator-form-field">
                  <label htmlFor="proj-formats">
                    Format Berkas Digital (Pisahkan dengan koma) <span>*</span>
                  </label>
                  <input
                    id="proj-formats"
                    type="text"
                    required
                    placeholder="Figma (.fig), HTML5, Tailwind CSS"
                    value={projFormats}
                    onChange={(e) => setProjFormats(e.target.value)}
                  />
                </div>

                {/* 7. Deskripsi */}
                <div className="creator-form-field">
                  <label htmlFor="proj-desc">
                    Deskripsi Singkat Project <span>*</span>
                  </label>
                  <textarea
                    id="proj-desc"
                    rows={3}
                    required
                    placeholder="Jelaskan fitur utama, isi paket berkas, dan manfaat produk digital ini bagi pembeli..."
                    value={projDesc}
                    onChange={(e) => setProjDesc(e.target.value)}
                  />
                </div>

                <div className="creator-form-field full-col">
                  <label htmlFor="proj-video-url">Video preview produk <small>(opsional)</small></label>
                  <input
                    id="proj-video-url"
                    type="url"
                    placeholder="https://youtu.be/... atau tautan video .mp4"
                    value={projVideoUrl}
                    onChange={(e) => setProjVideoUrl(e.target.value)}
                  />
                  <small style={{ color: '#7a7c82' }}>Tautan YouTube, Vimeo, atau video langsung .mp4/.webm akan ditampilkan di halaman detail produk.</small>
                </div>

                {/* ====================================================================
                    8. SECTION BARU: PENGIRIMAN BERKAS DIGITAL KE PEMBELI (KOMBINASI)
                   ==================================================================== */}
                <div className="creator-form-field full-col" style={{ borderTop: '1.5px dashed #dedcd5', paddingTop: '16px', marginTop: '8px' }}>
                  <div style={{ marginBottom: '12px' }}>
                    <span className="creator-eyebrow" style={{ color: '#e65416' }}>PENGIRIMAN FILE KE PEMBELI (KOMBINASI)</span>
                    <label style={{ fontSize: '15px', fontWeight: 700, margin: '2px 0 4px', display: 'block' }}>
                      Lampiran File Digital & Link Akses Cloud
                    </label>
                    <p style={{ color: '#55575d', fontSize: '12.5px', lineHeight: 1.5, margin: '0 0 8px' }}>
                      PojokPixel mendukung sistem pengiriman kombinasi: Berkas file langsung (.zip, .fig, .pdf) <strong>DAN/ATAU</strong> tautan cloud (Google Drive, Figma). Pembeli akan langsung menerima akses dan dapat mengunduh ulang kapan saja lewat menu Riwayat Pembelian.
                    </p>
                    <div style={{ background: '#fff7ed', border: '1px solid #fed7aa', borderRadius: '8px', padding: '8px 12px', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: '#9a3412' }}>
                      <span>💡</span>
                      <span><strong>Tips Kombinasi:</strong> Kamu bisa mengisi berkas file offline sekaligus menautkan link Figma/Drive live agar pembeli mendapat pengalaman terbaik.</span>
                    </div>
                  </div>

                  {/* Kombinasi 1: Unggah Berkas File Langsung */}
                  <div style={{ marginBottom: '16px', background: '#faf9f5', border: '1px solid #e7e5dc', borderRadius: '10px', padding: '14px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                      <strong style={{ fontSize: '13px', color: '#2d2f34' }}>1. Berkas File Langsung (.ZIP, .FIG, .PDF, .PSD, .RAR)</strong>
                      {attachedFile && (
                        <span style={{ fontSize: '11px', background: '#dcfce7', color: '#166534', padding: '2px 8px', borderRadius: '10px', fontWeight: 600 }}>
                          ✓ Berkas Terlampir
                        </span>
                      )}
                    </div>
                    
                    <input
                      type="file"
                      ref={projectFileRef}
                      accept=".zip,.rar,.7z,.fig,.pdf,.psd,.ai,.sketch,.json,.txt,application/zip,application/x-zip-compressed,application/octet-stream"
                      style={{ display: 'none' }}
                      onChange={handleProjectFileUpload}
                    />

                    {attachedFile ? (
                      <div className="creator-attached-file-box" style={{ background: '#fff', border: '1.5px solid #22c55e' }}>
                        <div className="file-box-left">
                          <span className="file-box-icon">📦</span>
                          <div>
                            <strong className="file-box-name">{attachedFile.fileName}</strong>
                            <span className="file-box-size">{attachedFile.fileSize} • Siap dikirim & diunduh pembeli</span>
                          </div>
                        </div>
                        <div style={{ display: 'flex', gap: '6px' }}>
                          <button
                            type="button"
                            className="button button-outline"
                            style={{ height: '32px', fontSize: '11px', padding: '0 10px' }}
                            onClick={() => projectFileRef.current?.click()}
                          >
                            Ganti Berkas
                          </button>
                          <button
                            type="button"
                            className="button button-outline"
                            style={{ height: '32px', fontSize: '11px', padding: '0 10px', color: '#dc2626', borderColor: '#fca5a5' }}
                            onClick={() => setAttachedFile(null)}
                          >
                            Hapus
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div
                        className="creator-upload-dropzone"
                        style={{ padding: '20px 14px', background: '#fff' }}
                        onClick={() => projectFileRef.current?.click()}
                      >
                        <div className="upload-icon">📦</div>
                        <strong>Klik untuk Mengunggah Berkas Project Digital</strong>
                        <small>Mendukung .ZIP, .FIG, .PDF, .PSD, .RAR (Otomatis dapat diunduh ulang oleh pembeli)</small>
                      </div>
                    )}
                  </div>

                  {/* Kombinasi 2: Link Cloud Akses */}
                  <div style={{ marginBottom: '16px', background: '#faf9f5', border: '1px solid #e7e5dc', borderRadius: '10px', padding: '14px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                      <strong style={{ fontSize: '13px', color: '#2d2f34' }}>2. Tautan Cloud / Template Live (Opsional jika sudah ada file)</strong>
                      {projAccessUrl.trim() && (
                        <span style={{ fontSize: '11px', background: '#e0e7ff', color: '#3730a3', padding: '2px 8px', borderRadius: '10px', fontWeight: 600 }}>
                          ✓ Link Cloud Aktif
                        </span>
                      )}
                    </div>
                    <input
                      type="url"
                      placeholder="https://drive.google.com/drive/folders/... atau https://www.figma.com/file/..."
                      value={projAccessUrl}
                      onChange={(e) => setProjAccessUrl(e.target.value)}
                      style={{ background: '#fff' }}
                    />
                    <small style={{ color: '#7a7c82', marginTop: '5px', display: 'block' }}>
                      Masukkan URL Google Drive, template Figma (duplicate link), Notion, atau Canva. Pembeli akan mendapatkan tombol akses instan ke cloud ini.
                    </small>
                  </div>

                  {/* Kombinasi 3: Optional Buyer Note / Password / Instructions */}
                  <div style={{ background: '#faf9f5', border: '1px solid #e7e5dc', borderRadius: '10px', padding: '14px' }}>
                    <label htmlFor="proj-note" style={{ fontSize: '13px', fontWeight: 700, color: '#2d2f34', display: 'block', marginBottom: '6px' }}>
                      3. Catatan Pembeli / Password ZIP / Panduan Akses (Opsional)
                    </label>
                    <input
                      id="proj-note"
                      type="text"
                      placeholder="Contoh: Password ZIP: pixel2026 atau Harap instal font Inter sebelum membuka Figma"
                      value={projBuyerNote}
                      onChange={(e) => setProjBuyerNote(e.target.value)}
                      style={{ background: '#fff' }}
                    />
                    <small style={{ color: '#7a7c82', marginTop: '4px', display: 'block' }}>
                      Pesan khusus ini akan ditampilkan di ringkasan pembayaran dan di menu Riwayat Pembelian pembeli.
                    </small>
                  </div>
                </div>

                {/* Modal Actions */}
                <div className="creator-modal-actions">
                  <button
                    type="submit"
                    className="button button-orange"
                    style={{ height: '46px', padding: '0 24px', fontSize: '13px' }}
                  >
                    <span>
                      {modalMode === 'edit' ? '💾 Simpan Perubahan Project' : '🚀 Publikasikan Project Sekarang'}
                    </span>
                  </button>
                  <button
                    type="button"
                    className="button button-secondary"
                    onClick={() => setIsAddModalOpen(false)}
                  >
                    Batal
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
