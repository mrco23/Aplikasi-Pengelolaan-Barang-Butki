// Konstanta
export const STORE_KEY = 'siber_evidence_v1';
export const SESSION_KEY = 'se_session';

export const BULAN = ['Januari','Februari','Maret','April','Mei','Juni','Juli','Agustus','September','Oktober','November','Desember'];
export const KATEGORI = ['Elektronik','Media Penyimpanan','Dokumen Digital','Perangkat Jaringan','Lainnya'];
export const KONDISI = ['Baik','Rusak Ringan','Rusak Berat'];
export const STATUS_BB = ['Tersedia','Dipinjam','Dalam Pemeriksaan','Dihancurkan'];
export const JENIS_RIWAYAT = ['Penerimaan','Perpindahan','Peminjaman','Pengembalian','Pemeriksaan','Pengalihan'];
export const LOKASI = [
  'Ruang Barang Bukti — Rak A1','Ruang Barang Bukti — Rak A2','Ruang Barang Bukti — Rak B1','Ruang Barang Bukti — Rak B2',
  'Lemari Kunci 01','Lemari Kunci 02','Gudang Barang Bukti','Ruang Forensik Digital',
];

export const JENIS_META = {
  Penerimaan:   { icon: 'package',          badge: 'bg-blue-50 text-blue-700 ring-blue-600/20',        dot: 'bg-blue-50 text-blue-600 ring-blue-100' },
  Perpindahan:  { icon: 'arrow-right-left', badge: 'bg-indigo-50 text-indigo-700 ring-indigo-600/20',  dot: 'bg-indigo-50 text-indigo-600 ring-indigo-100' },
  Peminjaman:   { icon: 'arrow-up-right',   badge: 'bg-amber-50 text-amber-700 ring-amber-600/20',     dot: 'bg-amber-50 text-amber-600 ring-amber-100' },
  Pengembalian: { icon: 'arrow-down-left',  badge: 'bg-emerald-50 text-emerald-700 ring-emerald-600/20', dot: 'bg-emerald-50 text-emerald-600 ring-emerald-100' },
  Pemeriksaan:  { icon: 'search',           badge: 'bg-violet-50 text-violet-700 ring-violet-600/20',  dot: 'bg-violet-50 text-violet-600 ring-violet-100' },
  Pengalihan:   { icon: 'shuffle',          badge: 'bg-slate-100 text-slate-600 ring-slate-500/20',    dot: 'bg-slate-100 text-slate-500 ring-slate-200' },
};

export const BADGE_TONE = {
  'Tersedia': 'bg-emerald-50 text-emerald-700 ring-emerald-600/20',
  'Dipinjam': 'bg-amber-50 text-amber-700 ring-amber-600/20',
  'Dalam Pemeriksaan': 'bg-blue-50 text-blue-700 ring-blue-600/20',
  'Dihancurkan': 'bg-red-50 text-red-700 ring-red-600/20',
  'Draf': 'bg-slate-100 text-slate-600 ring-slate-500/20',
  'Lidik': 'bg-sky-50 text-sky-700 ring-sky-600/20',
  'Sidik': 'bg-indigo-50 text-indigo-700 ring-indigo-600/20',
  'Aktif': 'bg-emerald-50 text-emerald-700 ring-emerald-600/20',
  'Nonaktif': 'bg-red-50 text-red-700 ring-red-600/20',
  'Administrator': 'bg-navy-50 text-navy-800 ring-navy-800/20',
  'Petugas': 'bg-slate-100 text-slate-600 ring-slate-500/20',
  'Belum Kembali': 'bg-amber-50 text-amber-700 ring-amber-600/20',
  'Sudah Kembali': 'bg-emerald-50 text-emerald-700 ring-emerald-600/20',
};

export const KONDISI_DOT = { 'Baik': 'bg-emerald-500', 'Rusak Ringan': 'bg-amber-500', 'Rusak Berat': 'bg-red-500' };
export const KAT_ICON = {
  'Elektronik': 'laptop', 'Media Penyimpanan': 'hard-drive', 'Dokumen Digital': 'file-text',
  'Perangkat Jaringan': 'wifi', 'Lainnya': 'package',
};

// Utilitas Umum
export function cn(...xs) { return xs.filter(Boolean).join(' '); }
export function uid(p = 'id') { return p + '-' + Date.now().toString(36) + Math.random().toString(36).slice(2, 7); }
export function pad2(n) { return String(n).padStart(2, '0'); }
export function todayISO() { const d = new Date(); return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`; }
export function nowLocal() { const d = new Date(); return `${todayISO()}T${pad2(d.getHours())}:${pad2(d.getMinutes())}`; }

export function fmtDate(iso) {
  if (!iso) return '-';
  const [y, m, d] = iso.split('-').map(Number);
  if (!y || !m || !d) return iso;
  return `${d} ${BULAN[m - 1]} ${y}`;
}

export function fmtDateTime(s) {
  if (!s) return '-';
  const [d, t] = s.split('T');
  return `${fmtDate(d)}${t ? ', ' + t.replace(':', '.') : ''}`;
}

export function fmtBytes(n) {
  if (!n && n !== 0) return '-';
  if (n < 1024) return n + ' B';
  const u = ['KB', 'MB', 'GB']; let i = -1;
  do { n /= 1024; i++; } while (n >= 1024 && i < 2);
  return n.toFixed(n < 10 ? 1 : 0).replace('.', ',') + ' ' + u[i];
}

export function initials(nama) {
  return (nama || '?').split(' ').filter(Boolean).slice(0, 2).map(w => w[0]).join('').toUpperCase();
}

export function exportCsv(filename, headers, rows) {
  const esc = (v) => `"${String(v).replace(/"/g, '""')}"`;
  const csv = [headers.map(esc).join(';'), ...rows.map(r => r.map(esc).join(';'))].join('\r\n');
  const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = filename;
  document.body.appendChild(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(a.href), 800);
}

export function nextKodeBB(barang) {
  let max = 0;
  barang.forEach(b => { const m = b.kode.match(/^BB-\d{4}-(\d+)$/); if (m) max = Math.max(max, parseInt(m[1], 10)); });
  return `BB-${new Date().getFullYear()}-${pad2(max + 1).padStart(4, '0')}`;
}
