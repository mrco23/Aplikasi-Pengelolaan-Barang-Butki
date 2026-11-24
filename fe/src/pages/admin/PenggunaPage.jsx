import { useEffect, useMemo, useState } from 'react';
import { Check, KeyRound, Pencil, Plus, Power, ShieldCheck, UserCheck, UserX, Users, Wand2 } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { ROLE, STATUS_AKUN, toOptions } from '../../constants';
import { fmtDateTime, namaPengguna } from '../../utils/format';
import {
  Avatar, Badge, Button, Card, ConfirmDialog, DemoNote, EmptyState, Field, IconBtn, Input, Modal, Pagination,
  SearchInput, Select, StatCard, Table, paginate,
} from '../../components/ui';

const PS = 8;
const PANGKAT = ['BRIPDA', 'BRIPTU', 'BRIGPOL', 'BRIPKA', 'AIPDA', 'AIPTU', 'IPDA', 'IPTU', 'AKP', 'KOMPOL', 'AKBP', 'KOMBES POL'];
const MIN_PW = 6;

const randomPassword = () => Math.random().toString(36).slice(2, 6) + Math.floor(1000 + Math.random() * 9000);

export default function PenggunaPage() {
  const { data, user, setUserStatus, toast } = useApp();
  const [q, setQ] = useState('');
  const [role, setRole] = useState('');
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(1);
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [toggleTarget, setToggleTarget] = useState(null);
  const [pwTarget, setPwTarget] = useState(null);

  useEffect(() => { setPage(1); }, [q, role, status]);

  const filtered = useMemo(() => data.pengguna.filter((u) => {
    const s = q.trim().toLowerCase();
    if (s && ![u.username, namaPengguna(u), u.nrp || '', u.jabatan || ''].some((x) => x.toLowerCase().includes(s))) return false;
    if (role && u.role !== role) return false;
    if (status && u.status !== status) return false;
    return true;
  }).sort((a, b) => (a.role === b.role ? a.nama.localeCompare(b.nama) : a.role.localeCompare(b.role))), [data.pengguna, q, role, status]);

  const { cur, rows } = paginate(filtered, page, PS);
  const count = (fn) => data.pengguna.filter(fn).length;
  const hasFilter = !!(q || role || status);
  const openNew = () => { setEditing(null); setFormOpen(true); };

  async function confirmToggle() {
    const next = toggleTarget.status === 'aktif' ? 'nonaktif' : 'aktif';
    const r = await setUserStatus(toggleTarget.id, next);
    if (r.ok) toast('success', next === 'aktif' ? 'Akun diaktifkan' : 'Akun dinonaktifkan', `${namaPengguna(toggleTarget)} ${next === 'aktif' ? 'dapat login kembali' : 'tidak dapat login lagi'}.`);
    else toast('error', 'Gagal mengubah status', r.msg);
    setToggleTarget(null);
  }

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard icon={Users} tint="bg-blue-50 text-blue-600" label="Total Pengguna" value={data.pengguna.length} />
        <StatCard icon={ShieldCheck} tint="bg-navy-50 text-navy-700" label="Administrator" value={count((u) => u.role === 'administrator')} />
        <StatCard icon={UserCheck} tint="bg-emerald-50 text-emerald-600" label="Petugas Aktif" value={count((u) => u.role === 'petugas' && u.status === 'aktif')} />
        <StatCard icon={UserX} tint="bg-red-50 text-red-600" label="Akun Nonaktif" value={count((u) => u.status === 'nonaktif')} sub="tidak dapat login" />
      </div>

      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-1 flex-wrap items-center gap-2">
          <SearchInput className="w-full sm:w-72" placeholder="Cari nama, username, NRP, jabatan…" value={q} onChange={(e) => setQ(e.target.value)} />
          <Select className="w-40" value={role} onChange={(e) => setRole(e.target.value)} placeholder="Semua Peran" options={toOptions(ROLE)} />
          <Select className="w-40" value={status} onChange={(e) => setStatus(e.target.value)} placeholder="Semua Status" options={toOptions(STATUS_AKUN)} />
          {hasFilter && <button onClick={() => { setQ(''); setRole(''); setStatus(''); }} className="text-xs font-semibold text-blue-600 hover:underline">Atur ulang</button>}
        </div>
        <Button icon={Plus} onClick={openNew}>Tambah Pengguna</Button>
      </div>

      <Card noPad>
        {rows.length ? (
          <Table minWidth={960} head={['Pengguna', 'NRP', 'Jabatan', 'Peran', 'Status', 'Login Terakhir', { label: 'Aksi', className: 'text-right' }]}>
            {rows.map((u) => (
              <tr key={u.id} className="transition hover:bg-slate-50/70">
                <td className="px-5 py-3">
                  <div className="flex items-center gap-3">
                    <Avatar nama={u.nama} />
                    <div className="min-w-0">
                      <p className="truncate font-semibold text-navy-800">
                        {namaPengguna(u)}
                        {u.id === user.id && <span className="ml-1.5 text-[10px] font-semibold text-blue-600">(Anda)</span>}
                      </p>
                      <p className="text-[11px] text-slate-500">@{u.username}</p>
                    </div>
                  </div>
                </td>
                <td className="whitespace-nowrap px-4 py-3 text-xs tabular-nums text-slate-600">{u.nrp || '—'}</td>
                <td className="px-4 py-3 text-xs text-slate-600">{u.jabatan || '—'}</td>
                <td className="px-4 py-3"><Badge tone={u.role}>{ROLE[u.role]}</Badge></td>
                <td className="px-4 py-3"><Badge tone={u.status}>{STATUS_AKUN[u.status]}</Badge></td>
                <td className="whitespace-nowrap px-4 py-3 text-xs tabular-nums text-slate-500">{u.terakhir_login ? fmtDateTime(u.terakhir_login) : 'Belum pernah'}</td>
                <td className="px-5 py-3">
                  <div className="flex justify-end gap-1.5">
                    <IconBtn icon={Pencil} title="Edit pengguna" onClick={() => { setEditing(u); setFormOpen(true); }} />
                    <IconBtn icon={KeyRound} title="Atur ulang kata sandi" onClick={() => setPwTarget(u)} />
                    <IconBtn icon={Power} tone={u.status === 'aktif' ? 'danger' : 'default'} disabled={u.id === user.id}
                      title={u.status === 'aktif' ? 'Nonaktifkan akun' : 'Aktifkan akun'} onClick={() => setToggleTarget(u)} />
                  </div>
                </td>
              </tr>
            ))}
          </Table>
        ) : (
          <EmptyState icon={Users} title="Tidak ada pengguna yang cocok" desc="Ubah kata kunci pencarian atau filter." />
        )}
        <Pagination page={cur} pageSize={PS} total={filtered.length} onPage={setPage} />
      </Card>

      <DemoNote>Akun tidak dihapus agar jejak pencatatan (perkara, barang bukti, riwayat) tetap utuh. Nonaktifkan akun yang tidak lagi digunakan.</DemoNote>

      <UserFormModal open={formOpen} initial={editing} onClose={() => setFormOpen(false)} />
      <ResetPasswordModal target={pwTarget} onClose={() => setPwTarget(null)} />
      <ConfirmDialog open={!!toggleTarget} onClose={() => setToggleTarget(null)} onConfirm={confirmToggle}
        danger={toggleTarget?.status === 'aktif'}
        title={toggleTarget?.status === 'aktif' ? 'Nonaktifkan Akun?' : 'Aktifkan Akun?'}
        confirmLabel={toggleTarget?.status === 'aktif' ? 'Nonaktifkan' : 'Aktifkan'}>
        {toggleTarget?.status === 'aktif'
          ? <p><span className="font-semibold text-navy-800">{namaPengguna(toggleTarget)}</span> tidak akan bisa login sampai akunnya diaktifkan kembali. Data yang pernah dicatat tetap tersimpan.</p>
          : <p><span className="font-semibold text-navy-800">{namaPengguna(toggleTarget)}</span> akan dapat login kembali.</p>}
      </ConfirmDialog>
    </div>
  );
}

