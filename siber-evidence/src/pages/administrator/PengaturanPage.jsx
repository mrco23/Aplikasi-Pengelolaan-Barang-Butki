import React, { useState } from 'react';
import { useApp } from '../../../context/AppContext';
import { Icon, Button, Card, ConfirmDialog, DemoNote } from '../../../components/common/UI';

export default function PengaturanPage() {
  const { user, resetDemo, logout, toast } = useApp();
  const [resetOpen, setResetOpen] = useState(false);

  function confirmReset() {
    resetDemo();
    toast('info', 'Data dikembalikan', 'Seluruh data demo telah dikembalikan ke kondisi awal (seed).');
    setResetOpen(false);
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h2 className="text-xl font-bold text-navy-800">Pengaturan Aplikasi (Demo)</h2>
        <p className="mt-0.5 text-sm text-slate-500">Opsi pengelolaan aplikasi SIBER EVIDENCE.</p>
      </div>

      <Card title="Profil Saya">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <span className="grid h-16 w-16 place-items-center rounded-full bg-navy-800 text-xl font-bold text-white">
              {(user.nama || '?').substring(0, 2).toUpperCase()}
            </span>
            <div>
              <p className="text-lg font-bold text-navy-800">{user.nama}</p>
              <p className="text-sm text-slate-500">@{user.username} · {user.role}</p>
            </div>
          </div>
          <Button variant="secondary" icon="lock">Ubah Kata Sandi (Nonaktif)</Button>
        </div>
      </Card>

      <Card title="Informasi Sistem">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <p className="text-xs font-semibold text-slate-400">Versi Aplikasi</p>
            <p className="mt-1 text-sm font-medium text-navy-800">v1.0.0 (Kerja Praktik Demo)</p>
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-400">Penyimpanan</p>
            <p className="mt-1 text-sm font-medium text-navy-800">Local Storage (Peramban Klien)</p>
          </div>
          <div className="sm:col-span-2">
            <p className="text-xs font-semibold text-slate-400">Lisensi & Hak Cipta</p>
            <p className="mt-1 text-sm font-medium text-navy-800">Hak cipta antarmuka milik Polri. Dibuat untuk tujuan akademik.</p>
          </div>
        </div>
      </Card>

      <div className="rounded-xl border border-red-200 bg-red-50 p-5">
        <h3 className="flex items-center gap-2 text-sm font-bold text-red-800">
          <Icon name="alert-triangle" size={17} />Zona Berbahaya
        </h3>
        <p className="mt-1 text-xs text-red-700">Kembalikan seluruh data ke kondisi awal demo (menghapus perubahan yang Anda buat).</p>
        <Button variant="danger" className="mt-4" icon="rotate-ccw" onClick={() => setResetOpen(true)}>Reset Data Demo</Button>
      </div>

      <ConfirmDialog open={resetOpen} onClose={() => setResetOpen(false)} onConfirm={confirmReset}
        title="Reset Data Demo?" confirmLabel="Ya, Kembalikan Data" confirmDisabled={false}>
        <p>Tindakan ini akan mengembalikan daftar perkara, barang bukti, riwayat, dan pengguna ke data awal seed. Seluruh perubahan yang telah Anda buat pada sesi demo ini akan terhapus secara permanen.</p>
      </ConfirmDialog>
    </div>
  );
}
