# PojokPixel

Marketplace untuk template website, poster digital, dan pembelajaran desain. Identitas visual memakai oranye `#E65416`, beige `#D8D6C9`, off-white `#F5F5F2`, abu-abu `#52555A`, dan charcoal `#303236`. Logo kubus pixel tersedia di `public/pojokpixel-mark.svg`.

## Menjalankan frontend

```sh
npm.cmd install
npm.cmd run dev:all
```

`dev:all` menjalankan frontend dan API bersamaan di satu terminal. Frontend tersedia di `http://localhost:5173`, API di `http://localhost:3001`.

## Menjalankan API dan PostgreSQL

1. Buat database PostgreSQL, lalu pastikan `.env` di folder utama berisi `DATABASE_URL` dan `PORT` (lihat `.env.example`).
2. Instal dependensi dengan `npm.cmd install`.
3. Buat dan jalankan migrasi menggunakan `npm.cmd run db:generate`, lalu `npm.cmd run db:migrate`.
4. Isi data contoh tim dan produk dengan `npm.cmd run db:seed`.
5. Periksa koneksi langsung ke PostgreSQL memakai `npm.cmd run db:test`.
6. Jalankan API dengan `npm.cmd run dev:api` (default `http://localhost:3001`).

### Login dan pendaftaran

Better Auth memakai PostgreSQL yang sama. Tambahkan konfigurasi autentikasi ke `.env` (lihat `.env.example`):

- `BETTER_AUTH_SECRET`: rahasia acak minimal 32 karakter.
- `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` dan `GITHUB_CLIENT_ID` / `GITHUB_CLIENT_SECRET`: kredensial OAuth. Callback lokal: `http://localhost:3001/api/auth/callback/google` dan `http://localhost:3001/api/auth/callback/github`.
- `VITE_TURNSTILE_SITE_KEY` / `TURNSTILE_SECRET_KEY`: kunci widget dan verifikasi Cloudflare Turnstile.
- `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, dan `SMTP_FROM`: server email untuk tautan verifikasi pendaftaran.
- `APP_URL` dan `BETTER_AUTH_URL`: alamat frontend dan API; sesuaikan saat memakai domain production.

Setelah menambahkan skema autentikasi, buat dan terapkan migrasi dengan `npm.cmd run db:generate` dan `npm.cmd run db:migrate`. Menu masuk tersedia di `/login`, daftar di `/register`, dan dashboard hanya terbuka setelah sesi aktif serta profil lengkap.

### Konfigurasi saat aplikasi di-hosting

Gunakan kredensial produksi dari provider masing-masing; jangan gunakan kunci uji Turnstile. Simpan nilai rahasia di pengaturan environment hosting, bukan di Git atau kode frontend.

- `APP_URL`: origin website frontend, misalnya `https://pojokpixel.id`.
- `VITE_API_URL` dan `BETTER_AUTH_URL`: origin API, misalnya `https://api.pojokpixel.id` (tanpa `/api/auth`). `VITE_API_URL` adalah nilai publik yang dipakai frontend; dua nilai server lainnya tetap diatur pada environment backend.
- `BETTER_AUTH_SECRET`: rahasia acak yang kuat dan khusus production.
- `VITE_TURNSTILE_SITE_KEY`: site key production untuk hostname frontend.
- `TURNSTILE_SECRET_KEY`: secret Turnstile yang hanya disimpan di environment backend.
- `SMTP_HOST`, `SMTP_PORT`, `SMTP_SECURE`, `SMTP_USER`, `SMTP_PASS`, dan `SMTP_FROM`: konfigurasi SMTP dari layanan email yang dipilih.
- OAuth Google/GitHub: buat kredensial aplikasi web dan daftarkan callback API secara persis: `https://api.pojokpixel.id/api/auth/callback/google` dan `https://api.pojokpixel.id/api/auth/callback/github`.
- `DATABASE_URL`: connection string PostgreSQL production dari layanan hosting database.

Ganti contoh domain tersebut dengan domain akhir sebelum membuat Turnstile widget dan OAuth credentials. Better Auth dan CORS menolak origin yang belum dikonfigurasi saat backend berjalan dengan `NODE_ENV=production`.

### Sinkronisasi akun kreator

Profil kreator dan produk tersimpan pada PostgreSQL milik API, terhubung ke ID akun Better Auth. Setelah merilis pembaruan backend, jalankan `npm.cmd run db:migrate` terhadap `DATABASE_URL` production (atau jalankan perintah migrasi yang sama pada job deploy backend) sebelum pengguna membuka dashboard. Pastikan deployment Vercel frontend menggunakan `VITE_API_URL` yang menunjuk ke API tersebut.

Pada kunjungan pertama setelah pembaruan, browser yang masih memiliki profil kreator lama pada origin yang sama akan mengirimkannya ke server jika email profil cocok dengan email akun yang sedang masuk. Data yang tersimpan pada origin localhost tidak dapat dibaca oleh domain Vercel karena penyimpanan browser terpisah; data tersebut perlu dipindahkan secara manual sebelum origin lama tidak tersedia lagi.

Endpoint awal: `GET /api/health`, `GET /api/products`, dan `GET /api/team`.

## Tim Pojok Pixel

- Ardhian Maulana Tanjung
- Aulia Ryansifa Wardah
- Khoirunnisa Salsabila Osmon

Frontend katalog saat ini memakai data contoh agar tampilan dapat dieksplorasi tanpa database. API menyediakan pemeriksaan koneksi database dan endpoint untuk membaca produk serta anggota tim.
