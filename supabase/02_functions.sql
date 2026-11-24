-- =====================================================================
-- SIBER EVIDENCE — 2/4 Fungsi (aturan bisnis)
-- Semua perubahan data perkara, barang bukti, riwayat, lampiran, dan pengguna dilakukan lewat fungsi ini
-- (dipanggil frontend dengan supabase.rpc). Fungsi berjalan sebagai pemilik tabel (security definer),
-- jadi setiap fungsi WAJIB memeriksa hak akses pemanggil di awal.
-- Galat dikirim sebagai pesan berbahasa Indonesia; HINT berisi nama kolom yang salah (dipakai form).
-- Zona waktu fungsi: WITA (Asia/Makassar) — "hari ini" dan input tanggal/waktu mengikuti waktu Manado.
-- =====================================================================

-- ---------------------------------------------------------------------
-- Identitas & hak akses pemanggil
-- ---------------------------------------------------------------------
create or replace function current_pengguna_id() returns bigint
language sql stable security definer set search_path = public as $$
  select id from pengguna where auth_id = auth.uid() and status = 'aktif'
$$;

create or replace function is_active() returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from pengguna where auth_id = auth.uid() and status = 'aktif')
$$;

create or replace function is_admin() returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from pengguna where auth_id = auth.uid() and status = 'aktif' and role = 'administrator')
$$;

create or replace function wajib_aktif() returns bigint
language plpgsql stable security definer set search_path = public as $$
declare v bigint := current_pengguna_id();
begin
  if v is null then
    raise exception 'Akun tidak aktif atau sesi berakhir. Silakan masuk kembali.' using errcode = '42501';
  end if;
  return v;
end $$;

create or replace function wajib_admin() returns bigint
language plpgsql stable security definer set search_path = public as $$
declare v bigint := wajib_aktif();
begin
  if not is_admin() then
    raise exception 'Hanya Administrator yang dapat melakukan tindakan ini.' using errcode = '42501';
  end if;
  return v;
end $$;

create or replace function assert_petugas_aktif(p_id bigint, p_field text) returns void
language plpgsql stable security definer set search_path = public as $$
begin
  if p_id is null or not exists (select 1 from pengguna where id = p_id and status = 'aktif' and role = 'petugas') then
    raise exception 'Pilih petugas yang aktif.' using hint = p_field;
  end if;
end $$;

-- Teks wajib: dipangkas, tidak boleh kosong, panjang maksimal
create or replace function teks_wajib(p_val text, p_label text, p_field text, p_max int default 255) returns text
language plpgsql immutable as $$
declare v text := btrim(coalesce(p_val, ''));
begin
  if v = '' then raise exception '% wajib diisi.', p_label using hint = p_field; end if;
  if length(v) > p_max then raise exception '% maksimal % karakter.', p_label, p_max using hint = p_field; end if;
  return v;
end $$;

-- ---------------------------------------------------------------------
-- Sesi
-- ---------------------------------------------------------------------
/* Profil pengguna yang sedang login. Dipanggil saat aplikasi dibuka. */
create or replace function profil_saya() returns pengguna
language plpgsql security definer set search_path = public as $$
declare v pengguna;
begin
  select * into v from pengguna where auth_id = auth.uid();
  if not found then raise exception 'Akun belum terdaftar di aplikasi. Hubungi administrator.' using errcode = '42501'; end if;
  if v.status <> 'aktif' then raise exception 'Akun ini berstatus nonaktif. Hubungi administrator.' using errcode = '42501'; end if;
  return v;
end $$;

/* Dipanggil tepat setelah login berhasil: menolak akun nonaktif & mencatat waktu login. */
create or replace function catat_login() returns pengguna
language plpgsql security definer set search_path = public as $$
declare v pengguna := profil_saya();
begin
  update pengguna set terakhir_login = now() where id = v.id returning * into v;
  return v;
end $$;

