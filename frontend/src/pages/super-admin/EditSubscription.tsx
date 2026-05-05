import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { tenantsApi, plansApi } from '../../api/client';
import toast from 'react-hot-toast';
import { Gem, Save, X, Calendar, DollarSign, Users, CheckCircle, Loader2, Building2 } from 'lucide-react';

interface SectionCardProps {
  icon: React.ReactNode;
  iconBg: string;
  iconColor: string;
  title: string;
  children: React.ReactNode;
}

const SectionCard: React.FC<SectionCardProps> = ({ icon, iconBg, iconColor, title, children }) => (
  <div style={{ background: '#FAFAF7', border: '1px solid rgba(15,25,35,0.10)', borderRadius: '14px', padding: '24px', marginBottom: '16px' }}>
    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
      <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: iconBg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        {icon}
      </div>
      <h2 style={{ fontSize: '14px', fontWeight: 600, color: '#0F1923' }}>{title}</h2>
    </div>
    {children}
  </div>
);

const inputStyle = { width: '100%', padding: '10px 14px', fontSize: '13px', border: '1px solid rgba(15,25,35,0.15)', borderRadius: '10px', background: '#F5F5F0', color: '#0F1923' };
const labelStyle = { display: 'block', fontSize: '12px', fontWeight: 500, color: '#5A6472', marginBottom: '6px' };

