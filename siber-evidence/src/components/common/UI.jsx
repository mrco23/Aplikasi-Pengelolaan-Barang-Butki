import React, { useRef, useLayoutEffect, Fragment, useEffect } from 'react';
import { cn, BADGE_TONE, KONDISI_DOT, KAT_ICON, JENIS_META, fmtDateTime, fmtDate } from '../../utils/helpers';
import { useApp } from '../../context/AppContext';

let lucideQueued = false;
function queueLucide() {
  if (lucideQueued) return;
  lucideQueued = true;
  requestAnimationFrame(() => {
    lucideQueued = false;
    try { if (window.lucide) window.lucide.createIcons(); } catch (e) { /* abaikan */ }
  });
}

export function Icon({ name, size = 18, className = '', strokeWidth = 2 }) {
  const ref = useRef(null);
  useLayoutEffect(() => {
    const host = ref.current;
    if (!host) return;
    host.innerHTML = '';
    const ph = document.createElement('i');
    ph.setAttribute('data-lucide', name);
    ph.setAttribute('width', String(size));
    ph.setAttribute('height', String(size));
    ph.setAttribute('stroke-width', String(strokeWidth));
    host.appendChild(ph);
    queueLucide();
  }, [name, size, strokeWidth]);
  return <span ref={ref} className={cn('inline-flex shrink-0 items-center justify-center leading-none', className)} />;
}

export function Badge({ children, tone }) {
  const key = tone || String(children);
  return (
    <span className={cn('inline-flex items-center gap-1 whitespace-nowrap rounded-full px-2 py-0.5 text-[11px] font-semibold ring-1 ring-inset', BADGE_TONE[key] || 'bg-slate-100 text-slate-600 ring-slate-500/20')}>
      {children}
    </span>
  );
}

export function CondDot({ kondisi }) {
  return (
    <span className="inline-flex items-center gap-1.5 whitespace-nowrap text-xs text-slate-600">
      <span className={cn('h-1.5 w-1.5 rounded-full', KONDISI_DOT[kondisi] || 'bg-slate-400')} />
      {kondisi}
    </span>
  );
}

export function Avatar({ nama, size = 'h-8 w-8 text-[10px]' }) {
  const initials = (nama || '?').split(' ').filter(Boolean).slice(0, 2).map(w => w[0]).join('').toUpperCase();
  return <span className={cn('grid shrink-0 place-items-center rounded-full bg-navy-800 font-bold text-white', size)}>{initials}</span>;
}

function buttonClass(variant = 'primary', size = 'md', className = '') {
  const base = 'inline-flex items-center justify-center gap-2 rounded-lg font-semibold transition focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/40 disabled:cursor-not-allowed disabled:opacity-50';
  const sizes = { sm: 'px-2.5 py-1.5 text-xs', md: 'px-4 py-2 text-sm' };
  const variants = {
    primary: 'bg-blue-600 text-white shadow-sm hover:bg-blue-700 active:bg-blue-800',
    secondary: 'border border-slate-300 bg-white text-slate-700 shadow-sm hover:bg-slate-50 hover:text-navy-800',
    ghost: 'text-slate-600 hover:bg-slate-100 hover:text-navy-800',
    danger: 'bg-red-600 text-white shadow-sm hover:bg-red-700',
    navy: 'bg-navy-800 text-white shadow-sm hover:bg-navy-700',
  };
  return cn(base, sizes[size], variants[variant], className);
}

export function Button({ variant = 'primary', size = 'md', icon, iconRight, className = '', children, ...props }) {
  const is = size === 'sm' ? 14 : 16;
  return (
    <button className={buttonClass(variant, size, className)} {...props}>
      {icon && <Icon name={icon} size={is} />}
      {children}
      {iconRight && <Icon name={iconRight} size={is} />}
    </button>
  );
}

export function ButtonLink({ to, variant = 'primary', size = 'md', icon, className = '', children }) {
  const is = size === 'sm' ? 14 : 16;
  return (
    <a href={'#' + to} className={buttonClass(variant, size, className)}>
      {icon && <Icon name={icon} size={is} />}
      {children}
    </a>
  );
}

export function IconBtn({ icon, title, onClick, disabled, tone }) {
  return (
    <button type="button" title={title} aria-label={title} disabled={disabled} onClick={onClick}
      className={cn('grid h-8 w-8 place-items-center rounded-md border bg-white transition disabled:cursor-not-allowed disabled:opacity-40',
        tone === 'danger'
          ? 'border-slate-200 text-slate-400 hover:border-red-200 hover:bg-red-50 hover:text-red-600'
          : 'border-slate-200 text-slate-500 hover:border-slate-300 hover:bg-slate-50 hover:text-navy-800')}>
      <Icon name={icon} size={15} />
    </button>
  );
}

