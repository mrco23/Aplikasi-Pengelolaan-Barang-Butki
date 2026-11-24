# 5. Rencana & Hasil Pengujian Black Box

Metode: *black box* (equivalence partitioning dan boundary value) berdasarkan kebutuhan fungsional di
[01-kebutuhan-dan-use-case.md](01-kebutuhan-dan-use-case.md). Gunakan data contoh dari `fe/src/data/` (kata sandi
semua akun `demo123`). Muat ulang data contoh (Pengaturan → Muat Ulang Data Contoh) sebelum setiap putaran uji.

**Cara mengisi:** kolom *Hasil Aktual* diisi apa yang benar-benar terjadi saat diuji, lalu *Status* diisi
**Berhasil** jika sesuai harapan atau **Gagal** jika tidak (catat nomor bug). Isi tanggal, versi, dan penguji di bawah.

| Putaran | Tanggal | Versi / commit | Penguji | Peramban |
| --- | --- | --- | --- | --- |
| 1 | | | | |

## 5.1 Login & Hak Akses

| Kode | Skenario | Data Uji | Hasil yang Diharapkan | Hasil Aktual | Status |
| --- | --- | --- | --- | --- | --- |
| TC-01 | Login dengan isian kosong | username & sandi kosong | Pesan "Nama pengguna dan kata sandi wajib diisi." | | |
| TC-02 | Login dengan username tidak terdaftar | `tidakada` / `demo123` | Pesan "Nama pengguna tidak terdaftar." | | |
| TC-03 | Login dengan kata sandi salah | `d.kusuma` / `salah123` | Pesan "Kata sandi salah." | | |
| TC-04 | Login akun nonaktif | `s.wulandari` / `demo123` | Pesan "Akun ini berstatus nonaktif." | | |
| TC-05 | Login Petugas valid | `d.kusuma` / `demo123` | Masuk ke `/petugas/dashboard`, notifikasi selamat datang | | |
| TC-06 | Login Administrator valid | `admin` / `demo123` | Masuk ke `/admin/dashboard`, menu Manajemen Pengguna & Master Data tampil | | |
| TC-07 | Petugas membuka halaman Admin lewat URL | login Petugas, buka `/admin/pengguna` | Diarahkan ke `/petugas/dashboard` | | |
| TC-08 | Membuka halaman tanpa login | buka `/petugas/perkara` setelah logout | Diarahkan ke halaman login; setelah login kembali ke halaman tujuan | | |
| TC-09 | Logout | klik Keluar | Kembali ke halaman login, sesi terhapus | | |
| TC-10 | Opsi "Ingat saya" tidak dicentang | login lalu tutup tab & buka lagi | Harus login ulang | | |

## 5.2 Dashboard

| Kode | Skenario | Data Uji | Hasil yang Diharapkan | Hasil Aktual | Status |
| --- | --- | --- | --- | --- | --- |
| TC-11 | Angka ringkasan sesuai data | data contoh awal | Total BB 13 (1 draf), perkara 7 (Lidik 4 · Sidik 3), tersedia 9, dipinjam 2 | | |
| TC-12 | Peminjaman melewati tenggat tampil | BB-2026-0003 harap kembali 20 Nov 2026 | Muncul di kartu "Peminjaman Melewati Tenggat" dengan jumlah hari terlambat | | |
| TC-13 | Kartu status menautkan ke filter | klik "Dipinjam" | Membuka Data Barang Bukti dengan filter status Dipinjam | | |

## 5.3 Data Perkara

| Kode | Skenario | Data Uji | Hasil yang Diharapkan | Hasil Aktual | Status |
| --- | --- | --- | --- | --- | --- |
| TC-14 | Tambah perkara valid | `LP/25/XI/2026/Ditreskrimsus`, tanggal hari ini, uraian, Lidik, penyidik | Tersimpan, muncul di daftar | | |
| TC-15 | Tambah perkara dengan nomor LP ganda | `LP/87/IX/2026/Ditreskrimsus` | Pesan "Nomor LP sudah terdaftar." | | |
| TC-16 | Tambah perkara dengan isian wajib kosong | uraian & penyidik kosong | Kolom ditandai merah, data tidak tersimpan | | |
| TC-17 | Tanggal laporan melewati hari ini | tanggal besok | Pesan "Tanggal laporan tidak boleh melewati hari ini." | | |
| TC-18 | Ubah perkara | ubah tahap Lidik → Sidik | Perubahan tersimpan dan tampil di detail | | |
| TC-19 | Cari & filter perkara | cari "skimming", filter tahap Lidik | Hanya LP/133/X/2026 tampil | | |
| TC-20 | Petugas tidak melihat tombol hapus | login Petugas | Tidak ada ikon/tombol hapus perkara | | |
| TC-21 | Admin hapus perkara yang masih punya BB | LP/87/IX/2026 | Tombol konfirmasi nonaktif, peringatan "masih terdapat 2 barang bukti" | | |
| TC-22 | Admin hapus perkara tanpa BB | LP/19/XI/2026 | Perkara terhapus | | |

