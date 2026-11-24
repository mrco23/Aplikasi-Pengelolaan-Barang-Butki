/* Menjalankan file SQL ke database Supabase lewat koneksi langsung (pengganti salin-tempel di SQL Editor).
   npm run db:apply  → 02_functions, 03_policies, 04_storage   (data TIDAK terhapus)
   npm run db:reset  → 01_schema (HAPUS semua data aplikasi) + 02 + 03 + 04, lalu jalankan npm run seed
   Butuh SUPABASE_DB_URL di supabase/.env (Connect → Connection String → Session pooler). */
import { readFile } from 'node:fs/promises';
import pg from 'pg';

const url = process.env.SUPABASE_DB_URL;
if (!url || /\[YOUR-[A-Z-]*PASSWORD\]/.test(url) || url.includes('<')) {
  console.error('Isi SUPABASE_DB_URL di supabase/.env (Supabase → Connect → Connection String) dan ganti [YOUR-...PASSWORD] dengan password database.');
  process.exit(1);
}

const files = process.argv.includes('--reset')
  ? ['01_schema.sql', '02_functions.sql', '03_policies.sql', '04_storage.sql']
  : ['02_functions.sql', '03_policies.sql', '04_storage.sql'];

const client = new pg.Client({ connectionString: url, ssl: { rejectUnauthorized: false } });
try {
  await client.connect();
  for (const f of files) {
    const sql = await readFile(new URL(f, import.meta.url), 'utf8');
    try {
      await client.query('begin');
      await client.query(sql);
      await client.query('commit');
      console.log(`  ✓ ${f}`);
    } catch (err) {
      await client.query('rollback').catch(() => {});
      console.error(`  ✗ ${f}: ${err.message}${err.where ? `\n    di: ${err.where.split('\n')[0]}` : ''}`);
      process.exitCode = 1;
      break;
    }
  }
  if (!process.exitCode) {
    await client.query("notify pgrst, 'reload schema'"); // agar fungsi baru langsung terbaca API Supabase
    console.log('Selesai. Lanjutkan dengan: npm run seed');
  }
} catch (err) {
  console.error('Tidak dapat terhubung ke database:', err.message);
  if (/ENOTFOUND|ENETUNREACH|EHOSTUNREACH|ETIMEDOUT|timeout/i.test(err.message) && url.includes('@db.')) {
    console.error('→ Jaringan ini kemungkinan tidak mendukung IPv6. Pakai URI "Session pooler" dari Supabase → Connect.');
  } else if (/password authentication failed/i.test(err.message)) {
    console.error('→ Password database salah. Karakter khusus (@ # / : ? %) harus di-encode, atau reset password di Project Settings → Database.');
  } else if (/Tenant or user not found/i.test(err.message)) {
    console.error('→ Untuk Session pooler, username harus postgres.<project-ref>, bukan postgres.');
  }
  process.exitCode = 1;
} finally {
  await client.end().catch(() => {});
}
