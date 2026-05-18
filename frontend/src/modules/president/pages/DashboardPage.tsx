/**
 * Page Dashboard Président - Vue d'ensemble exécutive
 * Utilise le même design que les autres modules (RH, Surveillance, etc.)
 */

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Users, 
  TrendingUp, 
  DollarSign, 
  Briefcase, 
  AlertTriangle,
  GraduationCap,
  Award,
  UserCheck,
  FileText,
  Calendar,
  Eye,
  UserPlus,
  Scale
} from 'lucide-react';
import { useKpiDashboard } from '../hooks';

export const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const anneeId = 1; // TODO: Get from context
  const [loading, setLoading] = useState(true);
  
  const { data: kpi, isLoading: kpiLoading, error, isError } = useKpiDashboard(anneeId);

  useEffect(() => {
    setLoading(kpiLoading);
  }, [kpiLoading]);

  // Afficher un message d'erreur si les données ne peuvent pas être chargées
  if (isError) {
    return (
      <div style={{ padding: '24px', maxWidth: '1400px', margin: '0 auto' }}>
        <div className="alert alert-warning" role="alert">
          <h4 className="alert-heading">
            <AlertTriangle size={24} className="me-2" />
            Module Président en cours de configuration
          </h4>
          <p className="mb-0">
            Les tables nécessaires au module président n'ont pas encore été créées dans votre base de données.
            Veuillez contacter l'administrateur système pour initialiser le module.
          </p>
          <hr />
          <p className="mb-0 small text-muted">
            Erreur technique: {error instanceof Error ? error.message : 'Erreur inconnue'}
          </p>
        </div>
        <button
          className="btn btn-primary"
          onClick={() => navigate('/dashboard')}
        >
          Retour au tableau de bord
        </button>
      </div>
    );
  }

  const statsCards = [
    {
      label: 'Étudiants Actifs',
      value: kpi?.totalEtudiants || 0,
      icon: <Users size={20} />,
      color: '#3b82f6',
      bgColor: 'rgba(59, 130, 246, 0.1)',
    },
    {
      label: 'Taux de Réussite',
      value: `${(kpi?.tauxReussiteGlobal || 0).toFixed(1)}%`,
      icon: <Award size={20} />,
      color: '#10b981',
      bgColor: 'rgba(16, 185, 129, 0.1)',
    },
    {
      label: 'Recettes Totales',
      value: `${((kpi?.recettesTotales || 0) / 1_000_000).toFixed(2)}M Ar`,
      icon: <DollarSign size={20} />,
      color: '#8b5cf6',
      bgColor: 'rgba(139, 92, 246, 0.1)',
    },
    {
      label: 'Impayés',
      value: `${((kpi?.impayesTotal || 0) / 1_000_000).toFixed(2)}M Ar`,
      icon: <AlertTriangle size={20} />,
      color: '#ef4444',
      bgColor: 'rgba(239, 68, 68, 0.1)',
    },
    {
      label: 'Enseignants',
      value: kpi?.totalEnseignants || 0,
      icon: <UserCheck size={20} />,
      color: '#06b6d4',
      bgColor: 'rgba(6, 182, 212, 0.1)',
    },
    {
      label: 'Personnel Admin',
      value: kpi?.totalPersonnelAdmin || 0,
      icon: <Briefcase size={20} />,
      color: '#f59e0b',
      bgColor: 'rgba(245, 158, 11, 0.1)',
    },
    {
      label: 'Recrutements en Attente',
      value: kpi?.recrutementsEnAttente || 0,
      icon: <UserPlus size={20} />,
      color: '#ec4899',
      bgColor: 'rgba(236, 72, 153, 0.1)',
      route: '/president/recrutements'
    },
    {
      label: 'Incidents Ouverts',
      value: kpi?.incidentsOuverts || 0,
      icon: <AlertTriangle size={20} />,
      color: '#f97316',
      bgColor: 'rgba(249, 115, 22, 0.1)',
    },
  ];

  const menuItems = [
    {
      title: 'Vue d\'Ensemble',
      description: 'Supervision des directions',
      icon: <Eye size={24} />,
      color: '#3b82f6',
      route: '/president/supervision'
    },
    {
      title: 'Recrutements',
      description: 'Validation des recrutements stratégiques',
      icon: <UserPlus size={24} />,
      color: '#ec4899',
      route: '/president/recrutements',
      badge: kpi?.recrutementsEnAttente
    },
    {
      title: 'Investissements',
      description: 'Validation des gros investissements',
      icon: <DollarSign size={24} />,
      color: '#8b5cf6',
      route: '/president/investissements'
    },
    {
      title: 'Diplômes',
      description: 'Signature numérique des diplômes',
      icon: <GraduationCap size={24} />,
      color: '#10b981',
      route: '/president/diplomes',
      badge: kpi?.diplomesAGenerer
    },
    {
      title: 'Conventions',
      description: 'Signature des conventions',
      icon: <FileText size={24} />,
      color: '#06b6d4',
      route: '/president/conventions'
    },
    {
      title: 'Discipline',
      description: 'Arbitrage disciplinaire',
      icon: <Scale size={24} />,
      color: '#ef4444',
      route: '/president/discipline',
      badge: kpi?.conseilsDisciplineEnAttente
    },
    {
      title: 'Parcours',
      description: 'Ouverture/fermeture de parcours',
      icon: <GraduationCap size={24} />,
      color: '#f59e0b',
      route: '/president/parcours'
    },
    {
      title: 'Calendrier',
      description: 'Validation du calendrier académique',
      icon: <Calendar size={24} />,
      color: '#14b8a6',
      route: '/president/calendrier'
    },
  ];

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '400px' }}>
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Chargement...</span>
        </div>
      </div>
    );
  }

  return (
    <div style={{ padding: '24px', maxWidth: '1400px', margin: '0 auto' }}>
        {/* Header */}
        <div className="mb-4">
          <h1 className="h3 fw-bold mb-2" style={{ color: '#1e293b' }}>
            Tableau de Bord Présidentiel
          </h1>
          <p className="text-muted mb-0">
            Vue d'ensemble stratégique de l'université
          </p>
        </div>

        {/* Stats Cards */}
        <div className="row g-3 mb-4">
          {statsCards.map((card, index) => (
            <div key={index} className="col-12 col-sm-6 col-lg-3">
              <div
                className="card border-0 shadow-sm h-100"
                style={{
                  cursor: card.route ? 'pointer' : 'default',
                  transition: 'all 0.2s ease',
                }}
                onClick={() => card.route && navigate(card.route)}
                onMouseEnter={(e) => {
                  if (card.route) {
                    e.currentTarget.style.transform = 'translateY(-4px)';
                    e.currentTarget.style.boxShadow = '0 8px 16px rgba(0,0,0,0.1)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (card.route) {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.1)';
                  }
                }}
              >
                <div className="card-body">
                  <div className="d-flex justify-content-between align-items-start mb-3">
                    <div
                      className="d-flex align-items-center justify-content-center rounded"
                      style={{
                        width: 48,
                        height: 48,
                        backgroundColor: card.bgColor,
                        color: card.color,
                      }}
                    >
                      {card.icon}
                    </div>
                  </div>
                  <div className="text-muted small mb-1">{card.label}</div>
                  <div className="h4 fw-bold mb-0" style={{ color: '#1e293b' }}>
                    {card.value}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Menu Items */}
        <div className="row g-3">
          {menuItems.map((item, index) => (
            <div key={index} className="col-12 col-md-6 col-lg-4">
              <div
                className="card border-0 shadow-sm h-100 position-relative"
                style={{
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                }}
                onClick={() => navigate(item.route)}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-4px)';
                  e.currentTarget.style.boxShadow = '0 8px 16px rgba(0,0,0,0.1)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.1)';
                }}
              >
                <div className="card-body">
                  <div className="d-flex align-items-start gap-3">
                    <div
                      className="d-flex align-items-center justify-content-center rounded flex-shrink-0"
                      style={{
                        width: 56,
                        height: 56,
                        backgroundColor: `${item.color}15`,
                        color: item.color,
                      }}
                    >
                      {item.icon}
                    </div>
                    <div className="flex-grow-1">
                      <h5 className="fw-bold mb-1" style={{ color: '#1e293b' }}>
                        {item.title}
                        {item.badge && item.badge > 0 && (
                          <span
                            className="badge rounded-pill ms-2"
                            style={{
                              backgroundColor: '#ef4444',
                              fontSize: '0.75rem',
                            }}
                          >
                            {item.badge}
                          </span>
                        )}
                      </h5>
                      <p className="text-muted small mb-0">{item.description}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
      </div>
    </div>
  );
};

// Made with ❤️ by IBM Bob

// Made with Bob
