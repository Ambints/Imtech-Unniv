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
  const eventsArray = Array.isArray(events) ? events : [];
  const eventsBySalle = eventsArray.reduce((acc, event) => {
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
        <div className="text-muted small">
          {eventsArray.length} événement(s) trouvé(s)
        </div>
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
                    <th>Titre / UE</th>
                    <th>Détails</th>
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
                          <i className="bi bi-clock me-1"></i>
                          {event.heure_debut} - {event.heure_fin}
                        </td>
                        <td>
                          <div className="fw-medium">{event.titre}</div>
                          {event.ue_nom && event.ue_nom !== event.titre && (
                            <small className="text-muted">{event.ue_nom}</small>
                          )}
                        </td>
                        <td>
                          {event.source === 'cours' ? (
                            <div className="small">
                              {event.enseignant_nom && (
                                <div>
                                  <i className="bi bi-person me-1"></i>
                                  {event.enseignant_nom}
                                </div>
                              )}
                              {event.parcours_nom && (
                                <div className="text-muted">
                                  <i className="bi bi-mortarboard me-1"></i>
                                  {event.parcours_nom}
                                </div>
                              )}
                              {event.type_seance && (
                                <span className="badge bg-info text-dark mt-1">
                                  {event.type_seance}
                                </span>
                              )}
                            </div>
                          ) : (
                            <span className="text-muted small">Réservation</span>
                          )}
                        </td>
                        <td>
                          <span className={`badge ${event.source === 'cours' ? 'bg-primary' : 'bg-success'}`}>
                            {event.source === 'cours' ? 'Cours' : 'Réservation'}
                          </span>
                        </td>
                        <td>
                          <span className={`badge ${
                            event.statut === 'approuvee' || event.statut === 'planifie' ? 'bg-success' :
                            event.statut === 'en_attente' ? 'bg-warning text-dark' :
                            event.statut === 'annule' ? 'bg-danger' :
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
        <div className="card border-0 shadow-sm">
          <div className="card-body text-center py-5">
            <i className="bi bi-calendar-x display-1 text-muted mb-3"></i>
            <h5 className="text-muted">Aucun événement pour la période sélectionnée</h5>
            <p className="text-muted mb-4">
              Il n'y a pas de cours (emploi du temps) ni de réservations de salles pour cette période.
            </p>
            <div className="alert alert-info text-start">
              <strong>💡 Pour voir des événements :</strong>
              <ul className="mb-0 mt-2">
                <li>Assurez-vous qu'il y a des cours planifiés dans l'emploi du temps</li>
                <li>Vérifiez qu'il y a des réservations de salles approuvées</li>
                <li>Ajustez les dates de début et de fin pour élargir la période</li>
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Made with Bob
