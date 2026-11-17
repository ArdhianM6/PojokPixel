import React from 'react'
import { createRoot } from 'react-dom/client'
import '@fontsource-variable/dm-sans'
import '@fontsource/dm-mono/400.css'
import '@fontsource/dm-mono/500.css'
import '@fontsource-variable/space-grotesk'
import App from './App'
import './styles.css'
import { ErrorBoundary } from './components/ErrorBoundary'

// Pastikan selalu menggunakan tema asli Pojok Pixel
document.documentElement.removeAttribute('data-theme')
localStorage.removeItem('pojokpixel:theme')

createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </React.StrictMode>,
)
