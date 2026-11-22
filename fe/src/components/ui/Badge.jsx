import { BADGE_TONE, KONDISI, KONDISI_DOT, STATUS_BB, TAHAP, STATUS_KEMBALI } from '../../constants';
import { cn, initials } from '../../utils/format';

export function Badge({ children, tone }) {
  return (
    <span className={cn('inline-flex items-center gap-1 whitespace-nowrap rounded-full px-2 py-0.5 text-[11px] font-semibold ring-1 ring-inset',
      BADGE_TONE[tone] || 'bg-slate-100 text-slate-600 ring-slate-500/20')}>
      {children}
    </span>
  );
}

export const StatusBadge = ({ status }) => <Badge tone={status}>{STATUS_BB[status] || status}</Badge>;
export const TahapBadge = ({ tahap }) => <Badge tone={tahap}>{TAHAP[tahap] || tahap}</Badge>;
export const KembaliBadge = ({ status }) => <Badge tone={status}>{STATUS_KEMBALI[status] || status}</Badge>;

export function CondDot({ kondisi }) {
  return (
    <span className="inline-flex items-center gap-1.5 whitespace-nowrap text-xs text-slate-600">
      <span className={cn('h-1.5 w-1.5 rounded-full', KONDISI_DOT[kondisi] || 'bg-slate-400')} />
      {KONDISI[kondisi] || kondisi}
    </span>
  );
}

export function Avatar({ nama, size = 'h-8 w-8 text-[10px]' }) {
  return <span className={cn('grid shrink-0 place-items-center rounded-full bg-navy-800 font-bold text-white', size)}>{initials(nama)}</span>;
}

/* Chip abu-abu dengan ikon (dipakai di header detail) */
export function Chip({ icon: Ico, children }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-2.5 py-1 text-slate-600">
      <Ico size={13} />{children}
    </span>
  );
}
