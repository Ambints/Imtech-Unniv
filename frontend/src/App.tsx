import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useAuthStore } from './store/authStore';
import { AppLayout } from './components/layout/AppLayout';
import './styles/transitions.css';

// Create a client for React Query
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime: 30_000, // 30 seconds
    },
  },
});
import { LoginPage } from './pages/auth/LoginPage';
import { SuperAdminDashboard } from './pages/super-admin/SuperAdminDashboard';
import { NewUniversity } from './pages/super-admin/NewUniversity';
import { EditUniversity } from './pages/super-admin/EditUniversity';
import { Subscriptions } from './pages/super-admin/Subscriptions';
import { EditSubscription } from './pages/super-admin/EditSubscription';
import { UserManagement } from './pages/super-admin/UserManagement';
import { UserForm } from './pages/super-admin/UserForm';
import { ConfigurationPaiementPage } from './pages/super-admin/ConfigurationPaiement';
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { GestionNiveauxPage } from './pages/admin/GestionNiveauxPage';
// Import du nouveau module Président
import {
  DashboardPage as PresidentDashboardPage,
  DirectionsSummaryPage,
  RecrutementsPage,
  InvestissementsPage,
  DiplomesPage as PresidentDiplomesPage,
  ConventionsPage,
  DisciplinePage,
  ParcoursPage,
  CalendrierPage,
  DelegationsPage
} from './modules/president';
import { CaissePage } from './pages/finance/CaissePage';
import { FinanceManagementPage } from './pages/finance/FinanceManagementPage';
import { lazy, Suspense } from 'react';

// Lazy load caisse components for better performance
const CaissierDashboard = lazy(() => import('./pages/caisse/CaissierDashboard').then(module => ({ default: module.CaissierDashboard })));
const EncaissementPage = lazy(() => import('./pages/caisse/EncaissementPage').then(module => ({ default: module.EncaissementPage })));
const FraisInscriptionPage = lazy(() => import('./pages/caisse/FraisInscriptionPage').then(module => ({ default: module.FraisInscriptionPage })));
const ClotureCaissePage = lazy(() => import('./pages/caisse/ClotureCaissePage').then(module => ({ default: module.ClotureCaissePage })));
const EcheanciersPage = lazy(() => import('./pages/caisse/EcheanciersPage').then(module => ({ default: module.EcheanciersPage })));
const RecusQuittancesPage = lazy(() => import('./pages/caisse/RecusQuittancesPage').then(module => ({ default: module.RecusQuittancesPage })));
const ImpayesPage = lazy(() => import('./pages/caisse/ImpayesPage').then(module => ({ default: module.ImpayesPage })));
const ReportingPage = lazy(() => import('./pages/caisse/ReportingPage').then(module => ({ default: module.ReportingPage })));

