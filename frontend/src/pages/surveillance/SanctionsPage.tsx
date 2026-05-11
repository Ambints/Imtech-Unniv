import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Scale, ArrowLeft, Plus, Search, Eye, Edit, Trash2,
  FileText, User, Calendar, AlertTriangle, CheckCircle
} from 'lucide-react';
import { api } from '../../api/client';
import { useAuthStore } from '../../store/authStore';

interface Etudiant {
  id: string;
  nom: string;
  prenom: string;
  matricule: string;
  photo_url?: string;
  classe?: string;
  parcours_code?: string;
}

interface Sanction {
  id: string;
  type: 'avertissement' | 'blame' | 'exclusion_temporaire' | 'exclusion_definitive' | 'travaux_interet_general';
  etudiant: {
    id: string;
    nom: string;
    prenom: string;
    matricule: string;
    classe: string;
  };
  motif: string;
  incidentId?: string;
  dateDecision: string;
  duree?: number; // Pour exclusions temporaires (en jours)
  dateDebut?: string;
  dateFin?: string;
  prononcePar: string;
  statut: 'en_cours' | 'executee' | 'annulee';
  observations?: string;
}

const TYPE_LABELS: Record<string, string> = {
  avertissement: 'Avertissement',
  blame: 'Blâme',
  exclusion_temporaire: 'Exclusion Temporaire',
  exclusion_definitive: 'Exclusion Définitive',
  travaux_interet_general: 'Travaux d\'Intérêt Général'
};

const TYPE_COLORS: Record<string, string> = {
  avertissement: 'warning',
  blame: 'orange',
  exclusion_temporaire: 'danger',
  exclusion_definitive: 'dark',
  travaux_interet_general: 'info'
};

const STATUT_COLORS: Record<string, string> = {
  en_cours: 'warning',
  executee: 'success',
  annulee: 'secondary'
};

