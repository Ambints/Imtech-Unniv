import React from 'react';
import { Routes, Route } from 'react-router-dom';
import LogistiqueLayout from './layout/LogistiqueLayout';
import DashboardLogistiquePage from './pages/DashboardLogistiquePage';
import BatimentsPage from './pages/BatimentsPage';
import SallesPage from './pages/SallesPage';
import StockPage from './pages/StockPage';
import TicketsPage from './pages/TicketsPage';
import PlanningEntretienPage from './pages/PlanningEntretienPage';
import RapportsEntretienPage from './pages/RapportsEntretienPage';
import ReservationsPage from './pages/ReservationsPage';
import CalendrierSallesPage from './pages/CalendrierSallesPage';
import DemandesRessourcePage from './pages/DemandesRessourcePage';

export default function LogistiqueModule() {
  return (
    <Routes>
      <Route element={<LogistiqueLayout />}>
        <Route index element={<DashboardLogistiquePage />} />
        <Route path="batiments" element={<BatimentsPage />} />
        <Route path="salles" element={<SallesPage />} />
        <Route path="stock" element={<StockPage />} />
        <Route path="tickets" element={<TicketsPage />} />
        <Route path="planning-entretien" element={<PlanningEntretienPage />} />
        <Route path="rapports-entretien" element={<RapportsEntretienPage />} />
        <Route path="reservations" element={<ReservationsPage />} />
        <Route path="reservations/calendrier" element={<CalendrierSallesPage />} />
        <Route path="demandes-ressource" element={<DemandesRessourcePage />} />
      </Route>
    </Routes>
  );
}

// Made with Bob
