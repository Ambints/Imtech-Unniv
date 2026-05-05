import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { useAuthStore } from './store/authStore';
import { AppLayout } from './components/layout/AppLayout';
import { LoginPage } from './pages/auth/LoginPage';
import { SuperAdminDashboard } from './pages/super-admin/SuperAdminDashboard';
import { NewUniversity } from './pages/super-admin/NewUniversity';
import { EditUniversity } from './pages/super-admin/EditUniversity';
import { Subscriptions } from './pages/super-admin/Subscriptions';
import { EditSubscription } from './pages/super-admin/EditSubscription';
import { UserManagement } from './pages/super-admin/UserManagement';
import { UserForm } from './pages/super-admin/UserForm';
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { PresidentDashboard } from './pages/president/PresidentDashboard';
import { CaissePage } from './pages/finance/CaissePage';
import { FinanceManagementPage } from './pages/finance/FinanceManagementPage';
import { LogistiquePage } from './pages/logistics/LogistiquePage';
import { EtudiantPortal } from './pages/portals/EtudiantPortal';
import { ParentPortal } from './pages/portals/ParentPortal';
import { ProfesseurPortal } from './pages/portals/ProfesseurPortal';
import { CommunicationPage } from './pages/communication/CommunicationPage';
import { RHPage } from './pages/rh/RHPage';
import { EconomatPage } from './pages/economat/EconomatPage';
import { NotesPage } from './pages/academic/NotesPage';
import { AcademicManagementPage } from './pages/academic/AcademicManagementPage';
import {
  BookOpen, BookText, CheckCircle,
  CalendarDays, ClipboardList, AlertTriangle, Briefcase, BarChart3, Users, FileText,
  School, User, GraduationCap as ProfIcon, Construction
} from 'lucide-react';

const Guard: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, isHydrated } = useAuthStore();
  // Attendre que le store soit réhydraté depuis localStorage
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

const Placeholder: React.FC<{ title: string; icon: React.ReactNode; desc: string }> = ({ title, icon, desc }) => (
  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '80vh', gap: 16, textAlign: 'center', padding: 32 }}>
    <span style={{ display: 'flex' }}>{icon}</span>
    <h2 style={{ fontSize: 22, fontWeight: 800, color: '#1e293b', margin: 0 }}>{title}</h2>
    <p style={{ color: '#64748b', maxWidth: 400, fontSize: 14 }}>{desc}</p>
    <a href="/" style={{ padding: '10px 20px', background: '#1a5276', color: '#fff', borderRadius: 10, fontSize: 13, fontWeight: 600 }}>
      ← Accueil
    </a>
  </div>
);

