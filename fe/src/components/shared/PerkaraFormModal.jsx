import { useEffect, useState } from 'react';
import { Check } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { TAHAP, toOptions } from '../../constants';
import { todayISO } from '../../utils/format';
import { penggunaNama, petugasOptions } from '../../utils/selectors';
import { Button, Field, Input, Modal, Select, Textarea } from '../ui';

const blank = () => ({ nomor_lp: '', tanggal_laporan: todayISO(), uraian: '', tahap: 'lidik', penyidik_id: '' });

export default function PerkaraFormModal({ open, initial, onClose, onSaved }) {
  const { data, lookup, addPerkara, updatePerkara, toast } = useApp();
  const [busy, setBusy] = useState(false);
  const [f, setF] = useState(blank);
  const [errs, setErrs] = useState({});

  useEffect(() => {
    if (!open) return;
    setF(initial
      ? { nomor_lp: initial.nomor_lp, tanggal_laporan: initial.tanggal_laporan, uraian: initial.uraian, tahap: initial.tahap, penyidik_id: String(initial.penyidik_id) }
      : blank());
    setErrs({});
  }, [open, initial]);

  const set = (k, v) => setF((o) => ({ ...o, [k]: v }));

  async function submit() {
    const e = {};
    const lp = f.nomor_lp.trim();
    if (!lp) e.nomor_lp = 'Nomor LP wajib diisi.';
    else if (data.perkara.some((p) => p.nomor_lp.toLowerCase() === lp.toLowerCase() && (!initial || p.id !== initial.id)))
      e.nomor_lp = 'Nomor LP sudah terdaftar.';
    if (!f.tanggal_laporan) e.tanggal_laporan = 'Tanggal laporan wajib diisi.';
    else if (f.tanggal_laporan > todayISO()) e.tanggal_laporan = 'Tanggal laporan tidak boleh melewati hari ini.';
    if (!f.uraian.trim()) e.uraian = 'Uraian singkat perkara wajib diisi.';
    if (!f.penyidik_id) e.penyidik_id = 'Pilih penyidik.';
    setErrs(e);
    if (Object.keys(e).length) { toast('error', 'Formulir belum lengkap', 'Periksa kembali isian yang ditandai merah.'); return; }

    const payload = { ...f, nomor_lp: lp, uraian: f.uraian.trim(), penyidik_id: Number(f.penyidik_id) };
    setBusy(true);
    const r = initial ? await updatePerkara(initial.id, payload) : await addPerkara(payload);
    setBusy(false);
    if (!r.ok) {
      if (r.field) setErrs({ [r.field]: r.msg });
      toast('error', 'Gagal menyimpan', r.msg);
      return;
    }
    toast('success', initial ? 'Perkara diperbarui' : 'Perkara ditambahkan',
      initial ? `${lp} berhasil disimpan.` : `${lp} berhasil dicatat. Lanjutkan dengan mendaftarkan barang bukti.`);
    onClose();
    onSaved?.(r.data);
  }

  /* Penyidik lama yang kini nonaktif tetap ditampilkan agar data lama bisa diedit */
  const penyidikOpts = petugasOptions(data);
  if (initial && !penyidikOpts.some(([v]) => v === String(initial.penyidik_id))) {
    penyidikOpts.push([String(initial.penyidik_id), `${penggunaNama(lookup, initial.penyidik_id)} (nonaktif)`]);
  }

  return (
    <Modal open={open} onClose={onClose} width="max-w-xl"
      title={initial ? 'Edit Data Perkara' : 'Tambah Data Perkara'}
      desc={initial ? 'Perbarui informasi perkara.' : 'Catat perkara baru sebelum mendaftarkan barang bukti terkait.'}
      footer={<>
        <Button variant="secondary" onClick={onClose}>Batal</Button>
        <Button icon={Check} disabled={busy} onClick={submit}>{initial ? 'Simpan Perubahan' : 'Simpan Perkara'}</Button>
      </>}>
      <div className="grid gap-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Nomor Laporan Polisi" required error={errs.nomor_lp} hint="Format: LP/nomor/bulan romawi/tahun/Ditreskrimsus">
            <Input value={f.nomor_lp} error={errs.nomor_lp} onChange={(e) => set('nomor_lp', e.target.value)} placeholder="LP/000/XI/2026/Ditreskrimsus" />
          </Field>
          <Field label="Tanggal Laporan" required error={errs.tanggal_laporan}>
            <Input type="date" value={f.tanggal_laporan} max={todayISO()} error={errs.tanggal_laporan} onChange={(e) => set('tanggal_laporan', e.target.value)} />
          </Field>
        </div>
        <Field label="Uraian Singkat Perkara" required error={errs.uraian}>
          <Textarea value={f.uraian} error={errs.uraian} onChange={(e) => set('uraian', e.target.value)} placeholder="Ringkas modus, waktu, dan lokasi kejadian (gunakan data fiktif)…" />
        </Field>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Tahap Penanganan" required>
            <Select value={f.tahap} onChange={(e) => set('tahap', e.target.value)} options={toOptions(TAHAP)} />
          </Field>
          <Field label="Penyidik" required error={errs.penyidik_id}>
            <Select value={f.penyidik_id} error={errs.penyidik_id} placeholder="Pilih penyidik…" onChange={(e) => set('penyidik_id', e.target.value)} options={penyidikOpts} />
          </Field>
        </div>
      </div>
    </Modal>
  );
}
