/* Sementara: modul Administrator belum dibangun pada tahap ini */
import { useNavigate } from 'react-router-dom';
import { Construction, LogOut, Shield } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { namaPengguna } from '../../utils/format';
import { Button } from '../../components/ui';

export default function AdminPlaceholderPage() {
  const { user, logout } = useApp();
  const navigate = useNavigate();
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-slate-50 px-4 py-10">
      <div className="mb-6 flex items-center gap-3">
        <span className="grid h-12 w-12 place-items-center rounded-xl bg-navy-800 text-white shadow-card"><Shield size={24} /></span>
        <div>
          <p className="text-lg font-extrabold tracking-wide text-navy-800">SIBER EVIDENCE</p>
          <p className="text-xs text-slate-500">Modul Administrator</p>
        </div>
      </div>
      <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-card">
        <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-amber-50 text-amber-600"><Construction size={26} /></div>
        <h1 className="mt-4 text-base font-bold text-navy-800">Halaman Administrator sedang dikembangkan</h1>
        <p className="mt-1 text-sm text-slate-500">
          Anda masuk sebagai <span className="font-semibold text-navy-800">{namaPengguna(user)}</span>. Modul Administrator
          (termasuk Manajemen Pengguna) akan dibangun pada tahap berikutnya.
        </p>
        <Button variant="secondary" icon={LogOut} className="mt-6" onClick={() => { logout(); navigate('/login', { replace: true }); }}>
          Keluar
        </Button>
      </div>
    </div>
  );
}
