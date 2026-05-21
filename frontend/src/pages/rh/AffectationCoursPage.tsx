import React, { useState, useEffect } from 'react';
import { api } from '../../api/client';
import toast from 'react-hot-toast';
import { BookOpen, Search, Plus, Edit, Trash2, Users, Calendar, X, Save } from 'lucide-react';

interface UniteEnseignement {
  id: string;
  code: string;
  libelle: string;
  credits: number;
  volume_horaire_cm?: number;
  volume_horaire_td?: number;
  volume_horaire_tp?: number;
  parcours_id: string;
  parcours_nom?: string;
  semestre: number;
  annee_niveau: number;
}

interface Affectation {
  id: string;
  enseignant_id: string;
  enseignant_nom?: string;
  enseignant_prenom?: string;
  unite_enseignement_id: string;
  ue_code?: string;
  ue_libelle?: string;
  annee_academique_id: string;
  annee_academique?: string;
  type_enseignement: 'CM' | 'TD' | 'TP';
  volume_horaire: number;
}

interface Parcours {
  id: string;
  nom: string;
  code: string;
}

interface Enseignant {
  id: string;
  nom: string;
  prenom: string;
  email: string;
}

export const AffectationCoursPage: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'ues' | 'affectations'>('ues');
  
  // UEs
  const [ues, setUes] = useState<UniteEnseignement[]>([]);
  const [searchUE, setSearchUE] = useState('');
  const [showUEModal, setShowUEModal] = useState(false);
  const [editingUE, setEditingUE] = useState<UniteEnseignement | null>(null);
  
  // Affectations
  const [affectations, setAffectations] = useState<Affectation[]>([]);
  const [searchAffectation, setSearchAffectation] = useState('');
  const [showAffectationModal, setShowAffectationModal] = useState(false);
  
  // Données de référence
  const [parcours, setParcours] = useState<Parcours[]>([]);
  const [enseignants, setEnseignants] = useState<Enseignant[]>([]);
  
  // Formulaire UE
  const [ueForm, setUeForm] = useState({
    code: '',
    libelle: '',
    credits: 3,
    volume_horaire_cm: 0,
    volume_horaire_td: 0,
    volume_horaire_tp: 0,
    parcours_id: '',
    semestre: 1,
    annee_niveau: 1
  });
  
  // Formulaire Affectation
  const [affectationForm, setAffectationForm] = useState({
    enseignant_id: '',
    unite_enseignement_id: '',
    type_enseignement: 'CM' as 'CM' | 'TD' | 'TP',
    volume_horaire: 0
  });

  useEffect(() => {
    loadData();
  }, [activeTab]);

  const loadData = async () => {
    setLoading(true);
    try {
      if (activeTab === 'ues') {
        const [uesRes, parcoursRes] = await Promise.all([
          api.get('/rh/cours'),
          api.get('/rh/parcours-disponibles')
        ]);
        setUes(uesRes.data || []);
        setParcours(parcoursRes.data || []);
      } else {
        const [affectationsRes, enseignantsRes, parcoursRes] = await Promise.all([
          api.get('/rh/affectations-cours'),
          api.get('/rh/enseignants-disponibles'),
          api.get('/rh/parcours-disponibles')
        ]);
        setAffectations(affectationsRes.data || []);
        setEnseignants(enseignantsRes.data || []);
        setParcours(parcoursRes.data || []);
        
        // Charger aussi les UEs pour le formulaire d'affectation
        const uesRes = await api.get('/rh/cours');
        setUes(uesRes.data || []);
      }
    } catch (error: any) {
      toast.error('Erreur lors du chargement des données');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateUE = async () => {
    try {
      await api.post('/rh/cours', ueForm);
      toast.success('UE créée avec succès');
      setShowUEModal(false);
      resetUEForm();
      loadData();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Erreur lors de la création');
      console.error(error);
    }
  };

  const handleUpdateUE = async () => {
    if (!editingUE) return;
    try {
      await api.patch(`/rh/cours/${editingUE.id}`, ueForm);
      toast.success('UE modifiée avec succès');
      setShowUEModal(false);
      setEditingUE(null);
      resetUEForm();
      loadData();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Erreur lors de la modification');
      console.error(error);
    }
  };

  const handleCreateAffectation = async () => {
    try {
      await api.post('/rh/affectations-cours', affectationForm);
      toast.success('Affectation créée avec succès');
      setShowAffectationModal(false);
      resetAffectationForm();
      loadData();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Erreur lors de l\'affectation');
      console.error(error);
    }
  };

  const handleDeleteAffectation = async (id: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette affectation ?')) return;
    try {
      await api.patch(`/rh/affectations-cours/${id}/supprimer`);
      toast.success('Affectation supprimée');
      loadData();
    } catch (error: any) {
      toast.error('Erreur lors de la suppression');
      console.error(error);
    }
  };

  const resetUEForm = () => {
    setUeForm({
      code: '',
      libelle: '',
      credits: 3,
      volume_horaire_cm: 0,
      volume_horaire_td: 0,
      volume_horaire_tp: 0,
      parcours_id: '',
      semestre: 1,
      annee_niveau: 1
    });
  };

  const resetAffectationForm = () => {
    setAffectationForm({
      enseignant_id: '',
      unite_enseignement_id: '',
      type_enseignement: 'CM',
      volume_horaire: 0
    });
  };

  const openEditUE = (ue: UniteEnseignement) => {
    setEditingUE(ue);
    setUeForm({
      code: ue.code,
      libelle: ue.libelle,
      credits: ue.credits,
      volume_horaire_cm: ue.volume_horaire_cm || 0,
      volume_horaire_td: ue.volume_horaire_td || 0,
      volume_horaire_tp: ue.volume_horaire_tp || 0,
      parcours_id: ue.parcours_id,
      semestre: ue.semestre,
      annee_niveau: ue.annee_niveau
    });
    setShowUEModal(true);
  };

  const filteredUEs = ues.filter(ue =>
    !searchUE ||
    ue.code.toLowerCase().includes(searchUE.toLowerCase()) ||
    ue.libelle.toLowerCase().includes(searchUE.toLowerCase())
  );

  const filteredAffectations = affectations.filter(aff =>
    !searchAffectation ||
    aff.ue_code?.toLowerCase().includes(searchAffectation.toLowerCase()) ||
    aff.ue_libelle?.toLowerCase().includes(searchAffectation.toLowerCase()) ||
    aff.enseignant_nom?.toLowerCase().includes(searchAffectation.toLowerCase())
  );

  if (loading) {
    return (
      <div style={{ padding: 32, textAlign: 'center' }}>
        <div style={{ fontSize: 18, color: '#64748b' }}>Chargement...</div>
      </div>
    );
  }

  return (
    <div style={{ padding: 32 }}>
      {/* Header */}
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontSize: 28, fontWeight: 800, color: '#1e293b', margin: '0 0 8px', display: 'flex', alignItems: 'center', gap: 12 }}>
          <BookOpen size={32} /> Affectation des Cours
        </h1>
        <p style={{ color: '#64748b', fontSize: 14 }}>
          Gestion des unités d'enseignement et affectation aux enseignants
        </p>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 24, borderBottom: '2px solid #e5e7eb' }}>
        <button
          onClick={() => setActiveTab('ues')}
          style={{
            padding: '12px 24px',
            background: activeTab === 'ues' ? '#3b82f6' : 'transparent',
            color: activeTab === 'ues' ? '#fff' : '#64748b',
            border: 'none',
            borderBottom: activeTab === 'ues' ? '3px solid #3b82f6' : 'none',
            cursor: 'pointer',
            fontSize: 14,
            fontWeight: 600,
            borderRadius: '8px 8px 0 0',
            transition: 'all 0.2s'
          }}
        >
          Unités d'Enseignement
        </button>
        <button
          onClick={() => setActiveTab('affectations')}
          style={{
            padding: '12px 24px',
            background: activeTab === 'affectations' ? '#3b82f6' : 'transparent',
            color: activeTab === 'affectations' ? '#fff' : '#64748b',
            border: 'none',
            borderBottom: activeTab === 'affectations' ? '3px solid #3b82f6' : 'none',
            cursor: 'pointer',
            fontSize: 14,
            fontWeight: 600,
            borderRadius: '8px 8px 0 0',
            transition: 'all 0.2s'
          }}
        >
          Affectations Enseignants
        </button>
      </div>

      {/* Tab Content: UEs */}
      {activeTab === 'ues' && (
        <>
          {/* Stats */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, marginBottom: 24 }}>
            <div style={{ background: '#fff', borderRadius: 12, padding: 20, boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
              <div style={{ fontSize: 12, color: '#64748b', marginBottom: 8 }}>Total UEs</div>
              <div style={{ fontSize: 28, fontWeight: 800, color: '#1e293b' }}>{ues.length}</div>
            </div>
            <div style={{ background: '#fff', borderRadius: 12, padding: 20, boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
              <div style={{ fontSize: 12, color: '#64748b', marginBottom: 8 }}>Total Crédits</div>
              <div style={{ fontSize: 28, fontWeight: 800, color: '#3b82f6' }}>
                {ues.reduce((sum, ue) => sum + ue.credits, 0)}
              </div>
            </div>
          </div>

          {/* Filters & Actions */}
          <div style={{ display: 'flex', gap: 12, marginBottom: 24, flexWrap: 'wrap' }}>
            <div style={{ flex: 1, minWidth: 250, position: 'relative' }}>
              <Search size={18} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
              <input
                type="text"
                placeholder="Rechercher par code ou libellé..."
                value={searchUE}
                onChange={(e) => setSearchUE(e.target.value)}
                style={{ width: '100%', padding: '11px 11px 11px 40px', border: '2px solid #e5e7eb', borderRadius: 9, fontSize: 14 }}
              />
            </div>
            <button
              onClick={() => {
                resetUEForm();
                setEditingUE(null);
                setShowUEModal(true);
              }}
              style={{
                padding: '11px 20px',
                background: '#3b82f6',
                color: '#fff',
                border: 'none',
                borderRadius: 9,
                cursor: 'pointer',
                fontSize: 14,
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                gap: 8
              }}
            >
              <Plus size={18} />
              Nouvelle UE
            </button>
          </div>

          {/* Table UEs */}
          <div style={{ background: '#fff', borderRadius: 12, boxShadow: '0 1px 3px rgba(0,0,0,0.1)', overflow: 'hidden' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead style={{ background: '#f8fafc', borderBottom: '2px solid #e5e7eb' }}>
                <tr>
                  <th style={{ padding: '14px 16px', textAlign: 'left', fontSize: 12, fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Code</th>
                  <th style={{ padding: '14px 16px', textAlign: 'left', fontSize: 12, fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Libellé</th>
                  <th style={{ padding: '14px 16px', textAlign: 'center', fontSize: 12, fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Crédits</th>
                  <th style={{ padding: '14px 16px', textAlign: 'center', fontSize: 12, fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>CM</th>
                  <th style={{ padding: '14px 16px', textAlign: 'center', fontSize: 12, fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>TD</th>
                  <th style={{ padding: '14px 16px', textAlign: 'center', fontSize: 12, fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>TP</th>
                  <th style={{ padding: '14px 16px', textAlign: 'center', fontSize: 12, fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Semestre</th>
                  <th style={{ padding: '14px 16px', textAlign: 'center', fontSize: 12, fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredUEs.length === 0 ? (
                  <tr>
                    <td colSpan={8} style={{ padding: 40, textAlign: 'center', color: '#94a3b8' }}>
                      Aucune UE trouvée
                    </td>
                  </tr>
                ) : (
                  filteredUEs.map((ue) => (
                    <tr key={ue.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                      <td style={{ padding: '14px 16px', fontWeight: 600, color: '#1e293b' }}>{ue.code}</td>
                      <td style={{ padding: '14px 16px', color: '#64748b' }}>{ue.libelle}</td>
                      <td style={{ padding: '14px 16px', textAlign: 'center', fontWeight: 600, color: '#3b82f6' }}>{ue.credits}</td>
                      <td style={{ padding: '14px 16px', textAlign: 'center', color: '#64748b' }}>{ue.volume_horaire_cm || 0}h</td>
                      <td style={{ padding: '14px 16px', textAlign: 'center', color: '#64748b' }}>{ue.volume_horaire_td || 0}h</td>
                      <td style={{ padding: '14px 16px', textAlign: 'center', color: '#64748b' }}>{ue.volume_horaire_tp || 0}h</td>
                      <td style={{ padding: '14px 16px', textAlign: 'center' }}>
                        <span style={{ padding: '4px 12px', borderRadius: 20, fontSize: 12, fontWeight: 600, background: '#eff6ff', color: '#3b82f6' }}>
                          S{ue.semestre}
                        </span>
                      </td>
                      <td style={{ padding: '14px 16px', textAlign: 'center' }}>
                        <button
                          onClick={() => openEditUE(ue)}
                          style={{
                            padding: '6px 12px',
                            background: '#f59e0b',
                            color: '#fff',
                            border: 'none',
                            borderRadius: 6,
                            cursor: 'pointer',
                            fontSize: 12,
                            fontWeight: 600,
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 4
                          }}
                        >
                          <Edit size={14} />
                          Modifier
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </>
      )}

      {/* Tab Content: Affectations */}
      {activeTab === 'affectations' && (
        <>
          {/* Stats */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, marginBottom: 24 }}>
            <div style={{ background: '#fff', borderRadius: 12, padding: 20, boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
              <div style={{ fontSize: 12, color: '#64748b', marginBottom: 8 }}>Total Affectations</div>
              <div style={{ fontSize: 28, fontWeight: 800, color: '#1e293b' }}>{affectations.length}</div>
            </div>
            <div style={{ background: '#fff', borderRadius: 12, padding: 20, boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
              <div style={{ fontSize: 12, color: '#64748b', marginBottom: 8 }}>Enseignants Affectés</div>
              <div style={{ fontSize: 28, fontWeight: 800, color: '#10b981' }}>
                {new Set(affectations.map(a => a.enseignant_id)).size}
              </div>
            </div>
          </div>

          {/* Filters & Actions */}
          <div style={{ display: 'flex', gap: 12, marginBottom: 24, flexWrap: 'wrap' }}>
            <div style={{ flex: 1, minWidth: 250, position: 'relative' }}>
              <Search size={18} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
              <input
                type="text"
                placeholder="Rechercher par UE ou enseignant..."
                value={searchAffectation}
                onChange={(e) => setSearchAffectation(e.target.value)}
                style={{ width: '100%', padding: '11px 11px 11px 40px', border: '2px solid #e5e7eb', borderRadius: 9, fontSize: 14 }}
              />
            </div>
            <button
              onClick={() => {
                resetAffectationForm();
                setShowAffectationModal(true);
              }}
              style={{
                padding: '11px 20px',
                background: '#10b981',
                color: '#fff',
                border: 'none',
                borderRadius: 9,
                cursor: 'pointer',
                fontSize: 14,
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                gap: 8
              }}
            >
              <Plus size={18} />
              Nouvelle Affectation
            </button>
          </div>

          {/* Table Affectations */}
          <div style={{ background: '#fff', borderRadius: 12, boxShadow: '0 1px 3px rgba(0,0,0,0.1)', overflow: 'hidden' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead style={{ background: '#f8fafc', borderBottom: '2px solid #e5e7eb' }}>
                <tr>
                  <th style={{ padding: '14px 16px', textAlign: 'left', fontSize: 12, fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Enseignant</th>
                  <th style={{ padding: '14px 16px', textAlign: 'left', fontSize: 12, fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>UE</th>
                  <th style={{ padding: '14px 16px', textAlign: 'center', fontSize: 12, fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Type</th>
                  <th style={{ padding: '14px 16px', textAlign: 'center', fontSize: 12, fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Volume Horaire</th>
                  <th style={{ padding: '14px 16px', textAlign: 'center', fontSize: 12, fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredAffectations.length === 0 ? (
                  <tr>
                    <td colSpan={5} style={{ padding: 40, textAlign: 'center', color: '#94a3b8' }}>
                      Aucune affectation trouvée
                    </td>
                  </tr>
                ) : (
                  filteredAffectations.map((aff) => (
                    <tr key={aff.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                      <td style={{ padding: '14px 16px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <div style={{
                            width: 36,
                            height: 36,
                            borderRadius: '50%',
                            background: 'linear-gradient(135deg, #10b981, #059669)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: '#fff',
                            fontWeight: 700,
                            fontSize: 12
                          }}>
                            {aff.enseignant_prenom?.[0]}{aff.enseignant_nom?.[0]}
                          </div>
                          <div>
                            <div style={{ fontWeight: 600, color: '#1e293b' }}>
                              {aff.enseignant_prenom} {aff.enseignant_nom}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td style={{ padding: '14px 16px' }}>
                        <div style={{ fontWeight: 600, color: '#1e293b' }}>{aff.ue_code}</div>
                        <div style={{ fontSize: 12, color: '#64748b' }}>{aff.ue_libelle}</div>
                      </td>
                      <td style={{ padding: '14px 16px', textAlign: 'center' }}>
                        <span style={{
                          padding: '4px 12px',
                          borderRadius: 20,
                          fontSize: 12,
                          fontWeight: 600,
                          background: aff.type_enseignement === 'CM' ? '#dbeafe' : aff.type_enseignement === 'TD' ? '#fef3c7' : '#dcfce7',
                          color: aff.type_enseignement === 'CM' ? '#1e40af' : aff.type_enseignement === 'TD' ? '#92400e' : '#166534'
                        }}>
                          {aff.type_enseignement}
                        </span>
                      </td>
                      <td style={{ padding: '14px 16px', textAlign: 'center', fontWeight: 600, color: '#64748b' }}>
                        {aff.volume_horaire}h
                      </td>
                      <td style={{ padding: '14px 16px', textAlign: 'center' }}>
                        <button
                          onClick={() => handleDeleteAffectation(aff.id)}
                          style={{
                            padding: '6px 12px',
                            background: '#ef4444',
                            color: '#fff',
                            border: 'none',
                            borderRadius: 6,
                            cursor: 'pointer',
                            fontSize: 12,
                            fontWeight: 600,
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 4
                          }}
                        >
                          <Trash2 size={14} />
                          Supprimer
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </>
      )}

      {/* Modal UE */}
      {showUEModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: 20
        }}>
          <div style={{
            background: '#fff',
            borderRadius: 16,
            maxWidth: 600,
            width: '100%',
            maxHeight: '90vh',
            overflow: 'auto',
            boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)'
          }}>
            <div style={{
              padding: '24px 32px',
              borderBottom: '2px solid #f1f5f9',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}>
              <h2 style={{ fontSize: 20, fontWeight: 800, color: '#1e293b', margin: 0 }}>
                {editingUE ? 'Modifier l\'UE' : 'Nouvelle UE'}
              </h2>
              <button
                onClick={() => {
                  setShowUEModal(false);
                  setEditingUE(null);
                }}
                style={{
                  background: 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  padding: 8,
                  borderRadius: 8,
                  display: 'flex',
                  color: '#64748b'
                }}
              >
                <X size={24} />
              </button>
            </div>

            <div style={{ padding: 32 }}>
              <div style={{ display: 'grid', gap: 16 }}>
                <div>
                  <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#1e293b', marginBottom: 6 }}>
                    Code UE *
                  </label>
                  <input
                    type="text"
                    value={ueForm.code}
                    onChange={(e) => setUeForm({ ...ueForm, code: e.target.value })}
                    style={{ width: '100%', padding: '10px 12px', border: '2px solid #e5e7eb', borderRadius: 8, fontSize: 14 }}
                    placeholder="Ex: INF101"
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#1e293b', marginBottom: 6 }}>
                    Libellé *
                  </label>
                  <input
                    type="text"
                    value={ueForm.libelle}
                    onChange={(e) => setUeForm({ ...ueForm, libelle: e.target.value })}
                    style={{ width: '100%', padding: '10px 12px', border: '2px solid #e5e7eb', borderRadius: 8, fontSize: 14 }}
                    placeholder="Ex: Programmation Orientée Objet"
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                  <div>
                    <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#1e293b', marginBottom: 6 }}>
                      Crédits *
                    </label>
                    <input
                      type="number"
                      value={ueForm.credits}
                      onChange={(e) => setUeForm({ ...ueForm, credits: parseInt(e.target.value) || 0 })}
                      style={{ width: '100%', padding: '10px 12px', border: '2px solid #e5e7eb', borderRadius: 8, fontSize: 14 }}
                      min="1"
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#1e293b', marginBottom: 6 }}>
                      Parcours *
                    </label>
                    <select
                      value={ueForm.parcours_id}
                      onChange={(e) => setUeForm({ ...ueForm, parcours_id: e.target.value })}
                      style={{ width: '100%', padding: '10px 12px', border: '2px solid #e5e7eb', borderRadius: 8, fontSize: 14 }}
                    >
                      <option value="">Sélectionner...</option>
                      {parcours.map(p => (
                        <option key={p.id} value={p.id}>{p.nom}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16 }}>
                  <div>
                    <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#1e293b', marginBottom: 6 }}>
                      CM (heures)
                    </label>
                    <input
                      type="number"
                      value={ueForm.volume_horaire_cm}
                      onChange={(e) => setUeForm({ ...ueForm, volume_horaire_cm: parseInt(e.target.value) || 0 })}
                      style={{ width: '100%', padding: '10px 12px', border: '2px solid #e5e7eb', borderRadius: 8, fontSize: 14 }}
                      min="0"
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#1e293b', marginBottom: 6 }}>
                      TD (heures)
                    </label>
                    <input
                      type="number"
                      value={ueForm.volume_horaire_td}
                      onChange={(e) => setUeForm({ ...ueForm, volume_horaire_td: parseInt(e.target.value) || 0 })}
                      style={{ width: '100%', padding: '10px 12px', border: '2px solid #e5e7eb', borderRadius: 8, fontSize: 14 }}
                      min="0"
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#1e293b', marginBottom: 6 }}>
                      TP (heures)
                    </label>
                    <input
                      type="number"
                      value={ueForm.volume_horaire_tp}
                      onChange={(e) => setUeForm({ ...ueForm, volume_horaire_tp: parseInt(e.target.value) || 0 })}
                      style={{ width: '100%', padding: '10px 12px', border: '2px solid #e5e7eb', borderRadius: 8, fontSize: 14 }}
                      min="0"
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                  <div>
                    <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#1e293b', marginBottom: 6 }}>
                      Semestre *
                    </label>
                    <select
                      value={ueForm.semestre}
                      onChange={(e) => setUeForm({ ...ueForm, semestre: parseInt(e.target.value) })}
                      style={{ width: '100%', padding: '10px 12px', border: '2px solid #e5e7eb', borderRadius: 8, fontSize: 14 }}
                    >
                      {[1, 2, 3, 4, 5, 6].map(s => (
                        <option key={s} value={s}>Semestre {s}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#1e293b', marginBottom: 6 }}>
                      Année Niveau *
                    </label>
                    <select
                      value={ueForm.annee_niveau}
                      onChange={(e) => setUeForm({ ...ueForm, annee_niveau: parseInt(e.target.value) })}
                      style={{ width: '100%', padding: '10px 12px', border: '2px solid #e5e7eb', borderRadius: 8, fontSize: 14 }}
                    >
                      {[1, 2, 3, 4, 5].map(a => (
                        <option key={a} value={a}>Année {a}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', gap: 12, marginTop: 24 }}>
                <button
                  onClick={() => {
                    setShowUEModal(false);
                    setEditingUE(null);
                  }}
                  style={{
                    flex: 1,
                    padding: '12px',
                    background: '#f1f5f9',
                    color: '#64748b',
                    border: 'none',
                    borderRadius: 8,
                    cursor: 'pointer',
                    fontSize: 14,
                    fontWeight: 600
                  }}
                >
                  Annuler
                </button>
                <button
                  onClick={editingUE ? handleUpdateUE : handleCreateUE}
                  style={{
                    flex: 1,
                    padding: '12px',
                    background: '#3b82f6',
                    color: '#fff',
                    border: 'none',
                    borderRadius: 8,
                    cursor: 'pointer',
                    fontSize: 14,
                    fontWeight: 600,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 8
                  }}
                >
                  <Save size={18} />
                  {editingUE ? 'Modifier' : 'Créer'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal Affectation */}
      {showAffectationModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: 20
        }}>
          <div style={{
            background: '#fff',
            borderRadius: 16,
            maxWidth: 500,
            width: '100%',
            boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)'
          }}>
            <div style={{
              padding: '24px 32px',
              borderBottom: '2px solid #f1f5f9',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}>
              <h2 style={{ fontSize: 20, fontWeight: 800, color: '#1e293b', margin: 0 }}>
                Nouvelle Affectation
              </h2>
              <button
                onClick={() => setShowAffectationModal(false)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  padding: 8,
                  borderRadius: 8,
                  display: 'flex',
                  color: '#64748b'
                }}
              >
                <X size={24} />
              </button>
            </div>

            <div style={{ padding: 32 }}>
              <div style={{ display: 'grid', gap: 16 }}>
                <div>
                  <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#1e293b', marginBottom: 6 }}>
                    Enseignant *
                  </label>
                  <select
                    value={affectationForm.enseignant_id}
                    onChange={(e) => setAffectationForm({ ...affectationForm, enseignant_id: e.target.value })}
                    style={{ width: '100%', padding: '10px 12px', border: '2px solid #e5e7eb', borderRadius: 8, fontSize: 14 }}
                  >
                    <option value="">Sélectionner un enseignant...</option>
                    {enseignants.map(ens => (
                      <option key={ens.id} value={ens.id}>
                        {ens.prenom} {ens.nom} ({ens.email})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#1e293b', marginBottom: 6 }}>
                    Unité d'Enseignement *
                  </label>
                  <select
                    value={affectationForm.unite_enseignement_id}
                    onChange={(e) => setAffectationForm({ ...affectationForm, unite_enseignement_id: e.target.value })}
                    style={{ width: '100%', padding: '10px 12px', border: '2px solid #e5e7eb', borderRadius: 8, fontSize: 14 }}
                  >
                    <option value="">Sélectionner une UE...</option>
                    {ues.map(ue => (
                      <option key={ue.id} value={ue.id}>
                        {ue.code} - {ue.libelle}
                      </option>
                    ))}
                  </select>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                  <div>
                    <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#1e293b', marginBottom: 6 }}>
                      Type *
                    </label>
                    <select
                      value={affectationForm.type_enseignement}
                      onChange={(e) => setAffectationForm({ ...affectationForm, type_enseignement: e.target.value as 'CM' | 'TD' | 'TP' })}
                      style={{ width: '100%', padding: '10px 12px', border: '2px solid #e5e7eb', borderRadius: 8, fontSize: 14 }}
                    >
                      <option value="CM">CM</option>
                      <option value="TD">TD</option>
                      <option value="TP">TP</option>
                    </select>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#1e293b', marginBottom: 6 }}>
                      Volume Horaire *
                    </label>
                    <input
                      type="number"
                      value={affectationForm.volume_horaire}
                      onChange={(e) => setAffectationForm({ ...affectationForm, volume_horaire: parseInt(e.target.value) || 0 })}
                      style={{ width: '100%', padding: '10px 12px', border: '2px solid #e5e7eb', borderRadius: 8, fontSize: 14 }}
                      min="1"
                      placeholder="Heures"
                    />
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', gap: 12, marginTop: 24 }}>
                <button
                  onClick={() => setShowAffectationModal(false)}
                  style={{
                    flex: 1,
                    padding: '12px',
                    background: '#f1f5f9',
                    color: '#64748b',
                    border: 'none',
                    borderRadius: 8,
                    cursor: 'pointer',
                    fontSize: 14,
                    fontWeight: 600
                  }}
                >
                  Annuler
                </button>
                <button
                  onClick={handleCreateAffectation}
                  style={{
                    flex: 1,
                    padding: '12px',
                    background: '#10b981',
                    color: '#fff',
                    border: 'none',
                    borderRadius: 8,
                    cursor: 'pointer',
                    fontSize: 14,
                    fontWeight: 600,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 8
                  }}
                >
                  <Save size={18} />
                  Affecter
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AffectationCoursPage;

// Made with Bob