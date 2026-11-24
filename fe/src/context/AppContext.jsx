/* State aplikasi: data dari Supabase, sesi login (Supabase Auth), aksi CRUD, dan toast.
   • Membaca: langsung dari tabel (dijaga RLS).
   • Menulis: lewat fungsi database (supabase.rpc) yang menegakkan aturan bisnis — lihat supabase/02_functions.sql.
   • Setiap aksi memuat ulang data, sehingga tampilan selalu sama dengan basis data.
   Semua aksi async dan TIDAK melempar galat: hasilnya { ok, data?, msg?, field? }. */
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import {
  APP_TIMEZONE, createSignupClient, setRemember, supabase, supabaseConfigured, usernameToEmail,
} from '../lib/supabase';
import { nowLocal, todayISO } from '../utils/format';

const NOTIF_KEY = 'siber_evidence_fe_notif_seen';
const BUCKET = 'lampiran';
const TABLES = ['pengguna', 'kategori', 'lokasi_penyimpanan', 'perkara', 'barang_bukti', 'riwayat_barang_bukti', 'lampiran'];
const EMPTY = Object.fromEntries(TABLES.map((t) => [t, []]));

const AppCtx = createContext(null);
export const useApp = () => useContext(AppCtx);

class AppError extends Error {
  constructor(message, field, code) { super(message); this.field = field; this.code = code; }
}

/* ---------- konversi waktu: timestamptz (UTC) → "YYYY-MM-DDTHH:mm" waktu WITA ---------- */
const fmtLocal = new Intl.DateTimeFormat('en-CA', {
  timeZone: APP_TIMEZONE, year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', hourCycle: 'h23',
});
function toLocal(iso) {
  const parts = Object.fromEntries(fmtLocal.formatToParts(new Date(iso)).map((p) => [p.type, p.value]));
  return `${parts.year}-${parts.month}-${parts.day}T${parts.hour}:${parts.minute}`;
}
const TIME_FIELD = /(_at|_login|tanggal_waktu)$/;
function normalize(row) {
  if (!row || typeof row !== 'object') return row;
  const out = {};
  for (const [k, v] of Object.entries(row)) out[k] = typeof v === 'string' && TIME_FIELD.test(k) && v.length > 10 ? toLocal(v) : v;
  return out;
}

/* ---------- galat Supabase/PostgREST → pesan bahasa Indonesia ---------- */
function toAppError(error) {
  if (error instanceof AppError) return error;
  const msg = error?.message || 'Terjadi kesalahan.';
  const field = /^[a-z_]+$/.test(error?.hint || '') ? error.hint : undefined;
  if (/Failed to fetch|NetworkError|fetch failed/i.test(msg)) return new AppError('Tidak dapat terhubung ke Supabase. Periksa koneksi internet.');
  if (error?.code === '23503') return new AppError('Data masih dipakai oleh data lain sehingga tidak dapat dihapus.', undefined, error.code);
  if (error?.code === '23505') {
    const f = /kode/.test(error.details || msg) ? 'kode' : 'nama';
    return new AppError(f === 'kode' ? 'Kode sudah digunakan.' : 'Nama sudah digunakan.', f, error.code);
  }
  if (/row-level security|permission denied/i.test(msg)) return new AppError('Anda tidak memiliki akses untuk tindakan ini.', undefined, '42501');
  if (/JWT expired|invalid JWT|refresh token/i.test(msg)) return new AppError('Sesi berakhir. Silakan masuk kembali.', undefined, 'SESSION');
  return new AppError(msg, field, error?.code);
}

/* Jalankan query Supabase; lempar AppError bila gagal */
async function q(promise) {
  const { data, error } = await promise;
  if (error) throw toAppError(error);
  return data;
}
const rpc = (fn, args) => q(supabase.rpc(fn, args));

function loadNotifSeen() {
  try { return JSON.parse(localStorage.getItem(NOTIF_KEY) || '{}'); } catch { return {}; }
}