-- ---------------------------------------------------------------------
-- Perkara
-- ---------------------------------------------------------------------
/* Tambah (p_id null) atau ubah perkara */
create or replace function simpan_perkara(p_id bigint, p jsonb) returns perkara
language plpgsql security definer set search_path = public set timezone = 'Asia/Makassar' as $$
declare
  uid bigint := wajib_aktif();
  lp text := teks_wajib(p->>'nomor_lp', 'Nomor LP', 'nomor_lp', 60);
  v_uraian text := teks_wajib(p->>'uraian', 'Uraian singkat perkara', 'uraian', 5000);
  tgl date := nullif(p->>'tanggal_laporan', '')::date;
  penyidik bigint := nullif(p->>'penyidik_id', '')::bigint;
  old perkara;
  v perkara;
begin
  if tgl is null then raise exception 'Tanggal laporan wajib diisi.' using hint = 'tanggal_laporan'; end if;
  if tgl > current_date then raise exception 'Tanggal laporan tidak boleh melewati hari ini.' using hint = 'tanggal_laporan'; end if;
  if coalesce(p->>'tahap', '') not in ('lidik', 'sidik') then raise exception 'Pilih tahap penanganan.' using hint = 'tahap'; end if;

  if p_id is not null then
    select * into old from perkara where id = p_id and deleted_at is null for update;
    if not found then raise exception 'Perkara tidak ditemukan.'; end if;
  end if;
  /* Penyidik lama yang kini nonaktif tetap boleh dipertahankan saat edit */
  if p_id is null or old.penyidik_id is distinct from penyidik then
    perform assert_petugas_aktif(penyidik, 'penyidik_id');
  end if;
  if exists (select 1 from perkara where lower(nomor_lp) = lower(lp) and deleted_at is null and id <> coalesce(p_id, 0)) then
    raise exception 'Nomor LP sudah terdaftar.' using hint = 'nomor_lp';
  end if;

  if p_id is null then
    insert into perkara (nomor_lp, tanggal_laporan, uraian, tahap, penyidik_id, created_by)
    values (lp, tgl, v_uraian, (p->>'tahap')::tahap_perkara, penyidik, uid) returning * into v;
  else
    update perkara set nomor_lp = lp, tanggal_laporan = tgl, uraian = v_uraian,
      tahap = (p->>'tahap')::tahap_perkara, penyidik_id = penyidik
    where id = p_id returning * into v;
  end if;
  return v;
end $$;

/* Soft delete — Administrator saja, dan hanya jika tidak ada barang bukti aktif */
create or replace function hapus_perkara(p_id bigint) returns void
language plpgsql security definer set search_path = public as $$
declare n int;
begin
  perform wajib_admin();
  select count(*) into n from barang_bukti where perkara_id = p_id and deleted_at is null;
  if n > 0 then raise exception 'Tidak dapat dihapus: masih terdapat % barang bukti terkait perkara ini.', n; end if;
  update perkara set deleted_at = now() where id = p_id and deleted_at is null;
  if not found then raise exception 'Perkara tidak ditemukan.'; end if;
end $$;

-- ---------------------------------------------------------------------
-- Barang bukti
-- ---------------------------------------------------------------------
/* Kode otomatis BB-<tahun>-<urut 4 digit>; barang yang dihapus ikut dihitung agar kode tidak dipakai ulang */
create or replace function next_kode_bb() returns text
language plpgsql stable security definer set search_path = public set timezone = 'Asia/Makassar' as $$
declare yr int := extract(year from current_date); mx int;
begin
  perform wajib_aktif();
  select coalesce(max(substring(kode from '^BB-\d{4}-(\d+)$')::int), 0) into mx
    from barang_bukti where kode like 'BB-' || yr || '-%';
  return format('BB-%s-%s', yr, lpad((mx + 1)::text, 4, '0'));
end $$;

