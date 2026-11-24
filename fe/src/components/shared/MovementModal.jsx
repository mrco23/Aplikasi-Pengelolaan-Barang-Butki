/* Modal pencatatan kejadian barang bukti: perpindahan, peminjaman, pengembalian, pemeriksaan, pengalihan */
import { useEffect, useMemo, useState } from 'react';
import { Check, Info } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { JENIS_RIWAYAT } from '../../constants';
import { cn, nowLocal } from '../../utils/format';
import { lokasiOptions, petugasOptions } from '../../utils/selectors';
import { Button, Field, Input, Modal, Select, Textarea } from '../ui';

/* Penerimaan dicatat otomatis saat barang didaftarkan, jadi tidak ditawarkan di sini */
const JENIS_OPTS = Object.entries(JENIS_RIWAYAT).filter(([k]) => k !== 'penerimaan');

export default function MovementModal({ open, onClose, fixedBarangId, defaultJenis = 'perpindahan' }) {
  const { data, lookup, user, addRiwayat, toast } = useApp();
  const items = useMemo(() => data.barang_bukti.filter((b) => !b.is_draf && b.status !== 'dihancurkan'), [data.barang_bukti]);

  const init = () => {
    const b = fixedBarangId ? lookup.barang[fixedBarangId] : undefined;
    return {
      barang_bukti_id: b ? String(b.id) : '', jenis: defaultJenis, lokasi_asal_id: b ? String(b.lokasi_id) : '',
      lokasi_tujuan_id: '', petugas_id: user?.role === 'petugas' ? String(user.id) : '', tanggal_waktu: nowLocal(),
      alasan: '', catatan: '', tanggal_harapan_kembali: '',
    };
  };
  const [f, setF] = useState(init);
  const [errs, setErrs] = useState({});
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (open) { setF(init()); setErrs({}); }
  }, [open, fixedBarangId]); // eslint-disable-line react-hooks/exhaustive-deps

  const set = (k, v) => setF((o) => ({ ...o, [k]: v }));
  const onBarang = (id) => {
    const b = lookup.barang[id];
    setF((o) => ({ ...o, barang_bukti_id: id, lokasi_asal_id: b ? String(b.lokasi_id) : '' }));
  };

  const barangId = Number(f.barang_bukti_id);
  const barang = lookup.barang[barangId];
  const openLoan = barangId && data.riwayat_barang_bukti.find((r) => r.barang_bukti_id === barangId && r.jenis === 'peminjaman' && r.status_kembali === 'belum_kembali');

  /* Pengembalian: arahkan tujuan ke lokasi sebelum dipinjam */
  useEffect(() => {
    if (f.jenis === 'pengembalian' && openLoan && !f.lokasi_tujuan_id) set('lokasi_tujuan_id', String(openLoan.lokasi_asal_id ?? ''));
  }, [f.jenis, openLoan]); // eslint-disable-line react-hooks/exhaustive-deps

  async function submit() {
    const e = {};
    if (!f.barang_bukti_id) e.barang_bukti_id = 'Pilih barang bukti.';
    if (!f.lokasi_asal_id) e.lokasi_asal_id = 'Lokasi asal wajib dipilih.';
    if (!f.lokasi_tujuan_id) e.lokasi_tujuan_id = 'Lokasi tujuan wajib dipilih.';
    else if (f.jenis === 'perpindahan' && f.lokasi_tujuan_id === f.lokasi_asal_id) e.lokasi_tujuan_id = 'Lokasi tujuan sama dengan lokasi asal.';
    if (!f.petugas_id) e.petugas_id = 'Petugas yang menangani wajib dipilih.';
    if (!f.tanggal_waktu) e.tanggal_waktu = 'Tanggal dan waktu wajib diisi.';
    if (!f.alasan.trim()) e.alasan = 'Alasan/keperluan wajib diisi.';
    if (f.jenis === 'peminjaman') {
      if (barang?.status === 'dipinjam') e.jenis = 'Barang ini masih berstatus Dipinjam. Catat Pengembalian terlebih dahulu.';
      if (!f.tanggal_harapan_kembali) e.tanggal_harapan_kembali = 'Tanggal harapan kembali wajib diisi untuk peminjaman.';
      else if (f.tanggal_harapan_kembali < f.tanggal_waktu.slice(0, 10)) e.tanggal_harapan_kembali = 'Tanggal kembali tidak boleh sebelum tanggal kejadian.';
    }
    if (f.jenis === 'pengembalian' && barang?.status !== 'dipinjam') e.jenis = 'Barang ini tidak sedang dipinjam.';
    setErrs(e);
    if (Object.keys(e).length) { toast('error', 'Data belum lengkap', 'Periksa kembali isian yang ditandai merah.'); return; }

    setBusy(true);
    /* Lokasi asal & status kembali ditentukan server dari kondisi barang saat ini */
    const r = await addRiwayat({
      barang_bukti_id: barangId,
      jenis: f.jenis,
      tanggal_waktu: f.tanggal_waktu,
      lokasi_tujuan_id: Number(f.lokasi_tujuan_id),
      petugas_id: Number(f.petugas_id),
      alasan: f.alasan.trim(),
      catatan: f.catatan.trim(),
      tanggal_harapan_kembali: f.jenis === 'peminjaman' ? f.tanggal_harapan_kembali : null,
    });
    setBusy(false);
    if (!r.ok) {
      if (r.field) setErrs({ [r.field]: r.msg });
      toast('error', 'Gagal mencatat kejadian', r.msg);
      return;
    }
    toast('success', 'Kejadian tercatat', `${JENIS_RIWAYAT[f.jenis]} untuk ${barang.kode} berhasil dicatat pada riwayat.`);
    onClose();
  }

  const lokOpts = lokasiOptions(data);
  const tujuanOpts = f.jenis === 'pengalihan' ? lokasiOptions(data, { includePemusnahan: true }) : lokOpts;
  const toPemusnahan = lookup.lokasi[Number(f.lokasi_tujuan_id)]?.jenis === 'pemusnahan';

  return (
    <Modal open={open} onClose={onClose} width="max-w-2xl"
      title="Catat Kejadian Barang Bukti"
      desc="Rekam perpindahan, peminjaman, pengembalian, pemeriksaan, atau pengalihan. Riwayat sebelumnya tidak pernah ditimpa — setiap kejadian ditambahkan sebagai catatan baru."
      footer={<>
        <Button variant="secondary" onClick={onClose}>Batal</Button>
        <Button icon={Check} disabled={busy} onClick={submit}>Catat Kejadian</Button>
      </>}>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Barang Bukti" required error={errs.barang_bukti_id} className="sm:col-span-2">
          <Select value={f.barang_bukti_id} error={errs.barang_bukti_id} placeholder="Pilih kode barang bukti…" disabled={!!fixedBarangId}
            onChange={(e) => onBarang(e.target.value)}
            options={items.map((b) => [String(b.id), `${b.kode} — ${b.nama}`])} />
        </Field>
        <Field label="Jenis Kejadian" required error={errs.jenis}>
          <Select value={f.jenis} error={errs.jenis} onChange={(e) => { set('jenis', e.target.value); set('lokasi_tujuan_id', ''); }} options={JENIS_OPTS} />
        </Field>
        <Field label="Tanggal & Waktu" required error={errs.tanggal_waktu}>
          <Input type="datetime-local" value={f.tanggal_waktu} error={errs.tanggal_waktu} onChange={(e) => set('tanggal_waktu', e.target.value)} />
        </Field>
        <Field label="Lokasi Asal" required error={errs.lokasi_asal_id} hint="Terisi otomatis dari lokasi barang saat ini.">
          <Select value={f.lokasi_asal_id} disabled error={errs.lokasi_asal_id} placeholder="—" options={lokasiOptions(data, { includePemusnahan: true })} />
        </Field>
        <Field label="Lokasi Tujuan" required error={errs.lokasi_tujuan_id}
          hint={f.jenis === 'pemeriksaan' ? 'Isi sama dengan lokasi asal jika diperiksa di tempat.' : f.jenis === 'pengembalian' ? 'Barang dikembalikan ke lokasi penyimpanan tetap.' : undefined}>
          <Select value={f.lokasi_tujuan_id} error={errs.lokasi_tujuan_id} placeholder="Pilih lokasi tujuan…"
            onChange={(e) => set('lokasi_tujuan_id', e.target.value)} options={tujuanOpts} />
        </Field>
        {f.jenis === 'peminjaman' && (
          <Field label="Tanggal Harapan Kembali" required error={errs.tanggal_harapan_kembali}>
            <Input type="date" value={f.tanggal_harapan_kembali} min={f.tanggal_waktu.slice(0, 10)} error={errs.tanggal_harapan_kembali} onChange={(e) => set('tanggal_harapan_kembali', e.target.value)} />
          </Field>
        )}
        <Field label="Petugas yang Menangani" required error={errs.petugas_id}>
          <Select value={f.petugas_id} error={errs.petugas_id} placeholder="Pilih petugas…" onChange={(e) => set('petugas_id', e.target.value)} options={petugasOptions(data)} />
        </Field>
        <Field label="Alasan / Keperluan" required error={errs.alasan} className="sm:col-span-2">
          <Input value={f.alasan} error={errs.alasan} onChange={(e) => set('alasan', e.target.value)} placeholder="cth. Pemeriksaan forensik digital (ekstraksi data)" />
        </Field>
        <Field label="Catatan" className="sm:col-span-2">
          <Textarea value={f.catatan} onChange={(e) => set('catatan', e.target.value)} placeholder="Catatan tambahan (opsional)…" />
        </Field>

        {f.jenis === 'peminjaman' && (
          <Hint tone="amber">Status barang akan otomatis menjadi <b>Dipinjam</b> dan tercatat <b>Belum Kembali</b> sampai kejadian Pengembalian direkam.</Hint>
        )}
        {f.jenis === 'pengembalian' && (
          <Hint tone={openLoan ? 'emerald' : 'slate'}>
            {openLoan
              ? 'Terdapat peminjaman aktif untuk barang ini — akan ditandai Sudah Kembali dan status barang kembali menjadi Tersedia.'
              : 'Tidak terdapat peminjaman aktif untuk barang ini.'}
          </Hint>
        )}
        {f.jenis === 'pengalihan' && toPemusnahan && (
          <Hint tone="red">Pengalihan ke lokasi pemusnahan akan mengubah status barang menjadi <b>Dihancurkan</b>. Pastikan nomor berita acara dicantumkan di catatan.</Hint>
        )}
      </div>
    </Modal>
  );
}

function Hint({ tone, children }) {
  const cls = {
    amber: 'border-amber-200 bg-amber-50 text-amber-800',
    emerald: 'border-emerald-200 bg-emerald-50 text-emerald-800',
    slate: 'border-slate-200 bg-slate-50 text-slate-600',
    red: 'border-red-200 bg-red-50 text-red-800',
  }[tone];
  return (
    <p className={cn('flex items-start gap-2 rounded-lg border px-3 py-2 text-[11px] leading-relaxed sm:col-span-2', cls)}>
      <Info size={13} className="mt-0.5 shrink-0" />
      <span>{children}</span>
    </p>
  );
}
