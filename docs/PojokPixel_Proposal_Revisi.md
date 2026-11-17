# Proposal PojokPixel
## Revisi berdasarkan implementasi aplikasi saat ini

**Status dokumen:** revisi proposal; bukan spesifikasi bahwa seluruh layanan sudah siap produksi.  
**Tanggal revisi:** 17 November 2026

### 1. Ringkasan eksekutif

PojokPixel adalah prototipe marketplace aset digital untuk pelajar, kreator, UMKM, dan pemilik usaha. Aplikasi saat ini menyediakan katalog dan detail produk, akun dan profil, favorit, keranjang, simulasi checkout, riwayat pesanan lokal, area kreator berbasis browser, serta studio pixel art sederhana. Fondasi teknis proyek memakai React, Hono, Drizzle ORM, dan PostgreSQL.

Beberapa bagian antarmuka sudah terhubung ke akun dan API, sementara katalog yang tampil, keranjang/pesanan, dan data kreator masih memakai data contoh atau penyimpanan browser. Pembayaran belum terhubung ke penyedia pembayaran dan unduhan belum menjadi distribusi file produksi. Karena itu, dokumen ini membedakan kemampuan prototipe dari rencana komersial.

### 2. Masalah dan sasaran pengguna

Pengguna sering memerlukan aset visual siap pakai untuk tugas, promosi, dan pekerjaan kreatif, tetapi pilihan, format, harga, serta ketentuan penggunaan dapat tersebar di banyak tempat. PojokPixel menguji pengalaman menemukan aset digital dalam satu katalog dengan deskripsi dan informasi produk yang mudah dipahami.

Sasaran awal yang diusulkan adalah pelajar dan mahasiswa, UMKM, kreator/freelancer, serta pengajar dan komunitas. Segmen dan kebutuhan ini perlu divalidasi melalui wawancara dan uji penggunaan.

### 3. Fitur yang tersedia pada aplikasi

| Area | Kemampuan yang terlihat di proyek | Status implementasi |
|---|---|---|
| Beranda dan katalog | Jelajah produk, kategori, pencarian/filter, sorotan dan halaman detail | Antarmuka berfungsi; katalog utama memakai data contoh di frontend |
| Akun | Daftar/masuk dan pelengkapan profil menggunakan Better Auth | Terhubung dengan API autentikasi; tidak ada role buyer/creator/admin yang diterapkan sebagai izin akun |
| Favorit dan keranjang | Menyimpan item pilihan dan isi keranjang | Disimpan di localStorage pada browser |
| Checkout | Memilih metode dan melihat alur sukses | Simulasi; tidak ada konfirmasi pembayaran dari payment gateway |
| Pesanan dan unduhan | Riwayat pembelian dan kontrol unduhan pada UI | Status/pesanan demo disimpan lokal; distribusi file produksi belum tersedia |
| Area kreator | Profil kreator serta membuat, mengedit, dan menghapus listing | Data disimpan di localStorage; belum ada moderasi/server multi-vendor |
| Studio pixel art | Editor pixel sederhana dan ekspor PNG | Fitur sisi-klien |
| Tentang dan tim | Informasi proyek dan anggota tim | Data tim juga tersedia melalui endpoint API |
| API dan basis data | Hono menyediakan health check, endpoint produk/tim, dan endpoint Better Auth | Drizzle/PostgreSQL menjadi fondasi backend; endpoint katalog belum menjadi sumber katalog utama yang ditampilkan |

Angka penjualan, rating, testimoni, badge, dan label pemasaran yang tampil dari data frontend harus dianggap sebagai konten contoh, bukan metrik bisnis terverifikasi. Produk buatan kreator yang disimpan lokal hanya terlihat pada browser/perangkat yang menyimpannya.

### 4. Peran pengguna dan akses

Pada implementasi saat ini, akun adalah akun pengguna umum untuk autentikasi dan profil. Belum ada sistem hak akses berbasis peran yang membedakan pembeli, kreator, dan administrator. Area kreator terbuka sebagai alur antarmuka berbasis browser dan penanda lokal, bukan bukti bahwa akun telah disetujui atau listing telah diterbitkan secara terpusat.

Untuk tahap prototipe, proposal memakai istilah **pengguna** dan **pengunjung**. “Kreator” menjelaskan alur lokal yang dicoba di aplikasi, bukan role akun dengan izin backend. Role pembeli/kreator/admin, pemeriksaan izin, moderasi, dan pengelolaan vendor dicatat sebagai kebutuhan pengembangan lanjutan.

### 5. Arsitektur dan batas operasional

