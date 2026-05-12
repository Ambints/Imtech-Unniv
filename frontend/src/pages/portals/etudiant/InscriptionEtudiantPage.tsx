import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../../store/authStore';
import { CheckCircle, AlertCircle, BookOpen, Calendar, CreditCard, User, ArrowRight, X, Check } from 'lucide-react';

interface Parcours {
  id: string;
  code: string;
  nom: string;
  departement_nom: string;
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
  const [parcoursDisponibles, setParcoursDisponibles] = useState<Parcours[]>([]);
  const [anneesAcademiques, setAnneesAcademiques] = useState<AnneeAcademique[]>([]);
  const [selectedParcours, setSelectedParcours] = useState<string>('');
  const [selectedAnnee, setSelectedAnnee] = useState<string>('');
  const [anneeNiveau, setAnneeNiveau] = useState<number>(1);
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
      const token = localStorage.getItem('token');
      const tenantId = tenant?.id || 'default';

      // Charger les inscriptions existantes
      const inscriptionsResponse = await fetch(`/api/portail/${tenantId}/etudiant/inscriptions`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (inscriptionsResponse.ok) {
        const data = await inscriptionsResponse.json();
        setInscriptions(data);
      }

      // Charger les parcours disponibles
      const parcoursResponse = await fetch(`/api/portail/${tenantId}/etudiant/parcours-disponibles`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (parcoursResponse.ok) {
        const data = await parcoursResponse.json();
        setParcoursDisponibles(data);
      }

      // Charger les années académiques
      const anneesResponse = await fetch(`/api/portail/${tenantId}/etudiant/annees-academiques`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (anneesResponse.ok) {
        const data = await anneesResponse.json();
        setAnneesAcademiques(data);
      }
    } catch (err) {
      setError('Erreur lors du chargement des données');
    }
  };

  const handleInscription = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const token = localStorage.getItem('token');
      const tenantId = tenant?.id || 'default';

      const response = await fetch(`/api/portail/${tenantId}/etudiant/inscription`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          parcoursId: selectedParcours,
          anneeAcademiqueId: selectedAnnee,
          anneeNiveau,
          typeInscription: 'premiere'
        })
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess('Inscription créée avec succès !');
        setShowInscriptionForm(false);
        setSelectedParcours('');
        setSelectedAnnee('');
        setAnneeNiveau(1);
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
      const token = localStorage.getItem('token');
      const tenantId = tenant?.id || 'default';

      const response = await fetch(`/api/portail/${tenantId}/etudiant/inscription/${inscriptionId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
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
                        <tr key={inscription.id}>
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
                            {inscription.statut === 'validee' && (
                              <button
                                className="btn btn-sm btn-outline-success"
                                onClick={() => navigate('/portail/etudiant/paiements')}
                              >
                                <CreditCard size={16} className="me-1" />
                                Payer
                              </button>
                            )}
                          </td>
                        </tr>
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
                    <div className="col-md-6 mb-3">
                      <label className="form-label">Parcours *</label>
                      <select
                        className="form-select"
                        value={selectedParcours}
                        onChange={(e) => setSelectedParcours(e.target.value)}
                        required
                      >
                        <option value="">Sélectionner un parcours</option>
                        {parcoursDisponibles.map((parcours) => (
                          <option key={parcours.id} value={parcours.id}>
                            {parcours.code} - {parcours.nom}
                          </option>
                        ))}
                      </select>
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
                            {annee.libelle}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <div className="row">
                    <div className="col-md-6 mb-3">
                      <label className="form-label">Niveau *</label>
                      <select
                        className="form-select"
                        value={anneeNiveau}
                        onChange={(e) => setAnneeNiveau(Number(e.target.value))}
                        required
                      >
                        <option value={1}>L1 - 1ère année</option>
                        <option value={2}>L2 - 2ème année</option>
                        <option value={3}>L3 - 3ème année</option>
                        <option value={4}>M1 - 1ère année Master</option>
                        <option value={5}>M2 - 2ème année Master</option>
                      </select>
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
