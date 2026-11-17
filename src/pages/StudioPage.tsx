import { useState } from 'react'
import { usePageMeta } from '../hooks/usePageMeta'

interface StudioPageProps {
  playSound: (type: 'click' | 'pop' | 'success' | 'delete') => void
  notify: (msg: string) => void
  navigate: (path: string) => void
}

const PIXEL_PALETTE = ['#e65416', '#303236', '#d8d6c9', '#f5f5f2', '#52555a', '#ffffff']

export function StudioPage({ playSound, notify, navigate }: StudioPageProps) {
  usePageMeta('Pojok Studio — Kanvas Seni Piksel Interaktif', 'Studio pixel art retro gratis di Pojok Pixel. Gambar, eksplorasi palet warna, dan unduh kreasimu dalam format PNG.')

  const [pixelGrid, setPixelGrid] = useState<string[]>(() => Array(256).fill('#f5f5f2'))
  const [selectedColor, setSelectedColor] = useState('#e65416')
  const [studioTool, setStudioTool] = useState<'brush' | 'eraser'>('brush')
  const [isDrawing, setIsDrawing] = useState(false)

  const handlePixelClick = (index: number) => {
    playSound('click')
    const color = studioTool === 'brush' ? selectedColor : '#f5f5f2'
    setPixelGrid((prev) => {
      const copy = [...prev]
      copy[index] = color
      return copy
    })
  }

  const handlePixelHover = (index: number) => {
    if (!isDrawing) return
    const color = studioTool === 'brush' ? selectedColor : '#f5f5f2'
    setPixelGrid((prev) => {
      const copy = [...prev]
      copy[index] = color
      return copy
    })
  }

  const clearPixelGrid = () => {
    playSound('delete')
    setPixelGrid(Array(256).fill('#f5f5f2'))
    notify('Kanvas piksel dibersihkan!')
  }

  const loadPreset = (presetName: 'cube' | 'heart' | 'sparkle' | 'smile') => {
    playSound('success')
    const newGrid = Array(256).fill('#f5f5f2')
    const O = '#e65416'
    const I = '#303236'
    const C = '#d8d6c9'

    if (presetName === 'heart') {
      const heartIdxs = [
        35, 36, 43, 44,
        50, 51, 52, 53, 58, 59, 60, 61,
        66, 67, 68, 69, 70, 71, 72, 73, 74, 75, 76, 77,
        82, 83, 84, 85, 86, 87, 88, 89, 90, 91, 92, 93,
        99, 100, 101, 102, 103, 104, 105, 106, 107, 108,
        116, 117, 118, 119, 120, 121, 122, 123,
        133, 134, 135, 136, 137, 138,
        150, 151, 152, 153,
        167, 168
      ]
      heartIdxs.forEach((idx) => { newGrid[idx] = O })
    } else if (presetName === 'cube') {
      const topFace = [39, 40, 54, 55, 56, 57, 70, 71, 72, 73, 86, 87]
      const leftFace = [88, 102, 103, 104, 118, 119, 120, 134, 135, 136, 151, 152]
      const rightFace = [89, 105, 106, 107, 121, 122, 123, 137, 138, 139, 153, 154]
      topFace.forEach((i) => { newGrid[i] = O })
      leftFace.forEach((i) => { newGrid[i] = I })
      rightFace.forEach((i) => { newGrid[i] = C })
    } else if (presetName === 'sparkle') {
      const center = [119, 120, 135, 136]
      const rays = [23, 39, 55, 71, 87, 103, 151, 167, 183, 199, 215, 231, 114, 115, 116, 117, 118, 121, 122, 123, 124, 125]
      center.forEach((i) => { newGrid[i] = O })
      rays.forEach((i) => { newGrid[i] = I })
    } else if (presetName === 'smile') {
      const eyes = [68, 69, 74, 75, 84, 85, 90, 91]
      const smile = [146, 157, 163, 164, 165, 166, 167, 168, 169, 170, 171, 172]
      eyes.forEach((i) => { newGrid[i] = I })
      smile.forEach((i) => { newGrid[i] = O })
    }

    setPixelGrid(newGrid)
    notify(`Template "${presetName}" berhasil dimuat!`)
  }

  const downloadPixelArt = () => {
    playSound('success')
    const canvas = document.createElement('canvas')
    canvas.width = 320
    canvas.height = 320
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const cellSize = 20
    pixelGrid.forEach((color, i) => {
      const x = (i % 16) * cellSize
      const y = Math.floor(i / 16) * cellSize
      ctx.fillStyle = color
      ctx.fillRect(x, y, cellSize, cellSize)
    })

    const dataUrl = canvas.toDataURL('image/png')
    const a = document.createElement('a')
    a.href = dataUrl
    a.download = 'pojokpixel-karya.png'
    a.click()
    notify('Piksel kreasimu berhasil diunduh (PNG)!')
  }

  return (
    <div className="studio-page-wrap">
      {/* Studio Header Banner */}
      <section className="catalog-hero-header">
        <div className="app-container">
          <nav className="detail-breadcrumb" aria-label="Breadcrumb">
            <a href="/" onClick={(e) => { e.preventDefault(); navigate('/') }}>Beranda</a>
            <span aria-hidden="true">›</span>
            <span aria-current="page">Pojok Studio</span>
          </nav>
          <div className="catalog-header-content">
            <span className="eyebrow"><span /> FITUR EKSPLORASI KREATIF</span>
            <h1 className="catalog-page-title">Pojok Studio — Kanvas Piksel Retro</h1>
            <p className="catalog-page-subtitle">
              Ruang bermain piksel 16×16 dengan palet asli Pojok Pixel. Gambar ide retro kamu dan unduh gratis dalam format PNG.
            </p>
          </div>
        </div>
      </section>

      {/* Main Studio Interactive Section */}
      <section className="studio-section" id="studio" style={{ paddingTop: '24px' }}>
        <div className="app-container">
          <div className="studio-panel-grid">
            {/* Left Column: Canvas */}
            <div className="studio-canvas-col">
              <div
                className="pixel-canvas-frame"
                onMouseDown={() => setIsDrawing(true)}
                onMouseUp={() => setIsDrawing(false)}
                onMouseLeave={() => setIsDrawing(false)}
              >
                <div className="pixel-grid-16">
                  {pixelGrid.map((color, index) => (
                    <button
                      type="button"
                      key={index}
                      className="pixel-cell"
                      style={{ backgroundColor: color }}
                      onClick={() => handlePixelClick(index)}
                      onMouseEnter={() => handlePixelHover(index)}
                      aria-label={`Piksel baris ${Math.floor(index / 16) + 1}, kolom ${(index % 16) + 1}`}
                    />
                  ))}
                </div>
                <div className="canvas-frame-footer">
                  <span>KANVAS: 16×16 GRID</span>
                  <span>FORMAT: PNG 320PX</span>
                </div>
              </div>
            </div>

            {/* Right Column: Toolbox Controls */}
            <div className="studio-tools-col">
              <div className="studio-card">
                <span className="studio-card-kicker">ALAT MENGGAMBAR</span>
                <h4>Pilih Mode Alat</h4>
                <div className="tool-btn-group">
                  <button
                    type="button"
                    className={`tool-switch-btn ${studioTool === 'brush' ? 'active' : ''}`}
                    onClick={() => {
                      playSound('click')
                      setStudioTool('brush')
                    }}
                  >
                    <span>Kuas Piksel</span>
                  </button>
                  <button
                    type="button"
                    className={`tool-switch-btn ${studioTool === 'eraser' ? 'active' : ''}`}
                    onClick={() => {
                      playSound('click')
                      setStudioTool('eraser')
                    }}
                  >
                    <span>Penghapus</span>
                  </button>
                </div>

                <span className="studio-card-kicker mt-6">PALET WARNA RESMI</span>
                <div className="palette-swatches">
                  {PIXEL_PALETTE.map((c) => (
                    <button
                      type="button"
                      key={c}
                      className={`palette-swatch ${selectedColor === c && studioTool === 'brush' ? 'selected' : ''}`}
                      style={{ backgroundColor: c }}
                      onClick={() => {
                        playSound('click')
                        setSelectedColor(c)
                        setStudioTool('brush')
                      }}
                      aria-label={`Pilih warna ${c}`}
                    />
                  ))}
                </div>

                <span className="studio-card-kicker mt-6">TEMPLATE KARYA SIAP PAKAI</span>
                <div className="preset-btn-row">
                  <button
                    type="button"
                    className="preset-btn"
                    onClick={() => loadPreset('heart')}
                  >
                    ❤️ Hati
                  </button>
                  <button
                    type="button"
                    className="preset-btn"
                    onClick={() => loadPreset('cube')}
                  >
                    📦 Kubus
                  </button>
                  <button
                    type="button"
                    className="preset-btn"
                    onClick={() => loadPreset('sparkle')}
                  >
                    ✨ Kilau
                  </button>
                  <button
                    type="button"
                    className="preset-btn"
                    onClick={() => loadPreset('smile')}
                  >
                    😊 Senyum
                  </button>
                </div>

                <div className="studio-action-row">
                  <button
                    type="button"
                    className="button button-dark w-full justify-center"
                    onClick={downloadPixelArt}
                  >
                    <span>Unduh Karya (PNG)</span>
                  </button>
                  <button
                    type="button"
                    className="button button-secondary w-full justify-center"
                    onClick={clearPixelGrid}
                  >
                    <span>Bersihkan Kanvas</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