function UserFormModal({ open, initial, onClose }) {
  const { addUser, updateUser, toast } = useApp();
  const blank = { username: '', nama: '', pangkat: '', nrp: '', jabatan: '', role: 'petugas', status: 'aktif', password: '' };
  const [f, setF] = useState(blank);
  const [errs, setErrs] = useState({});

  useEffect(() => {
    if (!open) return;
    setF(initial
      ? { username: initial.username, nama: initial.nama, pangkat: initial.pangkat || '', nrp: initial.nrp || '', jabatan: initial.jabatan || '', role: initial.role, status: initial.status, password: '' }
      : blank);
    setErrs({});
  }, [open, initial]); // eslint-disable-line react-hooks/exhaustive-deps

  const set = (k, v) => setF((o) => ({ ...o, [k]: v }));

  async function submit() {
    const e = {};
    if (!initial) {
      if (!f.username.trim()) e.username = 'Nama pengguna wajib diisi.';
      else if (!/^[a-z0-9._]{3,30}$/i.test(f.username.trim())) e.username = '3–30 karakter: huruf, angka, titik, atau garis bawah.';
      if (f.password.length < MIN_PW) e.password = `Kata sandi minimal ${MIN_PW} karakter.`;
    }
    if (!f.nama.trim()) e.nama = 'Nama lengkap wajib diisi.';
    if (f.nrp && !/^\d{8}$/.test(f.nrp)) e.nrp = 'NRP terdiri dari 8 digit angka.';
    if (!f.jabatan.trim()) e.jabatan = 'Jabatan wajib diisi.';
    setErrs(e);
    if (Object.keys(e).length) { toast('error', 'Formulir belum lengkap', 'Periksa kembali isian yang ditandai merah.'); return; }

    const payload = { nama: f.nama.trim(), pangkat: f.pangkat || null, nrp: f.nrp || null, jabatan: f.jabatan.trim(), role: f.role, status: f.status };
    const r = initial ? await updateUser(initial.id, payload) : await addUser({ ...payload, username: f.username.trim(), password: f.password });
    if (!r.ok) { setErrs({ [r.field || 'nama']: r.msg }); toast('error', 'Gagal menyimpan', r.msg); return; }
    toast('success', initial ? 'Pengguna diperbarui' : 'Pengguna ditambahkan', initial ? `Data ${payload.nama} disimpan.` : `Akun ${f.username.trim()} siap digunakan.`);
    onClose();
  }

  return (
    <Modal open={open} onClose={onClose} width="max-w-xl"
      title={initial ? 'Edit Pengguna' : 'Tambah Pengguna'}
      desc={initial ? `Perbarui data akun @${initial.username}.` : 'Buat akun baru untuk Petugas atau Administrator.'}
      footer={<>
        <Button variant="secondary" onClick={onClose}>Batal</Button>
        <Button icon={Check} onClick={submit}>{initial ? 'Simpan Perubahan' : 'Simpan Pengguna'}</Button>
      </>}>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Nama Pengguna (username)" required={!initial} error={errs.username} hint={initial ? 'Username tidak dapat diubah.' : 'Dipakai untuk login, cth. d.kusuma'}>
          <Input value={f.username} disabled={!!initial} error={errs.username} onChange={(e) => set('username', e.target.value)} autoComplete="off" />
        </Field>
        {!initial ? (
          <Field label="Kata Sandi Awal" required error={errs.password} hint={`Minimal ${MIN_PW} karakter. Minta pengguna menggantinya setelah login.`}>
            <div className="flex gap-2">
              <Input value={f.password} error={errs.password} onChange={(e) => set('password', e.target.value)} autoComplete="new-password" />
              <Button variant="secondary" icon={Wand2} title="Buat acak" onClick={() => set('password', randomPassword())} />
            </div>
          </Field>
        ) : <div className="hidden sm:block" />}
        <Field label="Pangkat">
          <Select value={f.pangkat} onChange={(e) => set('pangkat', e.target.value)} placeholder="— Tanpa pangkat —" options={PANGKAT.map((p) => [p, p])} />
        </Field>
        <Field label="Nama Lengkap" required error={errs.nama}>
          <Input value={f.nama} error={errs.nama} onChange={(e) => set('nama', e.target.value)} placeholder="Tanpa pangkat, cth. Danu Kusuma" />
        </Field>
        <Field label="NRP" error={errs.nrp} hint="8 digit. Kosongkan untuk akun non-anggota.">
          <Input value={f.nrp} inputMode="numeric" maxLength={8} error={errs.nrp} onChange={(e) => set('nrp', e.target.value.replace(/\D/g, ''))} />
        </Field>
        <Field label="Jabatan" required error={errs.jabatan}>
          <Input value={f.jabatan} error={errs.jabatan} onChange={(e) => set('jabatan', e.target.value)} placeholder="cth. Penyidik Pembantu" />
        </Field>
        <Field label="Peran" required error={errs.role}>
          <Select value={f.role} error={errs.role} onChange={(e) => set('role', e.target.value)} options={toOptions(ROLE)} />
        </Field>
        <Field label="Status" required>
          <Select value={f.status} onChange={(e) => set('status', e.target.value)} options={toOptions(STATUS_AKUN)} />
        </Field>
      </div>
    </Modal>
  );
}

