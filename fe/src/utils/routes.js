/* Halaman awal sesuai peran pengguna */
export const homeFor = (user) => (user?.role === 'administrator' ? '/admin' : '/petugas/dashboard');
