import React, { useState, useMemo } from 'react';
import { useApp } from '../../../context/AppContext';
import { Icon, Badge, Button, ButtonLink, Card, InfoGrid, DemoNote, CondDot, Modal, Field, Input, Select, Textarea, Timeline, NotFound, IconBtn } from '../../../components/common/UI';
import { fmtDate, KAT_ICON, JENIS_RIWAYAT, LOKASI, todayISO, nowLocal } from '../../../utils/helpers';

export default function BarangBuktiDetailPage({ id }) {
  const { data, user, addRiwayat, toast } = useApp();
  const b = data.barang.find((x) => x.id === id);
  const [formOpen, setFormOpen] = useState(false);
  const PS = 10;
  const [page, setPage] = useState(1);

  if (!b) return <NotFound message="Data barang bukti tidak ditemukan pada penyimpanan demo." />;
  if (b.draf) {
    window.location.hash = '#/barang-bukti/' + b.id + '/edit';
    return null;
  }

  const p = data.perkara.find((x) => x.nomorLP === b.nomorLP);
  const history = [...data.riwayat].filter((r) => r.kodeBB === b.kode).sort((x, y) => y.tanggalWaktu.localeCompare(x.tanggalWaktu));
  const pages = Math.max(1, Math.ceil(history.length / PS));
  const pagedHistory = history.slice((page - 1) * PS, page * PS);

  return (
    <div className="space-y-5">
      <a href="#/barang-bukti" className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 transition hover:text-blue-700">
        <Icon name="arrow-left" size={14} />Kembali ke Daftar Barang Bukti
      </a>

      <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-card">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex flex-1 items-start gap-4">
            <span className="hidden h-14 w-14 shrink-0 place-items-center rounded-xl bg-blue-50 text-blue-600 sm:grid">
              <Icon name={KAT_ICON[b.kategori] || 'package'} size={28} />
            </span>
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-xl font-bold text-navy-800">{b.kode}</h2>
                <Badge>{b.status}</Badge>
                {history[0]?.statusKembali === 'Belum Kembali' && <Badge tone="Belum Kembali">Belum Kembali</Badge>}
              </div>
              <p className="mt-1 text-base font-medium text-slate-700">{b.nama}</p>
              <div className="mt-3 flex flex-wrap gap-2 text-xs">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-2.5 py-1 text-slate-600"><Icon name="tag" size={13} />{b.kategori}</span>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-2.5 py-1 text-slate-600"><Icon name="map-pin" size={13} />{b.lokasi}</span>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-2.5 py-1 text-slate-600"><CondDot kondisi={b.kondisi} /></span>
              </div>
            </div>
          </div>
          <div className="no-print flex w-full flex-wrap gap-2 sm:w-auto sm:flex-col sm:items-end">
            <Button icon="plus" onClick={() => setFormOpen(true)}>Catat Riwayat Baru</Button>
            <ButtonLink to={`/barang-bukti/${b.id}/edit`} variant="secondary" icon="pencil">Edit Data Utama</ButtonLink>
          </div>
        </div>
      </div>

      <div className="grid gap-5 lg:grid-cols-3">
        <div className="space-y-5 lg:col-span-2">
          <Card title="Rincian Barang Bukti">
            <InfoGrid rows={[
              { l: 'Nomor Seri / IMEI', v: b.nomorSeri },
              { l: 'Tanggal Penerimaan', v: fmtDate(b.tanggalPenerimaan) },
              { l: 'Terkait Perkara (LP)', v: p ? <a href={'#/perkara/' + p.id} className="font-semibold text-blue-600 hover:underline">{b.nomorLP}</a> : b.nomorLP },
              { l: 'Petugas Penerima', v: b.petugasPenerima },
              { l: 'Deskripsi / Ciri Khusus', v: b.deskripsi, wide: true },
              { l: 'Catatan Awal', v: b.catatan, wide: true },
            ]} />
            {b.lampiran && b.lampiran.length > 0 && (
              <div className="mt-6 border-t border-slate-100 pt-5">
                <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">Lampiran Dokumen</p>
                <div className="mt-3 flex flex-wrap gap-3">
                  {b.lampiran.map((l) => (
                    <a key={l.id} href={'#'} onClick={(e) => { e.preventDefault(); toast('info', 'Unduh demo', 'File tidak benar-benar diunduh pada versi demo.'); }}
                      className="flex items-center gap-2.5 rounded-lg border border-slate-200 px-3 py-2 text-xs transition hover:border-blue-300 hover:bg-blue-50">
                      <Icon name="file" size={16} className="text-blue-500" />
                      <span className="font-medium text-slate-700">{l.nama}</span>
                    </a>
                  ))}
                </div>
              </div>
            )}
          </Card>

          <Card title="Riwayat Perpindahan & Status" desc="Jejak penanganan barang bukti sejak diterima.">
            <Timeline items={pagedHistory} showKode={false} />
            {pages > 1 && (
              <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-4">
                <Button variant="ghost" size="sm" icon="chevron-left" disabled={page <= 1} onClick={() => setPage(p => p - 1)}>Lebih baru</Button>
                <span className="text-[11px] font-semibold text-slate-500">Hal {page} / {pages}</span>
                <Button variant="ghost" size="sm" iconRight="chevron-right" disabled={page >= pages} onClick={() => setPage(p => p + 1)}>Lebih lama</Button>
              </div>
            )}
          </Card>
        </div>

        <div className="space-y-5">
          {history[0]?.statusKembali === 'Belum Kembali' && (
            <div className="rounded-xl border border-amber-200 bg-amber-50 p-5">
              <h3 className="flex items-center gap-2 text-sm font-bold text-amber-800"><Icon name="alert-circle" size={17} />Belum Dikembalikan</h3>
              <p className="mt-1 text-xs text-amber-700">Barang bukti ini sedang dipinjam/diperiksa dan belum dicatat pengembaliannya. Harap kembali pada: <span className="font-semibold">{fmtDate(history[0].harapanKembali)}</span>.</p>
              <Button size="sm" className="mt-3 w-full bg-amber-600 hover:bg-amber-700" onClick={() => setFormOpen(true)}>Catat Pengembalian</Button>
            </div>
          )}

          <Card title="Informasi Perkara">
            {p ? (
              <Fragment>
                <p className="text-xs font-bold text-navy-800">{p.nomorLP}</p>
                <p className="mt-1 text-xs leading-relaxed text-slate-600 line-clamp-3">{p.uraian}</p>
                <div className="mt-3 flex gap-2"><Badge>{p.tahap}</Badge></div>
                <ButtonLink to={`/perkara/${p.id}`} variant="secondary" size="sm" className="mt-4 w-full">Detail Perkara</ButtonLink>
              </Fragment>
            ) : <p className="text-xs text-slate-500">Informasi perkara tidak tersedia.</p>}
          </Card>
        </div>
      </div>

      <RiwayatFormModal open={formOpen} onClose={() => setFormOpen(false)} bb={b} />
    </div>
  );
}

