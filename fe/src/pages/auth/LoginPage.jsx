import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Shield, User, Lock, Eye, EyeOff, TriangleAlert } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { namaPengguna } from '../../utils/format';
import { Button, Field, IconInput } from '../../components/ui';
import { homeFor } from '../../utils/routes';

export default function LoginPage() {
  const { login, toast, bootError } = useApp();
  const navigate = useNavigate();
  const location = useLocation();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [show, setShow] = useState(false);
  const [remember, setRemember] = useState(true);
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);

  async function submit(e) {
    e.preventDefault();
    setErr('');
    if (!username.trim() || !password) { setErr('Nama pengguna dan kata sandi wajib diisi.'); return; }
    setBusy(true);
    const r = await login(username.trim(), password, remember);
    setBusy(false);
    if (!r.ok) { setErr(r.msg); return; }
    toast('success', 'Login berhasil', `Selamat datang, ${namaPengguna(r.user)}.`);
    const from = location.state?.from;
    const home = homeFor(r.user);
    navigate(from && from.startsWith(home.split('/').slice(0, 2).join('/')) ? from : home, { replace: true });
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-slate-50 px-4 py-10">
      <div className="mb-6 flex items-center gap-3">
        <span className="grid h-12 w-12 place-items-center rounded-xl bg-navy-800 text-white shadow-card">
          <Shield size={24} />
        </span>
        <div>
          <p className="text-lg font-extrabold tracking-wide text-navy-800">SIBER EVIDENCE</p>
          <p className="text-xs text-slate-500">Sistem Pengelolaan Barang Bukti</p>
        </div>
      </div>

      <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-card sm:p-8">
        <h1 className="text-base font-bold text-navy-800">Masuk ke Aplikasi</h1>
        <p className="mt-0.5 text-xs text-slate-500">Subbid Siber — Ditreskrimsus Polda Sulawesi Utara</p>

        <form onSubmit={submit} className="mt-6 space-y-4" noValidate>
          <Field label="Nama Pengguna" required>
            <IconInput icon={User} value={username} onChange={(e) => setUsername(e.target.value)} placeholder="cth. d.kusuma" autoComplete="username" autoFocus />
          </Field>
          <Field label="Kata Sandi" required>
            <IconInput icon={Lock} type={show ? 'text' : 'password'} value={password} onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••" autoComplete="current-password"
              right={(
                <button type="button" onClick={() => setShow((s) => !s)}
                  className="absolute right-2 top-1/2 grid h-7 w-7 -translate-y-1/2 place-items-center rounded-md text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
                  aria-label={show ? 'Sembunyikan kata sandi' : 'Tampilkan kata sandi'}>
                  {show ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              )} />
          </Field>

          {bootError && !err && (
            <div className="flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2.5 text-xs font-medium text-amber-800" role="alert">
              <TriangleAlert size={14} className="mt-0.5 shrink-0" />
              {bootError}
            </div>
          )}
          {err && (
            <div className="flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2.5 text-xs font-medium text-red-700" role="alert">
              <TriangleAlert size={14} className="mt-0.5 shrink-0" />
              {err}
            </div>
          )}

          <div className="flex items-center justify-between">
            <label className="flex cursor-pointer items-center gap-2 text-xs text-slate-600">
              <input type="checkbox" checked={remember} onChange={(e) => setRemember(e.target.checked)}
                className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500/30" />
              Ingat saya di perangkat ini
            </label>
            <button type="button" onClick={() => toast('info', 'Lupa kata sandi', 'Hubungi administrator sistem untuk mengatur ulang kata sandi Anda.')}
              className="text-xs font-semibold text-blue-600 hover:underline">Lupa kata sandi?</button>
          </div>

          <Button type="submit" icon={Shield} className="w-full" disabled={busy}>{busy ? 'Memeriksa…' : 'Masuk'}</Button>
        </form>

        {import.meta.env.DEV && (
          <div className="mt-5 rounded-lg border border-dashed border-slate-300 bg-slate-50 px-3.5 py-3 text-[11px] leading-relaxed text-slate-500">
            <span className="font-semibold text-slate-600">Akun contoh (mode pengembangan):</span> d.kusuma / demo123 (Petugas) — admin / demo123 (Administrator).
          </div>
        )}

        <p className="mt-5 border-t border-slate-100 pt-4 text-[11px] leading-relaxed text-slate-400">
          Untuk penggunaan internal Subbid Siber Ditreskrimsus Polda Sulawesi Utara. Seluruh data pada aplikasi ini bersifat fiktif.
        </p>
      </div>

      <p className="mt-6 text-[11px] text-slate-400">© 2026 — Kerja Praktik Subbid Siber Ditreskrimsus Polda Sulawesi Utara</p>
    </div>
  );
}
