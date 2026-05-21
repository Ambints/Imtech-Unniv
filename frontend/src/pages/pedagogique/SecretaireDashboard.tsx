import React, { useState, useEffect } from 'react';
import { useAuthStore } from '../../store/authStore';
import { api } from '../../api/client';
import toast from 'react-hot-toast';
import {
  Calendar, Users, Clock, AlertTriangle, CheckCircle,
  FileText, BookOpen, GraduationCap, Mail, Archive,
  Bell, UserMinus, UserCheck, AlertOctagon
} from 'lucide-react';

interface DashboardData {
  nbInscrits: number;
  absencesEnAttente: number;
  absencesSansRattrapage: number;
  absencesEtudiantsAJustifier: number;
  convocationsEnBrouillon: number;
  notesDerogatoiresAProposer: number;
  demandesEnAttente: number;
}

interface Parcours {
  id: string;
  code: string;
  nom: string;
  niveau: string;
}

export const SecretaireDashboard: React.FC = () => {
  const { user, tenant } = useAuthStore();
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [parcoursList, setParcoursList] = useState<Parcours[]>([]);
  const [selectedParcours, setSelectedParcours] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadParcours();
  }, [user, tenant]);

  useEffect(() => {
    if (selectedParcours) {
      loadDashboard();
    }
  }, [selectedParcours]);

  const loadParcours = async () => {
    try {
      const tid = tenant?.id || user?.tenantId;
      if (!tid) return;

      // Charger les parcours depuis l'API
      const response = await api.get(`/academic/${tid}/parcours`);
      const parcours = response.data || [];
      setParcoursList(parcours);
      
      if (parcours.length > 0) {
        setSelectedParcours(parcours[0].id);
      }
    } catch (err: any) {
      console.error('Erreur chargement parcours:', err);
      toast.error('Erreur lors du chargement des parcours');
    }
  };

  const loadDashboard = async () => {
    if (!selectedParcours) return;
    
    setLoading(true);
    setError(null);

    try {
      const tid = tenant?.id || user?.tenantId;
      if (!tid) {
        throw new Error('Tenant ID non disponible');
      }

      const response = await api.get(`/secretaire/${tid}/dashboard?parcoursId=${selectedParcours}`);
      setDashboardData(response.data);
    } catch (err: any) {
      console.error('Erreur dashboard:', err);
      const errorMsg = err.response?.data?.message || err.message || 'Erreur inconnue';
      setError(errorMsg);
      toast.error(`Erreur: ${errorMsg}`);
    } finally {
      setLoading(false);
    }
  };

  if (loading && !dashboardData) {
    return (
      <div style={{ padding: 40, textAlign: 'center' }}>
        <div style={{ 
          width: 60, 
          height: 60, 
          border: '4px solid #f3f3f3', 
          borderTop: '4px solid #1a5276', 
          borderRadius: '50%', 
          animation: 'spin 1s linear infinite',
          margin: '0 auto 20px'
        }} />
        <h3 style={{ color: '#64748b', fontSize: 16 }}>Chargement du dashboard secrétaire...</h3>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: 40 }}>
        <div style={{ 
          background: '#fee2e2', 
          border: '1px solid #fecaca', 
          borderRadius: 12, 
          padding: 24,
          maxWidth: 600,
          margin: '0 auto'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
            <AlertTriangle size={24} color="#dc2626" />
            <h3 style={{ margin: 0, color: '#dc2626', fontSize: 18 }}>Erreur de chargement</h3>
          </div>
          <p style={{ color: '#991b1b', marginBottom: 16 }}>{error}</p>
          <button
            onClick={loadDashboard}
            style={{
              marginTop: 16,
              padding: '10px 20px',
              background: '#dc2626',
              color: 'white',
              border: 'none',
              borderRadius: 8,
              cursor: 'pointer',
              fontSize: 14,
              fontWeight: 600
            }}
          >
            Réessayer
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ padding: 32 }}>
      {/* Header */}
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontSize: 28, fontWeight: 800, color: '#1e293b', margin: '0 0 8px' }}>
          Dashboard Secrétaire de Parcours
        </h1>
        <p style={{ color: '#64748b', fontSize: 14 }}>
          Bienvenue {user?.firstName} {user?.lastName} - Gestion administrative du parcours
        </p>
      </div>

      {/* Sélecteur de parcours */}
      <div style={{ marginBottom: 24 }}>
        <label style={{ display: 'block', marginBottom: 8, fontWeight: 600, color: '#374151' }}>
          Parcours concerné :
        </label>
        <select
          value={selectedParcours}
          onChange={(e) => setSelectedParcours(e.target.value)}
          style={{
            padding: '10px 16px',
            borderRadius: 8,
            border: '1px solid #d1d5db',
            fontSize: 14,
            minWidth: 300
          }}
        >
          {parcoursList.map(p => (
            <option key={p.id} value={p.id}>
              {p.code} - {p.nom} ({p.niveau})
            </option>
          ))}
        </select>
      </div>

      {/* Stats Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 20, marginBottom: 32 }}>
        <StatCard
          icon={<Users size={24} color="#1a5276" />}
          title="Étudiants inscrits"
          value={dashboardData?.nbInscrits || 0}
          color="#1a5276"
          subtitle="Effectif du parcours"
        />
        <StatCard
          icon={<UserMinus size={24} color="#f59e0b" />}
          title="Absences en attente"
          value={dashboardData?.absencesEnAttente || 0}
          color="#f59e0b"
          subtitle="À valider"
        />
        <StatCard
          icon={<Clock size={24} color="#8b5cf6" />}
          title="Rattrapages à planifier"
          value={dashboardData?.absencesSansRattrapage || 0}
          color="#8b5cf6"
          subtitle="Absences validées"
        />
        <StatCard
          icon={<AlertOctagon size={24} color="#ef4444" />}
          title="Absences étudiants"
          value={dashboardData?.absencesEtudiantsAJustifier || 0}
          color="#ef4444"
          subtitle="À justifier"
        />
        <StatCard
          icon={<Mail size={24} color="#06b6d4" />}
          title="Convocations en brouillon"
          value={dashboardData?.convocationsEnBrouillon || 0}
          color="#06b6d4"
          subtitle="À envoyer"
        />
        <StatCard
          icon={<FileText size={24} color="#10b981" />}
          title="Notes dérogatoires"
          value={dashboardData?.notesDerogatoiresAProposer || 0}
          color="#10b981"
          subtitle="À soumettre"
        />
        <StatCard
          icon={<Bell size={24} color="#ec4899" />}
          title="Demandes étudiants"
          value={dashboardData?.demandesEnAttente || 0}
          color="#ec4899"
          subtitle="En attente de traitement"
        />
      </div>

      {/* Actions rapides */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 20, marginBottom: 32 }}>
        <ActionCard
          icon={<Calendar size={32} color="#1a5276" />}
          title="Emploi du temps"
          description="Gérer le planning des cours et vérifier les conflits de salles"
          buttonText="Ouvrir le planning"
          onClick={() => window.location.href = '/pedagogique/emploi-du-temps'}
        />
        <ActionCard
          icon={<GraduationCap size={32} color="#10b981" />}
          title="Inscriptions"
          description="Inscrire de nouveaux étudiants ou réinscrire les anciens"
          buttonText="Gérer les inscriptions"
          onClick={() => window.location.href = '/pedagogique/inscriptions'}
        />
        <ActionCard
          icon={<UserCheck size={32} color="#f59e0b" />}
          title="Absences"
          description="Déclarer et valider les absences des enseignants et étudiants"
          buttonText="Gérer les absences"
          onClick={() => window.location.href = '/pedagogique/absences'}
        />
        <ActionCard
          icon={<Mail size={32} color="#06b6d4" />}
          title="Convocations"
          description="Générer et envoyer les convocations aux examens"
          buttonText="Créer des convocations"
          onClick={() => window.location.href = '/pedagogique/convocations'}
        />
        <ActionCard
          icon={<BookOpen size={32} color="#8b5cf6" />}
          title="Notes dérogatoires"
          description="Saisir les notes pour cas particuliers et les soumettre à la scolarité"
          buttonText="Saisir des notes"
          onClick={() => window.location.href = '/pedagogique/notes-derogatoires'}
        />
        <ActionCard
          icon={<Archive size={32} color="#ec4899" />}
          title="Dossiers étudiants"
          description="Gérer les documents administratifs et les archives"
          buttonText="Consulter les dossiers"
          onClick={() => window.location.href = '/pedagogique/dossiers'}
        />
        <ActionCard
          icon={<FileText size={32} color="#f59e0b" />}
          title="Transmission des PV"
          description="Transmettre les procès-verbaux de délibération à la scolarité centrale"
          buttonText="Transmettre les PV"
          onClick={() => window.location.href = '/secretaire/transmission-pv'}
        />
      </div>

      {/* Résumé des tâches urgentes */}
      {dashboardData && (
        <div style={{ background: 'white', borderRadius: 12, padding: 24, boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
          <h2 style={{ fontSize: 18, fontWeight: 700, color: '#1e293b', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
            <AlertTriangle size={20} color="#f59e0b" />
            Tâches urgentes
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {dashboardData.absencesEnAttente > 0 && (
              <AlertItem
                icon={<UserMinus size={18} />}
                message={`${dashboardData.absencesEnAttente} absence(s) d'enseignant(s) en attente de validation`}
                type="warning"
              />
            )}
            {dashboardData.absencesSansRattrapage > 0 && (
              <AlertItem
                icon={<Clock size={18} />}
                message={`${dashboardData.absencesSansRattrapage} rattrapage(s) à planifier`}
                type="info"
              />
            )}
            {dashboardData.absencesEtudiantsAJustifier > 0 && (
              <AlertItem
                icon={<AlertOctagon size={18} />}
                message={`${dashboardData.absencesEtudiantsAJustifier} absence(s) étudiante(s) à justifier`}
                type="error"
              />
            )}
            {dashboardData.demandesEnAttente > 0 && (
              <AlertItem
                icon={<Bell size={18} />}
                message={`${dashboardData.demandesEnAttente} demande(s) étudiante(s) en attente de traitement`}
                type="info"
              />
            )}
            {dashboardData.convocationsEnBrouillon > 0 && (
              <AlertItem
                icon={<Mail size={18} />}
                message={`${dashboardData.convocationsEnBrouillon} convocation(s) en brouillon à envoyer`}
                type="warning"
              />
            )}
            {dashboardData.absencesEnAttente === 0 &&
             dashboardData.absencesSansRattrapage === 0 &&
             dashboardData.absencesEtudiantsAJustifier === 0 &&
             dashboardData.demandesEnAttente === 0 &&
             dashboardData.convocationsEnBrouillon === 0 && (
              <div style={{ color: '#64748b', textAlign: 'center', padding: 20 }}>
                <CheckCircle size={48} color="#10b981" style={{ marginBottom: 12 }} />
                <p>Aucune tâche urgente pour le moment !</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

// Composants auxiliaires

const StatCard: React.FC<{
  icon: React.ReactNode;
  title: string;
  value: number;
  color: string;
  subtitle?: string;
}> = ({ icon, title, value, color, subtitle }) => (
  <div style={{
    background: 'white',
    borderRadius: 12,
    padding: 20,
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
    display: 'flex',
    alignItems: 'center',
    gap: 16,
    borderLeft: `4px solid ${color}`
  }}>
    <div style={{
      width: 48,
      height: 48,
      borderRadius: 10,
      background: `${color}15`,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    }}>
      {icon}
    </div>
    <div style={{ flex: 1 }}>
      <p style={{ fontSize: 13, color: '#64748b', margin: '0 0 4px' }}>{title}</p>
      <p style={{ fontSize: 24, fontWeight: 700, color: '#1e293b', margin: '0 0 4px' }}>{value}</p>
      {subtitle && <p style={{ fontSize: 12, color: '#94a3b8', margin: 0 }}>{subtitle}</p>}
    </div>
  </div>
);

const ActionCard: React.FC<{
  icon: React.ReactNode;
  title: string;
  description: string;
  buttonText: string;
  onClick: () => void;
}> = ({ icon, title, description, buttonText, onClick }) => (
  <div style={{
    background: 'white',
    borderRadius: 12,
    padding: 24,
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
    display: 'flex',
    flexDirection: 'column',
    gap: 16
  }}>
    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
      {icon}
      <h3 style={{ margin: 0, fontSize: 18, fontWeight: 600, color: '#1e293b' }}>{title}</h3>
    </div>
    <p style={{ margin: 0, fontSize: 14, color: '#64748b', lineHeight: 1.5 }}>{description}</p>
    <button
      onClick={onClick}
      style={{
        padding: '10px 16px',
        background: '#1a5276',
        color: 'white',
        border: 'none',
        borderRadius: 8,
        cursor: 'pointer',
        fontSize: 14,
        fontWeight: 600,
        marginTop: 'auto'
      }}
    >
      {buttonText}
    </button>
  </div>
);

const AlertItem: React.FC<{
  icon: React.ReactNode;
  message: string;
  type: 'warning' | 'error' | 'info';
}> = ({ icon, message, type }) => {
  const colors = {
    warning: { bg: '#fffbeb', border: '#f59e0b', text: '#92400e' },
    error: { bg: '#fef2f2', border: '#ef4444', text: '#991b1b' },
    info: { bg: '#eff6ff', border: '#3b82f6', text: '#1e40af' },
  };
  const c = colors[type];

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: 12,
      padding: 12,
      background: c.bg,
      border: `1px solid ${c.border}`,
      borderRadius: 8,
      color: c.text,
      fontSize: 14
    }}>
      {icon}
      <span>{message}</span>
    </div>
  );
};

export default SecretaireDashboard;

// Made with Bob
