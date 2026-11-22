/* Garis waktu kejadian barang bukti (chain of custody) */
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { JENIS_META, JENIS_RIWAYAT } from '../../constants';
import { cn, fmtDate, fmtDateTime, todayISO } from '../../utils/format';
import { lokasiNama, penggunaNama } from '../../utils/selectors';
import { Badge, KembaliBadge } from '../ui';

export function JenisBadge({ jenis }) {
  const m = JENIS_META[jenis] || JENIS_META.perpindahan;
  return (
    <span className={cn('inline-flex items-center gap-1 whitespace-nowrap rounded-full px-2 py-0.5 text-[11px] font-semibold ring-1 ring-inset', m.badge)}>
      <m.icon size={11} />{JENIS_RIWAYAT[jenis]}
    </span>
  );
}

export function LoanInfo({ r, prefix = 'Harap kembali' }) {
  if (r.jenis !== 'peminjaman' || !r.tanggal_harapan_kembali) return null;
  const late = r.status_kembali === 'belum_kembali' && r.tanggal_harapan_kembali < todayISO();
  return (
    <span className="mt-1.5 flex flex-wrap items-center gap-1.5 text-[11px] text-slate-500">
      <span>{prefix}: <span className="font-semibold text-slate-700">{fmtDate(r.tanggal_harapan_kembali)}</span></span>
      {r.status_kembali && <KembaliBadge status={r.status_kembali} />}
      {late && <Badge tone="terlambat">Melewati tenggat</Badge>}
    </span>
  );
}

export default function Timeline({ items, showKode = true }) {
  const { lookup } = useApp();
  if (!items.length) return <p className="py-8 text-center text-xs text-slate-400">Belum ada kejadian tercatat.</p>;
  return (
    <ol>
      {items.map((r, i) => {
        const m = JENIS_META[r.jenis] || JENIS_META.perpindahan;
        const last = i === items.length - 1;
        const b = lookup.barang[r.barang_bukti_id];
        return (
          <li key={r.id} className="flex gap-3">
            <div className="flex flex-col items-center">
              <span className={cn('grid h-8 w-8 shrink-0 place-items-center rounded-full ring-1 ring-inset', m.dot)}>
                <m.icon size={14} />
              </span>
              {!last && <span className="my-1 w-px flex-1 bg-slate-200" />}
            </div>
            <div className={cn('min-w-0 flex-1 pb-5', last && 'pb-1')}>
              <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                <JenisBadge jenis={r.jenis} />
                {showKode && b && <Link to={`/petugas/barang-bukti/${b.id}`} className="text-xs font-bold text-navy-800 hover:text-blue-700">{b.kode}</Link>}
                <span className="text-[11px] tabular-nums text-slate-400">{fmtDateTime(r.tanggal_waktu)}</span>
              </div>
              <p className="mt-1.5 flex flex-wrap items-center gap-1 text-xs text-slate-600">
                <span className="truncate">{lokasiNama(lookup, r.lokasi_asal_id)}</span>
                <ArrowRight size={12} className="shrink-0 text-slate-400" />
                <span className="truncate font-medium text-navy-800">{lokasiNama(lookup, r.lokasi_tujuan_id)}</span>
              </p>
              <p className="mt-0.5 text-[11px] text-slate-500">Petugas: {penggunaNama(lookup, r.petugas_id)} · {r.alasan}</p>
              {r.catatan && <p className="mt-1.5 rounded-lg border border-slate-100 bg-slate-50 px-2.5 py-1.5 text-[11px] leading-relaxed text-slate-500">{r.catatan}</p>}
              <LoanInfo r={r} />
            </div>
          </li>
        );
      })}
    </ol>
  );
}
