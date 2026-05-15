import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../../store/authStore';
import { CheckCircle, AlertCircle, BookOpen, Calendar, CreditCard, User, ArrowRight, X, Check } from 'lucide-react';
import { PaiementInscriptionCard } from '../../../components/etudiant/PaiementInscriptionCard';

interface Departement {
  id: string;
  code: string;
  nom: string;
  description: string;
  nombre_parcours: number;
}

interface NiveauEtude {
  id: string;
  code: string;
  libelle: string;
  description: string;
  ordre: number;
  type_diplome: string;
}

interface Parcours {
  id: string;
  code: string;
  nom: string;
  niveau: string;
  departement_id: string;
  departement_nom: string;
  departement_code: string;
  nombre_ues: number;
}

interface AnneeAcademique {
  id: string;
  libelle: string;
  annee_debut: number;
  annee_fin: number;
  statut: string;
}

interface Inscription {
  id: string;
  parcours_nom: string;
  parcours_code: string;
  annee_academique: string;
  statut: string;
  date_inscription: string;
}

export const InscriptionEtudiantPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, tenant } = useAuthStore();
  const [inscriptions, setInscriptions] = useState<Inscription[]>([]);
  const [departements, setDepartements] = useState<Departement[]>([]);
  const [parcoursDisponibles, setParcoursDisponibles] = useState<Parcours[]>([]);
  const [anneesAcademiques, setAnneesAcademiques] = useState<AnneeAcademique[]>([]);
  const [niveauxEtude, setNiveauxEtude] = useState<NiveauEtude[]>([]);
  const [selectedDepartement, setSelectedDepartement] = useState<string>('');
  const [selectedParcours, setSelectedParcours] = useState<string>('');
  const [selectedAnnee, setSelectedAnnee] = useState<string>('');
  const [selectedNiveau, setSelectedNiveau] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');
  const [showInscriptionForm, setShowInscriptionForm] = useState(false);

  useEffect(() => {
    if (!user || user.role !== 'etudiant') {
      navigate('/login');
      return;
    }
    loadData();
  }, [user, navigate]);

  const loadData = async () => {
    try {
      const { accessToken } = useAuthStore.getState();
      const tenantId = tenant?.id || 'default';

      console.log('[InscriptionEtudiant] Chargement des données...', { tenantId, hasToken: !!accessToken });

      // Charger les inscriptions existantes
      const inscriptionsResponse = await fetch(`/api/v1/portail/${tenantId}/etudiant/inscriptions`, {
        headers: { Authorization: `Bearer ${accessToken}` }
      });
      if (inscriptionsResponse.ok) {
        const data = await inscriptionsResponse.json();
        console.log('[InscriptionEtudiant] Inscriptions chargées:', data.length);
        setInscriptions(data);
      } else {
        console.error('[InscriptionEtudiant] Erreur inscriptions:', inscriptionsResponse.status);
      }

      // Charger les départements
      const departementsResponse = await fetch(`/api/v1/portail/${tenantId}/etudiant/departements`, {
        headers: { Authorization: `Bearer ${accessToken}` }
      });
      if (departementsResponse.ok) {
        const data = await departementsResponse.json();
        console.log('[InscriptionEtudiant] Départements chargés:', data.length, data);
        setDepartements(data);
      } else {
        console.error('[InscriptionEtudiant] Erreur départements:', departementsResponse.status);
      }

      // Charger les parcours disponibles
      const parcoursResponse = await fetch(`/api/v1/portail/${tenantId}/etudiant/parcours-disponibles`, {
        headers: { Authorization: `Bearer ${accessToken}` }
      });
      if (parcoursResponse.ok) {
        const data = await parcoursResponse.json();
        console.log('[InscriptionEtudiant] Parcours chargés:', data.length, data);
        setParcoursDisponibles(data);
      } else {
        console.error('[InscriptionEtudiant] Erreur parcours:', parcoursResponse.status);
      }

      // Charger les années académiques
      const anneesResponse = await fetch(`/api/v1/portail/${tenantId}/etudiant/annees-academiques`, {
        headers: { Authorization: `Bearer ${accessToken}` }
      });
      if (anneesResponse.ok) {
        const data = await anneesResponse.json();
        console.log('[InscriptionEtudiant] Années académiques chargées:', data.length, data);
        setAnneesAcademiques(data);
      } else {
        console.error('[InscriptionEtudiant] Erreur années:', anneesResponse.status);
      }

      // Charger les niveaux d'études
      const niveauxResponse = await fetch(`/api/v1/portail/${tenantId}/etudiant/niveaux-etude`, {
        headers: { Authorization: `Bearer ${accessToken}` }
      });
      if (niveauxResponse.ok) {
        const data = await niveauxResponse.json();
        console.log('[InscriptionEtudiant] Niveaux chargés:', data.length, data);
        setNiveauxEtude(data);
      } else {
        console.error('[InscriptionEtudiant] Erreur niveaux:', niveauxResponse.status);
      }
    } catch (err) {
      console.error('[InscriptionEtudiant] Erreur globale:', err);
      setError('Erreur lors du chargement des données');
    }
  };

  // Filtrer les parcours par département sélectionné
  const parcoursFiltres = selectedDepartement
    ? parcoursDisponibles.filter(p => p.departement_id === selectedDepartement)
    : parcoursDisponibles;

  // Réinitialiser le parcours sélectionné quand on change de département
  const handleDepartementChange = (departementId: string) => {
    setSelectedDepartement(departementId);
    setSelectedParcours(''); // Réinitialiser le parcours
  };

  const handleInscription = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const { accessToken } = useAuthStore.getState();
      const tenantId = tenant?.id || 'default';

      const response = await fetch(`/api/v1/portail/${tenantId}/etudiant/inscription`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`
        },
        body: JSON.stringify({
          parcoursId: selectedParcours,
          anneeAcademiqueId: selectedAnnee,
          anneeNiveau: niveauxEtude.find(n => n.id === selectedNiveau)?.ordre || 1,
          typeInscription: 'premiere'
        })
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess('Inscription créée avec succès !');
        setShowInscriptionForm(false);
        setSelectedDepartement('');
        setSelectedParcours('');
        setSelectedAnnee('');
        setSelectedNiveau('');
        loadData(); // Recharger les données
      } else {
        setError(data.message || 'Erreur lors de l\'inscription');
      }
    } catch (err) {
      setError('Erreur de connexion au serveur');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelInscription = async (inscriptionId: string) => {
    if (!confirm('Êtes-vous sûr de vouloir annuler cette inscription ?')) return;

    try {
      const { accessToken } = useAuthStore.getState();
      const tenantId = tenant?.id || 'default';

      const response = await fetch(`/api/v1/portail/${tenantId}/etudiant/inscription/${inscriptionId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${accessToken}` }
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess('Inscription annulée avec succès');
        loadData();
      } else {
        setError(data.message || 'Erreur lors de l\'annulation');
      }
    } catch (err) {
      setError('Erreur de connexion au serveur');
    }
  };

  const getStatusColor = (statut: string) => {
    switch (statut) {
      case 'validee': return 'text-green-600 bg-green-100';
      case 'en_attente': return 'text-yellow-600 bg-yellow-100';
      case 'annulee': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusLabel = (statut: string) => {
    switch (statut) {
      case 'validee': return 'Validée';
      case 'en_attente': return 'En attente';
      case 'annulee': return 'Annulée';
      default: return statut;
    }
  };

  // Vérifier si l'étudiant a une inscription validée
  const hasValidInscription = inscriptions.some(ins => ins.statut === 'validee');

  return (
    <div className="container-fluid p-4">
      <div className="row">
        <div className="col-12">
          <div className="d-flex justify-content-between align-items-center mb-4">
            <div>
              <h2 className="h3 mb-1">Inscription Académique</h2>
              <p className="text-muted mb-0">Gérez votre inscription aux parcours académiques</p>
            </div>
            {inscriptions.length === 0 && (
              <button
                className="btn btn-primary"
                onClick={() => setShowInscriptionForm(true)}
              >
                <CheckCircle size={18} className="me-2" />
                Nouvelle Inscription
              </button>
            )}
          </div>

          {/* Alertes */}
          {error && (
            <div className="alert alert-danger d-flex align-items-center mb-3" role="alert">
              <AlertCircle size={20} className="me-2" />
              {error}
            </div>
          )}
          {success && (
            <div className="alert alert-success d-flex align-items-center mb-3" role="alert">
              <CheckCircle size={20} className="me-2" />
              {success}
            </div>
          )}

          {/* Message d'accès restreint */}
          {!hasValidInscription && (
            <div className="alert alert-warning d-flex align-items-center mb-4" role="alert">
              <AlertCircle size={20} className="me-2" />
              <div>
                <strong>Accès limité :</strong> Vous devez avoir une inscription validée et avoir payé les frais d'inscription 
                pour accéder à toutes les fonctionnalités du portail étudiant.
              </div>
            </div>
          )}

          {/* Liste des inscriptions */}
          <div className="card shadow-sm">
            <div className="card-header bg-white">
              <h5 className="card-title mb-0">
                <BookOpen size={20} className="me-2" />
                Mes Inscriptions
              </h5>
            </div>
            <div className="card-body">
              {inscriptions.length === 0 ? (
                <div className="text-center py-5">
                  <CheckCircle size={48} className="text-muted mb-3" />
                  <h5 className="text-muted">Aucune inscription</h5>
                  <p className="text-muted">Vous n'avez pas encore d'inscription académique</p>
                  <button
                    className="btn btn-primary"
                    onClick={() => setShowInscriptionForm(true)}
                  >
                    Commencer mon inscription
                  </button>
                </div>
              ) : (
                <div className="table-responsive">
                  <table className="table table-hover">
                    <thead>
                      <tr>
                        <th>Parcours</th>
                        <th>Année Académique</th>
                        <th>Date</th>
                        <th>Statut</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {inscriptions.map((inscription) => (
                        <React.Fragment key={inscription.id}>
                          <tr>
                            <td>
                              <div>
                                <strong>{inscription.parcours_nom}</strong>
                                <div className="text-muted small">{inscription.parcours_code}</div>
                              </div>
                            </td>
                            <td>{inscription.annee_academique}</td>
                            <td>{new Date(inscription.date_inscription).toLocaleDateString()}</td>
                            <td>
                              <span className={`badge ${getStatusColor(inscription.statut)}`}>
                                {getStatusLabel(inscription.statut)}
                              </span>
                            </td>
                            <td>
                              {inscription.statut === 'en_attente' && (
                                <button
                                  className="btn btn-sm btn-outline-danger"
                                  onClick={() => handleCancelInscription(inscription.id)}
                                >
                                  <X size={16} />
                                </button>
                              )}
                            </td>
                          </tr>
                          {/* Afficher le composant de paiement pour les inscriptions en attente */}
                          {inscription.statut === 'en_attente' && (
                            <tr>
                              <td colSpan={5} className="p-0">
                                <div className="p-3 bg-light">
                                  <PaiementInscriptionCard
                                    inscription={inscription}
                                    onPaiementSubmitted={() => loadData()}
                                  />
                                </div>
                              </td>
                            </tr>
                          )}
                        </React.Fragment>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Modal d'inscription */}
      {showInscriptionForm && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-lg">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">
                  <CheckCircle size={20} className="me-2" />
                  Nouvelle Inscription
                </h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setShowInscriptionForm(false)}
                ></button>
              </div>
              <form onSubmit={handleInscription}>
                <div className="modal-body">
                  <div className="row">
                    <div className="col-md-12 mb-3">
                      <label className="form-label">Filière / Département *</label>
                      <select
                        className="form-select"
                        value={selectedDepartement}
                        onChange={(e) => handleDepartementChange(e.target.value)}
                        required
                      >
                        <option value="">Sélectionner une filière</option>
                        {departements.map((dept) => (
                          <option key={dept.id} value={dept.id}>
                            {dept.nom} ({dept.nombre_parcours} parcours)
                          </option>
                        ))}
                      </select>
                      {selectedDepartement && (
                        <small className="text-muted">
                          {departements.find(d => d.id === selectedDepartement)?.description}
                        </small>
                      )}
                    </div>
                  </div>
                  <div className="row">
                    <div className="col-md-6 mb-3">
                      <label className="form-label">Parcours *</label>
                      <select
                        className="form-select"
                        value={selectedParcours}
                        onChange={(e) => setSelectedParcours(e.target.value)}
                        required
                        disabled={!selectedDepartement}
                      >
                        <option value="">
                          {selectedDepartement ? 'Sélectionner un parcours' : 'Sélectionnez d\'abord une filière'}
                        </option>
                        {parcoursFiltres.map((parcours) => (
                          <option key={parcours.id} value={parcours.id}>
                            {parcours.code} - {parcours.nom} ({parcours.niveau})
                          </option>
                        ))}
                      </select>
                      {selectedParcours && (
                        <small className="text-muted">
                          {parcoursFiltres.find(p => p.id === selectedParcours)?.nombre_ues} UE disponibles
                        </small>
                      )}
                    </div>
                    <div className="col-md-6 mb-3">
                      <label className="form-label">Année Académique *</label>
                      <select
                        className="form-select"
                        value={selectedAnnee}
                        onChange={(e) => setSelectedAnnee(e.target.value)}
                        required
                      >
                        <option value="">Sélectionner une année</option>
                        {anneesAcademiques.map((annee) => (
                          <option key={annee.id} value={annee.id}>
                            {annee.libelle} ({annee.annee_debut}-{annee.annee_fin})
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <div className="row">
                    <div className="col-md-12 mb-3">
                      <label className="form-label">Niveau d'études *</label>
                      <select
                        className="form-select"
                        value={selectedNiveau}
                        onChange={(e) => setSelectedNiveau(e.target.value)}
                        required
                      >
                        <option value="">Sélectionner un niveau</option>
                        {niveauxEtude.map((niveau) => (
                          <option key={niveau.id} value={niveau.id}>
                            {niveau.libelle}
                          </option>
                        ))}
                      </select>
                      <small className="text-muted">
                        {selectedNiveau && niveauxEtude.find(n => n.id === selectedNiveau)?.description}
                      </small>
                    </div>
                  </div>
                </div>
                <div className="modal-footer">
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => setShowInscriptionForm(false)}
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={loading}
                  >
                    {loading ? (
                      <span className="spinner-border spinner-border-sm me-2"></span>
                    ) : (
                      <CheckCircle size={18} className="me-2" />
                    )}
                    Confirmer l'inscription
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
