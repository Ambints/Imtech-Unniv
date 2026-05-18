import React from 'react';
import { useDashboardLogistique } from '../hooks/useDashboardLogistique';
import { useAlertes } from '../hooks/useStock';
import { useTickets } from '../hooks/useTickets';
import { useReservations } from '../hooks/useReservations';

export default function DashboardLogistiquePage() {
  const { data: dashboard, isLoading } = useDashboardLogistique();
  const { data: alertes } = useAlertes();
  const { data: ticketsUrgents } = useTickets({ priorite: 'urgente' });
  const { data: reservations } = useReservations();

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

  const reservationsEnAttente = reservations?.filter(r => r.statut === 'en_attente') || [];

  return (
    <div className="container-fluid py-4">
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="mb-1">
            <i className="bi bi-tools me-2"></i>
            Tableau de bord logistique
          </h2>
          <p className="text-muted mb-0">
            {new Date().toLocaleDateString('fr-FR', { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}
          </p>
        </div>
      </div>

      {/* KPI Row 1 */}
      <div className="row g-3 mb-4">
        <div className="col-md-3">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-start">
                <div>
                  <p className="text-muted mb-1 small">Tickets urgents</p>
                  <h3 className="mb-0 text-danger">{dashboard?.ticketsUrgents || 0}</h3>
                </div>
                <div className="bg-danger bg-opacity-10 p-3 rounded">
                  <i className="bi bi-exclamation-triangle-fill text-danger fs-4"></i>
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
                  <p className="text-muted mb-1 small">Tickets non assignés</p>
                  <h3 className="mb-0 text-warning">{dashboard?.ticketsNonAssignes || 0}</h3>
                </div>
                <div className="bg-warning bg-opacity-10 p-3 rounded">
                  <i className="bi bi-person-x-fill text-warning fs-4"></i>
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
                  <p className="text-muted mb-1 small">Articles en alerte</p>
                  <h3 className="mb-0 text-danger">{dashboard?.articlesEnAlerteCritique || 0}</h3>
                </div>
                <div className="bg-danger bg-opacity-10 p-3 rounded">
                  <i className="bi bi-box-seam text-danger fs-4"></i>
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
                  <p className="text-muted mb-1 small">Réservations en attente</p>
                  <h3 className="mb-0 text-info">{dashboard?.reservationsEnAttente || 0}</h3>
                </div>
                <div className="bg-info bg-opacity-10 p-3 rounded">
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
                  <p className="text-muted mb-1 small">Salles disponibles</p>
                  <h3 className="mb-0 text-success">{dashboard?.sallesDisponibles || 0}</h3>
                </div>
                <div className="bg-success bg-opacity-10 p-3 rounded">
                  <i className="bi bi-door-open text-success fs-4"></i>
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
                  <p className="text-muted mb-1 small">Plannings actifs</p>
                  <h3 className="mb-0">{dashboard?.planningsActifs || 0}</h3>
                </div>
                <div className="bg-primary bg-opacity-10 p-3 rounded">
                  <i className="bi bi-calendar3 text-primary fs-4"></i>
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
                  <p className="text-muted mb-1 small">Rapports aujourd'hui</p>
                  <h3 className="mb-0">{dashboard?.rapportsAujourdHui || 0}</h3>
                </div>
                <div className="bg-secondary bg-opacity-10 p-3 rounded">
                  <i className="bi bi-file-earmark-text text-secondary fs-4"></i>
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
                  <p className="text-muted mb-1 small">Total bâtiments</p>
                  <h3 className="mb-0">{dashboard?.totalBatiments || 0}</h3>
                </div>
                <div className="bg-dark bg-opacity-10 p-3 rounded">
                  <i className="bi bi-building text-dark fs-4"></i>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Alertes critiques */}
      {alertes && alertes.length > 0 && (
        <div className="card border-0 shadow-sm mb-4">
          <div className="card-header bg-danger text-white">
            <h5 className="mb-0">
              <i className="bi bi-exclamation-triangle-fill me-2"></i>
              Alertes stock critiques
            </h5>
          </div>
          <div className="card-body p-0">
            <div className="table-responsive">
              <table className="table table-hover mb-0">
                <thead className="table-light">
                  <tr>
                    <th>Référence</th>
                    <th>Libellé</th>
                    <th>Catégorie</th>
                    <th>Stock actuel</th>
                    <th>Seuil</th>
                    <th>Déficit</th>
                    <th>Fournisseur</th>
                  </tr>
                </thead>
                <tbody>
                  {alertes.slice(0, 5).map((article) => (
                    <tr key={article.id}>
                      <td><code>{article.reference}</code></td>
                      <td className="fw-medium">{article.libelle}</td>
                      <td>
                        <span className="badge bg-secondary">{article.categorie}</span>
                      </td>
                      <td>
                        <span className="text-danger fw-bold">
                          {article.quantite_stock} {article.unite}
                        </span>
                      </td>
                      <td>{article.seuil_alerte} {article.unite}</td>
                      <td>
                        <span className="badge bg-danger">
                          -{article.deficit} {article.unite}
                        </span>
                      </td>
                      <td className="text-muted">{article.fournisseur || '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Tickets urgents */}
      {ticketsUrgents && ticketsUrgents.length > 0 && (
        <div className="card border-0 shadow-sm mb-4">
          <div className="card-header bg-warning">
            <h5 className="mb-0">
              <i className="bi bi-tools me-2"></i>
              Tickets urgents
            </h5>
          </div>
          <div className="card-body p-0">
            <div className="table-responsive">
              <table className="table table-hover mb-0">
                <thead className="table-light">
                  <tr>
                    <th>Titre</th>
                    <th>Type</th>
                    <th>Priorité</th>
                    <th>Statut</th>
                    <th>Localisation</th>
                    <th>Signalé par</th>
                    <th>Date</th>
                  </tr>
                </thead>
                <tbody>
                  {ticketsUrgents.slice(0, 5).map((ticket) => (
                    <tr key={ticket.id}>
                      <td className="fw-medium">{ticket.titre}</td>
                      <td>
                        <span className="badge bg-info">{ticket.type_maintenance}</span>
                      </td>
                      <td>
                        <span className="badge bg-danger">
                          <i className="bi bi-exclamation-triangle-fill me-1"></i>
                          {ticket.priorite}
                        </span>
                      </td>
                      <td>
                        <span className={`badge ${
                          ticket.statut === 'ouvert' ? 'bg-danger' :
                          ticket.statut === 'en_cours' ? 'bg-warning' :
                          'bg-secondary'
                        }`}>
                          {ticket.statut}
                        </span>
                      </td>
                      <td className="text-muted small">
                        {ticket.batiment_nom && `${ticket.batiment_nom} > `}
                        {ticket.salle_nom || '-'}
                      </td>
                      <td className="text-muted">{ticket.signale_par_nom}</td>
                      <td className="text-muted small">
                        {new Date(ticket.date_signalement).toLocaleDateString('fr-FR')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Réservations en attente */}
      {reservationsEnAttente.length > 0 && (
        <div className="card border-0 shadow-sm">
          <div className="card-header bg-info text-white">
            <h5 className="mb-0">
              <i className="bi bi-calendar-check me-2"></i>
              Réservations en attente d'approbation
            </h5>
          </div>
          <div className="card-body p-0">
            <div className="table-responsive">
              <table className="table table-hover mb-0">
                <thead className="table-light">
                  <tr>
                    <th>Titre</th>
                    <th>Salle</th>
                    <th>Date</th>
                    <th>Horaire</th>
                    <th>Demandeur</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {reservationsEnAttente.slice(0, 5).map((reservation) => (
                    <tr key={reservation.id}>
                      <td className="fw-medium">{reservation.titre}</td>
                      <td>
                        {reservation.salle_nom}
                        {reservation.salle_code && (
                          <span className="text-muted ms-1">({reservation.salle_code})</span>
                        )}
                      </td>
                      <td>
                        {new Date(reservation.date_reservation).toLocaleDateString('fr-FR')}
                      </td>
                      <td className="text-muted">
                        {reservation.heure_debut} - {reservation.heure_fin}
                      </td>
                      <td>
                        {reservation.demandeur}
                        <span className="badge bg-secondary ms-2">{reservation.demandeur_role}</span>
                      </td>
                      <td>
                        <button className="btn btn-sm btn-success me-2">
                          <i className="bi bi-check-lg"></i>
                        </button>
                        <button className="btn btn-sm btn-danger">
                          <i className="bi bi-x-lg"></i>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Made with Bob
