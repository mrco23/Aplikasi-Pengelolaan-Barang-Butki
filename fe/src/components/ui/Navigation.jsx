import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '../../utils/format';
import { IconBtn } from './Button';

export function Tabs({ tabs, active, onChange }) {
  return (
    <div className="flex gap-1 overflow-x-auto border-b border-slate-200">
      {tabs.map((t) => (
        <button key={t.key} type="button" onClick={() => onChange(t.key)}
          className={cn('flex items-center gap-1.5 whitespace-nowrap border-b-2 px-3.5 py-2.5 text-[13px] font-semibold transition',
            active === t.key ? 'border-blue-600 text-blue-700' : 'border-transparent text-slate-500 hover:border-slate-300 hover:text-slate-700')}>
          {t.icon && <t.icon size={15} />}
          {t.label}
          {t.count !== undefined && (
            <span className={cn('rounded-full px-1.5 text-[10px] tabular-nums', active === t.key ? 'bg-blue-50 text-blue-700' : 'bg-slate-100 text-slate-500')}>{t.count}</span>
          )}
        </button>
      ))}
    </div>
  );
}

export function Pagination({ page, pageSize, total, onPage }) {
  const pages = Math.max(1, Math.ceil(total / pageSize));
  if (total === 0) return null;
  const from = (page - 1) * pageSize + 1;
  const to = Math.min(total, page * pageSize);
  const nums = [];
  for (let i = 1; i <= pages; i++) {
    if (i === 1 || i === pages || Math.abs(i - page) <= 1) nums.push(i);
    else if (nums[nums.length - 1] !== '…') nums.push('…');
  }
  return (
    <div className="flex flex-col items-center justify-between gap-3 border-t border-slate-100 px-5 py-3 sm:flex-row">
      <p className="text-xs text-slate-500">
        Menampilkan <span className="font-semibold tabular-nums text-slate-700">{from}–{to}</span> dari{' '}
        <span className="font-semibold tabular-nums text-slate-700">{total}</span> data
      </p>
      <div className="flex items-center gap-1">
        <IconBtn icon={ChevronLeft} title="Halaman sebelumnya" disabled={page <= 1} onClick={() => onPage(page - 1)} />
        {nums.map((n, i) => (n === '…'
          ? <span key={'e' + i} className="px-1 text-xs text-slate-400">…</span>
          : (
            <button key={n} type="button" onClick={() => onPage(n)}
              className={cn('h-8 min-w-[32px] rounded-md px-2 text-xs font-semibold tabular-nums transition',
                n === page ? 'bg-blue-600 text-white shadow-sm' : 'border border-slate-200 bg-white text-slate-600 hover:bg-slate-50')}>
              {n}
            </button>
          )))}
        <IconBtn icon={ChevronRight} title="Halaman berikutnya" disabled={page >= pages} onClick={() => onPage(page + 1)} />
      </div>
    </div>
  );
}

/* Hook kecil untuk paginasi daftar */
export function paginate(list, page, pageSize) {
  const pages = Math.max(1, Math.ceil(list.length / pageSize));
  const cur = Math.min(page, pages);
  return { cur, rows: list.slice((cur - 1) * pageSize, cur * pageSize) };
}
