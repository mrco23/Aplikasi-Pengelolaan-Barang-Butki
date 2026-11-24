-- =====================================================================
-- SIBER EVIDENCE — 4/4 Storage untuk berkas lampiran
-- Membuat bucket privat "lampiran" (maks. 10 MB, PDF/JPG/PNG/DOC/DOCX) beserta aturannya:
--   • pengguna aktif boleh mengunggah & mengunduh (lewat tautan sementara),
--   • hanya Administrator yang boleh menghapus berkas.
-- =====================================================================

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('lampiran', 'lampiran', false, 10485760, array[
  'application/pdf', 'image/jpeg', 'image/png', 'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
])
on conflict (id) do update set public = false, file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "lampiran_baca" on storage.objects;
drop policy if exists "lampiran_unggah" on storage.objects;
drop policy if exists "lampiran_hapus" on storage.objects;

create policy "lampiran_baca" on storage.objects for select to authenticated
  using (bucket_id = 'lampiran' and public.is_active());

create policy "lampiran_unggah" on storage.objects for insert to authenticated
  with check (bucket_id = 'lampiran' and public.is_active() and name like 'barang/%');

create policy "lampiran_hapus" on storage.objects for delete to authenticated
  using (bucket_id = 'lampiran' and public.is_admin());
