import React, { useState, useMemo, Fragment, useEffect } from 'react';
import { cn, fmtDateTime } from './utils/helpers';
import { useApp } from './context/AppContext';
import { Icon, Avatar, Badge, ButtonLink } from './components/common/UI';

import DashboardPage from './pages/administrator/DashboardPage';
import PerkaraPage from './pages/administrator/PerkaraPage';
import PerkaraDetailPage from './pages/administrator/PerkaraDetailPage';
import BarangBuktiPage from './pages/administrator/BarangBuktiPage';
import BarangFormPage from './pages/administrator/BarangBuktiFormPage';
import BarangDetailPage from './pages/administrator/BarangBuktiDetailPage';
import RiwayatPage from './pages/administrator/RiwayatPage';
import LaporanPage from './pages/administrator/LaporanPage';
import PenggunaPage from './pages/administrator/PenggunaPage';
import PengaturanPage from './pages/administrator/PengaturanPage';

function SidebarContent({ collapsed, onToggleCollapse, onNavigate, mobile }) {
  const { user, logout } = useApp();
  const hash = window.location.hash || '#/';
  const path = (hash.replace(/^#/, '') || '/').split('?')[0];
  const nav = [
    { to: '/dashboard', label: 'Dashboard', icon: 'layout-dashboard' },
    { to: '/perkara', label: 'Data Perkara', icon: 'folder-open' },
    { to: '/barang-bukti', label: 'Data Barang Bukti', icon: 'archive' },
    { to: '/riwayat', label: 'Riwayat Perpindahan', icon: 'history' },
    { to: '/laporan', label: 'Laporan', icon: 'clipboard-list' },
  ];
  if (user && user.role === 'Administrator') nav.push({ to: '/pengguna', label: 'Manajemen Pengguna', icon: 'users' });
  nav.push({ to: '/pengaturan', label: 'Pengaturan', icon: 'settings' });
  const isActive = (to) => path === to || path.startsWith(to + '/') || (to === '/dashboard' && path === '/');

  return (
    <div className="flex h-full flex-col bg-navy-800 text-slate-300">
      <div className={cn('flex items-center gap-3 border-b border-white/10', collapsed ? 'justify-center px-2 py-4' : 'px-5 py-4')}>
        <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-blue-600 text-white shadow-sm">
          <Icon name="shield" size={20} />
        </span>
        {!collapsed && (
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-bold tracking-wide text-white">SIBER EVIDENCE</p>
            <p className="text-[10px] leading-tight text-slate-400">Sistem Pengelolaan Barang Bukti<br />Subbid Siber · Polda Sulawesi Utara</p>
          </div>
        )}
        {mobile && (
          <button className="text-slate-400 transition hover:text-white" onClick={onNavigate} aria-label="Tutup menu">
            <Icon name="x" size={18} />
          </button>
        )}
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
        {nav.map(n => (
          <a key={n.to} href={'#' + n.to} title={collapsed ? n.label : undefined} onClick={onNavigate}
            className={cn('flex items-center gap-3 rounded-lg px-3 py-2.5 text-[13px] font-medium transition',
              collapsed && 'justify-center px-0',
              isActive(n.to) ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-300 hover:bg-white/5 hover:text-white')}>
            <Icon name={n.icon} size={18} />
            {!collapsed && <span className="truncate">{n.label}</span>}
          </a>
        ))}
      </nav>

      <div className="border-t border-white/10 p-3">
        {!collapsed && user && (
          <div className="mb-2 flex items-center gap-2.5 rounded-lg bg-white/5 px-3 py-2.5">
            <Avatar nama={user.nama} size="h-8 w-8 text-[10px]" />
            <div className="min-w-0">
              <p className="truncate text-xs font-semibold text-white">{user.nama}</p>
              <p className="truncate text-[10px] text-slate-400">{user.role} · {user.username}</p>
            </div>
          </div>
        )}
        <button onClick={() => { logout(); }}
          className={cn('flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-[13px] font-medium text-slate-300 transition hover:bg-red-500/10 hover:text-red-300',
            collapsed && 'justify-center px-0')}>
          <Icon name="log-out" size={18} />
          {!collapsed && 'Keluar'}
        </button>
        {!mobile && (
          <button onClick={onToggleCollapse}
            className="mt-1 hidden w-full items-center gap-3 rounded-lg px-3 py-2.5 text-[13px] font-medium text-slate-400 transition hover:bg-white/5 hover:text-white lg:flex">
            <Icon name={collapsed ? 'chevrons-right' : 'chevrons-left'} size={18} />
            {!collapsed && 'Ringkas Sidebar'}
          </button>
        )}
      </div>
    </div>
  );
}

function Header({ title, crumbs, onMenu }) {
  const { data, user, logout, toast, setNotifSeen } = useApp();
  const [openN, setOpenN] = useState(false);
  const [openP, setOpenP] = useState(false);
  const rv = useMemo(() => [...data.riwayat].sort((a, b) => b.tanggalWaktu.localeCompare(a.tanggalWaktu)), [data.riwayat]);
  const unread = rv.filter((r) => !data.notifSeen || r.tanggalWaktu > data.notifSeen).length;
  
  const JENIS_META = {
    Penerimaan:   { icon: 'package',          badge: 'bg-blue-50 text-blue-700 ring-blue-600/20',        dot: 'bg-blue-50 text-blue-600 ring-blue-100' },
    Perpindahan:  { icon: 'arrow-right-left', badge: 'bg-indigo-50 text-indigo-700 ring-indigo-600/20',  dot: 'bg-indigo-50 text-indigo-600 ring-indigo-100' },
    Peminjaman:   { icon: 'arrow-up-right',   badge: 'bg-amber-50 text-amber-700 ring-amber-600/20',     dot: 'bg-amber-50 text-amber-600 ring-amber-100' },
    Pengembalian: { icon: 'arrow-down-left',  badge: 'bg-emerald-50 text-emerald-700 ring-emerald-600/20', dot: 'bg-emerald-50 text-emerald-600 ring-emerald-100' },
    Pemeriksaan:  { icon: 'search',           badge: 'bg-violet-50 text-violet-700 ring-violet-600/20',  dot: 'bg-violet-50 text-violet-600 ring-violet-100' },
    Pengalihan:   { icon: 'shuffle',          badge: 'bg-slate-100 text-slate-600 ring-slate-500/20',    dot: 'bg-slate-100 text-slate-500 ring-slate-200' },
  };

  return (
    <header className="no-print sticky top-0 z-30 border-b border-slate-200 bg-white/90 backdrop-blur">
      <div className="flex h-16 items-center gap-3 px-4 sm:px-6 lg:px-8">
        <button onClick={onMenu} className="grid h-9 w-9 place-items-center rounded-lg text-slate-500 transition hover:bg-slate-100 hover:text-navy-800 lg:hidden" aria-label="Buka menu">
          <Icon name="menu" size={19} />
        </button>
        <div className="min-w-0 flex-1">
          <nav className="flex items-center gap-1 text-[11px] text-slate-400">
            {crumbs.map((c, i) => (
              <Fragment key={i}>
                {i > 0 && <Icon name="chevron-right" size={11} className="shrink-0 text-slate-300" />}
                {c.to && i < crumbs.length - 1
                  ? <a href={'#' + c.to} className="truncate hover:text-blue-600">{c.label}</a>
                  : <span className={cn('truncate', i === crumbs.length - 1 && 'font-medium text-slate-600')}>{c.label}</span>}
              </Fragment>
            ))}
          </nav>
          <h1 className="truncate text-lg font-bold leading-tight text-navy-800">{title}</h1>
        </div>

        {/* Notifikasi */}
        <div className="relative">
          <button onClick={() => { setOpenN(v => !v); setOpenP(false); }}
            className="relative grid h-9 w-9 place-items-center rounded-lg text-slate-500 transition hover:bg-slate-100 hover:text-navy-800" aria-label="Notifikasi">
            <Icon name="bell" size={18} />
            {unread > 0 && (
              <span className="absolute -right-0.5 -top-0.5 grid h-4 min-w-[16px] place-items-center rounded-full bg-red-500 px-1 text-[9px] font-bold text-white">
                {unread > 9 ? '9+' : unread}
              </span>
            )}
          </button>
          {openN && (
            <Fragment>
              <div className="fixed inset-0 z-40" onClick={() => setOpenN(false)} />
              <div className="anim-fade-up absolute right-0 top-full z-50 mt-2 w-80 max-w-[calc(100vw-2rem)] overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xl">
                <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
                  <p className="text-sm font-bold text-navy-800">Notifikasi Aktivitas</p>
                  <button className="text-[11px] font-semibold text-blue-600 hover:underline" onClick={() => { setNotifSeen(); }}>Tandai dibaca</button>
                </div>
                <div className="max-h-80 overflow-y-auto">
                  {rv.slice(0, 6).map((r) => {
                    const m = JENIS_META[r.jenis] || JENIS_META.Perpindahan;
                    return (
                      <a key={r.id} href="#/riwayat" onClick={() => setOpenN(false)} className="flex gap-3 border-b border-slate-50 px-4 py-3 transition last:border-0 hover:bg-slate-50">
                        <span className={cn('mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-full ring-1 ring-inset', m.dot)}>
                          <Icon name={m.icon} size={14} />
                        </span>
                        <span className="min-w-0">
                          <span className="block truncate text-xs font-semibold text-navy-800">{r.jenis} — {r.kodeBB}</span>
                          <span className="mt-0.5 block truncate text-[11px] text-slate-500">{r.petugas} · {fmtDateTime(r.tanggalWaktu)}</span>
                        </span>
                      </a>
                    );
                  })}
                  {rv.length === 0 && <p className="px-4 py-8 text-center text-xs text-slate-400">Belum ada aktivitas tercatat.</p>}
                </div>
                <a href="#/riwayat" onClick={() => setOpenN(false)} className="block border-t border-slate-100 bg-slate-50/60 px-4 py-2.5 text-center text-[11px] font-semibold text-blue-600 hover:bg-slate-50">
                  Lihat semua riwayat perpindahan
                </a>
              </div>
            </Fragment>
          )}
        </div>

        <span className="hidden h-6 w-px bg-slate-200 sm:block" />

        {/* Profil */}
        <div className="relative">
          <button onClick={() => { setOpenP(v => !v); setOpenN(false); }} className="flex items-center gap-2 rounded-lg py-1 pl-1 pr-2 transition hover:bg-slate-100" aria-label="Menu profil">
            <Avatar nama={user.nama} size="h-8 w-8 text-[10px]" />
            <span className="hidden text-left sm:block">
              <span className="block max-w-[150px] truncate text-xs font-bold text-navy-800">{user.nama}</span>
              <span className="block text-[10px] text-slate-500">{user.role}</span>
            </span>
            <Icon name="chevron-down" size={14} className="text-slate-400" />
          </button>
          {openP && (
            <Fragment>
              <div className="fixed inset-0 z-40" onClick={() => setOpenP(false)} />
              <div className="anim-fade-up absolute right-0 top-full z-50 mt-2 w-64 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xl">
                <div className="flex items-center gap-3 px-4 py-3.5">
                  <Avatar nama={user.nama} size="h-10 w-10 text-xs" />
                  <div className="min-w-0">
                    <p className="truncate text-xs font-bold text-navy-800">{user.nama}</p>
                    <p className="truncate text-[11px] text-slate-500">@{user.username}</p>
                    <div className="mt-1"><Badge>{user.role}</Badge></div>
                  </div>
                </div>
                <div className="border-t border-slate-100 p-1.5">
                  <a href="#/pengaturan" onClick={() => setOpenP(false)} className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-xs font-medium text-slate-600 transition hover:bg-slate-50 hover:text-navy-800">
                    <Icon name="settings" size={15} />Pengaturan
                  </a>
                  <button onClick={() => { setOpenP(false); logout(); toast('info', 'Anda telah keluar', 'Sesi demo diakhiri. Sampai jumpa kembali!'); }}
                    className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-xs font-medium text-red-600 transition hover:bg-red-50">
                    <Icon name="log-out" size={15} />Keluar
                  </button>
                </div>
              </div>
            </Fragment>
          )}
        </div>
      </div>
    </header>
  );
}

function NotFound({ message }) {
  return (
    <div className="grid place-items-center py-20 text-center">
      <div className="grid h-14 w-14 place-items-center rounded-2xl bg-slate-100 text-slate-400"><Icon name="search-x" size={26} /></div>
      <h2 className="mt-4 text-lg font-bold text-navy-800">Halaman tidak ditemukan</h2>
      <p className="mt-1 max-w-md text-sm text-slate-500">{message || 'Tautan yang Anda buka tidak tersedia pada aplikasi demo ini.'}</p>
      <ButtonLink to="/dashboard" icon="arrow-left" className="mt-5">Kembali ke Dashboard</ButtonLink>
    </div>
  );
}

export function NoAccess() {
  return (
    <div className="grid place-items-center py-20 text-center">
      <div className="grid h-14 w-14 place-items-center rounded-2xl bg-red-50 text-red-500"><Icon name="lock" size={26} /></div>
      <h2 className="mt-4 text-lg font-bold text-navy-800">Akses ditolak</h2>
      <p className="mt-1 max-w-md text-sm text-slate-500">
        Halaman ini hanya dapat diakses oleh Administrator. Perhatikan bahwa pengaturan peran pada demo ini hanya memengaruhi tampilan antarmuka — pengamanan akses sesungguhnya memerlukan implementasi backend.
      </p>
      <ButtonLink to="/dashboard" icon="arrow-left" className="mt-5">Kembali ke Dashboard</ButtonLink>
    </div>
  );
}

export default function AppShell({ path }) {
  const { data, user } = useApp();
  const [pathRaw, qs] = path.split('?');
  const query = new URLSearchParams(qs || '');
  const seg = pathRaw.split('/').filter(Boolean);
  const [collapsed, setCollapsed] = useState(() => localStorage.getItem('se_sidebar') === '1');
  const [drawer, setDrawer] = useState(false);

  const toggleCollapsed = () => setCollapsed((c) => {
    localStorage.setItem('se_sidebar', c ? '0' : '1');
    return !c;
  });

  useEffect(() => { window.scrollTo({ top: 0 }); }, [pathRaw]);

  /* Judul & breadcrumb per rute */
  let title = 'Dashboard';
  let crumbs = [{ label: 'Beranda', to: '/dashboard' }];
  const k = seg[0] || 'dashboard';
  if (k === 'dashboard') { title = 'Dashboard'; }
  else if (k === 'perkara') {
    title = 'Data Perkara'; crumbs.push({ label: 'Data Perkara', to: '/perkara' });
    if (seg[1]) {
      const p = data.perkara.find((x) => x.id === seg[1]);
      title = 'Detail Perkara';
      crumbs.push({ label: p ? p.nomorLP : 'Detail Perkara' });
    }
  } else if (k === 'barang-bukti') {
    crumbs.push({ label: 'Data Barang Bukti', to: '/barang-bukti' });
    if (!seg[1]) { title = 'Data Barang Bukti'; }
    else if (seg[1] === 'baru') { title = 'Tambah Barang Bukti'; crumbs.push({ label: 'Tambah' }); }
    else {
      const b = data.barang.find((x) => x.id === seg[1]);
      if (seg[2] === 'edit') { title = 'Edit Barang Bukti'; crumbs.push({ label: b ? b.kode : seg[1], to: '/barang-bukti/' + seg[1] }); crumbs.push({ label: 'Edit' }); }
      else { title = 'Detail Barang Bukti'; crumbs.push({ label: b ? b.kode : seg[1] }); }
    }
  } else if (k === 'riwayat') { title = 'Riwayat Perpindahan'; crumbs.push({ label: 'Riwayat Perpindahan' }); }
  else if (k === 'laporan') { title = 'Laporan'; crumbs.push({ label: 'Laporan' }); }
  else if (k === 'pengguna') { title = 'Manajemen Pengguna'; crumbs.push({ label: 'Manajemen Pengguna' }); }
  else if (k === 'pengaturan') { title = 'Pengaturan'; crumbs.push({ label: 'Pengaturan' }); }
  else { title = 'Halaman Tidak Ditemukan'; }

  useEffect(() => { document.title = title + ' — SIBER EVIDENCE'; }, [title]);

  const admin = user.role === 'Administrator';
  let page;
  if (k === 'dashboard') page = <DashboardPage />;
  else if (k === 'perkara') page = seg[1] ? <PerkaraDetailPage id={seg[1]} key={'pkd-' + seg[1]} /> : <PerkaraPage />;
  else if (k === 'barang-bukti') {
    if (!seg[1]) page = <BarangBuktiPage query={query} />;
    else if (seg[1] === 'baru') page = <BarangFormPage query={query} key="bb-baru" />;
    else if (seg[2] === 'edit') page = <BarangFormPage id={seg[1]} query={query} key={'bb-edit-' + seg[1]} />;
    else page = <BarangDetailPage id={seg[1]} query={query} key={'bbd-' + seg[1]} />;
  }
  else if (k === 'riwayat') page = <RiwayatPage query={query} />;
  else if (k === 'laporan') page = <LaporanPage />;
  else if (k === 'pengguna') page = admin ? <PenggunaPage /> : <NoAccess />;
  else if (k === 'pengaturan') page = <PengaturanPage />;
  else page = <NotFound />;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800">
      <aside className={cn('no-print fixed inset-y-0 left-0 z-40 hidden lg:block transition-all duration-200', collapsed ? 'w-[76px]' : 'w-64')}>
        <SidebarContent collapsed={collapsed} onToggleCollapse={toggleCollapsed} />
      </aside>

      {drawer && (
        <div className="no-print fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-navy-950/60" onClick={() => setDrawer(false)} />
          <aside className="anim-slide absolute inset-y-0 left-0 w-72">
            <SidebarContent mobile collapsed={false} onToggleCollapse={toggleCollapsed} onNavigate={() => setDrawer(false)} />
          </aside>
        </div>
      )}

      <div className={cn('app-offset flex min-h-screen flex-col transition-[padding] duration-200', collapsed ? 'lg:pl-[76px]' : 'lg:pl-64')}>
        <Header title={title} crumbs={crumbs} onMenu={() => setDrawer(true)} />
        <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-6 sm:px-6 lg:px-8 lg:py-8">{page}</main>
        <footer className="no-print border-t border-slate-200 px-6 py-4">
          <p className="text-center text-[11px] leading-relaxed text-slate-400">
            SIBER EVIDENCE v1.0 — Demo Kerja Praktik · Subbid Siber, Ditreskrimsus Polda Sulawesi Utara<br />
            Seluruh data bersifat contoh/fiktif dan tersimpan lokal di peramban Anda. Tidak terhubung ke sistem produksi Kepolisian.
          </p>
        </footer>
      </div>
    </div>
  );
}
