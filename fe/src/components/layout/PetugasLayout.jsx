import { useEffect, useState } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { cn } from '../../utils/format';
import Sidebar from './Sidebar';
import Header from './Header';

const SIDEBAR_KEY = 'siber_evidence_fe_sidebar';

/* Judul halaman & breadcrumb berdasarkan URL */
function usePageMeta(pathname, lookup) {
  const seg = pathname.split('/').filter(Boolean).slice(1); // buang "petugas"
  const root = { label: 'Beranda', to: '/petugas/dashboard' };
  const k = seg[0] || 'dashboard';
  const id = Number(seg[1]);

  switch (k) {
    case 'dashboard':
      return { title: 'Dashboard', crumbs: [root] };
    case 'perkara': {
      const crumbs = [root, { label: 'Data Perkara', to: '/petugas/perkara' }];
      if (!seg[1]) return { title: 'Data Perkara', crumbs };
      return { title: 'Detail Perkara', crumbs: [...crumbs, { label: lookup.perkara[id]?.nomor_lp || 'Detail' }] };
    }
    case 'barang-bukti': {
      const crumbs = [root, { label: 'Data Barang Bukti', to: '/petugas/barang-bukti' }];
      if (!seg[1]) return { title: 'Data Barang Bukti', crumbs };
      if (seg[1] === 'baru') return { title: 'Tambah Barang Bukti', crumbs: [...crumbs, { label: 'Tambah' }] };
      const kode = lookup.barang[id]?.kode || 'Detail';
      if (seg[2] === 'edit') return { title: 'Edit Barang Bukti', crumbs: [...crumbs, { label: kode, to: `/petugas/barang-bukti/${id}` }, { label: 'Edit' }] };
      return { title: 'Detail Barang Bukti', crumbs: [...crumbs, { label: kode }] };
    }
    case 'riwayat':
      return { title: 'Riwayat Perpindahan', crumbs: [root, { label: 'Riwayat Perpindahan' }] };
    case 'laporan':
      return { title: 'Laporan', crumbs: [root, { label: 'Laporan' }] };
    case 'pengaturan':
      return { title: 'Pengaturan', crumbs: [root, { label: 'Pengaturan' }] };
    default:
      return { title: 'Halaman Tidak Ditemukan', crumbs: [root] };
  }
}

export default function PetugasLayout() {
  const { lookup, logout, toast } = useApp();
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(() => localStorage.getItem(SIDEBAR_KEY) === '1');
  const [drawer, setDrawer] = useState(false);
  const { title, crumbs } = usePageMeta(pathname, lookup);

  useEffect(() => { window.scrollTo({ top: 0 }); }, [pathname]);
  useEffect(() => { document.title = `${title} — SIBER EVIDENCE`; }, [title]);

  const toggleCollapsed = () => setCollapsed((c) => {
    localStorage.setItem(SIDEBAR_KEY, c ? '0' : '1');
    return !c;
  });

  const handleLogout = () => {
    logout();
    toast('info', 'Anda telah keluar', 'Sesi berakhir. Sampai jumpa kembali!');
    navigate('/login', { replace: true });
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800">
      <aside className={cn('no-print fixed inset-y-0 left-0 z-40 hidden transition-all duration-200 lg:block', collapsed ? 'w-[76px]' : 'w-64')}>
        <Sidebar collapsed={collapsed} onToggleCollapse={toggleCollapsed} onLogout={handleLogout} />
      </aside>

      {drawer && (
        <div className="no-print fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-navy-950/60" onClick={() => setDrawer(false)} />
          <aside className="anim-slide absolute inset-y-0 left-0 w-72">
            <Sidebar mobile collapsed={false} onNavigate={() => setDrawer(false)} onLogout={handleLogout} />
          </aside>
        </div>
      )}

      <div className={cn('app-offset flex min-h-screen flex-col transition-[padding] duration-200', collapsed ? 'lg:pl-[76px]' : 'lg:pl-64')}>
        <Header title={title} crumbs={crumbs} onMenu={() => setDrawer(true)} onLogout={handleLogout} />
        <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
          <Outlet />
        </main>
        <footer className="no-print border-t border-slate-200 px-6 py-4">
          <p className="text-center text-[11px] leading-relaxed text-slate-400">
            SIBER EVIDENCE v1.0 — Kerja Praktik · Subbid Siber, Ditreskrimsus Polda Sulawesi Utara<br />
            Seluruh data bersifat contoh/fiktif dan tersimpan lokal di peramban Anda.
          </p>
        </footer>
      </div>
    </div>
  );
}
