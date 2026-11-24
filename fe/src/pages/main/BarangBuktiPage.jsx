import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Eye, History, Package, Pencil, Plus, RotateCcw } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { useBase } from '../../utils/routes';
import { KONDISI, STATUS_BB, TAHAP, toOptions } from '../../constants';
import { fmtDate } from '../../utils/format';
import { kategoriNama, kategoriOptions, lokasiNama } from '../../utils/selectors';
import {
  Badge, Button, ButtonLink, Card, CondDot, DemoNote, EmptyState, IconBtn, Pagination, SearchInput, Select, StatusBadge, Table, paginate,
} from '../../components/ui';

const PS = 8;
const FILTER_KEYS = ['q', 'kategori', 'status', 'kondisi', 'tahap'];

export default function BarangBuktiPage() {
  const base = useBase();
  const { data, lookup } = useApp();
  const navigate = useNavigate();
  const [params, setParams] = useSearchParams();
  const [page, setPage] = useState(1);

  /* Filter disimpan di URL agar bisa dibagikan / ditautkan dari dashboard */
  const f = Object.fromEntries(FILTER_KEYS.map((k) => [k, params.get(k) || '']));
  const setFilter = (k, v) => {
    const next = new URLSearchParams(params);
    if (v) next.set(k, v); else next.delete(k);
    setParams(next, { replace: true });
  };
  const reset = () => setParams({}, { replace: true });
  useEffect(() => { setPage(1); }, [params]);

  const filtered = useMemo(() => data.barang_bukti.filter((b) => {
    const s = f.q.trim().toLowerCase();
    if (s && !(b.kode.toLowerCase().includes(s) || b.nama.toLowerCase().includes(s)
      || (lookup.perkara[b.perkara_id]?.nomor_lp || '').toLowerCase().includes(s)
      || lokasiNama(lookup, b.lokasi_id).toLowerCase().includes(s) || (b.nomor_seri || '').toLowerCase().includes(s))) return false;
    if (f.kategori && String(b.kategori_id) !== f.kategori) return false;
    if (f.status && (b.is_draf || b.status !== f.status)) return false;
    if (f.kondisi && b.kondisi !== f.kondisi) return false;
    if (f.tahap && lookup.perkara[b.perkara_id]?.tahap !== f.tahap) return false;
    return true;
  }).sort((a, b) => a.kode.localeCompare(b.kode)), [data.barang_bukti, lookup, params]); // eslint-disable-line react-hooks/exhaustive-deps

  const { cur, rows } = paginate(filtered, page, PS);
  const hasFilter = FILTER_KEYS.some((k) => f[k]);

  return (
    <div>
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-1 flex-wrap items-center gap-2">
          <SearchInput className="w-full sm:w-72" placeholder="Cari kode, nama, nomor seri, atau nomor LP…" value={f.q} onChange={(e) => setFilter('q', e.target.value)} />
          <Select className="w-44" value={f.kategori} onChange={(e) => setFilter('kategori', e.target.value)} placeholder="Semua Kategori" options={kategoriOptions(data)} />
          <Select className="w-44" value={f.status} onChange={(e) => setFilter('status', e.target.value)} placeholder="Semua Status" options={toOptions(STATUS_BB)} />
          <Select className="w-40" value={f.kondisi} onChange={(e) => setFilter('kondisi', e.target.value)} placeholder="Semua Kondisi" options={toOptions(KONDISI)} />
          <Select className="w-36" value={f.tahap} onChange={(e) => setFilter('tahap', e.target.value)} placeholder="Semua Tahap" options={toOptions(TAHAP)} />
          {hasFilter && <button onClick={reset} className="text-xs font-semibold text-blue-600 hover:underline">Atur ulang</button>}
        </div>
        <ButtonLink to={`${base}/barang-bukti/baru`} icon={Plus}>Tambah Barang Bukti</ButtonLink>
      </div>

      <Card noPad className="mt-4">
        {rows.length ? (
          <Table minWidth={1060} head={['Kode BB', 'Nama Barang Bukti', 'Kategori', 'Nomor LP', 'Tgl Terima', 'Kondisi', 'Lokasi Penyimpanan', 'Status', { label: 'Aksi', className: 'text-right' }]}>
            {rows.map((b) => {
              const pk = lookup.perkara[b.perkara_id];
              return (
                <tr key={b.id} className="transition hover:bg-slate-50/70">
                  <td className="whitespace-nowrap px-5 py-3.5">
                    <Link to={`${base}/barang-bukti/${b.id}`} className="text-xs font-bold text-navy-800 hover:text-blue-700">{b.kode}</Link>
                  </td>
                  <td className="max-w-[220px] px-4 py-3.5"><span className="block truncate text-slate-700" title={b.nama}>{b.nama}</span></td>
                  <td className="whitespace-nowrap px-4 py-3.5 text-xs text-slate-500">{kategoriNama(lookup, b.kategori_id)}</td>
                  <td className="whitespace-nowrap px-4 py-3.5 text-xs">
                    {pk ? <Link to={`${base}/perkara/${pk.id}`} className="text-slate-600 hover:text-blue-700">{pk.nomor_lp}</Link> : <span className="text-slate-400">—</span>}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3.5 text-xs tabular-nums text-slate-500">{fmtDate(b.tanggal_penerimaan)}</td>
                  <td className="px-4 py-3.5"><CondDot kondisi={b.kondisi} /></td>
                  <td className="max-w-[190px] px-4 py-3.5"><span className="block truncate text-xs text-slate-600" title={lokasiNama(lookup, b.lokasi_id)}>{lokasiNama(lookup, b.lokasi_id)}</span></td>
                  <td className="px-4 py-3.5">{b.is_draf ? <Badge tone="draf">Draf</Badge> : <StatusBadge status={b.status} />}</td>
                  <td className="px-5 py-3.5">
                    <div className="flex justify-end gap-1.5">
                      <IconBtn icon={Eye} title="Lihat detail" onClick={() => navigate(`${base}/barang-bukti/${b.id}`)} />
                      <IconBtn icon={Pencil} title="Edit barang bukti" onClick={() => navigate(`${base}/barang-bukti/${b.id}/edit`)} />
                      <IconBtn icon={History} title="Lihat riwayat" onClick={() => navigate(`${base}/barang-bukti/${b.id}?tab=riwayat`)} />
                    </div>
                  </td>
                </tr>
              );
            })}
          </Table>
        ) : (
          <EmptyState icon={Package} title="Tidak ada data yang cocok"
            desc="Tidak ditemukan barang bukti sesuai kata kunci atau filter yang dipilih."
            action={hasFilter && <Button variant="secondary" icon={RotateCcw} onClick={reset}>Atur Ulang Filter</Button>} />
        )}
        <Pagination page={cur} pageSize={PS} total={filtered.length} onPage={setPage} />
      </Card>

      <DemoNote>Contoh data memuat perangkat elektronik dan media penyimpanan digital fiktif, tanpa data pribadi maupun data perkara sebenarnya.</DemoNote>
    </div>
  );
}
