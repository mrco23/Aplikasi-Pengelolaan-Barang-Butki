import { seedStore } from '../data/seedData';
import { STORE_KEY, SESSION_KEY } from './helpers';

export function loadStore() {
  try {
    const raw = localStorage.getItem(STORE_KEY);
    if (raw) {
      const d = JSON.parse(raw);
      if (d && Array.isArray(d.perkara) && Array.isArray(d.barang) && Array.isArray(d.riwayat) && Array.isArray(d.users)) return d;
    }
  } catch (e) { /* abaikan, gunakan seed */ }
  const s = seedStore();
  saveStore(s);
  return s;
}

export function saveStore(d) {
  try { localStorage.setItem(STORE_KEY, JSON.stringify(d)); } catch (e) { /* kuota penuh — abaikan pada demo */ }
}

export function loadSession() {
  try {
    const raw = localStorage.getItem(SESSION_KEY) || sessionStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    const s = JSON.parse(raw);
    const data = loadStore();
    return data.users.find((u) => u.username === s.username && u.status === 'Aktif') || null;
  } catch (e) { return null; }
}
