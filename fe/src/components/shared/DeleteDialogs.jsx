/* Dialog hapus data — hanya ditampilkan untuk Administrator. Server melakukan soft delete. */
import { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { ConfirmDialog } from '../ui';

export function DeletePerkaraDialog({ target, onClose, onDeleted }) {
  const { data, deletePerkara, toast } = useApp();
  const [busy, setBusy] = useState(false);
  const linked = target ? data.barang_bukti.filter((b) => b.perkara_id === target.id).length : 0;

  async function confirm() {
    setBusy(true);
    const r = await deletePerkara(target.id);
    setBusy(false);
    if (r.ok) { toast('success', 'Perkara dihapus', `${target.nomor_lp} telah dihapus.`); onDeleted?.(); }
    else toast('error', 'Gagal menghapus', r.msg);
    onClose();
  }

  return (
    <ConfirmDialog open={!!target} onClose={onClose} onConfirm={confirm} title="Hapus Data Perkara?"
      confirmLabel="Hapus Perkara" confirmDisabled={linked > 0 || busy}>
      <p>Data perkara <span className="font-semibold text-navy-800">{target?.nomor_lp}</span> akan dihapus dari daftar dan tidak dapat dibatalkan dari aplikasi.</p>
      {linked > 0 && (
        <p className="mt-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs font-medium text-amber-800">
          Masih terdapat {linked} barang bukti terkait. Hapus atau pindahkan barang bukti tersebut terlebih dahulu.
        </p>
      )}
    </ConfirmDialog>
  );
}

export function DeleteBarangDialog({ target, onClose, onDeleted }) {
  const { data, deleteBarang, toast } = useApp();
  const [busy, setBusy] = useState(false);
  const rv = target ? data.riwayat_barang_bukti.filter((r) => r.barang_bukti_id === target.id).length : 0;

  async function confirm() {
    setBusy(true);
    const r = await deleteBarang(target.id);
    setBusy(false);
    if (r.ok) { toast('success', 'Barang bukti dihapus', `${target.kode} tidak lagi tampil di daftar.`); onDeleted?.(); }
    else toast('error', 'Gagal menghapus', r.msg);
    onClose();
  }

  return (
    <ConfirmDialog open={!!target} onClose={onClose} onConfirm={confirm} title="Hapus Barang Bukti?" confirmLabel="Hapus" confirmDisabled={busy}>
      <p>
        Data <span className="font-semibold text-navy-800">{target?.kode}</span> akan dihapus dari daftar. {rv} catatan riwayat
        dan lampirannya tetap tersimpan di basis data sebagai jejak (chain of custody).
      </p>
      {rv > 1 && (
        <p className="mt-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs font-medium text-amber-800">
          Barang ini sudah memiliki riwayat perpindahan. Hapus hanya jika data memang salah input.
        </p>
      )}
    </ConfirmDialog>
  );
}
