# 3. Class Diagram

Kelas mengikuti model Eloquent yang direncanakan di Laravel (nama tabel pada stereotip). Atribut sama dengan
kolom tabel di [04-erd-dan-kamus-data.md](04-erd-dan-kamus-data.md); metode berisi relasi dan aturan bisnis utama.

```plantuml
@startuml class-diagram
skinparam classAttributeIconSize 0
hide empty members

enum Role {
  administrator
  petugas
}
enum StatusAkun {
  aktif
  nonaktif
}
enum Tahap {
  lidik
  sidik
}
enum Kondisi {
  baik
  rusak_ringan
  rusak_berat
}
enum StatusBarang {
  tersedia
  dipinjam
  dalam_pemeriksaan
  dihancurkan
}
enum JenisRiwayat {
  penerimaan
  perpindahan
  peminjaman
  pengembalian
  pemeriksaan
  pengalihan
}
enum JenisLokasi {
  penyimpanan
  pemeriksaan
  pemusnahan
}

class Pengguna <<pengguna>> {
  - id : int
  - username : string
  - password : string
  - nama : string
  - pangkat : string
  - nrp : string
  - jabatan : string
  - role : Role
  - status : StatusAkun
  - terakhir_login : datetime
  --
  + login(username, password) : bool
  + logout() : void
  + ubahKataSandi(lama, baru) : bool
  + isAdministrator() : bool
  + namaLengkap() : string
}

class Perkara <<perkara>> {
  - id : int
  - nomor_lp : string
  - tanggal_laporan : date
  - uraian : text
  - tahap : Tahap
  - penyidik_id : int
  - created_by : int
  --
  + penyidik() : Pengguna
  + barangBukti() : BarangBukti[]
  + dapatDihapus() : bool
}

class Kategori <<kategori>> {
  - id : int
  - kode : string
  - nama : string
  - keterangan : text
  --
  + barangBukti() : BarangBukti[]
}

class LokasiPenyimpanan <<lokasi_penyimpanan>> {
  - id : int
  - nama : string
  - jenis : JenisLokasi
  - keterangan : text
  --
  + barangBukti() : BarangBukti[]
  + isPemusnahan() : bool
}

class BarangBukti <<barang_bukti>> {
  - id : int
  - kode : string
  - nama : string
  - kategori_id : int
  - deskripsi : text
  - nomor_seri : string
  - kondisi : Kondisi
  - perkara_id : int
  - tanggal_penerimaan : date
  - petugas_penerima_id : int
  - lokasi_id : int
  - status : StatusBarang
  - catatan : text
  - is_draf : bool
  - created_by : int
  --
  + {static} buatKodeOtomatis(tahun) : string
  + perkara() : Perkara
  + kategori() : Kategori
  + lokasi() : LokasiPenyimpanan
  + riwayat() : RiwayatBarangBukti[]
  + lampiran() : Lampiran[]
  + daftarkan() : void
  + catatKejadian(data) : RiwayatBarangBukti
  + peminjamanAktif() : RiwayatBarangBukti
}

class RiwayatBarangBukti <<riwayat_barang_bukti>> {
  - id : int
  - barang_bukti_id : int
  - jenis : JenisRiwayat
  - tanggal_waktu : datetime
  - lokasi_asal_id : int
  - lokasi_tujuan_id : int
  - petugas_id : int
  - alasan : string
  - catatan : text
  - tanggal_harapan_kembali : date
  - status_kembali : string
  - dicatat_oleh : int
  --
  + barangBukti() : BarangBukti
  + lokasiAsal() : LokasiPenyimpanan
  + lokasiTujuan() : LokasiPenyimpanan
  + petugas() : Pengguna
  + isTerlambat() : bool
}

class Lampiran <<lampiran>> {
  - id : int
  - barang_bukti_id : int
  - nama_file : string
  - tipe_mime : string
  - ukuran_byte : int
  - path : string
  - diunggah_oleh : int
  --
  + barangBukti() : BarangBukti
  + url() : string
}

Pengguna "1" -- "0..*" Perkara : menyidik >
Pengguna "1" -- "0..*" BarangBukti : menerima >
Pengguna "1" -- "0..*" RiwayatBarangBukti : menangani >
Perkara "1" *-- "0..*" BarangBukti : memiliki >
Kategori "1" -- "0..*" BarangBukti : mengelompokkan >
LokasiPenyimpanan "1" -- "0..*" BarangBukti : menyimpan >
BarangBukti "1" *-- "1..*" RiwayatBarangBukti : riwayat >
BarangBukti "1" *-- "0..*" Lampiran : lampiran >
LokasiPenyimpanan "0..1" -- "0..*" RiwayatBarangBukti : asal >
LokasiPenyimpanan "1" -- "0..*" RiwayatBarangBukti : tujuan >

Pengguna ..> Role
Pengguna ..> StatusAkun
Perkara ..> Tahap
BarangBukti ..> Kondisi
BarangBukti ..> StatusBarang
RiwayatBarangBukti ..> JenisRiwayat
LokasiPenyimpanan ..> JenisLokasi
@enduml
```

**Catatan:**
- Barang bukti terdaftar (bukan draf) selalu memiliki minimal satu riwayat (Penerimaan), karena itu multiplisitas `1..*`.
- `lokasi_asal_id` boleh kosong (`0..1`) untuk kejadian Penerimaan, yang berarti diserahkan oleh penyidik.
- `catatKejadian()` dijalankan dalam satu transaksi: menyimpan riwayat dan memperbarui `lokasi_id` serta `status` barang.
