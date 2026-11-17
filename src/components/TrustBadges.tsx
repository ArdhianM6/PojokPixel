export function TrustBadges() {
  return (
    <section className="trust-strip" aria-label="Metode pembayaran dan jaminan keamanan">
      <div className="app-container">
        <div className="trust-badges-row">
          {/* Payment Methods */}
          <div className="trust-payments">
            <span className="trust-label">Metode Pembayaran:</span>
            <div className="trust-payment-list">
              <span className="trust-payment-badge">QRIS</span>
              <span className="trust-payment-badge">GoPay</span>
              <span className="trust-payment-badge">OVO</span>
              <span className="trust-payment-badge">Dana</span>
              <span className="trust-payment-badge">ShopeePay</span>
              <span className="trust-payment-badge">BCA Virtual Account</span>
              <span className="trust-payment-badge">Mandiri</span>
              <span className="trust-payment-badge">VISA / Mastercard</span>
            </div>
          </div>

          {/* Trust indicators */}
          <div className="trust-secure-list">
            <div className="trust-secure-item">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
              <span>Transaksi Aman</span>
            </div>
            <div className="trust-secure-item">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>
              <span>Unduhan Instan</span>
            </div>
            <div className="trust-secure-item">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M20.8 8.8c0 4.5-8.8 10-8.8 10s-8.8-5.5-8.8-10a4.5 4.5 0 0 1 8.8-1.1 4.5 4.5 0 0 1 8.8 1.1Z"/></svg>
              <span>Lisensi Komersial</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
