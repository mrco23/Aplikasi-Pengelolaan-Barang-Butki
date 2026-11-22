import { ChevronDown, Search } from 'lucide-react';
import { cn } from '../../utils/format';

export const inputBase = 'w-full rounded-lg border bg-white px-3 py-2 text-sm text-slate-800 placeholder:text-slate-400 transition focus:outline-none focus:ring-2';
const okRing = 'border-slate-300 focus:border-blue-500 focus:ring-blue-500/15';
const errRing = 'border-red-400 focus:border-red-500 focus:ring-red-500/15';
const disabledCls = 'disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-400';

export function Input({ error, className = '', ...props }) {
  return <input className={cn(inputBase, error ? errRing : okRing, disabledCls, className)} {...props} />;
}

export function Textarea({ error, className = '', rows = 3, ...props }) {
  return <textarea rows={rows} className={cn(inputBase, error ? errRing : okRing, className)} {...props} />;
}

/* options: [[value, label], ...] */
export function Select({ error, options, placeholder, className = '', ...props }) {
  return (
    <div className={cn('relative', className)}>
      <select className={cn(inputBase, 'appearance-none py-2 pl-3 pr-9', error ? errRing : okRing, disabledCls)} {...props}>
        {placeholder !== undefined && <option value="">{placeholder}</option>}
        {options.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
      </select>
      <ChevronDown size={15} className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
    </div>
  );
}

export function SearchInput({ className = '', ...props }) {
  return (
    <div className={cn('relative', className)}>
      <Search size={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
      <input className={cn(inputBase, okRing, 'py-2 pl-9 pr-3')} {...props} />
    </div>
  );
}

export function Field({ label, required, error, hint, children, className = '' }) {
  return (
    <label className={cn('block', className)}>
      <span className="mb-1.5 flex items-center gap-1 text-xs font-semibold text-slate-600">
        {label}{required && <span className="text-red-500">*</span>}
      </span>
      {children}
      {hint && !error && <span className="mt-1 block text-[11px] leading-relaxed text-slate-400">{hint}</span>}
      {error && <span className="mt-1 block text-[11px] font-medium text-red-600">{error}</span>}
    </label>
  );
}

/* Input dengan ikon di kiri (dipakai di halaman login) */
export function IconInput({ icon: Ico, className = '', right, ...props }) {
  return (
    <div className="relative">
      <Ico size={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
      <input className={cn(inputBase, okRing, 'py-2 pl-9', right ? 'pr-10' : 'pr-3', className)} {...props} />
      {right}
    </div>
  );
}
