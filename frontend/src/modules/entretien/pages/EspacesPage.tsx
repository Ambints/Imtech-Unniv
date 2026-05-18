import React, { useState } from 'react';
import { useReservations, useApprouverReservation, useRefuserReservation, useAnnulerReservation } from '../hooks';
import { StatutReservation } from '../types/entretien.types';

export default function EspacesPage() {
  const [selectedReservation, setSelectedReservation] = useState<any>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  const { data: reservations, isLoading } = useReservations();
  const approuverMutation = useApprouverReservation();
  const refuserMutation = useRefuserReservation();
  const annulerMutation = useAnnulerReservation();

  const statutColors: Record<StatutReservation, string> = {
    en_attente: 'warning',
    approuvee: 'success',
    refusee: 'danger',
    annulee: 'secondary',
  };

  const handleApprouver = async (id: string) => {
    if (!confirm('Approuver cette réservation ?')) return;
    try {
      await approuverMutation.mutateAsync(id);
    } catch (error) {
      console.error('Erreur approbation:', error);
    }
  };

  const handleRefuser = async (id: string) => {
    if (!confirm('Refuser cette réservation ?')) return;
    try {
      await refuserMutation.mutateAsync({ id, data: { statut: 'refusee' } });
    } catch (error) {
      console.error('Erreur refus:', error);
    }
  };

  const handleAnnuler = async (id: string) => {
    if (!confirm('Annuler cette réservation ?')) return;
    try {
      await annulerMutation.mutateAsync(id);
    } catch (error) {
      console.error('Erreur annulation:', error);
    }
  };

  const openDetail = (reservation: any) => {
    setSelectedReservation(reservation);
    setShowDetailModal(true);
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

  const enAttente = reservations?.filter((r) => r.statut === 'en_attente') || [];
  const approuvees = reservations?.filter((r) => r.statut === 'approuvee') || [];
  const autres = reservations?.filter((r) => !['en_attente', 'approuvee'].includes(r.statut)) || [];

  return (
    <div className="container-fluid py-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="mb-0">
          <i className="bi bi-calendar-check me-2"></i>
          Réservations de Salles
        </h2>
      </div>

      {/* Réservations en attente */}
      {enAttente.length > 0 && (
        <div className="mb-4">
          <h5 className="mb-3">
            <span className="badge bg-warning">{enAttente.length}</span> En attente d'approbation
          </h5>
          <div className="row g-3">
            {enAttente.map((reservation) => (
              <div key={reservation.id} className="col-md-6 col-lg-4">
                <div className="card border-warning h-100">
                  <div className="card-body">
                    <div className="d-flex justify-content-between align-items-start mb-2">
                      <h6 className="card-title mb-0">{reservation.titre}</h6>
                      <span className="badge bg-warning">En attente</span>
                    </div>

                    <div className="small text-muted mb-3">
                      <div>
                        <i className="bi bi-door-closed me-1"></i>
                        {reservation.salle_nom} ({reservation.type_salle})
                      </div>
                      {reservation.batiment_nom && (
                        <div>
                          <i className="bi bi-building me-1"></i>
                          {reservation.batiment_nom}
                        </div>
                      )}
                      <div>
                        <i className="bi bi-calendar me-1"></i>
                        {new Date(reservation.date_reservation).toLocaleDateString('fr-FR')}
                      </div>
                      <div>
                        <i className="bi bi-clock me-1"></i>
                        {reservation.heure_debut} - {reservation.heure_fin}
                      </div>
                      <div>
                        <i className="bi bi-person me-1"></i>
                        {reservation.demandeur_nom}
                      </div>
                      <div>
                        <i className="bi bi-people me-1"></i>
                        Capacité: {reservation.capacite} places
                      </div>
                    </div>

                    {reservation.description && (
                      <p className="card-text small text-muted mb-3">{reservation.description}</p>
                    )}

                    <div className="d-flex gap-2">
                      <button
                        className="btn btn-sm btn-success flex-fill"
                        onClick={() => handleApprouver(reservation.id)}
                        disabled={approuverMutation.isPending}
                      >
                        <i className="bi bi-check-circle me-1"></i>
                        Approuver
                      </button>
                      <button
                        className="btn btn-sm btn-danger flex-fill"
                        onClick={() => handleRefuser(reservation.id)}
                        disabled={refuserMutation.isPending}
                      >
                        <i className="bi bi-x-circle me-1"></i>
                        Refuser
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Réservations approuvées */}
      <div className="mb-4">
        <h5 className="mb-3">
          <span className="badge bg-success">{approuvees.length}</span> Réservations approuvées
        </h5>
        <div className="card">
          <div className="card-body">
            <div className="table-responsive">
              <table className="table table-hover">
                <thead>
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
                      <td>
                        <strong>{reservation.titre}</strong>
                      </td>
                      <td>
                        {reservation.salle_nom}
                        <div className="small text-muted">{reservation.batiment_nom}</div>
                      </td>
                      <td>{new Date(reservation.date_reservation).toLocaleDateString('fr-FR')}</td>
                      <td>
                        {reservation.heure_debut} - {reservation.heure_fin}
                      </td>
                      <td>
                        {reservation.demandeur_nom}
                      </td>
                      <td>{reservation.approuve_par_nom || '-'}</td>
                      <td>
                        <button
                          className="btn btn-sm btn-outline-danger"
                          onClick={() => handleAnnuler(reservation.id)}
                          disabled={annulerMutation.isPending}
                        >
                          <i className="bi bi-x-circle me-1"></i>
                          Annuler
                        </button>
                      </td>
                    </tr>
                  ))}
                  {approuvees.length === 0 && (
                    <tr>
                      <td colSpan={7} className="text-center text-muted">
                        Aucune réservation approuvée
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* Autres réservations */}
      {autres.length > 0 && (
        <div>
          <h5 className="mb-3">Historique</h5>
          <div className="card">
            <div className="card-body">
              <div className="table-responsive">
                <table className="table table-sm">
                  <thead>
                    <tr>
                      <th>Titre</th>
                      <th>Salle</th>
                      <th>Date</th>
                      <th>Statut</th>
                    </tr>
                  </thead>
                  <tbody>
                    {autres.map((reservation) => (
                      <tr key={reservation.id}>
                        <td>{reservation.titre}</td>
                        <td>{reservation.salle_nom}</td>
                        <td>{new Date(reservation.date_reservation).toLocaleDateString('fr-FR')}</td>
                        <td>
                          <span className={`badge bg-${statutColors[reservation.statut]}`}>
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
        </div>
      )}
    </div>
  );
}

// Made with Bob
