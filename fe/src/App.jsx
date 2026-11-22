import { Navigate, Route, Routes, useLocation, useParams } from 'react-router-dom';
import { useApp } from './context/AppContext';
import { Toaster } from './components/ui';
import PetugasLayout from './components/layout/PetugasLayout';

import LoginPage from './pages/auth/LoginPage';
import NotFoundPage from './pages/common/NotFoundPage';
import AdminPlaceholderPage from './pages/common/AdminPlaceholderPage';

import DashboardPage from './pages/petugas/DashboardPage';
import PerkaraPage from './pages/petugas/PerkaraPage';
import PerkaraDetailPage from './pages/petugas/PerkaraDetailPage';
import BarangBuktiPage from './pages/petugas/BarangBuktiPage';
import BarangBuktiFormPage from './pages/petugas/BarangBuktiFormPage';
import BarangBuktiDetailPage from './pages/petugas/BarangBuktiDetailPage';
import RiwayatPage from './pages/petugas/RiwayatPage';
import LaporanPage from './pages/petugas/LaporanPage';
import PengaturanPage from './pages/petugas/PengaturanPage';

import { homeFor } from './utils/routes';

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

export default function App() {
  const { user } = useApp();
  return (
    <>
      <Routes>
        <Route path="/" element={<Navigate to={user ? homeFor(user) : '/login'} replace />} />
        <Route path="/login" element={user ? <Navigate to={homeFor(user)} replace /> : <LoginPage />} />

        <Route path="/petugas" element={<RequireRole role="petugas"><PetugasLayout /></RequireRole>}>
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
          <Route path="*" element={<NotFoundPage />} />
        </Route>

        <Route path="/admin/*" element={<RequireRole role="administrator"><AdminPlaceholderPage /></RequireRole>} />
        <Route path="*" element={<NotFoundPage standalone />} />
      </Routes>
      <Toaster />
    </>
  );
}
