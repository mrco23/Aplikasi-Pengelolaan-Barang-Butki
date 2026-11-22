import { BULAN } from '../constants';

export function cn(...xs) {
  return xs.filter(Boolean).join(' ');
}

export const pad2 = (n) => String(n).padStart(2, '0');

export function todayISO() {
  const d = new Date();
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
}

export function nowLocal() {
  const d = new Date();
  return `${todayISO()}T${pad2(d.getHours())}:${pad2(d.getMinutes())}`;
}

/* "2026-09-10" -> "10 September 2026" */
export function fmtDate(iso) {
  if (!iso) return '-';
  const [y, m, d] = iso.slice(0, 10).split('-').map(Number);
  if (!y || !m || !d) return iso;
  return `${d} ${BULAN[m - 1]} ${y}`;
}

/* "2026-09-10T09:15" -> "10 September 2026, 09.15" */
export function fmtDateTime(s) {
  if (!s) return '-';
  const [d, t] = s.split('T');
  return `${fmtDate(d)}${t ? ', ' + t.slice(0, 5).replace(':', '.') : ''}`;
}

export function fmtBytes(n) {
  if (n === null || n === undefined) return '-';
  if (n < 1024) return n + ' B';
  const u = ['KB', 'MB', 'GB'];
  let i = -1;
  do { n /= 1024; i++; } while (n >= 1024 && i < 2);
  return n.toFixed(n < 10 ? 1 : 0).replace('.', ',') + ' ' + u[i];
}

export function initials(nama) {
  return (nama || '?').split(' ').filter(Boolean).slice(0, 2).map((w) => w[0]).join('').toUpperCase();
}

/* Nama tampilan pengguna: "IPDA Danu Kusuma" */
export function namaPengguna(u) {
  if (!u) return '-';
  return u.pangkat ? `${u.pangkat} ${u.nama}` : u.nama;
}

/* Selisih hari (b - a) untuk tanggal ISO */
export function diffDays(a, b) {
  const ms = new Date(b.slice(0, 10) + 'T00:00').getTime() - new Date(a.slice(0, 10) + 'T00:00').getTime();
  return Math.round(ms / 86400000);
}

export function truncate(s, n) {
  return s && s.length > n ? s.slice(0, n) + '…' : s;
}

export function exportCsv(filename, headers, rows) {
  const esc = (v) => `"${String(v ?? '').replace(/"/g, '""')}"`;
  const csv = [headers.map(esc).join(';'), ...rows.map((r) => r.map(esc).join(';'))].join('\r\n');
  downloadBlob(filename, new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8;' }));
}

export function downloadBlob(filename, blob) {
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(a.href), 800);
}
