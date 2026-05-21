import React, { useState, useEffect } from 'react';
import { api } from '../../../api/client';
import toast from 'react-hot-toast';
import {
  BookOpen, Plus, Edit, Trash2, X, AlertCircle, CheckCircle,
  Loader2, FileText, Copy, ChevronDown, ChevronUp
} from 'lucide-react';

interface UniteEnseignement {
  id: string;
  code: string;
  intitule: string;
  credits_ects: number;
  coefficient: number;
  volume_cm: number;
  volume_td: number;
  volume_tp: number;
  semestre: number;
  annee_niveau: number;
  type_ue: string;
  parcours_nom: string;
  parcours_code: string;
  nb_elements: number;
  nb_affectations: number;
}

interface ElementConstitutif {
  id: string;
  code: string;
  intitule: string;
  coefficient: number;
  nb_affectations: number;
  nb_supports: number;
}

interface Parcours {
  id: string;
  nom: string;
  code: string;
  departement_nom: string;
  nb_ues: number;
}

export const CreationCoursPage: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [mesUEs, setMesUEs] = useState<UniteEnseignement[]>([]);
  const [parcours, setParcours] = useState<Parcours[]>([]);
  const [selectedUE, setSelectedUE] = useState<string>('');
  const [elementsConstitutifs, setElementsConstitutifs] = useState<ElementConstitutif[]>([]);
  const [expandedUE, setExpandedUE] = useState<string>('');

  // Modals
  const [showCreateUEModal, setShowCreateUEModal] = useState(false);
  const [showCreateECModal, setShowCreateECModal] = useState(false);
  const [showEditUEModal, setShowEditUEModal] = useState(false);

  // Forms
  const [ueForm, setUeForm] = useState({
    parcoursId: '',
    code: '',
    intitule: '',
    creditsEcts: 3,
    coefficient: 1.0,
    volumeCm: 0,
    volumeTd: 0,
    volumeTp: 0,
    semestre: 1,
    anneeNiveau: 1,
    typeUe: 'obligatoire'
  });

  const [ecForm, setEcForm] = useState({
    ueId: '',
    code: '',
    intitule: '',
    coefficient: 1.0
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      await Promise.all([loadMesUEs(), loadParcours()]);
    } catch (error) {
      console.error('Erreur chargement:', error);
      toast.error('Erreur lors du chargement des données');
    } finally {
      setLoading(false);
    }
  };

  const loadMesUEs = async () => {
    try {
      const { data } = await api.get('/portail/enseignant/cours/mes-unites-enseignement');
      setMesUEs(data);
    } catch (error) {
      console.error('Erreur chargement UEs:', error);
    }
  };

  const loadParcours = async () => {
    try {
      const { data } = await api.get('/portail/enseignant/cours/parcours-disponibles');
      setParcours(data);
    } catch (error) {
      console.error('Erreur chargement parcours:', error);
    }
  };

  const loadElementsConstitutifs = async (ueId: string) => {
    try {
      const { data } = await api.get(`/portail/enseignant/cours/unite-enseignement/${ueId}/elements`);
      setElementsConstitutifs(data);
    } catch (error) {
      console.error('Erreur chargement ECs:', error);
    }
  };

  const handleCreateUE = async () => {
    if (!ueForm.parcoursId || !ueForm.code || !ueForm.intitule) {
      toast.error('Veuillez remplir tous les champs obligatoires');
      return;
    }

    try {
      await api.post('/portail/enseignant/cours/unite-enseignement', ueForm);
      toast.success('Unité d\'enseignement créée avec succès');
      setShowCreateUEModal(false);
      loadMesUEs();
      resetUEForm();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Erreur lors de la création');
    }
  };

  const handleUpdateUE = async () => {
    if (!selectedUE) return;

    try {
      await api.patch(`/portail/enseignant/cours/unite-enseignement/${selectedUE}`, ueForm);
      toast.success('Unité d\'enseignement modifiée avec succès');
      setShowEditUEModal(false);
      loadMesUEs();
      resetUEForm();
      setSelectedUE('');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Erreur lors de la modification');
    }
  };

  const handleCreateEC = async () => {
    if (!ecForm.ueId || !ecForm.code || !ecForm.intitule) {
      toast.error('Veuillez remplir tous les champs obligatoires');
      return;
    }

    try {
      await api.post('/portail/enseignant/cours/element-constitutif', ecForm);
      toast.success('Élément constitutif créé avec succès');
      setShowCreateECModal(false);
      if (expandedUE) {
        loadElementsConstitutifs(expandedUE);
      }
      loadMesUEs();
      resetECForm();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Erreur lors de la création');
    }
  };

  const handleDeleteEC = async (ecId: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cet élément constitutif?')) return;

    try {
      await api.delete(`/portail/enseignant/cours/element-constitutif/${ecId}`);
      toast.success('Élément constitutif supprimé');
      if (expandedUE) {
        loadElementsConstitutifs(expandedUE);
      }
      loadMesUEs();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Erreur lors de la suppression');
    }
  };

  const handleDuplicateUE = async (ueId: string) => {
    const ue = mesUEs.find(u => u.id === ueId);
    if (!ue) return;

    const dupliquerElements = confirm('Voulez-vous également dupliquer les éléments constitutifs?');

    try {
      await api.post(`/portail/enseignant/cours/unite-enseignement/${ueId}/dupliquer`, {
        code: ue.code + '_COPIE',
        intitule: ue.intitule + ' (Copie)',
        dupliquerElements
      });
      toast.success('Unité d\'enseignement dupliquée avec succès');
      loadMesUEs();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Erreur lors de la duplication');
    }
  };

  const handleEditUE = (ue: UniteEnseignement) => {
    setSelectedUE(ue.id);
    setUeForm({
      parcoursId: '', // On ne peut pas changer le parcours
      code: ue.code,
      intitule: ue.intitule,
      creditsEcts: ue.credits_ects,
      coefficient: ue.coefficient,
      volumeCm: ue.volume_cm,
      volumeTd: ue.volume_td,
      volumeTp: ue.volume_tp,
      semestre: ue.semestre,
      anneeNiveau: ue.annee_niveau,
      typeUe: ue.type_ue
    });
    setShowEditUEModal(true);
  };

  const toggleUEExpansion = async (ueId: string) => {
    if (expandedUE === ueId) {
      setExpandedUE('');
      setElementsConstitutifs([]);
    } else {
      setExpandedUE(ueId);
      await loadElementsConstitutifs(ueId);
    }
  };

  const resetUEForm = () => {
    setUeForm({
      parcoursId: '',
      code: '',
      intitule: '',
      creditsEcts: 3,
      coefficient: 1.0,
      volumeCm: 0,
      volumeTd: 0,
      volumeTp: 0,
      semestre: 1,
      anneeNiveau: 1,
      typeUe: 'obligatoire'
    });
  };

  const resetECForm = () => {
    setEcForm({
      ueId: '',
      code: '',
      intitule: '',
      coefficient: 1.0
    });
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '400px' }}>
        <Loader2 size={40} className="animate-spin" color="#3b82f6" />
      </div>
    );
  }

  return (
    <div className="container-fluid p-4">
      {/* Header */}
      <div className="mb-4">
        <h1 className="h3 fw-bold mb-2" style={{ color: '#1e293b' }}>
          <BookOpen size={24} className="me-2" />
          Création de Cours
        </h1>
        <p className="text-muted mb-0">
          Créez et gérez vos unités d'enseignement et éléments constitutifs
        </p>
      </div>

      {/* Actions */}
      <div className="mb-4">
        <button
          className="btn btn-primary"
          onClick={() => setShowCreateUEModal(true)}
        >
          <Plus size={18} className="me-2" />
          Créer une Unité d'Enseignement
        </button>
      </div>

      {/* Liste des UEs */}
      <div className="card border-0 shadow-sm" style={{ borderRadius: 12 }}>
        <div className="card-body p-4">
          <h5 className="fw-bold mb-4" style={{ color: '#1e293b' }}>
            Mes Unités d'Enseignement ({mesUEs.length})
          </h5>

          {mesUEs.length === 0 ? (
            <div className="alert alert-info">
              <AlertCircle size={20} className="me-2" />
              Aucune unité d'enseignement créée. Commencez par créer une UE.
            </div>
          ) : (
            <div className="d-flex flex-column gap-3">
              {mesUEs.map((ue) => (
                <div key={ue.id}>
                  <div
                    className="p-3"
                    style={{
                      background: '#f8fafc',
                      borderRadius: 10,
                      border: '1px solid #e5e7eb'
                    }}
                  >
                    <div className="d-flex justify-content-between align-items-start">
                      <div className="flex-grow-1">
                        <div className="d-flex align-items-center gap-2 mb-2">
                          <span
                            className="badge"
                            style={{
                              background: 'rgba(59, 130, 246, 0.1)',
                              color: '#3b82f6',
                              fontSize: 11
                            }}
                          >
                            {ue.code}
                          </span>
                          <span
                            className="badge"
                            style={{
                              background: ue.type_ue === 'obligatoire' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(245, 158, 11, 0.1)',
                              color: ue.type_ue === 'obligatoire' ? '#10b981' : '#f59e0b',
                              fontSize: 10
                            }}
                          >
                            {ue.type_ue}
                          </span>
                        </div>
                        <div className="fw-bold mb-1" style={{ fontSize: 15, color: '#1e293b' }}>
                          {ue.intitule}
                        </div>
                        <div className="text-muted mb-2" style={{ fontSize: 12 }}>
                          {ue.parcours_nom} ({ue.parcours_code}) • Semestre {ue.semestre} • Niveau {ue.annee_niveau}
                        </div>
                        <div className="d-flex gap-3 text-muted" style={{ fontSize: 12 }}>
                          <div><strong>{ue.credits_ects}</strong> ECTS</div>
                          <div>Coef: <strong>{ue.coefficient}</strong></div>
                          <div>CM: <strong>{ue.volume_cm}h</strong></div>
                          <div>TD: <strong>{ue.volume_td}h</strong></div>
                          <div>TP: <strong>{ue.volume_tp}h</strong></div>
                          <div>|</div>
                          <div><strong>{ue.nb_elements}</strong> EC</div>
                        </div>
                      </div>
                      <div className="d-flex gap-2">
                        <button
                          className="btn btn-sm btn-link text-primary p-1"
                          onClick={() => handleEditUE(ue)}
                          title="Modifier"
                        >
                          <Edit size={16} />
                        </button>
                        <button
                          className="btn btn-sm btn-link text-secondary p-1"
                          onClick={() => handleDuplicateUE(ue.id)}
                          title="Dupliquer"
                        >
                          <Copy size={16} />
                        </button>
                        <button
                          className="btn btn-sm btn-link text-info p-1"
                          onClick={() => toggleUEExpansion(ue.id)}
                          title={expandedUE === ue.id ? "Masquer les EC" : "Voir les EC"}
                        >
                          {expandedUE === ue.id ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Éléments Constitutifs */}
                  {expandedUE === ue.id && (
                    <div className="ms-4 mt-2">
                      <div className="d-flex justify-content-between align-items-center mb-2">
                        <h6 className="fw-bold mb-0" style={{ fontSize: 13, color: '#64748b' }}>
                          <FileText size={14} className="me-1" />
                          Éléments Constitutifs
                        </h6>
                        <button
                          className="btn btn-sm btn-primary"
                          onClick={() => {
                            setEcForm({ ...ecForm, ueId: ue.id });
                            setShowCreateECModal(true);
                          }}
                        >
                          <Plus size={14} className="me-1" />
                          Ajouter EC
                        </button>
                      </div>

                      {elementsConstitutifs.length === 0 ? (
                        <div className="alert alert-info py-2" style={{ fontSize: 12 }}>
                          <AlertCircle size={16} className="me-2" />
                          Aucun élément constitutif. Ajoutez-en un pour structurer votre UE.
                        </div>
                      ) : (
                        <div className="d-flex flex-column gap-2">
                          {elementsConstitutifs.map((ec) => (
                            <div
                              key={ec.id}
                              className="p-2 d-flex justify-content-between align-items-center"
                              style={{
                                background: '#ffffff',
                                borderRadius: 8,
                                border: '1px solid #e5e7eb'
                              }}
                            >
                              <div>
                                <span
                                  className="badge me-2"
                                  style={{
                                    background: 'rgba(139, 92, 246, 0.1)',
                                    color: '#8b5cf6',
                                    fontSize: 10
                                  }}
                                >
                                  {ec.code}
                                </span>
                                <span className="fw-bold" style={{ fontSize: 13, color: '#1e293b' }}>
                                  {ec.intitule}
                                </span>
                                <span className="text-muted ms-2" style={{ fontSize: 11 }}>
                                  (Coef: {ec.coefficient})
                                </span>
                              </div>
                              <button
                                className="btn btn-sm btn-link text-danger p-1"
                                onClick={() => handleDeleteEC(ec.id)}
                                title="Supprimer"
                              >
                                <Trash2 size={14} />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Modal Création UE */}
      {showCreateUEModal && (
        <div className="modal show d-block" style={{ background: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-lg">
            <div className="modal-content" style={{ borderRadius: 12 }}>
              <div className="modal-header border-0">
                <h5 className="modal-title fw-bold">Créer une Unité d'Enseignement</h5>
                <button className="btn-close" onClick={() => { setShowCreateUEModal(false); resetUEForm(); }}></button>
              </div>
              <div className="modal-body">
                <div className="row g-3">
                  <div className="col-12">
                    <label className="form-label fw-bold">Parcours *</label>
                    <select
                      className="form-select"
                      value={ueForm.parcoursId}
                      onChange={(e) => setUeForm({ ...ueForm, parcoursId: e.target.value })}
                    >
                      <option value="">-- Sélectionner un parcours --</option>
                      {parcours.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.nom} ({p.code}) - {p.departement_nom}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="col-md-6">
                    <label className="form-label fw-bold">Code *</label>
                    <input
                      type="text"
                      className="form-control"
                      value={ueForm.code}
                      onChange={(e) => setUeForm({ ...ueForm, code: e.target.value })}
                      placeholder="Ex: UE101"
                    />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label fw-bold">Intitulé *</label>
                    <input
                      type="text"
                      className="form-control"
                      value={ueForm.intitule}
                      onChange={(e) => setUeForm({ ...ueForm, intitule: e.target.value })}
                      placeholder="Ex: Mathématiques Générales"
                    />
                  </div>
                  <div className="col-md-4">
                    <label className="form-label fw-bold">Crédits ECTS</label>
                    <input
                      type="number"
                      className="form-control"
                      value={ueForm.creditsEcts}
                      onChange={(e) => setUeForm({ ...ueForm, creditsEcts: parseInt(e.target.value) || 0 })}
                      min="1"
                      max="30"
                    />
                  </div>
                  <div className="col-md-4">
                    <label className="form-label fw-bold">Coefficient</label>
                    <input
                      type="number"
                      step="0.1"
                      className="form-control"
                      value={ueForm.coefficient}
                      onChange={(e) => setUeForm({ ...ueForm, coefficient: parseFloat(e.target.value) || 0 })}
                      min="0.1"
                      max="10"
                    />
                  </div>
                  <div className="col-md-4">
                    <label className="form-label fw-bold">Type UE</label>
                    <select
                      className="form-select"
                      value={ueForm.typeUe}
                      onChange={(e) => setUeForm({ ...ueForm, typeUe: e.target.value })}
                    >
                      <option value="obligatoire">Obligatoire</option>
                      <option value="optionnel">Optionnel</option>
                      <option value="libre">Libre</option>
                    </select>
                  </div>
                  <div className="col-md-4">
                    <label className="form-label fw-bold">Volume CM (h)</label>
                    <input
                      type="number"
                      className="form-control"
                      value={ueForm.volumeCm}
                      onChange={(e) => setUeForm({ ...ueForm, volumeCm: parseInt(e.target.value) || 0 })}
                      min="0"
                    />
                  </div>
                  <div className="col-md-4">
                    <label className="form-label fw-bold">Volume TD (h)</label>
                    <input
                      type="number"
                      className="form-control"
                      value={ueForm.volumeTd}
                      onChange={(e) => setUeForm({ ...ueForm, volumeTd: parseInt(e.target.value) || 0 })}
                      min="0"
                    />
                  </div>
                  <div className="col-md-4">
                    <label className="form-label fw-bold">Volume TP (h)</label>
                    <input
                      type="number"
                      className="form-control"
                      value={ueForm.volumeTp}
                      onChange={(e) => setUeForm({ ...ueForm, volumeTp: parseInt(e.target.value) || 0 })}
                      min="0"
                    />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label fw-bold">Semestre</label>
                    <select
                      className="form-select"
                      value={ueForm.semestre}
                      onChange={(e) => setUeForm({ ...ueForm, semestre: parseInt(e.target.value) })}
                    >
                      {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map(s => (
                        <option key={s} value={s}>Semestre {s}</option>
                      ))}
                    </select>
                  </div>
                  <div className="col-md-6">
                    <label className="form-label fw-bold">Année/Niveau</label>
                    <select
                      className="form-select"
                      value={ueForm.anneeNiveau}
                      onChange={(e) => setUeForm({ ...ueForm, anneeNiveau: parseInt(e.target.value) })}
                    >
                      {[1, 2, 3, 4, 5, 6, 7, 8].map(n => (
                        <option key={n} value={n}>Niveau {n}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
              <div className="modal-footer border-0">
                <button className="btn btn-secondary" onClick={() => { setShowCreateUEModal(false); resetUEForm(); }}>
                  Annuler
                </button>
                <button className="btn btn-primary" onClick={handleCreateUE}>
                  <CheckCircle size={16} className="me-2" />
                  Créer l'UE
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal Modification UE */}
      {showEditUEModal && (
        <div className="modal show d-block" style={{ background: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-lg">
            <div className="modal-content" style={{ borderRadius: 12 }}>
              <div className="modal-header border-0">
                <h5 className="modal-title fw-bold">Modifier l'Unité d'Enseignement</h5>
                <button className="btn-close" onClick={() => { setShowEditUEModal(false); resetUEForm(); setSelectedUE(''); }}></button>
              </div>
              <div className="modal-body">
                <div className="row g-3">
                  <div className="col-md-6">
                    <label className="form-label fw-bold">Code</label>
                    <input
                      type="text"
                      className="form-control"
                      value={ueForm.code}
                      onChange={(e) => setUeForm({ ...ueForm, code: e.target.value })}
                    />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label fw-bold">Intitulé</label>
                    <input
                      type="text"
                      className="form-control"
                      value={ueForm.intitule}
                      onChange={(e) => setUeForm({ ...ueForm, intitule: e.target.value })}
                    />
                  </div>
                  <div className="col-md-4">
                    <label className="form-label fw-bold">Crédits ECTS</label>
                    <input
                      type="number"
                      className="form-control"
                      value={ueForm.creditsEcts}
                      onChange={(e) => setUeForm({ ...ueForm, creditsEcts: parseInt(e.target.value) || 0 })}
                    />
                  </div>
                  <div className="col-md-4">
                    <label className="form-label fw-bold">Coefficient</label>
                    <input
                      type="number"
                      step="0.1"
                      className="form-control"
                      value={ueForm.coefficient}
                      onChange={(e) => setUeForm({ ...ueForm, coefficient: parseFloat(e.target.value) || 0 })}
                    />
                  </div>
                  <div className="col-md-4">
                    <label className="form-label fw-bold">Type UE</label>
                    <select
                      className="form-select"
                      value={ueForm.typeUe}
                      onChange={(e) => setUeForm({ ...ueForm, typeUe: e.target.value })}
                    >
                      <option value="obligatoire">Obligatoire</option>
                      <option value="optionnel">Optionnel</option>
                      <option value="libre">Libre</option>
                    </select>
                  </div>
                  <div className="col-md-4">
                    <label className="form-label fw-bold">Volume CM (h)</label>
                    <input
                      type="number"
                      className="form-control"
                      value={ueForm.volumeCm}
                      onChange={(e) => setUeForm({ ...ueForm, volumeCm: parseInt(e.target.value) || 0 })}
                    />
                  </div>
                  <div className="col-md-4">
                    <label className="form-label fw-bold">Volume TD (h)</label>
                    <input
                      type="number"
                      className="form-control"
                      value={ueForm.volumeTd}
                      onChange={(e) => setUeForm({ ...ueForm, volumeTd: parseInt(e.target.value) || 0 })}
                    />
                  </div>
                  <div className="col-md-4">
                    <label className="form-label fw-bold">Volume TP (h)</label>
                    <input
                      type="number"
                      className="form-control"
                      value={ueForm.volumeTp}
                      onChange={(e) => setUeForm({ ...ueForm, volumeTp: parseInt(e.target.value) || 0 })}
                    />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label fw-bold">Semestre</label>
                    <select
                      className="form-select"
                      value={ueForm.semestre}
                      onChange={(e) => setUeForm({ ...ueForm, semestre: parseInt(e.target.value) })}
                    >
                      {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map(s => (
                        <option key={s} value={s}>Semestre {s}</option>
                      ))}
                    </select>
                  </div>
                  <div className="col-md-6">
                    <label className="form-label fw-bold">Année/Niveau</label>
                    <select
                      className="form-select"
                      value={ueForm.anneeNiveau}
                      onChange={(e) => setUeForm({ ...ueForm, anneeNiveau: parseInt(e.target.value) })}
                    >
                      {[1, 2, 3, 4, 5, 6, 7, 8].map(n => (
                        <option key={n} value={n}>Niveau {n}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
              <div className="modal-footer border-0">
                <button className="btn btn-secondary" onClick={() => { setShowEditUEModal(false); resetUEForm(); setSelectedUE(''); }}>
                  Annuler
                </button>
                <button className="btn btn-primary" onClick={handleUpdateUE}>
                  <CheckCircle size={16} className="me-2" />
                  Enregistrer
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal Création EC */}
      {showCreateECModal && (
        <div className="modal show d-block" style={{ background: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog">
            <div className="modal-content" style={{ borderRadius: 12 }}>
              <div className="modal-header border-0">
                <h5 className="modal-title fw-bold">Ajouter un Élément Constitutif</h5>
                <button className="btn-close" onClick={() => { setShowCreateECModal(false); resetECForm(); }}></button>
              </div>
              <div className="modal-body">
                <div className="row g-3">
                  <div className="col-12">
                    <label className="form-label fw-bold">Code *</label>
                    <input
                      type="text"
                      className="form-control"
                      value={ecForm.code}
                      onChange={(e) => setEcForm({ ...ecForm, code: e.target.value })}
                      placeholder="Ex: EC101"
                    />
                  </div>
                  <div className="col-12">
                    <label className="form-label fw-bold">Intitulé *</label>
                    <input
                      type="text"
                      className="form-control"
                      value={ecForm.intitule}
                      onChange={(e) => setEcForm({ ...ecForm, intitule: e.target.value })}
                      placeholder="Ex: Algèbre Linéaire"
                    />
                  </div>
                  <div className="col-12">
                    <label className="form-label fw-bold">Coefficient</label>
                    <input
                      type="number"
                      step="0.1"
                      className="form-control"
                      value={ecForm.coefficient}
                      onChange={(e) => setEcForm({ ...ecForm, coefficient: parseFloat(e.target.value) || 0 })}
                      min="0.1"
                      max="10"
                    />
                  </div>
                </div>
              </div>
              <div className="modal-footer border-0">
                <button className="btn btn-secondary" onClick={() => { setShowCreateECModal(false); resetECForm(); }}>
                  Annuler
                </button>
                <button className="btn btn-primary" onClick={handleCreateEC}>
                  <CheckCircle size={16} className="me-2" />
                  Ajouter l'EC
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Made with Bob