function RiwayatFormModal({ open, onClose, bb }) {
  const { data, user, addRiwayat, toast } = useApp();
  const [f, setF] = useState({ jenis: '', tanggalWaktu: nowLocal(), lokasiTujuan: '', petugas: user.nama, alasan: '', catatan: '', harapanKembali: '' });
  const [errs, setErrs] = useState({});

  useEffect(() => {
    if (open) setF({ jenis: '', tanggalWaktu: nowLocal(), lokasiTujuan: '', petugas: user.nama, alasan: '', catatan: '', harapanKembali: '' });
  }, [open, user.nama]);

  const set = (k, v) => setF(o => ({ ...o, [k]: v }));
  const userOpt = data.users.filter(u => u.status === 'Aktif').map(u => [u.nama, u.nama]);
  const isPinjam = f.jenis === 'Peminjaman';
  const isKembali = f.jenis === 'Pengembalian';

  function submit() {
    const e = {};
    if (!f.jenis) e.jenis = 'Pilih jenis pergerakan.';
    if (!f.tanggalWaktu) e.tanggalWaktu = 'Tanggal & waktu wajib diisi.';
    if (!f.lokasiTujuan && !isKembali && f.jenis !== 'Pemeriksaan') e.lokasiTujuan = 'Lokasi tujuan wajib diisi.';
    if (!f.petugas) e.petugas = 'Pilih petugas yang bertanggung jawab.';
    if (!f.alasan.trim()) e.alasan = 'Alasan perpindahan wajib diisi.';
    setErrs(e);
    if (Object.keys(e).length) return;

    addRiwayat({
      kodeBB: bb.kode, jenis: f.jenis, tanggalWaktu: f.tanggalWaktu,
      lokasiAsal: bb.lokasi, lokasiTujuan: f.lokasiTujuan || bb.lokasi,
      petugas: f.petugas, alasan: f.alasan, catatan: f.catatan,
      harapanKembali: isPinjam ? f.harapanKembali : '',
      statusKembali: isPinjam ? 'Belum Kembali' : ''
    });
    toast('success', 'Riwayat ditambahkan', 'Pergerakan barang bukti tercatat.');
    onClose();
  }

  return (
    <Modal open={open} onClose={onClose} width="max-w-xl"
      title="Catat Riwayat Perpindahan" desc={`Penambahan riwayat pergerakan untuk barang bukti ${bb.kode}.`}
      footer={<React.Fragment><Button variant="secondary" onClick={onClose}>Batal</Button><Button icon="check" onClick={submit}>Simpan Riwayat</Button></React.Fragment>}>
      <div className="grid gap-4">
        <Field label="Jenis Pergerakan" required error={errs.jenis}>
          <Select value={f.jenis} error={errs.jenis} onChange={e => {
            const j = e.target.value; set('jenis', j);
            if (j === 'Peminjaman') set('lokasiTujuan', 'Ruang Forensik Digital');
            else if (j === 'Pengembalian') {
              const h = [...data.riwayat].sort((a,b)=>b.tanggalWaktu.localeCompare(a.tanggalWaktu)).find(x=>x.kodeBB===bb.kode && x.jenis==='Peminjaman');
              set('lokasiTujuan', h ? h.lokasiAsal : '');
            } else set('lokasiTujuan', '');
          }} options={JENIS_RIWAYAT.filter(x => x !== 'Penerimaan').map(x => [x, x])} placeholder="Pilih jenis…" />
        </Field>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Tanggal & Waktu" required error={errs.tanggalWaktu}>
            <Input type="datetime-local" value={f.tanggalWaktu} error={errs.tanggalWaktu} onChange={e => set('tanggalWaktu', e.target.value)} />
          </Field>
          <Field label="Petugas Penanggung Jawab" required error={errs.petugas}>
            <Select value={f.petugas} error={errs.petugas} onChange={e => set('petugas', e.target.value)} options={userOpt} />
          </Field>
        </div>
        {f.jenis !== 'Pemeriksaan' && !isKembali && (
          <Field label="Lokasi Tujuan / Pihak Peminjam" required error={errs.lokasiTujuan}>
            <div className="space-y-2">
              <Select value={LOKASI.includes(f.lokasiTujuan) ? f.lokasiTujuan : (f.lokasiTujuan ? '_c' : '')}
                onChange={e => { const v = e.target.value; if (v !== '_c') set('lokasiTujuan', v); }}
                options={[...LOKASI.map(x => [x, x]), ['_c', 'Ketik lokasi lainnya…']]} placeholder="Pilih lokasi standar…" />
              {(!LOKASI.includes(f.lokasiTujuan) && f.lokasiTujuan !== '') || LOKASI.includes(f.lokasiTujuan) === false ? (
                <Input value={f.lokasiTujuan} onChange={e => set('lokasiTujuan', e.target.value)} placeholder="Ketik spesifik lokasi tujuan…" />
              ) : null}
            </div>
          </Field>
        )}
        {isKembali && (
          <Field label="Dikembalikan ke Lokasi" required error={errs.lokasiTujuan}>
            <Select value={f.lokasiTujuan} error={errs.lokasiTujuan} onChange={e => set('lokasiTujuan', e.target.value)} options={LOKASI.map(x => [x, x])} placeholder="Pilih lokasi penyimpanan kembali…" />
          </Field>
        )}
        {isPinjam && (
          <Field label="Harapan Kembali (Opsional)">
            <Input type="date" value={f.harapanKembali} onChange={e => set('harapanKembali', e.target.value)} />
          </Field>
        )}
        <Field label="Alasan / Keperluan" required error={errs.alasan}>
          <Textarea value={f.alasan} error={errs.alasan} onChange={e => set('alasan', e.target.value)} placeholder="Tuliskan tujuan perpindahan atau peminjaman secara rinci…" />
        </Field>
        <Field label="Catatan Tambahan (Opsional)">
          <Input value={f.catatan} onChange={e => set('catatan', e.target.value)} placeholder="Informasi pendukung lainnya…" />
        </Field>
      </div>
    </Modal>
  );
}
