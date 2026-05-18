import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

interface Note {
  id: string;
  valeur: number;
  mention: string;
  type_evaluation: string;
  date_saisie: string;
  ec_id: string;
  ec_code: string;
  ec_nom: string;
  ec_coefficient: number;
  ue_id: string;
  ue_code: string;
  ue_nom: string;
  credits_ects: number;
  ue_coefficient: number;
  semestre: number;
  session: string;
  type_session: string;
}

interface MoyenneUE {
  ue_id: string;
  code: string;
  intitule: string;
  credits_ects: number;
  coefficient: number;
  semestre: number;
  moyenne_ue: number;
  note_min: number;
  note_max: number;
  nb_notes: number;
  nb_matieres: number;
}

interface BulletinData {
  notes: Note[];
  moyennesUE: MoyenneUE[];
  moyenneGenerale: number;
  totalCredits: number;
}

export const ParentBulletin: React.FC = () => {
  const { etudiantId } = useParams<{ etudiantId: string }>();
  const navigate = useNavigate();
  const [bulletin, setBulletin] = useState<BulletinData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState({
    sessionId: '',
    anneeAcademiqueId: '',
    semestre: ''
  });

  useEffect(() => {
    loadBulletin();
  }, [etudiantId, filters]);

  const loadBulletin = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (filters.sessionId) params.append('sessionId', filters.sessionId);
      if (filters.anneeAcademiqueId) params.append('anneeAcademiqueId', filters.anneeAcademiqueId);
      if (filters.semestre) params.append('semestre', filters.semestre);

      const response = await axios.get(
        `/api/v1/portail/parent/enfants/${etudiantId}/bulletin?${params.toString()}`
      );
      setBulletin(response.data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erreur lors du chargement du bulletin');
    } finally {
      setLoading(false);
    }
  };

  const getMentionColor = (mention: string) => {
    const colors: Record<string, string> = {
      'Très Bien': 'success',
      'Bien': 'info',
      'Assez Bien': 'primary',
      'Passable': 'warning',
      'Insuffisant': 'danger'
    };
    return colors[mention] || 'secondary';
  };

  const getMentionGenerale = (moyenne: number) => {
    if (moyenne >= 16) return 'Très Bien';
    if (moyenne >= 14) return 'Bien';
    if (moyenne >= 12) return 'Assez Bien';
    if (moyenne >= 10) return 'Passable';
    return 'Insuffisant';
  };

  const exportPDF = () => {
    // TODO: Implémenter l'export PDF
    alert('Export PDF en cours de développement');
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

  if (error || !bulletin) {
    return (
      <div className="container mt-4">
        <div className="alert alert-danger" role="alert">
          <i className="bi bi-exclamation-triangle me-2"></i>
          {error || 'Bulletin non disponible'}
        </div>
        <button className="btn btn-primary" onClick={() => navigate(-1)}>
          <i className="bi bi-arrow-left me-2"></i>
          Retour
        </button>
      </div>
    );
  }

  // Grouper les notes par semestre
  const notesBySemestre = bulletin.moyennesUE.reduce((acc, ue) => {
    if (!acc[ue.semestre]) acc[ue.semestre] = [];
    acc[ue.semestre].push(ue);
    return acc;
  }, {} as Record<number, MoyenneUE[]>);

  return (
    <div className="container-fluid py-4">
      {/* En-tête */}
      <div className="row mb-4">
        <div className="col-12">
          <button className="btn btn-outline-secondary mb-3" onClick={() => navigate(-1)}>
            <i className="bi bi-arrow-left me-2"></i>
            Retour au tableau de bord
          </button>
          <div className="d-flex justify-content-between align-items-center">
            <div>
              <h3>
                <i className="bi bi-journal-text me-2"></i>
                Bulletin de Notes
              </h3>
            </div>
            <button className="btn btn-primary" onClick={exportPDF}>
              <i className="bi bi-file-pdf me-2"></i>
              Exporter en PDF
            </button>
          </div>
        </div>
      </div>

      {/* Filtres */}
      <div className="row mb-4">
        <div className="col-12">
          <div className="card shadow-sm">
            <div className="card-body">
              <div className="row g-3">
                <div className="col-md-4">
                  <label className="form-label">Semestre</label>
                  <select
                    className="form-select"
                    value={filters.semestre}
                    onChange={(e) => setFilters({ ...filters, semestre: e.target.value })}
                  >
                    <option value="">Tous les semestres</option>
                    <option value="1">Semestre 1</option>
                    <option value="2">Semestre 2</option>
                  </select>
                </div>
                <div className="col-md-4">
                  <label className="form-label">Session</label>
                  <select
                    className="form-select"
                    value={filters.sessionId}
                    onChange={(e) => setFilters({ ...filters, sessionId: e.target.value })}
                  >
                    <option value="">Toutes les sessions</option>
                    {/* TODO: Charger les sessions dynamiquement */}
                  </select>
                </div>
                <div className="col-md-4 d-flex align-items-end">
                  <button
                    className="btn btn-outline-secondary w-100"
                    onClick={() => setFilters({ sessionId: '', anneeAcademiqueId: '', semestre: '' })}
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

      {/* Moyenne générale */}
      <div className="row mb-4">
        <div className="col-md-4">
          <div className="card shadow-sm border-primary">
            <div className="card-body text-center">
              <h6 className="text-muted mb-2">Moyenne Générale</h6>
              <h1 className={`display-3 mb-2 text-${bulletin.moyenneGenerale >= 10 ? 'success' : 'danger'}`}>
                {bulletin.moyenneGenerale.toFixed(2)}/20
              </h1>
              <span className={`badge bg-${getMentionColor(getMentionGenerale(bulletin.moyenneGenerale))} fs-6`}>
                {getMentionGenerale(bulletin.moyenneGenerale)}
              </span>
            </div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card shadow-sm">
            <div className="card-body text-center">
              <h6 className="text-muted mb-2">Total Crédits ECTS</h6>
              <h1 className="display-3 mb-2 text-info">
                {bulletin.totalCredits}
              </h1>
              <small className="text-muted">crédits validés</small>
            </div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card shadow-sm">
            <div className="card-body text-center">
              <h6 className="text-muted mb-2">Nombre de Notes</h6>
              <h1 className="display-3 mb-2 text-secondary">
                {bulletin.notes.length}
              </h1>
              <small className="text-muted">notes enregistrées</small>
            </div>
          </div>
        </div>
      </div>

      {/* Notes par semestre */}
      {Object.keys(notesBySemestre).sort().map((semestre) => (
        <div key={semestre} className="row mb-4">
          <div className="col-12">
            <div className="card shadow-sm">
              <div className="card-header bg-primary text-white">
                <h5 className="mb-0">
                  <i className="bi bi-calendar3 me-2"></i>
                  Semestre {semestre}
                </h5>
              </div>
              <div className="card-body">
                <div className="table-responsive">
                  <table className="table table-hover">
                    <thead>
                      <tr>
                        <th>Code UE</th>
                        <th>Unité d'Enseignement</th>
                        <th className="text-center">Crédits ECTS</th>
                        <th className="text-center">Coefficient</th>
                        <th className="text-center">Moyenne</th>
                        <th className="text-center">Min/Max</th>
                        <th className="text-center">Nb Notes</th>
                        <th className="text-center">Mention</th>
                      </tr>
                    </thead>
                    <tbody>
                      {notesBySemestre[parseInt(semestre)].map((ue) => {
                        const mention = getMentionGenerale(ue.moyenne_ue);
                        return (
                          <tr key={ue.ue_id}>
                            <td><strong>{ue.code}</strong></td>
                            <td>{ue.intitule}</td>
                            <td className="text-center">{ue.credits_ects}</td>
                            <td className="text-center">{ue.coefficient}</td>
                            <td className="text-center">
                              <strong className={ue.moyenne_ue >= 10 ? 'text-success' : 'text-danger'}>
                                {ue.moyenne_ue.toFixed(2)}/20
                              </strong>
                            </td>
                            <td className="text-center">
                              <small className="text-muted">
                                {ue.note_min.toFixed(1)} / {ue.note_max.toFixed(1)}
                              </small>
                            </td>
                            <td className="text-center">
                              <span className="badge bg-secondary">{ue.nb_notes}</span>
                            </td>
                            <td className="text-center">
                              <span className={`badge bg-${getMentionColor(mention)}`}>
                                {mention}
                              </span>
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
      ))}

      {/* Détail des notes */}
      <div className="row">
        <div className="col-12">
          <div className="card shadow-sm">
            <div className="card-header bg-white">
              <h5 className="mb-0">
                <i className="bi bi-list-check me-2"></i>
                Détail des Notes par Matière
              </h5>
            </div>
            <div className="card-body">
              {bulletin.notes.length > 0 ? (
                <div className="table-responsive">
                  <table className="table table-sm table-hover">
                    <thead>
                      <tr>
                        <th>Date</th>
                        <th>UE</th>
                        <th>Matière (EC)</th>
                        <th>Type</th>
                        <th className="text-center">Coef.</th>
                        <th className="text-center">Note</th>
                        <th className="text-center">Mention</th>
                        <th>Session</th>
                      </tr>
                    </thead>
                    <tbody>
                      {bulletin.notes.map((note) => (
                        <tr key={note.id}>
                          <td>
                            <small>{new Date(note.date_saisie).toLocaleDateString('fr-FR')}</small>
                          </td>
                          <td>
                            <small className="text-muted">{note.ue_code}</small>
                          </td>
                          <td>
                            <strong>{note.ec_nom}</strong>
                            <br />
                            <small className="text-muted">{note.ec_code}</small>
                          </td>
                          <td>
                            <span className="badge bg-info">{note.type_evaluation}</span>
                          </td>
                          <td className="text-center">{note.ec_coefficient}</td>
                          <td className="text-center">
                            <strong className={note.valeur >= 10 ? 'text-success' : 'text-danger'}>
                              {note.valeur.toFixed(2)}/20
                            </strong>
                          </td>
                          <td className="text-center">
                            <span className={`badge bg-${getMentionColor(note.mention)}`}>
                              {note.mention}
                            </span>
                          </td>
                          <td>
                            <small>{note.session}</small>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-4">
                  <i className="bi bi-inbox text-muted" style={{ fontSize: '3rem' }}></i>
                  <p className="text-muted mt-3">Aucune note disponible</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ParentBulletin;

// Made with Bob
