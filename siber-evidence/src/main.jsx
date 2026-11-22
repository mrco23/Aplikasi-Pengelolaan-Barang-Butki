import React from 'react';
import ReactDOM from 'react-dom/client';
import { AppProvider, useApp } from './context/AppContext';
import { useHash, Redirect } from './utils/router';
import AppShell from './App';
import LoginPage from './pages/auth/LoginPage';

function AppRoot() {
  const hash = useHash();
  const { user } = useApp();
  const path = hash.replace(/^#/, '') || '/';
  if (!user) return <LoginPage />;
  if (path === '/login' || path === '/' || path === '') return <Redirect to="/dashboard" />;
  return <AppShell path={path} />;
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <AppProvider>
    <AppRoot />
  </AppProvider>
);
