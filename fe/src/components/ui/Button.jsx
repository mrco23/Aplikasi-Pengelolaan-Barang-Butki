import { Link } from 'react-router-dom';
import { cn } from '../../utils/format';

export function buttonClass(variant = 'primary', size = 'md', className = '') {
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

export function Button({ variant = 'primary', size = 'md', icon: IconL, iconRight: IconR, className = '', type = 'button', children, ...props }) {
  const is = size === 'sm' ? 14 : 16;
  return (
    <button type={type} className={buttonClass(variant, size, className)} {...props}>
      {IconL && <IconL size={is} />}
      {children}
      {IconR && <IconR size={is} />}
    </button>
  );
}

export function ButtonLink({ to, variant = 'primary', size = 'md', icon: IconL, className = '', children }) {
  const is = size === 'sm' ? 14 : 16;
  return (
    <Link to={to} className={buttonClass(variant, size, className)}>
      {IconL && <IconL size={is} />}
      {children}
    </Link>
  );
}

export function IconBtn({ icon: Ico, title, onClick, disabled, tone }) {
  return (
    <button type="button" title={title} aria-label={title} disabled={disabled} onClick={onClick}
      className={cn('grid h-8 w-8 place-items-center rounded-md border bg-white transition disabled:cursor-not-allowed disabled:opacity-40',
        tone === 'danger'
          ? 'border-slate-200 text-slate-400 hover:border-red-200 hover:bg-red-50 hover:text-red-600'
          : 'border-slate-200 text-slate-500 hover:border-slate-300 hover:bg-slate-50 hover:text-navy-800')}>
      <Ico size={15} />
    </button>
  );
}
