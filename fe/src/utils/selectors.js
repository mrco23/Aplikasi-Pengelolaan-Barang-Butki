/* Helper membaca relasi (foreign key) dari lookup di AppContext */
import { LOKASI_PENYERAHAN } from '../constants';
import { namaPengguna } from './format';

export const lokasiNama = (lookup, id) => (id == null ? LOKASI_PENYERAHAN : lookup.lokasi[id]?.nama || '—');
export const penggunaNama = (lookup, id) => namaPengguna(lookup.pengguna[id]);
export const kategoriNama = (lookup, id) => lookup.kategori[id]?.nama || '—';
export const nomorLP = (lookup, id) => lookup.perkara[id]?.nomor_lp || '—';

/* Opsi <Select> petugas aktif */
export const petugasOptions = (data) => data.pengguna
  .filter((u) => u.status === 'aktif' && u.role === 'petugas')
  .map((u) => [String(u.id), namaPengguna(u)]);

export const lokasiOptions = (data, { includePemusnahan = false } = {}) => data.lokasi_penyimpanan
  .filter((l) => includePemusnahan || l.jenis !== 'pemusnahan')
  .map((l) => [String(l.id), l.nama]);

export const kategoriOptions = (data) => data.kategori.map((k) => [String(k.id), k.nama]);

export const sortByTimeDesc = (a, b) => b.tanggal_waktu.localeCompare(a.tanggal_waktu) || b.id - a.id;
