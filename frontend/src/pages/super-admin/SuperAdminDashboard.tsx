import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { tenantsApi } from '../../api/client';
import { useAuthStore } from '../../store/authStore';
import { Tenant } from '../../types/tenant';
import { 
  Building2, Plus, Edit, Trash2, Eye, 
  CheckCircle, XCircle, ExternalLink, Search, Filter, MoreHorizontal 
} from 'lucide-react';

interface KpiCardProps {
  icon: React.ReactNode;
  iconBg: string;
  trend: string;
  trendColor: string;
  value: number;
  valueColor?: string;
  label: string;
}

const KpiCard: React.FC<KpiCardProps> = ({ icon, iconBg, trend, trendColor, value, valueColor, label }) => (
  <div style={{
    background: '#FAFAF7',
    border: '1px solid rgba(15,25,35,0.10)',
    borderRadius: '12px',
    padding: '16px',
    transition: 'box-shadow 0.2s'
  }}>
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
      <div style={{
        width: '32px', 
        height: '32px', 
        borderRadius: '8px', 
        background: iconBg,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        {icon}
      </div>
      <span style={{ fontSize: '11px', fontWeight: 600, color: trendColor }}>{trend}</span>
    </div>
    <div style={{ fontSize: '24px', fontWeight: 700, color: valueColor || '#0F1923', lineHeight: 1 }}>{value}</div>
    <div style={{ fontSize: '11px', color: '#9AA3AE', marginTop: '4px' }}>{label}</div>
  </div>
);

export const SuperAdminDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated, isHydrated, accessToken } = useAuthStore();
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  useEffect(() => {
    console.log('SuperAdminDashboard - isHydrated:', isHydrated, 'isAuthenticated:', isAuthenticated, 'token:', !!accessToken);
    // Attendre que le store soit réhydraté
    if (!isHydrated) return;
    
    if (isAuthenticated && accessToken) {
      loadTenants();
    } else {
      setLoading(false);
      setError('Veuillez vous connecter');
      navigate('/login');
    }
  }, [isHydrated, isAuthenticated, accessToken, navigate]);

  const loadTenants = async () => {
    try {
      setLoading(true);
      const data = await tenantsApi.getAll();
      setTenants(data);
      setError(null);
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 
                           err.message || 
                           'Erreur lors du chargement des universités';
      const errorDetails = err.response?.status ? ` (HTTP ${err.response.status})` : '';
      setError(`${errorMessage}${errorDetails}`);
      console.error('Erreur API:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await tenantsApi.delete(id);
      setTenants(tenants.filter(t => t.id !== id));
      setDeleteConfirm(null);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erreur lors de la suppression');
    }
  };

  const getStatusLabel = (actif: boolean) => actif ? 'Actif' : 'Inactif';

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#F5F5F0' }}>
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      minHeight: '100%',
      background: '#F5F5F0'
    }}>
      {/* Topbar - Style Maquette */}
      <header style={{ 
        background: '#FAFAF7', 
        borderBottom: '1px solid rgba(15,25,35,0.10)', 
        padding: '0 28px', 
        height: '56px',
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-between',
        position: 'sticky',
        top: 0,
        zIndex: 50
      }}>
        <h1 style={{ fontSize: '18px', fontWeight: 600, color: '#0F1923', letterSpacing: '-0.01em' }}>
          Universités
        </h1>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button
            onClick={() => navigate('/super-admin/create')}
            style={{
              padding: '8px 16px',
              background: '#2563eb',
              color: '#fff',
              borderRadius: '8px',
              border: 'none',
              fontSize: '12px',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <Plus style={{ width: 16, height: 16 }} />
            Nouvelle Université
          </button>
        </div>
      </header>

      <div style={{
        padding: '24px 28px',
        flex: 1
      }}>
        {error && (
          <div style={{ 
            marginBottom: '20px', 
            padding: '12px 16px', 
            background: '#FEF2F2', 
            border: '1px solid #FECACA',
            borderRadius: '10px',
            color: '#DC2626',
            fontSize: '13px'
          }}>
            {error}
          </div>
        )}

        {/* KPI Strip - Style Maquette */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px', marginBottom: '24px' }}>
          <KpiCard 
            icon={<Building2 style={{ width: 16, height: 16, color: '#2563eb' }} />}
            iconBg="#DBEAFE"
            trend="Total"
            trendColor="#6B7280"
            value={tenants.length}
            label="Établissements"
          />
          <KpiCard 
            icon={<CheckCircle style={{ width: 16, height: 16, color: '#059669' }} />}
            iconBg="#D1FAE5"
            trend="Actives"
            trendColor="#059669"
            value={tenants.filter(t => t.actif).length}
            valueColor="#059669"
            label="En opération"
          />
          <KpiCard 
            icon={<XCircle style={{ width: 16, height: 16, color: '#DC2626' }} />}
            iconBg="#FEE2E2"
            trend="Inactives"
            trendColor="#DC2626"
            value={tenants.filter(t => !t.actif).length}
            valueColor="#DC2626"
            label="À réactiver"
          />
          <KpiCard 
            icon={<Building2 style={{ width: 16, height: 16, color: '#4F46E5' }} />}
            iconBg="#E0E7FF"
            trend="Catholiques"
            trendColor="#4F46E5"
            value={tenants.filter(t => t.typeEtablissement === 'catholique').length}
            valueColor="#4F46E5"
            label="Institutions"
          />
        </div>

        {/* Card - Liste des universités */}
        <div style={{ background: '#FAFAF7', border: '1px solid rgba(15,25,35,0.10)', borderRadius: '14px', overflow: 'hidden' }}>
          <div style={{ padding: '18px 20px', borderBottom: '1px solid rgba(15,25,35,0.10)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <h2 style={{ fontSize: '14px', fontWeight: 600, color: '#0F1923' }}>Liste des Universités</h2>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{ position: 'relative' }}>
                <Search style={{ width: 14, height: 14, color: '#9AA3AE', position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)' }} />
                <input type="text" placeholder="Rechercher..." style={{ padding: '7px 12px 7px 30px', fontSize: '12px', border: '1px solid rgba(15,25,35,0.10)', borderRadius: '8px', background: '#F5F5F0', width: '200px' }} />
              </div>
              <button style={{ width: '32px', height: '32px', borderRadius: '8px', background: '#EEECEA', border: '1px solid rgba(15,25,35,0.10)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                <Filter style={{ width: 14, height: 14, color: '#5A6472' }} />
              </button>
            </div>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr>
                  <th style={{ fontSize: '10px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.07em', color: '#9AA3AE', textAlign: 'left', padding: '12px 16px', borderBottom: '1px solid rgba(15,25,35,0.10)' }}>Université</th>
                  <th style={{ fontSize: '10px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.07em', color: '#9AA3AE', textAlign: 'left', padding: '12px 16px', borderBottom: '1px solid rgba(15,25,35,0.10)' }}>Identifiants</th>
                  <th style={{ fontSize: '10px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.07em', color: '#9AA3AE', textAlign: 'left', padding: '12px 16px', borderBottom: '1px solid rgba(15,25,35,0.10)' }}>Status</th>
                  <th style={{ fontSize: '10px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.07em', color: '#9AA3AE', textAlign: 'left', padding: '12px 16px', borderBottom: '1px solid rgba(15,25,35,0.10)' }}>Couleurs</th>
                  <th style={{ fontSize: '10px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.07em', color: '#9AA3AE', textAlign: 'left', padding: '12px 16px', borderBottom: '1px solid rgba(15,25,35,0.10)' }}>Créée le</th>
                  <th style={{ fontSize: '10px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.07em', color: '#9AA3AE', textAlign: 'right', padding: '12px 16px', borderBottom: '1px solid rgba(15,25,35,0.10)' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {tenants.map((tenant) => (
                  <tr key={tenant.id} style={{ borderBottom: '1px solid rgba(15,25,35,0.04)' }}>
                    <td style={{ padding: '12px 16px', verticalAlign: 'middle' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        {tenant.logoUrl ? (
                          <img src={tenant.logoUrl} alt={tenant.nom} style={{ width: '36px', height: '36px', borderRadius: '8px', objectFit: 'cover', border: '1px solid rgba(15,25,35,0.10)' }} />
                        ) : (
                          <div style={{ width: '36px', height: '36px', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px', fontWeight: 700, color: '#fff', backgroundColor: tenant.couleurPrincipale || '#2563eb' }}>
                            {tenant.nom.charAt(0).toUpperCase()}
                          </div>
                        )}
                        <div>
                          <div style={{ fontSize: '13px', fontWeight: 600, color: '#0F1923' }}>{tenant.nom}</div>
                          {tenant.slogan && <div style={{ fontSize: '11px', color: '#9AA3AE' }}>{tenant.slogan}</div>}
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: '12px 16px', verticalAlign: 'middle' }}>
                      <div style={{ fontSize: '12px', fontWeight: 600, color: '#0F1923' }}>{tenant.slug}</div>
                      <div style={{ fontSize: '11px', color: '#9AA3AE' }}>{tenant.schemaName}</div>
                    </td>
                    <td style={{ padding: '12px 16px', verticalAlign: 'middle' }}>
                      <span style={{
                        display: 'inline-flex', alignItems: 'center', gap: '4px', padding: '4px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: 600,
                        ...(tenant.actif
                          ? { background: '#D1FAE5', color: '#059669', border: '1px solid rgba(5,150,105,0.3)' }
                          : { background: '#FEE2E2', color: '#DC2626', border: '1px solid rgba(220,38,38,0.3)' })
                      }}>
                        <span style={{ width: '5px', height: '5px', borderRadius: '50%', background: tenant.actif ? '#059669' : '#DC2626' }} />
                        {getStatusLabel(tenant.actif)}
                      </span>
                    </td>
                    <td style={{ padding: '12px 16px', verticalAlign: 'middle' }}>
                      <div style={{ display: 'flex', gap: '6px' }}>
                        <div style={{ width: '22px', height: '22px', borderRadius: '6px', border: '1px solid rgba(15,25,35,0.15)', backgroundColor: tenant.couleurPrincipale || '#2563eb' }} />
                        <div style={{ width: '22px', height: '22px', borderRadius: '6px', border: '1px solid rgba(15,25,35,0.15)', backgroundColor: tenant.couleurSecondaire || '#4F46E5' }} />
                        <div style={{ width: '22px', height: '22px', borderRadius: '6px', border: '1px solid rgba(15,25,35,0.15)', backgroundColor: tenant.couleurAccent || '#DC2626' }} />
                      </div>
                    </td>
                    <td style={{ padding: '12px 16px', verticalAlign: 'middle', fontSize: '12px', color: '#5A6472' }}>
                      {new Date(tenant.createdAt).toLocaleDateString('fr-FR')}
                    </td>
                    <td style={{ padding: '12px 16px', verticalAlign: 'middle', textAlign: 'right' }}>
                      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '4px' }}>
                        <button onClick={() => navigate(`/super-admin/tenant/${tenant.id}`)} style={{ width: '28px', height: '28px', borderRadius: '6px', border: 'none', background: 'transparent', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#9AA3AE' }} title="Voir">
                          <Eye style={{ width: 14, height: 14 }} />
                        </button>
                        <button onClick={() => navigate(`/super-admin/tenant/${tenant.id}/edit`)} style={{ width: '28px', height: '28px', borderRadius: '6px', border: 'none', background: 'transparent', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#9AA3AE' }} title="Modifier">
                          <Edit style={{ width: 14, height: 14 }} />
                        </button>
                        <button onClick={() => window.open(`https://${tenant.slug}.imtech.edu`, '_blank')} style={{ width: '28px', height: '28px', borderRadius: '6px', border: 'none', background: 'transparent', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#9AA3AE' }} title="Ouvrir">
                          <ExternalLink style={{ width: 14, height: 14 }} />
                        </button>
                        {deleteConfirm === tenant.id ? (
                          <>
                            <button onClick={() => handleDelete(tenant.id)} style={{ width: '28px', height: '28px', borderRadius: '6px', border: 'none', background: '#FEE2E2', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#DC2626' }}>
                              <CheckCircle style={{ width: 14, height: 14 }} />
                            </button>
                            <button onClick={() => setDeleteConfirm(null)} style={{ width: '28px', height: '28px', borderRadius: '6px', border: 'none', background: 'transparent', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#9AA3AE' }}>
                              <XCircle style={{ width: 14, height: 14 }} />
                            </button>
                          </>
                        ) : (
                          <button onClick={() => setDeleteConfirm(tenant.id)} style={{ width: '28px', height: '28px', borderRadius: '6px', border: 'none', background: 'transparent', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#9AA3AE' }} title="Supprimer">
                            <Trash2 style={{ width: 14, height: 14 }} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {tenants.length === 0 && (
            <div style={{ textAlign: 'center', padding: '48px 20px' }}>
              <div style={{ width: '56px', height: '56px', borderRadius: '12px', background: '#EEECEA', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                <Building2 style={{ width: 28, height: 28, color: '#9AA3AE' }} />
              </div>
              <h3 style={{ fontSize: '14px', fontWeight: 600, color: '#0F1923' }}>Aucune université</h3>
              <p style={{ fontSize: '12px', color: '#9AA3AE', marginTop: '4px' }}>Commencez par créer une nouvelle université.</p>
              <button onClick={() => navigate('/super-admin/create')} style={{ marginTop: '16px', padding: '8px 16px', background: '#2563eb', color: '#fff', borderRadius: '8px', border: 'none', fontSize: '12px', fontWeight: 600, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                <Plus style={{ width: 16, height: 16 }} />
                Créer une université
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SuperAdminDashboard;
