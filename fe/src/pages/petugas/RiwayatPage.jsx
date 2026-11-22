import { useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { ArrowRightLeft, History, RotateCcw } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { JENIS_RIWAYAT, toOptions } from '../../constants';
import { fmtDateTime } from '../../utils/format';
import { lokasiNama, penggunaNama, sortByTimeDesc } from '../../utils/selectors';
import {
  Alert, Button, Card, DemoNote, EmptyState, Input, Pagination, SearchInput, Select, Table, paginate,
} from '../../components/ui';
import { JenisBadge, LoanInfo } from '../../components/shared/Timeline';
import MovementModal from '../../components/shared/MovementModal';

const PS = 10;

export default function RiwayatPage() {
  const { data, lookup } = useApp();
  const [params, setParams] = useSearchParams();
  const [q, setQ] = useState('');
  const [jenis, setJenis] = useState('');
  const [dari, setDari] = useState('');
  const [sampai, setSampai] = useState('');
  const [page, setPage] = useState(1);
  const [moveOpen, setMoveOpen] = useState(false);
  const barang = params.get('barang') || '';
  const setBarang = (v) => setParams(v ? { barang: v } : {}, { replace: true });

  useEffect(() => { setPage(1); }, [q, jenis, barang, dari, sampai]);

  const barangOpts = useMemo(() => [...data.barang_bukti].filter((b) => !b.is_draf)
    .sort((a, b) => a.kode.localeCompare(b.kode)).map((b) => [String(b.id), b.kode]), [data.barang_bukti]);

  const filtered = useMemo(() => data.riwayat_barang_bukti.filter((r) => {
    const s = q.trim().toLowerCase();
    const kode = lookup.barang[r.barang_bukti_id]?.kode || '';
    if (s && ![kode, penggunaNama(lookup, r.petugas_id), r.alasan, lokasiNama(lookup, r.lokasi_asal_id), lokasiNama(lookup, r.lokasi_tujuan_id), r.catatan || '']
      .some((x) => x.toLowerCase().includes(s))) return false;
    if (jenis && r.jenis !== jenis) return false;
    if (barang && String(r.barang_bukti_id) !== barang) return false;
    const d = r.tanggal_waktu.slice(0, 10);
    if (dari && d < dari) return false;
    if (sampai && d > sampai) return false;
    return true;
  }).sort(sortByTimeDesc), [data.riwayat_barang_bukti, lookup, q, jenis, barang, dari, sampai]);

  const { cur, rows } = paginate(filtered, page, PS);
  const hasFilter = !!(q || jenis || barang || dari || sampai);
  const reset = () => { setQ(''); setJenis(''); setBarang(''); setDari(''); setSampai(''); };

  return (
    <div>
      <Alert tone="blue" className="mb-5">
        <span className="font-bold">Catatan:</span> Riwayat bersifat tambah-saja (append-only). Entri lama tidak pernah diubah —
        setiap perpindahan, peminjaman, atau pengembalian dicatat sebagai kejadian baru.
      </Alert>

      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-1 flex-wrap items-center gap-2">
          <SearchInput className="w-full sm:w-64" placeholder="Cari kode, petugas, alasan…" value={q} onChange={(e) => setQ(e.target.value)} />
          <Select className="w-40" value={jenis} onChange={(e) => setJenis(e.target.value)} placeholder="Semua Jenis" options={toOptions(JENIS_RIWAYAT)} />
          <Select className="w-44" value={barang} onChange={(e) => setBarang(e.target.value)} placeholder="Semua Kode BB" options={barangOpts} />
          <div className="flex items-center gap-1.5">
            <Input type="date" className="w-[150px]" value={dari} onChange={(e) => setDari(e.target.value)} title="Dari tanggal" />
            <span className="text-xs text-slate-400">s/d</span>
            <Input type="date" className="w-[150px]" value={sampai} onChange={(e) => setSampai(e.target.value)} title="Sampai tanggal" />
          </div>
          {hasFilter && <button onClick={reset} className="text-xs font-semibold text-blue-600 hover:underline">Atur ulang</button>}
        </div>
        <Button icon={ArrowRightLeft} onClick={() => setMoveOpen(true)}>Catat Perpindahan / Peminjaman</Button>
      </div>

      <Card noPad className="mt-4">
        {rows.length ? (
          <Table minWidth={1120} head={['Tanggal & Waktu', 'Kode BB', 'Jenis Aktivitas', 'Lokasi Asal', 'Lokasi Tujuan', 'Petugas', 'Alasan', 'Catatan']}>
            {rows.map((r) => {
              const b = lookup.barang[r.barang_bukti_id];
              return (
                <tr key={r.id} className="align-top transition hover:bg-slate-50/70">
                  <td className="whitespace-nowrap px-5 py-3.5 text-xs tabular-nums text-slate-500">{fmtDateTime(r.tanggal_waktu)}</td>
                  <td className="whitespace-nowrap px-4 py-3.5">
                    {b ? <Link to={`/petugas/barang-bukti/${b.id}`} className="text-xs font-bold text-navy-800 hover:text-blue-700">{b.kode}</Link> : '—'}
                  </td>
                  <td className="px-4 py-3.5"><JenisBadge jenis={r.jenis} /><LoanInfo r={r} prefix="kembali" /></td>
                  <td className="max-w-[170px] px-4 py-3.5"><span className="block truncate text-xs text-slate-600" title={lokasiNama(lookup, r.lokasi_asal_id)}>{lokasiNama(lookup, r.lokasi_asal_id)}</span></td>
                  <td className="max-w-[170px] px-4 py-3.5"><span className="block truncate text-xs font-medium text-navy-800" title={lokasiNama(lookup, r.lokasi_tujuan_id)}>{lokasiNama(lookup, r.lokasi_tujuan_id)}</span></td>
                  <td className="whitespace-nowrap px-4 py-3.5 text-xs text-slate-600">{penggunaNama(lookup, r.petugas_id)}</td>
                  <td className="max-w-[200px] px-4 py-3.5"><span className="block truncate text-xs text-slate-600" title={r.alasan}>{r.alasan}</span></td>
                  <td className="max-w-[200px] px-5 py-3.5"><span className="block truncate text-xs text-slate-400" title={r.catatan}>{r.catatan || '—'}</span></td>
                </tr>
              );
            })}
          </Table>
        ) : (
          <EmptyState icon={History} title="Tidak ada kejadian yang cocok"
            desc="Belum terdapat riwayat perpindahan sesuai filter. Rekam kejadian baru melalui tombol Catat Perpindahan."
            action={hasFilter && <Button variant="secondary" icon={RotateCcw} onClick={reset}>Atur Ulang Filter</Button>} />
        )}
        <Pagination page={cur} pageSize={PS} total={filtered.length} onPage={setPage} />
      </Card>

      <DemoNote>Riwayat ini adalah log administratif; tidak menegakkan integritas forensik maupun kelayakan hukum barang bukti secara mandiri.</DemoNote>

      <MovementModal open={moveOpen} onClose={() => setMoveOpen(false)} fixedBarangId={undefined} />
    </div>
  );
}
