/**
 * Page Vue d'Ensemble - Supervision des directions
 */

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  BookOpen, 
  Users, 
  DollarSign, 
  Briefcase, 
  Package,
  TrendingUp,
  AlertCircle,
  CheckCircle
} from 'lucide-react';
import { useDirectionsSummary } from '../hooks';

export const DirectionsSummaryPage: React.FC = () => {
  const navigate = useNavigate();
  const anneeId = 1;
  const [loading, setLoading] = useState(true);
  
  const { data: directions, isLoading } = useDirectionsSummary(anneeId);

  useEffect(() => {
    setLoading(isLoading);
  }, [isLoading]);

  const directionCards = [
    {
      title: 'Direction Académique',
      icon: <BookOpen size={32} />,
      color: '#3b82f6',
      bgColor: 'rgba(59, 130, 246, 0.1)',
      stats: [
        { label: 'Parcours Total', value: directions?.academique?.parcoursTotal || 0 },
        { label: 'Enseignants Affectés', value: directions?.academique?.enseignantsAffectes || 0 },
        { label: 'Examens en Cours', value: directions?.academique?.examensEnCours || 0 },
        { label: 'PV en Attente', value: directions?.academique?.pvEnAttente || 0, alert: true },
      ]
    },
    {
      title: 'Direction Scolarité',
      icon: <Users size={32} />,
      color: '#10b981',
      bgColor: 'rgba(16, 185, 129, 0.1)',
      stats: [
        { label: 'Inscriptions en Cours', value: directions?.scolarite?.inscriptionsEnCours || 0 },
        { label: 'Diplômes à Générer', value: directions?.scolarite?.diplomesAGenerer || 0, alert: true },
        { label: 'Transferts en Attente', value: directions?.scolarite?.transfertsEnAttente || 0 },
      ]
    },
    {
      title: 'Direction Finances',
      icon: <DollarSign size={32} />,
      color: '#8b5cf6',
      bgColor: 'rgba(139, 92, 246, 0.1)',
      stats: [
        { label: 'Budget Consommé', value: `${directions?.finances?.budgetConsomme || 0}%` },
        { label: 'Achats en Attente', value: directions?.finances?.achatsEnAttentValidation || 0, alert: true },
        { label: 'Caisse Clôturée', value: directions?.finances?.caisseJournaliereClôturee ? 'Oui' : 'Non' },
      ]
    },
    {
      title: 'Direction RH',
      icon: <Briefcase size={32} />,
      color: '#f59e0b',
      bgColor: 'rgba(245, 158, 11, 0.1)',
      stats: [
        { label: 'Contrats sur Point Expirer', value: directions?.rh?.contratsSurPointExpirer || 0, alert: true },
        { label: 'Fiche Paie Générée', value: directions?.rh?.fichePaieGenereeMois ? 'Oui' : 'Non' },
        { label: 'Évaluations en Cours', value: directions?.rh?.evalAnnuellesEnCours || 0 },
      ]
    },
    {
      title: 'Direction Logistique',
      icon: <Package size={32} />,
      color: '#06b6d4',
      bgColor: 'rgba(6, 182, 212, 0.1)',
      stats: [
        { label: 'Tickets Maintenance Ouverts', value: directions?.logistique?.ticketsMaintenanceOuverts || 0 },
        { label: 'Stocks Alerte Critique', value: directions?.logistique?.stocksAlerteCritique || 0, alert: true },
      ]
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
          Vue d'Ensemble des Directions
        </h1>
        <p className="text-muted mb-0">
          Supervision consolidée de tous les pôles de l'université
        </p>
      </div>

      {/* Direction Cards */}
      <div className="row g-4">
        {directionCards.map((direction, index) => (
          <div key={index} className="col-12 col-lg-6">
            <div className="card border-0 shadow-sm h-100">
              <div className="card-body">
                {/* Header */}
                <div className="d-flex align-items-center gap-3 mb-4 pb-3 border-bottom">
                  <div
                    className="d-flex align-items-center justify-content-center rounded"
                    style={{
                      width: 64,
                      height: 64,
                      backgroundColor: direction.bgColor,
                      color: direction.color,
                    }}
                  >
                    {direction.icon}
                  </div>
                  <div>
                    <h5 className="fw-bold mb-0" style={{ color: '#1e293b' }}>
                      {direction.title}
                    </h5>
                  </div>
                </div>

                {/* Stats */}
                <div className="row g-3">
                  {direction.stats.map((stat, statIndex) => (
                    <div key={statIndex} className="col-6">
                      <div className="d-flex flex-column">
                        <div className="text-muted small mb-1">{stat.label}</div>
                        <div className="d-flex align-items-center gap-2">
                          <div className="h5 fw-bold mb-0" style={{ color: '#1e293b' }}>
                            {stat.value}
                          </div>
                          {stat.alert && stat.value > 0 && (
                            <AlertCircle size={16} className="text-danger" />
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Global Indicators */}
      <div className="row g-3 mt-4">
        <div className="col-12">
          <div className="card border-0 shadow-sm">
            <div className="card-body">
              <h5 className="fw-bold mb-3" style={{ color: '#1e293b' }}>
                Indicateurs Globaux
              </h5>
              <div className="row g-3">
                <div className="col-12 col-md-3">
                  <div className="d-flex align-items-center gap-3">
                    <div
                      className="d-flex align-items-center justify-content-center rounded-circle"
                      style={{
                        width: 48,
                        height: 48,
                        backgroundColor: 'rgba(16, 185, 129, 0.1)',
                        color: '#10b981',
                      }}
                    >
                      <CheckCircle size={24} />
                    </div>
                    <div>
                      <div className="text-muted small">Taux de Conformité</div>
                      <div className="h5 fw-bold mb-0 text-success">92%</div>
                    </div>
                  </div>
                </div>
                <div className="col-12 col-md-3">
                  <div className="d-flex align-items-center gap-3">
                    <div
                      className="d-flex align-items-center justify-content-center rounded-circle"
                      style={{
                        width: 48,
                        height: 48,
                        backgroundColor: 'rgba(59, 130, 246, 0.1)',
                        color: '#3b82f6',
                      }}
                    >
                      <TrendingUp size={24} />
                    </div>
                    <div>
                      <div className="text-muted small">Performance Globale</div>
                      <div className="h5 fw-bold mb-0 text-primary">Excellente</div>
                    </div>
                  </div>
                </div>
                <div className="col-12 col-md-3">
                  <div className="d-flex align-items-center gap-3">
                    <div
                      className="d-flex align-items-center justify-content-center rounded-circle"
                      style={{
                        width: 48,
                        height: 48,
                        backgroundColor: 'rgba(239, 68, 68, 0.1)',
                        color: '#ef4444',
                      }}
                    >
                      <AlertCircle size={24} />
                    </div>
                    <div>
                      <div className="text-muted small">Actions Urgentes</div>
                      <div className="h5 fw-bold mb-0 text-danger">
                        {(directions?.academique?.pvEnAttente || 0) + 
                         (directions?.scolarite?.diplomesAGenerer || 0) + 
                         (directions?.finances?.achatsEnAttentValidation || 0)}
                      </div>
                    </div>
                  </div>
                </div>
                <div className="col-12 col-md-3">
                  <div className="d-flex align-items-center gap-3">
                    <div
                      className="d-flex align-items-center justify-content-center rounded-circle"
                      style={{
                        width: 48,
                        height: 48,
                        backgroundColor: 'rgba(139, 92, 246, 0.1)',
                        color: '#8b5cf6',
                      }}
                    >
                      <Users size={24} />
                    </div>
                    <div>
                      <div className="text-muted small">Effectif Total</div>
                      <div className="h5 fw-bold mb-0" style={{ color: '#8b5cf6' }}>
                        {(directions?.academique?.enseignantsAffectes || 0) + 
                         (directions?.rh?.contratsSurPointExpirer || 0)}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Made with ❤️ by IBM Bob

// Made with Bob
