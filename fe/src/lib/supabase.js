/* Klien Supabase. Kunci anon/publishable aman berada di frontend karena semua tabel dijaga RLS
   (lihat supabase/03_policies.sql). JANGAN pernah menaruh service_role key di sini. */
import { createClient } from '@supabase/supabase-js';

const url = import.meta.env.VITE_SUPABASE_URL;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const SUPABASE_URL = url || '';
export const supabaseConfigured = Boolean(url && anonKey);

/* Login memakai username; Supabase Auth butuh email, jadi username dipetakan ke email buatan. */
export const AUTH_EMAIL_DOMAIN = import.meta.env.VITE_AUTH_EMAIL_DOMAIN || 'siber-evidence.local';
export const usernameToEmail = (username) => `${username.trim().toLowerCase()}@${AUTH_EMAIL_DOMAIN}`;

/* Zona waktu tampilan (Manado = WITA) */
export const APP_TIMEZONE = import.meta.env.VITE_APP_TIMEZONE || 'Asia/Makassar';

/* "Ingat saya": sesi disimpan di localStorage (bertahan) atau sessionStorage (hilang saat peramban ditutup) */
const REMEMBER_KEY = 'siber_evidence_remember';
export const setRemember = (remember) => {
  try { localStorage.setItem(REMEMBER_KEY, remember ? '1' : '0'); } catch { /* abaikan */ }
};
const sessionStore = {
  getItem: (k) => localStorage.getItem(k) ?? sessionStorage.getItem(k),
  setItem: (k, v) => {
    if (localStorage.getItem(REMEMBER_KEY) === '0') { sessionStorage.setItem(k, v); localStorage.removeItem(k); }
    else { localStorage.setItem(k, v); sessionStorage.removeItem(k); }
  },
  removeItem: (k) => { localStorage.removeItem(k); sessionStorage.removeItem(k); },
};

export const supabase = supabaseConfigured
  ? createClient(url, anonKey, { auth: { storage: sessionStore, persistSession: true, autoRefreshToken: true } })
  : null;

/* Klien sekali pakai tanpa sesi tersimpan: dipakai Administrator untuk mendaftarkan akun baru
   tanpa ikut keluar dari sesinya sendiri. */
export function createSignupClient() {
  return createClient(url, anonKey, { auth: { persistSession: false, autoRefreshToken: false, storageKey: 'siber_evidence_signup' } });
}