/* Riwayat Penerimaan otomatis: dari "Penyerahan Penyidik" (lokasi_asal null) ke lokasi simpan */
create or replace function _catat_penerimaan(b barang_bukti, p_alasan text, p_uid bigint) returns void
language plpgsql security definer set search_path = public set timezone = 'Asia/Makassar' as $$
begin
  insert into riwayat_barang_bukti (barang_bukti_id, jenis, tanggal_waktu, lokasi_asal_id, lokasi_tujuan_id, petugas_id, alasan, catatan, dicatat_oleh)
  values (b.id, 'penerimaan', (b.tanggal_penerimaan + localtime(0))::timestamptz, null, b.lokasi_id, b.petugas_penerima_id, p_alasan, b.catatan, p_uid);
end $$;

/* Tambah (p_id null) atau ubah barang bukti.
   Tambah bukan draf → riwayat Penerimaan. Ubah: draf→terdaftar → Penerimaan; lokasi berubah → Perpindahan;
   status berubah → Pemeriksaan (semua otomatis, dalam transaksi yang sama). */
create or replace function simpan_barang(p_id bigint, p jsonb) returns barang_bukti
language plpgsql security definer set search_path = public set timezone = 'Asia/Makassar' as $$
declare
  uid bigint := wajib_aktif();
  kd text := btrim(coalesce(p->>'kode', ''));
  nm text := teks_wajib(p->>'nama', 'Nama barang bukti', 'nama', 150);
  kat bigint := nullif(p->>'kategori_id', '')::bigint;
  pk bigint := nullif(p->>'perkara_id', '')::bigint;
  tgl date := nullif(p->>'tanggal_penerimaan', '')::date;
  penerima bigint := nullif(p->>'petugas_penerima_id', '')::bigint;
  lok bigint := nullif(p->>'lokasi_id', '')::bigint;
  st text := coalesce(nullif(p->>'status', ''), 'tersedia');
  draf boolean := coalesce((p->>'is_draf')::boolean, false);
  tgl_lapor date;
  jenis_lok jenis_lokasi;
  old barang_bukti;
  v barang_bukti;
