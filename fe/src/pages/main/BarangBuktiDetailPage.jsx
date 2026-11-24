import { useMemo, useState } from 'react';
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import {
  ArrowLeft, ArrowRightLeft, Briefcase, Calendar, ExternalLink, FileText, FolderOpen, History, Image, MapPin,
  Package, Paperclip, Pencil, Printer,
  Trash2, Download,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { useBase, useIsAdmin } from '../../utils/routes';
import { KATEGORI_ICON } from '../../constants';
import { fmtBytes, fmtDate, fmtDateTime } from '../../utils/format';
import { kategoriNama, lokasiNama, penggunaNama, sortByTimeDesc } from '../../utils/selectors';
import {
  Alert, Badge, Button, ButtonLink, Card, Chip, CondDot, DemoNote, EmptyState, IconBtn, InfoGrid, StatusBadge, Tabs, TahapBadge,
} from '../../components/ui';
import { DeleteBarangDialog } from '../../components/shared/DeleteDialogs';
import Timeline from '../../components/shared/Timeline';
import MovementModal from '../../components/shared/MovementModal';
import PrintHeader from '../../components/shared/PrintHeader';
import NotFoundPage from '../common/NotFoundPage';

export default function BarangBuktiDetailPage() {
  const base = useBase();
  const isAdmin = useIsAdmin();
  const [delOpen, setDelOpen] = useState(false);
  const { id } = useParams();
  const [params, setParams] = useSearchParams();
  const navigate = useNavigate();
  const { data, lookup, deleteLampiran, lampiranUrl, toast } = useApp();

  async function openLampiran(l) {
    const r = await lampiranUrl(l.id);
    if (r.ok) window.open(r.data, '_blank', 'noopener');
    else toast('error', 'Berkas tidak dapat dibuka', r.msg);
  }
  async function removeLampiran(l) {
    const r = await deleteLampiran(l.id);
    if (r.ok) toast('success', 'Lampiran dihapus', l.nama_file);
    else toast('error', 'Gagal menghapus lampiran', r.msg);
  }
  const [moveOpen, setMoveOpen] = useState(false);
  const b = lookup.barang[Number(id)];

  const rvList = useMemo(() => (b ? data.riwayat_barang_bukti.filter((r) => r.barang_bukti_id === b.id).sort(sortByTimeDesc) : []), [data.riwayat_barang_bukti, b]);
  const lamp = b ? data.lampiran.filter((l) => l.barang_bukti_id === b.id) : [];

  if (!b) return <NotFoundPage message="Data barang bukti tidak ditemukan." />;

  const tab = params.get('tab') || 'informasi';
  const setTab = (t) => setParams(t === 'informasi' ? {} : { tab: t }, { replace: true });
  const p = lookup.perkara[b.perkara_id];
  const kat = lookup.kategori[b.kategori_id];
  const KatIcon = KATEGORI_ICON[kat?.kode] || Package;
  const canMove = !b.is_draf && b.status !== 'dihancurkan';
  const canEdit = b.status !== 'dihancurkan';

  return (
    <div className="space-y-5">
      <PrintHeader subtitle={`Lembar Detail Barang Bukti — ${b.kode}`} />

      <Link to={`${base}/barang-bukti`} className="no-print inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 transition hover:text-blue-700">
        <ArrowLeft size={14} />Kembali ke Data Barang Bukti
      </Link>

      {b.is_draf && (
        <Alert tone="blue" className="no-print">
          <span className="font-bold">Barang bukti ini masih berupa draf.</span> Lengkapi data lalu klik <b>Simpan &amp; Daftarkan</b> pada formulir edit agar kejadian Penerimaan tercatat.
        </Alert>
      )}

      <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-card">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-xl font-bold text-navy-800">{b.kode}</h2>
              {b.is_draf ? <Badge tone="draf">Draf</Badge> : <StatusBadge status={b.status} />}
            </div>
            <p className="mt-0.5 text-sm font-medium text-slate-600">{b.nama}</p>
            <div className="mt-3 flex flex-wrap gap-2 text-xs">
              <Chip icon={KatIcon}>{kat?.nama}</Chip>
              <Chip icon={MapPin}>{lokasiNama(lookup, b.lokasi_id)}</Chip>
              <Chip icon={Calendar}>Diterima {fmtDate(b.tanggal_penerimaan)}</Chip>
            </div>
          </div>
          <div className="no-print flex flex-wrap items-center gap-2">
            {canMove && <Button icon={ArrowRightLeft} onClick={() => setMoveOpen(true)}>Catat Perpindahan</Button>}
            <Button variant="secondary" icon={Printer} onClick={() => window.print()}>Cetak</Button>
            {canEdit && <IconBtn icon={Pencil} title="Edit barang bukti" onClick={() => navigate(`${base}/barang-bukti/${b.id}/edit`)} />}
            {isAdmin && <IconBtn icon={Trash2} tone="danger" title="Hapus barang bukti" onClick={() => setDelOpen(true)} />}
          </div>
        </div>
      </div>

      <div className="no-print">
        <Tabs active={tab} onChange={setTab} tabs={[
          { key: 'informasi', label: 'Informasi Umum', icon: Package },
          { key: 'perkara', label: 'Perkara', icon: Briefcase },
          { key: 'riwayat', label: 'Riwayat', icon: History, count: rvList.length },
          { key: 'dokumen', label: 'Dokumen', icon: Paperclip, count: lamp.length },
        ]} />
      </div>

      {tab === 'informasi' && (
        <Card title="Informasi Umum" desc="Identitas, kondisi, dan penyimpanan barang bukti.">
          <InfoGrid rows={[
            { l: 'Kode Barang Bukti', v: b.kode },
            { l: 'Nama Barang Bukti', v: b.nama },
            { l: 'Kategori', v: kategoriNama(lookup, b.kategori_id) },
            { l: 'Nomor Seri / IMEI', v: b.nomor_seri },
            { l: 'Kondisi Fisik', v: <CondDot kondisi={b.kondisi} /> },
            { l: 'Status', v: b.is_draf ? <Badge tone="draf">Draf</Badge> : <StatusBadge status={b.status} /> },
            { l: 'Lokasi Penyimpanan', v: lokasiNama(lookup, b.lokasi_id) },
            { l: 'Tanggal Penerimaan', v: fmtDate(b.tanggal_penerimaan) },
            { l: 'Deskripsi', v: b.deskripsi, wide: true },
            { l: 'Catatan Penyimpanan', v: b.catatan, wide: true },
            { l: 'Dicatat oleh', v: penggunaNama(lookup, b.created_by) },
            { l: 'Terakhir diperbarui', v: fmtDateTime(b.updated_at) },
          ]} />
        </Card>
      )}

      {tab === 'perkara' && (
        <Card title="Perkara Terkait" desc="Kaitan barang bukti dengan laporan polisi dan petugas penerima.">
          {p ? (
            <div className="grid gap-5 lg:grid-cols-2">
              <div className="rounded-lg border border-slate-200 p-4">
                <p className="mb-3 text-[11px] font-bold uppercase tracking-wide text-slate-400">Informasi Perkara</p>
                <InfoGrid rows={[
                  { l: 'Nomor LP', v: <Link to={`${base}/perkara/${p.id}`} className="font-semibold text-blue-700 hover:underline">{p.nomor_lp}</Link> },
                  { l: 'Tanggal Laporan', v: fmtDate(p.tanggal_laporan) },
                  { l: 'Tahap Penanganan', v: <TahapBadge tahap={p.tahap} /> },
                  { l: 'Penyidik', v: penggunaNama(lookup, p.penyidik_id) },
                ]} />
                <ButtonLink to={`${base}/perkara/${p.id}`} variant="secondary" size="sm" icon={ExternalLink} className="mt-4">Buka Detail Perkara</ButtonLink>
              </div>
              <div className="rounded-lg border border-slate-200 p-4">
                <p className="mb-3 text-[11px] font-bold uppercase tracking-wide text-slate-400">Penerimaan Barang</p>
                <InfoGrid rows={[
                  { l: 'Tanggal Penerimaan', v: fmtDate(b.tanggal_penerimaan) },
                  { l: 'Petugas Penerima', v: penggunaNama(lookup, b.petugas_penerima_id) },
                  { l: 'Lokasi Saat Ini', v: lokasiNama(lookup, b.lokasi_id) },
                  { l: 'Status', v: b.is_draf ? <Badge tone="draf">Draf</Badge> : <StatusBadge status={b.status} /> },
                ]} />
              </div>
            </div>
          ) : (
            <EmptyState icon={Briefcase} title="Perkara tidak ditemukan"
              desc="Barang bukti ini tidak merujuk ke data perkara manapun."
              action={<ButtonLink to={`${base}/perkara`} variant="secondary" icon={FolderOpen}>Buka Data Perkara</ButtonLink>} />
          )}
        </Card>
      )}

      {tab === 'riwayat' && (
        <Card title="Riwayat Kejadian (Chain of Custody)"
          desc={`${rvList.length} kejadian tercatat untuk ${b.kode} — diurutkan dari yang terbaru.`}
          actions={canMove && <Button size="sm" icon={ArrowRightLeft} onClick={() => setMoveOpen(true)}>Catat Kejadian</Button>}>
          <Timeline items={rvList} showKode={false} />
          <div className="mt-5 border-t border-slate-100 pt-3">
            <Link to={`${base}/riwayat?barang=${b.id}`} className="text-xs font-semibold text-blue-600 hover:underline">
              Lihat dalam tabel Riwayat Perpindahan
            </Link>
          </div>
        </Card>
      )}

      {tab === 'dokumen' && (
        <Card title="Dokumen & Lampiran" desc="Dokumen pendukung barang bukti ini.">
          {lamp.length ? (
            <ul className="space-y-2">
              {lamp.map((l) => (
                <li key={l.id} className="flex items-center gap-3 rounded-lg border border-slate-200 px-3.5 py-3">
                  <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-slate-100 text-slate-500">
                    {l.tipe_mime.startsWith('image/') ? <Image size={16} /> : <FileText size={16} />}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-xs font-semibold text-navy-800">{l.nama_file}</p>
                    <p className="text-[11px] text-slate-400">{l.tipe_mime} · {fmtBytes(l.ukuran_byte)} · diunggah {fmtDateTime(l.created_at)} oleh {penggunaNama(lookup, l.diunggah_oleh)}</p>
                  </div>
                  <div className="flex gap-1.5">
                    <IconBtn icon={Download} title="Unduh berkas" onClick={() => openLampiran(l)} />
                    {isAdmin && <IconBtn icon={Trash2} tone="danger" title="Hapus lampiran" onClick={() => removeLampiran(l)} />}
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <EmptyState icon={Paperclip} title="Belum ada dokumen"
              desc="Belum terdapat lampiran untuk barang bukti ini. Tambahkan melalui formulir edit."
              action={canEdit && <ButtonLink to={`${base}/barang-bukti/${b.id}/edit`} variant="secondary" icon={Pencil}>Edit Barang Bukti</ButtonLink>} />
          )}
          <DemoNote>Berkas disimpan di Supabase Storage dan diunduh lewat tautan sementara (berlaku 60 detik).</DemoNote>
        </Card>
      )}

      <MovementModal open={moveOpen} onClose={() => setMoveOpen(false)} fixedBarangId={b.id} />
      <DeleteBarangDialog target={delOpen ? b : null} onClose={() => setDelOpen(false)} onDeleted={() => navigate(`${base}/barang-bukti`)} />
    </div>
  );
}
