interface SkeletonProps {
  className?: string
  style?: React.CSSProperties
}

/** Base skeleton block with shimmer animation */
export function Skeleton({ className = '', style }: SkeletonProps) {
  return <div className={`skeleton ${className}`} style={style} />
}

/** Skeleton that mimics a single ProductCard */
export function ProductCardSkeleton() {
  return (
    <div
      style={{
        borderRadius: 16,
        overflow: 'hidden',
        background: 'var(--paper, #f5f5f2)',
        border: '1px solid var(--border, #deddd6)',
        display: 'flex',
        flexDirection: 'column',
        gap: 0,
      }}
    >
      {/* Image placeholder */}
      <div className="skeleton skeleton-card" style={{ borderRadius: '16px 16px 0 0' }} />

      {/* Content placeholder */}
      <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: 10 }}>
        {/* Category tag */}
        <div className="skeleton skeleton-text-sm" style={{ width: '40%' }} />
        {/* Title */}
        <div className="skeleton skeleton-text" style={{ width: '90%' }} />
        <div className="skeleton skeleton-text" style={{ width: '65%' }} />
        {/* Price row */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 4 }}>
          <div className="skeleton skeleton-text" style={{ width: '30%', height: 18 }} />
          <div className="skeleton" style={{ width: 36, height: 36, borderRadius: '50%' }} />
        </div>
      </div>
    </div>
  )
}

/** Renders 6 ProductCardSkeleton in a responsive grid */
export function ProductGridSkeleton() {
  return (
    <div className="product-grid-skeleton">
      {Array.from({ length: 6 }).map((_, i) => (
        <ProductCardSkeleton key={i} />
      ))}
    </div>
  )
}
