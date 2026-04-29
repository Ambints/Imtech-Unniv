import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import {
  Building2, Gem, Eye, LayoutDashboard, GraduationCap, Banknote, Users, PenLine, Scale, TrendingUp, Calendar,
  BookOpen, BookText, UserCog, FileEdit, Trophy, BarChart3, ClipboardList, FolderOpen, Send, FileText,
  Clock, AlertTriangle, EyeIcon, CheckCircle, CalendarDays, Scroll, BanknoteIcon, Receipt, CircleDot,
  Briefcase, ArrowRightLeft, Landmark, CreditCard, Printer, Wallet, MapPin, Sparkles, Target,
  Wrench, School, Package, Brush, Zap, Map, Droplets, Home, MessageSquare, User, Pencil, CheckSquare,
  GraduationCap as GradCap, Folder, FlaskConical, LogOut, X, Menu
} from 'lucide-react';

type MenuItem = { label: string; icon: React.ReactNode; path: string; badge?: number };

const MENUS: Record<string, MenuItem[]> = {
  super_admin: [
    { label: 'Universités', icon: <Building2 size={18} />, path: '/super-admin' },
    { label: 'Abonnements', icon: <Gem size={18} />, path: '/super-admin/subscriptions' },
    { label: 'Supervision', icon: <Eye size={18} />, path: '/super-admin/supervision' },
  ],
  president: [
    { label: 'Tableau de Bord', icon: <LayoutDashboard size={18} />, path: '/president' },
    { label: 'Académique', icon: <GraduationCap size={18} />, path: '/president/academic' },
    { label: 'Finance', icon: <Banknote size={18} />, path: '/president/finance' },
    { label: 'Ressources Humaines', icon: <Users size={18} />, path: '/president/rh' },
    { label: 'Signature Électronique', icon: <PenLine size={18} />, path: '/president/signatures' },
    { label: 'Conseils de Discipline', icon: <Scale size={18} />, path: '/president/discipline' },
    { label: 'Rapports & KPIs', icon: <TrendingUp size={18} />, path: '/president/rapports' },
    { label: 'Calendrier Académique', icon: <Calendar size={18} />, path: '/president/calendrier' },
  ],
  responsable_pedagogique: [
    { label: 'Mes Parcours', icon: <BookOpen size={18} />, path: '/academic/parcours' },
    { label: 'Maquettes LMD / ECTS', icon: <BookText size={18} />, path: '/academic/ue' },
    { label: 'Affectation Enseignants', icon: <UserCog size={18} />, path: '/academic/enseignants' },
    { label: 'Examens & Sujets', icon: <FileEdit size={18} />, path: '/academic/examens' },
    { label: 'Jury & Délibérations', icon: <Trophy size={18} />, path: '/academic/deliberations' },
    { label: 'Suivi Taux de Réussite', icon: <BarChart3 size={18} />, path: '/academic/stats' },
    { label: 'Stages & Mémoires', icon: <ClipboardList size={18} />, path: '/academic/stages' },
  ],
  secretaire_parcours: [
    { label: 'Inscriptions', icon: <CheckCircle size={18} />, path: '/secretariat/inscriptions' },
    { label: 'Emploi du Temps', icon: <CalendarDays size={18} />, path: '/secretariat/edt' },
    { label: 'Suivi des Absences', icon: <ClipboardList size={18} />, path: '/secretariat/absences' },
    { label: 'Dossiers Étudiants', icon: <FolderOpen size={18} />, path: '/secretariat/dossiers' },
    { label: 'Convocations Examens', icon: <Send size={18} />, path: '/secretariat/convocations' },
    { label: 'PV de Jury', icon: <Scroll size={18} />, path: '/secretariat/pv' },
  ],
  surveillant_general: [
    { label: 'Présences Journalières', icon: <CheckCircle size={18} />, path: '/surveillance/presences' },
    { label: 'Absences & Retards', icon: <Clock size={18} />, path: '/surveillance/absences' },
    { label: 'Incidents Disciplinaires', icon: <AlertTriangle size={18} />, path: '/surveillance/incidents' },
    { label: 'Surveillance Examens', icon: <EyeIcon size={18} />, path: '/surveillance/examens' },
    { label: 'Sanctions', icon: <Scale size={18} />, path: '/surveillance/sanctions' },
  ],
  scolarite: [
    { label: 'Relevés de Notes', icon: <BarChart3 size={18} />, path: '/scolarite/notes' },
    { label: 'Délibérations', icon: <Trophy size={18} />, path: '/scolarite/deliberations' },
    { label: 'Génération Diplômes', icon: <GraduationCap size={18} />, path: '/scolarite/diplomes' },
    { label: 'Attestations', icon: <FileText size={18} />, path: '/scolarite/attestations' },
    { label: 'Transferts & Équivalences', icon: <ArrowRightLeft size={18} />, path: '/scolarite/transferts' },
  ],
  economat: [
    { label: 'Budget Annuel', icon: <Briefcase size={18} />, path: '/economat/budget' },
    { label: 'Suivi Dépenses', icon: <Wallet size={18} />, path: '/economat/depenses' },
    { label: 'Fournisseurs', icon: <Landmark size={18} />, path: '/economat/fournisseurs' },
    { label: 'Recouvrement Global', icon: <Banknote size={18} />, path: '/economat/recouvrement' },
    { label: 'Rapport Financier', icon: <BarChart3 size={18} />, path: '/economat/rapport' },
    { label: 'Subventions', icon: <Landmark size={18} />, path: '/economat/subventions' },
  ],
  caissier: [
    { label: 'Encaissement', icon: <BanknoteIcon size={18} />, path: '/caisse/encaissement' },
    { label: 'Caisse du Jour', icon: <Receipt size={18} />, path: '/caisse' },
    { label: 'Échéanciers', icon: <Calendar size={18} />, path: '/caisse/echeanciers' },
    { label: 'Reçus & Quittances', icon: <Printer size={18} />, path: '/caisse/recus' },
    { label: 'Impayés', icon: <CircleDot size={18} />, path: '/caisse/impayes' },
  ],
  rh: [
    { label: 'Personnel', icon: <Users size={18} />, path: '/rh/personnel' },
    { label: 'Contrats', icon: <FileText size={18} />, path: '/rh/contrats' },
    { label: 'Paie & Vacations', icon: <CreditCard size={18} />, path: '/rh/paie' },
    { label: 'Congés & Absences', icon: <MapPin size={18} />, path: '/rh/conges' },
    { label: 'Évaluations', icon: <Sparkles size={18} />, path: '/rh/evaluations' },
    { label: 'Recrutement', icon: <Target size={18} />, path: '/rh/recrutement' },
  ],
  responsable_logistique: [
    { label: 'Tickets Maintenance', icon: <Wrench size={18} />, path: '/logistique/tickets' },
    { label: 'Salles & Réservations', icon: <School size={18} />, path: '/logistique/salles' },
    { label: 'Stocks & Inventaire', icon: <Package size={18} />, path: '/logistique/stocks' },
    { label: 'Planning Nettoyage', icon: <Brush size={18} />, path: '/logistique/nettoyage' },
    { label: 'Énergie & Équipements', icon: <Zap size={18} />, path: '/logistique/energie' },
  ],
  service_entretien: [
    { label: 'Mon Planning', icon: <CalendarDays size={18} />, path: '/entretien/planning' },
    { label: 'Zones Assignées', icon: <Map size={18} />, path: '/entretien/zones' },
    { label: 'Stock Produits', icon: <Droplets size={18} />, path: '/entretien/produits' },
  ],
  etudiant: [
    { label: 'Mon Tableau de Bord', icon: <Home size={18} />, path: '/portail/etudiant' },
    { label: 'Mes Notes', icon: <BarChart3 size={18} />, path: '/portail/etudiant/notes' },
    { label: 'Emploi du Temps', icon: <CalendarDays size={18} />, path: '/portail/etudiant/edt' },
    { label: 'Mes Paiements', icon: <CreditCard size={18} />, path: '/portail/etudiant/paiements' },
    { label: 'Cours & Ressources', icon: <BookOpen size={18} />, path: '/portail/etudiant/cours' },
    { label: 'Mes Absences', icon: <ClipboardList size={18} />, path: '/portail/etudiant/absences' },
    { label: 'Attestations', icon: <FileText size={18} />, path: '/portail/etudiant/attestations' },
  ],
  parent: [
    { label: 'Suivi de mon Enfant', icon: <User size={18} />, path: '/portail/parent' },
    { label: 'Bulletins de Notes', icon: <BarChart3 size={18} />, path: '/portail/parent/notes' },
    { label: 'Absences & Retards', icon: <ClipboardList size={18} />, path: '/portail/parent/absences' },
    { label: 'Paiements', icon: <CreditCard size={18} />, path: '/portail/parent/paiements' },
    { label: 'Messagerie', icon: <MessageSquare size={18} />, path: '/portail/parent/messages' },
  ],
  professeur: [
    { label: 'Mes Cours', icon: <BookText size={18} />, path: '/portail/professeur' },
    { label: 'Saisie des Notes', icon: <Pencil size={18} />, path: '/portail/professeur/notes' },
    { label: 'Présences Étudiants', icon: <CheckSquare size={18} />, path: '/portail/professeur/presences' },
    { label: 'Mes Étudiants', icon: <GradCap size={18} />, path: '/portail/professeur/etudiants' },
    { label: 'Ressources Pédagogiques', icon: <Folder size={18} />, path: '/portail/professeur/ressources' },
    { label: 'Demandes Matériel', icon: <FlaskConical size={18} />, path: '/portail/professeur/demandes' },
  ],
};

