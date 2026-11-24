import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Calendar, Eye, Package, Pencil, Plus, Trash2, User } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { useBase, useIsAdmin } from '../../utils/routes';
import { STATUS_BB } from '../../constants';
import { fmtDate } from '../../utils/format';
import { kategoriNama, penggunaNama } from '../../utils/selectors';
import {
  Badge, Button, ButtonLink, Card, Chip, CondDot, DemoNote, EmptyState, IconBtn, InfoGrid, StatusBadge, Table, TahapBadge,
} from '../../components/ui';
import PerkaraFormModal from '../../components/shared/PerkaraFormModal';
import { DeletePerkaraDialog } from '../../components/shared/DeleteDialogs';
import NotFoundPage from '../common/NotFoundPage';

export default function PerkaraDetailPage() {
  const base = useBase();
  const isAdmin = useIsAdmin();
  const [delOpen, setDelOpen] = useState(false);
  const { id } = useParams();
  const { data, lookup } = useApp();
  const navigate = useNavigate();
  const [editOpen, setEditOpen] = useState(false);
  const p = lookup.perkara[Number(id)];
  if (!p) return <NotFoundPage message="Data perkara tidak ditemukan." />;

  const bb = data.barang_bukti.filter((b) => b.perkara_id === p.id);
  const count = (s) => bb.filter((b) => !b.is_draf && b.status === s).length;
  const addLink = `${base}/barang-bukti/baru?perkara=${p.id}`;

  return (
    <div className="space-y-5">
      <Link to={`${base}/perkara`} className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 transition hover:text-blue-700">
        <ArrowLeft size={14} />Kembali ke Data Perkara
      </Link>

      <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-card">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-lg font-bold text-navy-800">{p.nomor_lp}</h2>
              <TahapBadge tahap={p.tahap} />
            </div>
            <p className="mt-1.5 max-w-2xl text-sm leading-relaxed text-slate-600">{p.uraian}</p>
            <div className="mt-3 flex flex-wrap gap-2 text-xs">
              <Chip icon={Calendar}>Lapor: {fmtDate(p.tanggal_laporan)}</Chip>
              <Chip icon={User}>{penggunaNama(lookup, p.penyidik_id)}</Chip>
              <Chip icon={Package}>{bb.length} barang bukti</Chip>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button variant="secondary" icon={Pencil} onClick={() => setEditOpen(true)}>Edit</Button>
            {isAdmin && <Button variant="secondary" icon={Trash2} className="hover:!border-red-200 hover:!bg-red-50 hover:!text-red-600" onClick={() => setDelOpen(true)}>Hapus</Button>}
            <ButtonLink to={addLink} icon={Plus}>Daftarkan Barang Bukti</ButtonLink>
          </div>
        </div>
      </div>

      <div className="grid gap-5 lg:grid-cols-3">
        <div className="space-y-5 lg:col-span-2">
          <Card title="Informasi Umum Perkara">
            <InfoGrid rows={[
              { l: 'Nomor Laporan Polisi', v: p.nomor_lp },
              { l: 'Tanggal Laporan', v: fmtDate(p.tanggal_laporan) },
              { l: 'Tahap Penanganan', v: <TahapBadge tahap={p.tahap} /> },
              { l: 'Penyidik', v: penggunaNama(lookup, p.penyidik_id) },
              { l: 'Uraian Singkat', v: p.uraian, wide: true },
              { l: 'Dicatat oleh', v: penggunaNama(lookup, p.created_by) },
              { l: 'Terakhir diperbarui', v: fmtDate(p.updated_at) },
            ]} />
          </Card>

          <Card noPad title="Barang Bukti Terkait" desc="Barang bukti yang terhubung dengan nomor LP ini.">
            {bb.length ? (
              <Table minWidth={720} head={['Kode', 'Nama', 'Kategori', 'Diterima', 'Kondisi', 'Status', { label: 'Aksi', className: 'text-right' }]}>
                {bb.map((b) => (
                  <tr key={b.id} className="transition hover:bg-slate-50/70">
                    <td className="whitespace-nowrap px-5 py-3">
                      <Link to={`${base}/barang-bukti/${b.id}`} className="text-xs font-bold text-navy-800 hover:text-blue-700">{b.kode}</Link>
                    </td>
                    <td className="max-w-[220px] truncate px-4 py-3 text-slate-700">{b.nama}</td>
                    <td className="whitespace-nowrap px-4 py-3 text-xs text-slate-500">{kategoriNama(lookup, b.kategori_id)}</td>
                    <td className="whitespace-nowrap px-4 py-3 text-xs tabular-nums text-slate-500">{fmtDate(b.tanggal_penerimaan)}</td>
                    <td className="px-4 py-3"><CondDot kondisi={b.kondisi} /></td>
                    <td className="px-4 py-3">{b.is_draf ? <Badge tone="draf">Draf</Badge> : <StatusBadge status={b.status} />}</td>
                    <td className="px-5 py-3 text-right"><IconBtn icon={Eye} title="Lihat detail" onClick={() => navigate(`${base}/barang-bukti/${b.id}`)} /></td>
                  </tr>
                ))}
              </Table>
            ) : (
              <EmptyState icon={Package} title="Belum ada barang bukti"
                desc="Belum terdapat barang bukti yang terdaftar untuk perkara ini."
                action={<ButtonLink to={addLink} icon={Plus}>Daftarkan Barang Bukti</ButtonLink>} />
            )}
          </Card>
        </div>

        <Card title="Ringkasan Barang Bukti" desc="Status tersimpan untuk perkara ini.">
          <p className="text-3xl font-extrabold tabular-nums text-navy-800">{bb.length}</p>
          <p className="mt-0.5 text-xs text-slate-500">total barang bukti terdaftar</p>
          <ul className="mt-4 space-y-2">
            {Object.keys(STATUS_BB).map((s) => (
              <li key={s} className="flex items-center justify-between rounded-lg border border-slate-100 px-3 py-2 text-xs">
                <StatusBadge status={s} />
                <span className="font-bold tabular-nums text-navy-800">{count(s)}</span>
              </li>
            ))}
          </ul>
          <DemoNote>Perkara yang masih memiliki barang bukti tidak dapat dihapus. Penghapusan hanya oleh Administrator.</DemoNote>
        </Card>
      </div>

      <PerkaraFormModal open={editOpen} initial={p} onClose={() => setEditOpen(false)} />
      <DeletePerkaraDialog target={delOpen ? p : null} onClose={() => setDelOpen(false)} onDeleted={() => navigate(`${base}/perkara`)} />
    </div>
  );
}
