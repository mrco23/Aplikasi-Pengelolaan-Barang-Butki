# 7. Setup Supabase & Deploy ke Vercel

Aplikasi ini adalah **React + Supabase tanpa server backend**. Panduan ini membawa kamu dari nol sampai aplikasi
berjalan di laptop dan bisa dibuka lewat internet (Vercel). Perkiraan waktu: 20–30 menit.

## Cara kerja singkat

| Bagian | Dikerjakan oleh |
| --- | --- |
| Tampilan & alur | React (`fe/`), di-deploy sebagai situs statis di Vercel |
| Login | Supabase Auth. Pengguna mengetik **username**; aplikasi memetakannya ke email buatan `username@siber-evidence.local` |
| Membaca data | Langsung dari tabel Supabase, disaring **Row Level Security (RLS)** |
| Mengubah data | **Fungsi database** (`supabase/02_functions.sql`) yang menegakkan aturan bisnis & hak akses dalam satu transaksi |
| Berkas lampiran | Supabase Storage, bucket privat `lampiran` |

Kunci yang dipakai frontend (*anon / publishable key*) memang boleh terlihat publik — tanpa login, RLS menolak semua
akses. Kunci **service_role** hanya dipakai sekali untuk mengisi data contoh dari laptop, tidak pernah di frontend.

## Bagian A — Siapkan Supabase

### A1. Buat proyek

