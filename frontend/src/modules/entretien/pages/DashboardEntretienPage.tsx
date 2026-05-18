import React from 'react';
import { useDashboardEntretien } from '../hooks';

export default function DashboardEntretienPage() {
  const { data: kpi, isLoading, error } = useDashboardEntretien();

  if (isLoading) {
    return (
      <div className="container-fluid py-4">
        <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '400px' }}>
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Chargement...</span>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container-fluid py-4">
        <div className="alert alert-danger">
          <i className="bi bi-exclamation-triangle me-2"></i>
          Erreur lors du chargement du dashboard
        </div>
      </div>
    );
  }

  return (
    <div className="container-fluid py-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="mb-0">
          <i className="bi bi-speedometer2 me-2"></i>
          Dashboard Entretien
        </h2>
        <span className="badge bg-secondary">{new Date().toLocaleDateString('fr-FR')}</span>
      </div>

      {/* KPI Row 1 */}
      <div className="row g-3 mb-4">
        <div className="col-md-3">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-start">
                <div>
                  <p className="text-muted mb-1 small">Tickets Ouverts</p>
                  <h3 className="mb-0">{kpi?.tickets_ouverts || 0}</h3>
                </div>
                <div className="bg-primary bg-opacity-10 p-2 rounded">
                  <i className="bi bi-ticket-perforated text-primary fs-4"></i>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="col-md-3">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-start">
                <div>
                  <p className="text-muted mb-1 small">Tickets Urgents</p>
                  <h3 className="mb-0 text-danger">{kpi?.tickets_urgents_non_resolus || 0}</h3>
                </div>
                <div className="bg-danger bg-opacity-10 p-2 rounded">
                  <i className="bi bi-exclamation-triangle text-danger fs-4"></i>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="col-md-3">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-start">
                <div>
                  <p className="text-muted mb-1 small">Articles en Alerte</p>
                  <h3 className="mb-0 text-warning">{kpi?.articles_sous_seuil || 0}</h3>
                </div>
                <div className="bg-warning bg-opacity-10 p-2 rounded">
                  <i className="bi bi-box-seam text-warning fs-4"></i>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="col-md-3">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-start">
                <div>
                  <p className="text-muted mb-1 small">Réservations en Attente</p>
                  <h3 className="mb-0">{kpi?.reservations_en_attente || 0}</h3>
                </div>
                <div className="bg-info bg-opacity-10 p-2 rounded">
                  <i className="bi bi-calendar-check text-info fs-4"></i>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* KPI Row 2 */}
      <div className="row g-3 mb-4">
        <div className="col-md-3">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-start">
                <div>
                  <p className="text-muted mb-1 small">Plannings Actifs Aujourd'hui</p>
                  <h3 className="mb-0">{kpi?.plannings_actifs_aujourd_hui || 0}</h3>
                </div>
                <div className="bg-success bg-opacity-10 p-2 rounded">
                  <i className="bi bi-calendar3 text-success fs-4"></i>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="col-md-3">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-start">
                <div>
                  <p className="text-muted mb-1 small">Taux d'Exécution (30j)</p>
                  <h3 className="mb-0">{kpi?.taux_execution_30j || 0}%</h3>
                </div>
                <div className="bg-primary bg-opacity-10 p-2 rounded">
                  <i className="bi bi-graph-up text-primary fs-4"></i>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="col-md-6">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-start">
                <div>
                  <p className="text-muted mb-1 small">Dépenses Entretien ce Mois</p>
                  <h3 className="mb-0">
                    {new Intl.NumberFormat('fr-FR', {
                      style: 'currency',
                      currency: 'XAF',
                    }).format(kpi?.depenses_entretien_mois || 0)}
                  </h3>
                </div>
                <div className="bg-secondary bg-opacity-10 p-2 rounded">
                  <i className="bi bi-cash-stack text-secondary fs-4"></i>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="row g-3">
        <div className="col-md-12">
          <div className="card border-0 shadow-sm">
            <div className="card-header bg-white">
              <h5 className="mb-0">Actions Rapides</h5>
            </div>
            <div className="card-body">
              <div className="row g-3">
                <div className="col-md-3">
                  <a href="/entretien/tickets" className="btn btn-outline-primary w-100">
                    <i className="bi bi-ticket-perforated me-2"></i>
                    Gérer les Tickets
                  </a>
                </div>
                <div className="col-md-3">
                  <a href="/entretien/stock" className="btn btn-outline-warning w-100">
                    <i className="bi bi-box-seam me-2"></i>
                    Gérer le Stock
                  </a>
                </div>
                <div className="col-md-3">
                  <a href="/entretien/planning" className="btn btn-outline-success w-100">
                    <i className="bi bi-calendar3 me-2"></i>
                    Planning Entretien
                  </a>
                </div>
                <div className="col-md-3">
                  <a href="/entretien/reservations" className="btn btn-outline-info w-100">
                    <i className="bi bi-calendar-check me-2"></i>
                    Réservations
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Made with Bob
