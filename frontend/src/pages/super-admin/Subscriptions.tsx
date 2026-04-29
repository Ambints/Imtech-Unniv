import React, { useState, useEffect } from 'react';
import { tenantsApi, plansApi } from '../../api/client';
import { Gem, Calendar, CheckCircle, XCircle, DollarSign, MoreHorizontal, Filter, Download, Loader2, Plus, Pencil, Trash2, X, Building2, Settings } from 'lucide-react';

interface KpiCardProps {
  icon: React.ReactNode;
  iconBg: string;
  trend: string;
  trendColor: string;
  value: string | number;
  valueColor?: string;
  label: string;
}

const KpiCard: React.FC<KpiCardProps> = ({ icon, iconBg, trend, trendColor, value, valueColor, label }) => (
  <div style={{ background: '#FAFAF7', border: '1px solid rgba(15,25,35,0.10)', borderRadius: '12px', padding: '16px', transition: 'box-shadow 0.2s' }}>
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
      <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: iconBg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{icon}</div>
      <span style={{ fontSize: '11px', fontWeight: 600, color: trendColor }}>{trend}</span>
    </div>
    <div style={{ fontSize: '24px', fontWeight: 700, color: valueColor || '#0F1923', lineHeight: 1 }}>{value}</div>
    <div style={{ fontSize: '11px', color: '#9AA3AE', marginTop: '4px' }}>{label}</div>
  </div>
);

interface Subscription {
  id: string;
  tenantId: string;
  tenantName: string;
  plan: 'basic' | 'standard' | 'premium' | 'enterprise';
  status: 'active' | 'expired' | 'suspended';
  startDate: string;
  endDate: string;
  monthlyPrice: number;
  maxUsers: number;
  currentUsers: number;
  features: string[];
}