const ROLE_LABELS: Record<string, string> = {
  super_admin: 'Super Administrateur', president: 'Président', responsable_pedagogique: 'Resp. Pédagogique',
  secretaire_parcours: 'Secrétaire Parcours', surveillant_general: 'Surveillant Général',
  scolarite: 'Service Scolarité', economat: 'Économat (CFO)', caissier: 'Caissier',
  rh: 'Ressources Humaines', responsable_logistique: 'Resp. Logistique',
  service_entretien: 'Service Entretien', etudiant: 'Étudiant', parent: 'Parent', professeur: 'Professeur',
  communication: 'Communication', admin: 'Administrateur',
};

interface SidebarProps {
  mobileOpen?: boolean;
  onMobileClose?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ mobileOpen = false, onMobileClose }) => {
  const { user, tenant, logout } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();
  const [isMobile, setIsMobile] = useState(false);
  const menu = MENUS[user?.role || ''] || [];
  const active = location.pathname;

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 992);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const handleNavigation = (e: React.MouseEvent<HTMLAnchorElement>, path: string) => {
    e.preventDefault();
    navigate(path);
    if (isMobile && onMobileClose) {
      onMobileClose();
    }
  };

  // Desktop sidebar
  if (!isMobile) {
    return (
      <aside className="sidebar d-none d-lg-flex flex-column vh-100 position-sticky top-0" style={{
        width: '280px',
        background: 'linear-gradient(180deg, #0f172a 0%, #1e293b 50%, #0f172a 100%)',
        boxShadow: '4px 0 24px rgba(0,0,0,0.15)',
        zIndex: 1000,
        overflowY: 'auto',
        overflowX: 'hidden',
      }}>
        <SidebarContent 
          collapsed={false}
          tenant={tenant}
          user={user}
          menu={menu}
          active={active}
          onNavigate={handleNavigation}
          onLogout={logout}
          isMobile={false}
          onMobileClose={onMobileClose}
        />
      </aside>
    );
  }

  // Mobile sidebar overlay
  return (
    <>
      {/* Overlay */}
      <div 
        className={`position-fixed top-0 start-0 w-100 h-100 bg-dark ${mobileOpen ? 'opacity-50 visible' : 'opacity-0 invisible'}`}
        style={{ 
          zIndex: 1035, 
          transition: 'opacity 0.3s ease, visibility 0.3s ease',
          cursor: 'pointer'
        }}
        onClick={onMobileClose}
      />
      {/* Mobile Sidebar */}
      <aside 
        className={`position-fixed top-0 start-0 h-100 d-flex flex-column d-lg-none ${mobileOpen ? 'translate-x-0' : ''}`}
        style={{
          width: '280px',
          background: 'linear-gradient(180deg, #0f172a 0%, #1e293b 50%, #0f172a 100%)',
          boxShadow: '4px 0 24px rgba(0,0,0,0.3)',
          zIndex: 1040,
          transform: mobileOpen ? 'translateX(0)' : 'translateX(-100%)',
          transition: 'transform 0.3s cubic-bezier(0.4,0,0.2,1)',
          overflowY: 'auto',
          overflowX: 'hidden',
        }}
      >
        <SidebarContent 
          collapsed={false}
          tenant={tenant}
          user={user}
          menu={menu}
          active={active}
          onNavigate={handleNavigation}
          onLogout={logout}
          isMobile={true}
          onMobileClose={onMobileClose}
        />
      </aside>
    </>
  );
};

