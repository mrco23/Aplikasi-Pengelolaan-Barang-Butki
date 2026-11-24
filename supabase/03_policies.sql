-- =====================================================================
-- SIBER EVIDENCE — 3/4 Hak akses tabel (Row Level Security)
-- Prinsip:
--   • Pengunjung tanpa login (anon) tidak bisa membaca atau menulis apa pun.
--   • Pengguna login & berstatus aktif boleh MEMBACA semua data (data terhapus disembunyikan).
--   • Perkara, barang bukti, riwayat, lampiran, pengguna: TIDAK bisa ditulis langsung —
--     hanya lewat fungsi di 02_functions.sql yang memeriksa aturan bisnis & peran.
--   • Master data (kategori, lokasi): ditulis langsung, khusus Administrator.
--   • Akun nonaktif: semua kebijakan menolak, sehingga datanya kosong.
-- =====================================================================

alter table pengguna enable row level security;
alter table kategori enable row level security;
alter table lokasi_penyimpanan enable row level security;
alter table perkara enable row level security;
alter table barang_bukti enable row level security;
alter table riwayat_barang_bukti enable row level security;
alter table lampiran enable row level security;

-- Hak dasar tabel (RLS di bawah tetap menyaring baris)
revoke all on all tables in schema public from anon;
revoke all on all tables in schema public from authenticated;
grant select on all tables in schema public to authenticated;
grant insert, update, delete on kategori, lokasi_penyimpanan to authenticated;
grant usage, select on all sequences in schema public to authenticated;

-- Hapus kebijakan lama agar file ini aman dijalankan ulang
do $$
declare r record;
begin
  for r in select policyname, tablename from pg_policies where schemaname = 'public'
    and tablename in ('pengguna', 'kategori', 'lokasi_penyimpanan', 'perkara', 'barang_bukti', 'riwayat_barang_bukti', 'lampiran')
  loop
    execute format('drop policy %I on public.%I', r.policyname, r.tablename);
  end loop;
end $$;

-- ---------- baca ----------
create policy pengguna_baca on pengguna for select to authenticated using (is_active());
create policy kategori_baca on kategori for select to authenticated using (is_active());
create policy lokasi_baca on lokasi_penyimpanan for select to authenticated using (is_active());
create policy perkara_baca on perkara for select to authenticated using (is_active() and deleted_at is null);
create policy barang_baca on barang_bukti for select to authenticated using (is_active() and deleted_at is null);
create policy riwayat_baca on riwayat_barang_bukti for select to authenticated using (is_active());
create policy lampiran_baca on lampiran for select to authenticated using (is_active());

-- ---------- master data: khusus Administrator ----------
create policy kategori_tambah on kategori for insert to authenticated with check (is_admin());
create policy kategori_ubah on kategori for update to authenticated using (is_admin()) with check (is_admin());
create policy kategori_hapus on kategori for delete to authenticated using (is_admin());
create policy lokasi_tambah on lokasi_penyimpanan for insert to authenticated with check (is_admin());
create policy lokasi_ubah on lokasi_penyimpanan for update to authenticated using (is_admin()) with check (is_admin());
create policy lokasi_hapus on lokasi_penyimpanan for delete to authenticated using (is_admin());