1. Masuk ke [supabase.com/dashboard](https://supabase.com/dashboard) → **New project**.
2. **Name:** `siber-evidence` · **Database Password:** buat dan simpan · **Region:** Southeast Asia (Singapore).
3. Tunggu sampai proyek siap (±2 menit).

### A2. Atur Authentication

Buka **Authentication → Sign In / Providers** (di versi lama: **Authentication → Providers → Email**):

| Pengaturan | Nilai | Alasan |
| --- | --- | --- |
| Email provider | **Enabled** | Login memakai email buatan dari username |
| **Confirm email** | **OFF** | Email buatan tidak bisa menerima email konfirmasi |
| Allow new users to sign up | **ON** | Administrator membuat akun baru dari halaman Manajemen Pengguna |
| Minimum password length | 6 | Sama dengan aturan di aplikasi |

> Karena pendaftaran terbuka, orang yang tahu alamat proyek bisa membuat akun Auth sendiri. Akun seperti itu
> **tidak bisa melihat atau mengubah data apa pun**: RLS hanya mengizinkan akun yang terdaftar dan aktif di tabel
> `pengguna`, dan hanya Administrator yang bisa mendaftarkannya. Cocok untuk prototype; untuk produksi, pembuatan akun
> sebaiknya dipindah ke Edge Function dan sign-up publik dimatikan.

### A3. Buat tabel, fungsi, aturan akses, dan bucket

**Cara 1 — lewat terminal (disarankan).** Isi `SUPABASE_DB_URL` di `supabase/.env` dengan URI dari tombol
**Connect → Connection String → Session pooler** (port 5432; ganti `[YOUR-PASSWORD]` dengan password database dari
langkah A1), lalu:

```powershell
cd supabase
npm install
npm run db:reset     # pertama kali: 01 + 02 + 03 + 04 (menghapus data aplikasi)
npm run db:apply     # setelah file 02/03/04 diubah: 02 + 03 + 04 (data tetap)
```

Setiap file dijalankan dalam transaksi; jika ada yang gagal, terminal menampilkan nama file dan pesan galatnya.

**Cara 2 — lewat dashboard.** Buka **SQL Editor → New query**. Jalankan keempat file berikut **berurutan**, satu per satu (buka file, salin seluruh
isinya, tempel, klik **Run**, pastikan muncul *Success*):

| Urutan | File | Isi |
| --- | --- | --- |
| 1 | `supabase/01_schema.sql` | 7 tabel, enum, trigger riwayat tambah-saja |
| 2 | `supabase/02_functions.sql` | Aturan bisnis: simpan perkara/barang, catat kejadian, kelola pengguna, dll. |
| 3 | `supabase/03_policies.sql` | RLS — siapa boleh membaca/menulis apa |
| 4 | `supabase/04_storage.sql` | Bucket `lampiran` (privat, maks. 10 MB) + aturan aksesnya |

> `01_schema.sql` **menghapus seluruh data aplikasi** lalu membuat ulang tabel. Jika menjalankannya ulang, jalankan
> lagi 02, 03, dan 04 sesudahnya.

### A4. Ambil kunci API

**Project Settings → API** (atau **API Keys**):

| Nilai | Dipakai di |
| --- | --- |
| Project URL | `fe/.env` (`VITE_SUPABASE_URL`) dan `supabase/.env` (`SUPABASE_URL`) |
| `anon` / publishable key | `fe/.env` (`VITE_SUPABASE_ANON_KEY`) |
| `service_role` / secret key | **hanya** `supabase/.env` (`SUPABASE_SERVICE_ROLE_KEY`) |

### A5. Isi data contoh

Isi `supabase/.env` (sudah dibuat dari `.env.example`):

```dotenv
SUPABASE_URL=https://abcdefghijklmnop.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOi...
AUTH_EMAIL_DOMAIN=siber-evidence.local
```

Lalu jalankan:

```powershell
cd supabase
npm install
npm run seed
```

Hasil yang diharapkan:

```
Akun Supabase Auth:
  + admin@siber-evidence.local
  + b.setiawan@siber-evidence.local
  ...
Tabel aplikasi:
  pengguna               6 baris
  barang_bukti           14 baris
  riwayat_barang_bukti   21 baris
  ...
Selesai. Login dengan username (cth. d.kusuma) dan kata sandi: demo123
```

Seed boleh dijalankan ulang kapan saja untuk mengembalikan data contoh (semua perubahan di aplikasi hilang; akun
Auth dipakai ulang dan kata sandinya dikembalikan ke `demo123`).

Cek di **Table Editor**: tujuh tabel terisi dan berlabel *RLS enabled*. Di **Authentication → Users** ada 6 akun.

## Bagian B — Jalankan di laptop

Isi `fe/.env`:

```dotenv
VITE_SUPABASE_URL=https://abcdefghijklmnop.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOi...        # anon / publishable key
VITE_AUTH_EMAIL_DOMAIN=siber-evidence.local
VITE_APP_TIMEZONE=Asia/Makassar
```

```powershell
cd fe
npm install
npm run dev
```

Buka http://localhost:5174 dan login `d.kusuma` / `demo123` (Petugas) atau `admin` / `demo123` (Administrator).
Jika port 5174 dipakai aplikasi lain: `npm run dev -- --port 5175`.

### Daftar cek setelah setup

Bagian ini memakai layanan Supabase sungguhan sehingga perlu dicek sekali setelah setup:

- [ ] Login `d.kusuma` berhasil; login `s.wulandari` ditolak (akun nonaktif).
- [ ] Tambah barang bukti dengan lampiran PDF → berkas muncul di **Storage → lampiran** dan bisa diunduh dari tab Dokumen.
- [ ] Admin membuat pengguna baru → akun muncul di **Authentication → Users**, lalu bisa login dengan username-nya.
- [ ] Admin mengatur ulang kata sandi pengguna → login dengan kata sandi baru berhasil.
- [ ] Ubah kata sandi sendiri di Pengaturan → login ulang dengan kata sandi baru berhasil.

## Bagian C — Deploy ke Vercel

1. Pastikan kode sudah di-push ke GitHub (repositori privat disarankan).
2. Masuk ke [vercel.com](https://vercel.com) → **Add New… → Project** → pilih repositori ini → **Import**.
3. Atur:
   - **Root Directory:** `fe`
   - **Framework Preset:** Vite (terdeteksi otomatis; build `npm run build`, output `dist`)
   - **Environment Variables:** salin keempat variabel dari `fe/.env`
     (`VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, `VITE_AUTH_EMAIL_DOMAIN`, `VITE_APP_TIMEZONE`).
4. Klik **Deploy**. Setelah selesai, buka URL `https://<nama-proyek>.vercel.app`.
5. Di Supabase: **Authentication → URL Configuration → Site URL** isi dengan URL Vercel tadi.

`fe/vercel.json` sudah mengarahkan semua rute (mis. `/petugas/barang-bukti/3`) ke aplikasi, sehingga halaman tidak
404 saat di-refresh. Setiap push ke branch utama akan otomatis di-deploy ulang.

> Variabel `VITE_*` dibaca saat build. Jika mengubahnya di Vercel, jalankan **Redeploy** agar berlaku.

## Masalah yang sering terjadi

| Gejala | Penyebab & solusi |
| --- | --- |
| Login: "Supabase belum dikonfigurasi" | `fe/.env` (atau Environment Variables di Vercel) belum diisi; restart `npm run dev` / redeploy. |
| Login: "Nama pengguna atau kata sandi salah" padahal benar | Seed belum dijalankan, atau `AUTH_EMAIL_DOMAIN` di `supabase/.env` berbeda dengan `VITE_AUTH_EMAIL_DOMAIN`. |
| Login: "Email not confirmed" | **Confirm email** masih ON (langkah A2). Matikan, lalu jalankan seed ulang. |
| Seed / buat pengguna: "Email address … is invalid" | Supabase menolak domain email buatan. Ganti `AUTH_EMAIL_DOMAIN` dan `VITE_AUTH_EMAIL_DOMAIN` (mis. `siberevidence.test`), jalankan seed ulang. |
| Login: "Akun belum terdaftar di aplikasi" | Akun ada di Auth tapi tidak ada di tabel `pengguna`. Jalankan seed ulang atau buat lewat Manajemen Pengguna. |
| Semua halaman kosong setelah login | SQL 03 (RLS) belum dijalankan setelah 01/02, atau akun berstatus nonaktif. |
| Seed: "Could not find the function public.seed_muat" | `02_functions.sql` belum dijalankan. |
| Unggah lampiran: "Bucket not found" | `04_storage.sql` belum dijalankan. |
| Unggah lampiran: "new row violates row-level security policy" | `04_storage.sql` belum dijalankan setelah `03_policies.sql`, atau akun nonaktif. |
| Admin buat pengguna: "Signups not allowed" | **Allow new users to sign up** masih OFF (langkah A2). |
| Reset kata sandi: "permission denied for table users" | Jalankan ulang `02_functions.sql` dari SQL Editor (fungsi harus dibuat oleh role `postgres`). |
| Vercel: halaman 404 saat refresh | **Root Directory** bukan `fe`, sehingga `vercel.json` tidak terbaca. |
| Proyek Supabase "Paused" | Proyek gratis berhenti setelah 7 hari tidak dipakai. Dashboard → **Restore project**. |

## Akun contoh

Semua kata sandi `demo123`: `d.kusuma`, `b.setiawan`, `r.pratama`, `m.lumenta` (Petugas), `admin` (Administrator),
`s.wulandari` (nonaktif — untuk menguji penolakan login). Ganti sebelum dipakai di luar demo.
