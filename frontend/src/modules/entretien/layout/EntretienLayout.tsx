import React from 'react';
import { Outlet, NavLink } from 'react-router-dom';

export default function EntretienLayout() {
  const navItems = [
    { path: '/entretien', label: 'Dashboard', icon: 'speedometer2', end: true },
    { path: '/entretien/planning', label: 'Planning', icon: 'calendar3' },
    { path: '/entretien/rapports', label: 'Rapports', icon: 'file-text' },
    { path: '/entretien/tickets', label: 'Tickets', icon: 'ticket-perforated' },
    { path: '/entretien/stock', label: 'Stock', icon: 'box-seam' },
    { path: '/entretien/reservations', label: 'Réservations', icon: 'calendar-check' },
    { path: '/entretien/inventaire', label: 'Inventaire', icon: 'clipboard-data' },
  ];

  return (
    <div className="d-flex min-vh-100">
      {/* Sidebar */}
      <nav className="entretien-sidebar bg-light border-end" style={{ width: '260px', minHeight: '100vh' }}>
        <div className="p-3">
          <div className="d-flex align-items-center mb-4">
            <div className="bg-primary bg-opacity-10 p-2 rounded me-2">
              <i className="bi bi-tools text-primary fs-4"></i>
            </div>
            <div>
              <h5 className="mb-0">Entretien</h5>
              <small className="text-muted">Maintenance & Logistique</small>
            </div>
          </div>

          <ul className="nav flex-column">
            {navItems.map((item) => (
              <li key={item.path} className="nav-item mb-1">
                <NavLink
                  to={item.path}
                  end={item.end}
                  className={({ isActive }) =>
                    `nav-link d-flex align-items-center ${isActive ? 'active' : ''}`
                  }
                >
                  <i className={`bi bi-${item.icon} me-2`}></i>
                  {item.label}
                </NavLink>
              </li>
            ))}
          </ul>

          <hr className="my-3" />

          <div className="small text-muted px-3">
            <div className="mb-2">
              <i className="bi bi-info-circle me-1"></i>
              <strong>Module Entretien</strong>
            </div>
            <div className="mb-1">
              <i className="bi bi-check-circle text-success me-1"></i>
              Gestion complète
            </div>
            <div className="mb-1">
              <i className="bi bi-shield-check text-primary me-1"></i>
              Sécurisé
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-grow-1 bg-light">
        <Outlet />
      </main>
    </div>
  );
}

// Made with Bob
