import React, { useState } from 'react';
import { cn } from '../../utils/helpers';
import { useApp } from '../../context/AppContext';
import { Icon, Button, Field } from '../../components/common/UI';

const inputBase = 'w-full rounded-lg border bg-white px-3 py-2 text-sm text-slate-800 placeholder:text-slate-400 transition focus:outline-none focus:ring-2';

export default function LoginPage() {
  const { login, toast } = useApp();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [show, setShow] = useState(false);
  const [remember, setRemember] = useState(true);
  const [err, setErr] = useState('');

  function doLogin(u, p, rem) {
    const r = login(u, p, rem);
    if (r.ok) {
      window.location.hash = '#/dashboard';
      toast('success', 'Login berhasil', 'Selamat datang, ' + r.nama + ' (sesi demo).');
    } else {
      setErr(r.msg || 'Login gagal.');
    }
  }
  function submit(e) {
    e.preventDefault();
    setErr('');
    if (!username.trim() || !password) { setErr('Nama pengguna dan kata sandi wajib diisi.'); return; }
    doLogin(username.trim(), password, remember);
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-slate-50 px-4 py-10">
      <div className="mb-6 flex items-center gap-3">
        <span className="grid h-12 w-12 place-items-center rounded-xl bg-navy-800 text-white shadow-card">
          <Icon name="shield" size={24} />
        </span>
        <div>
          <p className="text-lg font-extrabold tracking-wide text-navy-800">SIBER EVIDENCE</p>
          <p className="text-xs text-slate-500">Sistem Pengelolaan Barang Bukti</p>
        </div>
      </div>

      <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-card sm:p-8">
        <h1 className="text-base font-bold text-navy-800">Masuk ke Aplikasi</h1>
        <p className="mt-0.5 text-xs text-slate-500">Subbid Siber — Ditreskrimsus Polda Sulawesi Utara</p>

        <form onSubmit={submit} className="mt-6 space-y-4">
          <Field label="Nama Pengguna" required>
            <div className="relative">
              <Icon name="user" size={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input value={username} onChange={(e) => setUsername(e.target.value)} placeholder="cth. admin"
                className={cn(inputBase, 'border-slate-300 py-2 pl-9 pr-3 focus:border-blue-500 focus:ring-blue-500/15')} autoComplete="username" />
            </div>
          </Field>
          <Field label="Kata Sandi" required>
            <div className="relative">
              <Icon name="lock" size={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input type={show ? 'text' : 'password'} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••"
                className={cn(inputBase, 'border-slate-300 py-2 pl-9 pr-10 focus:border-blue-500 focus:ring-blue-500/15')} autoComplete="current-password" />
              <button type="button" onClick={() => setShow(s => !s)}
                className="absolute right-2 top-1/2 grid h-7 w-7 -translate-y-1/2 place-items-center rounded-md text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
                aria-label={show ? 'Sembunyikan kata sandi' : 'Tampilkan kata sandi'}>
                <Icon name={show ? 'eye-off' : 'eye'} size={15} />
              </button>
            </div>
          </Field>

          {err && (
            <div className="flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2.5 text-xs font-medium text-red-700">
              <Icon name="alert-triangle" size={14} className="mt-0.5 shrink-0" />
              {err}
            </div>
          )}

          <div className="flex items-center justify-between">
            <label className="flex cursor-pointer items-center gap-2 text-xs text-slate-600">
              <input type="checkbox" checked={remember} onChange={(e) => setRemember(e.target.checked)}
                className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500/30" />
              Ingat saya di perangkat ini
            </label>
            <button type="button" onClick={() => toast('info', 'Lupa kata sandi', 'Pada aplikasi nyata, hubungi administrator sistem. (demo)')}
              className="text-xs font-semibold text-blue-600 hover:underline">Lupa kata sandi?</button>
          </div>

          <Button type="submit" icon="shield" className="w-full">Masuk</Button>
        </form>

        <div className="my-5 flex items-center gap-3">
          <span className="h-px flex-1 bg-slate-200" />
          <span className="text-[11px] font-medium text-slate-400">atau</span>
          <span className="h-px flex-1 bg-slate-200" />
        </div>

        <Button variant="secondary" icon="graduation-cap" className="w-full"
          onClick={() => doLogin('admin', 'demo123', true)}>
          Masuk sebagai Demo (Untuk Acara Akademik)
        </Button>

        <div className="mt-5 rounded-lg border border-dashed border-slate-300 bg-slate-50 px-3.5 py-3 text-[11px] leading-relaxed text-slate-500">
          <span className="font-semibold text-slate-600">Akun demo:</span> admin / demo123 (Administrator) — b.setiawan / demo123 (Petugas).
        </div>

        <p className="mt-5 border-t border-slate-100 pt-4 text-[11px] leading-relaxed text-slate-400">
          Untuk penggunaan internal. Aplikasi demonstrasi akademik (Kerja Praktik) — tidak terhubung ke sistem produksi
          maupun basis data Kepolisian Negara Republik Indonesia. Seluruh data bersifat fiktif.
        </p>
      </div>

      <p className="mt-6 text-[11px] text-slate-400">© 2025 — Kerja Praktik Subbid Siber Ditreskrimsus Polda Sulawesi Utara</p>
    </div>
  );
}
