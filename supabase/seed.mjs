/* Mengisi proyek Supabase dengan data contoh dari fe/src/data/*.json.
   Dijalankan SEKALI dari laptop (bukan bagian aplikasi):  cd supabase && npm install && npm run seed
   1. Membuat/menyamakan akun Supabase Auth untuk setiap pengguna (email = username@<AUTH_EMAIL_DOMAIN>, sandi dari JSON).
   2. Memanggil fungsi seed_muat(): mengosongkan semua tabel aplikasi lalu mengisinya.
   Butuh SUPABASE_SERVICE_ROLE_KEY di supabase/.env — kunci ini JANGAN pernah dipakai di frontend. */
import { readFile } from 'node:fs/promises';
import { createClient } from '@supabase/supabase-js';

const { SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY } = process.env;
const DOMAIN = process.env.AUTH_EMAIL_DOMAIN || 'siber-evidence.local';
if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('Isi SUPABASE_URL dan SUPABASE_SERVICE_ROLE_KEY di supabase/.env (lihat .env.example).');
  process.exit(1);
}

const admin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, { auth: { persistSession: false, autoRefreshToken: false } });
const dataDir = new URL('../fe/src/data/', import.meta.url);
const load = async (name) => JSON.parse(await readFile(new URL(`${name}.json`, dataDir), 'utf8'));

/* Semua akun Auth yang sudah ada, dipetakan per email */
async function listAuthUsers() {
  const byEmail = new Map();
  for (let page = 1; ; page++) {
    const { data, error } = await admin.auth.admin.listUsers({ page, perPage: 1000 });
    if (error) throw error;
    data.users.forEach((u) => byEmail.set(u.email?.toLowerCase(), u));
    if (data.users.length < 1000) return byEmail;
  }
}

try {
  const pengguna = await load('pengguna');
  const existing = await listAuthUsers();

  console.log('Akun Supabase Auth:');
  for (const u of pengguna) {
    const email = `${u.username}@${DOMAIN}`;
    const found = existing.get(email);
    let authUser;
    if (found) {
      const { data, error } = await admin.auth.admin.updateUserById(found.id, { password: u.password, email_confirm: true });
      if (error) throw new Error(`${email}: ${error.message}`);
      authUser = data.user;
      console.log(`  ✓ ${email} (sudah ada, kata sandi disetel ulang)`);
    } else {
      const { data, error } = await admin.auth.admin.createUser({ email, password: u.password, email_confirm: true });
      if (error) throw new Error(`${email}: ${error.message}`);
      authUser = data.user;
      console.log(`  + ${email}`);
    }
    u.auth_id = authUser.id;
    delete u.password; // kata sandi hanya disimpan di Supabase Auth
  }

  const payload = {
    pengguna,
    kategori: await load('kategori'),
    lokasi_penyimpanan: await load('lokasi_penyimpanan'),
    perkara: await load('perkara'),
    barang_bukti: await load('barang_bukti'),
    riwayat_barang_bukti: await load('riwayat_barang_bukti'),
    lampiran: await load('lampiran'),
  };
  const { data, error } = await admin.rpc('seed_muat', { p: payload });
  if (error) throw new Error(`seed_muat: ${error.message}`);

  console.log('\nTabel aplikasi:');
  Object.entries(data).forEach(([t, n]) => console.log(`  ${t.padEnd(22)} ${n} baris`));
  console.log('\nSelesai. Login dengan username (cth. d.kusuma) dan kata sandi: demo123');
  console.log('Catatan: berkas lampiran contoh hanya metadata — berkas aslinya tidak ada di Storage.');
} catch (err) {
  console.error('\nGagal memuat data contoh:', err.message);
  process.exitCode = 1;
}