export function AppProvider({ children }) {
  const [data, setData] = useState(EMPTY);
  const [user, setUser] = useState(null);
  const [ready, setReady] = useState(false);
  const [bootError, setBootError] = useState('');
  const [notifSeen, setNotifSeen] = useState(loadNotifSeen);
  const [toasts, setToasts] = useState([]);
  const dataRef = useRef(data);
  dataRef.current = data;

  /* ---------- toast ---------- */
  const dismissToast = useCallback((id) => setToasts((t) => t.filter((x) => x.id !== id)), []);
  const toast = useCallback((type, title, message) => {
    const id = Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
    setToasts((t) => [...t.slice(-3), { id, type, title, message }]);
    window.setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 4500);
  }, []);

  /* ---------- muat semua tabel ---------- */
  const loadAll = useCallback(async () => {
    const results = await Promise.all(TABLES.map((t) => q(supabase.from(t).select('*').order('id'))));
    const d = Object.fromEntries(TABLES.map((t, i) => [t, results[i].map(normalize)]));
    /* Riwayat & lampiran milik barang yang sudah dihapus tidak ditampilkan (tetap tersimpan di DB) */
    const aktif = new Set(d.barang_bukti.map((b) => b.id));
    d.riwayat_barang_bukti = d.riwayat_barang_bukti.filter((r) => aktif.has(r.barang_bukti_id));
    d.lampiran = d.lampiran.filter((l) => aktif.has(l.barang_bukti_id));
    setData(d);
    return d;
  }, []);

  const clearSession = useCallback(() => { setUser(null); setData(EMPTY); }, []);

  /* Bungkus aksi: galat → { ok:false, msg, field }. Akun nonaktif / sesi habis → keluar otomatis. */
  const run = useCallback(async (fn, { reload = true } = {}) => {
    try {
      const result = await fn();
      if (reload) await loadAll();
      return { ok: true, data: result };
    } catch (raw) {
      const err = toAppError(raw);
      if (err.code === 'SESSION' || /Akun tidak aktif|sesi berakhir/i.test(err.message)) {
        await supabase.auth.signOut().catch(() => {});
        clearSession();
        toast('error', 'Sesi berakhir', err.message);
      }
      return { ok: false, msg: err.message, field: err.field };
    }
  }, [loadAll, clearSession, toast]);

  /* ---------- cek sesi saat aplikasi dibuka ---------- */
  const boot = useCallback(async () => {
    setBootError('');
    if (!supabaseConfigured) {
      setBootError('Supabase belum dikonfigurasi. Isi VITE_SUPABASE_URL dan VITE_SUPABASE_ANON_KEY di fe/.env.');
      setReady(true);
      return;
    }
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        try {
          const profil = await rpc('profil_saya');
          await loadAll();
          setUser(normalize(profil));
        } catch (err) {
          await supabase.auth.signOut().catch(() => {});
          clearSession();
          if (!/nonaktif|belum terdaftar/i.test(err.message)) setBootError(toAppError(err).message);
        }
      }
    } catch (err) {
      setBootError(toAppError(err).message);
    } finally {
      setReady(true);
    }
  }, [loadAll, clearSession]);

  useEffect(() => {
    boot();
    if (!supabase) return undefined;
    const { data: sub } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'SIGNED_OUT') clearSession();
    });
    return () => sub.subscription.unsubscribe();
  }, [boot, clearSession]);

  /* ---------- lookup id -> baris ---------- */
  const lookup = useMemo(() => {
    const by = (rows) => Object.fromEntries(rows.map((r) => [r.id, r]));
    return {
      pengguna: by(data.pengguna),
      kategori: by(data.kategori),
      lokasi: by(data.lokasi_penyimpanan),
      perkara: by(data.perkara),
      barang: by(data.barang_bukti),
    };
  }, [data]);

  /* ---------- autentikasi ---------- */
  async function login(username, password, remember) {
    if (!supabaseConfigured) return { ok: false, msg: 'Supabase belum dikonfigurasi.' };
    setRemember(remember);
    const { error } = await supabase.auth.signInWithPassword({ email: usernameToEmail(username), password });
    if (error) {
      return { ok: false, msg: /invalid login credentials/i.test(error.message) ? 'Nama pengguna atau kata sandi salah.' : toAppError(error).message };
    }
    try {
      const profil = normalize(await rpc('catat_login'));
      await loadAll();
      setUser(profil);
      setBootError('');
      return { ok: true, user: profil };
    } catch (err) {
      await supabase.auth.signOut().catch(() => {});
      clearSession();
      return { ok: false, msg: err.message };
    }
  }

  async function logout() {
    await supabase?.auth.signOut().catch(() => {});
    clearSession();
  }

  /* Verifikasi kata sandi lama dengan login ulang, lalu ganti */
  const changePassword = (lama, baru) => run(async () => {
    const { error } = await supabase.auth.signInWithPassword({ email: usernameToEmail(user.username), password: lama });
    if (error) throw new AppError('Kata sandi lama tidak sesuai.', 'lama');
    const { error: e2 } = await supabase.auth.updateUser({ password: baru });
    if (e2) throw new AppError(/should be different/i.test(e2.message) ? 'Kata sandi baru harus berbeda dari yang lama.' : e2.message, 'baru');
  }, { reload: false });

  /* ---------- perkara ---------- */
  const addPerkara = (f) => run(() => rpc('simpan_perkara', { p_id: null, p: f }).then(normalize));
  const updatePerkara = (id, f) => run(() => rpc('simpan_perkara', { p_id: id, p: f }).then(normalize));
  const deletePerkara = (id) => run(() => rpc('hapus_perkara', { p_id: id }));

  /* ---------- barang bukti (form memuat ulang sendiri setelah lampiran diunggah) ---------- */
  const addBarang = (f) => run(() => rpc('simpan_barang', { p_id: null, p: f }).then(normalize), { reload: false });
  const updateBarang = (id, f) => run(() => rpc('simpan_barang', { p_id: id, p: f }).then(normalize), { reload: false });
  const deleteBarang = (id) => run(() => rpc('hapus_barang', { p_id: id }));
  const nextKodeBB = () => rpc('next_kode_bb');

  /* ---------- lampiran: berkas ke Storage, metadata lewat fungsi ---------- */
  const uploadLampiran = (barangId, file) => run(async () => {
    const safe = file.name.normalize('NFKD').replace(/[^\w.-]+/g, '_').slice(-120);
    const path = `barang/${barangId}/${Date.now()}-${safe}`;
    await q(supabase.storage.from(BUCKET).upload(path, file, { contentType: file.type, upsert: false }));
    try {
      return normalize(await rpc('simpan_lampiran', {
        p_barang_id: barangId, p_nama_file: file.name, p_tipe_mime: file.type, p_ukuran: file.size, p_path: path,
      }));
    } catch (err) {
      await supabase.storage.from(BUCKET).remove([path]).catch(() => {});
      throw err;
    }
  }, { reload: false });

  const deleteLampiran = (id) => run(async () => {
    const path = await rpc('hapus_lampiran', { p_id: id });
    await supabase.storage.from(BUCKET).remove([path]).catch(() => {}); // metadata sudah terhapus
  });

  const lampiranUrl = (id) => run(async () => {
    const l = dataRef.current.lampiran.find((x) => x.id === id);
    if (!l) throw new AppError('Lampiran tidak ditemukan.');
    const res = await q(supabase.storage.from(BUCKET).createSignedUrl(l.path, 60));
    return res.signedUrl;
  }, { reload: false });

  /* ---------- riwayat ---------- */
  const addRiwayat = (ev) => run(() => rpc('catat_kejadian', { p: ev }).then(normalize));

  /* ---------- pengguna (Administrator) ---------- */
  const addUser = (f) => run(async () => {
    const tersedia = await rpc('cek_username', { p_username: f.username });
    if (!tersedia) throw new AppError('Nama pengguna sudah digunakan.', 'username');
    /* 1. Buat akun login di Supabase Auth (klien terpisah agar sesi Admin tidak berganti) */
    const { data: su, error } = await createSignupClient().auth.signUp({ email: usernameToEmail(f.username), password: f.password });
    if (error) {
      if (/already registered|already exists/i.test(error.message)) throw new AppError('Akun login dengan username ini sudah ada di Supabase Auth. Hapus dulu di Dashboard → Authentication.', 'username');
      if (/password/i.test(error.message)) throw new AppError(error.message, 'password');
      throw toAppError(error);
    }
    if (!su.user || su.user.identities?.length === 0) throw new AppError('Akun login dengan username ini sudah ada di Supabase Auth.', 'username');
    /* 2. Daftarkan profilnya di tabel pengguna */
    const { password, ...profil } = f; // eslint-disable-line no-unused-vars
    return normalize(await rpc('buat_pengguna', { p_auth_id: su.user.id, p: profil }));
  });
  const updateUser = (id, f) => run(() => rpc('ubah_pengguna', { p_id: id, p: f }));
  const setUserStatus = (id, status) => run(() => rpc('ubah_status_pengguna', { p_id: id, p_status: status }));
  const resetUserPassword = (id, password) => run(() => rpc('reset_password_pengguna', { p_id: id, p_password: password }), { reload: false });

  /* ---------- master data (Administrator; ditulis langsung, dijaga RLS) ---------- */
  const masterTable = { kategori: 'kategori', lokasi: 'lokasi_penyimpanan' };
  const saveMaster = (kind, id, f) => run(async () => {
    const table = supabase.from(masterTable[kind]);
    const rows = await q(id ? table.update(f).eq('id', id).select() : table.insert(f).select());
    if (!rows?.length) throw new AppError('Anda tidak memiliki akses untuk tindakan ini.');
    return rows[0];
  });
  const deleteMaster = (kind, id) => run(async () => {
    const rows = await q(supabase.from(masterTable[kind]).delete().eq('id', id).select('id'));
    if (!rows?.length) throw new AppError('Data tidak ditemukan atau Anda tidak memiliki akses.');
  });

  /* Jumlah data aktif yang merujuk (untuk menonaktifkan tombol hapus; database tetap memeriksa ulang) */
  function masterUsage(kind, id) {
    if (kind === 'kategori') return data.barang_bukti.filter((b) => b.kategori_id === id).length;
    return data.barang_bukti.filter((b) => b.lokasi_id === id).length
      + data.riwayat_barang_bukti.filter((r) => r.lokasi_asal_id === id || r.lokasi_tujuan_id === id).length;
  }

  /* ---------- notifikasi (disimpan per pengguna di peramban) ---------- */
  function markNotifSeen() {
    if (!user) return;
    const next = { ...notifSeen, [user.id]: nowLocal() };
    setNotifSeen(next);
    localStorage.setItem(NOTIF_KEY, JSON.stringify(next));
  }

  /* Peminjaman aktif yang melewati tanggal harapan kembali */
  const overdueLoans = useMemo(() => {
    const today = todayISO();
    return data.riwayat_barang_bukti.filter((r) => r.jenis === 'peminjaman' && r.status_kembali === 'belum_kembali'
      && r.tanggal_harapan_kembali && r.tanggal_harapan_kembali < today);
  }, [data.riwayat_barang_bukti]);

  const value = {
    data, lookup, user, ready, bootError, retryBoot: boot, refresh: () => run(() => null), toasts, toast, dismissToast,
    login, logout, changePassword,
    addPerkara, updatePerkara, deletePerkara,
    addBarang, updateBarang, deleteBarang, nextKodeBB,
    uploadLampiran, deleteLampiran, lampiranUrl,
    addRiwayat,
    addUser, updateUser, setUserStatus, resetUserPassword,
    saveMaster, deleteMaster, masterUsage,
    notifSeen: user ? notifSeen[user.id] || '' : '', markNotifSeen,
    overdueLoans,
  };

  return <AppCtx.Provider value={value}>{children}</AppCtx.Provider>;
}