begin
  if kd !~ '^BB-\d{4}-\d{4,}$' then raise exception 'Format kode: BB-tahun-nomor urut, cth. BB-2026-0015.' using hint = 'kode'; end if;
  if coalesce(p->>'kondisi', '') not in ('baik', 'rusak_ringan', 'rusak_berat') then raise exception 'Pilih kondisi fisik.' using hint = 'kondisi'; end if;
  if kat is null or not exists (select 1 from kategori where id = kat) then raise exception 'Pilih kategori.' using hint = 'kategori_id'; end if;
  select tanggal_laporan into tgl_lapor from perkara where id = pk and deleted_at is null;
  if not found then raise exception 'Pilih nomor perkara (LP) terkait.' using hint = 'perkara_id'; end if;
  if tgl is null then raise exception 'Tanggal penerimaan wajib diisi.' using hint = 'tanggal_penerimaan'; end if;
  if tgl > current_date then raise exception 'Tanggal penerimaan tidak boleh melewati hari ini.' using hint = 'tanggal_penerimaan'; end if;
  if tgl < tgl_lapor then raise exception 'Tanggal penerimaan tidak boleh sebelum tanggal laporan perkara.' using hint = 'tanggal_penerimaan'; end if;
  select jenis into jenis_lok from lokasi_penyimpanan where id = lok;
  if not found then raise exception 'Lokasi penyimpanan wajib dipilih.' using hint = 'lokasi_id'; end if;
  if jenis_lok = 'pemusnahan' then raise exception 'Pemusnahan dicatat melalui kejadian Pengalihan, bukan formulir.' using hint = 'lokasi_id'; end if;
  if exists (select 1 from barang_bukti where lower(kode) = lower(kd) and id <> coalesce(p_id, 0)) then
    raise exception 'Kode sudah digunakan oleh barang bukti lain.' using hint = 'kode';
  end if;

  if p_id is null then
    if st not in ('tersedia', 'dalam_pemeriksaan') then raise exception 'Status awal hanya Tersedia atau Dalam Pemeriksaan.' using hint = 'status'; end if;
    perform assert_petugas_aktif(penerima, 'petugas_penerima_id');
    insert into barang_bukti (kode, nama, kategori_id, deskripsi, nomor_seri, kondisi, perkara_id, tanggal_penerimaan,
      petugas_penerima_id, lokasi_id, status, catatan, is_draf, created_by)
    values (kd, nm, kat, btrim(coalesce(p->>'deskripsi', '')), btrim(coalesce(p->>'nomor_seri', '')), (p->>'kondisi')::kondisi_barang,
      pk, tgl, penerima, lok, st::status_barang, btrim(coalesce(p->>'catatan', '')), draf, uid)
    returning * into v;
    if not v.is_draf then perform _catat_penerimaan(v, 'Penerimaan awal barang bukti', uid); end if;
    return v;
  end if;

  select * into old from barang_bukti where id = p_id and deleted_at is null for update;
  if not found then raise exception 'Barang bukti tidak ditemukan.'; end if;
  if old.status = 'dihancurkan' then raise exception 'Barang bukti yang sudah dimusnahkan tidak dapat diubah.'; end if;
  if not old.is_draf and draf then raise exception 'Barang yang sudah terdaftar tidak dapat dikembalikan menjadi draf.' using hint = 'is_draf'; end if;
  if old.status = 'dipinjam' and st <> 'dipinjam' then raise exception 'Barang sedang dipinjam — ubah status melalui pencatatan Pengembalian.' using hint = 'status'; end if;
  if old.status <> 'dipinjam' and st not in ('tersedia', 'dalam_pemeriksaan') then raise exception 'Status hanya Tersedia atau Dalam Pemeriksaan.' using hint = 'status'; end if;
  if old.petugas_penerima_id is distinct from penerima then perform assert_petugas_aktif(penerima, 'petugas_penerima_id'); end if;

  update barang_bukti set kode = kd, nama = nm, kategori_id = kat, deskripsi = btrim(coalesce(p->>'deskripsi', '')),
    nomor_seri = btrim(coalesce(p->>'nomor_seri', '')), kondisi = (p->>'kondisi')::kondisi_barang, perkara_id = pk,
    tanggal_penerimaan = tgl, petugas_penerima_id = penerima, lokasi_id = lok, status = st::status_barang,
    catatan = btrim(coalesce(p->>'catatan', '')), is_draf = draf
  where id = p_id returning * into v;

  if not v.is_draf then
    if old.is_draf then
      perform _catat_penerimaan(v, 'Pendaftaran barang bukti dari draf', uid);
    elsif old.lokasi_id <> v.lokasi_id then
      insert into riwayat_barang_bukti (barang_bukti_id, jenis, tanggal_waktu, lokasi_asal_id, lokasi_tujuan_id, petugas_id, alasan, catatan, dicatat_oleh)
      values (v.id, 'perpindahan', now(), old.lokasi_id, v.lokasi_id, uid, 'Penyesuaian lokasi melalui formulir edit', 'Dicatat otomatis oleh sistem.', uid);
    elsif old.status <> v.status then
      insert into riwayat_barang_bukti (barang_bukti_id, jenis, tanggal_waktu, lokasi_asal_id, lokasi_tujuan_id, petugas_id, alasan, catatan, dicatat_oleh)
      values (v.id, 'pemeriksaan', now(), v.lokasi_id, v.lokasi_id, uid, 'Pembaruan status melalui formulir edit', 'Dicatat otomatis oleh sistem.', uid);
    end if;
  end if;
  return v;
end $$;

