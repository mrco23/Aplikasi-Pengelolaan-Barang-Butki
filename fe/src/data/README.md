# Data Dummy — Acuan ERD

Folder ini berisi data contoh **fiktif** untuk aplikasi SIBER EVIDENCE. Setiap file JSON mewakili **satu tabel**
MySQL, memakai nama kolom `snake_case` dan `id` integer (seperti auto-increment), sehingga bisa langsung dipakai
sebagai acuan ERD, migration, dan seeder Laravel.

Frontend memuat file-file ini sebagai data awal (seed). Perubahan dari aplikasi disimpan di `localStorage`
peramban. Menu **Pengaturan → Muat Ulang Data Contoh** mengembalikan data ke isi file ini.

| File | Tabel | Isi |
| --- | --- | --- |
| `pengguna.json` | `pengguna` | Akun Administrator dan Petugas |
| `kategori.json` | `kategori` | Master kategori barang bukti |
| `lokasi_penyimpanan.json` | `lokasi_penyimpanan` | Master lokasi penyimpanan |
| `perkara.json` | `perkara` | Data perkara (nomor LP) |
| `barang_bukti.json` | `barang_bukti` | Data barang bukti |
| `riwayat_barang_bukti.json` | `riwayat_barang_bukti` | Riwayat kejadian (chain of custody), tambah-saja |
| `lampiran.json` | `lampiran` | Metadata berkas lampiran barang bukti |

## ERD

```mermaid
erDiagram
    pengguna ||--o{ perkara : "penyidik_id"
    pengguna ||--o{ barang_bukti : "petugas_penerima_id"
    pengguna ||--o{ riwayat_barang_bukti : "petugas_id"
    pengguna ||--o{ lampiran : "diunggah_oleh"
    perkara ||--o{ barang_bukti : "perkara_id"
    kategori ||--o{ barang_bukti : "kategori_id"
    lokasi_penyimpanan ||--o{ barang_bukti : "lokasi_id"
    barang_bukti ||--o{ riwayat_barang_bukti : "barang_bukti_id"
    lokasi_penyimpanan |o--o{ riwayat_barang_bukti : "lokasi_asal_id"
    lokasi_penyimpanan ||--o{ riwayat_barang_bukti : "lokasi_tujuan_id"
    barang_bukti ||--o{ lampiran : "barang_bukti_id"

    pengguna {
        int id PK
        varchar username UK
        varchar password
        varchar nama
        varchar pangkat "nullable"
        varchar nrp "nullable"
        varchar jabatan
        enum role "administrator | petugas"
        enum status "aktif | nonaktif"
        datetime terakhir_login
        datetime created_at
        datetime updated_at
    }
    kategori {
        int id PK
        varchar kode UK
        varchar nama
        text keterangan
    }
    lokasi_penyimpanan {
        int id PK
        varchar nama
        enum jenis "penyimpanan | pemeriksaan | pemusnahan"
        text keterangan
    }
    perkara {
        int id PK
        varchar nomor_lp UK
        date tanggal_laporan
        text uraian
        enum tahap "lidik | sidik"
        int penyidik_id FK
        int created_by FK
        datetime created_at
        datetime updated_at
    }
    barang_bukti {
        int id PK
        varchar kode UK "BB-tahun-nomor urut"
        varchar nama
        int kategori_id FK
        text deskripsi
        varchar nomor_seri "nullable"
        enum kondisi "baik | rusak_ringan | rusak_berat"
        int perkara_id FK
        date tanggal_penerimaan
        int petugas_penerima_id FK
        int lokasi_id FK
        enum status "tersedia | dipinjam | dalam_pemeriksaan | dihancurkan"
        text catatan
        boolean is_draf
        int created_by FK
        datetime created_at
        datetime updated_at
    }
    riwayat_barang_bukti {
        int id PK
        int barang_bukti_id FK
        enum jenis "penerimaan | perpindahan | peminjaman | pengembalian | pemeriksaan | pengalihan"
        datetime tanggal_waktu
        int lokasi_asal_id FK "null = penyerahan penyidik"
        int lokasi_tujuan_id FK
        int petugas_id FK
        varchar alasan
        text catatan
        date tanggal_harapan_kembali "khusus peminjaman"
        enum status_kembali "belum_kembali | sudah_kembali"
        int dicatat_oleh FK
        datetime created_at
    }
    lampiran {
        int id PK
        int barang_bukti_id FK
        varchar nama_file
        varchar tipe_mime
        int ukuran_byte
        varchar path
        int diunggah_oleh FK
        datetime created_at
    }
```

## Aturan bisnis yang tercermin di data

- `perkara.nomor_lp` dan `barang_bukti.kode` **unik**. Kode dibuat otomatis: `BB-<tahun>-<nomor urut 4 digit>`.
- Saat barang bukti didaftarkan (bukan draf), sistem otomatis menambah riwayat `penerimaan` dengan
  `lokasi_asal_id = null` (artinya diserahkan oleh penyidik).
- Barang dengan `is_draf = true` belum punya riwayat; riwayat `penerimaan` dibuat ketika draf didaftarkan.
- Riwayat bersifat **tambah-saja** (append-only): data lama tidak ditimpa. Mencatat riwayat ikut memperbarui
  `barang_bukti.lokasi_id` dan `barang_bukti.status`:
  - `peminjaman` → status `dipinjam`, `status_kembali = belum_kembali`, wajib `tanggal_harapan_kembali`.
  - `pengembalian` → status `tersedia`, peminjaman terbuka terakhir menjadi `sudah_kembali`.
  - `pengalihan` ke lokasi berjenis `pemusnahan` → status `dihancurkan`.
  - `perpindahan`, `pengalihan`, `pengembalian` → `lokasi_id` diganti `lokasi_tujuan_id`.
- Peminjaman `belum_kembali` dengan `tanggal_harapan_kembali` sebelum hari ini dianggap **melewati tenggat**.
- Perkara yang masih memiliki barang bukti tidak boleh dihapus. Hapus data hanya untuk Administrator.
- Pengguna `nonaktif` tidak dapat login.
- `password` di sini berupa teks biasa (`demo123`) hanya untuk demo. Di Laravel kolom ini wajib berisi hash bcrypt.

## Akun contoh

| Username | Peran | Status |
| --- | --- | --- |
| `d.kusuma` | Petugas | aktif |
| `b.setiawan` | Petugas | aktif |
| `r.pratama` | Petugas | aktif |
| `m.lumenta` | Petugas | aktif |
| `s.wulandari` | Petugas | nonaktif (tidak bisa login) |
| `admin` | Administrator | aktif |

Semua kata sandi: `demo123`.
