# SIBER EVIDENCE — Frontend

Aplikasi Pengelolaan Barang Bukti Berbasis Web (Studi Kasus: Subbid Siber Ditreskrimsus Polda Sulawesi Utara).
Frontend React + Tailwind CSS. Tampilan mengikuti prototipe `../index.html` dan katalog `../ui-components.html`.

## Menjalankan

```bash
npm install
npm run dev      # http://localhost:5174
npm run build    # hasil di dist/
```

Aplikasi memakai **Supabase** langsung, tanpa server backend. Setup proyek Supabase, data contoh, dan deploy Vercel:
[`docs/07-setup-supabase.md`](../docs/07-setup-supabase.md). Environment `.env` (salin dari `.env.example`):
`VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, `VITE_AUTH_EMAIL_DOMAIN`, `VITE_APP_TIMEZONE`. Jangan pernah menaruh
`service_role` key di frontend.

Akun contoh (kata sandi semua `demo123`): `d.kusuma` (Petugas), `admin` (Administrator). Daftar lengkap di
[`src/data/README.md`](src/data/README.md).

## Stack

Vite 5 · React 18 · React Router 6 · Tailwind CSS 3 · lucide-react · Supabase (Auth, PostgreSQL + RLS, Storage).
Tema warna `navy`, font Public Sans, dan bayangan `shadow-card` ada di `tailwind.config.js`. Deploy: Vercel (`vercel.json`).

## Struktur

```
src/
  data/            Data contoh per tabel (sumber seed Supabase) + README skema/ERD
  constants/       Nilai enum, label, dan warna badge
  lib/supabase.js  Klien Supabase, pemetaan username → email, opsi "ingat saya"
  context/         AppContext: data dari Supabase, sesi login, aksi CRUD, toast
  utils/           Format tanggal/angka, helper relasi (lookup FK), rute
  components/
    ui/            Komponen dasar: Button, Input, Select, Card, Badge, Modal, Tabs, Pagination, ...
    layout/        Sidebar (menu sesuai peran), Header, AppLayout
    shared/        Timeline riwayat, modal perkara, modal kejadian, dialog hapus, kop cetak
  pages/
    auth/          Login
    main/          Halaman bersama kedua peran: Dashboard, Perkara, Barang Bukti, Riwayat, Laporan, Pengaturan
    admin/         Khusus Administrator: Manajemen Pengguna, Master Data
    common/        404
```

## Rute

Prefix `:peran` adalah `/petugas` untuk Petugas dan `/admin` untuk Administrator.

| URL | Halaman |
| --- | --- |
| `/login` | Masuk |
| `:peran/dashboard` | Dashboard |
| `:peran/perkara`, `:peran/perkara/:id` | Data perkara & detail |
| `:peran/barang-bukti` | Daftar barang bukti (filter tersimpan di URL, mis. `?status=dipinjam`) |
| `:peran/barang-bukti/baru?perkara=:id` | Tambah barang bukti |
| `:peran/barang-bukti/:id` (`?tab=riwayat`) | Detail barang bukti |
| `:peran/barang-bukti/:id/edit` | Edit barang bukti |
| `:peran/riwayat` (`?barang=:id`) | Riwayat perpindahan |
| `:peran/laporan` | Laporan, cetak A4, ekspor CSV |
| `:peran/pengaturan` | Profil, ubah kata sandi, data contoh |
| `/admin/pengguna` | Manajemen pengguna (khusus Administrator) |
| `/admin/master-data` | Kategori & lokasi penyimpanan (khusus Administrator) |

Membuka prefix peran lain otomatis diarahkan kembali ke dashboard peran sendiri.

## Hak akses

| Fitur | Petugas | Administrator |
| --- | :---: | :---: |
| Tambah/ubah perkara & barang bukti, catat riwayat, laporan, ubah kata sandi sendiri | ✓ | ✓ |
| Hapus perkara (jika tidak punya barang bukti), hapus barang bukti, hapus lampiran | — | ✓ |
| Manajemen pengguna: tambah, ubah, aktif/nonaktif, atur ulang kata sandi | — | ✓ |
| Master data kategori & lokasi penyimpanan | — | ✓ |

Pengecekan peran di frontend hanya mengatur tampilan. Hak akses yang sesungguhnya ditegakkan di database:
RLS (`supabase/03_policies.sql`) dan pemeriksaan di setiap fungsi (`supabase/02_functions.sql`).

## Data

Semua lewat `src/context/AppContext.jsx`:

- **Login:** Supabase Auth (`username@VITE_AUTH_EMAIL_DOMAIN`), lalu fungsi `catat_login` menolak akun nonaktif.
- **Membaca:** tujuh tabel diambil langsung (`supabase.from(...).select()`), disaring RLS. Waktu dikonversi ke WITA.
- **Mengubah:** perkara, barang bukti, riwayat, lampiran, dan pengguna lewat `supabase.rpc(...)` ke fungsi database,
  sehingga aturan bisnis berjalan dalam satu transaksi. Master data ditulis langsung (khusus Administrator via RLS).
- **Lampiran:** diunggah langsung ke Storage bucket `lampiran`, diunduh lewat tautan sementara 60 detik.
- Setiap aksi memuat ulang data. Aksi tidak melempar galat; hasilnya `{ ok, data, msg, field }`. Kolom yang salah
  dikirim database lewat `HINT`, sehingga pesan muncul di kolom formulir yang tepat.

`src/data/*.json` tidak dibaca frontend; file itu sumber data contoh untuk `npm run seed` di `supabase/` dan acuan ERD.
