import { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Archive, Briefcase, Check, ArrowUpRight, Eye, FolderOpen, Package, ArrowRightLeft, ChevronRight, Clock,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { STATUS_BB, STATUS_DOT } from '../../constants';
import { cn, diffDays, fmtDate, namaPengguna, todayISO } from '../../utils/format';
import { kategoriNama, sortByTimeDesc } from '../../utils/selectors';
import { Alert, Card, DemoNote, IconBtn, StatCard, StatusBadge, Table } from '../../components/ui';
import Timeline from '../../components/shared/Timeline';
import PerkaraFormModal from '../../components/shared/PerkaraFormModal';
import MovementModal from '../../components/shared/MovementModal';

const BANNER_KEY = 'siber_evidence_fe_banner_hidden';

export default function DashboardPage() {
  const { data, lookup, user, overdueLoans } = useApp();
  const navigate = useNavigate();
  const [perOpen, setPerOpen] = useState(false);
  const [moveOpen, setMoveOpen] = useState(false);
  const [banner, setBanner] = useState(() => localStorage.getItem(BANNER_KEY) !== '1');

  const { barang_bukti: barang, perkara, riwayat_barang_bukti: riwayat } = data;
  const active = barang.filter((b) => !b.is_draf);
  const drafCount = barang.length - active.length;
  const count = (s) => active.filter((b) => b.status === s).length;
  const lidik = perkara.filter((p) => p.tahap === 'lidik');
  const sidik = perkara.filter((p) => p.tahap === 'sidik');
  const bbOfTahap = (t) => active.filter((b) => lookup.perkara[b.perkara_id]?.tahap === t).length;

  const recentBB = useMemo(() => [...active]
    .sort((a, b) => b.tanggal_penerimaan.localeCompare(a.tanggal_penerimaan) || b.created_at.localeCompare(a.created_at))
    .slice(0, 5), [barang]); // eslint-disable-line react-hooks/exhaustive-deps
  const recentRv = useMemo(() => [...riwayat].sort(sortByTimeDesc).slice(0, 5), [riwayat]);
  const myDrafts = barang.filter((b) => b.is_draf);

  return (
    <div className="space-y-6">
      {banner && (
        <Alert tone="amber" onClose={() => { localStorage.setItem(BANNER_KEY, '1'); setBanner(false); }}>
          <span className="font-bold">Mode demonstrasi (Kerja Praktik).</span> Seluruh data bersifat fiktif untuk keperluan
          pengujian antarmuka dan tidak merepresentasikan data operasional Kepolisian.
        </Alert>
      )}

      <div>
        <h2 className="text-xl font-bold text-navy-800">Selamat datang, {namaPengguna(user)}</h2>
        <p className="mt-0.5 text-sm text-slate-500">Ringkasan pengelolaan barang bukti — Subbid Siber, Ditreskrimsus Polda Sulawesi Utara.</p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard to="/petugas/barang-bukti" icon={Archive} tint="bg-blue-50 text-blue-600" label="Total Barang Bukti" value={active.length}
          sub={`${drafCount} draf tersimpan`} />
        <StatCard to="/petugas/perkara" icon={Briefcase} tint="bg-navy-50 text-navy-700" label="Total Perkara" value={perkara.length}
          sub={`Lidik ${lidik.length} · Sidik ${sidik.length}`} />
        <StatCard to="/petugas/barang-bukti?status=tersedia" icon={Check} tint="bg-emerald-50 text-emerald-600" label="Barang Bukti Tersedia" value={count('tersedia')}
          sub={`${active.length ? Math.round((count('tersedia') / active.length) * 100) : 0}% dari total`} />
        <StatCard to="/petugas/barang-bukti?status=dipinjam" icon={ArrowUpRight} tint="bg-amber-50 text-amber-600" label="Sedang Dipinjam" value={count('dipinjam')}
          sub={overdueLoans.length ? `${overdueLoans.length} melewati tenggat` : 'semua sesuai jadwal'} />
      </div>

      {overdueLoans.length > 0 && (
        <Card noPad title="Peminjaman Melewati Tenggat" desc="Barang bukti yang belum dikembalikan setelah tanggal harapan kembali."
          actions={<span className="inline-flex items-center gap-1.5 rounded-full bg-red-50 px-2.5 py-1 text-[11px] font-semibold text-red-700 ring-1 ring-inset ring-red-600/20"><Clock size={12} />{overdueLoans.length} barang</span>}>
          <ul className="divide-y divide-slate-100">
            {overdueLoans.map((r) => {
              const b = lookup.barang[r.barang_bukti_id];
              return (
                <li key={r.id} className="flex flex-wrap items-center justify-between gap-3 px-5 py-3">
                  <div className="min-w-0">
                    <Link to={`/petugas/barang-bukti/${b.id}`} className="text-xs font-bold text-navy-800 hover:text-blue-700">{b.kode}</Link>
                    <span className="ml-2 text-sm text-slate-700">{b.nama}</span>
                    <p className="mt-0.5 text-[11px] text-slate-500">{r.alasan} · harap kembali {fmtDate(r.tanggal_harapan_kembali)}</p>
                  </div>
                  <span className="text-xs font-bold text-red-600">Terlambat {diffDays(r.tanggal_harapan_kembali, todayISO())} hari</span>
                </li>
              );
            })}
          </ul>
        </Card>
      )}

      <div className="grid gap-5 lg:grid-cols-3">
        <Card noPad className="lg:col-span-2" title="Barang Bukti Terbaru" desc="Lima pendaftaran barang bukti terakhir."
          actions={<Link to="/petugas/barang-bukti" className="text-xs font-semibold text-blue-600 hover:underline">Lihat semua</Link>}>
          <Table minWidth={640} head={['Kode', 'Nama Barang Bukti', 'Kategori', 'Diterima', 'Status', { label: 'Aksi', className: 'text-right' }]}>
            {recentBB.map((b) => (
              <tr key={b.id} className="transition hover:bg-slate-50/70">
                <td className="whitespace-nowrap px-5 py-3"><Link to={`/petugas/barang-bukti/${b.id}`} className="text-xs font-bold text-navy-800 hover:text-blue-700">{b.kode}</Link></td>
                <td className="max-w-[220px] truncate px-4 py-3 text-slate-700" title={b.nama}>{b.nama}</td>
                <td className="whitespace-nowrap px-4 py-3 text-xs text-slate-500">{kategoriNama(lookup, b.kategori_id)}</td>
                <td className="whitespace-nowrap px-4 py-3 text-xs tabular-nums text-slate-500">{fmtDate(b.tanggal_penerimaan)}</td>
                <td className="px-4 py-3"><StatusBadge status={b.status} /></td>
                <td className="px-5 py-3 text-right"><IconBtn icon={Eye} title="Lihat detail" onClick={() => navigate(`/petugas/barang-bukti/${b.id}`)} /></td>
              </tr>
            ))}
          </Table>
        </Card>

        <div className="space-y-5">
          <Card title="Aksi Cepat" desc="Mulai alur pencatatan baru.">
            <div className="space-y-2.5">
              <QuickAction onClick={() => setPerOpen(true)} icon={FolderOpen} tint="bg-blue-50 text-blue-600" title="Tambah Perkara" sub="Catat LP baru" />
              <QuickAction to="/petugas/barang-bukti/baru" icon={Package} tint="bg-emerald-50 text-emerald-600" title="Daftarkan Barang Bukti" sub="Formulir pendaftaran" />
              <QuickAction onClick={() => setMoveOpen(true)} icon={ArrowRightLeft} tint="bg-amber-50 text-amber-600" title="Catat Perpindahan" sub="Pindah, pinjam, kembalikan" />
            </div>
          </Card>

          <Card title="Ringkasan Perkara" desc="Sebaran tahap penanganan.">
            <div className="space-y-4">
              {[
                { key: 'lidik', label: 'Lidik', list: lidik, tone: 'bg-sky-500' },
                { key: 'sidik', label: 'Sidik', list: sidik, tone: 'bg-indigo-500' },
              ].map((g) => {
                const pct = perkara.length ? Math.round((g.list.length / perkara.length) * 100) : 0;
                return (
                  <div key={g.key}>
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-slate-600">{g.label}</span>
                      <span className="font-bold tabular-nums text-navy-800">{g.list.length} perkara</span>
                    </div>
                    <div className="mt-1.5 h-1.5 rounded-full bg-slate-100">
                      <div className={cn('h-1.5 rounded-full', g.tone)} style={{ width: pct + '%' }} />
                    </div>
                    <p className="mt-1 text-[11px] text-slate-400">{bbOfTahap(g.key)} barang bukti terkait · {pct}% dari total</p>
                  </div>
                );
              })}
            </div>
          </Card>
        </div>
      </div>

      <div className="grid gap-5 lg:grid-cols-3">
        <Card className="lg:col-span-2" title="Aktivitas Terakhir" desc="Pergerakan barang bukti yang tercatat."
          actions={<Link to="/petugas/riwayat" className="text-xs font-semibold text-blue-600 hover:underline">Lihat semua riwayat</Link>}>
          <Timeline items={recentRv} />
        </Card>
        <div className="space-y-5">
          <Card title="Status Barang Bukti" desc="Kondisi penyimpanan saat ini.">
            <ul className="space-y-3">
              {Object.entries(STATUS_BB).map(([k, l]) => (
                <li key={k}>
                  <Link to={`/petugas/barang-bukti?status=${k}`} className="flex items-center justify-between rounded-lg border border-slate-100 px-3 py-2.5 transition hover:border-blue-200 hover:bg-blue-50/30">
                    <span className="flex items-center gap-2 text-xs font-medium text-slate-600">
                      <span className={cn('h-2 w-2 rounded-full', STATUS_DOT[k])} />{l}
                    </span>
                    <span className="text-sm font-bold tabular-nums text-navy-800">{count(k)}</span>
                  </Link>
                </li>
              ))}
            </ul>
            <DemoNote>Angka dihitung dari data contoh yang tersimpan di peramban.</DemoNote>
          </Card>
          {myDrafts.length > 0 && (
            <Card title="Draf Belum Didaftarkan" desc="Lengkapi lalu daftarkan agar tercatat di riwayat.">
              <ul className="space-y-2">
                {myDrafts.map((b) => (
                  <li key={b.id}>
                    <Link to={`/petugas/barang-bukti/${b.id}/edit`} className="flex items-center justify-between rounded-lg border border-slate-100 px-3 py-2.5 transition hover:border-blue-200 hover:bg-blue-50/30">
                      <span className="min-w-0">
                        <span className="block text-xs font-bold text-navy-800">{b.kode}</span>
                        <span className="block truncate text-[11px] text-slate-500">{b.nama}</span>
                      </span>
                      <ChevronRight size={15} className="shrink-0 text-slate-400" />
                    </Link>
                  </li>
                ))}
              </ul>
            </Card>
          )}
        </div>
      </div>

      <PerkaraFormModal open={perOpen} initial={null} onClose={() => setPerOpen(false)} onSaved={(p) => navigate(`/petugas/perkara/${p.id}`)} />
      <MovementModal open={moveOpen} onClose={() => setMoveOpen(false)} />
    </div>
  );
}

function QuickAction({ to, onClick, icon: Ico, tint, title, sub }) {
  const inner = (
    <>
      <span className="flex items-center gap-3">
        <span className={cn('grid h-9 w-9 place-items-center rounded-lg', tint)}><Ico size={17} /></span>
        <span><span className="block text-xs font-bold text-navy-800">{title}</span><span className="block text-[11px] text-slate-500">{sub}</span></span>
      </span>
      <ChevronRight size={15} className="text-slate-400" />
    </>
  );
  const cls = 'flex w-full items-center justify-between rounded-lg border border-slate-200 px-4 py-3 text-left transition hover:border-blue-300 hover:bg-blue-50/40';
  return to ? <Link to={to} className={cls}>{inner}</Link> : <button type="button" onClick={onClick} className={cls}>{inner}</button>;
}
