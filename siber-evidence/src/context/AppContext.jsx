import React, { useState, useEffect, useCallback, createContext, useContext } from 'react';
import { uid, nowLocal, SESSION_KEY } from '../utils/helpers';
import { loadStore, loadSession, saveStore } from '../utils/storage';
import { Toaster } from '../components/common/UI';

const AppCtx = createContext(null);
export function useApp() { return useContext(AppCtx); }

export function AppProvider({ children }) {
  const [data, setData] = useState(loadStore);
  const [user, setUser] = useState(loadSession);
  const [toasts, setToasts] = useState([]);

  useEffect(() => { saveStore(data); }, [data]);
  useEffect(() => { const b = document.getElementById('boot'); if (b) b.remove(); }, []);

  const dismissToast = useCallback((id) => setToasts(t => t.filter(x => x.id !== id)), []);
  const toast = useCallback((type, title, message) => {
    const id = uid('t');
    setToasts(t => [...t.slice(-3), { id, type, title, message }]);
    window.setTimeout(() => setToasts(t => t.filter(x => x.id !== id)), 4500);
  }, []);

  /* ---- autentikasi (demo) ---- */
  function login(username, password, remember) {
    const u = data.users.find(x => x.username.toLowerCase() === username.trim().toLowerCase());
    if (!u) return { ok: false, msg: 'Nama pengguna tidak terdaftar pada data demo.' };
    if (u.status !== 'Aktif') return { ok: false, msg: 'Akun ini berstatus nonaktif. Hubungi administrator.' };
    if (password !== 'demo123') return { ok: false, msg: 'Kata sandi salah. Untuk demo, gunakan kata sandi: demo123' };
    const nu = { ...u, aktivitasTerakhir: nowLocal() };
    setData(d => ({ ...d, users: d.users.map(x => (x.id === u.id ? nu : x)) }));
    const sess = JSON.stringify({ username: u.username });
    (remember ? localStorage : sessionStorage).setItem(SESSION_KEY, sess);
    (remember ? sessionStorage : localStorage).removeItem(SESSION_KEY);
    setUser(nu);
    return { ok: true, nama: nu.nama };
  }
  function logout() {
    localStorage.removeItem(SESSION_KEY);
    sessionStorage.removeItem(SESSION_KEY);
    setUser(null);
  }

  /* ---- CRUD perkara ---- */
  function addPerkara(p) {
    const np = { ...p, nomorLP: p.nomorLP.trim(), id: uid('pk'), createdAt: nowLocal() };
    setData(d => ({ ...d, perkara: [...d.perkara, np] }));
    return np;
  }
  function updatePerkara(id, p) {
    setData(d => ({ ...d, perkara: d.perkara.map(x => (x.id === id ? { ...x, ...p, nomorLP: p.nomorLP.trim() } : x)) }));
  }
  function deletePerkara(id) {
    const p = data.perkara.find(x => x.id === id);
    if (!p) return { ok: false, msg: 'Perkara tidak ditemukan.' };
    const linked = data.barang.filter(b => b.nomorLP === p.nomorLP).length;
    if (linked > 0) return { ok: false, msg: `Tidak dapat dihapus: masih terdapat ${linked} barang bukti terkait LP ini.` };
    setData(d => ({ ...d, perkara: d.perkara.filter(x => x.id !== id) }));
    return { ok: true };
  }

  /* ---- CRUD barang bukti ---- */
  function penerimaanEvent(nb, alasan) {
    return {
      id: uid('rv'), kodeBB: nb.kode, jenis: 'Penerimaan',
      tanggalWaktu: (nb.tanggalPenerimaan || nowLocal().slice(0, 10)) + 'T09:00',
      lokasiAsal: 'Penyerahan Penyidik', lokasiTujuan: nb.lokasi, petugas: nb.petugasPenerima,
      alasan, catatan: nb.catatan || '', harapanKembali: '', statusKembali: '',
    };
  }
  function addBarang(p) {
    const nb = { ...p, kode: p.kode.trim(), id: uid('bb'), createdAt: nowLocal() };
    setData(d => {
      const rv = [...d.riwayat];
      if (!nb.draf) rv.push(penerimaanEvent(nb, 'Penerimaan awal barang bukti'));
      return { ...d, barang: [...d.barang, nb], riwayat: rv };
    });
    return nb;
  }
  function updateBarang(id, p) {
    setData(d => {
      const old = d.barang.find(b => b.id === id);
      if (!old) return d;
      const nb = { ...old, ...p, kode: p.kode.trim(), id: old.id, createdAt: old.createdAt };
      let rv = d.riwayat;
      if (old.kode !== nb.kode) rv = rv.map(r => (r.kodeBB === old.kode ? { ...r, kodeBB: nb.kode } : r));
      if (!nb.draf) {
        const now = nowLocal();
        const petugas = user ? user.nama : 'Sistem';
        if (old.draf) {
          rv = [...rv, penerimaanEvent(nb, 'Pendaftaran barang bukti dari draft')];
        } else if (old.lokasi !== nb.lokasi) {
          rv = [...rv, { id: uid('rv'), kodeBB: nb.kode, jenis: 'Perpindahan', tanggalWaktu: now, lokasiAsal: old.lokasi, lokasiTujuan: nb.lokasi, petugas, alasan: 'Penyesuaian lokasi melalui formulir edit', catatan: 'Dicatat otomatis oleh sistem (demo).', harapanKembali: '', statusKembali: '' }];
        } else if (old.status !== nb.status) {
          rv = [...rv, { id: uid('rv'), kodeBB: nb.kode, jenis: 'Pemeriksaan', tanggalWaktu: now, lokasiAsal: nb.lokasi, lokasiTujuan: nb.lokasi, petugas, alasan: 'Pembaruan status melalui formulir edit', catatan: 'Dicatat otomatis oleh sistem (demo).', harapanKembali: '', statusKembali: '' }];
        }
      }
      return { ...d, barang: d.barang.map(b => (b.id === id ? nb : b)), riwayat: rv };
    });
  }
  function deleteBarang(id) {
    const b = data.barang.find(x => x.id === id);
    if (!b) return { ok: false, msg: 'Data tidak ditemukan.' };
    setData(d => ({ ...d, barang: d.barang.filter(x => x.id !== id), riwayat: d.riwayat.filter(r => r.kodeBB !== b.kode) }));
    return { ok: true };
  }

  function addRiwayat(ev) {
    setData(d => {
      const rv = [...d.riwayat, { ...ev, id: uid('rv') }];
      const barang = d.barang.map(b => {
        if (b.kode !== ev.kodeBB || b.draf) return b;
        let status = b.status, lokasi = b.lokasi;
        if (ev.jenis === 'Peminjaman') { status = 'Dipinjam'; lokasi = ev.lokasiTujuan || lokasi; }
        else if (ev.jenis === 'Pengembalian') { status = 'Tersedia'; lokasi = ev.lokasiTujuan || lokasi; }
        else if (ev.jenis === 'Perpindahan' || ev.jenis === 'Pengalihan' || ev.jenis === 'Penerimaan') { lokasi = ev.lokasiTujuan || lokasi; }
        return { ...b, status, lokasi };
      });
      if (ev.jenis === 'Pengembalian') {
        for (let i = rv.length - 1; i >= 0; i--) {
          const r = rv[i];
          if (r.kodeBB === ev.kodeBB && r.jenis === 'Peminjaman' && r.statusKembali === 'Belum Kembali') {
            rv[i] = { ...r, statusKembali: 'Sudah Kembali' };
            break;
          }
        }
      }
      return { ...d, barang, riwayat: rv };
    });
  }

  function addUser(p) {
    const u = p.username.trim().toLowerCase();
    if (data.users.some(x => x.username.toLowerCase() === u)) return { ok: false, msg: 'Nama pengguna sudah digunakan.' };
    const nu = { id: uid('usr'), username: p.username.trim(), nama: p.nama.trim(), role: p.role, status: p.status || 'Aktif', aktivitasTerakhir: '-' };
    setData(d => ({ ...d, users: [...d.users, nu] }));
    return { ok: true };
  }
  function updateUser(id, p) {
    setData(d => ({ ...d, users: d.users.map(x => (x.id === id ? { ...x, nama: p.nama.trim(), role: p.role, status: p.status } : x)) }));
  }
  function setUserStatus(id, status) {
    setData(d => ({ ...d, users: d.users.map(x => (x.id === id ? { ...x, status } : x)) }));
  }
  function deleteUser(id) {
    const u = data.users.find(x => x.id === id);
    if (!u) return { ok: false, msg: 'Pengguna tidak ditemukan.' };
    if (u.username === 'admin') return { ok: false, msg: 'Akun admin demo tidak dapat dihapus.' };
    if (user && u.id === user.id) return { ok: false, msg: 'Anda tidak dapat menghapus akun yang sedang digunakan.' };
    setData(d => ({ ...d, users: d.users.filter(x => x.id !== id) }));
    return { ok: true };
  }

  function resetDemo() {
    const { seedStore } = require('../data/seedData');
    const s = seedStore();
    setData(s);
  }
  function setNotifSeen() {
    setData(d => ({ ...d, notifSeen: nowLocal() }));
  }

  const value = {
    data, user, toasts, toast, dismissToast,
    login, logout, addPerkara, updatePerkara, deletePerkara,
    addBarang, updateBarang, deleteBarang, addRiwayat,
    addUser, updateUser, setUserStatus, deleteUser, resetDemo, setNotifSeen,
  };
  return <AppCtx.Provider value={value}>{children}<Toaster /></AppCtx.Provider>;
}
