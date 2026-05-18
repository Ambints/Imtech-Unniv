import React, { useState } from 'react';
import { useRapports, useRapportsStats, useCreateRapport } from '../hooks';
import { CreateRapportEntretienDto } from '../types/entretien.types';

export default function RapportsEntretienPage() {
  const [filters, setFilters] = useState({
    date_debut: '',
    date_fin: '',
    statut: '',
  });
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState<CreateRapportEntretienDto>({
    realise_par: '',
    date_realisation: new Date().toISOString().split('T')[0],
    statut: 'realise',
  });

  const { data: rapports, isLoading } = useRapports(filters);
  const { data: stats } = useRapportsStats();
  const createMutation = useCreateRapport();

  const statutColors: Record<string, string> = {
    realise: 'success',
    partiel: 'warning',
    non_realise: 'danger',
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createMutation.mutateAsync(formData);
      setShowModal(false);
      setFormData({
        realise_par: '',
        date_realisation: new Date().toISOString().split('T')[0],
        statut: 'realise',
      });
    } catch (error) {
      console.error('Erreur création rapport:', error);
    }
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
        <h2 className="mb-0">
          <i className="bi bi-file-text me-2"></i>
          Rapports d'Entretien
        </h2>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>
          <i className="bi bi-plus-circle me-2"></i>
          Nouveau Rapport
        </button>
      </div>

      {/* Statistiques */}
      {stats && (
        <div className="row g-3 mb-4">
          <div className="col-md-3">
            <div className="card border-0 shadow-sm">
              <div className="card-body">
                <div className="d-flex justify-content-between align-items-start">
                  <div>
                    <p className="text-muted mb-1 small">Total (30j)</p>
                    <h4 className="mb-0">{stats.total}</h4>
                  </div>
                  <div className="bg-primary bg-opacity-10 p-2 rounded">
                    <i className="bi bi-file-text text-primary fs-4"></i>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="col-md-3">
            <div className="card border-0 shadow-sm">
              <div className="card-body">
                <div className="d-flex justify-content-between align-items-start">
                  <div>
                    <p className="text-muted mb-1 small">Réalisés</p>
                    <h4 className="mb-0 text-success">{stats.realises}</h4>
                  </div>
                  <div className="bg-success bg-opacity-10 p-2 rounded">
                    <i className="bi bi-check-circle text-success fs-4"></i>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="col-md-3">
            <div className="card border-0 shadow-sm">
              <div className="card-body">
                <div className="d-flex justify-content-between align-items-start">
                  <div>
                    <p className="text-muted mb-1 small">Partiels</p>
                    <h4 className="mb-0 text-warning">{stats.partiels}</h4>
                  </div>
                  <div className="bg-warning bg-opacity-10 p-2 rounded">
                    <i className="bi bi-exclamation-triangle text-warning fs-4"></i>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="col-md-3">
            <div className="card border-0 shadow-sm">
              <div className="card-body">
                <div className="d-flex justify-content-between align-items-start">
                  <div>
                    <p className="text-muted mb-1 small">Taux Réalisation</p>
                    <h4 className="mb-0">{stats.taux_execution}%</h4>
                  </div>
                  <div className="bg-info bg-opacity-10 p-2 rounded">
                    <i className="bi bi-graph-up text-info fs-4"></i>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Filtres */}
      <div className="card mb-4">
        <div className="card-body">
          <div className="row g-3">
            <div className="col-md-3">
              <label className="form-label small">Date début</label>
              <input
                type="date"
                className="form-control"
                value={filters.date_debut}
                onChange={(e) => setFilters({ ...filters, date_debut: e.target.value })}
              />
            </div>
            <div className="col-md-3">
              <label className="form-label small">Date fin</label>
              <input
                type="date"
                className="form-control"
                value={filters.date_fin}
                onChange={(e) => setFilters({ ...filters, date_fin: e.target.value })}
              />
            </div>
            <div className="col-md-3">
              <label className="form-label small">Statut</label>
              <select
                className="form-select"
                value={filters.statut}
                onChange={(e) => setFilters({ ...filters, statut: e.target.value })}
              >
                <option value="">Tous</option>
                <option value="realise">Réalisé</option>
                <option value="partiel">Partiel</option>
                <option value="non_realise">Non réalisé</option>
              </select>
            </div>
            <div className="col-md-3 d-flex align-items-end">
              <button
                className="btn btn-secondary w-100"
                onClick={() => setFilters({ date_debut: '', date_fin: '', statut: '' })}
              >
                <i className="bi bi-x-circle me-2"></i>
                Réinitialiser
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Liste des rapports */}
      <div className="card">
        <div className="card-body">
          <div className="table-responsive">
            <table className="table table-hover">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Horaire</th>
                  <th>Type</th>
                  <th>Zone/Salle</th>
                  <th>Réalisé par</th>
                  <th>Statut</th>
                  <th>Observations</th>
                </tr>
              </thead>
              <tbody>
                {rapports?.length > 0 ? (
                  rapports.map((rapport) => (
                    <tr key={rapport.id}>
                      <td>
                        {new Date(rapport.date_realisation).toLocaleDateString('fr-FR')}
                      </td>
                      <td>
                        {rapport.heure_debut && rapport.heure_fin
                          ? `${rapport.heure_debut} - ${rapport.heure_fin}`
                          : '-'}
                      </td>
                      <td>
                        {rapport.type_nettoyage && (
                          <span className="badge bg-secondary">{rapport.type_nettoyage}</span>
                        )}
                      </td>
                      <td>
                        {rapport.zone || rapport.salle_nom || '-'}
                        {rapport.batiment_nom && (
                          <div className="text-muted small">{rapport.batiment_nom}</div>
                        )}
                      </td>
                      <td>{rapport.realise_par_nom}</td>
                      <td>
                        <span className={`badge bg-${statutColors[rapport.statut]}`}>
                          {rapport.statut === 'realise'
                            ? 'Réalisé'
                            : rapport.statut === 'partiel'
                            ? 'Partiel'
                            : 'Non réalisé'}
                        </span>
                      </td>
                      <td>
                        {rapport.observations ? (
                          <span
                            className="text-truncate d-inline-block"
                            style={{ maxWidth: '200px' }}
                            title={rapport.observations}
                          >
                            {rapport.observations}
                          </span>
                        ) : (
                          '-'
                        )}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={7} className="text-center text-muted">
                      Aucun rapport trouvé
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Modal Création */}
      {showModal && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-lg">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Nouveau Rapport d'Entretien</h5>
                <button className="btn-close" onClick={() => setShowModal(false)}></button>
              </div>
              <form onSubmit={handleSubmit}>
                <div className="modal-body">
                  <div className="row g-3">
                    <div className="col-md-6">
                      <label className="form-label">Date de réalisation *</label>
                      <input
                        type="date"
                        className="form-control"
                        value={formData.date_realisation}
                        onChange={(e) =>
                          setFormData({ ...formData, date_realisation: e.target.value })
                        }
                        required
                      />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label">Statut *</label>
                      <select
                        className="form-select"
                        value={formData.statut}
                        onChange={(e) =>
                          setFormData({ ...formData, statut: e.target.value as any })
                        }
                        required
                      >
                        <option value="realise">Réalisé</option>
                        <option value="partiel">Partiel</option>
                        <option value="non_realise">Non réalisé</option>
                      </select>
                    </div>
                    <div className="col-md-6">
                      <label className="form-label">Heure début</label>
                      <input
                        type="time"
                        className="form-control"
                        value={formData.heure_debut || ''}
                        onChange={(e) =>
                          setFormData({ ...formData, heure_debut: e.target.value })
                        }
                      />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label">Heure fin</label>
                      <input
                        type="time"
                        className="form-control"
                        value={formData.heure_fin || ''}
                        onChange={(e) => setFormData({ ...formData, heure_fin: e.target.value })}
                      />
                    </div>
                    <div className="col-12">
                      <label className="form-label">Observations</label>
                      <textarea
                        className="form-control"
                        rows={3}
                        value={formData.observations || ''}
                        onChange={(e) =>
                          setFormData({ ...formData, observations: e.target.value })
                        }
                        placeholder="Détails sur l'entretien effectué..."
                      ></textarea>
                    </div>
                  </div>
                </div>
                <div className="modal-footer">
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => setShowModal(false)}
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={createMutation.isPending}
                  >
                    {createMutation.isPending ? 'Création...' : 'Créer'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Made with Bob
