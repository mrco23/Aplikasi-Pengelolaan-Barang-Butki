import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Download, KeyRound, LogOut, RotateCcw } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { ROLE } from '../../constants';
import { downloadBlob, fmtBytes, fmtDateTime, namaPengguna } from '../../utils/format';
import { Alert, Avatar, Badge, Button, Card, ConfirmDialog, DemoNote, Field, InfoGrid, Input } from '../../components/ui';

export default function PengaturanPage() {
  const { data, user, logout, resetData, changePassword, toast, storeKey } = useApp();
  const navigate = useNavigate();
  const [resetOpen, setResetOpen] = useState(false);
  const [pw, setPw] = useState({ lama: '', baru: '', ulang: '' });
  const [pwErr, setPwErr] = useState({});
  const size = fmtBytes((localStorage.getItem(storeKey) || '').length);

  function submitPw(e) {
    e.preventDefault();
    const er = {};
    if (!pw.lama) er.lama = 'Kata sandi lama wajib diisi.';
    if (pw.baru.length < 8) er.baru = 'Kata sandi baru minimal 8 karakter.';
    else if (pw.baru === pw.lama) er.baru = 'Kata sandi baru harus berbeda dari yang lama.';
    if (pw.ulang !== pw.baru) er.ulang = 'Konfirmasi kata sandi tidak sama.';
    setPwErr(er);
    if (Object.keys(er).length) return;
    const r = changePassword(pw.lama, pw.baru);
    if (!r.ok) { setPwErr({ lama: r.msg }); return; }
    setPw({ lama: '', baru: '', ulang: '' });
    toast('success', 'Kata sandi diperbarui', 'Gunakan kata sandi baru saat login berikutnya.');
  }

  function exportJson() {
    downloadBlob('siber-evidence-data.json', new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' }));
    toast('success', 'Ekspor berhasil', 'Seluruh data diunduh sebagai berkas JSON.');
  }

  const setP = (k, v) => setPw((o) => ({ ...o, [k]: v }));

  return (
    <div className="grid gap-5 lg:grid-cols-2">
      <Card title="Profil Akun" desc="Informasi akun yang sedang digunakan.">
        <div className="flex items-center gap-4">
          <Avatar nama={user.nama} size="h-12 w-12 text-sm" />
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-bold text-navy-800">{namaPengguna(user)}</p>
            <p className="truncate text-xs text-slate-500">@{user.username}</p>
            <div className="mt-1"><Badge tone={user.role}>{ROLE[user.role]}</Badge></div>
          </div>
          <Button variant="secondary" icon={LogOut} onClick={() => { logout(); toast('info', 'Anda telah keluar', 'Sesi berakhir.'); navigate('/login', { replace: true }); }}>Keluar</Button>
        </div>
        <div className="mt-5 border-t border-slate-100 pt-4">
          <InfoGrid rows={[
            { l: 'Pangkat', v: user.pangkat },
            { l: 'NRP', v: user.nrp },
            { l: 'Jabatan', v: user.jabatan, wide: true },
            { l: 'Login terakhir', v: fmtDateTime(user.terakhir_login) },
          ]} />
        </div>
        <DemoNote>Perubahan data profil dilakukan oleh Administrator melalui Manajemen Pengguna.</DemoNote>
      </Card>

      <Card title="Ubah Kata Sandi" desc="Ganti kata sandi akun Anda secara berkala.">
        <form onSubmit={submitPw} className="space-y-4" noValidate>
          <Field label="Kata Sandi Lama" required error={pwErr.lama}>
            <Input type="password" autoComplete="current-password" value={pw.lama} error={pwErr.lama} onChange={(e) => setP('lama', e.target.value)} />
          </Field>
          <Field label="Kata Sandi Baru" required error={pwErr.baru} hint="Minimal 8 karakter.">
            <Input type="password" autoComplete="new-password" value={pw.baru} error={pwErr.baru} onChange={(e) => setP('baru', e.target.value)} />
          </Field>
          <Field label="Ulangi Kata Sandi Baru" required error={pwErr.ulang}>
            <Input type="password" autoComplete="new-password" value={pw.ulang} error={pwErr.ulang} onChange={(e) => setP('ulang', e.target.value)} />
          </Field>
          <div className="flex justify-end">
            <Button type="submit" icon={KeyRound}>Simpan Kata Sandi</Button>
          </div>
        </form>
      </Card>

      <Card title="Data Contoh" desc="Data tersimpan di peramban ini (belum terhubung ke server).">
        <InfoGrid rows={[
          { l: 'Penyimpanan', v: 'localStorage peramban' },
          { l: 'Ukuran data', v: size },
          { l: 'Perkara', v: `${data.perkara.length} data` },
          { l: 'Barang bukti', v: `${data.barang_bukti.length} data` },
        ]} />
        <div className="mt-5 flex flex-wrap gap-2">
          <Button variant="secondary" icon={RotateCcw} onClick={() => setResetOpen(true)}>Muat Ulang Data Contoh</Button>
          <Button variant="secondary" icon={Download} onClick={exportJson}>Ekspor Data (JSON)</Button>
        </div>
        <DemoNote>Mengosongkan data peramban akan menghapus seluruh perubahan. Gunakan ekspor JSON sebagai cadangan.</DemoNote>
      </Card>

      <Card title="Informasi Aplikasi" desc="Identitas dan lingkup aplikasi.">
        <InfoGrid rows={[
          { l: 'Nama Aplikasi', v: 'SIBER EVIDENCE' },
          { l: 'Versi', v: '1.0.0 (Kerja Praktik)' },
          { l: 'Pengelola', v: 'Subbid Siber, Ditreskrimsus Polda Sulawesi Utara', wide: true },
        ]} />
        <Alert tone="amber" className="mt-5">
          Aplikasi administratif pencatatan dan pemantauan barang bukti untuk keperluan Kerja Praktik. Bukan sistem pengambilan
          keputusan penyidikan maupun alat analisis forensik.
        </Alert>
      </Card>

      <ConfirmDialog open={resetOpen} onClose={() => setResetOpen(false)} danger={false} confirmLabel="Muat Ulang"
        title="Muat Ulang Data Contoh?"
        onConfirm={() => { resetData(); setResetOpen(false); toast('success', 'Data contoh dimuat ulang', 'Seluruh data dikembalikan ke kondisi awal.'); }}>
        <p>Seluruh perubahan (perkara, barang bukti, riwayat, kata sandi) akan dihapus dan diganti dengan data contoh awal dari folder <span className="font-mono text-xs">src/data</span>.</p>
      </ConfirmDialog>
    </div>
  );
}