/* Soft delete — Administrator saja. Riwayat & lampiran tetap tersimpan (chain of custody). */
create or replace function hapus_barang(p_id bigint) returns void
language plpgsql security definer set search_path = public as $$
begin
  perform wajib_admin();
  update barang_bukti set deleted_at = now() where id = p_id and deleted_at is null;
  if not found then raise exception 'Barang bukti tidak ditemukan.'; end if;
end $$;

-- ---------------------------------------------------------------------
-- Riwayat / chain of custody
-- ---------------------------------------------------------------------
/* Catat kejadian baru + perbarui status & lokasi barang dalam satu transaksi.
   Lokasi asal selalu lokasi barang saat ini (tidak diambil dari input). */
create or replace function catat_kejadian(p jsonb) returns riwayat_barang_bukti
language plpgsql security definer set search_path = public set timezone = 'Asia/Makassar' as $$
declare
  uid bigint := wajib_aktif();
  bid bigint := nullif(p->>'barang_bukti_id', '')::bigint;
  jns text := coalesce(p->>'jenis', '');
  waktu timestamptz;
  tujuan bigint := nullif(p->>'lokasi_tujuan_id', '')::bigint;
  petugas bigint := nullif(p->>'petugas_id', '')::bigint;
  alasan text := teks_wajib(p->>'alasan', 'Alasan/keperluan', 'alasan');
  harapan date := nullif(p->>'tanggal_harapan_kembali', '')::date;
  jenis_tujuan jenis_lokasi;
  b barang_bukti;
  st status_barang;
  v riwayat_barang_bukti;
begin
  if jns not in ('perpindahan', 'peminjaman', 'pengembalian', 'pemeriksaan', 'pengalihan') then
    raise exception 'Pilih jenis kejadian.' using hint = 'jenis';
  end if;
  waktu := nullif(p->>'tanggal_waktu', '')::timestamp;  -- teks tanpa zona → ditafsirkan WITA
  if waktu is null then raise exception 'Tanggal dan waktu wajib diisi.' using hint = 'tanggal_waktu'; end if;

  select * into b from barang_bukti where id = bid and deleted_at is null for update;
  if not found then raise exception 'Pilih barang bukti.' using hint = 'barang_bukti_id'; end if;
  if b.is_draf then raise exception 'Barang bukti masih draf. Daftarkan terlebih dahulu.' using hint = 'barang_bukti_id'; end if;
  if b.status = 'dihancurkan' then raise exception 'Barang bukti sudah dimusnahkan.' using hint = 'barang_bukti_id'; end if;

  select jenis into jenis_tujuan from lokasi_penyimpanan where id = tujuan;
  if not found then raise exception 'Lokasi tujuan wajib dipilih.' using hint = 'lokasi_tujuan_id'; end if;
  perform assert_petugas_aktif(petugas, 'petugas_id');
  if jenis_tujuan = 'pemusnahan' and jns <> 'pengalihan' then raise exception 'Lokasi pemusnahan hanya untuk kejadian Pengalihan.' using hint = 'lokasi_tujuan_id'; end if;
  if jns = 'perpindahan' and tujuan = b.lokasi_id then raise exception 'Lokasi tujuan sama dengan lokasi asal.' using hint = 'lokasi_tujuan_id'; end if;

  st := b.status;
  if jns = 'peminjaman' then
    if b.status = 'dipinjam' then raise exception 'Barang ini masih berstatus Dipinjam. Catat Pengembalian terlebih dahulu.' using hint = 'jenis'; end if;
    if harapan is null then raise exception 'Tanggal harapan kembali wajib diisi untuk peminjaman.' using hint = 'tanggal_harapan_kembali'; end if;
    if harapan < waktu::date then raise exception 'Tanggal kembali tidak boleh sebelum tanggal kejadian.' using hint = 'tanggal_harapan_kembali'; end if;
    st := 'dipinjam';
  elsif jns = 'pengembalian' then
    if b.status <> 'dipinjam' then raise exception 'Barang ini tidak sedang dipinjam.' using hint = 'jenis'; end if;
    st := 'tersedia';
    update riwayat_barang_bukti set status_kembali = 'sudah_kembali'
     where id = (select id from riwayat_barang_bukti
                  where barang_bukti_id = b.id and jenis = 'peminjaman' and status_kembali = 'belum_kembali'
                  order by tanggal_waktu desc, id desc limit 1);
  elsif jns = 'pengalihan' and jenis_tujuan = 'pemusnahan' then
    st := 'dihancurkan';
  end if;

  insert into riwayat_barang_bukti (barang_bukti_id, jenis, tanggal_waktu, lokasi_asal_id, lokasi_tujuan_id, petugas_id,
    alasan, catatan, tanggal_harapan_kembali, status_kembali, dicatat_oleh)
  values (b.id, jns::jenis_riwayat, waktu, b.lokasi_id, tujuan, petugas, alasan, btrim(coalesce(p->>'catatan', '')),
    case when jns = 'peminjaman' then harapan end,
    case when jns = 'peminjaman' then 'belum_kembali'::status_kembali end, uid)
  returning * into v;

  update barang_bukti set status = st, lokasi_id = tujuan where id = b.id;
  return v;