export const Subscriptions: React.FC = () => {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [stats, setStats] = useState({
    totalRevenue: 0,
    activeSubscriptions: 0,
    expiringSoon: 0,
    suspended: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Modal states
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
  const [selectedSubscription, setSelectedSubscription] = useState<Subscription | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  
  // Plans management states
  const [plans, setPlans] = useState<any[]>([]);
  const [showPlansModal, setShowPlansModal] = useState(false);
  const [planModalMode, setPlanModalMode] = useState<'create' | 'edit'>('create');
  const [selectedPlan, setSelectedPlan] = useState<any>(null);
  const [isPlanSubmitting, setIsPlanSubmitting] = useState(false);
  const [planFormError, setPlanFormError] = useState<string | null>(null);
  
  // Plan form state
  const [planFormData, setPlanFormData] = useState({
    name: '',
    description: '',
    monthlyPrice: 50000,
    maxUsers: 100,
    maxStudents: 500,
    features: ['LMS', 'Support Email'],
    isActive: true,
    displayOrder: 1,
  });
  
  // Form state
  const [formData, setFormData] = useState<{
    tenantId: string;
    plan: 'basic' | 'standard' | 'premium' | 'enterprise';
    status: 'active' | 'expired' | 'suspended';
    monthlyPrice: number;
    maxUsers: number;
    startDate: string;
    endDate: string;
  }>({
    tenantId: '',
    plan: 'basic',
    status: 'active',
    monthlyPrice: 50000,
    maxUsers: 100,
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
  });

  useEffect(() => {
    fetchSubscriptions();
    fetchPlans();
  }, []);

  const fetchPlans = async () => {
    try {
      const response = await plansApi.getAll();
      setPlans(response || []);
    } catch (err: any) {
      console.error('Error fetching plans:', err);
    }
  };

  const handleOpenPlanCreate = () => {
    setPlanModalMode('create');
    setSelectedPlan(null);
    setPlanFormData({
      name: '',
      description: '',
      monthlyPrice: 50000,
      maxUsers: 100,
      maxStudents: 500,
      features: ['LMS', 'Support Email'],
      isActive: true,
      displayOrder: plans.length + 1,
    });
    setPlanFormError(null);
    setShowPlansModal(true);
  };

  const handleOpenPlanEdit = (plan: any) => {
    setPlanModalMode('edit');
    setSelectedPlan(plan);
    // Normalize features to always be an array (handles JSON object from API)
    const normalizedFeatures = Array.isArray(plan.features) 
      ? plan.features 
      : (plan.fonctionnalites && Array.isArray(plan.fonctionnalites) ? plan.fonctionnalites : []);
    setPlanFormData({
      name: plan.name,
      description: plan.description || '',
      monthlyPrice: plan.monthlyPrice,
      maxUsers: plan.maxUsers,
      maxStudents: plan.maxStudents || plan.max_etudiants || 500,
      features: normalizedFeatures,
      isActive: plan.isActive,
      displayOrder: plan.displayOrder,
    });
    setPlanFormError(null);
    setShowPlansModal(true);
  };

  const handlePlanSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsPlanSubmitting(true);
    setPlanFormError(null);

    try {
      if (!planFormData.name) {
        throw new Error('Le nom est obligatoire');
      }

      const dto = {
        name: planFormData.name,
        description: planFormData.description,
        monthlyPrice: planFormData.monthlyPrice,
        maxUsers: planFormData.maxUsers,
        maxStudents: planFormData.maxStudents,
        features: planFormData.features,
        isActive: planFormData.isActive,
        displayOrder: planFormData.displayOrder,
      };

      if (planModalMode === 'edit' && selectedPlan) {
        await plansApi.update(selectedPlan.id, dto);
      } else {
        await plansApi.create(dto);
      }

      setShowPlansModal(false);
      fetchPlans();
    } catch (err: any) {
      console.error('Error saving plan:', err);
      setPlanFormError(err.response?.data?.message || err.message || 'Erreur lors de la sauvegarde');
    } finally {
      setIsPlanSubmitting(false);
    }
  };

  const handleDeletePlan = async (plan: any) => {
    if (!window.confirm(`Voulez-vous vraiment supprimer le plan ${plan.name} ?`)) {
      return;
    }

    try {
      await plansApi.delete(plan.id);
      fetchPlans();
    } catch (err: any) {
      console.error('Error deleting plan:', err);
      alert(err.response?.data?.message || 'Erreur lors de la suppression');
    }
  };

  const fetchSubscriptions = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await tenantsApi.getSubscriptions();
      setSubscriptions(response.subscriptions || []);
      setStats(response.stats || { totalRevenue: 0, activeSubscriptions: 0, expiringSoon: 0, suspended: 0 });
    } catch (err: any) {
      console.error('Error fetching subscriptions:', err);
      setError(err.response?.data?.message || 'Erreur lors du chargement des abonnements');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenCreate = () => {
    setModalMode('create');
    setSelectedSubscription(null);
    setFormData({
      tenantId: '',
      plan: 'basic',
      status: 'active',
      monthlyPrice: 50000,
      maxUsers: 100,
      startDate: new Date().toISOString().split('T')[0],
      endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    });
    setFormError(null);
    setShowModal(true);
  };

  const handleOpenEdit = (sub: Subscription) => {
    setModalMode('edit');
    setSelectedSubscription(sub);
    setFormData({
      tenantId: sub.tenantId,
      plan: sub.plan,
      status: sub.status,
      monthlyPrice: sub.monthlyPrice,
      maxUsers: sub.maxUsers,
      startDate: new Date(sub.startDate).toISOString().split('T')[0],
      endDate: new Date(sub.endDate).toISOString().split('T')[0],
    });
    setFormError(null);
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setFormError(null);

    try {
      if (!formData.tenantId) {
        throw new Error('Veuillez sélectionner une université');
      }

      const dto = {
        plan: formData.plan,
        status: formData.status,
        monthlyPrice: formData.monthlyPrice,
        maxUsers: formData.maxUsers,
        startDate: formData.startDate,
        endDate: formData.endDate,
      };

      // Find the tenant ID by slug
      const tenant = subscriptions.find(s => s.tenantId === formData.tenantId);
      if (!tenant && modalMode === 'edit' && selectedSubscription) {
        await tenantsApi.updateSubscription(selectedSubscription.id, dto);
      } else if (tenant) {
        await tenantsApi.updateSubscription(tenant.id, dto);
      } else {
        throw new Error('Université non trouvée');
      }

      setShowModal(false);
      fetchSubscriptions();
    } catch (err: any) {
      console.error('Error saving subscription:', err);
      setFormError(err.message || 'Erreur lors de la sauvegarde');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (sub: Subscription) => {
    if (!window.confirm(`Voulez-vous vraiment résilier l'abonnement de ${sub.tenantName} ?`)) {
      return;
    }

    try {
      await tenantsApi.removeSubscription(sub.id);
      fetchSubscriptions();
    } catch (err: any) {
      console.error('Error removing subscription:', err);
      setError(err.response?.data?.message || 'Erreur lors de la suppression');
    }
  };

  const getStatusBadge = (status: string) => {
    const styles = {
      active: { bg: '#D1FAE5', color: '#059669', border: 'rgba(5,150,105,0.3)' },
      expired: { bg: '#FEE2E2', color: '#DC2626', border: 'rgba(220,38,38,0.3)' },
      suspended: { bg: '#FEF3C7', color: '#D97706', border: 'rgba(217,119,6,0.3)' },
    };
    const labels = { active: 'Actif', expired: 'Expiré', suspended: 'Suspendu' };
    const style = styles[status as keyof typeof styles];
    return (
      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', padding: '4px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: 600, background: style.bg, color: style.color, border: `1px solid ${style.border}` }}>
        <span style={{ width: '5px', height: '5px', borderRadius: '50%', background: style.color }} />
        {labels[status as keyof typeof labels]}
      </span>
    );
  };

  const getDaysRemaining = (endDate: string) => {
    const days = Math.floor((new Date(endDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
    if (days < 0) return 'Expiré';
    if (days === 0) return 'Expire aujourd\'hui';
    if (days === 1) return '1 jour restant';
    return `${days} jours restants`;
  };

  return (
    <div className="min-h-screen" style={{ background: '#F5F5F0' }}>
      {/* Topbar - Style Maquette */}
      <header style={{ background: '#FAFAF7', borderBottom: '1px solid rgba(15,25,35,0.10)', padding: '0 28px', height: '56px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'sticky', top: 0, zIndex: 50 }}>
        <h1 style={{ fontSize: '18px', fontWeight: 600, color: '#0F1923', letterSpacing: '-0.01em' }}>Abonnements</h1>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <button 
            onClick={handleOpenPlanCreate}
            style={{ padding: '7px 14px', fontSize: '12px', fontWeight: 500, color: '#5A6472', background: '#F5F5F0', border: '1px solid rgba(15,25,35,0.10)', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}
          >
            <Settings style={{ width: 14, height: 14 }} /> Plans
          </button>
          <button 
            onClick={handleOpenCreate}
            style={{ padding: '7px 14px', fontSize: '12px', fontWeight: 500, color: '#fff', background: '#2563eb', border: 'none', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}
          >
            <Plus style={{ width: 14, height: 14 }} /> Ajouter
          </button>
          <button style={{ padding: '7px 12px', fontSize: '12px', fontWeight: 500, color: '#5A6472', background: '#F5F5F0', border: '1px solid rgba(15,25,35,0.10)', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}>
            <Filter style={{ width: 14, height: 14 }} /> Filtrer
          </button>
          <button style={{ padding: '7px 12px', fontSize: '12px', fontWeight: 500, color: '#5A6472', background: '#F5F5F0', border: '1px solid rgba(15,25,35,0.10)', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}>
            <Download style={{ width: 14, height: 14 }} /> Exporter
          </button>
        </div>
      </header>

      <div style={{ padding: '24px 28px' }}>
        {loading && (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px' }}>
            <Loader2 style={{ width: 24, height: 24, color: '#2563eb', animation: 'spin 1s linear infinite' }} />
          </div>
        )}
        
        {error && (
          <div style={{ marginBottom: '16px', padding: '12px 16px', background: '#FEE2E2', border: '1px solid rgba(220,38,38,0.20)', borderRadius: '10px' }}>
            <p style={{ fontSize: '13px', color: '#DC2626' }}>{error}</p>
          </div>
        )}

        {!loading && (
          <>
            {/* KPI Strip */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px', marginBottom: '24px' }}>
              <KpiCard icon={<DollarSign style={{ width: 16, height: 16, color: '#059669' }} />} iconBg="#D1FAE5" trend="Mensuel" trendColor="#059669" value={`${stats.totalRevenue.toLocaleString()} Ar`} label="Revenus mensuels" />
              <KpiCard icon={<CheckCircle style={{ width: 16, height: 16, color: '#2563eb' }} />} iconBg="#DBEAFE" trend="Actifs" trendColor="#2563eb" value={stats.activeSubscriptions} label="Universités" />
              <KpiCard icon={<Calendar style={{ width: 16, height: 16, color: '#D97706' }} />} iconBg="#FEF3C7" trend="Alerte" trendColor="#D97706" value={stats.expiringSoon} label="Expirent bientôt" />
              <KpiCard icon={<XCircle style={{ width: 16, height: 16, color: '#DC2626' }} />} iconBg="#FEE2E2" trend="Suspendus" trendColor="#DC2626" value={stats.suspended} label="À réactiver" />
            </div>

        {/* Card - Liste des Abonnements */}
        <div style={{ background: '#FAFAF7', border: '1px solid rgba(15,25,35,0.10)', borderRadius: '14px', overflow: 'hidden' }}>
          <div style={{ padding: '18px 20px', borderBottom: '1px solid rgba(15,25,35,0.10)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <h2 style={{ fontSize: '14px', fontWeight: 600, color: '#0F1923' }}>Liste des Abonnements</h2>
            <span style={{ fontSize: '12px', color: '#9AA3AE' }}>{subscriptions.length} universités</span>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr>
                  <th style={{ fontSize: '10px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.07em', color: '#9AA3AE', textAlign: 'left', padding: '12px 16px', borderBottom: '1px solid rgba(15,25,35,0.10)' }}>Université</th>
                  <th style={{ fontSize: '10px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.07em', color: '#9AA3AE', textAlign: 'left', padding: '12px 16px', borderBottom: '1px solid rgba(15,25,35,0.10)' }}>Plan</th>
                  <th style={{ fontSize: '10px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.07em', color: '#9AA3AE', textAlign: 'left', padding: '12px 16px', borderBottom: '1px solid rgba(15,25,35,0.10)' }}>Status</th>
                  <th style={{ fontSize: '10px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.07em', color: '#9AA3AE', textAlign: 'left', padding: '12px 16px', borderBottom: '1px solid rgba(15,25,35,0.10)' }}>Utilisateurs</th>
                  <th style={{ fontSize: '10px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.07em', color: '#9AA3AE', textAlign: 'left', padding: '12px 16px', borderBottom: '1px solid rgba(15,25,35,0.10)' }}>Prix/Mois</th>
                  <th style={{ fontSize: '10px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.07em', color: '#9AA3AE', textAlign: 'left', padding: '12px 16px', borderBottom: '1px solid rgba(15,25,35,0.10)' }}>Expiration</th>
                  <th style={{ fontSize: '10px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.07em', color: '#9AA3AE', textAlign: 'right', padding: '12px 16px', borderBottom: '1px solid rgba(15,25,35,0.10)' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {subscriptions.map((sub) => (
                  <tr key={sub.id} style={{ borderBottom: '1px solid rgba(15,25,35,0.04)' }}>
                    <td style={{ padding: '12px 16px', verticalAlign: 'middle' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: '#F5F5F0', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px', fontWeight: 700, color: '#5A6472' }}>{sub.tenantName.charAt(0)}</div>
                        <div>
                          <div style={{ fontSize: '13px', fontWeight: 600, color: '#0F1923' }}>{sub.tenantName}</div>
                          <div style={{ fontSize: '11px', color: '#9AA3AE' }}>{sub.tenantId}</div>
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: '12px 16px', verticalAlign: 'middle' }}>
                      {(() => {
                        const planInfo = plans.find(p => p.code === sub.plan);
                        return (
                          <span style={{ padding: '4px 12px', fontSize: '11px', fontWeight: 600, borderRadius: '20px', color: '#fff', backgroundColor: planInfo?.color || '#64748b' }}>
                            {planInfo?.name || sub.plan}
                          </span>
                        );
                      })()}
                    </td>
                    <td style={{ padding: '12px 16px', verticalAlign: 'middle' }}>{getStatusBadge(sub.status)}</td>
                    <td style={{ padding: '12px 16px', verticalAlign: 'middle' }}>
                      <div style={{ fontSize: '12px', fontWeight: 600, color: '#0F1923' }}>{sub.currentUsers} <span style={{ color: '#9AA3AE' }}>/ {sub.maxUsers}</span></div>
                      <div style={{ width: '80px', height: '4px', background: '#F5F5F0', borderRadius: '2px', marginTop: '4px' }}>
                        <div style={{ height: '4px', borderRadius: '2px', background: '#2563eb', width: `${(sub.currentUsers / sub.maxUsers) * 100}%` }} />
                      </div>
                    </td>
                    <td style={{ padding: '12px 16px', verticalAlign: 'middle', fontSize: '12px', fontWeight: 600, color: '#0F1923' }}>{sub.monthlyPrice.toLocaleString()} <span style={{ fontWeight: 400, color: '#9AA3AE' }}>Ar</span></td>
                    <td style={{ padding: '12px 16px', verticalAlign: 'middle' }}>
                      <div style={{ fontSize: '12px', fontWeight: 600, color: '#0F1923' }}>{new Date(sub.endDate).toLocaleDateString('fr-FR')}</div>
                      <div style={{ fontSize: '11px', color: '#9AA3AE' }}>{getDaysRemaining(sub.endDate)}</div>
                    </td>
                    <td style={{ padding: '12px 16px', verticalAlign: 'middle', textAlign: 'right' }}>
                      <button 
                        onClick={() => handleOpenEdit(sub)}
                        style={{ width: '28px', height: '28px', borderRadius: '6px', border: 'none', background: '#DBEAFE', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', color: '#2563eb', marginRight: '4px' }}
                        title="Modifier"
                      >
                        <Pencil style={{ width: 14, height: 14 }} />
                      </button>
                      <button 
                        onClick={() => handleDelete(sub)}
                        style={{ width: '28px', height: '28px', borderRadius: '6px', border: 'none', background: '#FEE2E2', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', color: '#DC2626' }}
                        title="Résilier"
                      >
                        <Trash2 style={{ width: 14, height: 14 }} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Plans Overview - Dynamically linked to existing plans */}
            <div style={{ marginTop: '24px', display: 'grid', gridTemplateColumns: `repeat(${Math.min(plans.length, 4)}, 1fr)`, gap: '12px' }}>
              {plans.filter(p => p.isActive).sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0)).map((plan) => (
                <div key={plan.id} style={{ background: '#FAFAF7', border: '1px solid rgba(15,25,35,0.10)', borderRadius: '12px', padding: '16px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                    <h3 style={{ fontSize: '14px', fontWeight: 700, color: '#2563eb' }}>{plan.name}</h3>
                    <div style={{ width: '28px', height: '28px', borderRadius: '6px', background: '#DBEAFE', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <span style={{ fontSize: '11px', fontWeight: 700, color: '#2563eb' }}>{plan.displayOrder || '-'}</span>
                    </div>
                  </div>
                  <p style={{ fontSize: '22px', fontWeight: 700, color: '#0F1923', lineHeight: 1 }}>{(plan.monthlyPrice || 0).toLocaleString()} <span style={{ fontSize: '12px', fontWeight: 500, color: '#9AA3AE' }}>Ar</span></p>
                  <p style={{ fontSize: '11px', color: '#9AA3AE', marginTop: '4px' }}>par mois</p>
                  {plan.maxUsers && (
                    <p style={{ fontSize: '11px', color: '#5A6472', marginTop: '8px' }}>Jusqu'à {plan.maxUsers} utilisateurs</p>
                  )}
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Modal - Ajouter/Modifier Abonnement */}
      {showModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(15,25,35,0.50)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }}>
          <div style={{ background: '#FAFAF7', borderRadius: '14px', width: '100%', maxWidth: '480px', maxHeight: '90vh', overflow: 'auto', margin: '20px' }}>
            <div style={{ padding: '20px 24px', borderBottom: '1px solid rgba(15,25,35,0.10)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <h2 style={{ fontSize: '16px', fontWeight: 600, color: '#0F1923' }}>
                {modalMode === 'create' ? 'Nouvel Abonnement' : 'Modifier Abonnement'}
              </h2>
              <button 
                onClick={() => setShowModal(false)}
                style={{ width: '28px', height: '28px', borderRadius: '6px', border: 'none', background: '#F5F5F0', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#5A6472' }}
              >
                <X style={{ width: 16, height: 16 }} />
              </button>
            </div>

            <form onSubmit={handleSubmit} style={{ padding: '24px' }}>
              {formError && (
                <div style={{ marginBottom: '16px', padding: '12px 16px', background: '#FEE2E2', border: '1px solid rgba(220,38,38,0.20)', borderRadius: '10px' }}>
                  <p style={{ fontSize: '13px', color: '#DC2626' }}>{formError}</p>
                </div>
              )}

              {/* Université */}
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 500, color: '#5A6472', marginBottom: '6px' }}>
                  Université <span style={{ color: '#DC2626' }}>*</span>
                </label>
                <select
                  value={formData.tenantId}
                  onChange={(e) => setFormData({ ...formData, tenantId: e.target.value })}
                  disabled={modalMode === 'edit'}
                  required
                  style={{ width: '100%', padding: '10px 14px', fontSize: '13px', border: '1px solid rgba(15,25,35,0.15)', borderRadius: '10px', background: modalMode === 'edit' ? '#EEECEA' : '#fff', color: '#0F1923' }}
                >
                  <option value="">Sélectionner une université</option>
                  {subscriptions.map(sub => (
                    <option key={sub.id} value={sub.tenantId}>
                      {sub.tenantName}
                    </option>
                  ))}
                </select>
              </div>

              {/* Plan */}
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 500, color: '#5A6472', marginBottom: '6px' }}>
                  Plan d'abonnement
                </label>
                <select
                  value={formData.plan}
                  onChange={(e) => setFormData({ ...formData, plan: e.target.value as any })}
                  style={{ width: '100%', padding: '10px 14px', fontSize: '13px', border: '1px solid rgba(15,25,35,0.15)', borderRadius: '10px', background: '#fff', color: '#0F1923' }}
                >
                  <option value="basic">Basic</option>
                  <option value="standard">Standard</option>
                  <option value="premium">Premium</option>
                  <option value="enterprise">Enterprise</option>
                </select>
              </div>

              {/* Statut */}
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 500, color: '#5A6472', marginBottom: '6px' }}>
                  Statut
                </label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                  style={{ width: '100%', padding: '10px 14px', fontSize: '13px', border: '1px solid rgba(15,25,35,0.15)', borderRadius: '10px', background: '#fff', color: '#0F1923' }}
                >
                  <option value="active">Actif</option>
                  <option value="suspended">Suspendu</option>
                  <option value="expired">Expiré</option>
                </select>
              </div>

              {/* Prix et Utilisateurs */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '16px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 500, color: '#5A6472', marginBottom: '6px' }}>
                    Prix mensuel (Ar)
                  </label>
                  <input
                    type="number"
                    value={formData.monthlyPrice}
                    onChange={(e) => setFormData({ ...formData, monthlyPrice: parseInt(e.target.value) || 0 })}
                    min="0"
                    style={{ width: '100%', padding: '10px 14px', fontSize: '13px', border: '1px solid rgba(15,25,35,0.15)', borderRadius: '10px', background: '#fff', color: '#0F1923' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 500, color: '#5A6472', marginBottom: '6px' }}>
                    Max utilisateurs
                  </label>
                  <input
                    type="number"
                    value={formData.maxUsers}
                    onChange={(e) => setFormData({ ...formData, maxUsers: parseInt(e.target.value) || 0 })}
                    min="1"
                    style={{ width: '100%', padding: '10px 14px', fontSize: '13px', border: '1px solid rgba(15,25,35,0.15)', borderRadius: '10px', background: '#fff', color: '#0F1923' }}
                  />
                </div>
              </div>

              {/* Dates */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '24px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 500, color: '#5A6472', marginBottom: '6px' }}>
                    Date de début
                  </label>
                  <input
                    type="date"
                    value={formData.startDate}
                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                    style={{ width: '100%', padding: '10px 14px', fontSize: '13px', border: '1px solid rgba(15,25,35,0.15)', borderRadius: '10px', background: '#fff', color: '#0F1923' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 500, color: '#5A6472', marginBottom: '6px' }}>
                    Date de fin
                  </label>
                  <input
                    type="date"
                    value={formData.endDate}
                    onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                    style={{ width: '100%', padding: '10px 14px', fontSize: '13px', border: '1px solid rgba(15,25,35,0.15)', borderRadius: '10px', background: '#fff', color: '#0F1923' }}
                  />
                </div>
              </div>

              {/* Boutons */}
              <div style={{ display: 'flex', gap: '10px' }}>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  style={{ flex: 1, padding: '10px', fontSize: '13px', fontWeight: 500, color: '#5A6472', background: '#F5F5F0', border: '1px solid rgba(15,25,35,0.10)', borderRadius: '10px', cursor: 'pointer' }}
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  style={{ flex: 1, padding: '10px', fontSize: '13px', fontWeight: 500, color: '#fff', background: '#2563eb', border: 'none', borderRadius: '10px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', opacity: isSubmitting ? 0.7 : 1 }}
                >
                  {isSubmitting ? (
                    <Loader2 style={{ width: 14, height: 14, animation: 'spin 1s linear infinite' }} />
                  ) : (
                    <CheckCircle style={{ width: 14, height: 14 }} />
                  )}
                  {modalMode === 'create' ? 'Créer' : 'Mettre à jour'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal - Gestion des Plans */}
      {showPlansModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(15,25,35,0.50)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }}>
          <div style={{ background: '#FAFAF7', borderRadius: '14px', width: '100%', maxWidth: '560px', maxHeight: '90vh', overflow: 'auto', margin: '20px' }}>
            <div style={{ padding: '20px 24px', borderBottom: '1px solid rgba(15,25,35,0.10)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <h2 style={{ fontSize: '16px', fontWeight: 600, color: '#0F1923' }}>
                {planModalMode === 'create' ? 'Nouveau Plan' : 'Modifier Plan'}
              </h2>
              <button 
                onClick={() => setShowPlansModal(false)}
                style={{ width: '28px', height: '28px', borderRadius: '6px', border: 'none', background: '#F5F5F0', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#5A6472' }}
              >
                <X style={{ width: 16, height: 16 }} />
              </button>
            </div>

            <form onSubmit={handlePlanSubmit} style={{ padding: '24px' }}>
              {planFormError && (
                <div style={{ marginBottom: '16px', padding: '12px 16px', background: '#FEE2E2', border: '1px solid rgba(220,38,38,0.20)', borderRadius: '10px' }}>
                  <p style={{ fontSize: '13px', color: '#DC2626' }}>{planFormError}</p>
                </div>
              )}

              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 500, color: '#5A6472', marginBottom: '6px' }}>
                  Nom <span style={{ color: '#DC2626' }}>*</span>
                </label>
                <input
                  type="text"
                  value={planFormData.name}
                  onChange={(e) => setPlanFormData({ ...planFormData, name: e.target.value })}
                  placeholder="ex: Basic"
                  required
                  style={{ width: '100%', padding: '10px 14px', fontSize: '13px', border: '1px solid rgba(15,25,35,0.15)', borderRadius: '10px', background: '#fff', color: '#0F1923' }}
                />
              </div>

              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 500, color: '#5A6472', marginBottom: '6px' }}>
                  Description
                </label>
                <textarea
                  value={planFormData.description}
                  onChange={(e) => setPlanFormData({ ...planFormData, description: e.target.value })}
                  placeholder="Description du plan..."
                  rows={3}
                  style={{ width: '100%', padding: '10px 14px', fontSize: '13px', border: '1px solid rgba(15,25,35,0.15)', borderRadius: '10px', background: '#fff', color: '#0F1923', resize: 'vertical' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px', marginBottom: '16px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 500, color: '#5A6472', marginBottom: '6px' }}>
                    Prix mensuel (Ar)
                  </label>
                  <input
                    type="number"
                    value={planFormData.monthlyPrice}
                    onChange={(e) => setPlanFormData({ ...planFormData, monthlyPrice: parseInt(e.target.value) || 0 })}
                    min="0"
                    required
                    style={{ width: '100%', padding: '10px 14px', fontSize: '13px', border: '1px solid rgba(15,25,35,0.15)', borderRadius: '10px', background: '#fff', color: '#0F1923' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 500, color: '#5A6472', marginBottom: '6px' }}>
                    Max utilisateurs
                  </label>
                  <input
                    type="number"
                    value={planFormData.maxUsers}
                    onChange={(e) => setPlanFormData({ ...planFormData, maxUsers: parseInt(e.target.value) || 0 })}
                    min="1"
                    required
                    style={{ width: '100%', padding: '10px 14px', fontSize: '13px', border: '1px solid rgba(15,25,35,0.15)', borderRadius: '10px', background: '#fff', color: '#0F1923' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 500, color: '#5A6472', marginBottom: '6px' }}>
                    Max étudiants
                  </label>
                  <input
                    type="number"
                    value={planFormData.maxStudents}
                    onChange={(e) => setPlanFormData({ ...planFormData, maxStudents: parseInt(e.target.value) || 0 })}
                    min="1"
                    style={{ width: '100%', padding: '10px 14px', fontSize: '13px', border: '1px solid rgba(15,25,35,0.15)', borderRadius: '10px', background: '#fff', color: '#0F1923' }}
                  />
                </div>
              </div>

              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 500, color: '#5A6472', marginBottom: '6px' }}>
                  Fonctionnalités (séparées par des virgules)
                </label>
                <input
                  type="text"
                  value={Array.isArray(planFormData.features) ? planFormData.features.join(', ') : ''}
                  onChange={(e) => setPlanFormData({ ...planFormData, features: e.target.value.split(',').map(f => f.trim()).filter(f => f) })}
                  placeholder="LMS, Support Email, Rapports avancés..."
                  style={{ width: '100%', padding: '10px 14px', fontSize: '13px', border: '1px solid rgba(15,25,35,0.15)', borderRadius: '10px', background: '#fff', color: '#0F1923' }}
                />
              </div>

              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 500, color: '#5A6472', marginBottom: '6px' }}>
                  Ordre d'affichage
                </label>
                <input
                  type="number"
                  value={planFormData.displayOrder}
                  onChange={(e) => setPlanFormData({ ...planFormData, displayOrder: parseInt(e.target.value) || 0 })}
                  min="0"
                  style={{ width: '100%', padding: '10px 14px', fontSize: '13px', border: '1px solid rgba(15,25,35,0.15)', borderRadius: '10px', background: '#fff', color: '#0F1923' }}
                />
              </div>

              <div style={{ marginBottom: '24px' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={planFormData.isActive}
                    onChange={(e) => setPlanFormData({ ...planFormData, isActive: e.target.checked })}
                    style={{ width: '18px', height: '18px', accentColor: '#2563eb' }}
                  />
                  <span style={{ fontSize: '13px', color: '#0F1923' }}>Plan actif</span>
                </label>
              </div>

              <div style={{ display: 'flex', gap: '10px' }}>
                <button
                  type="button"
                  onClick={() => setShowPlansModal(false)}
                  style={{ flex: 1, padding: '10px', fontSize: '13px', fontWeight: 500, color: '#5A6472', background: '#F5F5F0', border: '1px solid rgba(15,25,35,0.10)', borderRadius: '10px', cursor: 'pointer' }}
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={isPlanSubmitting}
                  style={{ flex: 1, padding: '10px', fontSize: '13px', fontWeight: 500, color: '#fff', background: '#2563eb', border: 'none', borderRadius: '10px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', opacity: isPlanSubmitting ? 0.7 : 1 }}
                >
                  {isPlanSubmitting ? (
                    <Loader2 style={{ width: 14, height: 14, animation: 'spin 1s linear infinite' }} />
                  ) : (
                    <CheckCircle style={{ width: 14, height: 14 }} />
                  )}
                  {planModalMode === 'create' ? 'Créer' : 'Mettre à jour'}
                </button>
              </div>
            </form>

            {/* Liste des plans existants */}
            <div style={{ padding: '0 24px 24px' }}>
              <h3 style={{ fontSize: '14px', fontWeight: 600, color: '#0F1923', marginBottom: '12px' }}>Plans existants</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {plans.length === 0 ? (
                  <p style={{ fontSize: '13px', color: '#9AA3AE', textAlign: 'center', padding: '20px' }}>Aucun plan configuré</p>
                ) : (
                  plans.map((plan) => (
                    <div key={plan.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px', background: '#fff', border: '1px solid rgba(15,25,35,0.10)', borderRadius: '10px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{ width: '24px', height: '24px', borderRadius: '6px', background: '#DBEAFE', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', fontWeight: 600, color: '#2563eb' }}>
                          {plan.displayOrder || '-'}
                        </div>
                        <div>
                          <div style={{ fontSize: '13px', fontWeight: 600, color: '#0F1923' }}>{plan.name}</div>
                          <div style={{ fontSize: '11px', color: '#9AA3AE' }}>{plan.maxStudents || plan.max_etudiants || '-'} étudiants • {plan.monthlyPrice?.toLocaleString()} Ar/mois</div>
                        </div>
                      </div>
                      <div style={{ display: 'flex', gap: '4px' }}>
                        <button
                          onClick={() => handleOpenPlanEdit(plan)}
                          style={{ width: '28px', height: '28px', borderRadius: '6px', border: 'none', background: '#DBEAFE', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#2563eb' }}
                          title="Modifier"
                        >
                          <Pencil style={{ width: 14, height: 14 }} />
                        </button>
                        <button
                          onClick={() => handleDeletePlan(plan)}
                          style={{ width: '28px', height: '28px', borderRadius: '6px', border: 'none', background: '#FEE2E2', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#DC2626' }}
                          title="Supprimer"
                        >
                          <Trash2 style={{ width: 14, height: 14 }} />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Made with Bob
