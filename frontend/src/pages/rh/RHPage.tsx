import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import RHDashboard from './RHDashboard';
import PersonnelPage from './PersonnelPage';
import ContratsPage from './ContratsPage';
import CongesPage from './CongesPage';
import PaieVacationsPage from './PaieVacationsPage';
import EvaluationsPage from './EvaluationsPage';
import RecrutementPage from './RecrutementPage';

export const RHPage: React.FC = () => {
  return (
    <Routes>
      <Route index element={<RHDashboard />} />
      <Route path="personnel" element={<PersonnelPage />} />
      <Route path="contrats" element={<ContratsPage />} />
      <Route path="conges" element={<CongesPage />} />
      <Route path="paie" element={<PaieVacationsPage />} />
      <Route path="evaluations" element={<EvaluationsPage />} />
      <Route path="recrutement" element={<RecrutementPage />} />
      <Route path="*" element={<Navigate to="/rh" replace />} />
    </Routes>
  );
};

export default RHPage;

// Made with Bob
