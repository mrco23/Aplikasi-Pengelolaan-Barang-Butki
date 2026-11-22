/* Data awal (seed) aplikasi — satu file JSON per tabel. Lihat README.md untuk skema & ERD. */
import pengguna from './pengguna.json';
import kategori from './kategori.json';
import lokasi_penyimpanan from './lokasi_penyimpanan.json';
import perkara from './perkara.json';
import barang_bukti from './barang_bukti.json';
import riwayat_barang_bukti from './riwayat_barang_bukti.json';
import lampiran from './lampiran.json';

/* Naikkan angka ini setiap kali isi file JSON diubah, agar data lama di localStorage diganti. */
export const SEED_VERSION = 1;

export function createSeed() {
  return structuredClone({
    pengguna,
    kategori,
    lokasi_penyimpanan,
    perkara,
    barang_bukti,
    riwayat_barang_bukti,
    lampiran,
  });
}
