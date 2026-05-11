import React, { useState, useEffect } from 'react';
import { useAuthStore } from '../../store/authStore';
import { api } from '../../api/client';
import toast from 'react-hot-toast';
import {
  BookOpen, Users, TrendingUp, AlertTriangle, CheckCircle,
  Clock, FileText, Award, BarChart3, Calendar
} from 'lucide-react';

interface DashboardData {
  parcours: any[];
  validations: {
    sujetsEnAttente: number;
    pvEnAttente: number;
  };
  performance?: any;
  assiduite?: any;
}

export const RPDashboardSimple: React.FC = () => {
  const { user, tenant } = useAuthStore();
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [debugInfo, setDebugInfo] = useState<any>({});

  useEffect(() => {
    // Collecter les informations de debug
    const debug = {
      userRole: user?.role,
      userId: user?.id,
      userEmail: user?.email,
      tenantId: tenant?.id,
      tenantName: tenant?.name,
      tenantSlug: tenant?.slug,
      hasUser: !!user,
      hasTenant: !!tenant,
      localStorage: localStorage.getItem('imtech-auth-v1') ? 'présent' : 'absent'
    };
    setDebugInfo(debug);
    console.log('[RP Dashboard] Debug Info:', debug);

    if (!user) {
      setError('Utilisateur non connecté');
      setLoading(false);
      return;
    }

    loadDashboard();
  }, [user, tenant]);

  const loadDashboard = async () => {
    setLoading(true);
    setError(null);

    try {
      // Essayer de charger les parcours du RP
      const tid = tenant?.id || user?.tenantId;
      
      if (!tid) {
        throw new Error('Tenant ID non disponible');
      }

      console.log('[RP Dashboard] Loading with tid:', tid);
      
      // Charger les parcours
      const parcoursResponse = await api.get(`/rp-enhanced/${tid}/mes-parcours`);
      console.log('[RP Dashboard] Parcours loaded:', parcoursResponse.data);

      setDashboardData({
        parcours: parcoursResponse.data || [],
        validations: {
          sujetsEnAttente: 0,
          pvEnAttente: 0
        }
      });

    } catch (err: any) {
      console.error('[RP Dashboard] Error:', err);
      const errorMsg = err.response?.data?.message || err.message || 'Erreur inconnue';
      setError(errorMsg);
      toast.error(`Erreur: ${errorMsg}`);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
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
        <h3 style={{ color: '#64748b', fontSize: 16 }}>Chargement du dashboard...</h3>
        <div style={{ marginTop: 20, fontSize: 12, color: '#94a3b8', textAlign: 'left', maxWidth: 400, margin: '20px auto', background: '#f8fafc', padding: 15, borderRadius: 8 }}>
          <strong>Debug Info:</strong>
          <pre style={{ fontSize: 11, marginTop: 10 }}>{JSON.stringify(debugInfo, null, 2)}</pre>
        </div>
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
          <div style={{ fontSize: 12, color: '#7f1d1d', background: '#fef2f2', padding: 12, borderRadius: 8 }}>
            <strong>Informations de debug:</strong>
            <pre style={{ fontSize: 11, marginTop: 8, whiteSpace: 'pre-wrap' }}>
              {JSON.stringify(debugInfo, null, 2)}
            </pre>
          </div>
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
          Dashboard Responsable Pédagogique
        </h1>
        <p style={{ color: '#64748b', fontSize: 14 }}>
          Bienvenue {user?.firstName} {user?.lastName}
        </p>
      </div>

      {/* Stats Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 20, marginBottom: 32 }}>
        <StatCard
          icon={<BookOpen size={24} color="#1a5276" />}
          title="Mes Parcours"
          value={dashboardData?.parcours?.length || 0}
          color="#1a5276"
        />
        <StatCard
          icon={<FileText size={24} color="#f59e0b" />}
          title="Sujets en attente"
          value={dashboardData?.validations?.sujetsEnAttente || 0}
          color="#f59e0b"
        />
        <StatCard
          icon={<CheckCircle size={24} color="#10b981" />}
          title="PV à valider"
          value={dashboardData?.validations?.pvEnAttente || 0}
          color="#10b981"
        />
      </div>

      {/* Parcours List */}
      <div style={{ background: 'white', borderRadius: 12, padding: 24, boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
        <h2 style={{ fontSize: 20, fontWeight: 700, color: '#1e293b', marginBottom: 20 }}>
          Mes Parcours
        </h2>
        {dashboardData?.parcours && dashboardData.parcours.length > 0 ? (
          <div style={{ display: 'grid', gap: 16 }}>
            {dashboardData.parcours.map((parcours: any) => (
              <div
                key={parcours.id}
                style={{
                  padding: 16,
                  border: '1px solid #e2e8f0',
                  borderRadius: 8,
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}
              >
                <div>
                  <h3 style={{ fontSize: 16, fontWeight: 600, color: '#1e293b', margin: '0 0 4px' }}>
                    {parcours.nom}
                  </h3>
                  <p style={{ fontSize: 13, color: '#64748b', margin: 0 }}>
                    Code: {parcours.code} | Niveau: {parcours.niveau}
                  </p>
                </div>
                <button
                  style={{
                    padding: '8px 16px',
                    background: '#1a5276',
                    color: 'white',
                    border: 'none',
                    borderRadius: 6,
                    cursor: 'pointer',
                    fontSize: 13,
                    fontWeight: 600
                  }}
                >
                  Gérer
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: 40, color: '#94a3b8' }}>
            <BookOpen size={48} style={{ margin: '0 auto 16px', opacity: 0.5 }} />
            <p>Aucun parcours assigné</p>
          </div>
        )}
      </div>

    </div>
  );
};

const StatCard: React.FC<{ icon: React.ReactNode; title: string; value: number; color: string }> = ({
  icon,
  title,
  value,
  color
}) => (
  <div style={{
    background: 'white',
    borderRadius: 12,
    padding: 20,
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
    display: 'flex',
    alignItems: 'center',
    gap: 16
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
    <div>
      <p style={{ fontSize: 13, color: '#64748b', margin: '0 0 4px' }}>{title}</p>
      <p style={{ fontSize: 24, fontWeight: 700, color: '#1e293b', margin: 0 }}>{value}</p>
    </div>
  </div>
);

export default RPDashboardSimple;

// Made with Bob