interface SidebarContentProps {
  collapsed: boolean;
  tenant: any;
  user: any;
  menu: MenuItem[];
  active: string;
  onNavigate: (e: React.MouseEvent<HTMLAnchorElement>, path: string) => void;
  onLogout: () => void;
  isMobile: boolean;
  onMobileClose?: () => void;
}

const SidebarContent: React.FC<SidebarContentProps> = ({ 
  tenant, user, menu, active, onNavigate, onLogout, isMobile, onMobileClose 
}) => {
  return (
    <>
      {/* Header */}
      <div className="p-3 p-lg-4 border-bottom" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
        <div className="d-flex align-items-center gap-3">
          <div className="flex-shrink-0 d-flex align-items-center justify-content-center" style={{
            width: 42, height: 42, borderRadius: 12,
            background: 'linear-gradient(135deg, #3b82f6 0%, #6366f1 100%)',
            boxShadow: '0 4px 12px rgba(59,130,246,0.3)',
          }}>
            {tenant?.logo ? <img src={tenant.logo} alt="logo" style={{ width: 28, height: 28, objectFit: 'contain' }} /> : <GraduationCap size={24} color="#fff" />}
          </div>
          <div className="overflow-hidden flex-grow-1">
            <div className="text-white fw-bold text-truncate" style={{ fontSize: 14, lineHeight: 1.3 }}>
              {tenant?.name || 'IMTECH UNIVERSITY'}
            </div>
            <div className="text-white-50 text-truncate" style={{ fontSize: 11, fontWeight: 500 }}>
              {tenant?.slogan || 'Plateforme SaaS'}
            </div>
          </div>
          {isMobile && (
            <button 
              className="btn btn-link text-white p-1 ms-auto"
              onClick={onMobileClose}
              aria-label="Fermer"
            >
              <X size={24} />
            </button>
          )}
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-grow-1 p-2 overflow-auto">
        {menu.map((item) => {
          const isActive = active === item.path;
          return (
            <a
              key={item.path}
              href={item.path}
              onClick={(e) => onNavigate(e, item.path)}
              className={`d-flex align-items-center gap-3 text-decoration-none mb-1 position-relative overflow-hidden ${
                isActive ? 'active-nav-item' : ''
              }`}
              style={{
                padding: '10px 14px',
                borderRadius: 10,
                background: isActive ? 'rgba(59,130,246,0.2)' : 'transparent',
                color: isActive ? '#60a5fa' : 'rgba(255,255,255,0.6)',
                fontSize: 13,
                fontWeight: isActive ? 600 : 500,
                transition: 'all 0.2s ease-out',
                border: isActive ? '1px solid rgba(59,130,246,0.3)' : '1px solid transparent',
              }}
              onMouseEnter={(e) => {
                if (!isActive) {
                  (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.05)';
                  (e.currentTarget as HTMLElement).style.color = 'rgba(255,255,255,0.9)';
                }
              }}
              onMouseLeave={(e) => {
                if (!isActive) {
                  (e.currentTarget as HTMLElement).style.background = 'transparent';
                  (e.currentTarget as HTMLElement).style.color = 'rgba(255,255,255,0.6)';
                }
              }}
            >
              {isActive && <span className="position-absolute start-0" style={{ top: '25%', bottom: '25%', width: 3, background: '#3b82f6', borderRadius: '0 4px 4px 0' }} />}
              <span className="flex-shrink-0 d-flex align-items-center">{item.icon}</span>
              <span className="text-truncate">{item.label}</span>
            </a>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="p-2 p-lg-3 border-top" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
        <div className="p-2 p-lg-3 mb-2" style={{ background: 'rgba(255,255,255,0.03)', borderRadius: 10 }}>
          <div className="text-white fw-semibold text-truncate" style={{ fontSize: 13 }}>
            {user?.firstName} {user?.lastName}
          </div>
          <div className="text-white-50" style={{ fontSize: 11, fontWeight: 500 }}>
            {ROLE_LABELS[user?.role || ''] || user?.role}
          </div>
        </div>
        <button 
          onClick={onLogout}
          className="btn w-100 d-flex align-items-center justify-content-center gap-2"
          style={{
            padding: '10px',
            background: 'rgba(239,68,68,0.15)', 
            border: '1px solid rgba(239,68,68,0.2)', 
            borderRadius: 10,
            color: '#fca5a5', 
            fontSize: 13, 
            fontWeight: 500,
          }}
        >
          <LogOut size={16} /> 
          <span>Déconnexion</span>
        </button>
      </div>
    </>
  );
};