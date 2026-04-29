import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { useAuthStore } from './store/authStore';
import { AppLayout } from './components/layout/AppLayout';
import { LoginPage } from './pages/auth/LoginPage';
import { PresidentDashboard } from './pages/president/DashboardPage';
import { SuperAdminDashboard } from './pages/super-admin/SuperAdminDashboard';
import { NewUniversity } from './pages/super-admin/NewUniversity';
import { Subscriptions } from './pages/super-admin/Subscriptions';
import { Supervision } from './pages/super-admin/Supervision';
import { CaissePage } from './pages/finance/CaissePage';
import { LogistiquePage } from './pages/logistics/LogistiquePage';
import { EtudiantPortal } from './pages/portals/EtudiantPortal';
import { NotesPage } from './pages/academic/NotesPage';
import { 
  GraduationCap, Banknote, PenLine, TrendingUp, BookOpen, BookText, CheckCircle, 
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
    <a href="/president" style={{ padding: '10px 20px', background: '#1a5276', color: '#fff', borderRadius: 10, fontSize: 13, fontWeight: 600 }}>
      ← Tableau de bord
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
      super_admin: '/super-admin', president: '/president',
      etudiant: '/portail/etudiant', caissier: '/caisse',
      responsable_logistique: '/logistique/tickets',
    };
    return map[user?.role || ''] || '/president';
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
        <Route path="/super-admin/subscriptions" element={<Wrapped><Subscriptions /></Wrapped>} />
        <Route path="/super-admin/supervision" element={<Wrapped><Supervision /></Wrapped>} />

        {/* Présidence */}
        <Route path="/president" element={<Wrapped><PresidentDashboard /></Wrapped>} />
        <Route path="/president/academic" element={<Wrapped><Placeholder title="Supervision Académique" icon={<GraduationCap size={64} color="#94a3b8" />} desc="Vue présidentielle de tous les parcours, taux de réussite et statistiques académiques." /></Wrapped>} />
        <Route path="/president/finance" element={<Wrapped><Placeholder title="Supervision Financière" icon={<Banknote size={64} color="#94a3b8" />} desc="Vue présidentielle des recettes, budgets et état financier global." /></Wrapped>} />
        <Route path="/president/signatures" element={<Wrapped><Placeholder title="Signature Électronique" icon={<PenLine size={64} color="#94a3b8" />} desc="Signez électroniquement les diplômes, conventions et documents officiels." /></Wrapped>} />
        <Route path="/president/rapports" element={<Wrapped><Placeholder title="Rapports & KPIs" icon={<TrendingUp size={64} color="#94a3b8" />} desc="Rapports détaillés annuels pour le Conseil d'Administration et le Diocèse." /></Wrapped>} />

        {/* Académique */}
        <Route path="/academic/parcours" element={<Wrapped><Placeholder title="Gestion des Parcours" icon={<BookOpen size={64} color="#94a3b8" />} desc="Modélisation des maquettes LMD : Licence, Master, Doctorat. Crédits ECTS." /></Wrapped>} />
        <Route path="/academic/ue" element={<Wrapped><Placeholder title="Unités d'Enseignement" icon={<BookText size={64} color="#94a3b8" />} desc="Gestion des UE, coefficients, crédits ECTS et affectation aux parcours." /></Wrapped>} />
        <Route path="/academic/deliberations" element={<Wrapped><NotesPage /></Wrapped>} />
        <Route path="/scolarite/notes" element={<Wrapped><NotesPage /></Wrapped>} />
        <Route path="/secretariat/inscriptions" element={<Wrapped><Placeholder title="Inscriptions & Réinscriptions" icon={<CheckCircle size={64} color="#94a3b8" />} desc="Gestion des inscriptions administratives et académiques par parcours." /></Wrapped>} />
        <Route path="/secretariat/edt" element={<Wrapped><Placeholder title="Emploi du Temps" icon={<CalendarDays size={64} color="#94a3b8" />} desc="Planification hebdomadaire des cours, TD, TP par parcours et salle." /></Wrapped>} />
        <Route path="/secretariat/absences" element={<Wrapped><Placeholder title="Suivi des Absences" icon={<ClipboardList size={64} color="#94a3b8" />} desc="Saisie, justification et suivi des absences et retards des étudiants." /></Wrapped>} />
        <Route path="/surveillance/presences" element={<Wrapped><Placeholder title="Présences Journalières" icon={<CheckCircle size={64} color="#94a3b8" />} desc="Contrôle numérique des présences via QR Code ou appel en ligne." /></Wrapped>} />
        <Route path="/surveillance/incidents" element={<Wrapped><Placeholder title="Incidents Disciplinaires" icon={<AlertTriangle size={64} color="#94a3b8" />} desc="Saisie des rapports de conduite et incidents à remonter à la Présidence." /></Wrapped>} />

        {/* Finance */}
        <Route path="/caisse" element={<Wrapped><CaissePage /></Wrapped>} />
        <Route path="/caisse/encaissement" element={<Wrapped><CaissePage /></Wrapped>} />
        <Route path="/economat/budget" element={<Wrapped><Placeholder title="Budget Annuel" icon={<Briefcase size={64} color="#94a3b8" />} desc="Élaboration, affectation et suivi du budget par département." /></Wrapped>} />
        <Route path="/economat/rapport" element={<Wrapped><Placeholder title="Rapport Financier" icon={<BarChart3 size={64} color="#94a3b8" />} desc="Rapport d'exécution budgétaire consolidé pour le Président." /></Wrapped>} />
        <Route path="/rh/personnel" element={<Wrapped><Placeholder title="Gestion du Personnel" icon={<Users size={64} color="#94a3b8" />} desc="Contrats, dossiers administratifs, suivi des enseignants permanents et vacataires." /></Wrapped>} />
        <Route path="/rh/contrats" element={<Wrapped><Placeholder title="Contrats RH" icon={<FileText size={64} color="#94a3b8" />} desc="CDI, CDD, contrats vacataires. Suivi des heures complémentaires." /></Wrapped>} />

        {/* Logistique */}
        <Route path="/logistique/tickets" element={<Wrapped><LogistiquePage /></Wrapped>} />
        <Route path="/logistique/stocks" element={<Wrapped><LogistiquePage /></Wrapped>} />
        <Route path="/logistique/nettoyage" element={<Wrapped><LogistiquePage /></Wrapped>} />
        <Route path="/logistique/salles" element={<Wrapped><Placeholder title="Salles & Réservations" icon={<School size={64} color="#94a3b8" />} desc="Allocation dynamique des salles, amphithéâtres et laboratoires." /></Wrapped>} />

        {/* Portails Utilisateurs */}
        <Route path="/portail/etudiant" element={<Wrapped><EtudiantPortal /></Wrapped>} />
        <Route path="/portail/etudiant/notes" element={<Wrapped><EtudiantPortal /></Wrapped>} />
        <Route path="/portail/parent" element={<Wrapped><Placeholder title="Portail Parent" icon={<User size={64} color="#94a3b8" />} desc="Suivi académique, absences, bulletins et paiements de votre enfant." /></Wrapped>} />
        <Route path="/portail/professeur" element={<Wrapped><Placeholder title="Portail Professeur" icon={<ProfIcon size={64} color="#94a3b8" />} desc="Cours, saisie des notes, présences et ressources pédagogiques." /></Wrapped>} />

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