const inputBase = 'w-full rounded-lg border bg-white px-3 py-2 text-sm text-slate-800 placeholder:text-slate-400 transition focus:outline-none focus:ring-2';

export function Input({ error, className = '', ...props }) {
  return <input className={cn(inputBase, error ? 'border-red-400 focus:border-red-500 focus:ring-red-500/15' : 'border-slate-300 focus:border-blue-500 focus:ring-blue-500/15', 'disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-400', className)} {...props} />;
}

export function Textarea({ error, className = '', ...props }) {
  return <textarea rows={3} className={cn(inputBase, error ? 'border-red-400 focus:border-red-500 focus:ring-red-500/15' : 'border-slate-300 focus:border-blue-500 focus:ring-blue-500/15', className)} {...props} />;
}

export function Select({ error, options, placeholder, className = '', ...props }) {
  return (
    <div className={cn('relative', className)}>
      <select
        className={cn(inputBase, 'appearance-none py-2 pl-3 pr-9',
          error ? 'border-red-400 focus:border-red-500 focus:ring-red-500/15' : 'border-slate-300 focus:border-blue-500 focus:ring-blue-500/15',
          'disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-400')}
        {...props}>
        {placeholder && <option value="">{placeholder}</option>}
        {options.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
      </select>
      <Icon name="chevron-down" size={15} className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
    </div>
  );
}

export function SearchInput({ className = '', ...props }) {
  return (
    <div className={cn('relative', className)}>
      <Icon name="search" size={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
      <input className={cn(inputBase, 'border-slate-300 py-2 pl-9 pr-3 focus:border-blue-500 focus:ring-blue-500/15')} {...props} />
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

export function FormSection({ icon, title, desc, children }) {
  return (
    <section className="rounded-xl border border-slate-200 bg-white shadow-card">
      <header className="flex items-start gap-3 border-b border-slate-100 px-5 py-4">
        <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-blue-50 text-blue-600"><Icon name={icon} size={17} /></span>
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

export function StatCard({ to, icon, tint, label, value, sub }) {
  const inner = (
    <Fragment>
      <span className={cn('grid h-10 w-10 shrink-0 place-items-center rounded-lg', tint)}><Icon name={icon} size={19} /></span>
      <div className="min-w-0">
        <p className="text-xs font-medium text-slate-500">{label}</p>
        <p className="mt-0.5 text-2xl font-bold leading-none tabular-nums text-navy-800">{value}</p>
        {sub && <p className="mt-1.5 truncate text-[11px] text-slate-400">{sub}</p>}
      </div>
    </Fragment>
  );
  const cls = 'flex items-center gap-4 rounded-xl border border-slate-200 bg-white p-5 shadow-card transition';
  return to
    ? <a href={'#' + to} className={cn(cls, 'hover:border-blue-300 hover:shadow-md')}>{inner}</a>
    : <div className={cls}>{inner}</div>;
}

export function Tabs({ tabs, active, onChange }) {
  return (
    <div className="flex gap-1 overflow-x-auto border-b border-slate-200">
      {tabs.map(t => (
        <button key={t.key} onClick={() => onChange(t.key)}
          className={cn('flex items-center gap-1.5 whitespace-nowrap border-b-2 px-3.5 py-2.5 text-[13px] font-semibold transition',
            active === t.key ? 'border-blue-600 text-blue-700' : 'border-transparent text-slate-500 hover:border-slate-300 hover:text-slate-700')}>
          {t.icon && <Icon name={t.icon} size={15} />}
          {t.label}
        </button>
      ))}
    </div>
  );
}

export function Pagination({ page, pageSize, total, onPage }) {
  const pages = Math.max(1, Math.ceil(total / pageSize));
  if (pages <= 1) return null;
  const arr = [];
  if (pages <= 7) { for (let i = 1; i <= pages; i++) arr.push(i); }
  else {
    if (page <= 3) { arr.push(1, 2, 3, 4, '...', pages); }
    else if (page >= pages - 2) { arr.push(1, '...', pages - 3, pages - 2, pages - 1, pages); }
    else { arr.push(1, '...', page - 1, page, page + 1, '...', pages); }
  }
  return (
    <div className="flex items-center justify-between border-t border-slate-100 px-5 py-3">
      <p className="text-[11px] text-slate-500">Menampilkan <span className="font-bold text-navy-800">{Math.min((page - 1) * pageSize + 1, total)}</span> – <span className="font-bold text-navy-800">{Math.min(page * pageSize, total)}</span> dari <span className="font-bold text-navy-800">{total}</span> data</p>
      <div className="flex items-center gap-1">
        <IconBtn icon="chevron-left" title="Halaman sebelumnya" disabled={page <= 1} onClick={() => onPage(page - 1)} />
        {arr.map((n, i) =>
          n === '...'
            ? <span key={'el-' + i} className="px-1 text-xs text-slate-400">…</span>
            : <button key={String(n)} onClick={() => onPage(n)}
                className={cn('h-8 min-w-[32px] rounded-md px-2 text-xs font-semibold tabular-nums transition',
                  n === page ? 'bg-blue-600 text-white shadow-sm' : 'border border-slate-200 bg-white text-slate-600 hover:bg-slate-50')}>
                {n}
              </button>)}
        <IconBtn icon="chevron-right" title="Halaman berikutnya" disabled={page >= pages} onClick={() => onPage(page + 1)} />
      </div>
    </div>
  );
}

export function EmptyState({ icon = 'inbox', title, desc, action }) {
  return (
    <div className="flex flex-col items-center justify-center px-6 py-14 text-center">
      <div className="grid h-14 w-14 place-items-center rounded-2xl bg-slate-100 text-slate-400"><Icon name={icon} size={26} /></div>
      <h3 className="mt-4 text-sm font-bold text-navy-800">{title}</h3>
      <p className="mt-1 max-w-sm text-xs leading-relaxed text-slate-500">{desc}</p>
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}

export function Modal({ open, onClose, title, desc, children, footer, width = 'max-w-lg' }) {
  useEffect(() => {
    if (!open) return;
    const f = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', f);
    document.body.style.overflow = 'hidden';
    return () => { window.removeEventListener('keydown', f); document.body.style.overflow = ''; };
  }, [open, onClose]);
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[90] flex items-end justify-center p-4 sm:items-center">
      <div className="absolute inset-0 bg-navy-950/50" onClick={onClose} />
      <div className={cn('anim-fade-up relative flex max-h-[92vh] w-full flex-col rounded-xl bg-white shadow-2xl', width)}>
        <header className="flex items-start justify-between gap-4 border-b border-slate-100 px-5 py-4">
          <div>
            <h3 className="text-sm font-bold text-navy-800">{title}</h3>
            {desc && <p className="mt-0.5 text-xs leading-relaxed text-slate-500">{desc}</p>}
          </div>
          <button onClick={onClose} className="rounded-md p-1 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600" aria-label="Tutup">
            <Icon name="x" size={17} />
          </button>
        </header>
        <div className="flex-1 overflow-y-auto px-5 py-4">{children}</div>
        {footer && <footer className="flex flex-wrap justify-end gap-2 border-t border-slate-100 px-5 py-3">{footer}</footer>}
      </div>
    </div>
  );
}

export function ConfirmDialog({ open, onClose, onConfirm, title, children, confirmLabel = 'Hapus', danger = true, confirmDisabled }) {
  return (
    <Modal open={open} onClose={onClose} title={title} width="max-w-md"
      footer={<Fragment>
        <Button variant="secondary" onClick={onClose}>Batal</Button>
        <Button variant={danger ? 'danger' : 'primary'} disabled={confirmDisabled} onClick={onConfirm}>{confirmLabel}</Button>
      </Fragment>}>
      <div className="flex items-start gap-3">
        <span className={cn('grid h-10 w-10 shrink-0 place-items-center rounded-full', danger ? 'bg-red-50 text-red-600' : 'bg-blue-50 text-blue-600')}>
          <Icon name={danger ? 'alert-triangle' : 'info'} size={19} />
        </span>
        <div className="text-sm leading-relaxed text-slate-600">{children}</div>
      </div>
    </Modal>
  );
}

export function Toaster() {
  const { toasts, dismissToast } = useApp();
  const meta = {
    success: { icon: 'check', cls: 'border-emerald-500 text-emerald-600' },
    error: { icon: 'alert-triangle', cls: 'border-red-500 text-red-600' },
    info: { icon: 'info', cls: 'border-blue-500 text-blue-600' },
  };
  return (
    <div className="no-print fixed right-4 top-4 z-[100] flex w-[340px] max-w-[calc(100vw-2rem)] flex-col gap-2">
      {toasts.map(t => {
        const m = meta[t.type] || meta.info;
        return (
          <div key={t.id} className={cn('anim-toast flex items-start gap-3 rounded-lg border border-slate-200 border-l-4 bg-white p-3 shadow-lg', m.cls)}>
            <Icon name={m.icon} size={17} className="mt-0.5" />
            <div className="min-w-0 flex-1">
              <p className="text-xs font-bold text-navy-800">{t.title}</p>
              {t.message && <p className="mt-0.5 text-[11px] leading-relaxed text-slate-500">{t.message}</p>}
            </div>
            <button onClick={() => dismissToast(t.id)} className="text-slate-300 transition hover:text-slate-500" aria-label="Tutup notifikasi">
              <Icon name="x" size={14} />
            </button>
          </div>
        );
      })}
    </div>
  );
}

export function DemoNote({ children }) {
  return (
    <p className="mt-3 flex items-start gap-1.5 text-[11px] leading-relaxed text-slate-400">
      <Icon name="info" size={13} className="mt-px shrink-0" />
      <span>{children}</span>
    </p>
  );
}

export function PrintHeader({ subtitle }) {
  return (
    <div className="print-only mb-4 border-b-2 border-navy-800 pb-3 text-center">
      <p className="text-sm font-bold tracking-wide text-navy-800">KEPOLISIAN NEGARA REPUBLIK INDONESIA</p>
      <p className="text-sm font-semibold text-navy-800">POLDA SULAWESI UTARA</p>
      <p className="text-xs text-navy-800">DIREKTORAT RESERSE KRIMINAL SPESIAL — SUBBID SIBER</p>
      <p className="mt-1.5 text-xs font-semibold uppercase tracking-wide text-slate-700">{subtitle}</p>
    </div>
  );
}

export function Timeline({ items, showKode = true }) {
  const { data } = useApp();
  if (!items.length) return <p className="py-8 text-center text-xs text-slate-400">Belum ada kejadian tercatat.</p>;
  const idOf = (kode) => { const b = data.barang.find(x => x.kode === kode); return b ? b.id : ''; };
  return (
    <ol>
      {items.map((r, i) => {
        const m = JENIS_META[r.jenis] || JENIS_META.Perpindahan;
        const last = i === items.length - 1;
        const bid = idOf(r.kodeBB);
        return (
          <li key={r.id} className="flex gap-3">
            <div className="flex flex-col items-center">
              <span className={cn('grid h-8 w-8 shrink-0 place-items-center rounded-full ring-1 ring-inset', m.dot)}>
                <Icon name={m.icon} size={14} />
              </span>
              {!last && <span className="my-1 w-px flex-1 bg-slate-200" />}
            </div>
            <div className={cn('min-w-0 flex-1 pb-5', last && 'pb-1')}>
              <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                <span className={cn('inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-semibold ring-1 ring-inset', m.badge)}>
                  <Icon name={m.icon} size={11} />{r.jenis}
                </span>
                {showKode && bid && <a href={'#/barang-bukti/' + bid} className="text-xs font-bold text-navy-800 hover:text-blue-700">{r.kodeBB}</a>}
                {showKode && !bid && <span className="text-xs font-bold text-navy-800">{r.kodeBB}</span>}
                <span className="text-[11px] tabular-nums text-slate-400">{fmtDateTime(r.tanggalWaktu)}</span>
              </div>
              <p className="mt-1.5 flex flex-wrap items-center gap-1 text-xs text-slate-600">
                <span className="truncate">{r.lokasiAsal}</span>
                <Icon name="arrow-right" size={12} className="shrink-0 text-slate-400" />
                <span className="truncate font-medium text-navy-800">{r.lokasiTujuan}</span>
              </p>
              <p className="mt-0.5 text-[11px] text-slate-500">Petugas: {r.petugas} · {r.alasan}</p>
              {r.catatan && <p className="mt-1.5 rounded-lg border border-slate-100 bg-slate-50 px-2.5 py-1.5 text-[11px] leading-relaxed text-slate-500">{r.catatan}</p>}
              {r.jenis === 'Peminjaman' && r.harapanKembali && (
                <p className="mt-1.5 flex flex-wrap items-center gap-1.5 text-[11px] text-slate-500">
                  <span>Harap kembali: <span className="font-semibold text-slate-700">{fmtDate(r.harapanKembali)}</span></span>
                  {r.statusKembali && <Badge tone={r.statusKembali}>{r.statusKembali}</Badge>}
                </p>
              )}
            </div>
          </li>
        );
      })}
    </ol>
  );
}
