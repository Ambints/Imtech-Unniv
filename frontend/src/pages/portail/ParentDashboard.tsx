import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuthStore } from '../../store/authStore';

interface Enfant {
  id: string;
  nom: string;
  prenom: string;
  matricule: string;
  photo_url: string;
  age: number;
  parcours: string;
  parcours_code: string;
  niveau_etude: string;
  annee_academique: string;
  annee_niveau: number;
  statut_inscription: string;
  departement: string;
}

interface DashboardData {
  absences: {
    absences_injustifiees: number;
    retards: number;
    total_absences: number;
  };
  financier: {
    montant_total: number;
    montant_paye: number;
    reste_a_payer: number;
  };
  dernieresNotes: Array<{
    valeur: number;
    mention: string;
    type_evaluation: string;
    matiere: string;
    ue_nom: string;
    created_at: string;
  }>;
  prochainEcheance: {
    num_tranche: number;
    montant_du: number;
    date_echeance: string;
    statut: string;
  } | null;
}

export const ParentDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [enfants, setEnfants] = useState<Enfant[]>([]);
  const [enfantActif, setEnfantActif] = useState<Enfant | null>(null);
  const [dashboard, setDashboard] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadEnfants();
  }, []);

  useEffect(() => {
    if (enfantActif) {
      loadDashboard(enfantActif.id);
    }
  }, [enfantActif]);

  const loadEnfants = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/v1/portail/parent/enfants');
      setEnfants(response.data);
      if (response.data.length > 0) {
        setEnfantActif(response.data[0]);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erreur lors du chargement des enfants');
    } finally {
      setLoading(false);
    }
  };

  const loadDashboard = async (etudiantId: string) => {
    try {
      const response = await axios.get(`/api/v1/portail/parent/enfants/${etudiantId}/dashboard`);
      setDashboard(response.data);
    } catch (err: any) {
      console.error('Erreur lors du chargement du dashboard:', err);
    }
  };

  const getMentionColor = (mention: string) => {
    switch (mention) {
      case 'Très Bien': return 'text-success';
      case 'Bien': return 'text-info';
      case 'Assez Bien': return 'text-primary';
      case 'Passable': return 'text-warning';
      default: return 'text-danger';
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-MG', {
      style: 'currency',
      currency: 'MGA',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    });
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

  if (error) {
    return (
      <div className="alert alert-danger m-4" role="alert">
        <i className="bi bi-exclamation-triangle me-2"></i>
        {error}
      </div>
    );
  }

  if (enfants.length === 0) {
    return (
      <div className="container mt-5">
        <div className="row justify-content-center">
          <div className="col-md-8 col-lg-6">
            <div className="card shadow-lg border-0">
              <div className="card-body text-center py-5">
                {/* Icône d'alerte */}
                <div className="mb-4">
                  <i className="bi bi-exclamation-triangle-fill text-warning" style={{ fontSize: '5rem' }}></i>
                </div>
                
                {/* Message principal en GRAND */}
                <h2 className="text-danger fw-bold mb-4" style={{ fontSize: '2rem' }}>
                  VOTRE EMAIL N'EST ASSOCIÉ À AUCUN ÉTUDIANT
                </h2>
                
                {/* Message explicatif */}
                <div className="alert alert-warning mb-4" role="alert">
                  <p className="mb-2">
                    <strong>Votre adresse email :</strong> <code className="fs-5">{(user as any)?.email}</code>
                  </p>
                  <p className="mb-0">
                    Cette adresse n'est actuellement liée à aucun étudiant dans notre système.
                  </p>
                </div>
                
                {/* Instructions */}
                <div className="text-start mb-4">
                  <h5 className="text-primary mb-3">
                    <i className="bi bi-info-circle me-2"></i>
                    Que faire ?
                  </h5>
                  <ol className="list-group list-group-numbered">
                    <li className="list-group-item">
                      <strong>Vérifiez votre email :</strong> Assurez-vous que l'email utilisé pour vous connecter est bien celui communiqué à l'établissement.
                    </li>
                    <li className="list-group-item">
                      <strong>Contactez le secrétariat :</strong> Demandez à ce que votre email soit associé au dossier de votre enfant.
                    </li>
                    <li className="list-group-item">
                      <strong>Fournissez les informations :</strong> Nom, prénom et matricule de votre enfant pour faciliter l'association.
                    </li>
                  </ol>
                </div>
                
                {/* Boutons d'action */}
                <div className="d-grid gap-2 d-md-flex justify-content-md-center">
                  <button
                    className="btn btn-primary btn-lg"
                    onClick={() => navigate('/contact')}
                  >
                    <i className="bi bi-envelope me-2"></i>
                    Contacter l'Administration
                  </button>
                  <button
                    className="btn btn-outline-secondary btn-lg"
                    onClick={() => navigate('/profil')}
                  >
                    <i className="bi bi-person-circle me-2"></i>
                    Voir mon Profil
                  </button>
                </div>
                
                {/* Note technique */}
                <div className="mt-4 p-3 bg-light rounded">
                  <small className="text-muted">
                    <i className="bi bi-shield-check me-1"></i>
                    <strong>Note :</strong> Pour des raisons de sécurité, seuls les parents dont l'email correspond exactement
                    au champ "email_parent" dans le dossier étudiant peuvent accéder aux informations.
                  </small>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container-fluid py-4">
      {/* En-tête avec sélecteur d'enfant */}
      <div className="row mb-4">
        <div className="col-12">
          <div className="card shadow-sm">
            <div className="card-body">
              <div className="row align-items-center">
                <div className="col-md-6">
                  <h4 className="mb-0">
                    <i className="bi bi-house-heart me-2"></i>
                    Portail Parent
                  </h4>
                  <p className="text-muted mb-0">Bienvenue, {(user as any)?.nom} {(user as any)?.prenom}</p>
                </div>
                <div className="col-md-6">
                  <label className="form-label">Sélectionner un enfant:</label>
                  <select
                    className="form-select"
                    value={enfantActif?.id || ''}
                    onChange={(e) => {
                      const enfant = enfants.find(enf => enf.id === e.target.value);
                      setEnfantActif(enfant || null);
                    }}
                  >
                    {enfants.map(enfant => (
                      <option key={enfant.id} value={enfant.id}>
                        {enfant.prenom} {enfant.nom} - {enfant.parcours} (Niveau {enfant.annee_niveau})
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {enfantActif && (
        <>
          {/* Carte d'information de l'enfant */}
          <div className="row mb-4">
            <div className="col-12">
              <div className="card shadow-sm border-primary">
                <div className="card-body">
                  <div className="row align-items-center">
                    <div className="col-auto">
                      {enfantActif.photo_url ? (
                        <img
                          src={enfantActif.photo_url}
                          alt={`${enfantActif.prenom} ${enfantActif.nom}`}
                          className="rounded-circle"
                          style={{ width: '80px', height: '80px', objectFit: 'cover' }}
                        />
                      ) : (
                        <div
                          className="rounded-circle bg-primary text-white d-flex align-items-center justify-content-center"
                          style={{ width: '80px', height: '80px', fontSize: '2rem' }}
                        >
                          {enfantActif.prenom[0]}{enfantActif.nom[0]}
                        </div>
                      )}
                    </div>
                    <div className="col">
                      <h5 className="mb-1">{enfantActif.prenom} {enfantActif.nom}</h5>
                      <p className="text-muted mb-1">
                        <strong>Matricule:</strong> {enfantActif.matricule} | 
                        <strong className="ms-2">Âge:</strong> {enfantActif.age} ans
                      </p>
                      <p className="mb-0">
                        <span className="badge bg-primary me-2">{enfantActif.parcours}</span>
                        <span className="badge bg-info me-2">{enfantActif.niveau_etude} - Niveau {enfantActif.annee_niveau}</span>
                        <span className="badge bg-secondary">{enfantActif.departement}</span>
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Cartes de statistiques */}
          {dashboard && (
            <>
              <div className="row mb-4">
                {/* Absences */}
                <div className="col-md-3 mb-3">
                  <div className="card shadow-sm h-100 border-start border-danger border-4">
                    <div className="card-body">
                      <div className="d-flex justify-content-between align-items-center mb-2">
                        <h6 className="text-muted mb-0">Absences ce mois</h6>
                        <i className="bi bi-calendar-x text-danger fs-4"></i>
                      </div>
                      <h3 className="mb-1">{dashboard.absences.total_absences}</h3>
                      <small className="text-danger">
                        {dashboard.absences.absences_injustifiees} non justifiées
                      </small>
                      <div className="mt-2">
                        <small className="text-muted">
                          {dashboard.absences.retards} retards
                        </small>
                      </div>
                      <button
                        className="btn btn-sm btn-outline-danger mt-3 w-100"
                        onClick={() => navigate(`/portail/parent/enfants/${enfantActif.id}/absences`)}
                      >
                        Voir détails
                      </button>
                    </div>
                  </div>
                </div>

                {/* Situation financière */}
                <div className="col-md-3 mb-3">
                  <div className="card shadow-sm h-100 border-start border-success border-4">
                    <div className="card-body">
                      <div className="d-flex justify-content-between align-items-center mb-2">
                        <h6 className="text-muted mb-0">Situation financière</h6>
                        <i className="bi bi-cash-coin text-success fs-4"></i>
                      </div>
                      <h3 className="mb-1 text-success">
                        {formatCurrency(dashboard.financier.montant_paye)}
                      </h3>
                      <small className="text-muted">
                        sur {formatCurrency(dashboard.financier.montant_total)}
                      </small>
                      <div className="progress mt-2" style={{ height: '8px' }}>
                        <div
                          className="progress-bar bg-success"
                          role="progressbar"
                          style={{
                            width: `${(dashboard.financier.montant_paye / dashboard.financier.montant_total) * 100}%`
                          }}
                        ></div>
                      </div>
                      <small className={`mt-2 d-block ${dashboard.financier.reste_a_payer > 0 ? 'text-warning' : 'text-success'}`}>
                        Reste: {formatCurrency(dashboard.financier.reste_a_payer)}
                      </small>
                      <button
                        className="btn btn-sm btn-outline-success mt-2 w-100"
                        onClick={() => navigate(`/portail/parent/enfants/${enfantActif.id}/finances`)}
                      >
                        Voir détails
                      </button>
                    </div>
                  </div>
                </div>

                {/* Prochaine échéance */}
                <div className="col-md-3 mb-3">
                  <div className="card shadow-sm h-100 border-start border-warning border-4">
                    <div className="card-body">
                      <div className="d-flex justify-content-between align-items-center mb-2">
                        <h6 className="text-muted mb-0">Prochaine échéance</h6>
                        <i className="bi bi-calendar-event text-warning fs-4"></i>
                      </div>
                      {dashboard.prochainEcheance ? (
                        <>
                          <h3 className="mb-1 text-warning">
                            {formatCurrency(dashboard.prochainEcheance.montant_du)}
                          </h3>
                          <small className="text-muted">
                            Tranche {dashboard.prochainEcheance.num_tranche}
                          </small>
                          <div className="mt-2">
                            <small className="text-danger">
                              <i className="bi bi-clock me-1"></i>
                              {formatDate(dashboard.prochainEcheance.date_echeance)}
                            </small>
                          </div>
                          <button
                            className="btn btn-sm btn-warning mt-3 w-100"
                            onClick={() => navigate(`/portail/parent/enfants/${enfantActif.id}/finances`)}
                          >
                            Payer maintenant
                          </button>
                        </>
                      ) : (
                        <div className="text-center py-3">
                          <i className="bi bi-check-circle text-success fs-1"></i>
                          <p className="text-success mb-0 mt-2">Aucune échéance en attente</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Dernières notes */}
                <div className="col-md-3 mb-3">
                  <div className="card shadow-sm h-100 border-start border-info border-4">
                    <div className="card-body">
                      <div className="d-flex justify-content-between align-items-center mb-2">
                        <h6 className="text-muted mb-0">Dernières notes</h6>
                        <i className="bi bi-journal-text text-info fs-4"></i>
                      </div>
                      {dashboard.dernieresNotes.length > 0 ? (
                        <>
                          <div className="mb-2">
                            <h3 className="mb-0">{dashboard.dernieresNotes[0].valeur}/20</h3>
                            <small className={getMentionColor(dashboard.dernieresNotes[0].mention)}>
                              {dashboard.dernieresNotes[0].mention}
                            </small>
                          </div>
                          <small className="text-muted d-block text-truncate">
                            {dashboard.dernieresNotes[0].matiere}
                          </small>
                          <button
                            className="btn btn-sm btn-outline-info mt-3 w-100"
                            onClick={() => navigate(`/portail/parent/enfants/${enfantActif.id}/bulletin`)}
                          >
                            Voir bulletin
                          </button>
                        </>
                      ) : (
                        <div className="text-center py-3">
                          <i className="bi bi-journal-x text-muted fs-1"></i>
                          <p className="text-muted mb-0 mt-2">Aucune note disponible</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Dernières notes détaillées */}
              {dashboard.dernieresNotes.length > 0 && (
                <div className="row mb-4">
                  <div className="col-12">
                    <div className="card shadow-sm">
                      <div className="card-header bg-white">
                        <h5 className="mb-0">
                          <i className="bi bi-graph-up me-2"></i>
                          Dernières notes
                        </h5>
                      </div>
                      <div className="card-body">
                        <div className="table-responsive">
                          <table className="table table-hover">
                            <thead>
                              <tr>
                                <th>Matière</th>
                                <th>UE</th>
                                <th>Type</th>
                                <th>Note</th>
                                <th>Mention</th>
                                <th>Date</th>
                              </tr>
                            </thead>
                            <tbody>
                              {dashboard.dernieresNotes.map((note, index) => (
                                <tr key={index}>
                                  <td>{note.matiere}</td>
                                  <td><small className="text-muted">{note.ue_nom}</small></td>
                                  <td>
                                    <span className="badge bg-secondary">{note.type_evaluation}</span>
                                  </td>
                                  <td>
                                    <strong className={note.valeur >= 10 ? 'text-success' : 'text-danger'}>
                                      {note.valeur}/20
                                    </strong>
                                  </td>
                                  <td>
                                    <span className={getMentionColor(note.mention)}>
                                      {note.mention}
                                    </span>
                                  </td>
                                  <td>
                                    <small className="text-muted">
                                      {formatDate(note.created_at)}
                                    </small>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}

          {/* Actions rapides */}
          <div className="row">
            <div className="col-12">
              <div className="card shadow-sm">
                <div className="card-header bg-white">
                  <h5 className="mb-0">
                    <i className="bi bi-lightning me-2"></i>
                    Actions rapides
                  </h5>
                </div>
                <div className="card-body">
                  <div className="row g-3">
                    <div className="col-md-3">
                      <button
                        className="btn btn-outline-primary w-100"
                        onClick={() => navigate(`/portail/parent/enfants/${enfantActif.id}/bulletin`)}
                      >
                        <i className="bi bi-file-earmark-text d-block fs-3 mb-2"></i>
                        Consulter le bulletin
                      </button>
                    </div>
                    <div className="col-md-3">
                      <button
                        className="btn btn-outline-success w-100"
                        onClick={() => navigate(`/portail/parent/enfants/${enfantActif.id}/finances`)}
                      >
                        <i className="bi bi-credit-card d-block fs-3 mb-2"></i>
                        Effectuer un paiement
                      </button>
                    </div>
                    <div className="col-md-3">
                      <button
                        className="btn btn-outline-warning w-100"
                        onClick={() => navigate('/portail/parent/autorisations/nouvelle')}
                      >
                        <i className="bi bi-door-open d-block fs-3 mb-2"></i>
                        Autoriser une sortie
                      </button>
                    </div>
                    <div className="col-md-3">
                      <button
                        className="btn btn-outline-info w-100"
                        onClick={() => navigate('/portail/parent/messages')}
                      >
                        <i className="bi bi-chat-dots d-block fs-3 mb-2"></i>
                        Envoyer un message
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default ParentDashboard;

// Made with Bob