export const EditSubscription: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  const [plans, setPlans] = useState<any[]>([]);
  const [tenant, setTenant] = useState<any>(null);
  const [formData, setFormData] = useState({
    plan: 'basic' as 'basic' | 'standard' | 'premium' | 'enterprise',
    status: 'active' as 'active' | 'expired' | 'suspended',
    monthlyPrice: 50000,
    maxUsers: 100,
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
  });

  useEffect(() => {
    if (id) {
      loadData();
    }
  }, [id]);

  const loadData = async () => {
    try {
      setLoadingData(true);
      
      // Load tenant data
      const tenantData = await tenantsApi.getOne(id!);
      setTenant(tenantData);
      
      // Load plans
      const plansData = await plansApi.getAll();
      setPlans(plansData || []);
      
      // Load subscription data if exists
      const subscriptionsResponse = await tenantsApi.getSubscriptions();
      const subscription = subscriptionsResponse.subscriptions?.find((sub: any) => sub.tenantId === tenantData.slug);
      
      if (subscription) {
        setFormData({
          plan: subscription.plan,
          status: subscription.status,
          monthlyPrice: subscription.monthlyPrice,
          maxUsers: subscription.maxUsers,
          startDate: new Date(subscription.startDate).toISOString().split('T')[0],
          endDate: new Date(subscription.endDate).toISOString().split('T')[0],
        });
      }
    } catch (err: any) {
      toast.error('Erreur lors du chargement des données');
      navigate('/super-admin/subscriptions');
    } finally {
      setLoadingData(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const dto = {
        plan: formData.plan,
        status: formData.status,
        monthlyPrice: formData.monthlyPrice,
        maxUsers: formData.maxUsers,
        startDate: formData.startDate,
        endDate: formData.endDate,
      };

      await tenantsApi.updateSubscription(id!, dto);
      toast.success('Abonnement modifié avec succès!');
      navigate('/super-admin/subscriptions');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Erreur lors de la modification');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'monthlyPrice' || name === 'maxUsers' ? parseInt(value) || 0 : value
    }));
  };

  const handlePlanChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedPlanCode = e.target.value;
    const selectedPlan = plans.find(p => p.name.toLowerCase() === selectedPlanCode);
    
    // Le plan détermine automatiquement le prix et le nombre max d'utilisateurs
    setFormData(prev => ({
      ...prev,
      plan: selectedPlanCode as any,
      monthlyPrice: selectedPlan?.monthlyPrice || 0,
      maxUsers: selectedPlan?.maxUsers || 0,
    }));
  };

  const getDaysRemaining = () => {
    const days = Math.floor((new Date(formData.endDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
    if (days < 0) return { text: 'Expiré', color: '#DC2626' };
    if (days === 0) return { text: 'Expire aujourd\'hui', color: '#D97706' };
    if (days <= 30) return { text: `${days} jours restants`, color: '#D97706' };
    return { text: `${days} jours restants`, color: '#059669' };
  };

  if (loadingData) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#F5F5F0' }}>
        <Loader2 style={{ width: 32, height: 32, color: '#2563eb', animation: 'spin 1s linear infinite' }} />
      </div>
    );
  }

  const daysInfo = getDaysRemaining();

  return (
    <div className="min-h-screen" style={{ background: '#F5F5F0' }}>
      {/* Topbar */}
      <header style={{ background: '#FAFAF7', borderBottom: '1px solid rgba(15,25,35,0.10)', padding: '0 28px', height: '56px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'sticky', top: 0, zIndex: 50 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <h1 style={{ fontSize: '18px', fontWeight: 600, color: '#0F1923', letterSpacing: '-0.01em' }}>Modifier l'Abonnement</h1>
          {tenant && (
            <span style={{ fontSize: '13px', color: '#9AA3AE' }}>• {tenant.nom}</span>
          )}
        </div>
        <button onClick={() => navigate('/super-admin/subscriptions')} style={{ padding: '8px 16px', fontSize: '12px', fontWeight: 500, color: '#5A6472', background: '#F5F5F0', border: '1px solid rgba(15,25,35,0.10)', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}>
          <X style={{ width: 14, height: 14 }} /> Annuler
        </button>
      </header>

      {/* Form */}
      <div style={{ padding: '24px 28px' }}>
        {/* University Info Card */}
        {tenant && (
          <div style={{ background: '#FAFAF7', border: '1px solid rgba(15,25,35,0.10)', borderRadius: '14px', padding: '20px', marginBottom: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: '#F5F5F0', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px', fontWeight: 700, color: '#5A6472' }}>
                {tenant.nom.charAt(0)}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '16px', fontWeight: 600, color: '#0F1923' }}>{tenant.nom}</div>
                <div style={{ fontSize: '12px', color: '#9AA3AE', marginTop: '2px' }}>{tenant.slug} • {tenant.emailContact}</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '11px', color: '#9AA3AE', marginBottom: '4px' }}>Expiration</div>
                <div style={{ fontSize: '13px', fontWeight: 600, color: daysInfo.color }}>{daysInfo.text}</div>
              </div>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* Plan et Statut */}
          <SectionCard icon={<Gem style={{ width: 16, height: 16, color: '#2563eb' }} />} iconBg="#DBEAFE" iconColor="#2563eb" title="Plan d'Abonnement">
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
              <div>
                <label style={labelStyle}>
                  Plan <span style={{ color: '#DC2626' }}>*</span>
                </label>
                <select
                  name="plan"
                  value={formData.plan}
                  onChange={handlePlanChange}
                  required
                  style={inputStyle}
                >
                  {plans.filter(p => p.isActive).map(plan => (
                    <option key={plan.id} value={plan.name.toLowerCase()}>
                      {plan.name} - {Number(plan.monthlyPrice || 0).toLocaleString()} Ar/mois
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label style={labelStyle}>
                  Statut <span style={{ color: '#DC2626' }}>*</span>
                </label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  required
                  style={inputStyle}
                >
                  <option value="active">Actif</option>
                  <option value="suspended">Suspendu</option>
                  <option value="expired">Expiré</option>
                </select>
              </div>
            </div>
            
            {/* Informations du plan sélectionné */}
            {(() => {
              const selectedPlan = plans.find(p => p.name.toLowerCase() === formData.plan);
              return selectedPlan ? (
                <div style={{ padding: '16px', background: '#F5F5F0', borderRadius: '10px', border: '1px solid rgba(15,25,35,0.10)' }}>
                  <div style={{ fontSize: '12px', fontWeight: 600, color: '#0F1923', marginBottom: '12px' }}>
                    Détails du plan sélectionné
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
                    <div>
                      <div style={{ fontSize: '11px', color: '#9AA3AE', marginBottom: '4px' }}>Prix mensuel</div>
                      <div style={{ fontSize: '16px', fontWeight: 700, color: '#059669' }}>
                        {Number(selectedPlan.monthlyPrice || 0).toLocaleString()} <span style={{ fontSize: '11px', fontWeight: 500, color: '#9AA3AE' }}>Ar</span>
                      </div>
                    </div>
                    <div>
                      <div style={{ fontSize: '11px', color: '#9AA3AE', marginBottom: '4px' }}>Utilisateurs max</div>
                      <div style={{ fontSize: '16px', fontWeight: 700, color: '#2563eb' }}>
                        {selectedPlan.maxUsers || 0}
                      </div>
                    </div>
                    <div>
                      <div style={{ fontSize: '11px', color: '#9AA3AE', marginBottom: '4px' }}>Étudiants max</div>
                      <div style={{ fontSize: '16px', fontWeight: 700, color: '#7C3AED' }}>
                        {selectedPlan.maxStudents || selectedPlan.max_etudiants || 0}
                      </div>
                    </div>
                  </div>
                  <p style={{ fontSize: '11px', color: '#9AA3AE', marginTop: '12px', fontStyle: 'italic' }}>
                    ℹ️ Ces valeurs sont définies automatiquement par le plan sélectionné
                  </p>
                </div>
              ) : null;
            })()}
          </SectionCard>

          {/* Période */}
          <SectionCard icon={<Calendar style={{ width: 16, height: 16, color: '#7C3AED' }} />} iconBg="#EDE9FE" iconColor="#7C3AED" title="Période d'Abonnement">
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div>
                <label style={labelStyle}>
                  Date de début <span style={{ color: '#DC2626' }}>*</span>
                </label>
                <input
                  type="date"
                  name="startDate"
                  value={formData.startDate}
                  onChange={handleChange}
                  required
                  style={inputStyle}
                />
              </div>
              <div>
                <label style={labelStyle}>
                  Date de fin <span style={{ color: '#DC2626' }}>*</span>
                </label>
                <input
                  type="date"
                  name="endDate"
                  value={formData.endDate}
                  onChange={handleChange}
                  required
                  style={inputStyle}
                />
              </div>
            </div>
            <div style={{ marginTop: '16px', padding: '12px 16px', background: '#F5F5F0', borderRadius: '10px', display: 'flex', alignItems: 'center', gap: '12px' }}>
              <Calendar style={{ width: 16, height: 16, color: '#5A6472' }} />
              <div>
                <div style={{ fontSize: '12px', fontWeight: 600, color: '#0F1923' }}>
                  Durée: {Math.ceil((new Date(formData.endDate).getTime() - new Date(formData.startDate).getTime()) / (1000 * 60 * 60 * 24))} jours
                </div>
                <div style={{ fontSize: '11px', color: '#9AA3AE', marginTop: '2px' }}>
                  Du {new Date(formData.startDate).toLocaleDateString('fr-FR')} au {new Date(formData.endDate).toLocaleDateString('fr-FR')}
                </div>
              </div>
            </div>
          </SectionCard>

          {/* Summary Card */}
          <div style={{ background: '#FAFAF7', border: '1px solid rgba(15,25,35,0.10)', borderRadius: '14px', padding: '20px', marginBottom: '16px' }}>
            <h3 style={{ fontSize: '14px', fontWeight: 600, color: '#0F1923', marginBottom: '16px' }}>Résumé de l'Abonnement</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
              <div style={{ padding: '12px', background: '#F5F5F0', borderRadius: '10px' }}>
                <div style={{ fontSize: '11px', color: '#9AA3AE', marginBottom: '4px' }}>Prix mensuel</div>
                <div style={{ fontSize: '18px', fontWeight: 700, color: '#0F1923' }}>{formData.monthlyPrice.toLocaleString()} <span style={{ fontSize: '12px', fontWeight: 500, color: '#9AA3AE' }}>Ar</span></div>
              </div>
              <div style={{ padding: '12px', background: '#F5F5F0', borderRadius: '10px' }}>
                <div style={{ fontSize: '11px', color: '#9AA3AE', marginBottom: '4px' }}>Utilisateurs max</div>
                <div style={{ fontSize: '18px', fontWeight: 700, color: '#0F1923' }}>{formData.maxUsers}</div>
              </div>
              <div style={{ padding: '12px', background: '#F5F5F0', borderRadius: '10px' }}>
                <div style={{ fontSize: '11px', color: '#9AA3AE', marginBottom: '4px' }}>Statut</div>
                <div style={{ fontSize: '13px', fontWeight: 600, color: formData.status === 'active' ? '#059669' : formData.status === 'suspended' ? '#D97706' : '#DC2626' }}>
                  {formData.status === 'active' ? 'Actif' : formData.status === 'suspended' ? 'Suspendu' : 'Expiré'}
                </div>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', paddingTop: '8px' }}>
            <button type="button" onClick={() => navigate('/super-admin/subscriptions')} style={{ padding: '10px 20px', fontSize: '13px', fontWeight: 500, color: '#5A6472', background: '#F5F5F0', border: '1px solid rgba(15,25,35,0.15)', borderRadius: '10px', cursor: 'pointer' }}>
              Annuler
            </button>
            <button type="submit" disabled={loading} style={{ padding: '10px 20px', fontSize: '13px', fontWeight: 600, color: '#fff', background: '#2563eb', border: 'none', borderRadius: '10px', cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.6 : 1, display: 'flex', alignItems: 'center', gap: '8px' }}>
              {loading ? (
                <Loader2 style={{ width: 16, height: 16, animation: 'spin 1s linear infinite' }} />
              ) : (
                <Save style={{ width: 16, height: 16 }} />
              )}
              {loading ? 'Enregistrement...' : 'Enregistrer les modifications'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Made with Bob
