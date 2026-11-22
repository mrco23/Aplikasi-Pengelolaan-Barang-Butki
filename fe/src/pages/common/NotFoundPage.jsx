import { ArrowLeft, SearchX } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { ButtonLink } from '../../components/ui';
import { homeFor } from '../../utils/routes';

export default function NotFoundPage({ message, standalone }) {
  const { user } = useApp();
  const body = (
    <div className="grid place-items-center py-20 text-center">
      <div className="grid h-14 w-14 place-items-center rounded-2xl bg-slate-100 text-slate-400"><SearchX size={26} /></div>
      <h2 className="mt-4 text-lg font-bold text-navy-800">Halaman tidak ditemukan</h2>
      <p className="mt-1 max-w-md text-sm text-slate-500">{message || 'Tautan yang Anda buka tidak tersedia.'}</p>
      <ButtonLink to={user ? homeFor(user) : '/login'} icon={ArrowLeft} className="mt-5">
        {user ? 'Kembali ke Dashboard' : 'Kembali ke Halaman Masuk'}
      </ButtonLink>
    </div>
  );
  return standalone ? <div className="min-h-screen bg-slate-50 px-4">{body}</div> : body;
}
