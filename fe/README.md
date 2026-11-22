# SIBER EVIDENCE — Frontend

Aplikasi Pengelolaan Barang Bukti Berbasis Web (Studi Kasus: Subbid Siber Ditreskrimsus Polda Sulawesi Utara).
Frontend React + Tailwind CSS. Tampilan mengikuti prototipe `../index.html` dan katalog `../ui-components.html`.

## Menjalankan

```bash
npm install
npm run dev      # http://localhost:5174
npm run build    # hasil di dist/
```

Akun contoh (kata sandi semua `demo123`): `d.kusuma` (Petugas), `admin` (Administrator). Daftar lengkap di
[`src/data/README.md`](src/data/README.md).

## Stack

Vite 5 · React 18 · React Router 6 · Tailwind CSS 3 · lucide-react. Tema warna `navy`, font Public Sans, dan
bayangan `shadow-card` ada di `tailwind.config.js`.

## Struktur

```
src/
  data/            Data dummy, satu JSON per tabel + README skema/ERD (acuan database)
  constants/       Nilai enum, label, dan warna badge
  context/         AppContext: data, sesi login, aksi CRUD, toast (titik integrasi backend)
  utils/           Format tanggal/angka, helper relasi (lookup FK), rute
  components/
    ui/            Komponen dasar: Button, Input, Select, Card, Badge, Modal, Tabs, Pagination, ...
    layout/        Sidebar, Header, PetugasLayout
    shared/        Timeline riwayat, modal perkara, modal kejadian (perpindahan/peminjaman), kop cetak
  pages/
    auth/          Login
    petugas/       Dashboard, Perkara (+detail), Barang Bukti (+form, detail), Riwayat, Laporan, Pengaturan
    common/        404, placeholder modul Administrator
```

## Rute

| URL | Halaman |
| --- | --- |
| `/login` | Masuk |
| `/petugas/dashboard` | Dashboard |
| `/petugas/perkara`, `/petugas/perkara/:id` | Data perkara & detail |
| `/petugas/barang-bukti` | Daftar barang bukti (filter tersimpan di URL, mis. `?status=dipinjam`) |
| `/petugas/barang-bukti/baru?perkara=:id` | Tambah barang bukti |
| `/petugas/barang-bukti/:id` (`?tab=riwayat`) | Detail barang bukti |
| `/petugas/barang-bukti/:id/edit` | Edit barang bukti |
| `/petugas/riwayat` (`?barang=:id`) | Riwayat perpindahan |
| `/petugas/laporan` | Laporan, cetak A4, ekspor CSV |
| `/petugas/pengaturan` | Profil, ubah kata sandi, data contoh |
| `/admin` | Placeholder — modul Administrator belum dibangun |

Halaman `/petugas/*` hanya bisa dibuka akun berperan Petugas; Administrator diarahkan ke `/admin`.

## Hak akses Petugas

Petugas dapat menambah dan mengubah perkara serta barang bukti, mencatat riwayat, membuat laporan, dan mengganti
kata sandi sendiri. Petugas **tidak** dapat menghapus data dan tidak melihat menu Manajemen Pengguna.

## Penyimpanan data

Data awal dibaca dari `src/data/*.json`, lalu perubahan disimpan di `localStorage`. Jika isi JSON diubah, naikkan
`SEED_VERSION` di `src/data/index.js` agar data lama di peramban diganti. Untuk menghubungkan ke backend Laravel,
ganti isi fungsi aksi di `src/context/AppContext.jsx` dengan pemanggilan API.
