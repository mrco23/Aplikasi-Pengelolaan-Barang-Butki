import { Navigate, Route, Routes, useLocation, useParams } from 'react-router-dom';
import { useApp } from './context/AppContext';
import { Toaster } from './components/ui';
import AppLayout from './components/layout/AppLayout';
import { homeFor } from './utils/routes';

import LoginPage from './pages/auth/LoginPage';
import NotFoundPage from './pages/common/NotFoundPage';

/* Halaman bersama: dipakai Petugas (/petugas) dan Administrator (/admin) */
import DashboardPage from './pages/main/DashboardPage';
import PerkaraPage from './pages/main/PerkaraPage';
import PerkaraDetailPage from './pages/main/PerkaraDetailPage';
import BarangBuktiPage from './pages/main/BarangBuktiPage';
import BarangBuktiFormPage from './pages/main/BarangBuktiFormPage';
import BarangBuktiDetailPage from './pages/main/BarangBuktiDetailPage';
import RiwayatPage from './pages/main/RiwayatPage';
import LaporanPage from './pages/main/LaporanPage';
import PengaturanPage from './pages/main/PengaturanPage';

/* Halaman khusus Administrator */
import PenggunaPage from './pages/admin/PenggunaPage';
import MasterDataPage from './pages/admin/MasterDataPage';

/* Form edit di-remount per id agar state formulir tidak terbawa antar barang */
function KeyedFormPage() {
  const { id } = useParams();
  return <BarangBuktiFormPage key={`edit-${id}`} />;
}

/* Hanya untuk pengguna yang sudah login dengan peran tertentu */
function RequireRole({ role, children }) {
  const { user } = useApp();
  const location = useLocation();
  if (!user) return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  if (user.role !== role) return <Navigate to={homeFor(user)} replace />;
  return children;
}

function sharedRoutes() {
  return (
    <>
      <Route index element={<Navigate to="dashboard" replace />} />
      <Route path="dashboard" element={<DashboardPage />} />
      <Route path="perkara" element={<PerkaraPage />} />
      <Route path="perkara/:id" element={<PerkaraDetailPage />} />
      <Route path="barang-bukti" element={<BarangBuktiPage />} />
      <Route path="barang-bukti/baru" element={<BarangBuktiFormPage key="baru" />} />
      <Route path="barang-bukti/:id" element={<BarangBuktiDetailPage />} />
      <Route path="barang-bukti/:id/edit" element={<KeyedFormPage />} />
      <Route path="riwayat" element={<RiwayatPage />} />
      <Route path="laporan" element={<LaporanPage />} />
      <Route path="pengaturan" element={<PengaturanPage />} />
    </>
  );
}

/* Layar tunggu saat memeriksa sesi ke server */
function BootScreen() {
  return (
    <div className="grid min-h-screen place-items-center bg-slate-50">
      <div className="text-center">
        <div className="mx-auto mb-3 h-9 w-9 animate-spin rounded-full border-[3px] border-slate-200 border-t-blue-600" />
        <p className="text-[13px] font-semibold text-slate-500">Memuat SIBER EVIDENCE…</p>
      </div>
    </div>
  );
}

export default function App() {
  const { user, ready } = useApp();
  if (!ready) return <BootScreen />;
  return (
    <>
      <Routes>
        <Route path="/" element={<Navigate to={user ? homeFor(user) : '/login'} replace />} />
        <Route path="/login" element={user ? <Navigate to={homeFor(user)} replace /> : <LoginPage />} />

        <Route path="/petugas" element={<RequireRole role="petugas"><AppLayout /></RequireRole>}>
          {sharedRoutes()}
          <Route path="*" element={<NotFoundPage />} />
        </Route>

        <Route path="/admin" element={<RequireRole role="administrator"><AppLayout /></RequireRole>}>
          {sharedRoutes()}
          <Route path="pengguna" element={<PenggunaPage />} />
          <Route path="master-data" element={<MasterDataPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Route>

        <Route path="*" element={<NotFoundPage standalone />} />
      </Routes>
      <Toaster />
    </>
  );
}