end $$;

-- ---------------------------------------------------------------------
-- Lampiran (berkas diunggah frontend ke Storage bucket "lampiran", metadata dicatat di sini)
-- ---------------------------------------------------------------------
create or replace function simpan_lampiran(p_barang_id bigint, p_nama_file text, p_tipe_mime text, p_ukuran int, p_path text)
returns lampiran
language plpgsql security definer set search_path = public as $$
declare uid bigint := wajib_aktif(); v lampiran;
begin
  if not exists (select 1 from barang_bukti where id = p_barang_id and deleted_at is null) then raise exception 'Barang bukti tidak ditemukan.'; end if;
  if p_path is null or p_path not like 'barang/' || p_barang_id || '/%' then raise exception 'Lokasi berkas tidak valid.'; end if;
  if p_tipe_mime not in ('application/pdf', 'image/jpeg', 'image/png', 'application/msword',
                         'application/vnd.openxmlformats-officedocument.wordprocessingml.document') then
    raise exception 'Jenis berkas tidak didukung. Gunakan PDF, JPG, PNG, atau DOC/DOCX.' using hint = 'file';
  end if;
  if p_ukuran is null or p_ukuran > 10485760 then raise exception 'Berkas melebihi 10 MB.' using hint = 'file'; end if;
  insert into lampiran (barang_bukti_id, nama_file, tipe_mime, ukuran_byte, path, diunggah_oleh)
  values (p_barang_id, teks_wajib(p_nama_file, 'Nama berkas', 'file'), p_tipe_mime, p_ukuran, p_path, uid)
  returning * into v;
  return v;
end $$;

/* Hapus metadata lampiran (Administrator). Mengembalikan path agar frontend menghapus berkas di Storage. */
create or replace function hapus_lampiran(p_id bigint) returns text
language plpgsql security definer set search_path = public as $$
declare v_path text;
begin
  perform wajib_admin();
  delete from lampiran where id = p_id returning path into v_path;
  if v_path is null then raise exception 'Lampiran tidak ditemukan.'; end if;
  return v_path;
end $$;

-- ---------------------------------------------------------------------
-- Manajemen pengguna (Administrator). Akun tidak dihapus — cukup dinonaktifkan.
-- Akun login (Supabase Auth) dibuat frontend dengan signUp, lalu profilnya didaftarkan lewat buat_pengguna.
-- ---------------------------------------------------------------------
create or replace function cek_username(p_username text) returns boolean
language plpgsql stable security definer set search_path = public as $$
begin
  perform wajib_admin();
  return not exists (select 1 from pengguna where username = lower(btrim(p_username)));
end $$;

