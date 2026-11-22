import { useMemo, useState } from 'react';
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { Archive, ArrowLeft, Briefcase, Check, Package, Paperclip, Save, Upload, X } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { KONDISI, STATUS_BB, toOptions } from '../../constants';
import { fmtBytes, todayISO, truncate } from '../../utils/format';
import { kategoriOptions, lokasiOptions, petugasOptions } from '../../utils/selectors';
import { Alert, Button, DemoNote, Field, FormSection, Input, Select, Textarea } from '../../components/ui';
import NotFoundPage from '../common/NotFoundPage';

/* Status "dihancurkan" hanya lewat riwayat pengalihan ke pemusnahan, tidak dari formulir */
const STATUS_FORM = toOptions(STATUS_BB).filter(([k]) => k !== 'dihancurkan');
const MAX_FILE = 10 * 1024 * 1024;

export default function BarangBuktiFormPage() {
  const { id } = useParams();
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const { data, lookup, user, addBarang, updateBarang, nextKodeBB, toast } = useApp();
  const editing = id ? lookup.barang[Number(id)] : undefined;

  const [f, setF] = useState(() => (editing ? {
    kode: editing.kode, nama: editing.nama, kategori_id: String(editing.kategori_id), deskripsi: editing.deskripsi,
    nomor_seri: editing.nomor_seri, kondisi: editing.kondisi, perkara_id: String(editing.perkara_id),
    tanggal_penerimaan: editing.tanggal_penerimaan, petugas_penerima_id: String(editing.petugas_penerima_id),
    lokasi_id: String(editing.lokasi_id), status: editing.status, catatan: editing.catatan,
  } : {
    kode: nextKodeBB(), nama: '', kategori_id: '1', deskripsi: '', nomor_seri: '', kondisi: 'baik',
    perkara_id: params.get('perkara') || '', tanggal_penerimaan: todayISO(), petugas_penerima_id: user ? String(user.id) : '',
    lokasi_id: '', status: 'tersedia', catatan: '',
  }));
  const [errs, setErrs] = useState({});
  const [lamp, setLamp] = useState(() => (editing ? data.lampiran.filter((l) => l.barang_bukti_id === editing.id) : []));

  const lpOpts = useMemo(() => data.perkara.map((p) => [String(p.id), `${p.nomor_lp} — ${truncate(p.uraian, 42)}`]), [data.perkara]);

  if (id && !editing) return <NotFoundPage message="Data barang bukti tidak ditemukan." />;
  if (editing && editing.status === 'dihancurkan') {
    return <NotFoundPage message="Barang bukti yang sudah dimusnahkan tidak dapat diubah." />;
  }

  const set = (k, v) => setF((o) => ({ ...o, [k]: v }));
  const backTo = editing ? `/petugas/barang-bukti/${editing.id}` : '/petugas/barang-bukti';
  /* Setelah terdaftar, lokasi & status sebaiknya berubah lewat riwayat (chain of custody) */
  const lockedByHistory = editing && !editing.is_draf;

  function onFiles(e) {
    const files = Array.from(e.target.files || []);
    const tooBig = files.filter((fl) => fl.size > MAX_FILE);
    const ok = files.filter((fl) => fl.size <= MAX_FILE);
    if (ok.length) {
      setLamp((ls) => [...ls, ...ok.map((fl) => ({ tmp: Math.random(), nama_file: fl.name, tipe_mime: fl.type || 'tidak diketahui', ukuran_byte: fl.size }))]);
    }
    if (tooBig.length) toast('error', 'Berkas terlalu besar', `${tooBig.length} berkas melebihi 10 MB dan tidak ditambahkan.`);
    e.target.value = '';
  }

  function submit(final) {
    const e = {};
    const kode = f.kode.trim();
    if (!kode) e.kode = 'Kode barang bukti wajib diisi.';
    else if (!/^BB-\d{4}-\d{4,}$/.test(kode)) e.kode = 'Format kode: BB-tahun-nomor urut, cth. BB-2026-0015.';
    else if (data.barang_bukti.some((b) => b.kode.toLowerCase() === kode.toLowerCase() && (!editing || b.id !== editing.id))) e.kode = 'Kode sudah digunakan oleh barang bukti lain.';
    if (!f.nama.trim()) e.nama = 'Nama barang bukti wajib diisi.';
    if (!f.perkara_id) e.perkara_id = 'Pilih nomor perkara (LP) terkait.';
    if (!f.tanggal_penerimaan) e.tanggal_penerimaan = 'Tanggal penerimaan wajib diisi.';
    else if (f.tanggal_penerimaan > todayISO()) e.tanggal_penerimaan = 'Tanggal penerimaan tidak boleh melewati hari ini.';
    else if (f.perkara_id && f.tanggal_penerimaan < lookup.perkara[Number(f.perkara_id)]?.tanggal_laporan) e.tanggal_penerimaan = 'Tanggal penerimaan tidak boleh sebelum tanggal laporan perkara.';
    if (!f.petugas_penerima_id) e.petugas_penerima_id = 'Petugas penerima wajib dipilih.';
    if (!f.lokasi_id) e.lokasi_id = 'Lokasi penyimpanan wajib dipilih.';
    setErrs(e);
    if (Object.keys(e).length) { toast('error', 'Formulir belum lengkap', 'Periksa kembali isian yang ditandai merah.'); return; }

    const payload = {
      ...f, nama: f.nama.trim(), deskripsi: f.deskripsi.trim(), nomor_seri: f.nomor_seri.trim(), catatan: f.catatan.trim(),
      kategori_id: Number(f.kategori_id), perkara_id: Number(f.perkara_id), petugas_penerima_id: Number(f.petugas_penerima_id),
      lokasi_id: Number(f.lokasi_id), is_draf: !final,
    };
    const lampiranList = lamp.map(({ tmp, ...l }) => l); // eslint-disable-line no-unused-vars

    if (editing) {
      updateBarang(editing.id, payload, lampiranList);
      toast('success', 'Perubahan disimpan', final ? (editing.is_draf ? `${kode} didaftarkan dan tercatat kejadian Penerimaan.` : 'Data barang bukti berhasil diperbarui.') : 'Draf berhasil disimpan.');
      navigate(`/petugas/barang-bukti/${editing.id}`);
    } else {
      const nb = addBarang(payload, lampiranList);
      toast('success', final ? 'Barang bukti terdaftar' : 'Draf disimpan',
        final ? `${nb.kode} tercatat beserta kejadian Penerimaan pada riwayat.` : `${nb.kode} disimpan sebagai draf dan dapat dilengkapi kemudian.`);
      navigate(`/petugas/barang-bukti/${nb.id}`);
    }
  }

  return (
    <div className="space-y-5">
      <Link to={backTo} className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 transition hover:text-blue-700">
        <ArrowLeft size={14} />{editing ? 'Kembali ke detail' : 'Kembali ke Data Barang Bukti'}
      </Link>

      <div>
        <h2 className="text-lg font-bold text-navy-800">{editing ? 'Edit Barang Bukti' : 'Tambah Barang Bukti'}</h2>
        <p className="mt-0.5 text-sm text-slate-500">{editing ? `Perbarui data ${editing.kode}.` : 'Daftarkan barang bukti baru beserta informasi perkara dan penyimpanannya.'}</p>
      </div>

      <Alert tone="amber">
        <p className="font-bold">Jangan unggah berkas asli yang bersifat rahasia.</p>
        <p className="mt-0.5">Pada versi ini lampiran hanya dicatat metadatanya (nama, jenis, ukuran) dan tidak diunggah ke server.</p>
      </Alert>

      <FormSection icon={Package} title="Informasi Umum" desc="Identitas dan kondisi fisik barang bukti.">
        <Field label="Kode Barang Bukti" required error={errs.kode} hint="Dibuat otomatis: BB-tahun-nomor urut.">
          <Input value={f.kode} error={errs.kode} onChange={(e) => set('kode', e.target.value)} />
        </Field>
        <Field label="Nama Barang Bukti" required error={errs.nama}>
          <Input value={f.nama} error={errs.nama} onChange={(e) => set('nama', e.target.value)} placeholder="cth. Telepon Pintar Merk X Warna Hitam" />
        </Field>
        <Field label="Kategori" required>
          <Select value={f.kategori_id} onChange={(e) => set('kategori_id', e.target.value)} options={kategoriOptions(data)} />
        </Field>
        <Field label="Nomor Seri / IMEI (Opsional)">
          <Input value={f.nomor_seri} onChange={(e) => set('nomor_seri', e.target.value)} placeholder="Kosongkan jika tidak terbaca" />
        </Field>
        <Field label="Kondisi Fisik" required>
          <Select value={f.kondisi} onChange={(e) => set('kondisi', e.target.value)} options={toOptions(KONDISI)} />
        </Field>
        <Field label="Deskripsi" className="sm:col-span-2">
          <Textarea value={f.deskripsi} onChange={(e) => set('deskripsi', e.target.value)} placeholder="Ciri fisik, kelengkapan, keadaan saat diterima (data fiktif)…" />
        </Field>
      </FormSection>

      <FormSection icon={Briefcase} title="Informasi Perkara" desc="Kaitan barang bukti dengan laporan polisi.">
        <Field label="Nomor Perkara (LP)" required error={errs.perkara_id}>
          <Select value={f.perkara_id} error={errs.perkara_id} placeholder="Pilih nomor LP…" onChange={(e) => set('perkara_id', e.target.value)} options={lpOpts} />
        </Field>
        <Field label="Tanggal Penerimaan" required error={errs.tanggal_penerimaan}>
          <Input type="date" value={f.tanggal_penerimaan} max={todayISO()} error={errs.tanggal_penerimaan} onChange={(e) => set('tanggal_penerimaan', e.target.value)} />
        </Field>
        <Field label="Petugas Penerima" required error={errs.petugas_penerima_id} className="sm:col-span-2">
          <Select value={f.petugas_penerima_id} error={errs.petugas_penerima_id} placeholder="Pilih petugas penerima…" onChange={(e) => set('petugas_penerima_id', e.target.value)} options={petugasOptions(data)} />
        </Field>
      </FormSection>

      <FormSection icon={Archive} title="Informasi Penyimpanan" desc="Lokasi, status, dan catatan penyimpanan.">
        <Field label="Lokasi Penyimpanan" required error={errs.lokasi_id}
          hint={lockedByHistory ? 'Mengubah lokasi di sini akan dicatat otomatis sebagai kejadian Perpindahan.' : undefined}>
          <Select value={f.lokasi_id} error={errs.lokasi_id} placeholder="Pilih lokasi…" onChange={(e) => set('lokasi_id', e.target.value)} options={lokasiOptions(data)} />
        </Field>
        <Field label="Status Penyimpanan" required
          hint={editing?.status === 'dipinjam' ? 'Barang sedang dipinjam — ubah status melalui pencatatan Pengembalian.' : undefined}>
          <Select value={f.status} disabled={editing?.status === 'dipinjam'} onChange={(e) => set('status', e.target.value)}
            options={editing?.status === 'dipinjam' ? toOptions(STATUS_BB) : STATUS_FORM.filter(([k]) => k !== 'dipinjam')} />
        </Field>
        <Field label="Catatan Penyimpanan" className="sm:col-span-2">
          <Textarea value={f.catatan} onChange={(e) => set('catatan', e.target.value)} placeholder="cth. Disimpan menunggu jadwal pemeriksaan forensik digital…" />
        </Field>
      </FormSection>

      <FormSection icon={Paperclip} title="Lampiran / Dokumen Pendukung (Opsional)" desc="Berita acara, foto kondisi, atau dokumen terkait.">
        <div className="sm:col-span-2">
          <div className="rounded-lg border border-dashed border-slate-300 bg-slate-50/60 p-4">
            <label className="flex cursor-pointer flex-col items-center justify-center gap-1 py-3 text-center">
              <Upload size={20} className="text-slate-400" />
              <span className="text-xs font-semibold text-slate-600">Pilih berkas untuk ditambahkan</span>
              <span className="text-[11px] text-slate-400">PDF, gambar, atau dokumen — maks. 10 MB per berkas</span>
              <input type="file" multiple className="hidden" accept=".pdf,.jpg,.jpeg,.png,.doc,.docx" onChange={onFiles} />
            </label>
            {lamp.length > 0 && (
              <ul className="mt-3 space-y-2">
                {lamp.map((l) => (
                  <li key={l.id || l.tmp} className="flex items-center gap-3 rounded-lg border border-slate-200 bg-white px-3 py-2">
                    <Paperclip size={14} className="shrink-0 text-slate-400" />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-xs font-semibold text-navy-800">{l.nama_file}</p>
                      <p className="text-[11px] text-slate-400">{l.tipe_mime} · {fmtBytes(l.ukuran_byte)}</p>
                    </div>
                    <button type="button" onClick={() => setLamp((ls) => ls.filter((x) => x !== l))}
                      className="shrink-0 text-slate-400 transition hover:text-red-600" aria-label="Hapus lampiran">
                      <X size={14} />
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </FormSection>

      <div className="flex flex-wrap items-center justify-end gap-2 border-t border-slate-200 pt-5">
        <Button variant="ghost" onClick={() => navigate(backTo)}>Batal</Button>
        {(!editing || editing.is_draf) && <Button variant="secondary" icon={Save} onClick={() => submit(false)}>Simpan sebagai Draf</Button>}
        <Button icon={Check} onClick={() => submit(true)}>{editing && !editing.is_draf ? 'Simpan Perubahan' : 'Simpan & Daftarkan'}</Button>
      </div>

      <DemoNote>Menyimpan sebagai draf tidak mencatat kejadian Penerimaan; kejadian baru tercatat ketika draf didaftarkan melalui tombol Simpan & Daftarkan.</DemoNote>
    </div>
  );
}
