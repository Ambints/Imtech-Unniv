import React, { useState } from 'react';
import { useCalendrier } from '../hooks/useReservations';

export default function CalendrierSallesPage() {
  const [dateDebut, setDateDebut] = useState(
    new Date().toISOString().split('T')[0]
  );
  const [dateFin, setDateFin] = useState(
    new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  );

  const { data: events, isLoading } = useCalendrier(dateDebut, dateFin);

  // Grouper par salle
  const eventsBySalle = events?.reduce((acc, event) => {
    if (!acc[event.salle_id]) {
      acc[event.salle_id] = {
        salle_nom: event.salle_nom,
        events: [],
      };
    }
    acc[event.salle_id].events.push(event);
    return acc;
  }, {} as Record<string, { salle_nom: string; events: typeof events }>);

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

  return (
    <div className="container-fluid py-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>
          <i className="bi bi-calendar4-week me-2"></i>
          Calendrier des salles
        </h2>
      </div>

      {/* Filtres dates */}
      <div className="card border-0 shadow-sm mb-4">
        <div className="card-body">
          <div className="row g-3">
            <div className="col-md-4">
              <label className="form-label">Date début</label>
              <input
                type="date"
                className="form-control"
                value={dateDebut}
                onChange={(e) => setDateDebut(e.target.value)}
              />
            </div>
            <div className="col-md-4">
              <label className="form-label">Date fin</label>
              <input
                type="date"
                className="form-control"
                value={dateFin}
                onChange={(e) => setDateFin(e.target.value)}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Légende */}
      <div className="card border-0 shadow-sm mb-4">
        <div className="card-body">
          <div className="d-flex gap-3 flex-wrap">
            <div className="d-flex align-items-center">
              <div className="calendrier-event cours me-2" style={{ width: '30px', height: '20px' }}></div>
              <span className="small">Cours (EDT)</span>
            </div>
            <div className="d-flex align-items-center">
              <div className="calendrier-event reservation me-2" style={{ width: '30px', height: '20px' }}></div>
              <span className="small">Réservation approuvée</span>
            </div>
            <div className="d-flex align-items-center">
              <div className="calendrier-event en-attente me-2" style={{ width: '30px', height: '20px' }}></div>
              <span className="small">Réservation en attente</span>
            </div>
          </div>
        </div>
      </div>

      {/* Calendrier par salle */}
      {eventsBySalle && Object.entries(eventsBySalle).map(([salleId, { salle_nom, events }]) => (
        <div key={salleId} className="card border-0 shadow-sm mb-3">
          <div className="card-header bg-primary text-white">
            <h5 className="mb-0">
              <i className="bi bi-door-open me-2"></i>
              {salle_nom}
            </h5>
          </div>
          <div className="card-body">
            <div className="table-responsive">
              <table className="table table-sm mb-0">
                <thead className="table-light">
                  <tr>
                    <th>Date</th>
                    <th>Horaire</th>
                    <th>Titre</th>
                    <th>Type</th>
                    <th>Statut</th>
                  </tr>
                </thead>
                <tbody>
                  {events
                    .sort((a, b) => {
                      const dateCompare = a.date_reservation.localeCompare(b.date_reservation);
                      if (dateCompare !== 0) return dateCompare;
                      return a.heure_debut.localeCompare(b.heure_debut);
                    })
                    .map((event, idx) => (
                      <tr key={idx}>
                        <td>
                          {new Date(event.date_reservation).toLocaleDateString('fr-FR', {
                            weekday: 'short',
                            day: 'numeric',
                            month: 'short',
                          })}
                        </td>
                        <td className="text-muted">
                          {event.heure_debut} - {event.heure_fin}
                        </td>
                        <td className="fw-medium">{event.titre}</td>
                        <td>
                          <span className={`badge ${event.source === 'cours' ? 'bg-primary' : 'bg-success'}`}>
                            {event.source}
                          </span>
                        </td>
                        <td>
                          <span className={`badge ${
                            event.statut === 'approuvee' ? 'bg-success' :
                            event.statut === 'en_attente' ? 'bg-warning text-dark' :
                            'bg-secondary'
                          }`}>
                            {event.statut}
                          </span>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      ))}

      {(!eventsBySalle || Object.keys(eventsBySalle).length === 0) && (
        <div className="alert alert-info">
          <i className="bi bi-info-circle me-2"></i>
          Aucun événement pour la période sélectionnée.
        </div>
      )}
    </div>
  );
}

// Made with Bob
