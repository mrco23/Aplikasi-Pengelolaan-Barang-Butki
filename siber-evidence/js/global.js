/**
 * GLOBAL JAVASCRIPT - SIBER EVIDENCE
 * Berisi fungsi-fungsi utilitas umum, pemformatan, dan pengelolaan komponen UI (Toasts, Modals).
 */

const BULAN = ['Januari','Februari','Maret','April','Mei','Juni','Juli','Agustus','September','Oktober','November','Desember'];

function uid(prefix = 'id') {
  return prefix + '-' + Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}

function pad2(n) {
  return String(n).padStart(2, '0');
}

function todayISO() {
  const d = new Date();
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
}

function nowLocal() {
  const d = new Date();
  return `${todayISO()}T${pad2(d.getHours())}:${pad2(d.getMinutes())}`;
}

function fmtDate(iso) {
  if (!iso) return '-';
  const parts = iso.split('-');
  if (parts.length !== 3) return iso;
  const [y, m, d] = parts.map(Number);
  if (!y || !m || !d) return iso;
  return `${d} ${BULAN[m - 1]} ${y}`;
}

function fmtDateTime(s) {
  if (!s) return '-';
  const [d, t] = s.split('T');
  return `${fmtDate(d)}${t ? ', ' + t.replace(':', '.') : ''}`;
}

function getInitials(nama) {
  return (nama || '?').split(' ').filter(Boolean).slice(0, 2).map(w => w[0]).join('').toUpperCase();
}

/**
 * Toast Notification System
 */
const Toaster = {
  container: null,
  init() {
    if (this.container) return;
    this.container = document.createElement('div');
    this.container.className = 'no-print fixed right-4 top-4 z-[100] flex w-[340px] max-w-[calc(100vw-2rem)] flex-col gap-2';
    document.body.appendChild(this.container);
  },
  show(type, title, message = '') {
    this.init();
    const id = uid('t');
    const el = document.createElement('div');
    
    let icon = 'info', cls = 'border-blue-500 text-blue-600';
    if (type === 'success') { icon = 'check'; cls = 'border-emerald-500 text-emerald-600'; }
    if (type === 'error') { icon = 'alert-triangle'; cls = 'border-red-500 text-red-600'; }

    el.className = `anim-toast flex items-start gap-3 rounded-lg border border-slate-200 border-l-4 bg-white p-3 shadow-lg ${cls}`;
    el.id = id;
    el.innerHTML = `
      <i data-lucide="${icon}" class="mt-0.5" width="17" height="17"></i>
      <div class="min-w-0 flex-1">
        <p class="text-xs font-bold text-navy-800">${title}</p>
        ${message ? `<p class="mt-0.5 text-[11px] leading-relaxed text-slate-500">${message}</p>` : ''}
      </div>
      <button class="text-slate-300 transition hover:text-slate-500 toast-close" aria-label="Tutup notifikasi">
        <i data-lucide="x" width="14" height="14"></i>
      </button>
    `;

    const closeBtn = el.querySelector('.toast-close');
    closeBtn.addEventListener('click', () => this.dismiss(id));

    this.container.appendChild(el);
    if (window.lucide) window.lucide.createIcons({ root: el });

    // Batasi maksimum 3 toast
    while (this.container.children.length > 3) {
      this.container.removeChild(this.container.firstChild);
    }

    setTimeout(() => this.dismiss(id), 4500);
  },
  dismiss(id) {
    const el = document.getElementById(id);
    if (el) {
      el.style.opacity = '0';
      el.style.transform = 'translateX(14px)';
      el.style.transition = 'all 0.2s ease';
      setTimeout(() => el.remove(), 200);
    }
  }
};

/**
 * Modal System
 */
const Modal = {
  open(modalId) {
    const el = document.getElementById(modalId);
    if (el) {
      el.classList.remove('hidden-el');
      document.body.style.overflow = 'hidden';
    }
  },
  close(modalId) {
    const el = document.getElementById(modalId);
    if (el) {
      el.classList.add('hidden-el');
      document.body.style.overflow = '';
    }
  },
  bindEvents() {
    document.querySelectorAll('[data-modal-close]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const modalId = e.currentTarget.getAttribute('data-modal-close');
        this.close(modalId);
      });
    });
    // Close on backdrop click
    document.querySelectorAll('.modal-backdrop').forEach(backdrop => {
      backdrop.addEventListener('click', (e) => {
        const modal = e.currentTarget.closest('.modal-container');
        if (modal) this.close(modal.id);
      });
    });
  }
};

document.addEventListener('DOMContentLoaded', () => {
  Modal.bindEvents();
});

// Render badges
function renderBadge(text, customTone) {
  const BADGE_TONE = {
    'Tersedia': 'bg-emerald-50 text-emerald-700 ring-emerald-600/20',
    'Dipinjam': 'bg-amber-50 text-amber-700 ring-amber-600/20',
    'Dalam Pemeriksaan': 'bg-blue-50 text-blue-700 ring-blue-600/20',
    'Dihancurkan': 'bg-red-50 text-red-700 ring-red-600/20',
    'Draf': 'bg-slate-100 text-slate-600 ring-slate-500/20',
    'Lidik': 'bg-sky-50 text-sky-700 ring-sky-600/20',
    'Sidik': 'bg-indigo-50 text-indigo-700 ring-indigo-600/20',
    'Aktif': 'bg-emerald-50 text-emerald-700 ring-emerald-600/20',
    'Nonaktif': 'bg-red-50 text-red-700 ring-red-600/20',
    'Administrator': 'bg-navy-50 text-navy-800 ring-navy-800/20',
    'Petugas': 'bg-slate-100 text-slate-600 ring-slate-500/20',
    'Belum Kembali': 'bg-amber-50 text-amber-700 ring-amber-600/20',
    'Sudah Kembali': 'bg-emerald-50 text-emerald-700 ring-emerald-600/20',
  };
  const tone = customTone || BADGE_TONE[text] || 'bg-slate-100 text-slate-600 ring-slate-500/20';
  return `<span class="inline-flex items-center gap-1 whitespace-nowrap rounded-full px-2 py-0.5 text-[11px] font-semibold ring-1 ring-inset ${tone}">${text}</span>`;
}

function renderCondDot(kondisi) {
  const KONDISI_DOT = { 'Baik': 'bg-emerald-500', 'Rusak Ringan': 'bg-amber-500', 'Rusak Berat': 'bg-red-500' };
  const d = KONDISI_DOT[kondisi] || 'bg-slate-400';
  return `<span class="inline-flex items-center gap-1.5 whitespace-nowrap text-xs text-slate-600"><span class="h-1.5 w-1.5 rounded-full ${d}"></span>${kondisi}</span>`;
}
