/**
 * AUTH JAVASCRIPT - SIBER EVIDENCE
 * Menangani login, logout, dan perlindungan halaman (Role-based protection)
 */

const SESSION_KEY = 'se_session';

const Auth = {
  getUser() {
    try {
      const raw = localStorage.getItem(SESSION_KEY) || sessionStorage.getItem(SESSION_KEY);
      if (!raw) return null;
      const s = JSON.parse(raw);
      return AppData.getUsers().find(u => u.username === s.username && u.status === 'Aktif') || null;
    } catch (e) {
      return null;
    }
  },

  login(username, password, remember = false) {
    const users = AppData.getUsers();
    const u = users.find(x => x.username.toLowerCase() === username.trim().toLowerCase());
    
    if (!u) return { ok: false, msg: 'Nama pengguna tidak terdaftar.' };
    if (u.status !== 'Aktif') return { ok: false, msg: 'Akun nonaktif. Hubungi admin.' };
    if (password !== 'demo123') return { ok: false, msg: 'Kata sandi salah. Gunakan sandi: demo123' };

    // Update aktivitas
    u.aktivitasTerakhir = nowLocal();
    AppData.save();

    const sess = JSON.stringify({ username: u.username });
    if (remember) {
      localStorage.setItem(SESSION_KEY, sess);
      sessionStorage.removeItem(SESSION_KEY);
    } else {
      sessionStorage.setItem(SESSION_KEY, sess);
      localStorage.removeItem(SESSION_KEY);
    }

    return { ok: true, user: u };
  },

  logout() {
    localStorage.removeItem(SESSION_KEY);
    sessionStorage.removeItem(SESSION_KEY);
    window.location.href = '../../html/login.html';
  },

  protectRoute(requiredRole = null) {
    const user = this.getUser();
    
    // Redirect ke login jika tidak ada user
    if (!user) {
      const isRoot = window.location.pathname.endsWith('index.html') || window.location.pathname.endsWith('/');
      if (isRoot) {
        window.location.href = './html/login.html';
      } else if (window.location.pathname.includes('/html/')) {
        window.location.href = window.location.pathname.split('/html/')[0] + '/html/login.html';
      } else {
        window.location.href = '../login.html';
      }
      return null;
    }

    // Cek path sekarang
    const path = window.location.pathname;
    const isAdminPath = path.includes('/admin/');
    const isPetugasPath = path.includes('/petugas/');

    // Role protection redirect
    if (user.role === 'Administrator' && isPetugasPath) {
      // Admin tidak seharusnya di halaman petugas
      window.location.href = window.location.pathname.replace('/petugas/', '/admin/');
      return null;
    }
    
    if (user.role === 'Petugas' && isAdminPath) {
      // Petugas tidak boleh akses admin
      window.location.href = window.location.pathname.replace('/admin/', '/petugas/');
      return null;
    }

    return user;
  }
};