## 5.4 Data Barang Bukti

| Kode | Skenario | Data Uji | Hasil yang Diharapkan | Hasil Aktual | Status |
| --- | --- | --- | --- | --- | --- |
| TC-23 | Kode otomatis | buka Tambah Barang Bukti | Kode terisi `BB-2026-0015` | | |
| TC-24 | Daftarkan barang bukti valid | nama, kategori, LP/19, lokasi Gudang | Tersimpan; tab Riwayat berisi 1 kejadian Penerimaan | | |
| TC-25 | Kode ganda | ubah kode menjadi `BB-2026-0001` | Pesan "Kode sudah digunakan oleh barang bukti lain." | | |
| TC-26 | Format kode salah | `BB-26-1` | Pesan format kode | | |
| TC-27 | Tanggal penerimaan sebelum tanggal laporan | LP/87 (8 Sep 2026), tanggal 1 Sep 2026 | Pesan "tidak boleh sebelum tanggal laporan perkara" | | |
| TC-28 | Simpan sebagai draf | isi minimal, klik Simpan sebagai Draf | Berlabel Draf, tidak ada riwayat Penerimaan | | |
| TC-29 | Daftarkan draf | edit BB-2026-0014, klik Simpan & Daftarkan | Label Draf hilang, riwayat Penerimaan tercatat | | |
| TC-30 | Ubah lokasi lewat formulir edit | BB-2026-0004: Lemari Kunci 01 → Rak A1 | Riwayat Perpindahan otomatis tercatat | | |
| TC-31 | Lampiran > 10 MB | pilih berkas 12 MB | Pesan "Berkas terlalu besar", berkas tidak ditambahkan | | |
| TC-32 | Filter barang bukti | kategori Media Penyimpanan + status Tersedia | Hanya BB-2026-0004 & 0005 tampil | | |
| TC-33 | Barang dimusnahkan tidak dapat diedit | buka BB-2026-0013 | Tombol edit & catat perpindahan tidak tampil | | |
| TC-34 | Admin hapus barang bukti | BB-2026-0010 | Barang, riwayat, dan lampirannya terhapus | | |

## 5.5 Riwayat / Chain of Custody

| Kode | Skenario | Data Uji | Hasil yang Diharapkan | Hasil Aktual | Status |
| --- | --- | --- | --- | --- | --- |
| TC-35 | Catat perpindahan | BB-2026-0005: Lemari Kunci 02 → Rak B2 | Lokasi barang berubah, riwayat bertambah | | |
| TC-36 | Perpindahan ke lokasi yang sama | tujuan = asal | Pesan "Lokasi tujuan sama dengan lokasi asal." | | |
| TC-37 | Peminjaman tanpa tanggal kembali | BB-2026-0001, tanggal kembali kosong | Pesan wajib diisi | | |
| TC-38 | Tanggal kembali sebelum tanggal pinjam | tanggal kembali kemarin | Pesan "tidak boleh sebelum tanggal kejadian" | | |
| TC-39 | Peminjaman valid | BB-2026-0001 → Ruang Forensik, kembali +7 hari | Status Dipinjam, badge "Belum Kembali" | | |
| TC-40 | Meminjam barang yang sedang dipinjam | BB-2026-0003 | Pesan "masih berstatus Dipinjam" | | |
| TC-41 | Pengembalian | BB-2026-0003 → Lemari Kunci 01 | Status Tersedia, peminjaman ditandai "Sudah Kembali", hilang dari daftar terlambat | | |
| TC-42 | Pengembalian barang yang tidak dipinjam | BB-2026-0005 | Pesan "Barang ini tidak sedang dipinjam." | | |
| TC-43 | Pengalihan ke pemusnahan | BB-2026-0008 → Pemusnahan | Status berubah menjadi Dihancurkan | | |
| TC-44 | Riwayat lama tidak berubah | setelah TC-35 s.d. TC-43 | Seluruh riwayat sebelumnya tetap ada dan tidak berubah | | |
| TC-45 | Filter riwayat | jenis Peminjaman + kode BB-2026-0006 | Hanya satu baris peminjaman tampil | | |