function ResetPasswordModal({ target, onClose }) {
  const { resetUserPassword, toast } = useApp();
  const [pw, setPw] = useState('');
  const [err, setErr] = useState('');
  useEffect(() => { if (target) { setPw(randomPassword()); setErr(''); } }, [target]);

  async function submit() {
    if (pw.length < MIN_PW) { setErr(`Kata sandi minimal ${MIN_PW} karakter.`); return; }
    const r = await resetUserPassword(target.id, pw);
    if (!r.ok) { setErr(r.msg); return; }
    toast('success', 'Kata sandi diatur ulang', `Sampaikan kata sandi baru kepada ${namaPengguna(target)} secara langsung.`);
    onClose();
  }

  return (
    <Modal open={!!target} onClose={onClose} width="max-w-md" title="Atur Ulang Kata Sandi"
      desc={target ? `Tetapkan kata sandi baru untuk @${target.username}.` : ''}
      footer={<>
        <Button variant="secondary" onClick={onClose}>Batal</Button>
        <Button icon={KeyRound} onClick={submit}>Atur Ulang</Button>
      </>}>
      <Field label="Kata Sandi Baru" required error={err} hint="Pengguna sebaiknya segera mengganti kata sandi ini melalui menu Pengaturan.">
        <div className="flex gap-2">
          <Input value={pw} error={err} onChange={(e) => setPw(e.target.value)} autoComplete="new-password" />
          <Button variant="secondary" icon={Wand2} title="Buat acak" onClick={() => setPw(randomPassword())} />
        </div>
      </Field>
    </Modal>
  );
}
