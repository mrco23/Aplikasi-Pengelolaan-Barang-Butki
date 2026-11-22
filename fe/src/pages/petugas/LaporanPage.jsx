import { useMemo, useState } from 'react';
import { Download, Inbox, Printer } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { JENIS_RIWAYAT, STATUS_BB, STATUS_KEMBALI, TAHAP, toOptions } from '../../constants';
import { cn, exportCsv, fmtDate, fmtDateTime, namaPengguna, nowLocal, todayISO } from '../../utils/format';
import { kategoriOptions, lokasiNama, penggunaNama } from '../../utils/selectors';
import { Button, Card, DemoNote, EmptyState, Field, Input, Select } from '../../components/ui';
import PrintHeader from '../../components/shared/PrintHeader';

const JENIS_LAPORAN = [
  ['rekap', 'Rekapitulasi Barang Bukti'],
  ['perkara', 'Laporan per Perkara'],
  ['penyimpanan', 'Laporan Status Penyimpanan'],
  ['riwayat', 'Laporan Riwayat Perpindahan'],
  ['peminjaman', 'Laporan Peminjaman'],
];
const STATUS_KEYS = Object.keys(STATUS_BB);

export default function LaporanPage() {
  const { data, lookup, user, toast } = useApp();
  const [jenis, setJenis] = useState('rekap');
  const [dari, setDari] = useState(`${todayISO().slice(0, 4)}-01-01`);
  const [sampai, setSampai] = useState(todayISO());
  const [perkaraId, setPerkaraId] = useState('');
  const [kategori, setKategori] = useState('');
  const [status, setStatus] = useState('');
  const [tahap, setTahap] = useState('');

  /* Filter barang bukti (non-draf) yang dipakai beberapa jenis laporan */
  const matchBarang = (b) => {
    if (!b || b.is_draf) return false;
    if (kategori && String(b.kategori_id) !== kategori) return false;
    if (status && b.status !== status) return false;
    if (perkaraId && String(b.perkara_id) !== perkaraId) return false;
    if (tahap && lookup.perkara[b.perkara_id]?.tahap !== tahap) return false;
    return true;
  };

  const rep = useMemo(() => {
    const inRange = (d) => d >= dari && d <= sampai;
    const bb = data.barang_bukti.filter((b) => matchBarang(b) && inRange(b.tanggal_penerimaan));
    const countBy = (list, s) => list.filter((b) => b.status === s).length;
    const statusCols = (list) => [list.length, ...STATUS_KEYS.map((s) => countBy(list, s))];
    const statusHead = ['Jumlah', ...STATUS_KEYS.map((s) => STATUS_BB[s])];

    if (jenis === 'perkara') {
      const pk = data.perkara.filter((p) => inRange(p.tanggal_laporan) && (!perkaraId || String(p.id) === perkaraId) && (!tahap || p.tahap === tahap));
      const rows = pk.map((p) => [p.nomor_lp, p.uraian, TAHAP[p.tahap], penggunaNama(lookup, p.penyidik_id), fmtDate(p.tanggal_laporan),
        data.barang_bukti.filter((b) => b.perkara_id === p.id && matchBarang(b)).length]);
      return {
        title: 'Laporan per Perkara',
        headers: ['Nomor LP', 'Uraian Perkara', 'Tahap', 'Penyidik', 'Tgl Laporan', 'Jumlah BB'],
        rows, total: ['TOTAL', `${pk.length} perkara`, '', '', '', rows.reduce((a, r) => a + r[5], 0)],
        note: 'tanggal laporan perkara',
      };
    }
    if (jenis === 'penyimpanan') {
      const rows = data.lokasi_penyimpanan
        .map((l) => [l.nama, ...statusCols(bb.filter((b) => b.lokasi_id === l.id))])
        .filter((r) => r[1] > 0);
      return { title: 'Laporan Status Penyimpanan', headers: ['Lokasi Penyimpanan', ...statusHead], rows, total: ['TOTAL', ...statusCols(bb)], note: 'tanggal penerimaan barang' };
    }
    if (jenis === 'riwayat' || jenis === 'peminjaman') {
      const rv = data.riwayat_barang_bukti
        .filter((r) => inRange(r.tanggal_waktu.slice(0, 10)) && matchBarang(lookup.barang[r.barang_bukti_id]))
        .filter((r) => jenis === 'riwayat' || r.jenis === 'peminjaman')
        .sort((a, b) => b.tanggal_waktu.localeCompare(a.tanggal_waktu));
      if (jenis === 'peminjaman') {
        const today = todayISO();
        const rows = rv.map((r) => [fmtDateTime(r.tanggal_waktu), lookup.barang[r.barang_bukti_id].kode, r.alasan, penggunaNama(lookup, r.petugas_id),
          fmtDate(r.tanggal_harapan_kembali), r.status_kembali === 'belum_kembali' && r.tanggal_harapan_kembali < today ? 'Melewati tenggat' : STATUS_KEMBALI[r.status_kembali] || '-']);
        const open = rv.filter((r) => r.status_kembali === 'belum_kembali').length;
        return {
          title: 'Laporan Peminjaman Barang Bukti',
          headers: ['Tanggal Pinjam', 'Kode BB', 'Keperluan', 'Petugas', 'Harap Kembali', 'Status'],
          rows, total: ['TOTAL', `${rows.length} peminjaman`, '', '', '', `${open} belum kembali`], note: 'tanggal peminjaman',
        };
      }
      const rows = rv.map((r) => [fmtDateTime(r.tanggal_waktu), lookup.barang[r.barang_bukti_id].kode, JENIS_RIWAYAT[r.jenis],
        lokasiNama(lookup, r.lokasi_asal_id), lokasiNama(lookup, r.lokasi_tujuan_id), penggunaNama(lookup, r.petugas_id), r.alasan]);
      return {
        title: 'Laporan Riwayat Perpindahan',
        headers: ['Tanggal & Waktu', 'Kode BB', 'Jenis', 'Lokasi Asal', 'Lokasi Tujuan', 'Petugas', 'Alasan'],
        rows, total: ['TOTAL', `${rows.length} kejadian`, '', '', '', '', ''], note: 'tanggal kejadian',
      };
    }
    const rows = data.kategori.map((k) => [k.nama, ...statusCols(bb.filter((b) => b.kategori_id === k.id))]);
    return { title: 'Rekapitulasi Barang Bukti', headers: ['Kategori', ...statusHead], rows, total: ['TOTAL', ...statusCols(bb)], note: 'tanggal penerimaan barang' };
  }, [data, lookup, jenis, dari, sampai, perkaraId, kategori, status, tahap]); // eslint-disable-line react-hooks/exhaustive-deps

  const rangeErr = dari && sampai && dari > sampai;

  function doExport() {
    const fname = `laporan-${jenis}-${dari}_${sampai}.csv`;
    exportCsv(fname, rep.headers, [...rep.rows, rep.total]);
    toast('success', 'Ekspor CSV berhasil', `Berkas ${fname} diunduh.`);
  }

  return (
    <div className="space-y-5">
      <Card noPad className="no-print" title="Filter Laporan" desc="Sesuaikan parameter sebelum melihat pratinjau, mencetak, atau mengekspor."
        actions={(
          <div className="flex gap-2">
            <Button variant="secondary" size="sm" icon={Printer} disabled={rangeErr} onClick={() => window.print()}>Cetak</Button>
            <Button size="sm" icon={Download} disabled={rangeErr || !rep.rows.length} onClick={doExport}>Ekspor CSV</Button>
          </div>
        )}>
        <div className="grid gap-4 px-5 py-5 sm:grid-cols-2 lg:grid-cols-4">
          <Field label="Jenis Laporan" required>
            <Select value={jenis} onChange={(e) => setJenis(e.target.value)} options={JENIS_LAPORAN} />
          </Field>
          <Field label="Dari Tanggal" error={rangeErr ? 'Tanggal awal melewati tanggal akhir.' : undefined}>
            <Input type="date" value={dari} error={rangeErr} onChange={(e) => setDari(e.target.value)} />
          </Field>
          <Field label="Sampai Tanggal">
            <Input type="date" value={sampai} onChange={(e) => setSampai(e.target.value)} />
          </Field>
          <Field label="Nomor Perkara">
            <Select value={perkaraId} onChange={(e) => setPerkaraId(e.target.value)} placeholder="Semua Perkara"
              options={data.perkara.map((p) => [String(p.id), p.nomor_lp])} />
          </Field>
          <Field label="Kategori">
            <Select value={kategori} onChange={(e) => setKategori(e.target.value)} placeholder="Semua Kategori" options={kategoriOptions(data)} />
          </Field>
          <Field label="Status Penyimpanan">
            <Select value={status} onChange={(e) => setStatus(e.target.value)} placeholder="Semua Status" options={toOptions(STATUS_BB)} />
          </Field>
          <Field label="Tahap Perkara">
            <Select value={tahap} onChange={(e) => setTahap(e.target.value)} placeholder="Semua Tahap" options={toOptions(TAHAP)} />
          </Field>
        </div>
        <p className="border-t border-slate-100 px-5 py-3 text-[11px] leading-relaxed text-slate-400">
          Rentang tanggal untuk laporan ini berlaku pada <span className="font-semibold text-slate-500">{rep.note}</span>.
          Filter kategori, status, dan tahap menyaring barang bukti terkait. Draf tidak dihitung.
        </p>
      </Card>

      <PrintHeader subtitle={rep.title} />

      <Card noPad>
        <div className="border-b border-slate-100 px-5 py-4">
          <h3 className="text-sm font-bold text-navy-800">{rep.title}</h3>
          <p className="mt-0.5 text-xs text-slate-500">
            Periode: {fmtDate(dari)} s.d. {fmtDate(sampai)} · Dibuat: {fmtDateTime(nowLocal())} oleh {namaPengguna(user)}
          </p>
        </div>
        {rep.rows.length && !rangeErr ? (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] text-left text-sm">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/80 text-[11px] uppercase tracking-wide text-slate-500">
                  {rep.headers.map((h) => <th key={h} className="px-4 py-3 font-semibold">{h}</th>)}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {rep.rows.map((r, i) => (
                  <tr key={i} className="transition hover:bg-slate-50/60">
                    {r.map((c, j) => (
                      <td key={j} className={cn('px-4 py-3', j === 0 ? 'font-medium text-navy-800' : 'text-slate-700', typeof c === 'number' && 'tabular-nums',
                        c === 'Melewati tenggat' && 'font-semibold text-red-600')}>{c}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="border-t-2 border-slate-200 bg-slate-50">
                  {rep.total.map((c, j) => <td key={j} className="px-4 py-3 text-xs font-bold uppercase tracking-wide text-navy-800">{c}</td>)}
                </tr>
              </tfoot>
            </table>
          </div>
        ) : (
          <EmptyState icon={Inbox} title="Tidak ada data"
            desc="Tidak ditemukan data pada rentang tanggal dan filter yang dipilih. Coba perluas rentang atau longgarkan filter." />
        )}
        <div className="no-print border-t border-slate-100 px-5 py-1">
          <DemoNote>Gunakan tombol Cetak untuk tata letak A4 dengan kop institusi dan kolom tanda tangan.</DemoNote>
        </div>

        <div className="print-only mt-10 flex justify-end px-5 pb-5">
          <div className="text-center text-xs text-slate-800">
            <p>Manado, {fmtDate(todayISO())}</p>
            <p>Petugas Pengelola Barang Bukti,</p>
            <div style={{ height: 64 }} />
            <p className="font-bold underline">{namaPengguna(user)}</p>
            <p>NRP {user?.nrp || '...........................'}</p>
          </div>
        </div>
      </Card>
    </div>
  );
}
