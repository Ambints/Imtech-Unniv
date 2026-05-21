import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  AlertTriangle, ArrowLeft, Plus, Search, Filter,
  Eye, Edit, Trash2, FileText, User, Calendar, MapPin
} from 'lucide-react';
import { api } from '../../api/client';
import { useAuthStore } from '../../store/authStore';

interface Etudiant {
  id: string;
  nom: string;
  prenom: string;
  matricule: string;
  classe: string;
}

interface Incident {
  id: string;
  type: 'comportement' | 'retard_repete' | 'absence_injustifiee' | 'fraude' | 'violence' | 'autre';
  gravite: 'faible' | 'moyenne' | 'elevee';
  etudiant: Etudiant;
  description: string;
  lieu: string;
  date: string;
  temoin?: string;
  mesuresPrises?: string;
  statut: 'en_attente' | 'traite' | 'clos';
  rapporteur: string;
}

const TYPE_LABELS: Record<string, string> = {
  comportement: 'Comportement perturbateur',
  retard_repete: 'Retards répétés',
  absence_injustifiee: 'Absence injustifiée',
  fraude: 'Fraude/Tricherie',
  violence: 'Violence',
  autre: 'Autre'
};

const GRAVITE_COLORS: Record<string, string> = {
  faible: 'info',
  moyenne: 'warning',
  elevee: 'danger'
};

const STATUT_COLORS: Record<string, string> = {
  en_attente: 'warning',
  traite: 'info',
  clos: 'success'
};