// Lazy load enseignant components
const UploadRessourcePage = lazy(() => import('./pages/portals/enseignant/UploadRessourcePage'));
const ValidationPaiementsPage = lazy(() => import('./pages/caisse/ValidationPaiementsPage').then(module => ({ default: module.ValidationPaiementsPage })));
import { LogistiquePage } from './pages/logistics/LogistiquePage';
import LogistiqueModule from './modules/logistique';
import { EtudiantPortal } from './pages/portals/EtudiantPortal';
import { NotesEtudiantPage } from './pages/portals/etudiant/NotesEtudiantPage';
import { CoursEtudiantPage } from './pages/portals/etudiant/CoursEtudiantPage';
import { PaiementsEtudiantPage } from './pages/portals/etudiant/PaiementsEtudiantPage';
import { AbsencesEtudiantPage } from './pages/portals/etudiant/AbsencesEtudiantPage';
import { AttestationsEtudiantPage } from './pages/portals/etudiant/AttestationsEtudiantPage';
import { InscriptionEtudiantPage } from './pages/portals/etudiant/InscriptionEtudiantPage';
import { InscriptionGuard } from './components/guards/InscriptionGuard';
import EDTEtudiantPage from './pages/portals/etudiant/EDTEtudiantPage';
import { ParentPortal } from './pages/portals/ParentPortal';
import {
  ParentDashboard,
  ParentBulletin,
  ParentFinances,
  ParentAbsences,
  ParentMessages,
  ParentAutorisations,
  ParentEmploiDuTemps
} from './pages/portail';
import { EnseignantPortal } from './pages/portals/EnseignantPortal';
import { CommunicationPage } from './pages/communication/CommunicationPage';
import { RHPage } from './pages/rh/RHPage';
import EconomatLayout from './pages/economat/EconomatLayout';
import BudgetAnnuelPage from './pages/economat/BudgetAnnuelPage';
import SuiviDepensesPage from './pages/economat/SuiviDepensesPage';
import FournisseursPage from './pages/economat/FournisseursPage';
import RecouvrementGlobalPage from './pages/economat/RecouvrementGlobalPage';
import RapportFinancierPage from './pages/economat/RapportFinancierPage';
import SubventionsPage from './pages/economat/SubventionsPage';
import { NotesPage } from './pages/academic/NotesPage';
import { AcademicManagementPage } from './pages/academic/AcademicManagementPage';
import ResponsablePedagogiquePage from './pages/pedagogique/ResponsablePedagogiquePage';
import RPManagementPage from './pages/pedagogique/RPManagementPage';
import RPDashboardSimple from './pages/pedagogique/RPDashboardSimple';
import ReferentielsPage from './pages/pedagogique/ReferentielsPage';
import MaquettesPage from './pages/pedagogique/MaquettesPage';
import AffectationsPage from './pages/pedagogique/AffectationsPage';
import SujetsExamensPage from './pages/pedagogique/SujetsExamensPage';
import PVPage from './pages/pedagogique/PVPage';
import SecretaireDashboard from './pages/pedagogique/SecretaireDashboard';
import EmploiDuTempsPage from './pages/pedagogique/EmploiDuTempsPage';
import ConvocationsPage from './pages/pedagogique/ConvocationsPage';
import TransmissionPVPage from './pages/pedagogique/TransmissionPVPage';
import AbsencesPage from './pages/pedagogique/AbsencesPage';
import DossiersPage from './pages/pedagogique/DossiersPage';
import SurveillanceDashboard from './pages/surveillance/SurveillanceDashboard';
import PresencesPage from './pages/surveillance/PresencesPage';
import IncidentsPage from './pages/surveillance/IncidentsPage';
import SanctionsPage from './pages/surveillance/SanctionsPage';
import AbsencesRetardsPage from './pages/surveillance/AbsencesRetardsPage';
import SurveillanceExamensPage from './pages/surveillance/SurveillanceExamensPage';
import EmploiDuTempsSurveillance from './pages/surveillance/EmploiDuTempsSurveillance';
import EmploiDuTempsReadOnly from './pages/surveillance/EmploiDuTempsReadOnly';
import ScolariteDashboard from './pages/scolarite/ScolariteDashboard';
import DeliberationsPage from './pages/scolarite/DeliberationsPage';
import ScolariteDiplomesPage from './pages/scolarite/DiplomesPage';
import AttestationsPage from './pages/scolarite/AttestationsPage';
import {
  BookOpen, BookText, CheckCircle,
  CalendarDays, ClipboardList, AlertTriangle, Briefcase, BarChart3, Users, FileText,
  School, User, GraduationCap, GraduationCap as ProfIcon, Construction,
  QrCode, Calculator, Lock, Printer, CircleDot
} from 'lucide-react';

