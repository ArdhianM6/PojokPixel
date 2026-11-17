import { Component, type ReactNode } from 'react'

interface Props { children: ReactNode }
interface State { hasError: boolean; error?: Error }

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, info: { componentStack: string }) {
    console.error('PojokPixel Error:', error, info)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div
          style={{
            minHeight: '100dvh',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: 'var(--paper, #f5f5f2)',
            color: 'var(--ink, #303236)',
            fontFamily: "'DM Sans Variable', sans-serif",
            padding: '24px',
            textAlign: 'center',
          }}
        >
          {/* Error Icon */}
          <div
            style={{
              width: 72,
              height: 72,
              borderRadius: '50%',
              backgroundColor: '#fff4f0',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: 24,
              border: '2px solid #fde0d4',
            }}
          >
            <svg
              width="36"
              height="36"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#e65416"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
          </div>

          {/* Branding */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              marginBottom: 16,
            }}
          >
            <span
              style={{
                fontSize: 13,
                fontWeight: 600,
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                color: '#e65416',
              }}
            >
              Pojok Pixel
            </span>
          </div>

          {/* Title */}
          <h1
            style={{
              fontSize: 24,
              fontWeight: 700,
              margin: '0 0 12px',
              fontFamily: "'Space Grotesk Variable', sans-serif",
              color: 'var(--ink, #303236)',
            }}
          >
            Oops! Ada yang tidak beres
          </h1>

          {/* Description */}
          <p
            style={{
              fontSize: 15,
              color: 'var(--gray, #52555a)',
              maxWidth: 400,
              lineHeight: 1.6,
              margin: '0 0 8px',
            }}
          >
            Halaman ini mengalami kesalahan yang tidak terduga. Tim kami sudah diberitahu dan sedang menangani masalah ini.
          </p>
          <p
            style={{
              fontSize: 14,
              color: 'var(--gray, #52555a)',
              maxWidth: 400,
              lineHeight: 1.6,
              margin: '0 0 32px',
            }}
          >
            Coba muat ulang halaman atau kembali beberapa saat lagi.
          </p>

          {/* Reload Button */}
          <button
            onClick={() => window.location.reload()}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              padding: '12px 28px',
              backgroundColor: '#e65416',
              color: '#fff',
              border: 'none',
              borderRadius: 9999,
              fontSize: 15,
              fontWeight: 600,
              cursor: 'pointer',
              fontFamily: "'DM Sans Variable', sans-serif",
              transition: 'background-color 0.2s ease',
            }}
            onMouseEnter={e => (e.currentTarget.style.backgroundColor = '#f17945')}
            onMouseLeave={e => (e.currentTarget.style.backgroundColor = '#e65416')}
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="1 4 1 10 7 10" />
              <path d="M3.51 15a9 9 0 1 0 .49-5.49" />
            </svg>
            Muat Ulang Halaman
          </button>

          {/* Error detail (dev) */}
          {process.env.NODE_ENV === 'development' && this.state.error && (
            <details
              style={{
                marginTop: 32,
                maxWidth: 560,
                width: '100%',
                textAlign: 'left',
              }}
            >
              <summary
                style={{
                  cursor: 'pointer',
                  fontSize: 13,
                  color: 'var(--gray, #52555a)',
                  userSelect: 'none',
                }}
              >
                Detail error (hanya tampil di development)
              </summary>
              <pre
                style={{
                  marginTop: 12,
                  padding: '12px 16px',
                  backgroundColor: '#1a1a1c',
                  color: '#f0ede8',
                  borderRadius: 8,
                  fontSize: 12,
                  overflowX: 'auto',
                  whiteSpace: 'pre-wrap',
                  wordBreak: 'break-word',
                }}
              >
                {this.state.error.toString()}
              </pre>
            </details>
          )}
        </div>
      )
    }
    return this.props.children
  }
}
