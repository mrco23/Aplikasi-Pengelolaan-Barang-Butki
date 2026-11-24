/* Master data: kategori barang bukti & lokasi penyimpanan (khusus Administrator) */
import { useEffect, useState } from 'react';
import { Check, Database, MapPin, Package, Pencil, Plus, Tag, Trash2 } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { KATEGORI_ICON } from '../../constants';
import {
  Badge, Button, Card, ConfirmDialog, DemoNote, EmptyState, Field, IconBtn, Input, Modal, Select, Table, Tabs, Textarea,
} from '../../components/ui';

const JENIS_LOKASI = { penyimpanan: 'Penyimpanan', pemeriksaan: 'Pemeriksaan', pemusnahan: 'Pemusnahan' };
const JENIS_TONE = { penyimpanan: 'tersedia', pemeriksaan: 'dalam_pemeriksaan', pemusnahan: 'dihancurkan' };

const CONFIG = {
  kategori: { table: 'kategori', label: 'Kategori', icon: Tag, desc: 'Pengelompokan jenis barang bukti.' },
  lokasi: { table: 'lokasi_penyimpanan', label: 'Lokasi Penyimpanan', icon: MapPin, desc: 'Tempat barang bukti disimpan atau dipindahkan.' },
};

export default function MasterDataPage() {
  const { data, masterUsage, deleteMaster, toast } = useApp();
  const [tab, setTab] = useState('kategori');
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [delTarget, setDelTarget] = useState(null);
  const cfg = CONFIG[tab];
  const rows = data[cfg.table];

  const usage = (id) => masterUsage(tab, id);
  const delUsed = delTarget ? usage(delTarget.id) : 0;

  async function confirmDelete() {
    const r = await deleteMaster(tab, delTarget.id);
    if (r.ok) toast('success', `${cfg.label} dihapus`, `${delTarget.nama} telah dihapus.`);
    else toast('error', 'Gagal menghapus', r.msg);
    setDelTarget(null);
  }

  return (
    <div className="space-y-5">
      <Tabs active={tab} onChange={setTab} tabs={[
        { key: 'kategori', label: 'Kategori', icon: Tag, count: data.kategori.length },
        { key: 'lokasi', label: 'Lokasi Penyimpanan', icon: MapPin, count: data.lokasi_penyimpanan.length },
      ]} />

      <Card noPad title={cfg.label} desc={cfg.desc}
        actions={<Button size="sm" icon={Plus} onClick={() => { setEditing(null); setFormOpen(true); }}>Tambah {cfg.label}</Button>}>
        {rows.length ? (
          <Table minWidth={720} head={tab === 'kategori'
            ? ['Nama Kategori', 'Kode', 'Keterangan', { label: 'Dipakai', className: 'text-center' }, { label: 'Aksi', className: 'text-right' }]
            : ['Nama Lokasi', 'Jenis', 'Keterangan', { label: 'Dipakai', className: 'text-center' }, { label: 'Aksi', className: 'text-right' }]}>
            {rows.map((r) => {
              const used = usage(r.id);
              const Ico = tab === 'kategori' ? (KATEGORI_ICON[r.kode] || Package) : MapPin;
              return (
                <tr key={r.id} className="transition hover:bg-slate-50/70">
                  <td className="px-5 py-3">
                    <span className="flex items-center gap-2.5 font-semibold text-navy-800">
                      <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-slate-100 text-slate-500"><Ico size={15} /></span>
                      {r.nama}
                    </span>
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-xs">
                    {tab === 'kategori' ? <code className="rounded bg-slate-100 px-1.5 py-0.5 text-[11px] text-slate-600">{r.kode}</code> : <Badge tone={JENIS_TONE[r.jenis]}>{JENIS_LOKASI[r.jenis]}</Badge>}
                  </td>
                  <td className="max-w-[320px] px-4 py-3 text-xs text-slate-600">{r.keterangan || '—'}</td>
                  <td className="px-4 py-3 text-center">
                    <span className="inline-flex h-6 min-w-[26px] items-center justify-center rounded-full bg-slate-100 px-1.5 text-xs font-bold tabular-nums text-slate-600">{used}</span>
                  </td>
                  <td className="px-5 py-3">
                    <div className="flex justify-end gap-1.5">
                      <IconBtn icon={Pencil} title="Edit" onClick={() => { setEditing(r); setFormOpen(true); }} />
                      <IconBtn icon={Trash2} tone="danger" title={used ? 'Masih dipakai, tidak dapat dihapus' : 'Hapus'} disabled={used > 0} onClick={() => setDelTarget(r)} />
                    </div>
                  </td>
                </tr>
              );
            })}
          </Table>
        ) : (
          <EmptyState icon={Database} title="Belum ada data" desc={`Tambahkan ${cfg.label.toLowerCase()} pertama.`} />
        )}
      </Card>

      <DemoNote>Data yang masih dipakai oleh barang bukti atau riwayat tidak dapat dihapus. Kolom “Dipakai” menunjukkan jumlah data yang merujuk.</DemoNote>

      <MasterFormModal kind={tab} open={formOpen} initial={editing} onClose={() => setFormOpen(false)} />
      <ConfirmDialog open={!!delTarget} onClose={() => setDelTarget(null)} onConfirm={confirmDelete}
        title={`Hapus ${cfg.label}?`} confirmDisabled={delUsed > 0}>
        <p><span className="font-semibold text-navy-800">{delTarget?.nama}</span> akan dihapus dan tidak dapat dibatalkan.</p>
      </ConfirmDialog>
    </div>
  );
}

