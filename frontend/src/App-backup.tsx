import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { useAuthStore } from './store/authStore';
import { AppLayout } from './components/layout/AppLayout';
import { LoginPage } from './pages/auth/LoginPage';
import { SuperAdminDashboard } from './pages/super-admin/SuperAdminDashboard';
import { Construction } from 'lucide-react';

const Guard: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, isHydrated } = useAuthStore();
  if (!isHydrated) {
    return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
      <div style={{ width: 40, height: 40, border: '3px solid #f3f3f3', borderTop: '3px solid #1a5276', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
    </div>;
  }
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return <>{children}</>;
};

const Wrapped: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <Guard><AppLayout>{children}</AppLayout></Guard>
);

const Placeholder: React.FC<{ title: string }> = ({ title }) => (
  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '80vh', gap: 16, textAlign: 'center', padding: 32 }}>
    <Construction size={64} color="#94a3b8" />
    <h2 style={{ fontSize: 22, fontWeight: 800, color: '#1e293b', margin: 0 }}>{title}</h2>
    <p style={{ color: '#64748b', maxWidth: 400, fontSize: 14 }}>Page en développement</p>
  </div>
);

const App: React.FC = () => {
  const { isAuthenticated } = useAuthStore();

  return (
    <BrowserRouter>
      <Toaster position="top-right" />
      <Routes>
        <Route path="/login" element={isAuthenticated ? <Navigate to="/super-admin" replace /> : <LoginPage />} />
        <Route path="/" element={<Navigate to={isAuthenticated ? "/super-admin" : "/login"} replace />} />
        <Route path="/super-admin" element={<Wrapped><SuperAdminDashboard /></Wrapped>} />
        <Route path="*" element={<Guard><AppLayout><Placeholder title="Page en développement" /></AppLayout></Guard>} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;

// Made with Bob
