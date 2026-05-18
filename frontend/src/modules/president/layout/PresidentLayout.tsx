/**
 * Layout du module Président avec sidebar Bootstrap
 */

import React from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import '../styles/president.css';
import {
  LayoutDashboard,
  UserPlus,
  DollarSign,
  Award,
  FileText,
  AlertTriangle,
  GraduationCap,
  Calendar,
  Users,
  Eye,
  LogOut,
} from 'lucide-react';
import { useKpiDashboard } from '../hooks';

export const PresidentLayout: React.FC = () => {
  const navigate = useNavigate();
  const anneeId = 1; // TODO: Get from context
  
  const { data: kpi } = useKpiDashboard(anneeId);

  const menuItems = [
    {
      path: '/president',
      icon: LayoutDashboard,
      label: 'Tableau de Bord',
      exact: true,
    },
    {
      path: '/president/supervision',
      icon: Eye,
      label: 'Vue d\'Ensemble',
    },
    {
      path: '/president/recrutements',
      icon: UserPlus,
      label: 'Recrutements',
      badge: kpi?.recrutementsEnAttente,
    },
    {
      path: '/president/investissements',
      icon: DollarSign,
      label: 'Investissements',
    },
    {
      path: '/president/diplomes',
      icon: Award,
      label: 'Diplômes',
      badge: kpi?.diplomesAGenerer,
    },
    {
      path: '/president/conventions',
      icon: FileText,
      label: 'Conventions',
    },
    {
      path: '/president/discipline',
      icon: AlertTriangle,
      label: 'Discipline',
      badge: kpi?.conseilsDisciplineEnAttente,
    },
    {
      path: '/president/parcours',
      icon: GraduationCap,
      label: 'Parcours',
    },
    {
      path: '/president/calendrier',
      icon: Calendar,
      label: 'Calendrier',
    },
    {
      path: '/president/delegations',
      icon: Users,
      label: 'Délégations',
    },
  ];

  const handleLogout = () => {
    localStorage.removeItem('access_token');
    navigate('/login');
  };

  return (
    <div className="president-layout">
      {/* Sidebar */}
      <aside className="president-sidebar d-flex flex-column">
        {/* Header */}
        <div className="president-sidebar-header">
          <div className="president-sidebar-logo">ISPM</div>
          <div className="president-sidebar-subtitle">Plateforme SaaS</div>
        </div>

        {/* Navigation */}
        <nav className="president-sidebar-nav flex-grow-1">
          {menuItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.exact}
              className={({ isActive }) =>
                `president-nav-item ${isActive ? 'active' : ''}`
              }
            >
              <item.icon className="president-nav-icon" />
              <span className="president-nav-label">{item.label}</span>
              {item.badge && item.badge > 0 && (
                <span className="president-nav-badge">{item.badge}</span>
              )}
            </NavLink>
          ))}
        </nav>

        {/* User section */}
        <div className="president-sidebar-footer">
          <div className="president-user-info">
            <div className="president-user-avatar rounded-circle">
              <Users size={20} />
            </div>
            <div className="president-user-details">
              <div className="president-user-name">Président ISPM</div>
              <div className="president-user-role">Président</div>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="president-logout-btn"
          >
            <LogOut size={18} />
            <span>Déconnexion</span>
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="president-main">
        <Outlet />
      </main>
    </div>
  );
};

// Made with ❤️ by IBM Bob

// Made with Bob
