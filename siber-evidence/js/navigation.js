/**
 * NAVIGATION JAVASCRIPT - SIBER EVIDENCE
 * Menangani inject Sidebar, Header, Breadcrumbs, dan Navigasi
 */

const Navigation = {
  user: null,

  init() {
    this.user = Auth.getUser();
    if (!this.user) return; // Jika tidak ada user, auth.js akan redirect

    this.renderSidebar();
    this.renderHeader();
    this.bindEvents();
    
    // Init icons
    if (window.lucide) {
      window.lucide.createIcons();
    }
  },

  renderSidebar() {
    const roleFolder = this.user.role === 'Administrator' ? 'admin' : 'petugas';
    const basePath = `../${roleFolder}/`;
    
    const menuItems = [
      { to: 'dashboard.html', label: 'Dashboard', icon: 'layout-dashboard' },
      { to: 'perkara.html', label: 'Data Perkara', icon: 'folder-open' },
      { to: 'barang-bukti.html', label: 'Data Barang Bukti', icon: 'archive' },
      { to: 'riwayat.html', label: 'Riwayat Perpindahan', icon: 'history' },
      { to: 'laporan.html', label: 'Laporan', icon: 'clipboard-list' }
    ];

    if (this.user.role === 'Administrator') {
      menuItems.push({ to: 'pengguna.html', label: 'Manajemen Pengguna', icon: 'users' });
    }
    menuItems.push({ to: 'pengaturan.html', label: 'Pengaturan', icon: 'settings' });

    const currentPath = window.location.pathname.split('/').pop();
    // Default dashboard if empty
    const activeFile = currentPath || 'dashboard.html';
    
    // Helper untuk highlight menu yang aktif (termasuk halaman detail/form)
    const isActive = (to) => {
      if (activeFile === to) return true;
      const baseTo = to.replace('.html', '');
      return activeFile.startsWith(baseTo + '-') || activeFile.startsWith(baseTo + '_');
    };

    let menuHtml = menuItems.map(m => {
      const activeCls = isActive(m.to) ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-300 hover:bg-white/5 hover:text-white';
      return `
        <a href="${basePath}${m.to}" class="flex items-center gap-3 rounded-lg px-3 py-2.5 text-[13px] font-medium transition ${activeCls}">
          <i data-lucide="${m.icon}" width="18" height="18"></i>
          <span class="truncate sidebar-label">${m.label}</span>
        </a>
      `;
    }).join('');

    const sidebarHtml = `
      <div class="flex h-full flex-col bg-navy-800 text-slate-300">
        <div class="flex items-center gap-3 border-b border-white/10 px-5 py-4">
          <span class="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-blue-600 text-white shadow-sm">
            <i data-lucide="shield" width="20" height="20"></i>
          </span>
          <div class="min-w-0 flex-1 sidebar-brand">
            <p class="truncate text-sm font-bold tracking-wide text-white">SIBER EVIDENCE</p>
            <p class="text-[10px] leading-tight text-slate-400">Sistem Pengelolaan Barang Bukti</p>
          </div>
          <button id="close-mobile-menu" class="text-slate-400 transition hover:text-white lg:hidden">
            <i data-lucide="x" width="18" height="18"></i>
          </button>
        </div>

        <nav class="flex-1 space-y-1 overflow-y-auto px-3 py-4">
          ${menuHtml}
        </nav>

        <div class="border-t border-white/10 p-3">
          <div class="mb-2 flex items-center gap-2.5 rounded-lg bg-white/5 px-3 py-2.5 sidebar-user">
            <span class="grid shrink-0 place-items-center rounded-full bg-navy-950 font-bold text-white h-8 w-8 text-[10px]">
              ${getInitials(this.user.nama)}
            </span>
            <div class="min-w-0">
              <p class="truncate text-xs font-semibold text-white">${this.user.nama}</p>
              <p class="truncate text-[10px] text-slate-400">${this.user.role}</p>
            </div>
          </div>
          <button id="btn-logout-sidebar" class="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-[13px] font-medium text-slate-300 transition hover:bg-red-500/10 hover:text-red-300">
            <i data-lucide="log-out" width="18" height="18"></i>
            <span class="sidebar-label">Keluar</span>
          </button>
        </div>
      </div>
    `;

    const aside = document.getElementById('app-sidebar');
    if (aside) aside.innerHTML = sidebarHtml;

    // Mobile Drawer Drawer Overlay
    const drawerContainer = document.getElementById('mobile-drawer-container');
    if (drawerContainer) {
      drawerContainer.innerHTML = `
        <div id="mobile-overlay" class="absolute inset-0 bg-navy-950/60 hidden-el"></div>
        <aside id="mobile-sidebar" class="anim-slide absolute inset-y-0 left-0 w-72 hidden-el z-50">
          ${sidebarHtml}
        </aside>
      `;
    }
  },

  renderHeader() {
    const pageTitle = document.title.split('—')[0].trim();
    
    const headerHtml = `
      <div class="flex h-16 items-center gap-3 px-4 sm:px-6 lg:px-8">
        <button id="btn-open-menu" class="grid h-9 w-9 place-items-center rounded-lg text-slate-500 transition hover:bg-slate-100 hover:text-navy-800 lg:hidden">
          <i data-lucide="menu" width="19" height="19"></i>
        </button>
        
        <div class="min-w-0 flex-1">
          <h1 class="truncate text-lg font-bold leading-tight text-navy-800" id="header-title">${pageTitle}</h1>
        </div>

        <span class="hidden h-6 w-px bg-slate-200 sm:block"></span>

        <!-- Profil -->
        <div class="relative">
          <button id="btn-profile-menu" class="flex items-center gap-2 rounded-lg py-1 pl-1 pr-2 transition hover:bg-slate-100">
            <span class="grid shrink-0 place-items-center rounded-full bg-navy-800 font-bold text-white h-8 w-8 text-[10px]">
              ${getInitials(this.user.nama)}
            </span>
            <span class="hidden text-left sm:block">
              <span class="block max-w-[150px] truncate text-xs font-bold text-navy-800">${this.user.nama}</span>
              <span class="block text-[10px] text-slate-500">${this.user.role}</span>
            </span>
            <i data-lucide="chevron-down" width="14" height="14" class="text-slate-400"></i>
          </button>
          
          <div id="dropdown-profile" class="hidden-el anim-fade-up absolute right-0 top-full z-50 mt-2 w-64 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xl">
            <div class="flex items-center gap-3 px-4 py-3.5">
              <span class="grid shrink-0 place-items-center rounded-full bg-navy-800 font-bold text-white h-10 w-10 text-xs">
                ${getInitials(this.user.nama)}
              </span>
              <div class="min-w-0">
                <p class="truncate text-xs font-bold text-navy-800">${this.user.nama}</p>
                <p class="truncate text-[11px] text-slate-500">@${this.user.username}</p>
                <div class="mt-1">${renderBadge(this.user.role)}</div>
              </div>
            </div>
            <div class="border-t border-slate-100 p-1.5">
              <a href="pengaturan.html" class="flex items-center gap-2.5 rounded-lg px-3 py-2 text-xs font-medium text-slate-600 transition hover:bg-slate-50 hover:text-navy-800">
                <i data-lucide="settings" width="15" height="15"></i> Pengaturan
              </a>
              <button id="btn-logout-header" class="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-xs font-medium text-red-600 transition hover:bg-red-50">
                <i data-lucide="log-out" width="15" height="15"></i> Keluar
              </button>
            </div>
          </div>
        </div>
      </div>
    `;

    const header = document.getElementById('app-header');
    if (header) header.innerHTML = headerHtml;
  },

  bindEvents() {
    // Logout
    const btnsLogout = document.querySelectorAll('#btn-logout-sidebar, #btn-logout-header, #mobile-sidebar #btn-logout-sidebar');
    btnsLogout.forEach(btn => {
      btn.addEventListener('click', () => Auth.logout());
    });

    // Mobile Menu Toggle
    const btnOpen = document.getElementById('btn-open-menu');
    const overlay = document.getElementById('mobile-overlay');
    const mobileSidebar = document.getElementById('mobile-sidebar');
    const btnClose = document.querySelector('#mobile-sidebar #close-mobile-menu');

    const toggleMobile = (show) => {
      if (show) {
        overlay.classList.remove('hidden-el');
        mobileSidebar.classList.remove('hidden-el');
        document.body.style.overflow = 'hidden';
      } else {
        overlay.classList.add('hidden-el');
        mobileSidebar.classList.add('hidden-el');
        document.body.style.overflow = '';
      }
    };

    if (btnOpen) btnOpen.addEventListener('click', () => toggleMobile(true));
    if (btnClose) btnClose.addEventListener('click', () => toggleMobile(false));
    if (overlay) overlay.addEventListener('click', () => toggleMobile(false));

    // Profile Dropdown
    const btnProfile = document.getElementById('btn-profile-menu');
    const dropdown = document.getElementById('dropdown-profile');
    
    if (btnProfile && dropdown) {
      btnProfile.addEventListener('click', (e) => {
        e.stopPropagation();
        dropdown.classList.toggle('hidden-el');
      });
      document.addEventListener('click', (e) => {
        if (!dropdown.contains(e.target) && !btnProfile.contains(e.target)) {
          dropdown.classList.add('hidden-el');
        }
      });
    }
  }
};
