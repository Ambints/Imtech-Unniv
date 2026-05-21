import React, { useState, useEffect } from 'react';
import { useAuthStore } from '../../store/authStore';
import toast from 'react-hot-toast';
import {
  Calculator, Lock, FileText, GraduationCap, AlertCircle,
  CheckCircle, Clock, BookOpen
} from 'lucide-react';

interface DashboardData {
  anneeActive: string;
  notesEnAttente: number;
  sessionsVerrouillees: number;
  relevesEnBrouillon: number;
  diplomesEnAttente: number;
}

export const ScolariteDashboard: React.FC = () => {
  const { user, tenant } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [dashboardData, setDashboardData] = useState<DashboardData>({
    anneeActive: '2023-2024',
    notesEnAttente: 0,
    sessionsVerrouillees: 0,
    relevesEnBrouillon: 0,
    diplomesEnAttente: 0,
  });

  useEffect(() => {
    // Dashboard API removed - data will be loaded from specific endpoints when needed
    setLoading(false);
  }, [user, tenant]);

  return (
    <div style={{ padding: 32 }}>
      {/* Header */}
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontSize: 28, fontWeight: 800, color: '#1e293b', margin: '0 0 8px' }}>
          Dashboard Service Scolarité
        </h1>
        <p style={{ color: '#64748b', fontSize: 14 }}>
          Gestion des notes, délibérations, relevés et diplômes
        </p>
        <p style={{ color: '#1a5276', fontSize: 13, marginTop: 4 }}>
          Année académique active : <strong>{dashboardData?.anneeActive}</strong>
        </p>
      </div>

      {/* Stats Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 20, marginBottom: 32 }}>
        <StatCard
          icon={<AlertCircle size={24} color="#f59e0b" />}
          title="Notes en attente"
          value={dashboardData?.notesEnAttente || 0}
          color="#f59e0b"
        />
        <StatCard
          icon={<Lock size={24} color="#dc2626" />}
          title="Sessions verrouillées"
          value={dashboardData?.sessionsVerrouillees || 0}
          color="#dc2626"
        />
        <StatCard
          icon={<FileText size={24} color="#8b5cf6" />}
          title="Relevés en brouillon"
          value={dashboardData?.relevesEnBrouillon || 0}
          color="#8b5cf6"
        />
        <StatCard
          icon={<GraduationCap size={24} color="#059669" />}
          title="Diplômes en attente"
          value={dashboardData?.diplomesEnAttente || 0}
          color="#059669"
        />
      </div>

      {/* Actions rapides */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 20, marginBottom: 32 }}>
        <ActionCard
          icon={<Calculator size={32} color="#1a5276" />}
          title="Calcul des moyennes"
          description="Lancer le calcul automatique des moyennes pondérées (coefficients ECTS)"
          buttonText="Calculer"
          onClick={() => window.location.href = '/scolarite/calcul-moyennes'}
        />
        <ActionCard
          icon={<Lock size={32} color="#dc2626" />}
          title="Verrouillage des notes"
          description="Verrouiller les notes après délibération de jury"
          buttonText="Gérer les verrouillages"
          onClick={() => window.location.href = '/scolarite/verrouillage'}
        />
        <ActionCard
          icon={<FileText size={32} color="#8b5cf6" />}
          title="Relevés de notes"
          description="Générer et valider les relevés officiels en PDF"
          buttonText="Générer relevés"
          onClick={() => window.location.href = '/scolarite/releves'}
        />
        <ActionCard
          icon={<GraduationCap size={32} color="#059669" />}
          title="Diplômes"
          description="Vérifier les conditions d'obtention et générer les diplômes"
          buttonText="Gérer les diplômes"
          onClick={() => window.location.href = '/scolarite/diplomes'}
        />
      </div>

      {/* Info boxes */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 20 }}>
        <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 12, padding: 16, display: 'flex', gap: 12, alignItems: 'flex-start' }}>
          <AlertCircle size={20} color="#dc2626" style={{ flexShrink: 0, marginTop: 2 }} />
          <div>
            <p style={{ margin: 0, fontWeight: 600, color: '#991b1b', fontSize: 14 }}>Sécurité</p>
            <p style={{ margin: '4px 0 0', fontSize: 13, color: '#7f1d1d' }}>
              Une fois les notes verrouillées, aucune modification n'est possible sans jeton d'administrateur.
            </p>
          </div>
        </div>

        <div style={{ background: '#f0f9ff', border: '1px solid #bae6fd', borderRadius: 12, padding: 16, display: 'flex', gap: 12, alignItems: 'flex-start' }}>
          <CheckCircle size={20} color="#0284c7" style={{ flexShrink: 0, marginTop: 2 }} />
          <div>
            <p style={{ margin: 0, fontWeight: 600, color: '#0369a1', fontSize: 14 }}>Intégration</p>
            <p style={{ margin: '4px 0 0', fontSize: 13, color: '#0c4a6e' }}>
              Les justifications validées par le Surveillant Général sont automatiquement prises en compte dans le calcul de l'assiduité.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

// Composants auxiliaires

const StatCard: React.FC<{ icon: React.ReactNode; title: string; value: number; color: string }> = ({
  icon, title, value, color
}) => (
  <div style={{
    background: 'white',
    borderRadius: 12,
    padding: 20,
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
    borderLeft: `4px solid ${color}`,
  }}>
    <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
      <div style={{ width: 40, height: 40, borderRadius: 8, background: `${color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        {icon}
      </div>
      <span style={{ fontSize: 13, color: '#64748b' }}>{title}</span>
    </div>
    <p style={{ fontSize: 28, fontWeight: 700, color: '#1e293b', margin: 0 }}>{value}</p>
  </div>
);

const ActionCard: React.FC<{ icon: React.ReactNode; title: string; description: string; buttonText: string; onClick: () => void }> = ({
  icon, title, description, buttonText, onClick
}) => (
  <div style={{
    background: 'white',
    borderRadius: 12,
    padding: 24,
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
    display: 'flex',
    flexDirection: 'column',
    gap: 12
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

export default ScolariteDashboard;

// Made with Bob
