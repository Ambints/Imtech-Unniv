import React from 'react';
import { Outlet, NavLink } from 'react-router-dom';

export default function LogistiqueLayout() {
  return (
    <div className="d-flex" style={{ minHeight: '100vh' }}>
      {/* Sidebar */}
      <div className="bg-dark text-white" style={{ width: '250px', minHeight: '100vh' }}>
        <div className="p-3 border-bottom border-secondary">
          <h5 className="mb-0">
            <i className="bi bi-tools me-2"></i>
            Logistique
          </h5>
        </div>
        <nav className="nav flex-column p-3">
          <NavLink
            to="/logistique"
            end
            className={({ isActive }) =>
              `nav-link text-white ${isActive ? 'bg-primary rounded' : ''}`
            }
          >
            <i className="bi bi-speedometer2 me-2"></i>
            Dashboard
          </NavLink>
          
          <div className="text-muted small mt-3 mb-2 px-2">INFRASTRUCTURE</div>
          <NavLink
            to="/logistique/batiments"
            className={({ isActive }) =>
              `nav-link text-white ${isActive ? 'bg-primary rounded' : ''}`
            }
          >
            <i className="bi bi-building me-2"></i>
            Bâtiments
          </NavLink>
          <NavLink
            to="/logistique/salles"
            className={({ isActive }) =>
              `nav-link text-white ${isActive ? 'bg-primary rounded' : ''}`
            }
          >
            <i className="bi bi-door-open me-2"></i>
            Salles
          </NavLink>

          <div className="text-muted small mt-3 mb-2 px-2">STOCK</div>
          <NavLink
            to="/logistique/stock"
            className={({ isActive }) =>
              `nav-link text-white ${isActive ? 'bg-primary rounded' : ''}`
            }
          >
            <i className="bi bi-box-seam me-2"></i>
            Inventaire
          </NavLink>

          <div className="text-muted small mt-3 mb-2 px-2">MAINTENANCE</div>
          <NavLink
            to="/logistique/tickets"
            className={({ isActive }) =>
              `nav-link text-white ${isActive ? 'bg-primary rounded' : ''}`
            }
          >
            <i className="bi bi-wrench me-2"></i>
            Tickets
          </NavLink>

          <div className="text-muted small mt-3 mb-2 px-2">ENTRETIEN</div>
          <NavLink
            to="/logistique/planning-entretien"
            className={({ isActive }) =>
              `nav-link text-white ${isActive ? 'bg-primary rounded' : ''}`
            }
          >
            <i className="bi bi-calendar3 me-2"></i>
            Planning
          </NavLink>
          <NavLink
            to="/logistique/rapports-entretien"
            className={({ isActive }) =>
              `nav-link text-white ${isActive ? 'bg-primary rounded' : ''}`
            }
          >
            <i className="bi bi-file-earmark-text me-2"></i>
            Rapports
          </NavLink>

          <div className="text-muted small mt-3 mb-2 px-2">RÉSERVATIONS</div>
          <NavLink
            to="/logistique/reservations"
            className={({ isActive }) =>
              `nav-link text-white ${isActive ? 'bg-primary rounded' : ''}`
            }
          >
            <i className="bi bi-calendar-check me-2"></i>
            Réservations
          </NavLink>
          <NavLink
            to="/logistique/reservations/calendrier"
            className={({ isActive }) =>
              `nav-link text-white ${isActive ? 'bg-primary rounded' : ''}`
            }
          >
            <i className="bi bi-calendar4-week me-2"></i>
            Calendrier
          </NavLink>

          <div className="text-muted small mt-3 mb-2 px-2">DEMANDES</div>
          <NavLink
            to="/logistique/demandes-ressource"
            className={({ isActive }) =>
              `nav-link text-white ${isActive ? 'bg-primary rounded' : ''}`
            }
          >
            <i className="bi bi-inbox me-2"></i>
            Demandes ressources
          </NavLink>
        </nav>
      </div>

      {/* Main content */}
      <div className="flex-grow-1 bg-light">
        <Outlet />
      </div>
    </div>
  );
}

// Made with Bob
