import { nowLocal } from '../utils/helpers';

export function seedStore() {
  const users = [
    { id: 'usr-1', username: 'admin', nama: 'Administrator Sistem', role: 'Administrator', status: 'Aktif', aktivitasTerakhir: '2025-05-15T10:45' },
    { id: 'usr-2', username: 'b.setiawan', nama: 'IPTU Bambang Setiawan', role: 'Petugas', status: 'Aktif', aktivitasTerakhir: '2025-05-15T09:20' },
    { id: 'usr-3', username: 'r.pratama', nama: 'AIPTU Rendi Pratama', role: 'Petugas', status: 'Aktif', aktivitasTerakhir: '2025-05-14T15:05' },
    { id: 'usr-4', username: 's.wulandari', nama: 'AIPDA Sari Wulandari', role: 'Petugas', status: 'Nonaktif', aktivitasTerakhir: '2025-04-30T11:10' },
    { id: 'usr-5', username: 'd.kusuma', nama: 'Ipda Danu Kusuma', role: 'Petugas', status: 'Aktif', aktivitasTerakhir: '2025-05-15T08:05' },
  ];

  const perkara = [
    { id: 'pk-1', nomorLP: 'LP/87/III/2025/Ditreskrimsus', tanggalLaporan: '2025-03-12', uraian: 'Penipuan dalam jual beli daring melalui marketplace dengan modus pengiriman barang fiktif.', tahap: 'Sidik', penyidik: 'IPTU Bambang Setiawan', createdAt: '2025-03-12T10:00' },
    { id: 'pk-2', nomorLP: 'LP/102/III/2025/Ditreskrimsus', tanggalLaporan: '2025-03-28', uraian: 'Pembobolan akun media sosial dan penyalahgunaan data pribadi untuk permintaan uang tebusan.', tahap: 'Sidik', penyidik: 'AIPTU Rendi Pratama', createdAt: '2025-03-28T14:20' },
    { id: 'pk-3', nomorLP: 'LP/45/IV/2025/Ditreskrimsus', tanggalLaporan: '2025-04-05', uraian: 'Penyebaran konten tidak senonoh melalui grup pesan tertutup.', tahap: 'Lidik', penyidik: 'AIPDA Sari Wulandari', createdAt: '2025-04-05T09:40' },
    { id: 'pk-4', nomorLP: 'LP/121/IV/2025/Ditreskrimsus', tanggalLaporan: '2025-04-19', uraian: 'Penipuan investasi bodong berbasis aplikasi pinjaman daring.', tahap: 'Sidik', penyidik: 'IPTU Bambang Setiawan', createdAt: '2025-04-19T13:15' },
    { id: 'pk-5', nomorLP: 'LP/133/IV/2025/Ditreskrimsus', tanggalLaporan: '2025-04-27', uraian: 'Pencurian dana melalui alat pembayaran dengan teknik skimming pada mesin ATM.', tahap: 'Lidik', penyidik: 'AIPTU Rendi Pratama', createdAt: '2025-04-27T16:00' },
    { id: 'pk-6', nomorLP: 'LP/12/V/2025/Ditreskrimsus', tanggalLaporan: '2025-05-03', uraian: 'Ancaman kekerasan dan pemerasan melalui pesan elektronik.', tahap: 'Lidik', penyidik: 'AIPDA Sari Wulandari', createdAt: '2025-05-03T08:30' },
  ];

  const B = (
    id, kode, nama, kategori, deskripsi, nomorSeri,
    kondisi, nomorLP, tanggalPenerimaan, petugasPenerima,
    lokasi, status, catatan, lampiran = []
  ) => ({
    id, kode, nama, kategori, deskripsi, nomorSeri, kondisi, nomorLP, tanggalPenerimaan,
    petugasPenerima, lokasi, status, catatan, lampiran, draf: false,
    createdAt: tanggalPenerimaan + 'T09:00',
  });

  const barang = [
    B('bb-1', 'BB-2025-0001', 'Laptop Merk A Warna Hitam', 'Elektronik', 'Unit laptop warna hitam, kondisi menyala normal. Diterima dalam kantong segel bukti No. 001/LP-87.', 'SN-A1B2C3D4', 'Baik', 'LP/87/III/2025/Ditreskrimsus', '2025-03-14', 'Ipda Danu Kusuma', 'Ruang Barang Bukti — Rak A2', 'Tersedia', '', [{ id: 'lm-1', nama: 'berita-acara-penerimaan-BB-0001.pdf', tipe: 'application/pdf', ukuran: 184320 }]),
    B('bb-2', 'BB-2025-0002', 'Telepon Pintar Merk B', 'Elektronik', 'Perangkat telepon pintar warna biru, terdapat retakan layar di sudut kanan atas.', 'SN-E5F6G7H8', 'Baik', 'LP/87/III/2025/Ditreskrimsus', '2025-03-14', 'Ipda Danu Kusuma', 'Ruang Barang Bukti — Rak A2', 'Tersedia', ''),
    B('bb-3', 'BB-2025-0003', 'Hard Disk Eksternal 1 TB', 'Media Penyimpanan', 'Hard disk eksternal warna hitam, segel dalam kondisi utuh pada saat penerimaan.', 'SN-HDD-90122', 'Baik', 'LP/102/III/2025/Ditreskrimsus', '2025-03-30', 'Ipda Danu Kusuma', 'Ruang Forensik Digital', 'Dipinjam', 'Sedang dipinjam tim forensik digital untuk proses pencitraan disk (imaging).'),
    B('bb-4', 'BB-2025-0004', 'Flash Disk 32 GB', 'Media Penyimpanan', 'Flash disk warna putih kapasitas 32 GB, terdapat keretakan pada bagian konektor.', '', 'Rusak Ringan', 'LP/102/III/2025/Ditreskrimsus', '2025-03-30', 'Ipda Danu Kusuma', 'Lemari Kunci 01', 'Tersedia', 'Perlu penanganan hati-hati saat pemeriksaan.'),
    B('bb-5', 'BB-2025-0005', 'Kartu Memori microSD 64 GB', 'Media Penyimpanan', 'Kartu memori microSD terpasang pada adaptor SD.', '', 'Baik', 'LP/45/IV/2025/Ditreskrimsus', '2025-04-07', 'Ipda Danu Kusuma', 'Lemari Kunci 02', 'Tersedia', ''),
    B('bb-6', 'BB-2025-0006', 'Telepon Pintar Merk C', 'Elektronik', 'Telepon pintar warna hitam, kondisi fisik baik, baterai terpasang.', 'SN-C9D8E7F6', 'Baik', 'LP/121/IV/2025/Ditreskrimsus', '2025-04-21', 'Ipda Danu Kusuma', 'Ruang Barang Bukti — Rak B1', 'Tersedia', ''),
    B('bb-7', 'BB-2025-0007', 'Cetak Riwayat Transaksi Digital', 'Dokumen Digital', 'Print out riwayat transaksi sebanyak 27 lembar, halaman depan dilaminasi.', '', 'Baik', 'LP/121/IV/2025/Ditreskrimsus', '2025-04-21', 'AIPTU Rendi Pratama', 'Ruang Barang Bukti — Rak B2', 'Tersedia', 'Tersimpan dalam map bernomor.', [{ id: 'lm-2', nama: 'inventaris-cetak-transaksi.pdf', tipe: 'application/pdf', ukuran: 94208 }]),
    B('bb-8', 'BB-2025-0008', 'Router Wi-Fi Tanpa Merek', 'Perangkat Jaringan', 'Router dengan antena eksternal, tidak menyala saat diperiksa.', 'SN-RTR-55401', 'Rusak Berat', 'LP/133/IV/2025/Ditreskrimsus', '2025-04-29', 'Ipda Danu Kusuma', 'Gudang Barang Bukti', 'Tersedia', 'Perangkat tidak menyala; disimpan untuk kepentingan dokumentasi perkara.'),
    B('bb-9', 'BB-2025-0009', 'Kartu ATM Bekas', 'Lainnya', 'Tiga keping kartu dalam satu amplop segel.', '', 'Baik', 'LP/133/IV/2025/Ditreskrimsus', '2025-04-29', 'Ipda Danu Kusuma', 'Lemari Kunci 01', 'Tersedia', ''),
    B('bb-10', 'BB-2025-0010', 'Kartu SIM Bekas', 'Lainnya', 'Dua keping kartu SIM dalam amplop segel.', '', 'Baik', 'LP/45/IV/2025/Ditreskrimsus', '2025-04-08', 'Ipda Danu Kusuma', 'Lemari Kunci 02', 'Tersedia', ''),
    B('bb-11', 'BB-2025-0011', 'Laptop Merk D', 'Elektronik', 'Unit laptop warna abu-abu, kondisi menyala normal.', 'SN-D11E22F33', 'Baik', 'LP/12/V/2025/Ditreskrimsus', '2025-05-05', 'Ipda Danu Kusuma', 'Ruang Barang Bukti — Rak A1', 'Tersedia', ''),
    B('bb-12', 'BB-2025-0012', 'Modem USB Seluler', 'Perangkat Jaringan', 'Modem USB dengan kemasan terbuka, terdapat bekas panas pada bodi.', 'SN-MDM-77012', 'Rusak Ringan', 'LP/133/IV/2025/Ditreskrimsus', '2025-04-30', 'Ipda Danu Kusuma', 'Gudang Barang Bukti', 'Dalam Pemeriksaan', 'Menunggu pemeriksaan lanjutan oleh tim forensik digital.'),
    B('bb-13', 'BB-2025-0013', 'Telepon Pintar Rusak Terbakar', 'Elektronik', 'Perangkat rusak berat akibat terbakar, tidak dapat dinyalakan.', '', 'Rusak Berat', 'LP/102/III/2025/Ditreskrimsus', '2025-04-02', 'Ipda Danu Kusuma', 'Pemusnahan (Berita Acara No. 01/BA/IV/2025)', 'Dihancurkan', 'Dimusnahkan sesuai Berita Acara Pemusnahan Barang Bukti (data demo).'),
  ];

  const R = (
    id, kodeBB, jenis, tanggalWaktu, lokasiAsal,
    lokasiTujuan, petugas, alasan, catatan = '',
    harapanKembali = '', statusKembali = ''
  ) => ({ id, kodeBB, jenis, tanggalWaktu, lokasiAsal, lokasiTujuan, petugas, alasan, catatan, harapanKembali, statusKembali });

  const riwayat = [
    R('rv-1',  'BB-2025-0001', 'Penerimaan',   '2025-03-14T09:15', 'Penyerahan Penyidik', 'Ruang Barang Bukti — Rak A1', 'Ipda Danu Kusuma', 'Penerimaan awal barang bukti', 'Diterima dalam keadaan tersegel.'),
    R('rv-2',  'BB-2025-0002', 'Penerimaan',   '2025-03-14T09:25', 'Penyerahan Penyidik', 'Ruang Barang Bukti — Rak A1', 'Ipda Danu Kusuma', 'Penerimaan awal barang bukti'),
    R('rv-3',  'BB-2025-0013', 'Penerimaan',   '2025-04-02T10:10', 'Penyerahan Penyidik', 'Gudang Barang Bukti', 'Ipda Danu Kusuma', 'Penerimaan awal barang bukti', 'Perangkat rusak berat akibat terbakar.'),
    R('rv-4',  'BB-2025-0003', 'Penerimaan',   '2025-03-30T10:05', 'Penyerahan Penyidik', 'Lemari Kunci 01', 'Ipda Danu Kusuma', 'Penerimaan awal barang bukti'),
    R('rv-5',  'BB-2025-0004', 'Penerimaan',   '2025-03-30T10:20', 'Penyerahan Penyidik', 'Lemari Kunci 01', 'Ipda Danu Kusuma', 'Penerimaan awal barang bukti', 'Terdapat keretakan pada konektor.'),
    R('rv-6',  'BB-2025-0005', 'Penerimaan',   '2025-04-07T08:40', 'Penyerahan Penyidik', 'Lemari Kunci 02', 'Ipda Danu Kusuma', 'Penerimaan awal barang bukti'),
    R('rv-7',  'BB-2025-0010', 'Penerimaan',   '2025-04-08T09:00', 'Penyerahan Penyidik', 'Lemari Kunci 02', 'Ipda Danu Kusuma', 'Penerimaan awal barang bukti'),
    R('rv-8',  'BB-2025-0003', 'Pemeriksaan',  '2025-04-15T13:30', 'Lemari Kunci 01', 'Lemari Kunci 01', 'Ipda Danu Kusuma', 'Verifikasi kondisi fisik berkala', 'Segel masih utuh, kondisi baik.'),
    R('rv-9',  'BB-2025-0013', 'Pengalihan',   '2025-04-25T13:00', 'Gudang Barang Bukti', 'Pemusnahan (Berita Acara No. 01/BA/IV/2025)', 'IPTU Bambang Setiawan', 'Pemusnahan barang bukti sesuai berita acara', 'Contoh kejadian pemusnahan (data demo).'),
    R('rv-10', 'BB-2025-0006', 'Penerimaan',   '2025-04-21T14:10', 'Penyerahan Penyidik', 'Ruang Barang Bukti — Rak B1', 'Ipda Danu Kusuma', 'Penerimaan awal barang bukti'),
    R('rv-11', 'BB-2025-0007', 'Penerimaan',   '2025-04-21T14:25', 'Penyerahan Penyidik', 'Ruang Barang Bukti — Rak B2', 'AIPTU Rendi Pratama', 'Penerimaan awal barang bukti'),
    R('rv-12', 'BB-2025-0001', 'Perpindahan',  '2025-04-22T11:00', 'Ruang Barang Bukti — Rak A1', 'Ruang Barang Bukti — Rak A2', 'Ipda Danu Kusuma', 'Penataan ulang rak penyimpanan'),
    R('rv-13', 'BB-2025-0008', 'Penerimaan',   '2025-04-29T15:40', 'Penyerahan Penyidik', 'Gudang Barang Bukti', 'Ipda Danu Kusuma', 'Penerimaan awal barang bukti'),
    R('rv-14', 'BB-2025-0009', 'Penerimaan',   '2025-04-29T15:55', 'Penyerahan Penyidik', 'Lemari Kunci 01', 'Ipda Danu Kusuma', 'Penerimaan awal barang bukti'),
    R('rv-15', 'BB-2025-0012', 'Penerimaan',   '2025-04-30T15:40', 'Penyerahan Penyidik', 'Gudang Barang Bukti', 'Ipda Danu Kusuma', 'Penerimaan awal barang bukti', 'Menunggu pemeriksaan lanjutan.'),
    R('rv-16', 'BB-2025-0011', 'Penerimaan',   '2025-05-05T09:35', 'Penyerahan Penyidik', 'Ruang Barang Bukti — Rak A1', 'Ipda Danu Kusuma', 'Penerimaan awal barang bukti'),
    R('rv-17', 'BB-2025-0006', 'Peminjaman',   '2025-05-02T09:00', 'Ruang Barang Bukti — Rak B1', 'Ruang Forensik Digital', 'Ipda Danu Kusuma', 'Pemeriksaan forensik digital (ekstraksi data)', '', '2025-05-16', 'Sudah Kembali'),
    R('rv-18', 'BB-2025-0006', 'Pengembalian', '2025-05-15T10:30', 'Ruang Forensik Digital', 'Ruang Barang Bukti — Rak B1', 'Ipda Danu Kusuma', 'Peminjaman selesai, barang dikembalikan ke penyimpanan', 'Hasil ekstraksi diserahkan kepada penyidik.'),
    R('rv-19', 'BB-2025-0003', 'Peminjaman',   '2025-05-12T08:50', 'Lemari Kunci 01', 'Ruang Forensik Digital', 'Ipda Danu Kusuma', 'Pencitraan disk (imaging) oleh tim forensik', '', '2025-05-26', 'Belum Kembali'),
  ];

  return { perkara, barang, riwayat, users, notifSeen: '' };
}
