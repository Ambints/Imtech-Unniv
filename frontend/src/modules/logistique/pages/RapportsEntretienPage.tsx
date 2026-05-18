import React, { useState } from 'react';
import { useRapports } from '../hooks/useEntretien';

export default function RapportsEntretienPage() {
  const [filters, setFilters] = useState<{ date_debut?: string; date_fin?: string; statut?: string }>({});
  const { data: rapports, isLoading } = useRapports(filters);

  const getStatutBadge = (statut: string) => {
    const classes = {
      realise: 'bg-success',
      partiel: 'bg-warning text-dark',
      non_realise: 'bg-danger',
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

  return (
    <div className="container-fluid py-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>
          <i className="bi bi-file-earmark-text me-2"></i>
          Rapports d'entretien
        </h2>
      </div>

      {/* Filtres */}
      <div className="card border-0 shadow-sm mb-4">
        <div className="card-body">
          <div className="row g-3">
            <div className="col-md-3">
              <label className="form-label small">Date début</label>
              <input
                type="date"
                className="form-control"
                value={filters.date_debut || ''}
                onChange={(e) => setFilters({ ...filters, date_debut: e.target.value || undefined })}
              />
            </div>
            <div className="col-md-3">
              <label className="form-label small">Date fin</label>
              <input
                type="date"
                className="form-control"
                value={filters.date_fin || ''}
                onChange={(e) => setFilters({ ...filters, date_fin: e.target.value || undefined })}
              />
            </div>
            <div className="col-md-3">
              <label className="form-label small">Statut</label>
              <select
                className="form-select"
                value={filters.statut || ''}
                onChange={(e) => setFilters({ ...filters, statut: e.target.value || undefined })}
              >
                <option value="">Tous</option>
                <option value="realise">Réalisé</option>
                <option value="partiel">Partiel</option>
                <option value="non_realise">Non réalisé</option>
              </select>
            </div>
            <div className="col-md-3">
              <label className="form-label small">&nbsp;</label>
              <button
                className="btn btn-outline-secondary w-100"
                onClick={() => setFilters({})}
              >
                <i className="bi bi-x-circle me-2"></i>
                Réinitialiser
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Statistiques */}
      <div className="row g-3 mb-4">
        <div className="col-md-3">
          <div className="card border-0 shadow-sm">
            <div className="card-body">
              <div className="d-flex justify-content-between">
                <div>
                  <p className="text-muted mb-1 small">Total rapports</p>
                  <h4 className="mb-0">{rapports?.length || 0}</h4>
                </div>
                <div className="bg-primary bg-opacity-10 p-3 rounded">
                  <i className="bi bi-file-text text-primary fs-4"></i>
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
                  <p className="text-muted mb-1 small">Réalisés</p>
                  <h4 className="mb-0 text-success">
                    {rapports?.filter(r => r.statut === 'realise').length || 0}
                  </h4>
                </div>
                <div className="bg-success bg-opacity-10 p-3 rounded">
                  <i className="bi bi-check-circle text-success fs-4"></i>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Liste rapports */}
      <div className="card border-0 shadow-sm">
        <div className="card-body p-0">
          <div className="table-responsive">
            <table className="table table-hover mb-0">
              <thead className="table-light">
                <tr>
                  <th>Date</th>
                  <th>Horaire</th>
                  <th>Type</th>
                  <th>Zone/Salle</th>
                  <th>Bâtiment</th>
                  <th>Réalisé par</th>
                  <th>Statut</th>
                  <th>Observations</th>
                </tr>
              </thead>
              <tbody>
                {rapports?.map((rapport) => (
                  <tr key={rapport.id}>
                    <td>
                      {new Date(rapport.date_realisation).toLocaleDateString('fr-FR')}
                    </td>
                    <td className="text-muted small">
                      {rapport.heure_debut && rapport.heure_fin
                        ? `${rapport.heure_debut} - ${rapport.heure_fin}`
                        : '-'}
                    </td>
                    <td>
                      <span className="badge bg-info">{rapport.type_nettoyage || '-'}</span>
                    </td>
                    <td className="text-muted">
                      {rapport.zone || rapport.salle_nom || '-'}
                    </td>
                    <td className="text-muted">{rapport.batiment_nom || '-'}</td>
                    <td>{rapport.realise_par_nom}</td>
                    <td>
                      <span className={`badge ${getStatutBadge(rapport.statut)}`}>
                        {rapport.statut}
                      </span>
                    </td>
                    <td className="text-muted small">
                      {rapport.observations ? (
                        <span title={rapport.observations}>
                          {rapport.observations.substring(0, 50)}
                          {rapport.observations.length > 50 && '...'}
                        </span>
                      ) : '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {rapports?.length === 0 && (
        <div className="alert alert-info mt-4">
          <i className="bi bi-info-circle me-2"></i>
          Aucun rapport pour les critères sélectionnés.
        </div>
      )}
    </div>
  );
}

// Made with Bob