const App: React.FC = () => {
  const { isAuthenticated, tenant, user } = useAuthStore();

  useEffect(() => {
    if (tenant) {
      document.documentElement.style.setProperty('--primary', tenant.primaryColor);
      document.documentElement.style.setProperty('--secondary', tenant.secondaryColor);
      document.documentElement.style.setProperty('--accent', tenant.accentColor);
    }
  }, [tenant]);

  const defaultRoute = () => {
    if (!isAuthenticated) return '/login';
    const map: Record<string, string> = {
      super_admin: '/super-admin',
      admin: '/admin',
      president: '/president',
      etudiant: '/portail/etudiant',
      parent: '/portail/parent',
      professeur: '/portail/professeur',
      caissier: '/caisse',
      responsable_logistique: '/logistique/tickets',
      communication: '/communication',
      rh: '/rh/personnel',
      economat: '/economat/budget',
    };
    return map[user?.role || ''] || '/';
  };

  return (
    <BrowserRouter>
      <Toaster position="top-right" toastOptions={{
        style: { borderRadius: '10px', fontFamily: 'Outfit, sans-serif', fontSize: '14px', fontWeight: 500 },
        success: { iconTheme: { primary: '#148f77', secondary: '#fff' } },
        error: { iconTheme: { primary: '#e74c3c', secondary: '#fff' } },
      }} />
      <Routes>
        {/* Public */}
        <Route path="/login" element={isAuthenticated ? <Navigate to={defaultRoute()} replace /> : <LoginPage />} />
        <Route path="/" element={<Navigate to={defaultRoute()} replace />} />

        {/* Super Admin */}
        <Route path="/super-admin" element={<Wrapped><SuperAdminDashboard /></Wrapped>} />
        <Route path="/super-admin/create" element={<Wrapped><NewUniversity /></Wrapped>} />
        <Route path="/super-admin/tenant/:id/edit" element={<Wrapped><EditUniversity /></Wrapped>} />
        <Route path="/super-admin/subscriptions" element={<Wrapped><Subscriptions /></Wrapped>} />
        <Route path="/super-admin/subscriptions/edit/:id" element={<Wrapped><EditSubscription /></Wrapped>} />
        <Route path="/super-admin/users" element={<Wrapped><UserManagement /></Wrapped>} />
        <Route path="/super-admin/users/create" element={<Wrapped><UserForm /></Wrapped>} />
        <Route path="/super-admin/users/:id/edit" element={<Wrapped><UserForm /></Wrapped>} />

        {/* Admin Tenant */}
        <Route path="/admin" element={<Wrapped><AdminDashboard defaultTab="dashboard" /></Wrapped>} />
        <Route path="/admin/users" element={<Wrapped><AdminDashboard defaultTab="users" /></Wrapped>} />
        <Route path="/admin/config" element={<Wrapped><AdminDashboard defaultTab="config" /></Wrapped>} />
        <Route path="/admin/portals" element={<Wrapped><AdminDashboard defaultTab="portals" /></Wrapped>} />
        <Route path="/admin/academic" element={<Wrapped><AdminDashboard defaultTab="academic" /></Wrapped>} />
        <Route path="/admin/finance" element={<Wrapped><AdminDashboard defaultTab="finance" /></Wrapped>} />
        <Route path="/admin/rh" element={<Wrapped><AdminDashboard defaultTab="rh" /></Wrapped>} />
        <Route path="/admin/communication" element={<Wrapped><AdminDashboard defaultTab="communication" /></Wrapped>} />
        <Route path="/admin/discipline" element={<Wrapped><AdminDashboard defaultTab="discipline" /></Wrapped>} />
        <Route path="/admin/logistics" element={<Wrapped><AdminDashboard defaultTab="logistics" /></Wrapped>} />

        {/* Président */}
        <Route path="/president" element={<Wrapped><PresidentDashboard /></Wrapped>} />

        {/* Académique */}
        <Route path="/academic/parcours" element={<Wrapped><AcademicManagementPage /></Wrapped>} />
        <Route path="/academic/ue" element={<Wrapped><AcademicManagementPage /></Wrapped>} />
        <Route path="/academic/etudiants" element={<Wrapped><AcademicManagementPage /></Wrapped>} />
        <Route path="/academic/inscriptions" element={<Wrapped><AcademicManagementPage /></Wrapped>} />
        <Route path="/academic/deliberations" element={<Wrapped><NotesPage /></Wrapped>} />
        <Route path="/scolarite/notes" element={<Wrapped><NotesPage /></Wrapped>} />
        <Route path="/secretariat/inscriptions" element={<Wrapped><AcademicManagementPage /></Wrapped>} />
        <Route path="/secretariat/edt" element={<Wrapped><Placeholder title="Emploi du Temps" icon={<CalendarDays size={64} color="#94a3b8" />} desc="Planification hebdomadaire des cours, TD, TP par parcours et salle." /></Wrapped>} />
        <Route path="/secretariat/absences" element={<Wrapped><Placeholder title="Suivi des Absences" icon={<ClipboardList size={64} color="#94a3b8" />} desc="Saisie, justification et suivi des absences et retards des étudiants." /></Wrapped>} />
        <Route path="/surveillance/presences" element={<Wrapped><Placeholder title="Présences Journalières" icon={<CheckCircle size={64} color="#94a3b8" />} desc="Contrôle numérique des présences via QR Code ou appel en ligne." /></Wrapped>} />
        <Route path="/surveillance/incidents" element={<Wrapped><Placeholder title="Incidents Disciplinaires" icon={<AlertTriangle size={64} color="#94a3b8" />} desc="Saisie des rapports de conduite et incidents à remonter à la Présidence." /></Wrapped>} />

        {/* Finance */}
        <Route path="/caisse" element={<Wrapped><CaissePage /></Wrapped>} />
        <Route path="/caisse/encaissement" element={<Wrapped><CaissePage /></Wrapped>} />
        <Route path="/finance/gestion" element={<Wrapped><FinanceManagementPage /></Wrapped>} />
        <Route path="/finance/paiements" element={<Wrapped><FinanceManagementPage /></Wrapped>} />
        <Route path="/finance/budgets" element={<Wrapped><FinanceManagementPage /></Wrapped>} />
        <Route path="/finance/depenses" element={<Wrapped><FinanceManagementPage /></Wrapped>} />
        <Route path="/economat/budget" element={<Wrapped><FinanceManagementPage /></Wrapped>} />
        <Route path="/economat/depenses" element={<Wrapped><FinanceManagementPage /></Wrapped>} />
        <Route path="/economat/fournisseurs" element={<Wrapped><EconomatPage /></Wrapped>} />
        <Route path="/economat/recouvrement" element={<Wrapped><EconomatPage /></Wrapped>} />
        <Route path="/economat/rapport" element={<Wrapped><EconomatPage /></Wrapped>} />
        <Route path="/rh/personnel" element={<Wrapped><RHPage /></Wrapped>} />
        <Route path="/rh/contrats" element={<Wrapped><RHPage /></Wrapped>} />
        <Route path="/rh/paie" element={<Wrapped><RHPage /></Wrapped>} />
        <Route path="/rh/conges" element={<Wrapped><RHPage /></Wrapped>} />

        {/* Communication */}
        <Route path="/communication" element={<Wrapped><CommunicationPage /></Wrapped>} />

        {/* Logistique */}
        <Route path="/logistique/tickets" element={<Wrapped><LogistiquePage /></Wrapped>} />
        <Route path="/logistique/stocks" element={<Wrapped><LogistiquePage /></Wrapped>} />
        <Route path="/logistique/nettoyage" element={<Wrapped><LogistiquePage /></Wrapped>} />
        <Route path="/logistique/salles" element={<Wrapped><Placeholder title="Salles & Réservations" icon={<School size={64} color="#94a3b8" />} desc="Allocation dynamique des salles, amphithéâtres et laboratoires." /></Wrapped>} />

        {/* Portails Utilisateurs */}
        <Route path="/portail/etudiant" element={<Wrapped><EtudiantPortal /></Wrapped>} />
        <Route path="/portail/etudiant/notes" element={<Wrapped><EtudiantPortal /></Wrapped>} />
        <Route path="/portail/parent" element={<Wrapped><ParentPortal /></Wrapped>} />
        <Route path="/portail/professeur" element={<Wrapped><ProfesseurPortal /></Wrapped>} />

        {/* Catch-all */}
        <Route path="*" element={
          <Guard>
            <AppLayout>
              <Placeholder title="Page en développement" icon={<Construction size={64} color="#94a3b8" />} desc="Cette section sera disponible prochainement dans IMTECH UNIVERSITY." />
            </AppLayout>
          </Guard>
        } />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
