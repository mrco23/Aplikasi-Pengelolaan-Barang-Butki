/* State aplikasi: data (seed JSON + localStorage), sesi login, aksi CRUD, dan toast.
   Saat backend Laravel siap, ganti isi fungsi aksi dengan pemanggilan API — komponen tidak perlu berubah. */
import { createContext, useCallback, useContext, useMemo, useRef, useState, useEffect } from 'react';
import { createSeed, SEED_VERSION } from '../data';
import { nowLocal, todayISO } from '../utils/format';

const STORE_KEY = 'siber_evidence_fe_data';
const SESSION_KEY = 'siber_evidence_fe_session';
const NOTIF_KEY = 'siber_evidence_fe_notif_seen';

const AppCtx = createContext(null);
export const useApp = () => useContext(AppCtx);

function loadData() {
  try {
    const raw = localStorage.getItem(STORE_KEY);
    if (raw) {
      const d = JSON.parse(raw);
      if (d && d.version === SEED_VERSION && d.tables) return d.tables;
    }
  } catch { /* abaikan, pakai seed */ }
  return createSeed();
}

function saveData(tables) {
  try { localStorage.setItem(STORE_KEY, JSON.stringify({ version: SEED_VERSION, tables })); } catch { /* kuota penuh */ }
}

function loadSessionId() {
  try {
    const raw = localStorage.getItem(SESSION_KEY) || sessionStorage.getItem(SESSION_KEY);
    return raw ? JSON.parse(raw).id : null;
  } catch { return null; }
}

function loadNotifSeen() {
  try { return JSON.parse(localStorage.getItem(NOTIF_KEY) || '{}'); } catch { return {}; }
}

const nextId = (rows) => rows.reduce((m, r) => Math.max(m, r.id), 0) + 1;

/* Kode otomatis: BB-<tahun>-<nomor urut 4 digit> */
export function generateKodeBB(barang, year = new Date().getFullYear()) {
  let max = 0;
  barang.forEach((b) => {
    const m = b.kode.match(/^BB-(\d{4})-(\d+)$/);
    if (m && Number(m[1]) === year) max = Math.max(max, parseInt(m[2], 10));
  });
  return `BB-${year}-${String(max + 1).padStart(4, '0')}`;
}

/* Perubahan status & lokasi barang akibat sebuah kejadian riwayat */
function applyEvent(barang, ev, lokasiById) {
  let { status, lokasi_id } = barang;
  if (ev.jenis === 'peminjaman') { status = 'dipinjam'; lokasi_id = ev.lokasi_tujuan_id; }
  else if (ev.jenis === 'pengembalian') { status = 'tersedia'; lokasi_id = ev.lokasi_tujuan_id; }
  else if (ev.jenis === 'perpindahan' || ev.jenis === 'penerimaan') { lokasi_id = ev.lokasi_tujuan_id; }
  else if (ev.jenis === 'pengalihan') {
    lokasi_id = ev.lokasi_tujuan_id;
    if (lokasiById[lokasi_id]?.jenis === 'pemusnahan') status = 'dihancurkan';
  }
  return { ...barang, status, lokasi_id, updated_at: ev.tanggal_waktu };
}

