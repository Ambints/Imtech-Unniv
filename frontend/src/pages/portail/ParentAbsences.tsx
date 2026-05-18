import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

interface Absence {
  id: string;
  statut: string;
  heure_arrivee: string;
  justifie: boolean;
  motif: string;
  justificatif_url: string;
  date_seance: string;
  heure_debut: string;
  heure_fin: string;
  type_seance: string;
  matiere: string;
  matiere_code: string;
  ue_nom: string;
  enseignant_nom: string;
  enseignant_prenom: string;
  salle: string;
}

interface Stats {
  absences_injustifiees: number;
  absences_justifiees: number;
  retards: number;
  presences: number;
  total_seances: number;
  taux_assiduite: number;
}

interface EvolutionMensuelle {
  mois: string;
  absences: number;
  retards: number;
  total_seances: number;
}

interface AbsencesData {
  absences: Absence[];
  stats: Stats;
  evolutionMensuelle: EvolutionMensuelle[];
}

export const ParentAbsences: React.FC = () => {
  const { etudiantId } = useParams<{ etudiantId: string }>();
  const navigate = useNavigate();
  const [data, setData] = useState<AbsencesData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState({
    dateDebut: '',
    dateFin: '',
    statut: 'tous'
  });
  const [showJustifyModal, setShowJustifyModal] = useState(false);
  const [selectedAbsence, setSelectedAbsence] = useState<Absence | null>(null);
  const [justificationForm, setJustificationForm] = useState({
    motif: '',
    justificatifUrl: ''
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadAbsences();
  }, [etudiantId, filters]);

  const loadAbsences = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (filters.dateDebut) params.append('dateDebut', filters.dateDebut);
      if (filters.dateFin) params.append('dateFin', filters.dateFin);
      if (filters.statut !== 'tous') params.append('statut', filters.statut);

      const response = await axios.get(
        `/api/v1/portail/parent/enfants/${etudiantId}/absences?${params.toString()}`
      );
      setData(response.data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erreur lors du chargement des absences');
    } finally {
      setLoading(false);
    }
  };

  const handleJustify = (absence: Absence) => {
    setSelectedAbsence(absence);
    setShowJustifyModal(true);
  };

  const submitJustification = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAbsence) return;

    try {
      setSubmitting(true);
      await axios.post(`/api/v1/portail/parent/enfants/${etudiantId}/absences/justifier`, {
        etudiantId,
        presenceId: selectedAbsence.id,
        motif: justificationForm.motif,
        justificatifUrl: justificationForm.justificatifUrl
      });

      alert('Absence justifiée avec succès !');
      setShowJustifyModal(false);
      setJustificationForm({ motif: '', justificatifUrl: '' });
      loadAbsences();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Erreur lors de la justification');
    } finally {
      setSubmitting(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    });
  };

  const formatTime = (timeString: string) => {
    return timeString ? timeString.substring(0, 5) : '';
  };

  const getStatutBadge = (statut: string) => {
    const badges: Record<string, string> = {
      'absent': 'danger',
      'retard': 'warning',
      'present': 'success'
    };
    return badges[statut] || 'secondary';
  };

  const getStatutLabel = (statut: string) => {
    const labels: Record<string, string> = {
      'absent': 'Absent',
      'retard': 'Retard',
      'present': 'Présent'
    };
    return labels[statut] || statut;
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '400px' }}>
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Chargement...</span>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="container mt-4">
        <div className="alert alert-danger" role="alert">
          <i className="bi bi-exclamation-triangle me-2"></i>
          {error || 'Données non disponibles'}
        </div>
        <button className="btn btn-primary" onClick={() => navigate(-1)}>
          <i className="bi bi-arrow-left me-2"></i>
          Retour
        </button>
      </div>
    );
  }

  return (
    <div className="container-fluid py-4">
      {/* En-tête */}
      <div className="row mb-4">
        <div className="col-12">
          <button className="btn btn-outline-secondary mb-3" onClick={() => navigate(-1)}>
            <i className="bi bi-arrow-left me-2"></i>
            Retour au tableau de bord
          </button>
          <h3>
            <i className="bi bi-calendar-x me-2"></i>
            Suivi des Absences et Retards
          </h3>
        </div>
      </div>

      {/* Filtres */}
      <div className="row mb-4">
        <div className="col-12">
          <div className="card shadow-sm">
            <div className="card-body">
              <div className="row g-3">
                <div className="col-md-3">
                  <label className="form-label">Date de début</label>
                  <input
                    type="date"
                    className="form-control"
                    value={filters.dateDebut}
                    onChange={(e) => setFilters({ ...filters, dateDebut: e.target.value })}
                  />
                </div>
                <div className="col-md-3">
                  <label className="form-label">Date de fin</label>
                  <input
                    type="date"
                    className="form-control"
                    value={filters.dateFin}
                    onChange={(e) => setFilters({ ...filters, dateFin: e.target.value })}
                  />
                </div>
                <div className="col-md-3">
                  <label className="form-label">Statut</label>
                  <select
                    className="form-select"
                    value={filters.statut}
                    onChange={(e) => setFilters({ ...filters, statut: e.target.value })}
                  >
                    <option value="tous">Tous</option>
                    <option value="absent">Absences uniquement</option>
                    <option value="retard">Retards uniquement</option>
                  </select>
                </div>
                <div className="col-md-3 d-flex align-items-end">
                  <button
                    className="btn btn-outline-secondary w-100"
                    onClick={() => setFilters({ dateDebut: '', dateFin: '', statut: 'tous' })}
                  >
                    <i className="bi bi-x-circle me-2"></i>
                    Réinitialiser
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Statistiques */}
      <div className="row mb-4">
        <div className="col-md-3">
          <div className="card shadow-sm border-danger">
            <div className="card-body text-center">
              <i className="bi bi-x-circle text-danger" style={{ fontSize: '2.5rem' }}></i>
              <h3 className="mt-2 mb-0 text-danger">{data.stats.absences_injustifiees}</h3>
              <small className="text-muted">Absences non justifiées</small>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card shadow-sm border-success">
            <div className="card-body text-center">
              <i className="bi bi-check-circle text-success" style={{ fontSize: '2.5rem' }}></i>
              <h3 className="mt-2 mb-0 text-success">{data.stats.absences_justifiees}</h3>
              <small className="text-muted">Absences justifiées</small>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card shadow-sm border-warning">
            <div className="card-body text-center">
              <i className="bi bi-clock text-warning" style={{ fontSize: '2.5rem' }}></i>
              <h3 className="mt-2 mb-0 text-warning">{data.stats.retards}</h3>
              <small className="text-muted">Retards</small>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card shadow-sm border-info">
            <div className="card-body text-center">
              <i className="bi bi-graph-up text-info" style={{ fontSize: '2.5rem' }}></i>
              <h3 className="mt-2 mb-0 text-info">{data.stats.taux_assiduite?.toFixed(1)}%</h3>
              <small className="text-muted">Taux d'assiduité</small>
            </div>
          </div>
        </div>
      </div>

      {/* Évolution mensuelle */}
      {data.evolutionMensuelle && data.evolutionMensuelle.length > 0 && (
        <div className="row mb-4">
          <div className="col-12">
            <div className="card shadow-sm">
              <div className="card-header bg-white">
                <h5 className="mb-0">
                  <i className="bi bi-bar-chart me-2"></i>
                  Évolution Mensuelle
                </h5>
              </div>
              <div className="card-body">
                <div className="table-responsive">
                  <table className="table table-sm">
                    <thead>
                      <tr>
                        <th>Mois</th>
                        <th className="text-center">Absences</th>
                        <th className="text-center">Retards</th>
                        <th className="text-center">Total Séances</th>
                        <th className="text-center">Taux Présence</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.evolutionMensuelle.map((mois) => {
                        const tauxPresence = ((mois.total_seances - mois.absences) / mois.total_seances * 100).toFixed(1);
                        return (
                          <tr key={mois.mois}>
                            <td>{mois.mois}</td>
                            <td className="text-center">
                              <span className="badge bg-danger">{mois.absences}</span>
                            </td>
                            <td className="text-center">
                              <span className="badge bg-warning">{mois.retards}</span>
                            </td>
                            <td className="text-center">{mois.total_seances}</td>
                            <td className="text-center">
                              <strong className={parseFloat(tauxPresence) >= 80 ? 'text-success' : 'text-danger'}>
                                {tauxPresence}%
                              </strong>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Liste des absences */}
      <div className="row">
        <div className="col-12">
          <div className="card shadow-sm">
            <div className="card-header bg-white">
              <h5 className="mb-0">
                <i className="bi bi-list-ul me-2"></i>
                Liste Détaillée ({data.absences.length})
              </h5>
            </div>
            <div className="card-body">
              {data.absences.length > 0 ? (
                <div className="table-responsive">
                  <table className="table table-hover">
                    <thead>
                      <tr>
                        <th>Date</th>
                        <th>Horaire</th>
                        <th>Matière</th>
                        <th>Enseignant</th>
                        <th>Salle</th>
                        <th className="text-center">Statut</th>
                        <th className="text-center">Justifié</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.absences.map((absence) => (
                        <tr key={absence.id} className={!absence.justifie && absence.statut === 'absent' ? 'table-danger' : ''}>
                          <td>{formatDate(absence.date_seance)}</td>
                          <td>
                            <small>
                              {formatTime(absence.heure_debut)} - {formatTime(absence.heure_fin)}
                              {absence.heure_arrivee && (
                                <><br /><span className="text-warning">Arrivée: {formatTime(absence.heure_arrivee)}</span></>
                              )}
                            </small>
                          </td>
                          <td>
                            <strong>{absence.matiere}</strong>
                            <br />
                            <small className="text-muted">{absence.ue_nom}</small>
                          </td>
                          <td>
                            <small>{absence.enseignant_prenom} {absence.enseignant_nom}</small>
                          </td>
                          <td><small>{absence.salle}</small></td>
                          <td className="text-center">
                            <span className={`badge bg-${getStatutBadge(absence.statut)}`}>
                              {getStatutLabel(absence.statut)}
                            </span>
                          </td>
                          <td className="text-center">
                            {absence.justifie ? (
                              <span className="badge bg-success">
                                <i className="bi bi-check-circle me-1"></i>
                                Oui
                              </span>
                            ) : (
                              <span className="badge bg-danger">
                                <i className="bi bi-x-circle me-1"></i>
                                Non
                              </span>
                            )}
                          </td>
                          <td>
                            {!absence.justifie && absence.statut === 'absent' && (
                              <button
                                className="btn btn-sm btn-outline-primary"
                                onClick={() => handleJustify(absence)}
                              >
                                <i className="bi bi-file-earmark-text me-1"></i>
                                Justifier
                              </button>
                            )}
                            {absence.justificatif_url && (
                              <a
                                href={absence.justificatif_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="btn btn-sm btn-outline-info ms-1"
                              >
                                <i className="bi bi-eye me-1"></i>
                                Voir
                              </a>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-4">
                  <i className="bi bi-check-circle text-success" style={{ fontSize: '3rem' }}></i>
                  <p className="text-success mt-3">Aucune absence ou retard enregistré</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Modal de justification */}
      {showJustifyModal && selectedAbsence && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">
                  <i className="bi bi-file-earmark-text me-2"></i>
                  Justifier l'Absence
                </h5>
                <button type="button" className="btn-close" onClick={() => setShowJustifyModal(false)}></button>
              </div>
              <form onSubmit={submitJustification}>
                <div className="modal-body">
                  <div className="alert alert-info">
                    <strong>Date:</strong> {formatDate(selectedAbsence.date_seance)}<br />
                    <strong>Matière:</strong> {selectedAbsence.matiere}
                  </div>

                  <div className="mb-3">
                    <label className="form-label">Motif de l'absence *</label>
                    <textarea
                      className="form-control"
                      rows={4}
                      value={justificationForm.motif}
                      onChange={(e) => setJustificationForm({ ...justificationForm, motif: e.target.value })}
                      required
                      placeholder="Expliquez la raison de l'absence..."
                    ></textarea>
                  </div>

                  <div className="mb-3">
                    <label className="form-label">Justificatif (URL)</label>
                    <input
                      type="url"
                      className="form-control"
                      value={justificationForm.justificatifUrl}
                      onChange={(e) => setJustificationForm({ ...justificationForm, justificatifUrl: e.target.value })}
                      placeholder="https://..."
                    />
                    <small className="text-muted">
                      Certificat médical, convocation, etc. (optionnel)
                    </small>
                  </div>
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-secondary" onClick={() => setShowJustifyModal(false)}>
                    Annuler
                  </button>
                  <button type="submit" className="btn btn-primary" disabled={submitting}>
                    {submitting ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2"></span>
                        Envoi...
                      </>
                    ) : (
                      <>
                        <i className="bi bi-send me-2"></i>
                        Soumettre
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ParentAbsences;

// Made with Bob