## 5.6 Laporan

| Kode | Skenario | Data Uji | Hasil yang Diharapkan | Hasil Aktual | Status |
| --- | --- | --- | --- | --- | --- |
| TC-46 | Rekapitulasi per kategori | 1 Jan – hari ini | Total = jumlah BB non-draf (13) dan jumlah per status sama dengan dashboard | | |
| TC-47 | Rentang tanggal terbalik | dari > sampai | Peringatan rentang tanggal, tombol cetak/ekspor nonaktif | | |
| TC-48 | Laporan peminjaman | jenis Peminjaman | BB-2026-0003 berstatus "Melewati tenggat" | | |
| TC-49 | Cetak laporan | klik Cetak | Pratinjau A4 dengan kop institusi dan blok tanda tangan; menu tidak ikut tercetak | | |
| TC-50 | Ekspor CSV | klik Ekspor CSV | Berkas `.csv` terunduh dan isinya sama dengan pratinjau | | |

## 5.7 Pengaturan

| Kode | Skenario | Data Uji | Hasil yang Diharapkan | Hasil Aktual | Status |
| --- | --- | --- | --- | --- | --- |
| TC-51 | Ubah kata sandi dengan sandi lama salah | lama `salah` | Pesan "Kata sandi lama tidak sesuai." | | |
| TC-52 | Kata sandi baru < 8 karakter | `abc` | Pesan minimal 8 karakter | | |
| TC-53 | Konfirmasi tidak sama | baru `rahasia123`, ulang `rahasia124` | Pesan konfirmasi tidak sama | | |
| TC-54 | Ubah kata sandi valid lalu login ulang | baru `rahasia123` | Login dengan `demo123` gagal, dengan `rahasia123` berhasil | | |

## 5.8 Manajemen Pengguna & Master Data (Administrator)

| Kode | Skenario | Data Uji | Hasil yang Diharapkan | Hasil Aktual | Status |
| --- | --- | --- | --- | --- | --- |
| TC-55 | Tambah pengguna valid | `y.rumengan`, sandi acak, Petugas | Akun tersimpan dan bisa dipakai login | | |
| TC-56 | Username ganda | `d.kusuma` | Pesan "Nama pengguna sudah digunakan." | | |
| TC-57 | NRP tidak 8 digit | `12345` | Pesan "NRP terdiri dari 8 digit angka." | | |
| TC-58 | Nonaktifkan pengguna | nonaktifkan `r.pratama` | Status Nonaktif; login `r.pratama` ditolak | | |
| TC-59 | Menonaktifkan akun sendiri | login admin | Tombol nonaktifkan pada akun sendiri tidak aktif | | |
| TC-60 | Menghilangkan admin aktif terakhir | ubah peran `admin` menjadi Petugas | Pesan "Harus tersisa minimal satu Administrator aktif." | | |
| TC-61 | Atur ulang kata sandi | `b.setiawan` → sandi baru | Login dengan sandi baru berhasil | | |
| TC-62 | Tambah kategori | "Kendaraan" | Tersimpan dengan kode `kendaraan`, muncul di formulir barang bukti | | |
| TC-63 | Hapus kategori yang dipakai | Elektronik | Tombol hapus nonaktif | | |
| TC-64 | Hapus lokasi yang belum dipakai | lokasi baru tanpa data | Lokasi terhapus | | |

## 5.9 Tampilan

| Kode | Skenario | Data Uji | Hasil yang Diharapkan | Hasil Aktual | Status |
| --- | --- | --- | --- | --- | --- |
| TC-65 | Tampilan ponsel | lebar layar 375 px | Menu menjadi tombol hamburger, tidak ada gulir horizontal pada halaman | | |
| TC-66 | Halaman tidak dikenal | buka `/petugas/abc` | Halaman "Halaman tidak ditemukan" dengan tombol kembali | | |

## 5.10 Rekapitulasi

| Modul | Jumlah Kasus | Berhasil | Gagal |
| --- | :---: | :---: | :---: |
| Login & hak akses | 10 | | |
| Dashboard | 3 | | |
| Data perkara | 9 | | |
| Data barang bukti | 12 | | |
| Riwayat | 11 | | |
| Laporan | 5 | | |
| Pengaturan | 4 | | |
| Pengguna & master data | 10 | | |
| Tampilan | 2 | | |
| **Total** | **66** | | |
