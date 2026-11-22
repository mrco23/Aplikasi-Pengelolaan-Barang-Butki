import React, { useState, useEffect, useMemo } from 'react';
import { useApp } from '../../../context/AppContext';
import { SearchInput, Select, Input, Button, Card, Badge, IconBtn, EmptyState, Pagination, ConfirmDialog, DemoNote } from '../../../components/common/UI';
import { fmtDate } from '../../../utils/helpers';
import PerkaraFormModal from './PerkaraFormPage';

export default function PerkaraPage() {
  const { data, user, deletePerkara, toast } = useApp();
  const [q, setQ] = useState('');
  const [tahap, setTahap] = useState('');
  const [dari, setDari] = useState('');
  const [sampai, setSampai] = useState('');
  const [page, setPage] = useState(1);
  const PS = 8;
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [delTarget, setDelTarget] = useState(null);

  useEffect(() => { setPage(1); }, [q, tahap, dari, sampai]);

  const filtered = useMemo(() => data.perkara.filter((p) => {
    const s = q.trim().toLowerCase();
    if (s && !(p.nomorLP.toLowerCase().includes(s) || p.uraian.toLowerCase().includes(s) || p.penyidik.toLowerCase().includes(s))) return false;
    if (tahap && p.tahap !== tahap) return false;
    if (dari && p.tanggalLaporan < dari) return false;
    if (sampai && p.tanggalLaporan > sampai) return false;
    return true;
  }).sort((a, b) => b.tanggalLaporan.localeCompare(a.tanggalLaporan)), [data.perkara, q, tahap, dari, sampai]);

  const pages = Math.max(1, Math.ceil(filtered.length / PS));
  const cur = Math.min(page, pages);
  const paged = filtered.slice((cur - 1) * PS, cur * PS);
  const hasFilter = !!(q || tahap || dari || sampai);
  const linkedCount = (p) => data.barang.filter((b) => b.nomorLP === p.nomorLP).length;
  const delLinked = delTarget ? linkedCount(delTarget) : 0;

  function confirmDelete() {
    if (!delTarget) return;
    const r = deletePerkara(delTarget.id);
    if (r.ok) toast('success', 'Perkara dihapus', delTarget.nomorLP + ' telah dihapus dari data demo.');
    else toast('error', 'Gagal menghapus', r.msg);
    setDelTarget(null);
  }

  return (
    <div>
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-1 flex-wrap items-center gap-2">
          <SearchInput className="w-full sm:w-72" placeholder="Cari nomor LP atau nama perkara…" value={q} onChange={(e) => setQ(e.target.value)} />
          <Select className="w-36" value={tahap} onChange={(e) => setTahap(e.target.value)} options={[['', 'Semua Tahap'], ['Lidik', 'Lidik'], ['Sidik', 'Sidik']]} />
          <div className="flex items-center gap-1.5">
            <Input type="date" className="w-[150px]" value={dari} onChange={(e) => setDari(e.target.value)} title="Dari tanggal" />
            <span className="text-xs text-slate-400">s/d</span>
            <Input type="date" className="w-[150px]" value={sampai} onChange={(e) => setSampai(e.target.value)} title="Sampai tanggal" />
          </div>
          {hasFilter && (
            <button onClick={() => { setQ(''); setTahap(''); setDari(''); setSampai(''); }} className="text-xs font-semibold text-blue-600 hover:underline">
              Atur ulang
            </button>
          )}
        </div>
        <Button icon="plus" onClick={() => { setEditing(null); setFormOpen(true); }}>Tambah Perkara</Button>
      </div>

      <Card noPad className="mt-4">
        {paged.length ? (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[880px] text-left text-sm">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/80 text-[11px] uppercase tracking-wide text-slate-500">
                  <th className="px-5 py-3 font-semibold">Nomor LP</th>
                  <th className="px-4 py-3 font-semibold">Tanggal Laporan</th>
                  <th className="px-4 py-3 font-semibold">Nama / Judul Perkara</th>
                  <th className="px-4 py-3 font-semibold">Tahap</th>
                  <th className="px-4 py-3 font-semibold">Penyidik</th>
                  <th className="px-4 py-3 text-center font-semibold">Jumlah BB</th>
                  <th className="px-5 py-3 text-right font-semibold">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {paged.map((p) => (
                  <tr key={p.id} className="transition hover:bg-slate-50/70">
                    <td className="whitespace-nowrap px-5 py-3.5"><a href={'#/perkara/' + p.id} className="font-semibold text-navy-800 hover:text-blue-700">{p.nomorLP}</a></td>
                    <td className="whitespace-nowrap px-4 py-3.5 text-xs tabular-nums text-slate-500">{fmtDate(p.tanggalLaporan)}</td>
                    <td className="max-w-[300px] px-4 py-3.5"><span className="line-clamp-2 text-slate-700" title={p.uraian}>{p.uraian}</span></td>
                    <td className="px-4 py-3.5"><Badge>{p.tahap}</Badge></td>
                    <td className="whitespace-nowrap px-4 py-3.5 text-slate-600">{p.penyidik}</td>
                    <td className="px-4 py-3.5 text-center">
                      <span className="inline-flex h-6 min-w-[26px] items-center justify-center rounded-full bg-slate-100 px-1.5 text-xs font-bold tabular-nums text-slate-600">{linkedCount(p)}</span>
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex justify-end gap-1.5">
                        <IconBtn icon="eye" title="Lihat detail perkara" onClick={() => { window.location.hash = '#/perkara/' + p.id; }} />
                        <IconBtn icon="pencil" title="Edit perkara" onClick={() => { setEditing(p); setFormOpen(true); }} />
                        {user.role === 'Administrator' && <IconBtn icon="trash-2" tone="danger" title="Hapus perkara" onClick={() => setDelTarget(p)} />}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <EmptyState icon="folder-open" title="Tidak ada perkara yang cocok"
            desc="Ubah kata kunci pencarian atau filter, atau catat perkara baru untuk memulai."
            action={<Button icon="plus" onClick={() => { setEditing(null); setFormOpen(true); }}>Tambah Perkara</Button>} />
        )}
        <Pagination page={cur} pageSize={PS} total={filtered.length} onPage={setPage} />
      </Card>

      <DemoNote>Seluruh data perkara pada halaman ini adalah data contoh (demo) dan tidak merepresentasikan perkara sebenarnya.</DemoNote>

      <PerkaraFormModal open={formOpen} initial={editing} onClose={() => setFormOpen(false)} />
      <ConfirmDialog open={!!delTarget} onClose={() => setDelTarget(null)} onConfirm={confirmDelete}
        title="Hapus Data Perkara?" confirmLabel="Hapus Perkara" confirmDisabled={delLinked > 0}>
        <p>Data perkara <span className="font-semibold text-navy-800">{delTarget?.nomorLP}</span> akan dihapus dari penyimpanan demo dan tidak dapat dibatalkan.</p>
        {delLinked > 0 && (
          <p className="mt-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs font-medium text-amber-800">
            Masih terdapat {delLinked} barang bukti terkait. Hapus atau alihkan barang bukti tersebut terlebih dahulu.
          </p>
        )}
      </ConfirmDialog>
    </div>
  );
}
