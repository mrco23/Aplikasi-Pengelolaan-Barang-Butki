import { Fragment, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Menu, ChevronRight, ChevronDown, Bell, Settings, LogOut } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { useBase } from '../../utils/routes';
import { JENIS_META, JENIS_RIWAYAT, ROLE } from '../../constants';
import { cn, fmtDateTime, namaPengguna } from '../../utils/format';
import { penggunaNama, sortByTimeDesc } from '../../utils/selectors';
import { Avatar, Badge } from '../ui';

export default function Header({ title, crumbs, onMenu, onLogout }) {
  const base = useBase();
  const { data, lookup, user, notifSeen, markNotifSeen } = useApp();
  const [openN, setOpenN] = useState(false);
  const [openP, setOpenP] = useState(false);

  const rv = useMemo(() => [...data.riwayat_barang_bukti].sort(sortByTimeDesc), [data.riwayat_barang_bukti]);
  const unread = rv.filter((r) => !notifSeen || r.created_at > notifSeen).length;

  return (
    <header className="no-print sticky top-0 z-30 border-b border-slate-200 bg-white/90 backdrop-blur">
      <div className="flex h-16 items-center gap-3 px-4 sm:px-6 lg:px-8">
        <button onClick={onMenu} className="grid h-9 w-9 place-items-center rounded-lg text-slate-500 transition hover:bg-slate-100 hover:text-navy-800 lg:hidden" aria-label="Buka menu">
          <Menu size={19} />
        </button>
        <div className="min-w-0 flex-1">
          <nav className="flex items-center gap-1 text-[11px] text-slate-400">
            {crumbs.map((c, i) => (
              <Fragment key={i}>
                {i > 0 && <ChevronRight size={11} className="shrink-0 text-slate-300" />}
                {c.to && i < crumbs.length - 1
                  ? <Link to={c.to} className="truncate hover:text-blue-600">{c.label}</Link>
                  : <span className={cn('truncate', i === crumbs.length - 1 && 'font-medium text-slate-600')}>{c.label}</span>}
              </Fragment>
            ))}
          </nav>
          <h1 className="truncate text-lg font-bold leading-tight text-navy-800">{title}</h1>
        </div>

        {/* Notifikasi aktivitas */}
        <div className="relative">
          <button onClick={() => { setOpenN((v) => !v); setOpenP(false); }}
            className="relative grid h-9 w-9 place-items-center rounded-lg text-slate-500 transition hover:bg-slate-100 hover:text-navy-800" aria-label="Notifikasi">
            <Bell size={18} />
            {unread > 0 && (
              <span className="absolute -right-0.5 -top-0.5 grid h-4 min-w-[16px] place-items-center rounded-full bg-red-500 px-1 text-[9px] font-bold text-white">
                {unread > 9 ? '9+' : unread}
              </span>
            )}
          </button>
          {openN && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setOpenN(false)} />
              <div className="anim-fade-up absolute right-0 top-full z-50 mt-2 w-80 max-w-[calc(100vw-2rem)] overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xl">
                <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
                  <p className="text-sm font-bold text-navy-800">Notifikasi Aktivitas</p>
                  <button className="text-[11px] font-semibold text-blue-600 hover:underline" onClick={markNotifSeen}>Tandai dibaca</button>
                </div>
                <div className="max-h-80 overflow-y-auto">
                  {rv.slice(0, 6).map((r) => {
                    const m = JENIS_META[r.jenis] || JENIS_META.perpindahan;
                    const isNew = !notifSeen || r.created_at > notifSeen;
                    return (
                      <Link key={r.id} to={`${base}/riwayat`} onClick={() => setOpenN(false)}
                        className={cn('flex gap-3 border-b border-slate-50 px-4 py-3 transition last:border-0 hover:bg-slate-50', isNew && 'bg-blue-50/40')}>
                        <span className={cn('mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-full ring-1 ring-inset', m.dot)}>
                          <m.icon size={14} />
                        </span>
                        <span className="min-w-0">
                          <span className="block truncate text-xs font-semibold text-navy-800">{JENIS_RIWAYAT[r.jenis]} — {lookup.barang[r.barang_bukti_id]?.kode}</span>
                          <span className="mt-0.5 block truncate text-[11px] text-slate-500">{penggunaNama(lookup, r.petugas_id)} · {fmtDateTime(r.tanggal_waktu)}</span>
                        </span>
                      </Link>
                    );
                  })}
                  {rv.length === 0 && <p className="px-4 py-8 text-center text-xs text-slate-400">Belum ada aktivitas tercatat.</p>}
                </div>
                <Link to={`${base}/riwayat`} onClick={() => setOpenN(false)} className="block border-t border-slate-100 bg-slate-50/60 px-4 py-2.5 text-center text-[11px] font-semibold text-blue-600 hover:bg-slate-50">
                  Lihat semua riwayat perpindahan
                </Link>
              </div>
            </>
          )}
        </div>

        <span className="hidden h-6 w-px bg-slate-200 sm:block" />

        {/* Profil */}
        <div className="relative">
          <button onClick={() => { setOpenP((v) => !v); setOpenN(false); }} className="flex items-center gap-2 rounded-lg py-1 pl-1 pr-2 transition hover:bg-slate-100" aria-label="Menu profil">
            <Avatar nama={user.nama} />
            <span className="hidden text-left sm:block">
              <span className="block max-w-[150px] truncate text-xs font-bold text-navy-800">{namaPengguna(user)}</span>
              <span className="block text-[10px] text-slate-500">{ROLE[user.role]}</span>
            </span>
            <ChevronDown size={14} className="text-slate-400" />
          </button>
          {openP && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setOpenP(false)} />
              <div className="anim-fade-up absolute right-0 top-full z-50 mt-2 w-64 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xl">
                <div className="flex items-center gap-3 px-4 py-3.5">
                  <Avatar nama={user.nama} size="h-10 w-10 text-xs" />
                  <div className="min-w-0">
                    <p className="truncate text-xs font-bold text-navy-800">{namaPengguna(user)}</p>
                    <p className="truncate text-[11px] text-slate-500">@{user.username}</p>
                    <div className="mt-1"><Badge tone={user.role}>{ROLE[user.role]}</Badge></div>
                  </div>
                </div>
                <div className="border-t border-slate-100 p-1.5">
                  <Link to={`${base}/pengaturan`} onClick={() => setOpenP(false)} className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-xs font-medium text-slate-600 transition hover:bg-slate-50 hover:text-navy-800">
                    <Settings size={15} />Pengaturan
                  </Link>
                  <button onClick={() => { setOpenP(false); onLogout(); }}
                    className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-xs font-medium text-red-600 transition hover:bg-red-50">
                    <LogOut size={15} />Keluar
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
