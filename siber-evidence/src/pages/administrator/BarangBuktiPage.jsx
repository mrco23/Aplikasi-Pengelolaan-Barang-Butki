import React, { useState, useEffect, useMemo } from 'react';
import { useApp } from '../../../context/AppContext';
import { SearchInput, Select, Button, Card, Badge, IconBtn, EmptyState, Pagination, CondDot, ConfirmDialog, DemoNote, ButtonLink } from '../../../components/common/UI';
import { fmtDate, KATEGORI, STATUS_BB, KONDISI } from '../../../utils/helpers';

export default function BarangBuktiPage({ query }) {
  const { data, user, deleteBarang, toast } = useApp();
  const sq = query.get('q') || '';
  const ss = query.get('status') || '';
  const [q, setQ] = useState(sq);
  const [kat, setKat] = useState('');
  const [status, setStatus] = useState(ss);
  const [page, setPage] = useState(1);
  const PS = 10;
  const [delTarget, setDelTarget] = useState(null);

  useEffect(() => { setPage(1); }, [q, kat, status]);

  const filtered = useMemo(() => data.barang.filter((b) => {
    if (b.draf) return false;
    const s = q.trim().toLowerCase();
    if (s && !(b.kode.toLowerCase().includes(s) || b.nama.toLowerCase().includes(s) || b.nomorLP.toLowerCase().includes(s) || (b.nomorSeri || '').toLowerCase().includes(s))) return false;
    if (kat && b.kategori !== kat) return false;
    if (status && b.status !== status) return false;
    return true;
  }).sort((a, b) => b.kode.localeCompare(a.kode)), [data.barang, q, kat, status]);

  const pages = Math.max(1, Math.ceil(filtered.length / PS));
  const cur = Math.min(page, pages);
  const paged = filtered.slice((cur - 1) * PS, cur * PS);
  const hasFilter = !!(q || kat || status);

  function confirmDelete() {
    if (!delTarget) return;
    const r = deleteBarang(delTarget.id);
    if (r.ok) toast('success', 'Barang bukti dihapus', delTarget.kode + ' beserta riwayatnya telah dihapus.');
    else toast('error', 'Gagal menghapus', r.msg);
    setDelTarget(null);
  }

  return (
    <div>
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-1 flex-wrap items-center gap-2">
          <SearchInput className="w-full sm:w-72" placeholder="Cari kode, nama, no seri, atau LP…" value={q} onChange={(e) => setQ(e.target.value)} />
          <Select className="w-40" value={kat} onChange={(e) => setKat(e.target.value)} options={[['', 'Semua Kategori'], ...KATEGORI.map(x => [x, x])]} />
          <Select className="w-40" value={status} onChange={(e) => setStatus(e.target.value)} options={[['', 'Semua Status'], ...STATUS_BB.map(x => [x, x])]} />
          {hasFilter && (
            <button onClick={() => { setQ(''); setKat(''); setStatus(''); }} className="text-xs font-semibold text-blue-600 hover:underline">
              Atur ulang
            </button>
          )}
        </div>
        <div className="flex gap-2">
          <ButtonLink variant="secondary" to="/barang-bukti/baru?draf=1" icon="file-text" className="hidden sm:inline-flex">Draf Tersimpan</ButtonLink>
          <ButtonLink to="/barang-bukti/baru" icon="plus">Daftarkan Barang</ButtonLink>
        </div>
      </div>

      <Card noPad className="mt-4">
        {paged.length ? (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[960px] text-left text-sm">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/80 text-[11px] uppercase tracking-wide text-slate-500">
                  <th className="px-5 py-3 font-semibold">Kode & LP</th>
                  <th className="px-4 py-3 font-semibold">Nama Barang Bukti</th>
                  <th className="px-4 py-3 font-semibold">Kategori & Kondisi</th>
                  <th className="px-4 py-3 font-semibold">Tanggal Terima</th>
                  <th className="px-4 py-3 font-semibold">Status & Lokasi</th>
                  <th className="px-5 py-3 text-right font-semibold">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {paged.map((b) => (
                  <tr key={b.id} className="transition hover:bg-slate-50/70">
                    <td className="px-5 py-3">
                      <a href={'#/barang-bukti/' + b.id} className="block text-xs font-bold text-navy-800 hover:text-blue-700">{b.kode}</a>
                      <a href={'#/perkara/' + (data.perkara.find(p => p.nomorLP === b.nomorLP)?.id || '')} className="mt-0.5 block truncate text-[11px] text-slate-500 hover:text-blue-600 hover:underline">{b.nomorLP}</a>
                    </td>
                    <td className="max-w-[220px] px-4 py-3">
                      <span className="block truncate font-medium text-slate-700" title={b.nama}>{b.nama}</span>
                      {b.nomorSeri && <span className="mt-0.5 block truncate text-[10px] text-slate-400">SN: {b.nomorSeri}</span>}
                    </td>
                    <td className="px-4 py-3">
                      <span className="block truncate text-xs text-slate-600">{b.kategori}</span>
                      <div className="mt-1"><CondDot kondisi={b.kondisi} /></div>
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-xs tabular-nums text-slate-500">{fmtDate(b.tanggalPenerimaan)}</td>
                    <td className="max-w-[200px] px-4 py-3">
                      <Badge>{b.status}</Badge>
                      <span className="mt-1 block truncate text-[11px] text-slate-500" title={b.lokasi}>{b.lokasi}</span>
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex justify-end gap-1.5">
                        <IconBtn icon="eye" title="Lihat detail" onClick={() => { window.location.hash = '#/barang-bukti/' + b.id; }} />
                        <IconBtn icon="pencil" title="Edit data" onClick={() => { window.location.hash = `#/barang-bukti/${b.id}/edit`; }} />
                        {user.role === 'Administrator' && <IconBtn icon="trash-2" tone="danger" title="Hapus" onClick={() => setDelTarget(b)} />}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <EmptyState icon="archive" title="Tidak ada barang bukti ditemukan"
            desc="Ubah kata kunci atau filter pencarian, atau daftarkan barang bukti baru."
            action={<ButtonLink to="/barang-bukti/baru" icon="plus">Daftarkan Barang</ButtonLink>} />
        )}
        <Pagination page={cur} pageSize={PS} total={filtered.length} onPage={setPage} />
      </Card>

      <DemoNote>Data di atas dimuat dari memori lokal (demo). Gambar atau lampiran tidak disimpan persisten pada versi demo.</DemoNote>

      <ConfirmDialog open={!!delTarget} onClose={() => setDelTarget(null)} onConfirm={confirmDelete}
        title="Hapus Barang Bukti?">
        <p>Data barang bukti <span className="font-semibold text-navy-800">{delTarget?.kode}</span> beserta seluruh riwayat perpindahannya akan dihapus dari data demo. Aksi ini tidak dapat dibatalkan.</p>
      </ConfirmDialog>
    </div>
  );
}