export const IncidentsPage: React.FC = () => {
  const navigate = useNavigate();
  const { tenant } = useAuthStore();
  const tenantId = tenant?.id;
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedIncident, setSelectedIncident] = useState<Incident | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterGravite, setFilterGravite] = useState<string>('all');
  const [filterStatut, setFilterStatut] = useState<string>('all');
  
  // États pour la recherche d'étudiant
  const [etudiantSearch, setEtudiantSearch] = useState('');
  const [etudiants, setEtudiants] = useState<Etudiant[]>([]);
  const [selectedEtudiant, setSelectedEtudiant] = useState<Etudiant | null>(null);
  const [showEtudiantDropdown, setShowEtudiantDropdown] = useState(false);
  const [loadingEtudiants, setLoadingEtudiants] = useState(false);
  
  const [formData, setFormData] = useState({
    type: 'comportement',
    gravite: 'moyenne',
    etudiantId: '',
    description: '',
    lieu: '',
    temoin: '',
    mesuresPrises: ''
  });

  useEffect(() => {
    if (tenantId) {
      loadIncidents();
    }
  }, [tenantId]);

  // Recherche d'étudiants avec debounce
  useEffect(() => {
    if (etudiantSearch.length >= 2) {
      const timer = setTimeout(() => {
        searchEtudiants();
      }, 300);
      return () => clearTimeout(timer);
    } else {
      setEtudiants([]);
      setShowEtudiantDropdown(false);
    }
  }, [etudiantSearch]);

  const loadIncidents = async () => {
    if (!tenantId) return;
    try {
      setLoading(true);
      const response = await api.get(`/discipline/${tenantId}/incidents`);
      setIncidents(response.data || []);
    } catch (error) {
      console.error('Erreur chargement incidents:', error);
      setIncidents([]);
    } finally {
      setLoading(false);
    }
  };

  const searchEtudiants = async () => {
    if (!tenantId || etudiantSearch.length < 2) return;
    try {
      setLoadingEtudiants(true);
      const response = await api.get(`/portail/${tenantId}/etudiants/search?q=${etudiantSearch}`);
      setEtudiants(response.data || []);
      setShowEtudiantDropdown(true);
    } catch (error) {
      console.error('Erreur recherche étudiants:', error);
      setEtudiants([]);
    } finally {
      setLoadingEtudiants(false);
    }
  };

  const selectEtudiant = (etudiant: Etudiant) => {
    setSelectedEtudiant(etudiant);
    setEtudiantSearch(`${etudiant.prenom} ${etudiant.nom} (${etudiant.matricule})`);
    setFormData({...formData, etudiantId: etudiant.id});
    setShowEtudiantDropdown(false);
  };

  const resetEtudiantSearch = () => {
    setEtudiantSearch('');
    setSelectedEtudiant(null);
    setEtudiants([]);
    setShowEtudiantDropdown(false);
    setFormData({...formData, etudiantId: ''});
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // TODO: Appel API pour créer l'incident
      console.log('Création incident:', formData);
      alert('Incident signalé avec succès!');
      setShowModal(false);
      loadIncidents();
    } catch (error) {
      console.error('Erreur création incident:', error);
      alert('Erreur lors de la création');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cet incident ?')) return;
    try {
      // TODO: Appel API pour supprimer
      setIncidents(prev => prev.filter(i => i.id !== id));
      alert('Incident supprimé');
    } catch (error) {
      console.error('Erreur suppression:', error);
    }
  };

  const filteredIncidents = incidents.filter(incident => {
    const matchSearch =
      incident.etudiant?.nom?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      incident.etudiant?.prenom?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      incident.etudiant?.matricule?.includes(searchTerm) ||
      incident.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      false;
    
    const matchGravite = filterGravite === 'all' || incident.gravite === filterGravite;
    const matchStatut = filterStatut === 'all' || incident.statut === filterStatut;
    
    return matchSearch && matchGravite && matchStatut;
  });

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '400px' }}>
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Chargement...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="container-fluid p-4">
      {/* Header */}
      <div className="row mb-4">
        <div className="col">
          <button className="btn btn-link text-decoration-none p-0 mb-2" onClick={() => navigate('/surveillance')}>
            <ArrowLeft size={20} className="me-2" />
            Retour au Dashboard
          </button>
          <h2 className="mb-1">
            <AlertTriangle className="me-2" size={28} />
            Incidents Disciplinaires
          </h2>
          <p className="text-muted mb-0">Gestion des rapports d'incidents et de conduite</p>
        </div>
        <div className="col-auto">
          <button className="btn btn-primary" onClick={() => {
            setSelectedIncident(null);
            setFormData({
              type: 'comportement',
              gravite: 'moyenne',
              etudiantId: '',
              description: '',
              lieu: '',
              temoin: '',
              mesuresPrises: ''
            });
            setEtudiantSearch('');
            setSelectedEtudiant(null);
            setEtudiants([]);
            setShowEtudiantDropdown(false);
            setShowModal(true);
          }}>
            <Plus size={18} className="me-2" />
            Signaler un Incident
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="card border-0 shadow-sm mb-4">
        <div className="card-body">
          <div className="row g-3">
            <div className="col-12 col-md-6 col-lg-4">
              <div className="input-group">
                <span className="input-group-text bg-white">
                  <Search size={18} />
                </span>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Rechercher..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            <div className="col-6 col-md-3 col-lg-2">
              <select 
                className="form-select"
                value={filterGravite}
                onChange={(e) => setFilterGravite(e.target.value)}
              >
                <option value="all">Toutes gravités</option>
                <option value="faible">Faible</option>
                <option value="moyenne">Moyenne</option>
                <option value="elevee">Élevée</option>
              </select>
            </div>
            <div className="col-6 col-md-3 col-lg-2">
              <select 
                className="form-select"
                value={filterStatut}
                onChange={(e) => setFilterStatut(e.target.value)}
              >
                <option value="all">Tous statuts</option>
                <option value="en_attente">En attente</option>
                <option value="traite">Traité</option>
                <option value="clos">Clos</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="row g-3 mb-4">
        <div className="col-6 col-md-3">
          <div className="card border-0 shadow-sm">
            <div className="card-body text-center">
              <h3 className="mb-0 fw-bold text-danger">{incidents.filter(i => i.gravite === 'elevee').length}</h3>
              <small className="text-muted">Gravité Élevée</small>
            </div>
          </div>
        </div>
        <div className="col-6 col-md-3">
          <div className="card border-0 shadow-sm">
            <div className="card-body text-center">
              <h3 className="mb-0 fw-bold text-warning">{incidents.filter(i => i.statut === 'en_attente').length}</h3>
              <small className="text-muted">En Attente</small>
            </div>
          </div>
        </div>
        <div className="col-6 col-md-3">
          <div className="card border-0 shadow-sm">
            <div className="card-body text-center">
              <h3 className="mb-0 fw-bold text-info">{incidents.filter(i => i.statut === 'traite').length}</h3>
              <small className="text-muted">Traités</small>
            </div>
          </div>
        </div>
        <div className="col-6 col-md-3">
          <div className="card border-0 shadow-sm">
            <div className="card-body text-center">
              <h3 className="mb-0 fw-bold text-success">{incidents.filter(i => i.statut === 'clos').length}</h3>
              <small className="text-muted">Clos</small>
            </div>
          </div>
        </div>
      </div>

      {/* Incidents List */}
      <div className="row g-3">
        {filteredIncidents.length === 0 ? (
          <div className="col-12">
            <div className="card border-0 shadow-sm">
              <div className="card-body text-center py-5">
                <AlertTriangle size={48} className="text-muted mb-3 opacity-25" />
                <p className="text-muted">Aucun incident trouvé</p>
              </div>
            </div>
          </div>
        ) : (
          filteredIncidents.map(incident => (
            <div key={incident.id} className="col-12">
              <div className="card border-0 shadow-sm">
                <div className="card-body">
                  <div className="row align-items-start">
                    <div className="col-12 col-md-8">
                      <div className="d-flex align-items-start mb-2">
                        <div className="me-3">
                          <div 
                            className={`rounded-circle bg-${GRAVITE_COLORS[incident.gravite]} bg-opacity-10 d-flex align-items-center justify-content-center`}
                            style={{ width: 48, height: 48 }}
                          >
                            <AlertTriangle size={24} className={`text-${GRAVITE_COLORS[incident.gravite]}`} />
                          </div>
                        </div>
                        <div className="flex-grow-1">
                          <div className="d-flex align-items-center gap-2 mb-2">
                            <h5 className="mb-0">{TYPE_LABELS[incident.type]}</h5>
                            <span className={`badge bg-${GRAVITE_COLORS[incident.gravite]} bg-opacity-10 text-${GRAVITE_COLORS[incident.gravite]}`}>
                              {incident.gravite}
                            </span>
                            <span className={`badge bg-${STATUT_COLORS[incident.statut]} bg-opacity-10 text-${STATUT_COLORS[incident.statut]}`}>
                              {incident.statut.replace('_', ' ')}
                            </span>
                          </div>
                          <div className="mb-2">
                            <User size={14} className="me-1" />
                            <strong>{incident.etudiant?.prenom} {incident.etudiant?.nom}</strong>
                            {incident.etudiant?.matricule && (
                              <span className="text-muted ms-2">({incident.etudiant.matricule})</span>
                            )}
                            {incident.etudiant?.classe && (
                              <span className="text-muted ms-2">• {incident.etudiant.classe}</span>
                            )}
                          </div>
                          <p className="mb-2 text-muted">{incident.description || 'Aucune description'}</p>
                          <div className="small text-muted">
                            <MapPin size={14} className="me-1" />
                            {incident.lieu}
                            <Calendar size={14} className="ms-3 me-1" />
                            {new Date(incident.date).toLocaleString('fr-FR')}
                          </div>
                          {incident.temoin && (
                            <div className="small text-muted mt-1">
                              <strong>Témoin:</strong> {incident.temoin}
                            </div>
                          )}
                          {incident.mesuresPrises && (
                            <div className="small mt-2">
                              <strong>Mesures prises:</strong> {incident.mesuresPrises}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="col-12 col-md-4 text-md-end">
                      <div className="btn-group">
                        <button 
                          className="btn btn-sm btn-outline-primary"
                          onClick={() => setSelectedIncident(incident)}
                          title="Voir détails"
                        >
                          <Eye size={16} />
                        </button>
                        <button 
                          className="btn btn-sm btn-outline-secondary"
                          onClick={() => {
                            setFormData({
                              type: incident.type,
                              gravite: incident.gravite,
                              etudiantId: incident.etudiant.id,
                              description: incident.description,
                              lieu: incident.lieu,
                              temoin: incident.temoin || '',
                              mesuresPrises: incident.mesuresPrises || ''
                            });
                            setShowModal(true);
                          }}
                          title="Modifier"
                        >
                          <Edit size={16} />
                        </button>
                        <button 
                          className="btn btn-sm btn-outline-danger"
                          onClick={() => handleDelete(incident.id)}
                          title="Supprimer"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modal Création/Édition */}
      {showModal && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-lg modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">
                  <AlertTriangle size={20} className="me-2" />
                  Signaler un Incident
                </h5>
                <button type="button" className="btn-close" onClick={() => setShowModal(false)}></button>
              </div>
              <form onSubmit={handleSubmit}>
                <div className="modal-body">
                  <div className="row g-3">
                    <div className="col-12 col-md-6">
                      <label className="form-label">Type d'incident *</label>
                      <select 
                        className="form-select"
                        value={formData.type}
                        onChange={(e) => setFormData({...formData, type: e.target.value})}
                        required
                      >
                        {Object.entries(TYPE_LABELS).map(([key, label]) => (
                          <option key={key} value={key}>{label}</option>
                        ))}
                      </select>
                    </div>
                    <div className="col-12 col-md-6">
                      <label className="form-label">Gravité *</label>
                      <select 
                        className="form-select"
                        value={formData.gravite}
                        onChange={(e) => setFormData({...formData, gravite: e.target.value})}
                        required
                      >
                        <option value="faible">Faible</option>
                        <option value="moyenne">Moyenne</option>
                        <option value="elevee">Élevée</option>
                      </select>
                    </div>
                    <div className="col-12">
                      <label className="form-label">Étudiant concerné *</label>
                      <div className="position-relative">
                        <input
                          type="text"
                          className="form-control"
                          placeholder="Rechercher un étudiant (nom, prénom, matricule)..."
                          value={etudiantSearch}
                          onChange={(e) => setEtudiantSearch(e.target.value)}
                          onFocus={() => etudiantSearch.length >= 2 && setShowEtudiantDropdown(true)}
                          required={!selectedEtudiant}
                        />
                        {loadingEtudiants && (
                          <div className="position-absolute end-0 top-50 translate-middle-y me-2">
                            <div className="spinner-border spinner-border-sm text-primary" role="status">
                              <span className="visually-hidden">Recherche...</span>
                            </div>
                          </div>
                        )}
                        {showEtudiantDropdown && etudiants.length > 0 && (
                          <div className="position-absolute w-100 mt-1 bg-white border rounded shadow-lg" style={{ zIndex: 1000, maxHeight: '300px', overflowY: 'auto' }}>
                            <div className="list-group list-group-flush">
                              {etudiants.map((etudiant) => (
                                <button
                                  key={etudiant.id}
                                  type="button"
                                  className="list-group-item list-group-item-action d-flex align-items-center"
                                  onClick={() => selectEtudiant(etudiant)}
                                >
                                  <div className="rounded-circle bg-primary bg-opacity-10 d-flex align-items-center justify-content-center me-3"
                                       style={{ width: 40, height: 40, minWidth: 40 }}>
                                    <span className="fw-bold text-primary small">
                                      {etudiant.prenom[0]}{etudiant.nom[0]}
                                    </span>
                                  </div>
                                  <div className="flex-grow-1">
                                    <div className="fw-semibold">{etudiant.prenom} {etudiant.nom}</div>
                                    <small className="text-muted">{etudiant.matricule} • {etudiant.classe}</small>
                                  </div>
                                </button>
                              ))}
                            </div>
                          </div>
                        )}
                        {showEtudiantDropdown && etudiantSearch.length >= 2 && etudiants.length === 0 && !loadingEtudiants && (
                          <div className="position-absolute w-100 mt-1 bg-white border rounded shadow-sm p-3 text-center text-muted" style={{ zIndex: 1000 }}>
                            <User size={24} className="mb-2 opacity-25" />
                            <div className="small">Aucun étudiant trouvé</div>
                          </div>
                        )}
                      </div>
                      {selectedEtudiant && (
                        <div className="mt-2 p-2 bg-light rounded d-flex align-items-center justify-content-between">
                          <div className="d-flex align-items-center">
                            <div className="rounded-circle bg-success bg-opacity-10 d-flex align-items-center justify-content-center me-2"
                                 style={{ width: 32, height: 32 }}>
                              <span className="fw-bold text-success small">
                                {selectedEtudiant.prenom[0]}{selectedEtudiant.nom[0]}
                              </span>
                            </div>
                            <div>
                              <div className="fw-semibold small">{selectedEtudiant.prenom} {selectedEtudiant.nom}</div>
                              <small className="text-muted">{selectedEtudiant.matricule}</small>
                            </div>
                          </div>
                          <button
                            type="button"
                            className="btn btn-sm btn-outline-danger"
                            onClick={resetEtudiantSearch}
                            title="Changer d'étudiant"
                          >
                            ×
                          </button>
                        </div>
                      )}
                    </div>
                    <div className="col-12">
                      <label className="form-label">Description détaillée *</label>
                      <textarea
                        className="form-control"
                        rows={4}
                        value={formData.description}
                        onChange={(e) => setFormData({...formData, description: e.target.value})}
                        placeholder="Décrivez l'incident en détail..."
                        required
                      />
                    </div>
                    <div className="col-12 col-md-6">
                      <label className="form-label">Lieu *</label>
                      <input
                        type="text"
                        className="form-control"
                        value={formData.lieu}
                        onChange={(e) => setFormData({...formData, lieu: e.target.value})}
                        placeholder="Ex: Salle A203"
                        required
                      />
                    </div>
                    <div className="col-12 col-md-6">
                      <label className="form-label">Témoin(s)</label>
                      <input
                        type="text"
                        className="form-control"
                        value={formData.temoin}
                        onChange={(e) => setFormData({...formData, temoin: e.target.value})}
                        placeholder="Nom du témoin"
                      />
                    </div>
                    <div className="col-12">
                      <label className="form-label">Mesures prises immédiatement</label>
                      <textarea
                        className="form-control"
                        rows={2}
                        value={formData.mesuresPrises}
                        onChange={(e) => setFormData({...formData, mesuresPrises: e.target.value})}
                        placeholder="Décrivez les mesures prises..."
                      />
                    </div>
                  </div>
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>
                    Annuler
                  </button>
                  <button type="submit" className="btn btn-primary">
                    <FileText size={18} className="me-2" />
                    Enregistrer le Rapport
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

export default IncidentsPage;

// Made with Bob