export function AppProvider({ children }) {
  const [data, setData] = useState(loadData);
  const dataRef = useRef(data);
  const [sessionId, setSessionId] = useState(loadSessionId);
  const [notifSeen, setNotifSeen] = useState(loadNotifSeen);
  const [toasts, setToasts] = useState([]);

  useEffect(() => { saveData(data); }, [data]);

  const commit = useCallback((fn) => {
    const next = fn(dataRef.current);
    dataRef.current = next;
    setData(next);
    return next;
  }, []);

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

  const user = useMemo(() => {
    const u = data.pengguna.find((x) => x.id === sessionId);
    return u && u.status === 'aktif' ? u : null;
  }, [data.pengguna, sessionId]);

  /* ---------- toast ---------- */
  const dismissToast = useCallback((id) => setToasts((t) => t.filter((x) => x.id !== id)), []);
  const toast = useCallback((type, title, message) => {
    const id = Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
    setToasts((t) => [...t.slice(-3), { id, type, title, message }]);
    window.setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 4500);
  }, []);

  /* ---------- autentikasi ---------- */
  function login(username, password, remember) {
    const u = dataRef.current.pengguna.find((x) => x.username.toLowerCase() === username.trim().toLowerCase());
    if (!u) return { ok: false, msg: 'Nama pengguna tidak terdaftar.' };
    if (u.status !== 'aktif') return { ok: false, msg: 'Akun ini berstatus nonaktif. Hubungi administrator.' };
    if (u.password !== password) return { ok: false, msg: 'Kata sandi salah.' };
    const now = nowLocal();
    commit((d) => ({ ...d, pengguna: d.pengguna.map((x) => (x.id === u.id ? { ...x, terakhir_login: now } : x)) }));
    const sess = JSON.stringify({ id: u.id });
    (remember ? localStorage : sessionStorage).setItem(SESSION_KEY, sess);
    (remember ? sessionStorage : localStorage).removeItem(SESSION_KEY);
    setSessionId(u.id);
    return { ok: true, user: u };
  }

  function logout() {
    localStorage.removeItem(SESSION_KEY);
    sessionStorage.removeItem(SESSION_KEY);
    setSessionId(null);
  }

  function changePassword(oldPw, newPw) {
    if (!user) return { ok: false, msg: 'Sesi tidak ditemukan.' };
    if (user.password !== oldPw) return { ok: false, msg: 'Kata sandi lama tidak sesuai.' };
    commit((d) => ({ ...d, pengguna: d.pengguna.map((x) => (x.id === user.id ? { ...x, password: newPw, updated_at: nowLocal() } : x)) }));
    return { ok: true };
  }

  /* ---------- perkara ---------- */
  function addPerkara(f) {
    const now = nowLocal();
    let row;
    commit((d) => {
      row = { id: nextId(d.perkara), ...f, nomor_lp: f.nomor_lp.trim(), created_by: user?.id ?? null, created_at: now, updated_at: now };
      return { ...d, perkara: [...d.perkara, row] };
    });
    return row;
  }

  function updatePerkara(id, f) {
    commit((d) => ({
      ...d,
      perkara: d.perkara.map((x) => (x.id === id ? { ...x, ...f, nomor_lp: f.nomor_lp.trim(), updated_at: nowLocal() } : x)),
    }));
  }

  /* ---------- lampiran (metadata) ---------- */
  function syncLampiran(d, barangId, list) {
    const others = d.lampiran.filter((l) => l.barang_bukti_id !== barangId);
    let id = nextId(d.lampiran);
    const now = nowLocal();
    const mine = list.map((l) => (l.id
      ? l
      : { id: id++, barang_bukti_id: barangId, nama_file: l.nama_file, tipe_mime: l.tipe_mime, ukuran_byte: l.ukuran_byte,
          path: `lampiran/${now.slice(0, 4)}/${now.slice(5, 7)}/${l.nama_file}`, diunggah_oleh: user?.id ?? null, created_at: now }));
    return [...others, ...mine];
  }

  function penerimaanEvent(d, b, alasan) {
    return {
      id: nextId(d.riwayat_barang_bukti),
      barang_bukti_id: b.id,
      jenis: 'penerimaan',
      tanggal_waktu: `${b.tanggal_penerimaan}T${nowLocal().slice(11)}`,
      lokasi_asal_id: null,
      lokasi_tujuan_id: b.lokasi_id,
      petugas_id: b.petugas_penerima_id,
      alasan,
      catatan: b.catatan || '',
      tanggal_harapan_kembali: null,
      status_kembali: null,
      dicatat_oleh: user?.id ?? null,
      created_at: nowLocal(),
    };
  }

  /* ---------- barang bukti ---------- */
  function addBarang(f, lampiranList) {
    const now = nowLocal();
    let row;
    commit((d) => {
      row = { id: nextId(d.barang_bukti), ...f, kode: f.kode.trim(), created_by: user?.id ?? null, created_at: now, updated_at: now };
      const riwayat = row.is_draf ? d.riwayat_barang_bukti : [...d.riwayat_barang_bukti, penerimaanEvent(d, row, 'Penerimaan awal barang bukti')];
      return { ...d, barang_bukti: [...d.barang_bukti, row], riwayat_barang_bukti: riwayat, lampiran: syncLampiran(d, row.id, lampiranList) };
    });
    return row;
  }

  function updateBarang(id, f, lampiranList) {
    commit((d) => {
      const old = d.barang_bukti.find((b) => b.id === id);
      if (!old) return d;
      const now = nowLocal();
      const nb = { ...old, ...f, kode: f.kode.trim(), updated_at: now };
      let rv = d.riwayat_barang_bukti;
      const auto = (jenis, alasan, asal, tujuan) => ({
        id: nextId(rv), barang_bukti_id: id, jenis, tanggal_waktu: now, lokasi_asal_id: asal, lokasi_tujuan_id: tujuan,
        petugas_id: user?.id ?? null, alasan, catatan: 'Dicatat otomatis oleh sistem.', tanggal_harapan_kembali: null,
        status_kembali: null, dicatat_oleh: user?.id ?? null, created_at: now,
      });
      if (!nb.is_draf) {
        if (old.is_draf) rv = [...rv, penerimaanEvent({ ...d, riwayat_barang_bukti: rv }, nb, 'Pendaftaran barang bukti dari draf')];
        else if (old.lokasi_id !== nb.lokasi_id) rv = [...rv, auto('perpindahan', 'Penyesuaian lokasi melalui formulir edit', old.lokasi_id, nb.lokasi_id)];
        else if (old.status !== nb.status) rv = [...rv, auto('pemeriksaan', 'Pembaruan status melalui formulir edit', nb.lokasi_id, nb.lokasi_id)];
      }
      return {
        ...d,
        barang_bukti: d.barang_bukti.map((b) => (b.id === id ? nb : b)),
        riwayat_barang_bukti: rv,
        lampiran: syncLampiran(d, id, lampiranList),
      };
    });
  }

  /* ---------- riwayat (append-only) ---------- */
  function addRiwayat(ev) {
    commit((d) => {
      const now = nowLocal();
      const row = { id: nextId(d.riwayat_barang_bukti), ...ev, dicatat_oleh: user?.id ?? null, created_at: now };
      let rv = [...d.riwayat_barang_bukti, row];
      if (ev.jenis === 'pengembalian') {
        const open = [...rv].reverse().find((r) => r.barang_bukti_id === ev.barang_bukti_id && r.jenis === 'peminjaman' && r.status_kembali === 'belum_kembali');
        if (open) rv = rv.map((r) => (r.id === open.id ? { ...r, status_kembali: 'sudah_kembali' } : r));
      }
      const lokasiById = Object.fromEntries(d.lokasi_penyimpanan.map((l) => [l.id, l]));
      const barang_bukti = d.barang_bukti.map((b) => (b.id === ev.barang_bukti_id && !b.is_draf ? applyEvent(b, ev, lokasiById) : b));
      return { ...d, riwayat_barang_bukti: rv, barang_bukti };
    });
  }

  /* ---------- notifikasi & data demo ---------- */
  function markNotifSeen() {
    if (!user) return;
    const next = { ...notifSeen, [user.id]: nowLocal() };
    setNotifSeen(next);
    localStorage.setItem(NOTIF_KEY, JSON.stringify(next));
  }

  function resetData() {
    commit(() => createSeed());
  }

  /* Peminjaman aktif yang melewati tanggal harapan kembali */
  const overdueLoans = useMemo(() => {
    const today = todayISO();
    return data.riwayat_barang_bukti.filter((r) => r.jenis === 'peminjaman' && r.status_kembali === 'belum_kembali'
      && r.tanggal_harapan_kembali && r.tanggal_harapan_kembali < today);
  }, [data.riwayat_barang_bukti]);

  const value = {
    data, lookup, user, toasts, toast, dismissToast,
    login, logout, changePassword,
    addPerkara, updatePerkara, addBarang, updateBarang, addRiwayat,
    nextKodeBB: () => generateKodeBB(dataRef.current.barang_bukti),
    notifSeen: user ? notifSeen[user.id] || '' : '', markNotifSeen,
    resetData, overdueLoans, storeKey: STORE_KEY,
  };

  return <AppCtx.Provider value={value}>{children}</AppCtx.Provider>;
}
