import { NavLink } from 'react-router-dom';
import {
  Shield, X, LayoutDashboard, FolderOpen, Archive, History, ClipboardList, Settings,
  LogOut, ChevronsLeft, ChevronsRight,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { ROLE } from '../../constants';
import { cn, namaPengguna } from '../../utils/format';
import { Avatar } from '../ui';

export const PETUGAS_NAV = [
  { to: '/petugas/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/petugas/perkara', label: 'Data Perkara', icon: FolderOpen },
  { to: '/petugas/barang-bukti', label: 'Data Barang Bukti', icon: Archive },
  { to: '/petugas/riwayat', label: 'Riwayat Perpindahan', icon: History },
  { to: '/petugas/laporan', label: 'Laporan', icon: ClipboardList },
  { to: '/petugas/pengaturan', label: 'Pengaturan', icon: Settings },
];

export default function Sidebar({ collapsed, onToggleCollapse, onNavigate, onLogout, mobile }) {
  const { user } = useApp();
  return (
    <div className="flex h-full flex-col bg-navy-800 text-slate-300">
      <div className={cn('flex items-center gap-3 border-b border-white/10', collapsed ? 'justify-center px-2 py-4' : 'px-5 py-4')}>
        <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-blue-600 text-white shadow-sm">
          <Shield size={20} />
        </span>
        {!collapsed && (
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-bold tracking-wide text-white">SIBER EVIDENCE</p>
            <p className="text-[10px] leading-tight text-slate-400">Sistem Pengelolaan Barang Bukti<br />Subbid Siber · Polda Sulawesi Utara</p>
          </div>
        )}
        {mobile && (
          <button className="text-slate-400 transition hover:text-white" onClick={onNavigate} aria-label="Tutup menu">
            <X size={18} />
          </button>
        )}
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
        {PETUGAS_NAV.map((n) => (
          <NavLink key={n.to} to={n.to} title={collapsed ? n.label : undefined} onClick={onNavigate}
            className={({ isActive }) => cn('flex items-center gap-3 rounded-lg px-3 py-2.5 text-[13px] font-medium transition',
              collapsed && 'justify-center px-0',
              isActive ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-300 hover:bg-white/5 hover:text-white')}>
            <n.icon size={18} className="shrink-0" />
            {!collapsed && <span className="truncate">{n.label}</span>}
          </NavLink>
        ))}
      </nav>

      <div className="border-t border-white/10 p-3">
        {!collapsed && user && (
          <div className="mb-2 flex items-center gap-2.5 rounded-lg bg-white/5 px-3 py-2.5">
            <Avatar nama={user.nama} />
            <div className="min-w-0">
              <p className="truncate text-xs font-semibold text-white">{namaPengguna(user)}</p>
              <p className="truncate text-[10px] text-slate-400">{ROLE[user.role]} · {user.username}</p>
            </div>
          </div>
        )}
        <button type="button" onClick={onLogout}
          className={cn('flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-[13px] font-medium text-slate-300 transition hover:bg-red-500/10 hover:text-red-300',
            collapsed && 'justify-center px-0')}>
          <LogOut size={18} />
          {!collapsed && 'Keluar'}
        </button>
        {!mobile && (
          <button type="button" onClick={onToggleCollapse}
            className={cn('mt-1 hidden w-full items-center gap-3 rounded-lg px-3 py-2.5 text-[13px] font-medium text-slate-400 transition hover:bg-white/5 hover:text-white lg:flex',
              collapsed && 'justify-center px-0')}>
            {collapsed ? <ChevronsRight size={18} /> : <ChevronsLeft size={18} />}
            {!collapsed && 'Ringkas Sidebar'}
          </button>
        )}
      </div>
    </div>
  );
}
