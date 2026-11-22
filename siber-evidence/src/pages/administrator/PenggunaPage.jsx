import React, { useState } from 'react';
import { useApp } from '../../../context/AppContext';
import { Icon, Button, Card, Field, Input, Select, Badge, Avatar, IconBtn, ConfirmDialog, Modal, DemoNote } from '../../../components/common/UI';

export default function PenggunaPage() {
  const { data, user, deleteUser, toast } = useApp();
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [delTarget, setDelTarget] = useState(null);

  function confirmDelete() {
    if (!delTarget) return;
    const r = deleteUser(delTarget.id);
    if (r.ok) toast('success', 'Pengguna dihapus', delTarget.username + ' dihapus.');
    else toast('error', 'Gagal menghapus', r.msg);
    setDelTarget(null);
  }

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-navy-800">Manajemen Pengguna</h2>
          <p className="mt-0.5 text-sm text-slate-500">Kelola akun administrator dan petugas.</p>
        </div>
        <Button icon="plus" onClick={() => { setEditing(null); setFormOpen(true); }}>Tambah Pengguna</Button>
      </div>

      <Card noPad className="mt-5">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[700px] text-left text-sm">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/80 text-[11px] uppercase tracking-wide text-slate-500">
                <th className="px-5 py-3 font-semibold">Pengguna</th>
                <th className="px-4 py-3 font-semibold">Peran</th>
                <th className="px-4 py-3 font-semibold">Status</th>
                <th className="px-4 py-3 font-semibold">Aktivitas Terakhir</th>
                <th className="px-5 py-3 text-right font-semibold">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {data.users.map((u) => (
                <tr key={u.id} className="transition hover:bg-slate-50/70">
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-3">
                      <Avatar nama={u.nama} size="h-9 w-9 text-xs" />
                      <div>
                        <p className="font-semibold text-navy-800">{u.nama} {user.id === u.id && <span className="text-[10px] font-normal text-slate-400">(Anda)</span>}</p>
                        <p className="text-[11px] text-slate-500">@{u.username}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3.5"><Badge>{u.role}</Badge></td>
                  <td className="px-4 py-3.5"><Badge>{u.status}</Badge></td>
                  <td className="px-4 py-3.5 text-xs text-slate-500">{u.aktivitasTerakhir}</td>
                  <td className="px-5 py-3.5">
                    <div className="flex justify-end gap-1.5">
                      <IconBtn icon="pencil" title="Edit pengguna" onClick={() => { setEditing(u); setFormOpen(true); }} />
                      <IconBtn icon="trash-2" tone="danger" disabled={u.username === 'admin' || user.id === u.id} title="Hapus pengguna" onClick={() => setDelTarget(u)} />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <DemoNote>Pada versi nyata, pengaturan ini akan mengelola akses autentikasi. Di versi demo ini, perubahan hanya tersimpan di browser Anda.</DemoNote>

      <PenggunaFormModal open={formOpen} initial={editing} onClose={() => setFormOpen(false)} />
      <ConfirmDialog open={!!delTarget} onClose={() => setDelTarget(null)} onConfirm={confirmDelete}
        title="Hapus Pengguna?">
        <p>Akun <span className="font-semibold text-navy-800">{delTarget?.username}</span> akan dihapus dan tidak dapat masuk ke sistem demo lagi.</p>
      </ConfirmDialog>
    </div>
  );
}

function PenggunaFormModal({ open, initial, onClose }) {
  const { addUser, updateUser, toast } = useApp();
  const [f, setF] = useState({ username: '', nama: '', role: 'Petugas', status: 'Aktif' });
  const [errs, setErrs] = useState({});

  React.useEffect(() => {
    if (open) setF(initial ? { username: initial.username, nama: initial.nama, role: initial.role, status: initial.status } : { username: '', nama: '', role: 'Petugas', status: 'Aktif' });
    setErrs({});
  }, [open, initial]);

  const set = (k, v) => setF(o => ({ ...o, [k]: v }));

  function submit() {
    const e = {};
    if (!initial && !f.username.trim()) e.username = 'Nama pengguna wajib diisi.';
    if (!f.nama.trim()) e.nama = 'Nama lengkap wajib diisi.';
    setErrs(e);
    if (Object.keys(e).length) return;

    if (initial) {
      updateUser(initial.id, f);
      toast('success', 'Pengguna diperbarui', f.username + ' berhasil diperbarui.');
    } else {
      const r = addUser(f);
      if (r.ok) toast('success', 'Pengguna ditambahkan', f.username + ' dapat digunakan untuk login dengan sandi: demo123');
      else { setErrs({ username: r.msg }); return; }
    }
    onClose();
  }

  return (
    <Modal open={open} onClose={onClose} width="max-w-md"
      title={initial ? 'Edit Pengguna' : 'Tambah Pengguna Baru'}
      desc={initial ? 'Ubah informasi pengguna pada data demo.' : 'Buat kredensial demo baru (Sandi otomatis: demo123).'}
      footer={<React.Fragment><Button variant="secondary" onClick={onClose}>Batal</Button><Button icon="check" onClick={submit}>Simpan Pengguna</Button></React.Fragment>}>
      <div className="grid gap-4">
        <Field label="Nama Pengguna (Username)" required={!initial} error={errs.username} hint={initial && 'Nama pengguna tidak dapat diubah setelah dibuat.'}>
          <Input value={f.username} error={errs.username} disabled={!!initial} onChange={e => set('username', e.target.value)} placeholder="cth. b.setiawan" />
        </Field>
        <Field label="Nama Lengkap / Pangkat" required error={errs.nama}>
          <Input value={f.nama} error={errs.nama} onChange={e => set('nama', e.target.value)} placeholder="cth. IPTU Bambang Setiawan" />
        </Field>
        <Field label="Peran Sistem" required>
          <Select value={f.role} onChange={e => set('role', e.target.value)} options={[['Administrator', 'Administrator'], ['Petugas', 'Petugas']]} />
        </Field>
        {initial && (
          <Field label="Status Akun" required>
            <Select value={f.status} onChange={e => set('status', e.target.value)} options={[['Aktif', 'Aktif'], ['Nonaktif', 'Nonaktif']]} />
          </Field>
        )}
      </div>
    </Modal>
  );
}