const Guard: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, isHydrated, user } = useAuthStore();
  
  console.log('[Guard] isHydrated:', isHydrated, '| isAuthenticated:', isAuthenticated, '| role:', user?.role);
  
  // Attendre que le store soit réhydraté depuis localStorage
  if (!isHydrated) {
    console.log('[Guard] Waiting for hydration...');
    return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
      <div style={{ width: 40, height: 40, border: '3px solid #f3f3f3', borderTop: '3px solid #1a5276', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
    </div>;
  }
  if (!isAuthenticated) {
    console.log('[Guard] Not authenticated, redirecting to login');
    return <Navigate to="/login" replace />;
  }
  console.log('[Guard] Authenticated, rendering children');
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

// Loading component for lazy loaded pages
const PageLoader: React.FC = () => (
  <div style={{ 
    display: 'flex', 
    flexDirection: 'column', 
    alignItems: 'center', 
    justifyContent: 'center', 
    height: '80vh', 
    gap: 20 
  }}>
    <div style={{ 
      width: 48, 
      height: 48, 
      border: '4px solid #f3f4f6', 
      borderTop: '4px solid #1a5276', 
      borderRadius: '50%', 
      animation: 'spin 1s linear infinite' 
    }} />
    <div style={{ 
      fontSize: 16, 
      fontWeight: 600, 
      color: '#64748b',
      textAlign: 'center'
    }}>
      Chargement en cours...
    </div>
    <style>{`
      @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
      }
    `}</style>
  </div>
);

const App: React.FC = () => {
  const { isAuthenticated, tenant, user } = useAuthStore();

  console.log('[App] Rendering App component', {
    isAuthenticated,
    hasUser: !!user,
    userRole: user?.role,
    hasTenant: !!tenant,
  });

  useEffect(() => {
    console.log('[App] useEffect - tenant:', tenant);
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
      enseignant: '/portail/enseignant',
      caissier: '/caisse',
      logistique: '/logistique/tickets',
      communication: '/communication',
      rh: '/rh/personnel',
      economat: '/economat/budget',
      resp_pedagogique: '/pedagogique',
      secretaire_parcours: '/secretaire',
      surveillant_general: '/surveillance',
      scolarite: '/scolarite',
    };
    return map[user?.role || ''] || '/';
  };

  return (
    <QueryClientProvider client={queryClient}>
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
        <Route path="/admin/configuration-paiement" element={<Wrapped><ConfigurationPaiementPage /></Wrapped>} />
        <Route path="/admin/portals" element={<Wrapped><AdminDashboard defaultTab="portals" /></Wrapped>} />
        <Route path="/admin/academic" element={<Wrapped><AdminDashboard defaultTab="academic" /></Wrapped>} />
        <Route path="/admin/niveaux" element={<Wrapped><GestionNiveauxPage /></Wrapped>} />
        <Route path="/admin/finance" element={<Wrapped><AdminDashboard defaultTab="finance" /></Wrapped>} />
        <Route path="/admin/rh" element={<Wrapped><AdminDashboard defaultTab="rh" /></Wrapped>} />
        <Route path="/admin/communication" element={<Wrapped><AdminDashboard defaultTab="communication" /></Wrapped>} />
        <Route path="/admin/discipline" element={<Wrapped><AdminDashboard defaultTab="discipline" /></Wrapped>} />
        <Route path="/admin/logistics" element={<Wrapped><AdminDashboard defaultTab="logistics" /></Wrapped>} />

        {/* Président - Nouveau module complet */}
        <Route path="/president" element={<Wrapped><PresidentDashboardPage /></Wrapped>} />
        <Route path="/president/supervision" element={<Wrapped><DirectionsSummaryPage /></Wrapped>} />
        <Route path="/president/recrutements" element={<Wrapped><RecrutementsPage /></Wrapped>} />
        <Route path="/president/investissements" element={<Wrapped><InvestissementsPage /></Wrapped>} />
        <Route path="/president/diplomes" element={<Wrapped><PresidentDiplomesPage /></Wrapped>} />
        <Route path="/president/conventions" element={<Wrapped><ConventionsPage /></Wrapped>} />
        <Route path="/president/discipline" element={<Wrapped><DisciplinePage /></Wrapped>} />
        <Route path="/president/parcours" element={<Wrapped><ParcoursPage /></Wrapped>} />
        <Route path="/president/calendrier" element={<Wrapped><CalendrierPage /></Wrapped>} />
        <Route path="/president/delegations" element={<Wrapped><DelegationsPage /></Wrapped>} />

        {/* Académique */}
        <Route path="/academic/parcours" element={<Wrapped><AcademicManagementPage /></Wrapped>} />
        <Route path="/academic/ue" element={<Wrapped><AcademicManagementPage /></Wrapped>} />
        <Route path="/academic/etudiants" element={<Wrapped><AcademicManagementPage /></Wrapped>} />
        <Route path="/academic/inscriptions" element={<Wrapped><AcademicManagementPage /></Wrapped>} />
        <Route path="/academic/deliberations" element={<Wrapped><NotesPage /></Wrapped>} />
        <Route path="/scolarite/notes" element={<Wrapped><NotesPage /></Wrapped>} />
        <Route path="/secretariat/inscriptions" element={<Wrapped><AcademicManagementPage /></Wrapped>} />
        <Route path="/secretariat/edt" element={<Wrapped><EmploiDuTempsPage /></Wrapped>} />
        <Route path="/secretariat/absences" element={<Wrapped><AbsencesPage /></Wrapped>} />
        <Route path="/secretariat/pv-jury" element={<Wrapped><TransmissionPVPage /></Wrapped>} />
        <Route path="/secretariat/dossiers" element={<Wrapped><DossiersPage /></Wrapped>} />
        <Route path="/secretariat/convocations" element={<Wrapped><ConvocationsPage /></Wrapped>} />
        <Route path="/surveillance/presences" element={<Wrapped><PresencesPage /></Wrapped>} />
        <Route path="/surveillance/incidents" element={<Wrapped><IncidentsPage /></Wrapped>} />

        {/* Finance */}
        <Route path="/finance/gestion" element={<Wrapped><FinanceManagementPage /></Wrapped>} />
        <Route path="/finance/caisse" element={<Wrapped><CaissePage /></Wrapped>} />
        <Route path="/finance/management" element={<Wrapped><FinanceManagementPage /></Wrapped>} />
        <Route path="/finance/paiements" element={<Wrapped><FinanceManagementPage /></Wrapped>} />
        <Route path="/finance/budgets" element={<Wrapped><FinanceManagementPage /></Wrapped>} />
        <Route path="/finance/depenses" element={<Wrapped><FinanceManagementPage /></Wrapped>} />

        {/* Caissier */}
        <Route path="/caisse" element={<Wrapped><Suspense fallback={<PageLoader />}><CaissierDashboard /></Suspense></Wrapped>} />
        <Route path="/caisse/encaissement" element={<Wrapped><Suspense fallback={<PageLoader />}><EncaissementPage /></Suspense></Wrapped>} />
        <Route path="/caisse/frais-inscription" element={<Wrapped><Suspense fallback={<PageLoader />}><FraisInscriptionPage /></Suspense></Wrapped>} />
        <Route path="/caisse/cloture" element={<Wrapped><Suspense fallback={<PageLoader />}><ClotureCaissePage /></Suspense></Wrapped>} />
        <Route path="/caisse/echeanciers" element={<Wrapped><Suspense fallback={<PageLoader />}><EcheanciersPage /></Suspense></Wrapped>} />
        <Route path="/caisse/validation-paiements" element={<Wrapped><Suspense fallback={<PageLoader />}><ValidationPaiementsPage /></Suspense></Wrapped>} />
        <Route path="/caisse/recus" element={<Wrapped><Suspense fallback={<PageLoader />}><RecusQuittancesPage /></Suspense></Wrapped>} />
        <Route path="/caisse/impayes" element={<Wrapped><Suspense fallback={<PageLoader />}><ImpayesPage /></Suspense></Wrapped>} />
        <Route path="/caisse/rapports" element={<Wrapped><Suspense fallback={<PageLoader />}><ReportingPage /></Suspense></Wrapped>} />

        {/* Economat */}
        <Route path="/economat" element={<Wrapped><EconomatLayout /></Wrapped>}>
          <Route path="budget" element={<BudgetAnnuelPage />} />
          <Route path="depenses" element={<SuiviDepensesPage />} />
          <Route path="fournisseurs" element={<FournisseursPage />} />
          <Route path="recouvrement" element={<RecouvrementGlobalPage />} />
          <Route path="rapports" element={<RapportFinancierPage />} />
          <Route path="subventions" element={<SubventionsPage />} />
        </Route>
        <Route path="/rh/*" element={<Wrapped><RHPage /></Wrapped>} />

        {/* Communication */}
        <Route path="/communication" element={<Wrapped><CommunicationPage /></Wrapped>} />

        {/* Test route - no guard */}
        <Route path="/test-rp" element={<div style={{padding: 40}}><h1>Test RP Page</h1><RPManagementPage /></div>} />
        
        {/* Pédagogique - Responsable Pédagogique */}
        <Route path="/pedagogique" element={<Wrapped><RPDashboardSimple /></Wrapped>} />
        <Route path="/pedagogique/full" element={<Wrapped><RPManagementPage /></Wrapped>} />
        <Route path="/pedagogique/referentiels" element={<Wrapped><ReferentielsPage /></Wrapped>} />
        <Route path="/pedagogique/maquettes" element={<Wrapped><MaquettesPage /></Wrapped>} />
        <Route path="/pedagogique/affectations" element={<Wrapped><AffectationsPage /></Wrapped>} />
        <Route path="/pedagogique/sujets" element={<Wrapped><SujetsExamensPage /></Wrapped>} />
        <Route path="/pedagogique/pv" element={<Wrapped><PVPage /></Wrapped>} />

        {/* Secrétaire de Parcours */}
        <Route path="/secretaire" element={<Wrapped><SecretaireDashboard /></Wrapped>} />
        <Route path="/secretaire/emploi-du-temps" element={<Wrapped><EmploiDuTempsPage /></Wrapped>} />
        <Route path="/secretaire/convocations" element={<Wrapped><ConvocationsPage /></Wrapped>} />
        <Route path="/secretaire/inscriptions" element={<Wrapped><AcademicManagementPage /></Wrapped>} />
        <Route path="/secretaire/absences" element={<Wrapped><AbsencesPage /></Wrapped>} />
        <Route path="/secretaire/transmission-pv" element={<Wrapped><TransmissionPVPage /></Wrapped>} />

        {/* Surveillant Général - Discipline */}
        <Route path="/surveillance" element={<Wrapped><SurveillanceDashboard /></Wrapped>} />
        <Route path="/surveillance/edt" element={<Wrapped><EmploiDuTempsReadOnly /></Wrapped>} />
        <Route path="/surveillance/presences" element={<Wrapped><PresencesPage /></Wrapped>} />
        <Route path="/surveillance/absences" element={<Wrapped><AbsencesRetardsPage /></Wrapped>} />
        <Route path="/surveillance/incidents" element={<Wrapped><IncidentsPage /></Wrapped>} />
        <Route path="/surveillance/sanctions" element={<Wrapped><SanctionsPage /></Wrapped>} />
        <Route path="/surveillance/examens" element={<Wrapped><SurveillanceExamensPage /></Wrapped>} />
        <Route path="/surveillance/pointage-qr" element={<Wrapped><Placeholder title="Pointage QR Code" icon={<QrCode size={64} color="#94a3b8" />} desc="Scanner les QR codes des étudiants pour l'appel numérique." /></Wrapped>} />
        <Route path="/surveillance/justifications" element={<Wrapped><Placeholder title="Justifications d'Absence" icon={<CheckCircle size={64} color="#94a3b8" />} desc="Valider ou refuser les justificatifs d'absence des étudiants." /></Wrapped>} />
        <Route path="/surveillance/alertes" element={<Wrapped><Placeholder title="Alertes Discipline" icon={<AlertTriangle size={64} color="#94a3b8" />} desc="Gérer les alertes automatiques vers le secrétariat." /></Wrapped>} />

        {/* Service Scolarité */}
        <Route path="/scolarite" element={<Wrapped><ScolariteDashboard /></Wrapped>} />
        <Route path="/scolarite/notes" element={<Wrapped><NotesPage /></Wrapped>} />
        <Route path="/scolarite/deliberations" element={<Wrapped><DeliberationsPage /></Wrapped>} />
        <Route path="/scolarite/diplomes" element={<Wrapped><ScolariteDiplomesPage /></Wrapped>} />
        <Route path="/scolarite/attestations" element={<Wrapped><AttestationsPage /></Wrapped>} />
        <Route path="/scolarite/calcul-moyennes" element={<Wrapped><Placeholder title="Calcul des Moyennes" icon={<Calculator size={64} color="#94a3b8" />} desc="Calcul automatique des moyennes pondérées par coefficients ECTS." /></Wrapped>} />
        <Route path="/scolarite/verrouillage" element={<Wrapped><Placeholder title="Verrouillage des Notes" icon={<Lock size={64} color="#94a3b8" />} desc="Verrouiller les notes après délibération de jury." /></Wrapped>} />
        <Route path="/scolarite/releves" element={<Wrapped><Placeholder title="Relevés de Notes" icon={<FileText size={64} color="#94a3b8" />} desc="Générer et valider les relevés officiels en PDF." /></Wrapped>} />

        {/* Logistique - Module Complet */}
        <Route path="/logistique/*" element={<Wrapped><LogistiqueModule /></Wrapped>} />

        {/* Portails Utilisateurs */}
        <Route path="/portail/etudiant" element={<Wrapped><InscriptionGuard><EtudiantPortal /></InscriptionGuard></Wrapped>} />
        <Route path="/portail/etudiant/inscription" element={<Wrapped><InscriptionEtudiantPage /></Wrapped>} />
        <Route path="/portail/etudiant/notes" element={<Wrapped><InscriptionGuard><NotesEtudiantPage /></InscriptionGuard></Wrapped>} />
        <Route path="/portail/etudiant/edt" element={<Wrapped><InscriptionGuard><EDTEtudiantPage /></InscriptionGuard></Wrapped>} />
        <Route path="/portail/etudiant/cours" element={<Wrapped><InscriptionGuard><CoursEtudiantPage /></InscriptionGuard></Wrapped>} />
        <Route path="/portail/etudiant/paiements" element={<Wrapped><InscriptionGuard><PaiementsEtudiantPage /></InscriptionGuard></Wrapped>} />
        <Route path="/portail/etudiant/absences" element={<Wrapped><InscriptionGuard><AbsencesEtudiantPage /></InscriptionGuard></Wrapped>} />
        <Route path="/portail/etudiant/attestations" element={<Wrapped><InscriptionGuard><AttestationsEtudiantPage /></InscriptionGuard></Wrapped>} />
        {/* Portail Parent - Routes complètes */}
        <Route path="/portail/parent" element={<Wrapped><ParentDashboard /></Wrapped>} />
        <Route path="/portail/parent/dashboard" element={<Wrapped><ParentDashboard /></Wrapped>} />
        <Route path="/portail/parent/enfants/:etudiantId/bulletin" element={<Wrapped><ParentBulletin /></Wrapped>} />
        <Route path="/portail/parent/enfants/:etudiantId/finances" element={<Wrapped><ParentFinances /></Wrapped>} />
        <Route path="/portail/parent/enfants/:etudiantId/absences" element={<Wrapped><ParentAbsences /></Wrapped>} />
        <Route path="/portail/parent/enfants/:etudiantId/messages" element={<Wrapped><ParentMessages /></Wrapped>} />
        <Route path="/portail/parent/enfants/:etudiantId/autorisations" element={<Wrapped><ParentAutorisations /></Wrapped>} />
        <Route path="/portail/parent/enfants/:etudiantId/emploi-du-temps" element={<Wrapped><ParentEmploiDuTemps /></Wrapped>} />
        
        <Route path="/portail/enseignant" element={<Wrapped><EnseignantPortal /></Wrapped>} />
        <Route path="/portail/enseignant/notes" element={<Wrapped><EnseignantPortal /></Wrapped>} />
        <Route path="/portail/enseignant/presences" element={<Wrapped><EnseignantPortal /></Wrapped>} />
        <Route path="/portail/enseignant/etudiants" element={<Wrapped><EnseignantPortal /></Wrapped>} />
        <Route path="/portail/enseignant/ressources" element={<Wrapped><EnseignantPortal /></Wrapped>} />
        <Route path="/portail/enseignant/upload-ressource" element={<Wrapped><UploadRessourcePage /></Wrapped>} />
        <Route path="/portail/enseignant/demandes" element={<Wrapped><EnseignantPortal /></Wrapped>} />

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
    </QueryClientProvider>
  );
};

export default App;
