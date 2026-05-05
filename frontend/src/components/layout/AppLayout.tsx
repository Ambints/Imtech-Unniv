import React, { useState } from 'react';
import { Sidebar } from './Sidebar';
import { Menu, GraduationCap } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';

interface Props { children: React.ReactNode; }

export const AppLayout: React.FC<Props> = ({ children }) => {
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const { tenant } = useAuthStore();

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      display: 'flex',
      background: '#F5F5F0'
    }}>
      {/* Mobile Header with Hamburger */}
      <header className="d-lg-none position-fixed top-0 start-0 w-100 bg-white shadow-sm" style={{ zIndex: 1020, height: '56px' }}>
        <div className="d-flex align-items-center justify-content-between h-100 px-3">
          <div className="d-flex align-items-center gap-2">
            <div
              className="d-flex align-items-center justify-content-center flex-shrink-0"
              style={{
                width: 36, height: 36, borderRadius: 10,
                background: 'linear-gradient(135deg, #3b82f6 0%, #6366f1 100%)',
              }}
            >
              {tenant?.logo ? (
                <img src={tenant.logo} alt="logo" style={{ width: 24, height: 24, objectFit: 'contain' }} />
              ) : (
                <GraduationCap size={20} color="#fff" />
              )}
            </div>
            <span className="fw-bold text-dark text-truncate" style={{ fontSize: 14, maxWidth: '200px' }}>
              {tenant?.name || 'IMTECH'}
            </span>
          </div>
          
          <button
            className="btn btn-link text-dark p-2 d-flex align-items-center justify-content-center"
            onClick={() => setMobileSidebarOpen(true)}
            aria-label="Ouvrir le menu"
            style={{ borderRadius: 8 }}
          >
            <Menu size={24} />
          </button>
        </div>
      </header>

      {/* Sidebar - hidden on mobile by default */}
      <Sidebar
        mobileOpen={mobileSidebarOpen}
        onMobileClose={() => setMobileSidebarOpen(false)}
      />
      
      {/* Main Content */}
      <main style={{
        flex: 1,
        overflow: 'auto',
        position: 'relative'
      }}>
        <div className="d-lg-none" style={{ height: '56px' }} /> {/* Spacer for mobile header */}
        {children}
      </main>
    </div>
  );
};
