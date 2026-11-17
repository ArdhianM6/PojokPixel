import { useEffect } from 'react'

const GA_ID = (import.meta as unknown as { env: Record<string, string> }).env.VITE_GA_ID as string | undefined

declare global {
  interface Window {
    dataLayer: unknown[]
    gtag?: (...args: unknown[]) => void
  }
}

export function Analytics() {
  useEffect(() => {
    if (!GA_ID || !(import.meta as unknown as { env: Record<string, string> }).env.PROD) return

    // Inject GA4 script
    const script = document.createElement('script')
    script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_ID}`
    script.async = true
    document.head.appendChild(script)

    // Initialize dataLayer and gtag
    window.dataLayer = window.dataLayer || []
    function gtag(...args: unknown[]) {
      window.dataLayer.push(args)
    }
    window.gtag = gtag
    gtag('js', new Date())
    gtag('config', GA_ID, { page_path: window.location.pathname })
  }, [])

  return null
}

/** Track a custom GA4 event from anywhere in the app */
export function trackEvent(eventName: string, params?: Record<string, unknown>) {
  if (typeof window !== 'undefined' && typeof window.gtag === 'function') {
    window.gtag('event', eventName, params)
  }
}
