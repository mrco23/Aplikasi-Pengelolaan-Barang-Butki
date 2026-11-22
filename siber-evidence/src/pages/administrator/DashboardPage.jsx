import React, { useState, useMemo } from 'react';
import { useApp } from '../../../context/AppContext';
import { Icon, IconBtn, Card, StatCard, Badge, Timeline, DemoNote } from '../../../components/common/UI';
import { fmtDate } from '../../../utils/helpers';
import PerkaraFormModal from './PerkaraFormPage'; // We will extract this soon

export default function DashboardPage() {
  const { data, user, toast } = useApp();
  const { barang, perkara, riwayat } = data;
  const [perOpen, setPerOpen] = useState(false);
  const [banner, setBanner] = useState(() => localStorage.getItem('se_demo_banner') !== '1');

  const active = barang.filter((b) => !b.draf);
  const tersedia = active.filter((b) => b.status === 'Tersedia').length;
  const dipinjam = active.filter((b) => b.status === 'Dipinjam').length;
  const pemeriksaan = active.filter((b) => b.status === 'Dalam Pemeriksaan').length;
  const dihancurkan = active.filter((b) => b.status === 'Dihancurkan').length;
  const drafCount = barang.filter((b) => b.draf).length;
  const lidik = perkara.filter((p) => p.tahap === 'Lidik');
  const sidik = perkara.filter((p) => p.tahap === 'Sidik');

  const recentBB = useMemo(() => [...active].sort((a, b) =>
    b.tanggalPenerimaan.localeCompare(a.tanggalPenerimaan) || b.createdAt.localeCompare(a.createdAt)).slice(0, 5), [barang]);
  const recentRv = useMemo(() => [...riwayat].sort((a, b) => b.tanggalWaktu.localeCompare(a.tanggalWaktu)).slice(0, 5), [riwayat]);

  return (
    <div className="space-y-6">
      {banner && (
        <div className="flex items-start justify-between gap-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3">
          <div className="flex items-start gap-3">
            <Icon name="alert-triangle" size={18} className="mt-0.5 shrink-0 text-amber-600" />
            <p className="text-xs leading-relaxed text-amber-800">
              <span className="font-bold">Mode demonstrasi akademik (Kerja Praktik).</span> Seluruh data bersifat fiktif untuk
              keperluan pengujian antarmuka dan tidak merepresentasikan data operasional Kepolisian. Aplikasi tidak terhubung ke sistem produksi mana pun.
            </p>
          </div>
          <button onClick={() => { localStorage.setItem('se_demo_banner', '1'); setBanner(false); }} className="text-amber-500 transition hover:text-amber-700" aria-label="Tutup">
            <Icon name="x" size={15} />
          </button>
        </div>
      )}

      <div>
        <h2 className="text-xl font-bold text-navy-800">Selamat datang, {user.nama}</h2>
        <p className="mt-0.5 text-sm text-slate-500">Ringkasan pengelolaan barang bukti — Subbid Siber, Ditreskrimsus Polda Sulawesi Utara.</p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard to="/barang-bukti" icon="archive" tint="bg-blue-50 text-blue-600" label="Total Barang Bukti" value={active.length}
          sub={`${drafCount} draft tersimpan`} />
        <StatCard to="/perkara" icon="briefcase" tint="bg-navy-50 text-navy-700" label="Total Perkara" value={perkara.length}
          sub={`Lidik ${lidik.length} · Sidik ${sidik.length}`} />
        <StatCard to="/barang-bukti?status=Tersedia" icon="check" tint="bg-emerald-50 text-emerald-600" label="Barang Bukti Tersedia" value={tersedia}
          sub={`${active.length ? Math.round((tersedia / active.length) * 100) : 0}% dari total`} />
        <StatCard to="/barang-bukti?status=Dipinjam" icon="arrow-up-right" tint="bg-amber-50 text-amber-600" label="Sedang Dipinjam" value={dipinjam}
          sub="termasuk pinjaman tim forensik" />
      </div>

      <div className="grid gap-5 lg:grid-cols-3">
        <Card noPad className="lg:col-span-2" title="Barang Bukti Terbaru" desc="Lima pendaftaran barang bukti terakhir."
          actions={<a href="#/barang-bukti" className="text-xs font-semibold text-blue-600 hover:underline">Lihat semua</a>}>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] text-left text-sm">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/80 text-[11px] uppercase tracking-wide text-slate-500">
                  <th className="px-5 py-3 font-semibold">Kode</th>
                  <th className="px-4 py-3 font-semibold">Nama Barang Bukti</th>
                  <th className="px-4 py-3 font-semibold">Kategori</th>
                  <th className="px-4 py-3 font-semibold">Diterima</th>
                  <th className="px-4 py-3 font-semibold">Status</th>
                  <th className="px-5 py-3 text-right font-semibold">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {recentBB.map((b) => (
                  <tr key={b.id} className="transition hover:bg-slate-50/70">
                    <td className="whitespace-nowrap px-5 py-3"><a href={'#/barang-bukti/' + b.id} className="text-xs font-bold text-navy-800 hover:text-blue-700">{b.kode}</a></td>
                    <td className="max-w-[220px] truncate px-4 py-3 text-slate-700" title={b.nama}>{b.nama}</td>
                    <td className="whitespace-nowrap px-4 py-3 text-xs text-slate-500">{b.kategori}</td>
                    <td className="whitespace-nowrap px-4 py-3 text-xs tabular-nums text-slate-500">{fmtDate(b.tanggalPenerimaan)}</td>
                    <td className="px-4 py-3"><Badge>{b.status}</Badge></td>
                    <td className="px-5 py-3 text-right">
                      <IconBtn icon="eye" title="Lihat detail" onClick={() => { window.location.hash = '#/barang-bukti/' + b.id; }} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        <div className="space-y-5">
          <Card title="Aksi Cepat" desc="Mulai alur pencatatan baru.">
            <div className="space-y-2.5">
              <button onClick={() => setPerOpen(true)} className="flex w-full items-center justify-between rounded-lg border border-slate-200 px-4 py-3 text-left transition hover:border-blue-300 hover:bg-blue-50/40">
                <span className="flex items-center gap-3">
                  <span className="grid h-9 w-9 place-items-center rounded-lg bg-blue-50 text-blue-600"><Icon name="folder-open" size={17} /></span>
                  <span><span className="block text-xs font-bold text-navy-800">Tambah Perkara</span><span className="block text-[11px] text-slate-500">Catat LP baru</span></span>
                </span>
                <Icon name="chevron-right" size={15} className="text-slate-400" />
              </button>
              <a href="#/barang-bukti/baru" className="flex items-center justify-between rounded-lg border border-slate-200 px-4 py-3 transition hover:border-blue-300 hover:bg-blue-50/40">
                <span className="flex items-center gap-3">
                  <span className="grid h-9 w-9 place-items-center rounded-lg bg-emerald-50 text-emerald-600"><Icon name="package" size={17} /></span>
                  <span><span className="block text-xs font-bold text-navy-800">Daftarkan Barang Bukti</span><span className="block text-[11px] text-slate-500">Formulir pendaftaran</span></span>
                </span>
                <Icon name="chevron-right" size={15} className="text-slate-400" />
              </a>
              <a href="#/laporan" className="flex items-center justify-between rounded-lg border border-slate-200 px-4 py-3 transition hover:border-blue-300 hover:bg-blue-50/40">
                <span className="flex items-center gap-3">
                  <span className="grid h-9 w-9 place-items-center rounded-lg bg-navy-50 text-navy-700"><Icon name="clipboard-list" size={17} /></span>
                  <span><span className="block text-xs font-bold text-navy-800">Buat Laporan</span><span className="block text-[11px] text-slate-500">Cetak rekapitulasi</span></span>
                </span>
                <Icon name="chevron-right" size={15} className="text-slate-400" />
              </a>
            </div>
          </Card>
        </div>
      </div>

      <div className="grid gap-5 lg:grid-cols-3">
        <Card className="lg:col-span-2" title="Aktivitas Terakhir" desc="Pergerakan barang bukti yang tercatat."
          actions={<a href="#/riwayat" className="text-xs font-semibold text-blue-600 hover:underline">Lihat semua riwayat</a>}>
          <Timeline items={recentRv} />
        </Card>
        <Card title="Status Barang Bukti" desc="Kondisi penyimpanan saat ini.">
          <ul className="space-y-3">
            {[
              { l: 'Tersedia', v: tersedia, d: 'bg-emerald-500' },
              { l: 'Dipinjam', v: dipinjam, d: 'bg-amber-500' },
              { l: 'Dalam Pemeriksaan', v: pemeriksaan, d: 'bg-blue-500' },
              { l: 'Dihancurkan', v: dihancurkan, d: 'bg-red-500' },
            ].map(s => (
              <li key={s.l} className="flex items-center justify-between rounded-lg border border-slate-100 px-3 py-2.5">
                <span className="flex items-center gap-2 text-xs font-medium text-slate-600">
                  <span className={cn('h-2 w-2 rounded-full', s.d)} />{s.l}
                </span>
                <span className="text-sm font-bold tabular-nums text-navy-800">{s.v}</span>
              </li>
            ))}
          </ul>
          <DemoNote>Angka pada halaman ini dihitung dari data demo fiktif yang tersimpan di peramban.</DemoNote>
        </Card>
      </div>

      <PerkaraFormModal open={perOpen} initial={null} onClose={() => { setPerOpen(false); toast('info', 'Info', 'Perkara dapat dikelanjutkan dengan mendaftarkan barang bukti.'); }} />
    </div>
  );
}
