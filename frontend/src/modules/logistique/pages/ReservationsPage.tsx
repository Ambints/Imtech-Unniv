import React from 'react';
import { useReservations, useApprouverReservation, useRefuserReservation, useAnnulerReservation } from '../hooks/useReservations';

export default function ReservationsPage() {
  const { data: reservations, isLoading } = useReservations();
  const approuverMutation = useApprouverReservation();
  const refuserMutation = useRefuserReservation();
  const annulerMutation = useAnnulerReservation();

  const handleApprouver = async (id: string) => {
    if (confirm('Approuver cette réservation ?')) {
      await approuverMutation.mutateAsync(id);
    }
  };

  const handleRefuser = async (id: string) => {
    if (confirm('Refuser cette réservation ?')) {
      await refuserMutation.mutateAsync(id);
    }
  };

  const handleAnnuler = async (id: string) => {
    if (confirm('Annuler cette réservation ?')) {
      await annulerMutation.mutateAsync(id);
    }
  };

  const getStatutBadge = (statut: string) => {
    const classes = {
      en_attente: 'bg-warning text-dark',
      approuvee: 'bg-success',
      refusee: 'bg-danger',
      annulee: 'bg-secondary',
    };
    return classes[statut as keyof typeof classes] || 'bg-secondary';
  };

  if (isLoading) {
    return (
      <div className="container-fluid py-4">
        <div className="d-flex justify-content-center">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Chargement...</span>
          </div>
        </div>
      </div>
    );
  }

  const enAttente = reservations?.filter(r => r.statut === 'en_attente') || [];
  const approuvees = reservations?.filter(r => r.statut === 'approuvee') || [];
  const autres = reservations?.filter(r => !['en_attente', 'approuvee'].includes(r.statut)) || [];

  return (
    <div className="container-fluid py-4">
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>
          <i className="bi bi-calendar-check me-2"></i>
          Réservations de salles
        </h2>
      </div>

      {/* Statistiques */}
      <div className="row g-3 mb-4">
        <div className="col-md-3">
          <div className="card border-0 shadow-sm">
            <div className="card-body">
              <div className="d-flex justify-content-between">
                <div>
                  <p className="text-muted mb-1 small">En attente</p>
                  <h4 className="mb-0 text-warning">{enAttente.length}</h4>
                </div>
                <div className="bg-warning bg-opacity-10 p-3 rounded">
                  <i className="bi bi-clock text-warning fs-4"></i>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card border-0 shadow-sm">
            <div className="card-body">
              <div className="d-flex justify-content-between">
                <div>
                  <p className="text-muted mb-1 small">Approuvées</p>
                  <h4 className="mb-0 text-success">{approuvees.length}</h4>
                </div>
                <div className="bg-success bg-opacity-10 p-3 rounded">
                  <i className="bi bi-check-circle text-success fs-4"></i>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card border-0 shadow-sm">
            <div className="card-body">
              <div className="d-flex justify-content-between">
                <div>
                  <p className="text-muted mb-1 small">Total</p>
                  <h4 className="mb-0">{reservations?.length || 0}</h4>
                </div>
                <div className="bg-primary bg-opacity-10 p-3 rounded">
                  <i className="bi bi-calendar3 text-primary fs-4"></i>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Réservations en attente */}
      {enAttente.length > 0 && (
        <div className="card border-0 shadow-sm mb-4">
          <div className="card-header bg-warning">
            <h5 className="mb-0">
              <i className="bi bi-clock me-2"></i>
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
                    <th>Capacité</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {enAttente.map((reservation) => (
                    <tr key={reservation.id}>
                      <td className="fw-medium">{reservation.titre}</td>
                      <td>
                        {reservation.salle_nom}
                        {reservation.salle_code && (
                          <span className="text-muted ms-1">({reservation.salle_code})</span>
                        )}
                        <br />
                        <small className="text-muted">{reservation.batiment_nom}</small>
                      </td>
                      <td>
                        {new Date(reservation.date_reservation).toLocaleDateString('fr-FR', {
                          weekday: 'short',
                          day: 'numeric',
                          month: 'short',
                        })}
                      </td>
                      <td className="text-muted">
                        {reservation.heure_debut} - {reservation.heure_fin}
                      </td>
                      <td>
                        {reservation.demandeur}
                        <br />
                        <span className="badge bg-secondary">{reservation.demandeur_role}</span>
                      </td>
                      <td className="text-muted">{reservation.capacite} places</td>
                      <td>
                        <div className="btn-group btn-group-sm">
                          <button
                            className="btn btn-success"
                            onClick={() => handleApprouver(reservation.id)}
                            disabled={approuverMutation.isPending}
                            title="Approuver"
                          >
                            <i className="bi bi-check-lg"></i>
                          </button>
                          <button
                            className="btn btn-danger"
                            onClick={() => handleRefuser(reservation.id)}
                            disabled={refuserMutation.isPending}
                            title="Refuser"
                          >
                            <i className="bi bi-x-lg"></i>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Réservations approuvées */}
      {approuvees.length > 0 && (
        <div className="card border-0 shadow-sm mb-4">
          <div className="card-header bg-success text-white">
            <h5 className="mb-0">
              <i className="bi bi-check-circle me-2"></i>
              Réservations approuvées
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
                    <th>Approuvé par</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {approuvees.map((reservation) => (
                    <tr key={reservation.id}>
                      <td className="fw-medium">{reservation.titre}</td>
                      <td>
                        {reservation.salle_nom}
                        {reservation.salle_code && (
                          <span className="text-muted ms-1">({reservation.salle_code})</span>
                        )}
                      </td>
                      <td>
                        {new Date(reservation.date_reservation).toLocaleDateString('fr-FR', {
                          weekday: 'short',
                          day: 'numeric',
                          month: 'short',
                        })}
                      </td>
                      <td className="text-muted">
                        {reservation.heure_debut} - {reservation.heure_fin}
                      </td>
                      <td>{reservation.demandeur}</td>
                      <td className="text-muted">{reservation.approuve_par_nom || '-'}</td>
                      <td>
                        <button
                          className="btn btn-sm btn-outline-danger"
                          onClick={() => handleAnnuler(reservation.id)}
                          disabled={annulerMutation.isPending}
                          title="Annuler"
                        >
                          <i className="bi bi-x-circle"></i>
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

      {/* Autres réservations */}
      {autres.length > 0 && (
        <div className="card border-0 shadow-sm">
          <div className="card-header">
            <h5 className="mb-0">
              <i className="bi bi-archive me-2"></i>
              Historique
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
                    <th>Statut</th>
                  </tr>
                </thead>
                <tbody>
                  {autres.map((reservation) => (
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
                      <td>{reservation.demandeur}</td>
                      <td>
                        <span className={`badge ${getStatutBadge(reservation.statut)}`}>
                          {reservation.statut}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {reservations?.length === 0 && (
        <div className="alert alert-info">
          <i className="bi bi-info-circle me-2"></i>
          Aucune réservation pour le moment.
        </div>
      )}
    </div>
  );
}

// Made with Bob
