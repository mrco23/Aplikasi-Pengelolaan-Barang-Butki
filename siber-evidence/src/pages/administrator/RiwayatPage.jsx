import React, { useState, useMemo } from 'react';
import { useApp } from '../../../context/AppContext';
import { SearchInput, Select, Input, Card, Timeline, EmptyState, Pagination } from '../../../components/common/UI';
import { JENIS_RIWAYAT } from '../../../utils/helpers';

export default function RiwayatPage({ query }) {
  const { data } = useApp();
  const qKode = query.get('kode') || '';
  const [q, setQ] = useState(qKode);
  const [jenis, setJenis] = useState('');
  const [dari, setDari] = useState('');
  const [sampai, setSampai] = useState('');
  const [page, setPage] = useState(1);
  const PS = 12;

  const filtered = useMemo(() => data.riwayat.filter((r) => {
    const s = q.trim().toLowerCase();
    if (s && !(r.kodeBB.toLowerCase().includes(s) || r.petugas.toLowerCase().includes(s) || (r.lokasiAsal + r.lokasiTujuan).toLowerCase().includes(s))) return false;
    if (jenis && r.jenis !== jenis) return false;
    if (dari && r.tanggalWaktu.slice(0, 10) < dari) return false;
    if (sampai && r.tanggalWaktu.slice(0, 10) > sampai) return false;
    return true;
  }).sort((a, b) => b.tanggalWaktu.localeCompare(a.tanggalWaktu)), [data.riwayat, q, jenis, dari, sampai]);

  const pages = Math.max(1, Math.ceil(filtered.length / PS));
  const cur = Math.min(page, pages);
  const paged = filtered.slice((cur - 1) * PS, cur * PS);
  const hasFilter = !!(q || jenis || dari || sampai);

  return (
    <div>
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-1 flex-wrap items-center gap-2">
          <SearchInput className="w-full sm:w-72" placeholder="Cari kode BB, lokasi, atau petugas…" value={q} onChange={(e) => setQ(e.target.value)} />
          <Select className="w-40" value={jenis} onChange={(e) => setJenis(e.target.value)} options={[['', 'Semua Pergerakan'], ...JENIS_RIWAYAT.map(x => [x, x])]} />
          <div className="flex items-center gap-1.5">
            <Input type="date" className="w-[150px]" value={dari} onChange={(e) => setDari(e.target.value)} title="Dari tanggal" />
            <span className="text-xs text-slate-400">s/d</span>
            <Input type="date" className="w-[150px]" value={sampai} onChange={(e) => setSampai(e.target.value)} title="Sampai tanggal" />
          </div>
          {hasFilter && (
            <button onClick={() => { setQ(''); setJenis(''); setDari(''); setSampai(''); }} className="text-xs font-semibold text-blue-600 hover:underline">
              Atur ulang
            </button>
          )}
        </div>
      </div>

      <Card noPad className="mt-4">
        <div className="p-5">
          {paged.length ? <Timeline items={paged} /> : (
            <EmptyState icon="history" title="Tidak ada riwayat pergerakan"
              desc="Ubah filter pencarian Anda untuk melihat jejak perpindahan barang bukti lainnya." />
          )}
        </div>
        <Pagination page={cur} pageSize={PS} total={filtered.length} onPage={setPage} />
      </Card>
    </div>
  );
}