create or replace function _validasi_profil(p jsonb) returns void
language plpgsql immutable as $$
begin
  perform teks_wajib(p->>'nama', 'Nama lengkap', 'nama', 100);
  perform teks_wajib(p->>'jabatan', 'Jabatan', 'jabatan', 100);
  if coalesce(p->>'nrp', '') <> '' and (p->>'nrp') !~ '^\d{8}$' then raise exception 'NRP terdiri dari 8 digit angka.' using hint = 'nrp'; end if;
  if coalesce(p->>'role', '') not in ('administrator', 'petugas') then raise exception 'Pilih peran.' using hint = 'role'; end if;
  if coalesce(p->>'status', '') not in ('aktif', 'nonaktif') then raise exception 'Pilih status.' using hint = 'status'; end if;
end $$;

create or replace function _pesan_unik(p_constraint text) returns void
language plpgsql as $$
begin
  if p_constraint like '%username%' then raise exception 'Nama pengguna sudah digunakan.' using hint = 'username'; end if;
  if p_constraint like '%nrp%' then raise exception 'NRP sudah terdaftar.' using hint = 'nrp'; end if;
  if p_constraint like '%auth_id%' then raise exception 'Akun login ini sudah terhubung ke pengguna lain.'; end if;
  raise exception 'Data sudah ada.';
end $$;

create or replace function _sisa_admin() returns void
language plpgsql security definer set search_path = public as $$
begin
  if not exists (select 1 from pengguna where role = 'administrator' and status = 'aktif') then
    raise exception 'Harus tersisa minimal satu Administrator aktif.' using hint = 'role';
  end if;
end $$;

create or replace function buat_pengguna(p_auth_id uuid, p jsonb) returns pengguna
language plpgsql security definer set search_path = public as $$
declare v pengguna; c text;
begin
  perform wajib_admin();
  perform _validasi_profil(p);
  if coalesce(p->>'username', '') !~ '^[A-Za-z0-9._]{3,30}$' then raise exception '3–30 karakter: huruf, angka, titik, atau garis bawah.' using hint = 'username'; end if;
  if p_auth_id is null then raise exception 'Akun login belum dibuat.'; end if;
  begin
    insert into pengguna (auth_id, username, nama, pangkat, nrp, jabatan, role, status)
    values (p_auth_id, lower(p->>'username'), btrim(p->>'nama'), nullif(btrim(coalesce(p->>'pangkat', '')), ''), nullif(p->>'nrp', ''),
      btrim(p->>'jabatan'), (p->>'role')::role_pengguna, (p->>'status')::status_akun)
    returning * into v;
  exception when unique_violation then
    get stacked diagnostics c = constraint_name;
    perform _pesan_unik(c);
  end;
  return v;
end $$;

create or replace function ubah_pengguna(p_id bigint, p jsonb) returns pengguna
language plpgsql security definer set search_path = public as $$
declare me bigint := wajib_admin(); v pengguna; c text;
begin
  perform _validasi_profil(p);
  if p_id = me and p->>'status' = 'nonaktif' then raise exception 'Anda tidak dapat menonaktifkan akun yang sedang digunakan.' using hint = 'status'; end if;
  begin
    update pengguna set nama = btrim(p->>'nama'), pangkat = nullif(btrim(coalesce(p->>'pangkat', '')), ''), nrp = nullif(p->>'nrp', ''),
      jabatan = btrim(p->>'jabatan'), role = (p->>'role')::role_pengguna, status = (p->>'status')::status_akun
    where id = p_id returning * into v;
  exception when unique_violation then
    get stacked diagnostics c = constraint_name;
    perform _pesan_unik(c);
  end;
  if v.id is null then raise exception 'Pengguna tidak ditemukan.'; end if;
  perform _sisa_admin();
  return v;
end $$;

