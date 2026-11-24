import { useApp } from '../context/AppContext';

/* Prefix URL sesuai peran: Administrator -> /admin, Petugas -> /petugas */
export const baseFor = (user) => (user?.role === 'administrator' ? '/admin' : '/petugas');

/* Halaman awal sesuai peran pengguna */
export const homeFor = (user) => `${baseFor(user)}/dashboard`;

export function useBase() {
  const { user } = useApp();
  return baseFor(user);
}

export function useIsAdmin() {
  const { user } = useApp();
  return user?.role === 'administrator';
}
