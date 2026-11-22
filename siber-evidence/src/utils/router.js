import { useState, useEffect } from 'react';

export function useHash() {
  const [hash, setHash] = useState(() => window.location.hash || '#/');
  useEffect(() => {
    const f = () => setHash(window.location.hash || '#/');
    window.addEventListener('hashchange', f);
    return () => window.removeEventListener('hashchange', f);
  }, []);
  return hash;
}

export function Redirect({ to }) {
  useEffect(() => { window.location.hash = to; }, [to]);
  return null;
}
