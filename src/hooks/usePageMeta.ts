import { useEffect } from 'react'

/**
 * Dynamically updates document.title and key meta tags
 * for the current page or product view.
 *
 * @param title       Page/product title (without site suffix)
 * @param description Optional page-specific description
 */
export function usePageMeta(title: string, description?: string) {
  useEffect(() => {
    // --- document title ---
    document.title = title
      ? `${title} — Pojok Pixel`
      : 'Pojok Pixel — Marketplace Produk Digital'

    // --- og:title ---
    let ogTitle = document.querySelector<HTMLMetaElement>('meta[property="og:title"]')
    if (!ogTitle) {
      ogTitle = document.createElement('meta')
      ogTitle.setAttribute('property', 'og:title')
      document.head.appendChild(ogTitle)
    }
    ogTitle.content = document.title

    // --- meta description + og:description ---
    if (description) {
      const metaDesc = document.querySelector<HTMLMetaElement>('meta[name="description"]')
      if (metaDesc) metaDesc.content = description

      let ogDesc = document.querySelector<HTMLMetaElement>('meta[property="og:description"]')
      if (!ogDesc) {
        ogDesc = document.createElement('meta')
        ogDesc.setAttribute('property', 'og:description')
        document.head.appendChild(ogDesc)
      }
      ogDesc.content = description
    }
  }, [title, description])
}
