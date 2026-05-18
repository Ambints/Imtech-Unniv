import React from 'react';
import { Routes, Route } from 'react-router-dom';
import EntretienLayout from './layout/EntretienLayout';
import DashboardEntretienPage from './pages/DashboardEntretienPage';
import PlanningEntretienPage from './pages/PlanningEntretienPage';
import RapportsEntretienPage from './pages/RapportsEntretienPage';
import TicketsMaintenancePage from './pages/TicketsMaintenancePage';
import StockEntretienPage from './pages/StockEntretienPage';
import EspacesPage from './pages/EspacesPage';
import InventairePage from './pages/InventairePage';

// Import styles
import './styles/entretien.css';

/**
 * Module Entretien - Maintenance & Logistique
 * IMTECH University SaaS Platform
 * 
 * Fonctionnalités:
 * - Dashboard temps réel avec KPIs
 * - Planning entretien hebdomadaire
 * - Gestion tickets maintenance
 * - Gestion stock (alertes, mouvements)
 * - Réservations salles
 * - Rapports entretien
 * - Inventaire (bâtiments, salles, stocks)
 * 
 * Rôle requis: 'logistique'
 */
export default function EntretienModule() {
  return (
    <Routes>
      <Route element={<EntretienLayout />}>
        <Route index element={<DashboardEntretienPage />} />
        <Route path="planning" element={<PlanningEntretienPage />} />
        <Route path="rapports" element={<RapportsEntretienPage />} />
        <Route path="tickets" element={<TicketsMaintenancePage />} />
        <Route path="stock" element={<StockEntretienPage />} />
        <Route path="reservations" element={<EspacesPage />} />
        <Route path="inventaire" element={<InventairePage />} />
      </Route>
    </Routes>
  );
}

// Made with Bob
