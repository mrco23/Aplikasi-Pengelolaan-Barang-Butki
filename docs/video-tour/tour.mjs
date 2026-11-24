/* Skenario video tour SIBER EVIDENCE.
   Dipakai oleh skrip perekam layar (capture.mjs) dan komposer video (index.html).

   Setiap langkah:
     say     narasi (juga subtitle)
     act     aksi di aplikasi sebelum layar diambil, berurutan:
               { click: L }  klik elemen (kursor bergerak & klik di video)
               { hover: L }  kursor menunjuk elemen, tanpa klik
               { fill: L, value | option | index }  isi kolom tanpa animasi kursor
               { nav: '/path' }  pindah halaman (prefix peran otomatis)
               { wait: ms }
     zoom    elemen yang diperbesar (L atau [L, L] untuk gabungan); null = tampilan penuh
   Pencari elemen L: { text, starts, in } · { field } · { card } · { btn } · { title } · { sel, i } · { root:'page' }
   Saat modal terbuka, pencarian otomatis dilakukan di dalam modal kecuali { root: 'page' }. */

export const VOICE = 'id-ID-ArdiNeural';

export const STEPS = [
  /* ---------- 0. Pembuka ---------- */
  { chapter: 'Pembuka', title: true,
    say: 'Halo! Di video ini, kita akan berkeliling melihat SIBER EVIDENCE, aplikasi web untuk mengelola barang bukti di Subbid Siber Ditreskrimsus Polda Sulawesi Utara.',
    act: [], zoom: null },
  { chapter: 'Pembuka',
    say: 'Aplikasi ini membantu petugas mencatat perkara, mendaftarkan barang bukti, dan melacak setiap perpindahannya, mulai dari diterima sampai dimusnahkan.',
    act: [], zoom: { text: 'SIBER EVIDENCE', starts: true, up: 2 } },

  /* ---------- 1. Login ---------- */
  { chapter: 'Login',
    say: 'Kita mulai dari halaman login. Masukkan nama pengguna dan kata sandi. Kali ini kita masuk sebagai petugas.',
    act: [{ click: { field: 'Nama Pengguna', control: true } }, { fill: { field: 'Nama Pengguna' }, value: 'd.kusuma' }, { fill: { field: 'Kata Sandi' }, value: 'contohsaja' }],
    zoom: [{ field: 'Nama Pengguna' }, { field: 'Kata Sandi' }] },
  { chapter: 'Login', login: 'd.kusuma',
    say: 'Hanya akun berstatus aktif yang bisa masuk. Setelah tombol Masuk ditekan, sistem langsung membawa kita ke halaman sesuai peran.',
    act: [{ hover: { btn: 'Masuk', in: 'form' } }], zoom: { btn: 'Masuk', in: 'form' } },

  /* ---------- 2. Dashboard ---------- */
  { chapter: 'Dashboard',
    say: 'Inilah Dashboard, halaman pertama setelah login. Semua kondisi barang bukti bisa dipantau dari sini.',
    act: [], zoom: null },
  { chapter: 'Dashboard',
    say: 'Di sebelah kiri ada menu utama: Data Perkara, Data Barang Bukti, Riwayat Perpindahan, Laporan, dan Pengaturan.',
    act: [], zoom: { sel: 'aside' } },
  { chapter: 'Dashboard',
    say: 'Empat kartu di bagian atas menunjukkan total barang bukti, total perkara, barang yang tersedia, dan barang yang sedang dipinjam.',
    act: [], zoom: [{ text: 'Total Barang Bukti', up: '.rounded-xl' }, { text: 'Sedang Dipinjam', up: '.rounded-xl' }] },
  { chapter: 'Dashboard',
    say: 'Bagian ini penting. Jika ada barang yang dipinjam tapi belum kembali setelah tanggal yang dijanjikan, barang itu muncul di sini supaya segera ditindaklanjuti.',
    act: [], zoom: { card: 'Peminjaman Melewati Tenggat' } },
  { chapter: 'Dashboard',
    say: 'Ada juga sebaran status barang bukti dan daftar aktivitas terbaru, jadi kita langsung tahu apa yang baru saja terjadi.',
    act: [], zoom: [{ card: 'Status Barang Bukti' }, { card: 'Aktivitas Terakhir' }] },
  { chapter: 'Dashboard',
    say: 'Dan untuk pekerjaan yang paling sering dilakukan, tersedia tombol aksi cepat.',
    act: [], zoom: { card: 'Aksi Cepat' } },

  /* ---------- 3. Data Perkara ---------- */
  { chapter: 'Data Perkara',
    say: 'Setiap barang bukti selalu berasal dari sebuah perkara. Semua perkara tercatat di menu Data Perkara.',
    act: [{ click: { text: 'Data Perkara', in: 'aside', up: 'a' } }, { wait: 1200 }], zoom: null },
  { chapter: 'Data Perkara',
    say: 'Kita bisa mencari berdasarkan nomor laporan polisi, uraian, atau nama penyidik, lalu menyaringnya berdasarkan tahap Lidik atau Sidik.',
    act: [], zoom: { sel: 'input[placeholder^="Cari nomor LP"]', up: 'section' } },
  { chapter: 'Data Perkara',
    say: 'Untuk menambah perkara baru, klik Tambah Perkara. Isi nomor laporan polisi, tanggal laporan, uraian singkat, tahap penanganan, dan penyidiknya.',
    act: [{ click: { btn: 'Tambah Perkara' } }, { wait: 600 }], zoom: { sel: '[role=dialog]' } },
  { chapter: 'Data Perkara',
    say: 'Nomor laporan polisi tidak boleh ganda. Kalau nomornya sudah terdaftar, sistem langsung menolaknya.',
    act: [{ fill: { field: 'Nomor Laporan Polisi' }, value: '$firstLP' }, { click: { btn: 'Simpan Perkara' } }, { wait: 500 }],
    zoom: { field: 'Nomor Laporan Polisi' } },
  { chapter: 'Data Perkara',
    say: 'Kalau nomor perkara diklik, kita masuk ke detail perkara. Di sini terlihat informasi perkara beserta semua barang bukti yang terkait dengannya.',
    act: [{ click: { btn: 'Batal' } }, { wait: 400 }, { click: { sel: 'tbody a', root: 'page' } }, { wait: 1500 }],
    zoom: [{ card: 'Informasi Umum Perkara' }, { card: 'Ringkasan Barang Bukti' }] },

  /* ---------- 4. Daftarkan Barang Bukti ---------- */
  { chapter: 'Daftarkan Barang Bukti',
    say: 'Sekarang kita daftarkan barang bukti baru untuk perkara ini. Karena dibuka dari detail perkara, nomor laporan polisinya sudah terisi otomatis.',
    act: [{ click: { btn: 'Daftarkan Barang Bukti' } }, { wait: 1500 }], zoom: null },
  { chapter: 'Daftarkan Barang Bukti',
    say: 'Perhatikan kode barang bukti. Kode ini dibuat otomatis oleh sistem, dengan format B B, tahun, lalu nomor urut.',
    act: [], zoom: { field: 'Kode Barang Bukti' } },
  { chapter: 'Daftarkan Barang Bukti',
    say: 'Lalu isi informasi umumnya: nama barang, kategori, nomor seri atau IMEI, dan kondisi fisiknya.',
    act: [
      { click: { field: 'Nama Barang Bukti', control: true } },
      { fill: { field: 'Nama Barang Bukti' }, value: 'Telepon Pintar Merk X Warna Hitam' },
      { fill: { field: 'Kategori' }, option: 'Elektronik' },
      { fill: { field: 'Nomor Seri / IMEI' }, value: '356938035643809' },
      { fill: { field: 'Kondisi Fisik' }, option: 'Baik' },
      { fill: { field: 'Deskripsi' }, value: 'Telepon pintar warna hitam, layar retak di sudut kanan atas. Diterima dalam kantong segel bukti.' },
    ], zoom: { card: 'Informasi Umum' } },
  { chapter: 'Daftarkan Barang Bukti',
    say: 'Tentukan juga di mana barang ini disimpan, misalnya di rak ruang barang bukti.',
    act: [
      { fill: { field: 'Petugas Penerima' }, index: 1 },
      { fill: { field: 'Lokasi Penyimpanan' }, option: 'Rak A1', index: 1 },
    ], zoom: { card: 'Informasi Penyimpanan' } },
  { chapter: 'Daftarkan Barang Bukti',
    say: 'Jika ada berita acara atau foto, dokumennya bisa dilampirkan di sini.',
    act: [], zoom: { card: 'Lampiran / Dokumen Pendukung (Opsional)' } },
  { chapter: 'Daftarkan Barang Bukti',
    say: 'Ada dua pilihan menyimpan. Simpan sebagai Draf dipakai jika data belum lengkap. Draf belum masuk riwayat dan belum dihitung di laporan.',
    act: [{ hover: { btn: 'Simpan sebagai Draf' } }], zoom: [{ btn: 'Simpan sebagai Draf' }, { btn: 'Simpan & Daftarkan' }] },
  { chapter: 'Daftarkan Barang Bukti',
    say: 'Kalau datanya sudah lengkap, tekan Simpan dan Daftarkan, dan barang bukti resmi terdaftar.',
    act: [{ hover: { btn: 'Simpan & Daftarkan' } }], zoom: { btn: 'Simpan & Daftarkan' } },

  /* ---------- 5. Detail & Riwayat ---------- */
  { chapter: 'Detail Barang Bukti',
    say: 'Barang yang sudah terdaftar punya halaman detailnya sendiri, seperti contoh barang bukti ini.',
    act: [{ nav: '/barang-bukti' }, { wait: 1500 }, { click: { title: 'Lihat detail', root: 'page' } }, { wait: 1500 }], zoom: null },
  { chapter: 'Detail Barang Bukti',
    say: 'Di tab Riwayat, tercatat semua kejadian barang ini. Kejadian pertamanya selalu Penerimaan, yang dicatat otomatis saat barang didaftarkan. Inilah rantai jejak barang bukti, atau chain of custody.',
    act: [{ click: { btn: 'Riwayat', starts: true, in: 'main' } }, { wait: 600 }], zoom: { card: 'Riwayat Kejadian (Chain of Custody)' } },
  { chapter: 'Detail Barang Bukti',
    say: 'Lembar detail barang juga bisa dicetak, lengkap dengan kop institusi.',
    act: [{ hover: { btn: 'Cetak', in: 'main' } }], zoom: { btn: 'Cetak', in: 'main' } },

  /* ---------- 6. Catat Perpindahan ---------- */
  { chapter: 'Catat Perpindahan',
    say: 'Barang bukti tidak selalu diam di satu tempat. Setiap kali dipindah atau dipinjam, kita catat lewat tombol Catat Perpindahan.',
    act: [{ click: { btn: 'Catat Perpindahan', in: 'main' } }, { wait: 700 }], zoom: { sel: '[role=dialog]' } },
  { chapter: 'Catat Perpindahan',
    say: 'Lokasi asal terisi otomatis dari lokasi barang saat ini.',
    act: [], zoom: { field: 'Lokasi Asal' } },
  { chapter: 'Catat Perpindahan',
    say: 'Ada lima jenis kejadian: perpindahan, peminjaman, pengembalian, pemeriksaan, dan pengalihan. Kita pilih peminjaman.',
    act: [{ click: { field: 'Jenis Kejadian', control: true } }, { fill: { field: 'Jenis Kejadian' }, option: 'Peminjaman' }, { wait: 300 }],
    zoom: { field: 'Jenis Kejadian' } },
  { chapter: 'Catat Perpindahan',
    say: 'Untuk peminjaman, tanggal harapan kembali wajib diisi. Sistem juga memberi tahu bahwa status barang akan berubah menjadi Dipinjam.',
    act: [{ fill: { field: 'Tanggal Harapan Kembali' }, value: '2026-12-10' }],
    zoom: [{ field: 'Tanggal Harapan Kembali' }, { text: 'Status barang akan otomatis menjadi', starts: true }] },
  { chapter: 'Catat Perpindahan',
    say: 'Pilih lokasi tujuan, petugas yang menangani, dan alasannya, lalu tekan Catat Kejadian.',
    act: [
      { fill: { field: 'Lokasi Tujuan' }, option: 'Forensik', index: 1 },
      { fill: { field: 'Petugas yang Menangani' }, index: 1 },
      { fill: { field: 'Alasan / Keperluan' }, value: 'Pemeriksaan forensik digital (ekstraksi data)' },
      { hover: { btn: 'Catat Kejadian' } },
    ], zoom: [{ field: 'Lokasi Tujuan' }, { btn: 'Catat Kejadian' }] },
  { chapter: 'Catat Perpindahan',
    say: 'Begitu dicatat, status barang langsung berubah menjadi Dipinjam, seperti barang ini, dan kejadian peminjamannya bertambah di timeline.',
    act: [{ click: { btn: 'Batal' } }, { wait: 400 }, { nav: '/barang-bukti?status=dipinjam' }, { wait: 1500 },
      { click: { title: 'Lihat detail', root: 'page' } }, { wait: 1500 }, { click: { btn: 'Riwayat', starts: true, in: 'main' } }, { wait: 600 }],
    zoom: { card: 'Riwayat Kejadian (Chain of Custody)' } },
  { chapter: 'Catat Perpindahan',
    say: 'Riwayat ini tidak bisa diubah atau dihapus. Kalau ada salah catat, buat kejadian koreksi yang baru dengan alasan yang jelas.',
    act: [], zoom: null },

  /* ---------- 7. Riwayat Perpindahan ---------- */
  { chapter: 'Riwayat Perpindahan',
    say: 'Seluruh kejadian dari semua barang bisa dilihat di menu Riwayat Perpindahan, dengan yang terbaru di paling atas.',
    act: [{ click: { text: 'Riwayat Perpindahan', in: 'aside', up: 'a' } }, { wait: 1500 }], zoom: null },
  { chapter: 'Riwayat Perpindahan',
    say: 'Gunakan filter untuk mencari kejadian tertentu, misalnya semua peminjaman pada bulan ini.',
    act: [], zoom: { sel: 'input[placeholder^="Cari kode, petugas"]', up: 'section' } },

  /* ---------- 8. Laporan ---------- */
  { chapter: 'Laporan',
    say: 'Lalu, menu Laporan.',
    act: [{ click: { text: 'Laporan', in: 'aside', up: 'a' } }, { wait: 1500 }], zoom: null },
  { chapter: 'Laporan',
    say: 'Tersedia lima jenis laporan: rekapitulasi per kategori, per perkara, status penyimpanan, riwayat perpindahan, dan peminjaman.',
    act: [{ click: { field: 'Jenis Laporan', control: true } }], zoom: { field: 'Jenis Laporan' } },
  { chapter: 'Laporan',
    say: 'Atur periode dan filternya, dan pratinjau laporan langsung diperbarui.',
    act: [], zoom: { card: 'Filter Laporan' } },
  { chapter: 'Laporan',
    say: 'Laporan bisa dicetak di kertas A4 lengkap dengan kop dan tanda tangan, atau diekspor ke CSV untuk diolah di Excel.',
    act: [{ hover: { btn: 'Ekspor CSV' } }], zoom: [{ btn: 'Cetak', in: 'main' }, { btn: 'Ekspor CSV' }] },

  /* ---------- 9. Administrator ---------- */
  { chapter: 'Khusus Administrator', relogin: 'admin',
    say: 'Terakhir, mari masuk sebagai Administrator. Ada dua menu tambahan di sini: Manajemen Pengguna dan Master Data.',
    act: [], zoom: [{ text: 'Manajemen Pengguna', in: 'aside', up: 'a' }, { text: 'Master Data', in: 'aside', up: 'a' }] },
  { chapter: 'Khusus Administrator',
    say: 'Di Manajemen Pengguna, administrator bisa menambah akun, mengubah data, dan mengatur ulang kata sandi.',
    act: [{ click: { text: 'Manajemen Pengguna', in: 'aside', up: 'a' } }, { wait: 1500 }],
    zoom: [{ btn: 'Tambah Pengguna' }, { sel: 'table' }] },
  { chapter: 'Khusus Administrator',
    say: 'Akun tidak dihapus, cukup dinonaktifkan, supaya jejak siapa yang mencatat tetap utuh.',
    act: [{ hover: { title: 'Nonaktifkan akun' } }], zoom: { title: 'Nonaktifkan akun', up: 'tr' } },
  { chapter: 'Khusus Administrator',
    say: 'Sedangkan di Master Data, administrator mengelola kategori barang dan lokasi penyimpanan.',
    act: [{ click: { text: 'Master Data', in: 'aside', up: 'a' } }, { wait: 1500 }], zoom: null },

  /* ---------- 10. Penutup ---------- */
  { chapter: 'Penutup',
    say: 'Jadi begitulah SIBER EVIDENCE: dari perkara, pendaftaran barang bukti, setiap perpindahan, sampai laporan, semuanya tercatat rapi dalam satu aplikasi.',
    act: [{ click: { text: 'Dashboard', in: 'aside', up: 'a' } }, { wait: 1500 }], zoom: null },
  { chapter: 'Penutup', outro: true,
    say: 'Setiap barang bukti selalu jelas: ada di mana, dan di tangan siapa. Terima kasih sudah menonton!',
    act: [], zoom: null },
];
