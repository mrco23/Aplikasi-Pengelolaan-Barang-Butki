import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, FolderOpen, Pencil, Plus } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { TAHAP, toOptions } from '../../constants';
import { fmtDate } from '../../utils/format';
import { penggunaNama } from '../../utils/selectors';
import {
  Button, Card, DemoNote, EmptyState, IconBtn, Input, Pagination, SearchInput, Select, Table, TahapBadge, paginate,
} from '../../components/ui';
import PerkaraFormModal from '../../components/shared/PerkaraFormModal';

const PS = 8;

export default function PerkaraPage() {
  const { data, lookup } = useApp();
  const navigate = useNavigate();
  const [q, setQ] = useState('');
  const [tahap, setTahap] = useState('');
  const [dari, setDari] = useState('');
  const [sampai, setSampai] = useState('');
  const [page, setPage] = useState(1);
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState(null);

  useEffect(() => { setPage(1); }, [q, tahap, dari, sampai]);

  const bbCount = useMemo(() => {
    const m = {};
    data.barang_bukti.forEach((b) => { m[b.perkara_id] = (m[b.perkara_id] || 0) + 1; });
    return m;
  }, [data.barang_bukti]);

  const filtered = useMemo(() => data.perkara.filter((p) => {
    const s = q.trim().toLowerCase();
    if (s && !(p.nomor_lp.toLowerCase().includes(s) || p.uraian.toLowerCase().includes(s) || penggunaNama(lookup, p.penyidik_id).toLowerCase().includes(s))) return false;
    if (tahap && p.tahap !== tahap) return false;
    if (dari && p.tanggal_laporan < dari) return false;
    if (sampai && p.tanggal_laporan > sampai) return false;
    return true;
  }).sort((a, b) => b.tanggal_laporan.localeCompare(a.tanggal_laporan)), [data.perkara, lookup, q, tahap, dari, sampai]);

  const { cur, rows } = paginate(filtered, page, PS);
  const hasFilter = !!(q || tahap || dari || sampai);
  const reset = () => { setQ(''); setTahap(''); setDari(''); setSampai(''); };
  const openNew = () => { setEditing(null); setFormOpen(true); };

  return (
    <div>
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-1 flex-wrap items-center gap-2">
          <SearchInput className="w-full sm:w-72" placeholder="Cari nomor LP, uraian, atau penyidik…" value={q} onChange={(e) => setQ(e.target.value)} />
          <Select className="w-36" value={tahap} onChange={(e) => setTahap(e.target.value)} placeholder="Semua Tahap" options={toOptions(TAHAP)} />
          <div className="flex items-center gap-1.5">
            <Input type="date" className="w-[150px]" value={dari} onChange={(e) => setDari(e.target.value)} title="Dari tanggal" />
            <span className="text-xs text-slate-400">s/d</span>
            <Input type="date" className="w-[150px]" value={sampai} onChange={(e) => setSampai(e.target.value)} title="Sampai tanggal" />
          </div>
          {hasFilter && <button onClick={reset} className="text-xs font-semibold text-blue-600 hover:underline">Atur ulang</button>}
        </div>
        <Button icon={Plus} onClick={openNew}>Tambah Perkara</Button>
      </div>

      <Card noPad className="mt-4">
        {rows.length ? (
          <Table minWidth={880} head={['Nomor LP', 'Tanggal Laporan', 'Uraian Perkara', 'Tahap', 'Penyidik', { label: 'Jumlah BB', className: 'text-center' }, { label: 'Aksi', className: 'text-right' }]}>
            {rows.map((p) => (
              <tr key={p.id} className="transition hover:bg-slate-50/70">
                <td className="whitespace-nowrap px-5 py-3.5"><Link to={`/petugas/perkara/${p.id}`} className="font-semibold text-navy-800 hover:text-blue-700">{p.nomor_lp}</Link></td>
                <td className="whitespace-nowrap px-4 py-3.5 text-xs tabular-nums text-slate-500">{fmtDate(p.tanggal_laporan)}</td>
                <td className="max-w-[300px] px-4 py-3.5"><span className="line-clamp-2 text-slate-700" title={p.uraian}>{p.uraian}</span></td>
                <td className="px-4 py-3.5"><TahapBadge tahap={p.tahap} /></td>
                <td className="whitespace-nowrap px-4 py-3.5 text-slate-600">{penggunaNama(lookup, p.penyidik_id)}</td>
                <td className="px-4 py-3.5 text-center">
                  <span className="inline-flex h-6 min-w-[26px] items-center justify-center rounded-full bg-slate-100 px-1.5 text-xs font-bold tabular-nums text-slate-600">{bbCount[p.id] || 0}</span>
                </td>
                <td className="px-5 py-3.5">
                  <div className="flex justify-end gap-1.5">
                    <IconBtn icon={Eye} title="Lihat detail perkara" onClick={() => navigate(`/petugas/perkara/${p.id}`)} />
                    <IconBtn icon={Pencil} title="Edit perkara" onClick={() => { setEditing(p); setFormOpen(true); }} />
                  </div>
                </td>
              </tr>
            ))}
          </Table>
        ) : (
          <EmptyState icon={FolderOpen} title="Tidak ada perkara yang cocok"
            desc="Ubah kata kunci pencarian atau filter, atau catat perkara baru untuk memulai."
            action={<Button icon={Plus} onClick={openNew}>Tambah Perkara</Button>} />
        )}
        <Pagination page={cur} pageSize={PS} total={filtered.length} onPage={setPage} />
      </Card>

      <DemoNote>Penghapusan perkara hanya dapat dilakukan oleh Administrator. Seluruh data perkara pada halaman ini adalah data contoh.</DemoNote>

      <PerkaraFormModal open={formOpen} initial={editing} onClose={() => setFormOpen(false)} />
    </div>
  );
}
