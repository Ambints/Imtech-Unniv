import React, { useState, useEffect } from 'react';
import { useAuthStore } from '../../store/authStore';
import {
  TrendingUp, TrendingDown, Users, GraduationCap, DollarSign, AlertCircle,
  BookOpen, Calendar, Award, FileText, BarChart3, PieChart, Activity,
  CheckCircle, Clock, XCircle, Target, Briefcase, School
} from 'lucide-react';

interface KPI {
  label: string;
  value: string | number;
  change?: number;
  icon: React.ReactNode;
  color: string;
  bgColor: string;
}

export const PresidentDashboard: React.FC = () => {
  const { user, tenant } = useAuthStore();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate data loading
    setTimeout(() => setLoading(false), 800);
  }, []);

  const kpis: KPI[] = [
    {
      label: 'Étudiants Inscrits',
      value: '2,847',
      change: 12.5,
      icon: <Users size={24} />,
      color: '#3b82f6',
      bgColor: 'rgba(59, 130, 246, 0.1)'
    },
    {
      label: 'Taux de Réussite',
      value: '87.3%',
      change: 3.2,
      icon: <Award size={24} />,
      color: '#10b981',
      bgColor: 'rgba(16, 185, 129, 0.1)'
    },
    {
      label: 'Revenus Mensuels',
      value: '1.2M Ar',
      change: 8.7,
      icon: <DollarSign size={24} />,
      color: '#f59e0b',
      bgColor: 'rgba(245, 158, 11, 0.1)'
    },
    {
      label: 'Taux de Présence',
      value: '92.1%',
      change: -1.4,
      icon: <CheckCircle size={24} />,
      color: '#8b5cf6',
      bgColor: 'rgba(139, 92, 246, 0.1)'
    },
    {
      label: 'Enseignants Actifs',
      value: '156',
      change: 5.3,
      icon: <GraduationCap size={24} />,
      color: '#ec4899',
      bgColor: 'rgba(236, 72, 153, 0.1)'
    },
    {
      label: 'Parcours Actifs',
      value: '24',
      change: 0,
      icon: <BookOpen size={24} />,
      color: '#06b6d4',
      bgColor: 'rgba(6, 182, 212, 0.1)'
    }
  ];

  const recentActivities = [
    { type: 'success', message: 'Validation du budget 2026 - Département Informatique', time: 'Il y a 2h', icon: <Briefcase size={16} /> },
    { type: 'warning', message: 'Conseil de discipline - Étudiant #2847', time: 'Il y a 4h', icon: <AlertCircle size={16} /> },
    { type: 'info', message: 'Signature numérique - 45 diplômes Master', time: 'Il y a 6h', icon: <FileText size={16} /> },
    { type: 'success', message: 'Approbation partenariat - Diocèse de Kinshasa', time: 'Hier', icon: <School size={16} /> },
    { type: 'info', message: 'Validation calendrier académique 2026-2027', time: 'Il y a 2 jours', icon: <Calendar size={16} /> }
  ];

  const pendingActions = [
    { title: 'Validation Budget Département Théologie', priority: 'high', deadline: 'Aujourd\'hui' },
    { title: 'Signature Convention Université Catholique de Louvain', priority: 'high', deadline: 'Demain' },
    { title: 'Arbitrage Conseil de Discipline - Cas #2891', priority: 'medium', deadline: '3 jours' },
    { title: 'Approbation Ouverture Master en Bioéthique', priority: 'medium', deadline: '1 semaine' },
    { title: 'Validation Rapport Financier Trimestriel', priority: 'low', deadline: '2 semaines' }
  ];

  const financialOverview = [
    { label: 'Frais de Scolarité', amount: '850K', percentage: 65, color: '#3b82f6' },
    { label: 'Subventions', amount: '280K', percentage: 21, color: '#10b981' },
    { label: 'Partenariats', amount: '120K', percentage: 9, color: '#f59e0b' },
    { label: 'Autres', amount: '65K', percentage: 5, color: '#8b5cf6' }
  ];

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '60vh' }}>
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Chargement...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="container-fluid p-4">
      {/* Header */}
      <div className="mb-4">
        <h1 className="h3 fw-bold mb-2" style={{ color: '#1e293b' }}>
          Tableau de Bord Présidentiel
        </h1>
        <p className="text-muted mb-0">
          Vue d'ensemble stratégique de {tenant?.name || 'l\'université'}
        </p>
      </div>

      {/* KPIs Grid */}
      <div className="row g-3 mb-4">
        {kpis.map((kpi, idx) => (
          <div key={idx} className="col-12 col-sm-6 col-lg-4 col-xl-2">
            <div className="card border-0 shadow-sm h-100" style={{ borderRadius: 12 }}>
              <div className="card-body p-3">
                <div className="d-flex align-items-start justify-content-between mb-2">
                  <div
                    className="d-flex align-items-center justify-content-center"
                    style={{
                      width: 44,
                      height: 44,
                      borderRadius: 10,
                      background: kpi.bgColor,
                      color: kpi.color
                    }}
                  >
                    {kpi.icon}
                  </div>
                  {kpi.change !== undefined && (
                    <div
                      className="d-flex align-items-center gap-1"
                      style={{
                        fontSize: 12,
                        fontWeight: 600,
                        color: kpi.change >= 0 ? '#10b981' : '#ef4444'
                      }}
                    >
                      {kpi.change >= 0 ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                      {Math.abs(kpi.change)}%
                    </div>
                  )}
                </div>
                <div className="fw-bold mb-1" style={{ fontSize: 20, color: '#1e293b' }}>
                  {kpi.value}
                </div>
                <div className="text-muted" style={{ fontSize: 12, fontWeight: 500 }}>
                  {kpi.label}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="row g-4">
        {/* Financial Overview */}
        <div className="col-12 col-lg-8">
          <div className="card border-0 shadow-sm" style={{ borderRadius: 12 }}>
            <div className="card-body p-4">
              <div className="d-flex align-items-center justify-content-between mb-4">
                <h5 className="fw-bold mb-0" style={{ color: '#1e293b' }}>
                  <PieChart size={20} className="me-2" />
                  Aperçu Financier Mensuel
                </h5>
                <span className="badge bg-primary">Janvier 2026</span>
              </div>
              <div className="row g-3">
                {financialOverview.map((item, idx) => (
                  <div key={idx} className="col-12 col-sm-6">
                    <div className="d-flex align-items-center justify-content-between mb-2">
                      <span className="text-muted" style={{ fontSize: 13, fontWeight: 500 }}>
                        {item.label}
                      </span>
                      <span className="fw-bold" style={{ color: '#1e293b' }}>
                        {item.amount} Ar
                      </span>
                    </div>
                    <div className="progress" style={{ height: 8, borderRadius: 4 }}>
                      <div
                        className="progress-bar"
                        role="progressbar"
                        style={{ width: `${item.percentage}%`, background: item.color }}
                        aria-valuenow={item.percentage}
                        aria-valuemin={0}
                        aria-valuemax={100}
                      />
                    </div>
                    <div className="text-end mt-1" style={{ fontSize: 11, color: '#64748b' }}>
                      {item.percentage}%
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Recent Activities */}
          <div className="card border-0 shadow-sm mt-4" style={{ borderRadius: 12 }}>
            <div className="card-body p-4">
              <h5 className="fw-bold mb-3" style={{ color: '#1e293b' }}>
                <Activity size={20} className="me-2" />
                Activités Récentes
              </h5>
              <div className="d-flex flex-column gap-3">
                {recentActivities.map((activity, idx) => (
                  <div key={idx} className="d-flex align-items-start gap-3">
                    <div
                      className="d-flex align-items-center justify-content-center flex-shrink-0"
                      style={{
                        width: 32,
                        height: 32,
                        borderRadius: 8,
                        background:
                          activity.type === 'success'
                            ? 'rgba(16, 185, 129, 0.1)'
                            : activity.type === 'warning'
                            ? 'rgba(245, 158, 11, 0.1)'
                            : 'rgba(59, 130, 246, 0.1)',
                        color:
                          activity.type === 'success'
                            ? '#10b981'
                            : activity.type === 'warning'
                            ? '#f59e0b'
                            : '#3b82f6'
                      }}
                    >
                      {activity.icon}
                    </div>
                    <div className="flex-grow-1">
                      <div className="fw-medium mb-1" style={{ fontSize: 13, color: '#1e293b' }}>
                        {activity.message}
                      </div>
                      <div className="text-muted" style={{ fontSize: 11 }}>
                        {activity.time}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Pending Actions */}
        <div className="col-12 col-lg-4">
          <div className="card border-0 shadow-sm" style={{ borderRadius: 12 }}>
            <div className="card-body p-4">
              <h5 className="fw-bold mb-3" style={{ color: '#1e293b' }}>
                <Target size={20} className="me-2" />
                Actions en Attente
              </h5>
              <div className="d-flex flex-column gap-2">
                {pendingActions.map((action, idx) => (
                  <div
                    key={idx}
                    className="p-3"
                    style={{
                      background: '#f8fafc',
                      borderRadius: 10,
                      borderLeft: `3px solid ${
                        action.priority === 'high'
                          ? '#ef4444'
                          : action.priority === 'medium'
                          ? '#f59e0b'
                          : '#3b82f6'
                      }`
                    }}
                  >
                    <div className="fw-medium mb-2" style={{ fontSize: 13, color: '#1e293b' }}>
                      {action.title}
                    </div>
                    <div className="d-flex align-items-center justify-content-between">
                      <span
                        className="badge"
                        style={{
                          background:
                            action.priority === 'high'
                              ? 'rgba(239, 68, 68, 0.1)'
                              : action.priority === 'medium'
                              ? 'rgba(245, 158, 11, 0.1)'
                              : 'rgba(59, 130, 246, 0.1)',
                          color:
                            action.priority === 'high'
                              ? '#ef4444'
                              : action.priority === 'medium'
                              ? '#f59e0b'
                              : '#3b82f6',
                          fontSize: 10,
                          fontWeight: 600
                        }}
                      >
                        {action.priority === 'high'
                          ? 'URGENT'
                          : action.priority === 'medium'
                          ? 'MOYEN'
                          : 'FAIBLE'}
                      </span>
                      <span className="text-muted d-flex align-items-center gap-1" style={{ fontSize: 11 }}>
                        <Clock size={12} />
                        {action.deadline}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Made with Bob
