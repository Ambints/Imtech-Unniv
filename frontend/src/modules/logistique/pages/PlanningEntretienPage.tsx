import React from 'react';
import { usePlanning, useTogglePlanning } from '../hooks/useEntretien';

export default function PlanningEntretienPage() {
  const { data: plannings, isLoading } = usePlanning();
  const toggleMutation = useTogglePlanning();

  const joursMap = ['', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche'];

  const handleToggle = async (id: string) => {
    await toggleMutation.mutateAsync(id);
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

  const planningsByDay = plannings?.reduce((acc, p) => {
    if (!acc[p.jour_semaine]) acc[p.jour_semaine] = [];
    acc[p.jour_semaine].push(p);
    return acc;
  }, {} as Record<number, typeof plannings>);

  return (
    <div className="container-fluid py-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>
          <i className="bi bi-calendar3 me-2"></i>
          Planning d'entretien
        </h2>
      </div>

      <div className="row g-3">
        {[1, 2, 3, 4, 5, 6, 7].map((jour) => (
          <div key={jour} className="col-12">
            <div className="card border-0 shadow-sm">
              <div className="card-header bg-primary text-white">
                <h5 className="mb-0">{joursMap[jour]}</h5>
              </div>
              <div className="card-body">
                {planningsByDay?.[jour]?.length ? (
                  <div className="row g-3">
                    {planningsByDay[jour].map((planning) => (
                      <div key={planning.id} className="col-md-6 col-lg-4">
                        <div className={`card h-100 ${planning.actif ? 'border-success' : 'border-secondary'}`}>
                          <div className="card-body">
                            <div className="d-flex justify-content-between align-items-start mb-2">
                              <span className="badge bg-info">{planning.type_nettoyage}</span>
                              <div className="form-check form-switch">
                                <input
                                  className="form-check-input"
                                  type="checkbox"
                                  checked={planning.actif}
                                  onChange={() => handleToggle(planning.id)}
                                  disabled={toggleMutation.isPending}
                                />
                              </div>
                            </div>
                            <p className="mb-1">
                              <i className="bi bi-clock me-1"></i>
                              {planning.heure_debut || 'N/A'}
                              {planning.duree_minutes && ` (${planning.duree_minutes} min)`}
                            </p>
                            {planning.salle_nom && (
                              <p className="mb-1 text-muted small">
                                <i className="bi bi-door-open me-1"></i>
                                {planning.salle_nom}
                              </p>
                            )}
                            {planning.batiment_nom && (
                              <p className="mb-1 text-muted small">
                                <i className="bi bi-building me-1"></i>
                                {planning.batiment_nom}
                              </p>
                            )}
                            {planning.zone && (
                              <p className="mb-1 text-muted small">
                                <i className="bi bi-geo-alt me-1"></i>
                                {planning.zone}
                              </p>
                            )}
                            {planning.responsable_nom && (
                              <p className="mb-0 text-muted small">
                                <i className="bi bi-person me-1"></i>
                                {planning.responsable_nom}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted mb-0">Aucun planning pour ce jour</p>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// Made with Bob