- **Frontend:** React dan TypeScript, dengan halaman katalog, autentikasi, akun, kreator, pesanan, dan studio.
- **API:** Hono menyediakan pemeriksaan kesehatan, endpoint produk dan tim, serta handler autentikasi.
- **Data:** Drizzle ORM dan PostgreSQL tersedia pada backend. Katalog antarmuka, keranjang, favorit, pesanan demo, dan sebagian data kreator saat ini memakai data frontend/localStorage.
- **Autentikasi:** Better Auth mengelola alur akun. Autentikasi tidak sama dengan payment processing atau kontrol role marketplace.
- **Pembayaran dan distribusi:** checkout merupakan simulasi; nama metode pembayaran di UI bukan bukti integrasi. Pengiriman aset berbayar dan proteksi file belum siap produksi.

### 6. Model usaha dan asumsi awal

Model yang diusulkan adalah penjualan aset digital satuan dan bundel, dengan pilihan produk gratis untuk menarik pengguna. Rentang harga awal dari proposal:

| Jenis produk | Rentang harga usulan |
|---|---:|
| Template website | Rp49.000–Rp199.000 |
| Poster digital | Rp15.000–Rp39.000 |
| Materi pembelajaran digital | Rp50.000–Rp99.000 |
| Bundel produk | Rp59.000–Rp249.000 |

Rentang harga, komisi platform, dan skema bagi hasil adalah hipotesis bisnis. Proposal awal menyebut komisi platform sekitar 20% dan porsi kreator sekitar 80%; aplikasi belum menghitung atau membayarkan pembagian tersebut.

Anggaran awal pada tabel proposal berjumlah **Rp16.000.000 untuk 12 bulan**, terdiri dari hosting Rp4.000.000, domain/email/layanan teknis Rp1.000.000, kurasi katalog Rp4.000.000, pemasaran Rp3.000.000, administrasi/biaya transaksi Rp1.000.000, dan cadangan Rp3.000.000. Angka adalah estimasi yang perlu diverifikasi sebelum pengeluaran. Target transaksi dan pendanaan bukan hasil aktual.

### 7. Tim

| Anggota | Peran yang diusulkan |
|---|---|
| Ardhian Maulana Tanjung | CEO, riset produk/pasar, backend, API, prioritas fitur, koordinasi |
| Aulia Ryansifa Wardah | CTO, frontend, deployment, pemeliharaan, sysadmin |
| Khoirunnisa Salsabila Osmon | Manajemen produk, riset pengguna, marketing, kurasi konten/katalog, pengujian |

Pembagian ini merupakan usulan kerja tim dalam proposal, bukan role akses di dalam aplikasi.

### 8. Tahapan pengembangan yang diusulkan

1. **Validasi dan stabilisasi prototipe:** uji katalog dan studio dengan calon pengguna; perbaiki tampilan responsif, data contoh, dan alur akun.
2. **MVP operasional:** jadikan API/database sumber katalog, tambah pengelolaan katalog, role dan izin yang eksplisit, penyimpanan pesanan server, serta kebijakan lisensi.
3. **Transaksi nyata:** evaluasi dan integrasikan payment gateway, verifikasi webhook, rekonsiliasi, refund, invoice, dan distribusi file yang terkendali.
4. **Uji kreator terbatas:** unggah produk ke server, proses kurasi/moderasi, persetujuan kreator, pencatatan komisi, dan laporan.
5. **Pertumbuhan:** uji harga, bundel, referral, analitik, ulasan terverifikasi, serta ekspansi katalog berdasarkan hasil validasi.

Urutan dan jadwal final perlu ditetapkan setelah penilaian kapasitas tim, keamanan, dan biaya layanan.

### 9. Risiko dan tindak lanjut

| Risiko/kesenjangan | Tindak lanjut |
|---|---|
| Data lokal dapat hilang dan tidak tersinkron antarperangkat | Pindahkan data penting ke API/database dan siapkan backup |
| Checkout demo dapat disalahartikan sebagai pembayaran nyata | Labeli status simulasi dengan jelas sampai gateway terintegrasi |
| File unduhan demo bukan distribusi produk yang terjamin | Sediakan penyimpanan file, otorisasi, dan pencatatan akses |
| Belum ada role/izin kreator dan admin | Tetapkan matriks akses, validasi server, dan proses persetujuan |
| Data rating/penjualan contoh tampak seperti klaim aktual | Ganti dengan data terverifikasi atau tandai sebagai contoh |
| Lisensi dan hak cipta produk belum menjadi alur operasional | Minta bukti hak distribusi dan sediakan proses laporan/takedown |
| Perkiraan biaya dan pendapatan belum tervalidasi | Uji biaya penyedia, harga, permintaan, dan komisi sebelum peluncuran |

### 10. Penutup

PojokPixel saat ini merupakan prototipe antarmuka marketplace dengan akun terhubung ke backend dan beberapa pengalaman produk yang berjalan lokal di browser. Proposal ini mempertahankan arah marketplace aset digital, tetapi menyajikan secara akurat bagian yang sudah dibuat, batas demo saat ini, dan pekerjaan yang dibutuhkan sebelum menerima pembayaran atau menjalankan marketplace multi-kreator secara nyata.
