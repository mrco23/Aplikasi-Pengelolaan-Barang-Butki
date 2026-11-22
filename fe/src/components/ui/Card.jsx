import { Link } from 'react-router-dom';
import { cn } from '../../utils/format';

export function Card({ title, desc, actions, children, className = '', noPad }) {
  return (
    <section className={cn('rounded-xl border border-slate-200 bg-white shadow-card', className)}>
      {(title || actions) && (
        <header className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 px-5 py-4">
          <div className="min-w-0">
            {title && <h3 className="text-sm font-bold text-navy-800">{title}</h3>}
            {desc && <p className="mt-0.5 text-xs text-slate-500">{desc}</p>}
          </div>
          {actions}
        </header>
      )}
      <div className={noPad ? '' : 'p-5'}>{children}</div>
    </section>
  );
}

export function FormSection({ icon: Ico, title, desc, children }) {
  return (
    <section className="rounded-xl border border-slate-200 bg-white shadow-card">
      <header className="flex items-start gap-3 border-b border-slate-100 px-5 py-4">
        <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-blue-50 text-blue-600"><Ico size={17} /></span>
        <div>
          <h3 className="text-sm font-bold text-navy-800">{title}</h3>
          <p className="mt-0.5 text-xs text-slate-500">{desc}</p>
        </div>
      </header>
      <div className="grid gap-4 px-5 py-5 sm:grid-cols-2">{children}</div>
    </section>
  );
}

export function InfoGrid({ rows }) {
  return (
    <dl className="grid gap-x-6 gap-y-4 sm:grid-cols-2">
      {rows.map((r, i) => (
        <div key={i} className={r.wide ? 'sm:col-span-2' : ''}>
          <dt className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">{r.l}</dt>
          <dd className="mt-0.5 break-words text-sm text-slate-700">{r.v || <span className="text-slate-400">—</span>}</dd>
        </div>
      ))}
    </dl>
  );
}

export function StatCard({ to, icon: Ico, tint, label, value, sub }) {
  const inner = (
    <>
      <span className={cn('grid h-10 w-10 shrink-0 place-items-center rounded-lg', tint)}><Ico size={19} /></span>
      <div className="min-w-0">
        <p className="text-xs font-medium text-slate-500">{label}</p>
        <p className="mt-0.5 text-2xl font-bold leading-none tabular-nums text-navy-800">{value}</p>
        {sub && <p className="mt-1.5 truncate text-[11px] text-slate-400">{sub}</p>}
      </div>
    </>
  );
  const cls = 'flex items-center gap-4 rounded-xl border border-slate-200 bg-white p-5 shadow-card transition';
  return to
    ? <Link to={to} className={cn(cls, 'hover:border-blue-300 hover:shadow-md')}>{inner}</Link>
    : <div className={cls}>{inner}</div>;
}

/* Tabel standar: header abu-abu, baris dengan pemisah */
export function Table({ minWidth = 640, head, children }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left text-sm" style={{ minWidth }}>
        <thead>
          <tr className="border-b border-slate-200 bg-slate-50/80 text-[11px] uppercase tracking-wide text-slate-500">
            {head.map((h, i) => (
              <th key={i} className={cn('py-3 font-semibold', i === 0 ? 'pl-5 pr-4' : i === head.length - 1 ? 'pl-4 pr-5' : 'px-4',
                typeof h === 'object' && h.className)}>
                {typeof h === 'object' ? h.label : h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">{children}</tbody>
      </table>
    </div>
  );
}
