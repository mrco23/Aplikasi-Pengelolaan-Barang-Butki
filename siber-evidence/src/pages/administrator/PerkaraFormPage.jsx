import React, { useState, useEffect } from 'react';
import { useApp } from '../../../context/AppContext';
import { Modal, Button, Field, Input, Select } from '../../../components/common/UI';
import { todayISO } from '../../../utils/helpers';

export default function PerkaraFormModal({ open, initial, onClose }) {
  const { data, addPerkara, updatePerkara, toast } = useApp();
  const blank = { nomorLP: '', tanggalLaporan: todayISO(), uraian: '', tahap: 'Lidik', penyidik: '' };
  const [f, setF] = useState(blank);
  const [errs, setErrs] = useState({});
  useEffect(() => {
    if (open) {
      setF(initial
        ? { nomorLP: initial.nomorLP, tanggalLaporan: initial.tanggalLaporan, uraian: initial.uraian, tahap: initial.tahap, penyidik: initial.penyidik }
        : { ...blank, tanggalLaporan: todayISO() });
      setErrs({});
    }
  }, [open, initial]);
  const set = (key, v) => setF((o) => ({ ...o, [key]: v }));
  const petugasOpts = data.users.filter((u) => u.status === 'Aktif').map((u) => [u.nama, u.nama]);

  function submit() {
    const e = {};
    if (!f.nomorLP.trim()) e.nomorLP = 'Nomor LP wajib diisi.';
    else if (data.perkara.some((p) => p.nomorLP.toLowerCase() === f.nomorLP.trim().toLowerCase() && (!initial || p.id !== initial.id)))
      e.nomorLP = 'Nomor LP sudah terdaftar.';
    if (!f.tanggalLaporan) e.tanggalLaporan = 'Tanggal laporan wajib diisi.';
    if (!f.uraian.trim()) e.uraian = 'Uraian singkat perkara wajib diisi.';
    if (!f.tahap) e.tahap = 'Pilih tahap penanganan.';
    if (!f.penyidik) e.penyidik = 'Pilih penyidik/petugas.';
    setErrs(e);
    if (Object.keys(e).length) { toast('error', 'Formulir belum lengkap', 'Periksa kembali isian yang ditandai merah.'); return; }
    if (initial) { updatePerkara(initial.id, f); toast('success', 'Perkara diperbarui', f.nomorLP + ' berhasil disimpan (demo).'); }
    else { addPerkara(f); toast('success', 'Perkara ditambahkan', f.nomorLP + ' tercatat pada data demo.'); }
    onClose();
  }

  return (
    <Modal open={open} onClose={onClose} width="max-w-xl"
      title={initial ? 'Edit Data Perkara' : 'Tambah Data Perkara'}
      desc={initial ? 'Perbarui informasi perkara pada data demo.' : 'Catat perkara baru sebelum mendaftarkan barang bukti terkait.'}
      footer={<React.Fragment>
        <Button variant="secondary" onClick={onClose}>Batal</Button>
        <Button icon="check" onClick={submit}>{initial ? 'Simpan Perubahan' : 'Simpan Perkara'}</Button>
      </React.Fragment>}>
      <div className="grid gap-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Nomor Laporan Polisi" required error={errs.nomorLP}>
            <Input value={f.nomorLP} error={errs.nomorLP} onChange={(e) => set('nomorLP', e.target.value)} placeholder="LP/000/roman/tahun/Ditreskrimsus" />
          </Field>
          <Field label="Tanggal Laporan" required error={errs.tanggalLaporan}>
            <Input type="date" value={f.tanggalLaporan} error={errs.tanggalLaporan} onChange={(e) => set('tanggalLaporan', e.target.value)} />
          </Field>
        </div>
        <Field label="Uraian Singkat Perkara" required error={errs.uraian}>
          <textarea rows={3} value={f.uraian} className={`w-full rounded-lg border bg-white px-3 py-2 text-sm text-slate-800 placeholder:text-slate-400 transition focus:outline-none focus:ring-2 ${errs.uraian ? 'border-red-400 focus:border-red-500 focus:ring-red-500/15' : 'border-slate-300 focus:border-blue-500 focus:ring-blue-500/15'}`} onChange={(e) => set('uraian', e.target.value)} placeholder="Ringkas modus, waktu, dan lokasi kejadian (gunakan data fiktif)…" />
        </Field>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Tahap Penanganan" required error={errs.tahap}>
            <Select value={f.tahap} error={errs.tahap} onChange={(e) => set('tahap', e.target.value)} options={[['Lidik', 'Lidik'], ['Sidik', 'Sidik']]} />
          </Field>
          <Field label="Penyidik / Petugas" required error={errs.penyidik}>
            <Select value={f.penyidik} error={errs.penyidik} placeholder="Pilih penyidik…" onChange={(e) => set('penyidik', e.target.value)} options={petugasOpts} />
          </Field>
        </div>
      </div>
    </Modal>
  );
}
