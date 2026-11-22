import React, { useState } from 'react';
import { useApp } from '../../../context/AppContext';
import { Icon, Badge, Button, ButtonLink, Card, InfoGrid, DemoNote, CondDot, IconBtn, EmptyState, NotFound } from '../../../components/common/UI';
import { fmtDate, STATUS_BB } from '../../../utils/helpers';
import PerkaraFormModal from './PerkaraFormPage';

export default function PerkaraDetailPage({ id }) {
  const { data } = useApp();
  const p = data.perkara.find((x) => x.id === id);
  const [editOpen, setEditOpen] = useState(false);
  if (!p) return <NotFound message="Data perkara tidak ditemukan pada penyimpanan demo." />;
  
  const bb = data.barang.filter((b) => b.nomorLP === p.nomorLP);
  const count = (s) => bb.filter((b) => b.status === s).length;

  return (
    <div className="space-y-5">
      <a href="#/perkara" className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 transition hover:text-blue-700">
        <Icon name="arrow-left" size={14} />Kembali ke Data Perkara
      </a>

      <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-card">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-lg font-bold text-navy-800">{p.nomorLP}</h2>
              <Badge>{p.tahap}</Badge>
            </div>
            <p className="mt-1.5 max-w-2xl text-sm leading-relaxed text-slate-600">{p.uraian}</p>
            <div className="mt-3 flex flex-wrap gap-2 text-xs">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-2.5 py-1 text-slate-600"><Icon name="calendar" size={13} />Lapor: {fmtDate(p.tanggalLaporan)}</span>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-2.5 py-1 text-slate-600"><Icon name="user" size={13} />{p.penyidik}</span>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-2.5 py-1 text-slate-600"><Icon name="package" size={13} />{bb.length} barang bukti</span>
            </div>
          </div>
          <div className="no-print flex flex-wrap gap-2">
            <Button variant="secondary" icon="pencil" onClick={() => setEditOpen(true)}>Edit</Button>
            <ButtonLink to={'/barang-bukti/baru?lp=' + encodeURIComponent(p.nomorLP)} icon="plus">Daftarkan Barang Bukti</ButtonLink>
          </div>
        </div>
      </div>

      <div className="grid gap-5 lg:grid-cols-3">
        <div className="space-y-5 lg:col-span-2">
          <Card title="Informasi Umum Perkara">
            <InfoGrid rows={[
              { l: 'Nomor Laporan Polisi', v: p.nomorLP },
              { l: 'Tanggal Laporan', v: fmtDate(p.tanggalLaporan) },
              { l: 'Tahap Penanganan', v: <Badge>{p.tahap}</Badge> },
              { l: 'Penyidik / Petugas', v: p.penyidik },
              { l: 'Uraian Singkat', v: p.uraian, wide: true },
            ]} />
            <DemoNote>Data perkara bersifat demonstrasi dan disamarkan sepenuhnya.</DemoNote>
          </Card>

          <Card noPad title="Barang Bukti Terkait" desc="Barang bukti yang terhubung dengan nomor LP ini.">
            {bb.length ? (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[720px] text-left text-sm">
                  <thead>
                    <tr className="border-b border-slate-200 bg-slate-50/80 text-[11px] uppercase tracking-wide text-slate-500">
                      <th className="px-5 py-3 font-semibold">Kode</th>
                      <th className="px-4 py-3 font-semibold">Nama</th>
                      <th className="px-4 py-3 font-semibold">Kategori</th>
                      <th className="px-4 py-3 font-semibold">Diterima</th>
                      <th className="px-4 py-3 font-semibold">Kondisi</th>
                      <th className="px-4 py-3 font-semibold">Status</th>
                      <th className="px-5 py-3 text-right font-semibold">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {bb.map((b) => (
                      <tr key={b.id} className="transition hover:bg-slate-50/70">
                        <td className="whitespace-nowrap px-5 py-3"><a href={'#/barang-bukti/' + b.id} className="text-xs font-bold text-navy-800 hover:text-blue-700">{b.kode}</a></td>
                        <td className="max-w-[220px] truncate px-4 py-3 text-slate-700">{b.nama}</td>
                        <td className="whitespace-nowrap px-4 py-3 text-xs text-slate-500">{b.kategori}</td>
                        <td className="whitespace-nowrap px-4 py-3 text-xs tabular-nums text-slate-500">{fmtDate(b.tanggalPenerimaan)}</td>
                        <td className="px-4 py-3"><CondDot kondisi={b.kondisi} /></td>
                        <td className="px-4 py-3"><Badge>{b.status}</Badge></td>
                        <td className="px-5 py-3 text-right"><IconBtn icon="eye" title="Lihat detail" onClick={() => { window.location.hash = '#/barang-bukti/' + b.id; }} /></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <EmptyState icon="package" title="Belum ada barang bukti"
                desc="Belum terdapat barang bukti yang terdaftar untuk perkara ini."
                action={<ButtonLink to={'/barang-bukti/baru?lp=' + encodeURIComponent(p.nomorLP)} icon="plus">Daftarkan Barang Bukti</ButtonLink>} />
            )}
          </Card>
        </div>

        <Card title="Ringkasan Barang Bukti" desc="Status tersimpan untuk perkara ini.">
          <p className="text-3xl font-extrabold tabular-nums text-navy-800">{bb.length}</p>
          <p className="mt-0.5 text-xs text-slate-500">total barang bukti terdaftar</p>
          <ul className="mt-4 space-y-2">
            {STATUS_BB.map((s) => (
              <li key={s} className="flex items-center justify-between rounded-lg border border-slate-100 px-3 py-2 text-xs">
                <Badge>{s}</Badge>
                <span className="font-bold tabular-nums text-navy-800">{count(s)}</span>
              </li>
            ))}
          </ul>
          <DemoNote>Hanya Administrator yang dapat menghapus perkara pada demo ini.</DemoNote>
        </Card>
      </div>

      <PerkaraFormModal open={editOpen} initial={p} onClose={() => setEditOpen(false)} />
    </div>
  );
}
