import React, { useState, useEffect } from 'react';
import { useApp } from '../../../context/AppContext';
import { Icon, Button, Card, Field, Input, Select, Textarea, FormSection, ButtonLink, NotFound } from '../../../components/common/UI';
import { nextKodeBB, KATEGORI, KONDISI, STATUS_BB, LOKASI, todayISO, uid } from '../../../utils/helpers';
import PerkaraFormModal from './PerkaraFormPage';

export default function BarangFormPage({ id, query }) {
  const { data, user, addBarang, updateBarang, toast } = useApp();
  const [perOpen, setPerOpen] = useState(false);
  const isDrafList = query?.get('draf') === '1' && !id;

  const initialLP = query?.get('lp') || '';
  const drafCount = data.barang.filter((b) => b.draf).length;

  const drafList = isDrafList ? (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <ButtonLink to="/barang-bukti/baru" variant="secondary" icon="arrow-left" size="sm">Kembali</ButtonLink>
        <h2 className="text-lg font-bold text-navy-800">Draf Tersimpan ({drafCount})</h2>
      </div>
      {drafCount === 0 ? (
        <Card><p className="py-10 text-center text-sm text-slate-500">Tidak ada draf tersimpan.</p></Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {data.barang.filter((b) => b.draf).map((b) => (
            <Card key={b.id} title={b.kode} desc={'Tersimpan: ' + (b.createdAt || '-').replace('T', ' ')}>
              <p className="truncate text-sm font-semibold text-navy-800">{b.nama || 'Tanpa Nama'}</p>
              <p className="mt-1 truncate text-xs text-slate-500">{b.nomorLP || 'LP Belum diset'}</p>
              <div className="mt-4 flex gap-2">
                <ButtonLink to={'/barang-bukti/' + b.id + '/edit'} size="sm" className="w-full">Lanjutkan Pendaftaran</ButtonLink>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  ) : null;

  const [f, setF] = useState(null);
  const [errs, setErrs] = useState({});
  const [notFnd, setNotFnd] = useState(false);

  useEffect(() => {
    if (isDrafList) return;
    if (id) {
      const b = data.barang.find((x) => x.id === id);
      if (b) setF({ ...b }); else setNotFnd(true);
    } else {
      setF({
        kode: nextKodeBB(data.barang), nama: '', kategori: '', deskripsi: '', nomorSeri: '',
        kondisi: 'Baik', nomorLP: initialLP, tanggalPenerimaan: todayISO(),
        petugasPenerima: user.nama, lokasi: '', status: 'Tersedia', catatan: '', lampiran: [], draf: true,
      });
    }
  }, [id, data.barang, initialLP, user.nama, isDrafList]);

  if (isDrafList) return drafList;
  if (notFnd) return <NotFound message="Data barang bukti tidak ditemukan." />;
  if (!f) return null;

  const set = (k, v) => setF((o) => ({ ...o, [k]: v }));
  const perOpt = data.perkara.map((p) => [p.nomorLP, `${p.nomorLP} — ${p.uraian.substring(0, 30)}…`]);
  const userOpt = data.users.filter((u) => u.status === 'Aktif').map((u) => [u.nama, u.nama]);

  function submit(isDraf) {
    const e = {};
    if (!f.kode.trim()) e.kode = 'Kode wajib diisi.';
    else if (data.barang.some((x) => x.kode.toLowerCase() === f.kode.trim().toLowerCase() && x.id !== f.id)) e.kode = 'Kode sudah digunakan.';

    if (!isDraf) {
      if (!f.nama.trim()) e.nama = 'Nama barang bukti wajib diisi.';
      if (!f.kategori) e.kategori = 'Pilih kategori.';
      if (!f.nomorLP) e.nomorLP = 'Pilih nomor laporan polisi terkait.';
      if (!f.tanggalPenerimaan) e.tanggalPenerimaan = 'Tanggal penerimaan wajib diisi.';
      if (!f.petugasPenerima) e.petugasPenerima = 'Pilih petugas penerima.';
      if (!f.lokasi) e.lokasi = 'Pilih atau ketik lokasi penyimpanan.';
    }
    setErrs(e);
    if (Object.keys(e).length) { toast('error', 'Formulir belum lengkap', 'Periksa kembali isian yang ditandai merah.'); return; }

    const finalF = { ...f, draf: isDraf };
    if (f.id && data.barang.some(x => x.id === f.id)) {
      updateBarang(f.id, finalF);
      toast('success', 'Berhasil disimpan', `Data ${f.kode} berhasil ${isDraf ? 'disimpan sebagai draf' : 'diperbarui'}.`);
      window.location.hash = isDraf ? '#/barang-bukti' : '#/barang-bukti/' + f.id;
    } else {
      const nb = addBarang(finalF);
      toast('success', 'Berhasil didaftarkan', `Data ${f.kode} berhasil ${isDraf ? 'disimpan sebagai draf' : 'didaftarkan'}.`);
      window.location.hash = isDraf ? '#/barang-bukti' : '#/barang-bukti/' + nb.id;
    }
  }

  function handleFile(e) {
    const files = Array.from(e.target.files);
    if (!files.length) return;
    const nl = files.map((file) => ({ id: uid('lm'), nama: file.name, tipe: file.type || 'unknown', ukuran: file.size }));
    set('lampiran', [...f.lampiran, ...nl]);
    toast('info', 'File dilampirkan', 'Pada versi demo, file hanya dicatat namanya (tidak diunggah sungguhan).');
    e.target.value = '';
  }
  function remFile(id) { set('lampiran', f.lampiran.filter((x) => x.id !== id)); }

  return (
    <div className="space-y-6 pb-24">
      <div className="flex items-center gap-3">
        <ButtonLink to={id && !f.draf ? `/barang-bukti/${id}` : '/barang-bukti'} variant="secondary" icon="arrow-left" size="sm">Batal</ButtonLink>
        <h2 className="text-xl font-bold text-navy-800">
          {id ? (f.draf ? 'Lanjutkan Pendaftaran' : 'Edit Barang Bukti') : 'Daftarkan Barang Bukti Baru'}
        </h2>
      </div>

      <div className="space-y-5">
        <FormSection icon="box" title="Identifikasi Barang" desc="Informasi fisik dan pengenal unik barang bukti.">
          <Field label="Kode Barang Bukti" required error={errs.kode} hint="Sistem menghasilkan kode otomatis. Dapat disesuaikan.">
            <Input value={f.kode} error={errs.kode} onChange={(e) => set('kode', e.target.value)} />
          </Field>
          <Field label="Nama / Merek Barang" required={!f.draf} error={errs.nama} hint="Contoh: Laptop Merk A Warna Hitam">
            <Input value={f.nama} error={errs.nama} onChange={(e) => set('nama', e.target.value)} />
          </Field>
          <Field label="Kategori" required={!f.draf} error={errs.kategori}>
            <Select value={f.kategori} error={errs.kategori} onChange={(e) => set('kategori', e.target.value)} options={KATEGORI.map(x => [x, x])} placeholder="Pilih kategori…" />
          </Field>
          <Field label="Nomor Seri / IMEI (Opsional)">
            <Input value={f.nomorSeri} onChange={(e) => set('nomorSeri', e.target.value)} placeholder="Biarkan kosong jika tidak ada" />
          </Field>
          <Field label="Kondisi Fisik" required>
            <Select value={f.kondisi} onChange={(e) => set('kondisi', e.target.value)} options={KONDISI.map(x => [x, x])} />
          </Field>
          <Field label="Deskripsi / Ciri Khusus" className="sm:col-span-2">
            <Textarea value={f.deskripsi} onChange={(e) => set('deskripsi', e.target.value)} placeholder="Tuliskan warna, cacat fisik, kelengkapan pendukung…" />
          </Field>
        </FormSection>

        <FormSection icon="folder-open" title="Tautan Perkara & Penerimaan" desc="Keterkaitan dengan Laporan Polisi dan waktu penerimaan.">
          <Field label="Terkait Laporan Polisi (LP)" required={!f.draf} error={errs.nomorLP} hint={<button type="button" onClick={() => setPerOpen(true)} className="font-semibold text-blue-600 hover:underline">Atau catat perkara baru</button>} className="sm:col-span-2">
            <Select value={f.nomorLP} error={errs.nomorLP} onChange={(e) => set('nomorLP', e.target.value)} options={perOpt} placeholder="Pilih nomor LP dari data perkara…" />
          </Field>
          <Field label="Tanggal Penerimaan" required={!f.draf} error={errs.tanggalPenerimaan}>
            <Input type="date" value={f.tanggalPenerimaan} error={errs.tanggalPenerimaan} onChange={(e) => set('tanggalPenerimaan', e.target.value)} />
          </Field>
          <Field label="Petugas Penerima" required={!f.draf} error={errs.petugasPenerima}>
            <Select value={f.petugasPenerima} error={errs.petugasPenerima} onChange={(e) => set('petugasPenerima', e.target.value)} options={userOpt} placeholder="Pilih petugas…" />
          </Field>
        </FormSection>

        <FormSection icon="map-pin" title="Penyimpanan Awal" desc="Lokasi rak atau ruang penempatan barang bukti saat ini.">
          <Field label="Lokasi Penyimpanan" required={!f.draf} error={errs.lokasi} hint="Pilih lokasi standar atau ketik lokasi kustom di bawah." className="sm:col-span-2">
            <div className="space-y-2">
              <Select value={LOKASI.includes(f.lokasi) ? f.lokasi : (f.lokasi ? '_custom' : '')}
                onChange={(e) => { const v = e.target.value; if (v !== '_custom') set('lokasi', v); }}
                error={errs.lokasi} options={[...LOKASI.map(x => [x, x]), ['_custom', 'Ketik lokasi lainnya…']]} placeholder="Pilih lokasi penyimpanan…" />
              {(!LOKASI.includes(f.lokasi) && f.lokasi !== '') || LOKASI.includes(f.lokasi) === false ? (
                <Input value={f.lokasi} onChange={(e) => set('lokasi', e.target.value)} placeholder="Ketik lokasi spesifik…" />
              ) : null}
            </div>
          </Field>
          <Field label="Status Penempatan" required>
            <Select value={f.status} onChange={(e) => set('status', e.target.value)} options={STATUS_BB.map(x => [x, x])} />
          </Field>
          <Field label="Catatan Tambahan (Opsional)" className="sm:col-span-2">
            <Textarea value={f.catatan} onChange={(e) => set('catatan', e.target.value)} placeholder="Informasi tambahan terkait penerimaan awal…" />
          </Field>
        </FormSection>

        <Card title="Dokumentasi & Lampiran" desc="Unggah foto atau dokumen serah terima.">
          <div className="space-y-4">
            {f.lampiran.length > 0 && (
              <ul className="grid gap-2 sm:grid-cols-2">
                {f.lampiran.map((l) => (
                  <li key={l.id} className="flex items-center gap-3 rounded-lg border border-slate-200 p-2 text-sm">
                    <span className="grid h-8 w-8 shrink-0 place-items-center rounded bg-slate-100 text-slate-500"><Icon name="file" size={15} /></span>
                    <span className="min-w-0 flex-1"><span className="block truncate font-medium text-slate-700">{l.nama}</span><span className="block text-[10px] text-slate-400">Dimuat secara virtual (demo)</span></span>
                    <IconBtn icon="x" title="Hapus" onClick={() => remFile(l.id)} />
                  </li>
                ))}
              </ul>
            )}
            <label className="flex cursor-pointer items-center justify-center gap-2 rounded-lg border-2 border-dashed border-slate-300 bg-slate-50 py-6 transition hover:border-blue-400 hover:bg-blue-50">
              <Icon name="upload-cloud" size={20} className="text-slate-400" />
              <span className="text-sm font-semibold text-slate-600">Pilih berkas lampiran…</span>
              <input type="file" multiple className="hidden" onChange={handleFile} />
            </label>
          </div>
        </Card>
      </div>

      <div className="fixed bottom-0 left-0 right-0 z-20 border-t border-slate-200 bg-white/90 px-4 py-3 shadow-lg backdrop-blur lg:left-[256px]">
        <div className="mx-auto flex max-w-6xl items-center justify-between">
          <Button variant="ghost" onClick={() => { window.location.hash = '#/barang-bukti'; }}>Batal</Button>
          <div className="flex gap-2">
            {f.draf && <Button variant="secondary" onClick={() => submit(true)}>Simpan sebagai Draf</Button>}
            <Button icon="check" onClick={() => submit(false)}>{f.draf || !id ? 'Daftarkan Barang Bukti' : 'Simpan Perubahan'}</Button>
          </div>
        </div>
      </div>
      <PerkaraFormModal open={perOpen} initial={null} onClose={() => setPerOpen(false)} />
    </div>
  );
}
