import React, { useState } from 'react';
import { useApp } from '../../../context/AppContext';
import { Icon, Button, Card, Field, Select, Input, Badge, PrintHeader, DemoNote } from '../../../components/common/UI';
import { fmtDate, STATUS_BB, exportCsv, todayISO } from '../../../utils/helpers';

export default function LaporanPage() {
  const { data } = useApp();
  const [jenis, setJenis] = useState('Rekapitulasi Barang Bukti');
  const [format, setFormat] = useState('Cetak Laporan (PDF/Kertas)');
  const [status, setStatus] = useState('');
  const [dari, setDari] = useState('');
  const [sampai, setSampai] = useState('');
  const [isPrint, setIsPrint] = useState(false);

  function getRows() {
    let bb = data.barang.filter(b => !b.draf);
    if (status) bb = bb.filter(b => b.status === status);
    if (dari) bb = bb.filter(b => b.tanggalPenerimaan >= dari);
    if (sampai) bb = bb.filter(b => b.tanggalPenerimaan <= sampai);
    return bb.sort((a, b) => b.tanggalPenerimaan.localeCompare(a.tanggalPenerimaan));
  }

  function handleExport() {
    if (format === 'Unduh Spreadsheet (CSV)') {
      const rows = getRows();
      const head = ['Kode BB', 'Nama Barang Bukti', 'Kategori', 'Terkait LP', 'Tgl Penerimaan', 'Status', 'Lokasi', 'Kondisi'];
      const dataRows = rows.map(b => [b.kode, b.nama, b.kategori, b.nomorLP, b.tanggalPenerimaan, b.status, b.lokasi, b.kondisi]);
      exportCsv(`Laporan_BB_${todayISO()}.csv`, head, dataRows);
    } else {
      setIsPrint(true);
      setTimeout(() => { window.print(); setIsPrint(false); }, 300);
    }
  }

  const bbToPrint = isPrint ? getRows() : [];

  return (
    <div className="space-y-5">
      <Card title="Buat Laporan / Rekapitulasi" desc="Hasilkan laporan daftar barang bukti sesuai filter.">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Jenis Laporan">
            <Select value={jenis} onChange={e => setJenis(e.target.value)} options={[['Rekapitulasi Barang Bukti', 'Rekapitulasi Barang Bukti']]} />
          </Field>
          <Field label="Format Keluaran">
            <Select value={format} onChange={e => setFormat(e.target.value)} options={[['Cetak Laporan (PDF/Kertas)', 'Cetak Laporan (PDF/Kertas)'], ['Unduh Spreadsheet (CSV)', 'Unduh Spreadsheet (CSV)']]} />
          </Field>
          <Field label="Filter Status Barang">
            <Select value={status} onChange={e => setStatus(e.target.value)} options={[['', 'Semua Status'], ...STATUS_BB.map(x => [x, x])]} />
          </Field>
          <Field label="Rentang Waktu Penerimaan (Opsional)">
            <div className="flex items-center gap-2">
              <Input type="date" value={dari} onChange={e => setDari(e.target.value)} />
              <span className="text-xs text-slate-400">s/d</span>
              <Input type="date" value={sampai} onChange={e => setSampai(e.target.value)} />
            </div>
          </Field>
        </div>
        <div className="mt-6 flex justify-end">
          <Button icon={format === 'Cetak Laporan (PDF/Kertas)' ? 'printer' : 'download'} onClick={handleExport}>Hasilkan Laporan</Button>
        </div>
      </Card>

      <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-card">
        <h3 className="text-sm font-bold text-navy-800">Pratinjau Kriteria Cetak</h3>
        <p className="mt-1 flex items-center gap-2 text-sm text-slate-600">
          Total Data: <span className="font-bold tabular-nums text-blue-600">{getRows().length} barang bukti</span>
        </p>
        <DemoNote>Pada versi demo, fungsi pencetakan memanggil dialog Print bawaan peramban Anda.</DemoNote>
      </div>

      {isPrint && (
        <div className="print-only fixed inset-0 z-[200] bg-white p-8">
          <PrintHeader subtitle={`Laporan Rekapitulasi Barang Bukti — ${fmtDate(todayISO())}`} />
          <div className="mb-4 text-[11px]">
            <p><strong>Filter Status:</strong> {status || 'Semua Status'}</p>
            <p><strong>Rentang Waktu:</strong> {dari ? fmtDate(dari) : 'Awal'} s/d {sampai ? fmtDate(sampai) : 'Terakhir'}</p>
          </div>
          <table className="w-full text-left text-[11px]">
            <thead>
              <tr className="border-b-2 border-navy-800 text-navy-800 uppercase">
                <th className="py-2 pr-2">Kode / LP</th>
                <th className="py-2 px-2">Nama Barang Bukti</th>
                <th className="py-2 px-2">Kategori</th>
                <th className="py-2 px-2">Terima</th>
                <th className="py-2 px-2">Lokasi</th>
                <th className="py-2 pl-2">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-300">
              {bbToPrint.map((b, i) => (
                <tr key={i}>
                  <td className="py-2 pr-2"><span className="font-bold">{b.kode}</span><br /><span className="text-[9px] text-slate-600">{b.nomorLP}</span></td>
                  <td className="py-2 px-2">{b.nama}</td>
                  <td className="py-2 px-2">{b.kategori}</td>
                  <td className="py-2 px-2">{b.tanggalPenerimaan}</td>
                  <td className="py-2 px-2">{b.lokasi}</td>
                  <td className="py-2 pl-2"><Badge tone={b.status}>{b.status}</Badge></td>
                </tr>
              ))}
            </tbody>
          </table>
          {bbToPrint.length === 0 && <p className="py-8 text-center text-xs text-slate-500">Tidak ada data yang sesuai filter.</p>}
        </div>
      )}
    </div>
  );
}
