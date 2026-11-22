import { Inbox, Info, TriangleAlert, Check, X } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { cn } from '../../utils/format';

export function EmptyState({ icon: Ico = Inbox, title, desc, action }) {
  return (
    <div className="flex flex-col items-center justify-center px-6 py-14 text-center">
      <div className="grid h-14 w-14 place-items-center rounded-2xl bg-slate-100 text-slate-400"><Ico size={26} /></div>
      <h3 className="mt-4 text-sm font-bold text-navy-800">{title}</h3>
      <p className="mt-1 max-w-sm text-xs leading-relaxed text-slate-500">{desc}</p>
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}

export function DemoNote({ children }) {
  return (
    <p className="mt-3 flex items-start gap-1.5 text-[11px] leading-relaxed text-slate-400">
      <Info size={13} className="mt-px shrink-0" />
      <span>{children}</span>
    </p>
  );
}

/* Kotak pesan: tone amber (peringatan), blue (info), red (bahaya) */
export function Alert({ tone = 'amber', children, onClose, className = '' }) {
  const t = {
    amber: { box: 'border-amber-200 bg-amber-50', icon: 'text-amber-600', text: 'text-amber-800', Ico: TriangleAlert },
    blue: { box: 'border-blue-100 bg-blue-50', icon: 'text-blue-600', text: 'text-blue-900', Ico: Info },
    red: { box: 'border-red-200 bg-red-50', icon: 'text-red-600', text: 'text-red-800', Ico: TriangleAlert },
  }[tone];
  return (
    <div className={cn('flex items-start justify-between gap-3 rounded-xl border px-4 py-3', t.box, className)}>
      <div className="flex items-start gap-3">
        <t.Ico size={18} className={cn('mt-0.5 shrink-0', t.icon)} />
        <div className={cn('text-xs leading-relaxed', t.text)}>{children}</div>
      </div>
      {onClose && (
        <button onClick={onClose} className={cn('transition opacity-70 hover:opacity-100', t.icon)} aria-label="Tutup">
          <X size={15} />
        </button>
      )}
    </div>
  );
}

export function Toaster() {
  const { toasts, dismissToast } = useApp();
  const meta = {
    success: { Ico: Check, cls: 'border-emerald-500 text-emerald-600' },
    error: { Ico: TriangleAlert, cls: 'border-red-500 text-red-600' },
    info: { Ico: Info, cls: 'border-blue-500 text-blue-600' },
  };
  return (
    <div className="no-print fixed right-4 top-4 z-[100] flex w-[340px] max-w-[calc(100vw-2rem)] flex-col gap-2">
      {toasts.map((t) => {
        const m = meta[t.type] || meta.info;
        return (
          <div key={t.id} className={cn('anim-toast flex items-start gap-3 rounded-lg border border-l-4 border-slate-200 bg-white p-3 shadow-lg', m.cls)}>
            <m.Ico size={17} className="mt-0.5 shrink-0" />
            <div className="min-w-0 flex-1">
              <p className="text-xs font-bold text-navy-800">{t.title}</p>
              {t.message && <p className="mt-0.5 text-[11px] leading-relaxed text-slate-500">{t.message}</p>}
            </div>
            <button onClick={() => dismissToast(t.id)} className="text-slate-300 transition hover:text-slate-500" aria-label="Tutup notifikasi">
              <X size={14} />
            </button>
          </div>
        );
      })}
    </div>
  );
}
