import { useEffect } from 'react';
import { X, TriangleAlert, Info } from 'lucide-react';
import { cn } from '../../utils/format';
import { Button } from './Button';

export function Modal({ open, onClose, title, desc, children, footer, width = 'max-w-lg' }) {
  useEffect(() => {
    if (!open) return undefined;
    const f = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', f);
    document.body.style.overflow = 'hidden';
    return () => { window.removeEventListener('keydown', f); document.body.style.overflow = ''; };
  }, [open, onClose]);

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[90] flex items-end justify-center p-4 sm:items-center">
      <div className="absolute inset-0 bg-navy-950/50" onClick={onClose} />
      <div className={cn('anim-fade-up relative flex max-h-[92vh] w-full flex-col rounded-xl bg-white shadow-2xl', width)} role="dialog" aria-modal="true">
        <header className="flex items-start justify-between gap-4 border-b border-slate-100 px-5 py-4">
          <div>
            <h3 className="text-sm font-bold text-navy-800">{title}</h3>
            {desc && <p className="mt-0.5 text-xs leading-relaxed text-slate-500">{desc}</p>}
          </div>
          <button onClick={onClose} className="rounded-md p-1 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600" aria-label="Tutup">
            <X size={17} />
          </button>
        </header>
        <div className="flex-1 overflow-y-auto px-5 py-4">{children}</div>
        {footer && <footer className="flex flex-wrap justify-end gap-2 border-t border-slate-100 px-5 py-3">{footer}</footer>}
      </div>
    </div>
  );
}

export function ConfirmDialog({ open, onClose, onConfirm, title, children, confirmLabel = 'Hapus', danger = true, confirmDisabled }) {
  const Ico = danger ? TriangleAlert : Info;
  return (
    <Modal open={open} onClose={onClose} title={title} width="max-w-md"
      footer={<>
        <Button variant="secondary" onClick={onClose}>Batal</Button>
        <Button variant={danger ? 'danger' : 'primary'} disabled={confirmDisabled} onClick={onConfirm}>{confirmLabel}</Button>
      </>}>
      <div className="flex items-start gap-3">
        <span className={cn('grid h-10 w-10 shrink-0 place-items-center rounded-full', danger ? 'bg-red-50 text-red-600' : 'bg-blue-50 text-blue-600')}>
          <Ico size={19} />
        </span>
        <div className="text-sm leading-relaxed text-slate-600">{children}</div>
      </div>
    </Modal>
  );
}