create or replace function ubah_status_pengguna(p_id bigint, p_status text) returns pengguna
language plpgsql security definer set search_path = public as $$
declare me bigint := wajib_admin(); v pengguna;
begin
  if p_status not in ('aktif', 'nonaktif') then raise exception 'Status tidak valid.'; end if;
  if p_id = me and p_status = 'nonaktif' then raise exception 'Anda tidak dapat menonaktifkan akun yang sedang digunakan.'; end if;
  update pengguna set status = p_status::status_akun where id = p_id returning * into v;
  if v.id is null then raise exception 'Pengguna tidak ditemukan.'; end if;
  perform _sisa_admin();
  return v;
end $$;

/* Atur ulang kata sandi akun lain langsung di Supabase Auth (hash bcrypt) */
create or replace function reset_password_pengguna(p_id bigint, p_password text) returns void
language plpgsql security definer set search_path = public, extensions as $$
declare aid uuid;
begin
  perform wajib_admin();
  if length(coalesce(p_password, '')) < 6 then raise exception 'Kata sandi minimal 6 karakter.' using hint = 'password'; end if;
  select auth_id into aid from pengguna where id = p_id;
  if aid is null then raise exception 'Pengguna tidak ditemukan atau belum punya akun login.'; end if;
  update auth.users set encrypted_password = extensions.crypt(p_password, extensions.gen_salt('bf')), updated_at = now() where id = aid;
end $$;

-- ---------------------------------------------------------------------
-- Khusus script seed (hanya service_role): kosongkan tabel lalu isi dari JSON
-- ---------------------------------------------------------------------
create or replace function seed_muat(p jsonb) returns jsonb
language plpgsql security definer set search_path = public set timezone = 'Asia/Makassar' as $$
declare t text; n jsonb; hasil jsonb := '{}';
begin
  truncate lampiran, riwayat_barang_bukti, barang_bukti, perkara, lokasi_penyimpanan, kategori, pengguna restart identity cascade;
  insert into pengguna select * from jsonb_populate_recordset(null::pengguna, p->'pengguna');
  insert into kategori select * from jsonb_populate_recordset(null::kategori, p->'kategori');
  insert into lokasi_penyimpanan select * from jsonb_populate_recordset(null::lokasi_penyimpanan, p->'lokasi_penyimpanan');
  insert into perkara select * from jsonb_populate_recordset(null::perkara, p->'perkara');
  insert into barang_bukti select * from jsonb_populate_recordset(null::barang_bukti, p->'barang_bukti');
  insert into riwayat_barang_bukti select * from jsonb_populate_recordset(null::riwayat_barang_bukti, p->'riwayat_barang_bukti');
  insert into lampiran select * from jsonb_populate_recordset(null::lampiran, p->'lampiran');
  foreach t in array array['pengguna', 'kategori', 'lokasi_penyimpanan', 'perkara', 'barang_bukti', 'riwayat_barang_bukti', 'lampiran'] loop
    execute format('select setval(pg_get_serial_sequence(%L, ''id''), (select coalesce(max(id), 1) from %I))', t, t);
    execute format('select jsonb_build_object(%L, count(*)) from %I', t, t) into strict n;
    hasil := hasil || n;
  end loop;
  return hasil;
end $$;

-- ---------------------------------------------------------------------
-- Hak eksekusi: hanya pengguna login (authenticated). seed_muat hanya service_role.
-- ---------------------------------------------------------------------
revoke execute on all functions in schema public from public;
revoke execute on all functions in schema public from anon;
grant execute on all functions in schema public to authenticated;
revoke execute on function seed_muat(jsonb) from authenticated;
grant execute on function seed_muat(jsonb) to service_role;
-- Fungsi internal (diawali _) hanya dipanggil dari fungsi lain, tidak boleh dipanggil langsung
revoke execute on function _catat_penerimaan(barang_bukti, text, bigint) from authenticated;
revoke execute on function _validasi_profil(jsonb) from authenticated;
revoke execute on function _pesan_unik(text) from authenticated;
revoke execute on function _sisa_admin() from authenticated;
