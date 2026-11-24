# 2. Activity Diagram

Ditulis dalam PlantUML dengan *swimlane* (aktor | sistem). Cara merender: lihat [01-kebutuhan-dan-use-case.md](01-kebutuhan-dan-use-case.md#14-diagram-use-case).

## 2.1 Login

```plantuml
@startuml activity-login
|Pengguna|
start
:Membuka aplikasi;
|Sistem|
:Menampilkan halaman login;
|Pengguna|
:Mengisi nama pengguna & kata sandi;
:Menekan "Masuk";
|Sistem|
if (Isian lengkap?) then (tidak)
  :Tampilkan "wajib diisi";
  stop
endif
if (Akun ditemukan & kata sandi benar?) then (tidak)
  :Tampilkan pesan galat;
  stop
endif
if (Status akun aktif?) then (tidak)
  :Tampilkan "akun nonaktif";
  stop
endif
:Simpan sesi & perbarui terakhir_login;
if (Peran?) then (Administrator)
  :Buka /admin/dashboard;
else (Petugas)
  :Buka /petugas/dashboard;
endif
stop
@enduml
```

## 2.2 Menambah Perkara

```plantuml
@startuml activity-perkara
|Pengguna|
start
:Membuka Data Perkara;
:Menekan "Tambah Perkara";
|Sistem|
:Menampilkan formulir perkara;
|Pengguna|
:Mengisi nomor LP, tanggal laporan,
uraian, tahap, penyidik;
:Menekan "Simpan Perkara";
|Sistem|
if (Isian valid &\nnomor LP belum terdaftar?) then (tidak)
  :Tandai kolom yang salah;
  |Pengguna|
  :Memperbaiki isian;
  detach
endif
|Sistem|
:Simpan perkara;
:Tampilkan notifikasi berhasil;
stop
@enduml
```

## 2.3 Mendaftarkan Barang Bukti

```plantuml
@startuml activity-barang-bukti
|Pengguna|
start
:Memilih "Tambah Barang Bukti"
(dari daftar atau detail perkara);
|Sistem|
:Membuat kode BB-tahun-nomor urut;
:Menampilkan formulir;
|Pengguna|
:Mengisi informasi umum, perkara,
penyimpanan, lampiran (opsional);
if (Tombol?) then (Simpan sebagai Draf)
  |Sistem|
  :Validasi isian;
  :Simpan barang bukti (is_draf = true);
  note right: Riwayat belum dicatat
else (Simpan & Daftarkan)
  |Sistem|
  :Validasi isian;
  if (Valid?) then (tidak)
    :Tandai kolom yang salah;
    stop
  endif
  :Simpan barang bukti (is_draf = false);
  :Catat riwayat "Penerimaan"
  (Penyerahan Penyidik → lokasi);
endif
:Simpan metadata lampiran;
:Buka halaman detail barang bukti;
stop
@enduml
```

## 2.4 Mencatat Kejadian Barang Bukti

```plantuml
@startuml activity-kejadian
|Pengguna|
start
:Menekan "Catat Perpindahan";
|Sistem|
:Isi lokasi asal dari lokasi barang saat ini;
|Pengguna|
:Memilih jenis kejadian, lokasi tujuan,
petugas, alasan;
if (Jenis = Peminjaman?) then (ya)
  :Mengisi tanggal harapan kembali;
endif
:Menekan "Catat Kejadian";
|Sistem|
if (Valid?) then (tidak)
  :Tampilkan pesan galat;
  stop
endif
partition "Satu transaksi basis data" {
  :Simpan riwayat baru (tidak menimpa riwayat lama);
  switch (Jenis kejadian)
  case (Peminjaman)
    :status = Dipinjam;
    :status_kembali = Belum Kembali;
  case (Pengembalian)
    :status = Tersedia;
    :Tandai peminjaman terbuka = Sudah Kembali;
  case (Pengalihan ke Pemusnahan)
    :status = Dihancurkan;
  case (Perpindahan / Pemeriksaan)
    :status tetap;
  endswitch
  :lokasi barang = lokasi tujuan;
}
:Perbarui timeline & notifikasi;
stop
@enduml
```

## 2.5 Membuat Laporan

```plantuml
@startuml activity-laporan
|Pengguna|
start
:Membuka menu Laporan;
:Memilih jenis laporan & periode;
:Mengatur filter (perkara, kategori,
status, tahap) bila perlu;
|Sistem|
if (Tanggal awal <= tanggal akhir?) then (tidak)
  :Tampilkan peringatan rentang tanggal;
  stop
endif
:Menghitung data & menampilkan pratinjau;
|Pengguna|
if (Aksi?) then (Cetak)
  |Sistem|
  :Tampilkan tata letak A4
  dengan kop & tanda tangan;
else (Ekspor CSV)
  |Sistem|
  :Unduh berkas CSV;
endif
stop
@enduml
```

## 2.6 Menonaktifkan Pengguna (Administrator)

```plantuml
@startuml activity-pengguna
|Administrator|
start
:Membuka Manajemen Pengguna;
:Menekan ikon Nonaktifkan pada akun;
|Sistem|
:Menampilkan dialog konfirmasi;
|Administrator|
:Menekan "Nonaktifkan";
|Sistem|
if (Akun sendiri?) then (ya)
  :Tolak tindakan;
  stop
endif
if (Masih ada Administrator aktif lain?) then (tidak)
  :Tolak tindakan;
  stop
endif
:Ubah status akun menjadi nonaktif;
note right: Akun tidak dapat login lagi;\ndata yang pernah dicatat tetap ada
stop
@enduml
```