function MasterFormModal({ kind, open, initial, onClose }) {
  const { saveMaster, toast } = useApp();
  const cfg = CONFIG[kind];
  const blank = kind === 'kategori' ? { nama: '', kode: '', keterangan: '' } : { nama: '', jenis: 'penyimpanan', keterangan: '' };
  const [f, setF] = useState(blank);
  const [errs, setErrs] = useState({});

  useEffect(() => {
    if (!open) return;
    setF(initial ? { ...blank, ...Object.fromEntries(Object.keys(blank).map((k) => [k, initial[k] ?? ''])) } : blank);
    setErrs({});
  }, [open, initial, kind]); // eslint-disable-line react-hooks/exhaustive-deps

  const set = (k, v) => setF((o) => ({ ...o, [k]: v }));
  /* Kode kategori dibuat dari nama: "Media Penyimpanan" -> "media_penyimpanan" */
  const slug = (s) => s.trim().toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_|_$/g, '');

  async function submit() {
    const e = {};
    if (!f.nama.trim()) e.nama = 'Nama wajib diisi.';
    setErrs(e);
    if (Object.keys(e).length) return;
    const payload = kind === 'kategori'
      ? { nama: f.nama, kode: initial?.kode || slug(f.kode || f.nama), keterangan: f.keterangan.trim() }
      : { nama: f.nama, jenis: f.jenis, keterangan: f.keterangan.trim() };
    const r = await saveMaster(kind, initial?.id, payload);
    if (!r.ok) { setErrs({ [r.field || 'nama']: r.msg }); return; }
    toast('success', `${cfg.label} disimpan`, `${f.nama.trim()} berhasil disimpan.`);
    onClose();
  }

  return (
    <Modal open={open} onClose={onClose} width="max-w-md"
      title={`${initial ? 'Edit' : 'Tambah'} ${cfg.label}`}
      footer={<>
        <Button variant="secondary" onClick={onClose}>Batal</Button>
        <Button icon={Check} onClick={submit}>Simpan</Button>
      </>}>
      <div className="grid gap-4">
        <Field label="Nama" required error={errs.nama}>
          <Input value={f.nama} error={errs.nama} onChange={(e) => set('nama', e.target.value)} />
        </Field>
        {kind === 'kategori' ? (
          <Field label="Kode" error={errs.kode} hint={initial ? 'Kode tidak dapat diubah.' : 'Kosongkan untuk dibuat otomatis dari nama.'}>
            <Input value={initial ? f.kode : f.kode} disabled={!!initial} placeholder={slug(f.nama) || 'cth. media_penyimpanan'} error={errs.kode} onChange={(e) => set('kode', e.target.value)} />
          </Field>
        ) : (
          <Field label="Jenis Lokasi" required hint="Pengalihan ke lokasi berjenis Pemusnahan mengubah status barang menjadi Dihancurkan.">
            <Select value={f.jenis} onChange={(e) => set('jenis', e.target.value)} options={Object.entries(JENIS_LOKASI)} />
          </Field>
        )}
        <Field label="Keterangan">
          <Textarea value={f.keterangan} onChange={(e) => set('keterangan', e.target.value)} />
        </Field>
      </div>
    </Modal>
  );
}
