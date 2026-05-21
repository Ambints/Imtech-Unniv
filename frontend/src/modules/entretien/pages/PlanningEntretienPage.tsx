import React, { useState } from 'react';
import { usePlanning, usePlanningHebdomadaire, useCreatePlanning, useTogglePlanning } from '../hooks';
import { CreatePlanningEntretienDto } from '../types/entretien.types';

export default function PlanningEntretienPage() {
  const [view, setView] = useState<'list' | 'hebdo'>('hebdo');
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState<CreatePlanningEntretienDto>({
    type_nettoyage: 'quotidien',
    jour_semaine: 1,
  });

  const { data: plannings, isLoading } = usePlanning();
  const { data: hebdo } = usePlanningHebdomadaire();
  const createMutation = useCreatePlanning();
  const toggleMutation = useTogglePlanning();

  const jours = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche'];
  const typeColors: Record<string, string> = {
    quotidien: 'primary',
    hebdomadaire: 'success',
    mensuel: 'info',
    apres_evenement: 'warning',
    desinfection: 'danger',
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createMutation.mutateAsync(formData);
      setShowModal(false);
      setFormData({ type_nettoyage: 'quotidien', jour_semaine: 1 });
    } catch (error) {
      console.error('Erreur création planning:', error);
    }
  };

  const handleToggle = async (id: string) => {
    try {
      await toggleMutation.mutateAsync(id);
    } catch (error) {
      console.error('Erreur toggle planning:', error);
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
          <i className="bi bi-calendar3 me-2"></i>
          Planning Entretien
        </h2>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>
          <i className="bi bi-plus-circle me-2"></i>
          Nouveau Planning
        </button>
      </div>

      {/* Tabs */}
      <ul className="nav nav-tabs mb-4">
        <li className="nav-item">
          <button
            className={`nav-link ${view === 'hebdo' ? 'active' : ''}`}
            onClick={() => setView('hebdo')}
          >
            <i className="bi bi-calendar-week me-2"></i>
            Vue Hebdomadaire
          </button>
        </li>
        <li className="nav-item">
          <button
            className={`nav-link ${view === 'list' ? 'active' : ''}`}
            onClick={() => setView('list')}
          >
            <i className="bi bi-list-ul me-2"></i>
            Liste Complète
          </button>
        </li>
      </ul>

      {/* Vue Hebdomadaire */}
      {view === 'hebdo' && (
        <div className="row g-3">
          {jours.map((jour, idx) => (
            <div key={idx} className="col-md-6 col-lg-4 col-xl-3">
              <div className="card h-100">
                <div className="card-header bg-light">
                  <h6 className="mb-0">{jour}</h6>
                </div>
                <div className="card-body p-2">
                  {hebdo?.[idx + 1]?.length > 0 ? (
                    hebdo[idx + 1].map((planning) => (
                      <div
                        key={planning.id}
                        className={`card mb-2 border-${typeColors[planning.type_nettoyage]}`}
                      >
                        <div className="card-body p-2">
                          <div className="d-flex justify-content-between align-items-start mb-1">
                            <span className={`badge bg-${typeColors[planning.type_nettoyage]} small`}>
                              {planning.type_nettoyage}
                            </span>
                            <div className="form-check form-switch">
                              <input
                                className="form-check-input"
                                type="checkbox"
                                checked={planning.actif}
                                onChange={() => handleToggle(planning.id)}
                              />
                            </div>
                          </div>
                          <div className="small">
                            <div className="text-muted">
                              <i className="bi bi-clock me-1"></i>
                              {planning.heure_debut || 'Non défini'}
                              {planning.duree_minutes && ` (${planning.duree_minutes}min)`}
                            </div>
                            {planning.zone && (
                              <div className="text-muted">
                                <i className="bi bi-geo-alt me-1"></i>
                                {planning.zone}
                              </div>
                            )}
                            {planning.salle_nom && (
                              <div className="text-muted">
                                <i className="bi bi-door-closed me-1"></i>
                                {planning.salle_nom}
                              </div>
                            )}
                            {planning.responsable_nom && (
                              <div className="text-muted">
                                <i className="bi bi-person me-1"></i>
                                {planning.responsable_nom}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-muted text-center small mb-0">Aucun planning</p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Vue Liste */}
      {view === 'list' && (
        <div className="card">
          <div className="card-body">
            <div className="table-responsive">
              <table className="table table-hover">
                <thead>
                  <tr>
                    <th>Jour</th>
                    <th>Type</th>
                    <th>Heure</th>
                    <th>Zone/Salle</th>
                    <th>Responsable</th>
                    <th>Statut</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {plannings?.map((planning) => (
                    <tr key={planning.id}>
                      <td>{jours[planning.jour_semaine - 1]}</td>
                      <td>
                        <span className={`badge bg-${typeColors[planning.type_nettoyage]}`}>
                          {planning.type_nettoyage}
                        </span>
                      </td>
                      <td>
                        {planning.heure_debut || '-'}
                        {planning.duree_minutes && (
                          <span className="text-muted small"> ({planning.duree_minutes}min)</span>
                        )}
                      </td>
                      <td>
                        {planning.zone || planning.salle_nom || '-'}
                        {planning.batiment_nom && (
                          <div className="text-muted small">{planning.batiment_nom}</div>
                        )}
                      </td>
                      <td>{planning.responsable_nom || '-'}</td>
                      <td>
                        <span className={`badge ${planning.actif ? 'bg-success' : 'bg-secondary'}`}>
                          {planning.actif ? 'Actif' : 'Inactif'}
                        </span>
                      </td>
                      <td>
                        <div className="form-check form-switch">
                          <input
                            className="form-check-input"
                            type="checkbox"
                            checked={planning.actif}
                            onChange={() => handleToggle(planning.id)}
                          />
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

      {/* Modal Création */}
      {showModal && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-lg">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Nouveau Planning Entretien</h5>
                <button className="btn-close" onClick={() => setShowModal(false)}></button>
              </div>
              <form onSubmit={handleSubmit}>
                <div className="modal-body">
                  <div className="row g-3">
                    <div className="col-md-6">
                      <label className="form-label">Type de nettoyage *</label>
                      <select
                        className="form-select"
                        value={formData.type_nettoyage}
                        onChange={(e) =>
                          setFormData({ ...formData, type_nettoyage: e.target.value as any })
                        }
                        required
                      >
                        <option value="quotidien">Quotidien</option>
                        <option value="hebdomadaire">Hebdomadaire</option>
                        <option value="mensuel">Mensuel</option>
                        <option value="apres_evenement">Après événement</option>
                        <option value="desinfection">Désinfection</option>
                      </select>
                    </div>
                    <div className="col-md-6">
                      <label className="form-label">Jour de la semaine *</label>
                      <select
                        className="form-select"
                        value={formData.jour_semaine}
                        onChange={(e) =>
                          setFormData({ ...formData, jour_semaine: parseInt(e.target.value) })
                        }
                        required
                      >
                        {jours.map((jour, idx) => (
                          <option key={idx} value={idx + 1}>
                            {jour}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="col-md-6">
                      <label className="form-label">Heure de début</label>
                      <input
                        type="time"
                        className="form-control"
                        value={formData.heure_debut || ''}
                        onChange={(e) => setFormData({ ...formData, heure_debut: e.target.value })}
                      />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label">Durée (minutes)</label>
                      <input
                        type="number"
                        className="form-control"
                        min="15"
                        value={formData.duree_minutes || ''}
                        onChange={(e) =>
                          setFormData({ ...formData, duree_minutes: parseInt(e.target.value) })
                        }
                      />
                    </div>
                    <div className="col-12">
                      <label className="form-label">Zone</label>
                      <input
                        type="text"
                        className="form-control"
                        value={formData.zone || ''}
                        onChange={(e) => setFormData({ ...formData, zone: e.target.value })}
                        placeholder="Ex: Bâtiment A - Étage 2"
                      />
                    </div>
                  </div>
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>
                    Annuler
                  </button>
                  <button type="submit" className="btn btn-primary" disabled={createMutation.isPending}>
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