export const SanctionsPage: React.FC = () => {
  const navigate = useNavigate();
  const { tenant } = useAuthStore();
  const tenantId = tenant?.id;
  const [sanctions, setSanctions] = useState<Sanction[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedSanction, setSelectedSanction] = useState<Sanction | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [filterStatut, setFilterStatut] = useState<string>('all');
  
  // États pour la recherche d'étudiant
  const [etudiantSearch, setEtudiantSearch] = useState('');
  const [etudiants, setEtudiants] = useState<Etudiant[]>([]);
  const [selectedEtudiant, setSelectedEtudiant] = useState<Etudiant | null>(null);
  const [showEtudiantDropdown, setShowEtudiantDropdown] = useState(false);
  const [loadingEtudiants, setLoadingEtudiants] = useState(false);
  
  const [formData, setFormData] = useState({
    type: 'avertissement',
    etudiantId: '',
    motif: '',
    incidentId: '',
    duree: '',
    dateDebut: '',
    observations: ''
  });

  useEffect(() => {
    if (tenantId) {
      loadSanctions();
    }
  }, [tenantId]);

  const loadSanctions = async () => {
    if (!tenantId) return;
    try {
      setLoading(true);
      const response = await api.get(`/discipline/${tenantId}/sanctions`);
      setSanctions(response.data || []);
    } catch (error) {
      console.error('Erreur chargement sanctions:', error);
      setSanctions([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tenantId) return;
    try {
      const payload = {
        ...formData,
        duree: formData.duree ? parseInt(formData.duree) : undefined
      };

      if (selectedSanction) {
        await api.patch(`/discipline/${tenantId}/sanctions/${selectedSanction.id}`, payload);
      } else {
        await api.post(`/discipline/${tenantId}/sanctions`, payload);
      }

      alert('Sanction enregistrée avec succès!');
      setShowModal(false);
      setSelectedSanction(null);
      loadSanctions();
    } catch (error) {
      console.error('Erreur enregistrement sanction:', error);
      alert('Erreur lors de l\'enregistrement');
    }
  };

  const handleDelete = async (id: string) => {
    if (!tenantId) return;
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette sanction ?')) return;
    try {
      await api.delete(`/discipline/${tenantId}/sanctions/${id}`);
      setSanctions(prev => prev.filter(s => s.id !== id));
      alert('Sanction supprimée');
    } catch (error) {
      console.error('Erreur suppression:', error);
      alert('Erreur lors de la suppression');
    }
  };

  const handleAnnuler = async (id: string) => {
    if (!tenantId) return;
    if (!confirm('Êtes-vous sûr de vouloir annuler cette sanction ?')) return;
    try {
      await api.patch(`/discipline/${tenantId}/sanctions/${id}/annuler`);
      loadSanctions();
      alert('Sanction annulée');
    } catch (error) {
      console.error('Erreur annulation:', error);
      alert('Erreur lors de l\'annulation');
    }
  };

  // Fonction de recherche d'étudiant avec debounce
  const searchEtudiants = useCallback(async (query: string) => {
    if (!tenantId || query.length < 2) {
      setEtudiants([]);
      setShowEtudiantDropdown(false);
      return;
    }

    setLoadingEtudiants(true);
    try {
      const response = await api.get(`/portail/${tenantId}/etudiants/search`, {
        params: { q: query }
      });
      setEtudiants(response.data);
      setShowEtudiantDropdown(true);
    } catch (error) {
      console.error('Erreur recherche étudiants:', error);
      setEtudiants([]);
    } finally {
      setLoadingEtudiants(false);
    }
  }, [tenantId]);

  // Debounce pour la recherche
  useEffect(() => {
    const timer = setTimeout(() => {
      if (etudiantSearch) {
        searchEtudiants(etudiantSearch);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [etudiantSearch, searchEtudiants]);

  const selectEtudiant = (etudiant: Etudiant) => {
    setSelectedEtudiant(etudiant);
    setFormData({...formData, etudiantId: etudiant.id});
    setEtudiantSearch(`${etudiant.prenom} ${etudiant.nom} (${etudiant.matricule})`);
    setShowEtudiantDropdown(false);
  };

  const resetEtudiantSearch = () => {
    setSelectedEtudiant(null);
    setEtudiantSearch('');
    setFormData({...formData, etudiantId: ''});
    setShowEtudiantDropdown(false);
  };

  const filteredSanctions = sanctions.filter(sanction => {
    const matchSearch =
      sanction.etudiant?.nom?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sanction.etudiant?.prenom?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sanction.etudiant?.matricule?.includes(searchTerm) ||
      sanction.motif.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchType = filterType === 'all' || sanction.type === filterType;
    const matchStatut = filterStatut === 'all' || sanction.statut === filterStatut;
    
    return matchSearch && matchType && matchStatut;
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
            <Scale className="me-2" size={28} />
            Sanctions Disciplinaires
          </h2>
          <p className="text-muted mb-0">Gestion des sanctions et mesures disciplinaires</p>
        </div>
        <div className="col-auto">
          <button className="btn btn-primary" onClick={() => {
            setSelectedSanction(null);
            setFormData({
              type: 'avertissement',
              etudiantId: '',
              motif: '',
              incidentId: '',
              duree: '',
              dateDebut: '',
              observations: ''
            });
            resetEtudiantSearch();
            setShowModal(true);
          }}>
            <Plus size={18} className="me-2" />
            Prononcer une Sanction
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
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
              >
                <option value="all">Tous types</option>
                {Object.entries(TYPE_LABELS).map(([key, label]) => (
                  <option key={key} value={key}>{label}</option>
                ))}
              </select>
            </div>
            <div className="col-6 col-md-3 col-lg-2">
              <select 
                className="form-select"
                value={filterStatut}
                onChange={(e) => setFilterStatut(e.target.value)}
              >
                <option value="all">Tous statuts</option>
                <option value="en_cours">En cours</option>
                <option value="executee">Exécutée</option>
                <option value="annulee">Annulée</option>
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
              <h3 className="mb-0 fw-bold text-warning">{sanctions.filter(s => s.type === 'avertissement').length}</h3>
              <small className="text-muted">Avertissements</small>
            </div>
          </div>
        </div>
        <div className="col-6 col-md-3">
          <div className="card border-0 shadow-sm">
            <div className="card-body text-center">
              <h3 className="mb-0 fw-bold text-danger">{sanctions.filter(s => s.type === 'exclusion_temporaire').length}</h3>
              <small className="text-muted">Exclusions Temp.</small>
            </div>
          </div>
        </div>
        <div className="col-6 col-md-3">
          <div className="card border-0 shadow-sm">
            <div className="card-body text-center">
              <h3 className="mb-0 fw-bold text-warning">{sanctions.filter(s => s.statut === 'en_cours').length}</h3>
              <small className="text-muted">En Cours</small>
            </div>
          </div>
        </div>
        <div className="col-6 col-md-3">
          <div className="card border-0 shadow-sm">
            <div className="card-body text-center">
              <h3 className="mb-0 fw-bold text-success">{sanctions.filter(s => s.statut === 'executee').length}</h3>
              <small className="text-muted">Exécutées</small>
            </div>
          </div>
        </div>
      </div>

      {/* Sanctions List */}
      <div className="row g-3">
        {filteredSanctions.length === 0 ? (
          <div className="col-12">
            <div className="card border-0 shadow-sm">
              <div className="card-body text-center py-5">
                <Scale size={48} className="text-muted mb-3 opacity-25" />
                <p className="text-muted">Aucune sanction trouvée</p>
              </div>
            </div>
          </div>
        ) : (
          filteredSanctions.map(sanction => (
            <div key={sanction.id} className="col-12">
              <div className="card border-0 shadow-sm">
                <div className="card-body">
                  <div className="row align-items-start">
                    <div className="col-12 col-md-8">
                      <div className="d-flex align-items-start mb-2">
                        <div className="me-3">
                          <div 
                            className={`rounded-circle bg-${TYPE_COLORS[sanction.type]} bg-opacity-10 d-flex align-items-center justify-content-center`}
                            style={{ width: 48, height: 48 }}
                          >
                            <Scale size={24} className={`text-${TYPE_COLORS[sanction.type]}`} />
                          </div>
                        </div>
                        <div className="flex-grow-1">
                          <div className="d-flex align-items-center gap-2 mb-2">
                            <h5 className="mb-0">{TYPE_LABELS[sanction.type]}</h5>
                            <span className={`badge bg-${STATUT_COLORS[sanction.statut]} bg-opacity-10 text-${STATUT_COLORS[sanction.statut]}`}>
                              {sanction.statut.replace('_', ' ')}
                            </span>
                          </div>
                          <div className="mb-2">
                            <User size={14} className="me-1" />
                            <strong>{sanction.etudiant?.prenom} {sanction.etudiant?.nom}</strong>
                            {sanction.etudiant?.matricule && (
                              <span className="text-muted ms-2">({sanction.etudiant.matricule})</span>
                            )}
                            {sanction.etudiant?.classe && (
                              <span className="text-muted ms-2">• {sanction.etudiant.classe}</span>
                            )}
                          </div>
                          <p className="mb-2"><strong>Motif:</strong> {sanction.motif}</p>
                          {sanction.duree && (
                            <div className="small text-muted mb-1">
                              <strong>Durée:</strong> {sanction.duree} jour(s)
                              {sanction.dateDebut && sanction.dateFin && (
                                <span className="ms-2">
                                  ({new Date(sanction.dateDebut).toLocaleDateString()} - {new Date(sanction.dateFin).toLocaleDateString()})
                                </span>
                              )}
                            </div>
                          )}
                          <div className="small text-muted">
                            <Calendar size={14} className="me-1" />
                            Décision: {new Date(sanction.dateDecision).toLocaleDateString('fr-FR')}
                            <span className="ms-3">Par: {sanction.prononcePar}</span>
                          </div>
                          {sanction.observations && (
                            <div className="small mt-2 p-2 bg-light rounded">
                              <strong>Observations:</strong> {sanction.observations}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="col-12 col-md-4 text-md-end">
                      <div className="btn-group">
                        <button 
                          className="btn btn-sm btn-outline-primary"
                          onClick={() => setSelectedSanction(sanction)}
                          title="Voir détails"
                        >
                          <Eye size={16} />
                        </button>
                        {sanction.statut === 'en_cours' && (
                          <>
                            <button 
                              className="btn btn-sm btn-outline-secondary"
                              onClick={() => {
                                setSelectedSanction(sanction);
                                setFormData({
                                  type: sanction.type,
                                  etudiantId: sanction.etudiant.id,
                                  motif: sanction.motif,
                                  incidentId: sanction.incidentId || '',
                                  duree: sanction.duree?.toString() || '',
                                  dateDebut: sanction.dateDebut || '',
                                  observations: sanction.observations || ''
                                });
                                setShowModal(true);
                              }}
                              title="Modifier"
                            >
                              <Edit size={16} />
                            </button>
                            <button 
                              className="btn btn-sm btn-outline-warning"
                              onClick={() => handleAnnuler(sanction.id)}
                              title="Annuler"
                            >
                              <AlertTriangle size={16} />
                            </button>
                          </>
                        )}
                        <button 
                          className="btn btn-sm btn-outline-danger"
                          onClick={() => handleDelete(sanction.id)}
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
                  <Scale size={20} className="me-2" />
                  {selectedSanction ? 'Modifier la Sanction' : 'Prononcer une Sanction'}
                </h5>
                <button type="button" className="btn-close" onClick={() => setShowModal(false)}></button>
              </div>
              <form onSubmit={handleSubmit}>
                <div className="modal-body">
                  <div className="row g-3">
                    <div className="col-12">
                      <label className="form-label">Type de sanction *</label>
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
                    <div className="col-12">
                      <label className="form-label">Étudiant concerné *</label>
                      <div className="position-relative">
                        <input
                          type="text"
                          className="form-control"
                          placeholder="Rechercher un étudiant par nom, prénom ou matricule..."
                          value={etudiantSearch}
                          onChange={(e) => setEtudiantSearch(e.target.value)}
                          onFocus={() => etudiantSearch && setShowEtudiantDropdown(true)}
                          required={!selectedEtudiant}
                        />
                        {selectedEtudiant && (
                          <button
                            type="button"
                            className="btn btn-sm btn-outline-secondary position-absolute top-50 end-0 translate-middle-y me-2"
                            onClick={resetEtudiantSearch}
                            style={{ zIndex: 10 }}
                          >
                            ✕
                          </button>
                        )}
                        
                        {/* Dropdown des résultats */}
                        {showEtudiantDropdown && etudiants.length > 0 && (
                          <div className="position-absolute w-100 mt-1 bg-white border rounded shadow-lg" style={{ zIndex: 1000, maxHeight: '300px', overflowY: 'auto' }}>
                            {loadingEtudiants ? (
                              <div className="p-3 text-center">
                                <div className="spinner-border spinner-border-sm" role="status">
                                  <span className="visually-hidden">Chargement...</span>
                                </div>
                              </div>
                            ) : (
                              etudiants.map((etudiant) => (
                                <div
                                  key={etudiant.id}
                                  className="p-2 border-bottom cursor-pointer hover-bg-light d-flex align-items-center"
                                  onClick={() => selectEtudiant(etudiant)}
                                  style={{ cursor: 'pointer' }}
                                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f8f9fa'}
                                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'white'}
                                >
                                  {etudiant.photo_url ? (
                                    <img
                                      src={etudiant.photo_url}
                                      alt={`${etudiant.prenom} ${etudiant.nom}`}
                                      className="rounded-circle me-2"
                                      style={{ width: '32px', height: '32px', objectFit: 'cover' }}
                                    />
                                  ) : (
                                    <div
                                      className="rounded-circle bg-primary text-white d-flex align-items-center justify-content-center me-2"
                                      style={{ width: '32px', height: '32px', fontSize: '14px' }}
                                    >
                                      {etudiant.prenom?.[0]}{etudiant.nom?.[0]}
                                    </div>
                                  )}
                                  <div className="flex-grow-1">
                                    <div className="fw-semibold">{etudiant.prenom} {etudiant.nom}</div>
                                    <small className="text-muted">
                                      {etudiant.matricule}
                                      {etudiant.classe && ` • ${etudiant.classe}`}
                                      {etudiant.parcours_code && ` • ${etudiant.parcours_code}`}
                                    </small>
                                  </div>
                                </div>
                              ))
                            )}
                          </div>
                        )}
                      </div>
                      {selectedEtudiant && (
                        <div className="mt-2 p-2 bg-light rounded d-flex align-items-center">
                          {selectedEtudiant.photo_url ? (
                            <img
                              src={selectedEtudiant.photo_url}
                              alt={`${selectedEtudiant.prenom} ${selectedEtudiant.nom}`}
                              className="rounded-circle me-2"
                              style={{ width: '40px', height: '40px', objectFit: 'cover' }}
                            />
                          ) : (
                            <div
                              className="rounded-circle bg-primary text-white d-flex align-items-center justify-content-center me-2"
                              style={{ width: '40px', height: '40px' }}
                            >
                              {selectedEtudiant.prenom?.[0]}{selectedEtudiant.nom?.[0]}
                            </div>
                          )}
                          <div>
                            <div className="fw-semibold">{selectedEtudiant.prenom} {selectedEtudiant.nom}</div>
                            <small className="text-muted">{selectedEtudiant.matricule}</small>
                          </div>
                        </div>
                      )}
                    </div>
                    <div className="col-12">
                      <label className="form-label">Motif détaillé *</label>
                      <textarea
                        className="form-control"
                        rows={3}
                        value={formData.motif}
                        onChange={(e) => setFormData({...formData, motif: e.target.value})}
                        placeholder="Décrivez le motif de la sanction..."
                        required
                      />
                    </div>
                    <div className="col-12 col-md-6">
                      <label className="form-label">Incident lié (optionnel)</label>
                      <input
                        type="text"
                        className="form-control"
                        value={formData.incidentId}
                        onChange={(e) => setFormData({...formData, incidentId: e.target.value})}
                        placeholder="ID de l'incident"
                      />
                    </div>
                    {(formData.type === 'exclusion_temporaire' || formData.type === 'travaux_interet_general') && (
                      <>
                        <div className="col-12 col-md-6">
                          <label className="form-label">Durée (jours) *</label>
                          <input
                            type="number"
                            className="form-control"
                            value={formData.duree}
                            onChange={(e) => setFormData({...formData, duree: e.target.value})}
                            min="1"
                            required
                          />
                        </div>
                        <div className="col-12 col-md-6">
                          <label className="form-label">Date de début *</label>
                          <input
                            type="date"
                            className="form-control"
                            value={formData.dateDebut}
                            onChange={(e) => setFormData({...formData, dateDebut: e.target.value})}
                            required
                          />
                        </div>
                      </>
                    )}
                    <div className="col-12">
                      <label className="form-label">Observations</label>
                      <textarea
                        className="form-control"
                        rows={2}
                        value={formData.observations}
                        onChange={(e) => setFormData({...formData, observations: e.target.value})}
                        placeholder="Observations complémentaires..."
                      />
                    </div>
                  </div>
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>
                    Annuler
                  </button>
                  <button type="submit" className="btn btn-primary">
                    <CheckCircle size={18} className="me-2" />
                    Enregistrer
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

export default SanctionsPage;

// Made with Bob