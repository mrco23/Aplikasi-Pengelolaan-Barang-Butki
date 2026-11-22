/* Nilai enum (disimpan di data) beserta label & warna tampilan. Kelas warna disalin dari prototipe. */
import {
  Package, ArrowRightLeft, ArrowUpRight, ArrowDownLeft, Search, Shuffle,
  Laptop, HardDrive, FileText, Wifi,
} from 'lucide-react';

export const BULAN = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];

export const ROLE = { administrator: 'Administrator', petugas: 'Petugas' };
export const STATUS_AKUN = { aktif: 'Aktif', nonaktif: 'Nonaktif' };

export const TAHAP = { lidik: 'Lidik', sidik: 'Sidik' };

export const KONDISI = { baik: 'Baik', rusak_ringan: 'Rusak Ringan', rusak_berat: 'Rusak Berat' };

export const STATUS_BB = {
  tersedia: 'Tersedia',
  dipinjam: 'Dipinjam',
  dalam_pemeriksaan: 'Dalam Pemeriksaan',
  dihancurkan: 'Dihancurkan',
};

export const JENIS_RIWAYAT = {
  penerimaan: 'Penerimaan',
  perpindahan: 'Perpindahan',
  peminjaman: 'Peminjaman',
  pengembalian: 'Pengembalian',
  pemeriksaan: 'Pemeriksaan',
  pengalihan: 'Pengalihan',
};

export const STATUS_KEMBALI = { belum_kembali: 'Belum Kembali', sudah_kembali: 'Sudah Kembali' };

/* Label lokasi asal untuk penerimaan (lokasi_asal_id = null) */
export const LOKASI_PENYERAHAN = 'Penyerahan Penyidik';

/* Ubah objek enum menjadi opsi <Select>: [[value, label], ...] */
export const toOptions = (obj) => Object.entries(obj);

export const JENIS_META = {
  penerimaan: { icon: Package, badge: 'bg-blue-50 text-blue-700 ring-blue-600/20', dot: 'bg-blue-50 text-blue-600 ring-blue-100' },
  perpindahan: { icon: ArrowRightLeft, badge: 'bg-indigo-50 text-indigo-700 ring-indigo-600/20', dot: 'bg-indigo-50 text-indigo-600 ring-indigo-100' },
  peminjaman: { icon: ArrowUpRight, badge: 'bg-amber-50 text-amber-700 ring-amber-600/20', dot: 'bg-amber-50 text-amber-600 ring-amber-100' },
  pengembalian: { icon: ArrowDownLeft, badge: 'bg-emerald-50 text-emerald-700 ring-emerald-600/20', dot: 'bg-emerald-50 text-emerald-600 ring-emerald-100' },
  pemeriksaan: { icon: Search, badge: 'bg-violet-50 text-violet-700 ring-violet-600/20', dot: 'bg-violet-50 text-violet-600 ring-violet-100' },
  pengalihan: { icon: Shuffle, badge: 'bg-slate-100 text-slate-600 ring-slate-500/20', dot: 'bg-slate-100 text-slate-500 ring-slate-200' },
};

/* Warna badge berdasarkan nilai enum */
export const BADGE_TONE = {
  tersedia: 'bg-emerald-50 text-emerald-700 ring-emerald-600/20',
  dipinjam: 'bg-amber-50 text-amber-700 ring-amber-600/20',
  dalam_pemeriksaan: 'bg-blue-50 text-blue-700 ring-blue-600/20',
  dihancurkan: 'bg-red-50 text-red-700 ring-red-600/20',
  draf: 'bg-slate-100 text-slate-600 ring-slate-500/20',
  lidik: 'bg-sky-50 text-sky-700 ring-sky-600/20',
  sidik: 'bg-indigo-50 text-indigo-700 ring-indigo-600/20',
  aktif: 'bg-emerald-50 text-emerald-700 ring-emerald-600/20',
  nonaktif: 'bg-red-50 text-red-700 ring-red-600/20',
  administrator: 'bg-navy-50 text-navy-800 ring-navy-800/20',
  petugas: 'bg-slate-100 text-slate-600 ring-slate-500/20',
  belum_kembali: 'bg-amber-50 text-amber-700 ring-amber-600/20',
  sudah_kembali: 'bg-emerald-50 text-emerald-700 ring-emerald-600/20',
  terlambat: 'bg-red-50 text-red-700 ring-red-600/20',
};

export const KONDISI_DOT = { baik: 'bg-emerald-500', rusak_ringan: 'bg-amber-500', rusak_berat: 'bg-red-500' };

export const STATUS_DOT = {
  tersedia: 'bg-emerald-500',
  dipinjam: 'bg-amber-500',
  dalam_pemeriksaan: 'bg-blue-500',
  dihancurkan: 'bg-red-500',
};

export const KATEGORI_ICON = {
  elektronik: Laptop,
  media_penyimpanan: HardDrive,
  dokumen_digital: FileText,
  perangkat_jaringan: Wifi,
  lainnya: Package,
};
