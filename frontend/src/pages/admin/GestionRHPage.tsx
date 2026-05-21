import React, { useState, useEffect } from 'react';
import { api } from '../../api/client';

interface Contrat {
  id: string;
  utilisateur_nom: string;
  utilisateur_prenom: string;
  type_contrat: string;
  poste: string;
  departement_nom: string;
  date_debut: string;
  date_fin: string;
  salaire_brut: number;
  actif: boolean;
}

interface Conge {
  id: string;
  utilisateur_nom: string;
  utilisateur_prenom: string;
  type_conge: string;
  date_debut: string;
  date_fin: string;
  nb_jours: number;
  statut: string;
  motif: string;
}

interface FichePaie {
  id: string;
  utilisateur_nom: string;
  utilisateur_prenom: string;
  poste: string;
  annee: number;
  mois: number;
  salaire_brut: number;
  cotisations: number;
  net_a_payer: number;
  statut: string;
}

export default function GestionRHPage() {
  const [activeTab, setActiveTab] = useState<'contrats' | 'conges' | 'paie'>('contrats');
  const [contrats, setContrats] = useState<Contrat[]>([]);
  const [conges, setConges] = useState<Conge[]>([]);
  const [fichesPaie, setFichesPaie] = useState<FichePaie[]>([]);
  const [loading, setLoading] = useState(false);
  const [showContratModal, setShowContratModal] = useState(false);
  const [showCongeModal, setShowCongeModal] = useState(false);
  const [selectedConge, setSelectedConge] = useState<Conge | null>(null);

  // Formulaire nouveau contrat
  const [newContrat, setNewContrat] = useState({
    utilisateurId: '',
    typeContrat: 'CDI',
    poste: '',
    departementId: '',
    dateDebut: '',
    dateFin: '',
    salaireBrut: '',
    salaireNet: '',
    volumeHoraireHebdo: '',
    observations: ''
  });

  // Liste des utilisateurs et départements pour les formulaires
  const [utilisateurs, setUtilisateurs] = useState<any[]>([]);
  const [departements, setDepartements] = useState<any[]>([]);

  useEffect(() => {
    loadContrats();
    loadConges();
    loadUtilisateurs();
    loadDepartements();
  }, []);

  const loadUtilisateurs = async () => {
    try {
      const response = await api.get('/users');
      setUtilisateurs(response.data);
    } catch (error) {
      console.error('Erreur chargement utilisateurs:', error);
    }
  };

  const loadDepartements = async () => {
    try {
      const response = await api.get('/academic/departements');
      setDepartements(response.data);
    } catch (error) {
      console.error('Erreur chargement départements:', error);
    }
  };

  const loadStats = async () => {
    // Fonction placeholder pour charger les statistiques RH
    // À implémenter: appel API vers /rh/stats
  };

  const loadContrats = async () => {
    try {
      setLoading(true);
      const response = await api.get('/rh/contrats');
      setContrats(response.data);
    } catch (error) {
      console.error('Erreur chargement contrats:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadConges = async () => {
    try {
      const response = await api.get('/rh/conges');
      setConges(response.data);
    } catch (error) {
      console.error('Erreur chargement congés:', error);
    }
  };

  const loadFichesPaie = async (annee?: number, mois?: number) => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (annee) params.append('annee', annee.toString());
      if (mois) params.append('mois', mois.toString());
      const response = await api.get(`/rh/fiches-paie?${params}`);
      setFichesPaie(response.data);
    } catch (error) {
      console.error('Erreur chargement fiches de paie:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateContrat = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/rh/contrats', {
        ...newContrat,
        salaireBrut: parseFloat(newContrat.salaireBrut),
        salaireNet: parseFloat(newContrat.salaireNet),
        volumeHoraireHebdo: parseInt(newContrat.volumeHoraireHebdo)
      });
      setShowContratModal(false);
      loadContrats();
      loadStats();
      alert('Contrat créé avec succès');
    } catch (error) {
      console.error('Erreur création contrat:', error);
      alert('Erreur lors de la création du contrat');
    }
  };

  const handleApprouverConge = async (congeId: string) => {
    try {
      await api.patch(`/rh/conges/${congeId}/approuver`, {
        approuvePar: 'current-user-id', // À remplacer par l'ID de l'utilisateur connecté
        commentaire: 'Approuvé'
      });
      loadConges();
      loadStats();
      alert('Congé approuvé');
    } catch (error) {
      console.error('Erreur approbation congé:', error);
      alert('Erreur lors de l\'approbation');
    }
  };

  const handleRefuserConge = async (congeId: string, motif: string) => {
    try {
      await api.patch(`/rh/conges/${congeId}/refuser`, {
        approuvePar: 'current-user-id',
        motif
      });
      loadConges();
      loadStats();
      alert('Congé refusé');
    } catch (error) {
      console.error('Erreur refus congé:', error);
      alert('Erreur lors du refus');
    }
  };

  const handleGenererFichesPaieMasse = async () => {
    const annee = new Date().getFullYear();
    const mois = new Date().getMonth() + 1;
    
    if (confirm(`Générer les fiches de paie pour ${mois}/${annee} ?`)) {
      try {
        const response = await api.get(`/rh/fiches-paie/masse?annee=${annee}&mois=${mois}`);
        alert(`${response.data.generees} fiches de paie générées`);
        loadFichesPaie(annee, mois);
      } catch (error) {
        console.error('Erreur génération masse:', error);
        alert('Erreur lors de la génération');
      }
    }
  };

  const getStatutBadgeClass = (statut: string) => {
    switch (statut) {
      case 'approuve': case 'valide': case 'paye': return 'bg-success';
      case 'demande': case 'brouillon': return 'bg-warning';
      case 'refuse': return 'bg-danger';
      default: return 'bg-secondary';
    }
  };

  return (
    <div className="container-fluid py-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2><i className="bi bi-people-fill me-2"></i>Gestion des Ressources Humaines</h2>
      </div>

      {/* Tabs Navigation */}
      <ul className="nav nav-tabs mb-4">
        <li className="nav-item">
          <button
            className={`nav-link ${activeTab === 'contrats' ? 'active' : ''}`}
            onClick={() => setActiveTab('contrats')}
          >
            <i className="bi bi-file-text me-2"></i>Contrats
          </button>
        </li>
        <li className="nav-item">
          <button
            className={`nav-link ${activeTab === 'conges' ? 'active' : ''}`}
            onClick={() => setActiveTab('conges')}
          >
            <i className="bi bi-calendar-check me-2"></i>Congés
          </button>
        </li>
        <li className="nav-item">
          <button
            className={`nav-link ${activeTab === 'paie' ? 'active' : ''}`}
            onClick={() => {
              setActiveTab('paie');
              loadFichesPaie();
            }}
          >
            <i className="bi bi-cash-stack me-2"></i>Fiches de paie
          </button>
        </li>
      </ul>

      {/* Contrats Tab */}
      {activeTab === 'contrats' && (
        <div>
          <div className="d-flex justify-content-between mb-3">
            <h4>Liste des Contrats</h4>
            <button 
              className="btn btn-primary"
              onClick={() => setShowContratModal(true)}
            >
              <i className="bi bi-plus-circle me-2"></i>Nouveau Contrat
            </button>
          </div>

          {loading ? (
            <div className="text-center py-5">
              <div className="spinner-border" role="status"></div>
            </div>
          ) : (
            <div className="table-responsive">
              <table className="table table-hover">
                <thead>
                  <tr>
                    <th>Employé</th>
                    <th>Type</th>
                    <th>Poste</th>
                    <th>Département</th>
                    <th>Début</th>
                    <th>Fin</th>
                    <th>Salaire Brut</th>
                    <th>Statut</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {contrats.map(contrat => (
                    <tr key={contrat.id}>
                      <td>{contrat.utilisateur_nom} {contrat.utilisateur_prenom}</td>
                      <td><span className="badge bg-info">{contrat.type_contrat}</span></td>
                      <td>{contrat.poste}</td>
                      <td>{contrat.departement_nom}</td>
                      <td>{new Date(contrat.date_debut).toLocaleDateString()}</td>
                      <td>{contrat.date_fin ? new Date(contrat.date_fin).toLocaleDateString() : 'Indéterminé'}</td>
                      <td>{contrat.salaire_brut?.toLocaleString()} Ar</td>
                      <td>
                        <span className={`badge ${contrat.actif ? 'bg-success' : 'bg-secondary'}`}>
                          {contrat.actif ? 'Actif' : 'Inactif'}
                        </span>
                      </td>
                      <td>
                        <button className="btn btn-sm btn-outline-primary me-1" title="Voir détails">
                          <i className="bi bi-eye"></i>
                        </button>
                        <button className="btn btn-sm btn-outline-warning" title="Modifier">
                          <i className="bi bi-pencil"></i>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Congés Tab */}
      {activeTab === 'conges' && (
        <div>
          <h4 className="mb-3">Demandes de Congés</h4>
          <div className="table-responsive">
            <table className="table table-hover">
              <thead>
                <tr>
                  <th>Employé</th>
                  <th>Type</th>
                  <th>Début</th>
                  <th>Fin</th>
                  <th>Nb Jours</th>
                  <th>Motif</th>
                  <th>Statut</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {conges.map(conge => (
                  <tr key={conge.id}>
                    <td>{conge.utilisateur_nom} {conge.utilisateur_prenom}</td>
                    <td><span className="badge bg-secondary">{conge.type_conge}</span></td>
                    <td>{new Date(conge.date_debut).toLocaleDateString()}</td>
                    <td>{new Date(conge.date_fin).toLocaleDateString()}</td>
                    <td>{conge.nb_jours}</td>
                    <td>{conge.motif}</td>
                    <td>
                      <span className={`badge ${getStatutBadgeClass(conge.statut)}`}>
                        {conge.statut}
                      </span>
                    </td>
                    <td>
                      {conge.statut === 'demande' && (
                        <>
                          <button 
                            className="btn btn-sm btn-success me-1"
                            onClick={() => handleApprouverConge(conge.id)}
                            title="Approuver"
                          >
                            <i className="bi bi-check-circle"></i>
                          </button>
                          <button 
                            className="btn btn-sm btn-danger"
                            onClick={() => {
                              const motif = prompt('Motif du refus:');
                              if (motif) handleRefuserConge(conge.id, motif);
                            }}
                            title="Refuser"
                          >
                            <i className="bi bi-x-circle"></i>
                          </button>
                        </>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Fiches de Paie Tab */}
      {activeTab === 'paie' && (
        <div>
          <div className="d-flex justify-content-between mb-3">
            <h4>Fiches de Paie</h4>
            <button 
              className="btn btn-primary"
              onClick={handleGenererFichesPaieMasse}
            >
              <i className="bi bi-lightning-fill me-2"></i>Génération en Masse
            </button>
          </div>

          {loading ? (
            <div className="text-center py-5">
              <div className="spinner-border" role="status"></div>
            </div>
          ) : (
            <div className="table-responsive">
              <table className="table table-hover">
                <thead>
                  <tr>
                    <th>Employé</th>
                    <th>Poste</th>
                    <th>Période</th>
                    <th>Salaire Brut</th>
                    <th>Cotisations</th>
                    <th>Net à Payer</th>
                    <th>Statut</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {fichesPaie.map(fiche => (
                    <tr key={fiche.id}>
                      <td>{fiche.utilisateur_nom} {fiche.utilisateur_prenom}</td>
                      <td>{fiche.poste}</td>
                      <td>{fiche.mois}/{fiche.annee}</td>
                      <td>{fiche.salaire_brut?.toLocaleString()} Ar</td>
                      <td>{fiche.cotisations?.toLocaleString()} Ar</td>
                      <td><strong>{fiche.net_a_payer?.toLocaleString()} Ar</strong></td>
                      <td>
                        <span className={`badge ${getStatutBadgeClass(fiche.statut)}`}>
                          {fiche.statut}
                        </span>
                      </td>
                      <td>
                        <button className="btn btn-sm btn-outline-primary me-1" title="Télécharger">
                          <i className="bi bi-download"></i>
                        </button>
                        {fiche.statut === 'brouillon' && (
                          <button className="btn btn-sm btn-success" title="Valider">
                            <i className="bi bi-check-lg"></i>
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
      )}

      {/* Modal Nouveau Contrat */}
      {showContratModal && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-lg">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Nouveau Contrat</h5>
                <button 
                  type="button" 
                  className="btn-close"
                  onClick={() => setShowContratModal(false)}
                ></button>
              </div>
              <form onSubmit={handleCreateContrat}>
                <div className="modal-body">
                  <div className="row">
                    <div className="col-md-12 mb-3">
                      <label className="form-label">Employé *</label>
                      <select
                        className="form-select"
                        value={newContrat.utilisateurId}
                        onChange={(e) => setNewContrat({...newContrat, utilisateurId: e.target.value})}
                        required
                      >
                        <option value="">-- Sélectionner un employé --</option>
                        {utilisateurs.map(user => (
                          <option key={user.id} value={user.id}>
                            {user.nom} {user.prenom} ({user.email})
                          </option>
                        ))}
                      </select>
                      <small className="text-muted">Sélectionnez l'utilisateur pour qui créer le contrat</small>
                    </div>
                    <div className="col-md-6 mb-3">
                      <label className="form-label">Type de Contrat *</label>
                      <select
                        className="form-select"
                        value={newContrat.typeContrat}
                        onChange={(e) => setNewContrat({...newContrat, typeContrat: e.target.value})}
                        required
                      >
                        <option value="CDI">CDI</option>
                        <option value="CDD">CDD</option>
                        <option value="vacataire">Vacataire</option>
                        <option value="stagiaire">Stagiaire</option>
                      </select>
                    </div>
                    <div className="col-md-6 mb-3">
                      <label className="form-label">Poste *</label>
                      <input
                        type="text"
                        className="form-control"
                        value={newContrat.poste}
                        onChange={(e) => setNewContrat({...newContrat, poste: e.target.value})}
                        placeholder="Ex: Enseignant, Secrétaire, etc."
                        required
                      />
                    </div>
                    <div className="col-md-12 mb-3">
                      <label className="form-label">Département</label>
                      <select
                        className="form-select"
                        value={newContrat.departementId}
                        onChange={(e) => setNewContrat({...newContrat, departementId: e.target.value})}
                      >
                        <option value="">-- Aucun département --</option>
                        {departements.map(dept => (
                          <option key={dept.id} value={dept.id}>
                            {dept.nom}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="col-md-6 mb-3">
                      <label className="form-label">Date de Début *</label>
                      <input 
                        type="date"
                        className="form-control"
                        value={newContrat.dateDebut}
                        onChange={(e) => setNewContrat({...newContrat, dateDebut: e.target.value})}
                        required
                      />
                    </div>
                    <div className="col-md-6 mb-3">
                      <label className="form-label">Date de Fin</label>
                      <input 
                        type="date"
                        className="form-control"
                        value={newContrat.dateFin}
                        onChange={(e) => setNewContrat({...newContrat, dateFin: e.target.value})}
                      />
                    </div>
                    <div className="col-md-6 mb-3">
                      <label className="form-label">Salaire Brut *</label>
                      <input 
                        type="number"
                        className="form-control"
                        value={newContrat.salaireBrut}
                        onChange={(e) => setNewContrat({...newContrat, salaireBrut: e.target.value})}
                        required
                      />
                    </div>
                    <div className="col-md-6 mb-3">
                      <label className="form-label">Salaire Net</label>
                      <input 
                        type="number"
                        className="form-control"
                        value={newContrat.salaireNet}
                        onChange={(e) => setNewContrat({...newContrat, salaireNet: e.target.value})}
                      />
                    </div>
                    <div className="col-md-12 mb-3">
                      <label className="form-label">Observations</label>
                      <textarea 
                        className="form-control"
                        rows={3}
                        value={newContrat.observations}
                        onChange={(e) => setNewContrat({...newContrat, observations: e.target.value})}
                      ></textarea>
                    </div>
                  </div>
                </div>
                <div className="modal-footer">
                  <button 
                    type="button" 
                    className="btn btn-secondary"
                    onClick={() => setShowContratModal(false)}
                  >
                    Annuler
                  </button>
                  <button type="submit" className="btn btn-primary">
                    Créer le Contrat
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
