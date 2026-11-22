/**
 * STORAGE JAVASCRIPT - SIBER EVIDENCE
 * Mengelola data localStorage, seeding data demo, dan fungsi CRUD
 */

const STORE_KEY = 'siber_evidence_v1';

const AppData = {
  data: null,

  seed() {
    const users = [
      { id: 'usr-1', username: 'admin', nama: 'Administrator Sistem', role: 'Administrator', status: 'Aktif', aktivitasTerakhir: '2025-05-15T10:45' },
      { id: 'usr-2', username: 'b.setiawan', nama: 'IPTU Bambang Setiawan', role: 'Petugas', status: 'Aktif', aktivitasTerakhir: '2025-05-15T09:20' }
    ];
    const perkara = [
      { id: 'pk-1', nomorLP: 'LP/87/III/2025/Ditreskrimsus', tanggalLaporan: '2025-03-12', uraian: 'Penipuan dalam jual beli daring.', tahap: 'Sidik', penyidik: 'IPTU Bambang Setiawan', createdAt: '2025-03-12T10:00' }
    ];
    const barang = [
      { id: 'bb-1', kode: 'BB-2025-0001', nama: 'Laptop Merk A Warna Hitam', kategori: 'Elektronik', deskripsi: 'Unit laptop warna hitam.', nomorSeri: 'SN-A1B2C3D4', kondisi: 'Baik', nomorLP: 'LP/87/III/2025/Ditreskrimsus', tanggalPenerimaan: '2025-03-14', petugasPenerima: 'Ipda Danu Kusuma', lokasi: 'Ruang Barang Bukti — Rak A2', status: 'Tersedia', catatan: '', lampiran: [], draf: false, createdAt: '2025-03-14T09:00' }
    ];
    const riwayat = [
      { id: 'rv-1', kodeBB: 'BB-2025-0001', jenis: 'Penerimaan', tanggalWaktu: '2025-03-14T09:15', lokasiAsal: 'Penyerahan Penyidik', lokasiTujuan: 'Ruang Barang Bukti — Rak A1', petugas: 'Ipda Danu Kusuma', alasan: 'Penerimaan awal', catatan: '', harapanKembali: '', statusKembali: '' }
    ];
    return { users, perkara, barang, riwayat, notifSeen: '' };
  },

  load() {
    try {
      const raw = localStorage.getItem(STORE_KEY);
      if (raw) {
        const d = JSON.parse(raw);
        if (d && Array.isArray(d.perkara) && Array.isArray(d.users)) {
          this.data = d;
          return d;
        }
      }
    } catch (e) { console.error('Error loading data', e); }
    
    // Jika tidak ada data yang valid, gunakan seed data
    this.data = this.seed();
    this.save();
    return this.data;
  },

  save() {
    if (this.data) {
      localStorage.setItem(STORE_KEY, JSON.stringify(this.data));
    }
  },

  reset() {
    this.data = this.seed();
    this.save();
  },

  // --- CRUD Perkara ---
  getPerkara() { return this.data.perkara; },
  getPerkaraById(id) { return this.data.perkara.find(p => p.id === id); },
  addPerkara(p) {
    const np = { ...p, id: uid('pk'), createdAt: nowLocal() };
    this.data.perkara.push(np);
    this.save();
    return np;
  },
  updatePerkara(id, updates) {
    const i = this.data.perkara.findIndex(p => p.id === id);
    if (i > -1) {
      this.data.perkara[i] = { ...this.data.perkara[i], ...updates };
      this.save();
      return this.data.perkara[i];
    }
    return null;
  },
  deletePerkara(id) {
    const p = this.getPerkaraById(id);
    if (!p) return { ok: false, msg: 'Data tidak ditemukan.' };
    const linked = this.data.barang.filter(b => b.nomorLP === p.nomorLP).length;
    if (linked > 0) return { ok: false, msg: `Masih ada ${linked} barang bukti terkait.` };
    this.data.perkara = this.data.perkara.filter(x => x.id !== id);
    this.save();
    return { ok: true };
  },

  // --- CRUD Barang Bukti ---
  getBarang() { return this.data.barang; },
  getBarangById(id) { return this.data.barang.find(b => b.id === id); },
  addBarang(b) {
    const nb = { ...b, id: uid('bb'), createdAt: nowLocal() };
    this.data.barang.push(nb);
    if (!nb.draf) {
      this.data.riwayat.push({
        id: uid('rv'), kodeBB: nb.kode, jenis: 'Penerimaan',
        tanggalWaktu: (nb.tanggalPenerimaan || todayISO()) + 'T09:00',
        lokasiAsal: 'Penyerahan Penyidik', lokasiTujuan: nb.lokasi, petugas: nb.petugasPenerima,
        alasan: 'Penerimaan awal barang bukti', catatan: nb.catatan || '', harapanKembali: '', statusKembali: ''
      });
    }
    this.save();
    return nb;
  },
  updateBarang(id, updates) {
    const old = this.getBarangById(id);
    if (!old) return null;
    const nb = { ...old, ...updates };
    
    // Update riwayat terkait jika kode berubah
    if (old.kode !== nb.kode) {
      this.data.riwayat.forEach(r => { if (r.kodeBB === old.kode) r.kodeBB = nb.kode; });
    }

    if (!nb.draf) {
      const petugas = Auth.getUser() ? Auth.getUser().nama : 'Sistem';
      const now = nowLocal();
      if (old.draf) {
        this.data.riwayat.push({
          id: uid('rv'), kodeBB: nb.kode, jenis: 'Penerimaan',
          tanggalWaktu: now, lokasiAsal: 'Sistem', lokasiTujuan: nb.lokasi, petugas,
          alasan: 'Pendaftaran barang bukti dari draft', catatan: '', harapanKembali: '', statusKembali: ''
        });
      } else if (old.lokasi !== nb.lokasi) {
        this.data.riwayat.push({
          id: uid('rv'), kodeBB: nb.kode, jenis: 'Perpindahan',
          tanggalWaktu: now, lokasiAsal: old.lokasi, lokasiTujuan: nb.lokasi, petugas,
          alasan: 'Penyesuaian lokasi melalui form edit', catatan: '', harapanKembali: '', statusKembali: ''
        });
      } else if (old.status !== nb.status) {
        this.data.riwayat.push({
          id: uid('rv'), kodeBB: nb.kode, jenis: 'Pemeriksaan',
          tanggalWaktu: now, lokasiAsal: nb.lokasi, lokasiTujuan: nb.lokasi, petugas,
          alasan: 'Pembaruan status melalui form edit', catatan: '', harapanKembali: '', statusKembali: ''
        });
      }
    }

    const i = this.data.barang.findIndex(b => b.id === id);
    this.data.barang[i] = nb;
    this.save();
    return nb;
  },
  deleteBarang(id) {
    const b = this.getBarangById(id);
    if (!b) return { ok: false, msg: 'Data tidak ditemukan.' };
    this.data.barang = this.data.barang.filter(x => x.id !== id);
    this.data.riwayat = this.data.riwayat.filter(r => r.kodeBB !== b.kode);
    this.save();
    return { ok: true };
  },

  // --- Riwayat ---
  getRiwayat() { return this.data.riwayat; },
  addRiwayat(r) {
    this.data.riwayat.push({ ...r, id: uid('rv') });
    
    // Update status/lokasi barang bukti terkait
    const b = this.data.barang.find(x => x.kode === r.kodeBB && !x.draf);
    if (b) {
      if (r.jenis === 'Peminjaman') { b.status = 'Dipinjam'; b.lokasi = r.lokasiTujuan || b.lokasi; }
      else if (r.jenis === 'Pengembalian') { b.status = 'Tersedia'; b.lokasi = r.lokasiTujuan || b.lokasi; }
      else if (r.jenis === 'Perpindahan' || r.jenis === 'Pengalihan' || r.jenis === 'Penerimaan') { b.lokasi = r.lokasiTujuan || b.lokasi; }
      
      // Tandai sudah kembali
      if (r.jenis === 'Pengembalian') {
        for (let i = this.data.riwayat.length - 1; i >= 0; i--) {
          const rev = this.data.riwayat[i];
          if (rev.kodeBB === r.kodeBB && rev.jenis === 'Peminjaman' && rev.statusKembali === 'Belum Kembali') {
            rev.statusKembali = 'Sudah Kembali';
            break;
          }
        }
      }
    }
    this.save();
  },

  // --- Pengguna ---
  getUsers() { return this.data.users; },
  addUser(u) {
    const uname = u.username.trim().toLowerCase();
    if (this.data.users.some(x => x.username.toLowerCase() === uname)) return { ok: false, msg: 'Username sudah ada.' };
    const nu = { id: uid('usr'), username: u.username.trim(), nama: u.nama.trim(), role: u.role, status: u.status || 'Aktif', aktivitasTerakhir: '-' };
    this.data.users.push(nu);
    this.save();
    return { ok: true };
  },
  updateUser(id, u) {
    const i = this.data.users.findIndex(x => x.id === id);
    if (i > -1) {
      this.data.users[i] = { ...this.data.users[i], ...u };
      this.save();
    }
  },
  deleteUser(id) {
    const u = this.data.users.find(x => x.id === id);
    if (!u) return { ok: false, msg: 'Data tidak ditemukan.' };
    if (u.username === 'admin') return { ok: false, msg: 'Admin default tidak dapat dihapus.' };
    this.data.users = this.data.users.filter(x => x.id !== id);
    this.save();
    return { ok: true };
  }
};

// Inisialisasi data saat diload
AppData.load();
