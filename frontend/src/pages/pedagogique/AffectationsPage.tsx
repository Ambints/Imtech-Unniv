import React, { useState, useEffect } from 'react';
import { api } from '../../api/client';
import { useAuthStore } from '../../store/authStore';
import toast from 'react-hot-toast';
import {
  UserCog, Plus, Edit2, Save, X, Search, Trash2, Calendar,
  BookOpen, Users, Clock, CheckCircle, AlertCircle
} from 'lucide-react';

interface Affectation {
  id: string;
  enseignantId: string;
  ueId?: string;
  ecId?: string;
  anneeAcademiqueId: string;
  typeSeance: string;
  volumePrevu: number;
  volumeRealise: number;
  enseignant?: {
    id: string;
    nom: string;
    prenom: string;
    grade?: string;
  };
  uniteEnseignement?: {
    id: string;
    code: string;
    intitule: string;
    parcours?: {
      id: string;
      code: string;
      nom: string;
    };
  };
  elementConstitutif?: {
    id: string;
    code: string;
    intitule: string;
  };
  anneeAcademique?: {
    id: string;
    libelle: string;
  };
}

interface Enseignant {
  id: string;
  nom: string;
  prenom: string;
  grade?: string;
  matricule?: string;
}

interface UniteEnseignement {
  id: string;
  code: string;
  intitule: string;
  parcoursId: string;
  parcours?: {
    id: string;
    code: string;
    nom: string;
  };
}

interface AnneeAcademique {
  id: string;
  libelle: string;
  active?: boolean;
}

interface Parcours {
  id: string;
  code: string;
  nom: string;
  unites?: UniteEnseignement[];
}

export const AffectationsPage: React.FC = () => {
  const { user, tenant } = useAuthStore();
  const tid = tenant?.id || '';
  
  const [loading, setLoading] = useState(true);
  const [affectations, setAffectations] = useState<Affectation[]>([]);
  const [enseignants, setEnseignants] = useState<Enseignant[]>([]);
  const [parcours, setParcours] = useState<Parcours[]>([]);
  const [anneesAcademiques, setAnneesAcademiques] = useState<AnneeAcademique[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  const [selectedParcours, setSelectedParcours] = useState<string>('');
  const [selectedAnnee, setSelectedAnnee] = useState<string>('');
  
  const [formData, setFormData] = useState({
    enseignantId: '',
    ueId: '',
    anneeAcademiqueId: '',
    typeSeance: 'CM',
    volumePrevu: 30
  });

  useEffect(() => {
    if (tid) {
      loadInitialData();
    }
  }, [tid]);

  useEffect(() => {
    if (selectedParcours && selectedAnnee) {
      loadAffectations();
    }
  }, [selectedParcours, selectedAnnee]);

  const loadInitialData = async () => {
    setLoading(true);
    try {
      const [parcoursResponse, enseignantsResponse, anneesResponse] = await Promise.all([
        api.get(`/rp-enhanced/${tid}/mes-parcours`),
        api.get(`/academic/${tid}/enseignants`),
        api.get(`/academic/${tid}/annees`)
      ]);
      
      setParcours(parcoursResponse.data || []);
      setEnseignants(enseignantsResponse.data || []);
      setAnneesAcademiques(anneesResponse.data || []);
      
      if (parcoursResponse.data?.length > 0) {
        setSelectedParcours(parcoursResponse.data[0].id);
      }
      if (anneesResponse.data?.length > 0) {
        const active = anneesResponse.data.find((a: AnneeAcademique) => a.active);
        setSelectedAnnee(active?.id || anneesResponse.data[0].id);
      }
    } catch (err: any) {
      toast.error('Erreur lors du chargement des données');
    } finally {
      setLoading(false);
    }
  };

  const loadAffectations = async () => {
    if (!selectedParcours || !selectedAnnee) return;
    setLoading(true);
    try {
      const response = await api.get(
        `/rp-enhanced/${tid}/parcours/${selectedParcours}/affectations?anneeAcademiqueId=${selectedAnnee}`
      );
      setAffectations(response.data || []);
    } catch (err: any) {
      toast.error('Erreur lors du chargement des affectations');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const data = {
        ...formData,
        anneeAcademiqueId: selectedAnnee
      };
      
      if (editingId) {
        await api.patch(`/rp-enhanced/${tid}/affectations/${editingId}`, data);
        toast.success('Affectation mise à jour');
      } else {
        await api.post(`/rp-enhanced/${tid}/affectations`, data);
        toast.success('Affectation créée avec succès');
      }
      
      setShowForm(false);
      setEditingId(null);
      resetForm();
      loadAffectations();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Erreur lors de l\'enregistrement');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette affectation ?')) return;
    
    try {
      await api.delete(`/rp-enhanced/${tid}/affectations/${id}`);
      toast.success('Affectation supprimée');
      loadAffectations();
    } catch (err: any) {
      toast.error('Erreur lors de la suppression');
    }
  };

  const handleEdit = (affectation: Affectation) => {
    setFormData({
      enseignantId: affectation.enseignantId,
      ueId: affectation.ueId || '',
      anneeAcademiqueId: affectation.anneeAcademiqueId,
      typeSeance: affectation.typeSeance,
      volumePrevu: affectation.volumePrevu
    });
    setEditingId(affectation.id);
    setShowForm(true);
  };

  const resetForm = () => {
    setFormData({
      enseignantId: '',
      ueId: '',
      anneeAcademiqueId: selectedAnnee,
      typeSeance: 'CM',
      volumePrevu: 30
    });
  };

  const getParcoursUEs = () => {
    const p = parcours.find(p => p.id === selectedParcours);
    return p?.unites || [];
  };

  const calculateStats = () => {
    const totalHeures = affectations.reduce((acc, a) => acc + (a.volumePrevu || 0), 0);
    const byType = {
      CM: affectations.filter(a => a.typeSeance === 'CM').reduce((acc, a) => acc + a.volumePrevu, 0),
      TD: affectations.filter(a => a.typeSeance === 'TD').reduce((acc, a) => acc + a.volumePrevu, 0),
      TP: affectations.filter(a => a.typeSeance === 'TP').reduce((acc, a) => acc + a.volumePrevu, 0)
    };
    const uniqueEnseignants = new Set(affectations.map(a => a.enseignantId)).size;
    return { totalHeures, byType, uniqueEnseignants };
  };

  const stats = calculateStats();

  return (
    <div style={{ padding: 32 }}>
      {/* Header */}
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontSize: 28, fontWeight: 800, color: '#1e293b', margin: '0 0 8px', display: 'flex', alignItems: 'center', gap: 12 }}>
          <UserCog size={32} /> Affectations des Enseignants
        </h1>
        <p style={{ color: '#64748b', fontSize: 14 }}>
          Gestion des affectations enseignants aux UE et EC
        </p>
      </div>

      {/* Filtres */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 24 }}>
        <div>
          <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 6 }}>
            Parcours
          </label>
          <select
            value={selectedParcours}
            onChange={(e) => setSelectedParcours(e.target.value)}
            style={{ width: '100%', padding: '11px 14px', border: '2px solid #e5e7eb', borderRadius: 9, fontSize: 14 }}
          >
            {parcours.map(p => (
              <option key={p.id} value={p.id}>{p.code} - {p.nom}</option>
            ))}
          </select>
        </div>
        <div>
          <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 6 }}>
            Année Académique
          </label>
          <select
            value={selectedAnnee}
            onChange={(e) => setSelectedAnnee(e.target.value)}
            style={{ width: '100%', padding: '11px 14px', border: '2px solid #e5e7eb', borderRadius: 9, fontSize: 14 }}
          >
            {anneesAcademiques.map(a => (
              <option key={a.id} value={a.id}>{a.libelle} {a.active && '(Active)'}</option>
            ))}
          </select>
        </div>
        <div style={{ display: 'flex', alignItems: 'flex-end' }}>
          <button
            onClick={() => { setShowForm(true); setEditingId(null); resetForm(); }}
            style={{
              width: '100%',
              padding: '11px 20px',
              background: 'linear-gradient(135deg, #148f77, #1a5276)',
              color: '#fff',
              border: 'none',
              borderRadius: 9,
              fontSize: 14,
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8
            }}
          >
            <Plus size={18} /> Nouvelle Affectation
          </button>
        </div>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 24 }}>
        <div style={{ background: '#fff', borderRadius: 12, padding: 16, boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
            <Users size={16} color="#64748b" />
            <span style={{ fontSize: 12, color: '#64748b' }}>Affectations</span>
          </div>
          <div style={{ fontSize: 24, fontWeight: 800, color: '#1e293b' }}>{affectations.length}</div>
        </div>
        <div style={{ background: '#fff', borderRadius: 12, padding: 16, boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
            <Users size={16} color="#64748b" />
            <span style={{ fontSize: 12, color: '#64748b' }}>Enseignants</span>
          </div>
          <div style={{ fontSize: 24, fontWeight: 800, color: '#1e293b' }}>{stats.uniqueEnseignants}</div>
        </div>
        <div style={{ background: '#fff', borderRadius: 12, padding: 16, boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
            <Clock size={16} color="#64748b" />
            <span style={{ fontSize: 12, color: '#64748b' }}>Heures Totales</span>
          </div>
          <div style={{ fontSize: 24, fontWeight: 800, color: '#1e293b' }}>{stats.totalHeures}h</div>
        </div>
        <div style={{ background: '#fff', borderRadius: 12, padding: 16, boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
          <div style={{ fontSize: 12, color: '#64748b', marginBottom: 4 }}>Répartition</div>
          <div style={{ fontSize: 14, color: '#1e293b' }}>
            CM: {stats.byType.CM}h | TD: {stats.byType.TD}h | TP: {stats.byType.TP}h
          </div>
        </div>
      </div>

      {/* Formulaire */}
      {showForm && (
        <div style={{ background: '#fff', borderRadius: 14, padding: 24, marginBottom: 24, boxShadow: '0 2px 10px rgba(0,0,0,0.07)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
            <h3 style={{ fontSize: 18, fontWeight: 700, color: '#0f172a', margin: 0 }}>
              {editingId ? 'Modifier l\'affectation' : 'Nouvelle affectation'}
            </h3>
            <button onClick={() => setShowForm(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
              <X size={24} color="#64748b" />
            </button>
          </div>
          <form onSubmit={handleSubmit}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 16 }}>
              <div>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 6 }}>
                  Enseignant *
                </label>
                <select
                  required
                  value={formData.enseignantId}
                  onChange={(e) => setFormData(prev => ({ ...prev, enseignantId: e.target.value }))}
                  style={{ width: '100%', padding: '11px 14px', border: '2px solid #e5e7eb', borderRadius: 9, fontSize: 14 }}
                >
                  <option value="">Sélectionner un enseignant</option>
                  {enseignants.map(ens => (
                    <option key={ens.id} value={ens.id}>
                      {ens.prenom} {ens.nom} {ens.grade && `(${ens.grade})`}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 6 }}>
                  Unité d'Enseignement *
                </label>
                <select
                  required
                  value={formData.ueId}
                  onChange={(e) => setFormData(prev => ({ ...prev, ueId: e.target.value }))}
                  style={{ width: '100%', padding: '11px 14px', border: '2px solid #e5e7eb', borderRadius: 9, fontSize: 14 }}
                >
                  <option value="">Sélectionner une UE</option>
                  {getParcoursUEs().map(ue => (
                    <option key={ue.id} value={ue.id}>
                      {ue.code} - {ue.intitule}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 6 }}>
                  Type de séance *
                </label>
                <select
                  required
                  value={formData.typeSeance}
                  onChange={(e) => setFormData(prev => ({ ...prev, typeSeance: e.target.value }))}
                  style={{ width: '100%', padding: '11px 14px', border: '2px solid #e5e7eb', borderRadius: 9, fontSize: 14 }}
                >
                  <option value="CM">Cours Magistral (CM)</option>
                  <option value="TD">Travaux Dirigés (TD)</option>
                  <option value="TP">Travaux Pratiques (TP)</option>
                </select>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 6 }}>
                  Volume horaire prévu (heures) *
                </label>
                <input
                  type="number"
                  required
                  min={1}
                  value={formData.volumePrevu}
                  onChange={(e) => setFormData(prev => ({ ...prev, volumePrevu: parseInt(e.target.value) }))}
                  style={{ width: '100%', padding: '11px 14px', border: '2px solid #e5e7eb', borderRadius: 9, fontSize: 14 }}
                />
              </div>
            </div>
            <div style={{ display: 'flex', gap: 12, marginTop: 24 }}>
              <button
                type="submit"
                disabled={loading}
                style={{
                  flex: 1,
                  padding: '13px',
                  background: loading ? '#94a3b8' : 'linear-gradient(135deg, #148f77, #1a5276)',
                  color: '#fff',
                  border: 'none',
                  borderRadius: 10,
                  fontSize: 14,
                  fontWeight: 700,
                  cursor: loading ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 8
                }}
              >
                <Save size={18} /> {loading ? 'Enregistrement...' : (editingId ? 'Mettre à jour' : 'Créer')}
              </button>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                style={{
                  padding: '13px 24px',
                  background: '#fff',
                  color: '#64748b',
                  border: '2px solid #e5e7eb',
                  borderRadius: 10,
                  fontSize: 14,
                  fontWeight: 700,
                  cursor: 'pointer'
                }}
              >
                Annuler
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Liste des affectations */}
      <div style={{ background: '#fff', borderRadius: 14, overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: '#f8fafc' }}>
              <th style={{ padding: '14px 16px', textAlign: 'left', fontSize: 13, fontWeight: 600, color: '#64748b', borderBottom: '1px solid #e5e7eb' }}>Enseignant</th>
              <th style={{ padding: '14px 16px', textAlign: 'left', fontSize: 13, fontWeight: 600, color: '#64748b', borderBottom: '1px solid #e5e7eb' }}>UE / EC</th>
              <th style={{ padding: '14px 16px', textAlign: 'center', fontSize: 13, fontWeight: 600, color: '#64748b', borderBottom: '1px solid #e5e7eb' }}>Type</th>
              <th style={{ padding: '14px 16px', textAlign: 'center', fontSize: 13, fontWeight: 600, color: '#64748b', borderBottom: '1px solid #e5e7eb' }}>Volume</th>
              <th style={{ padding: '14px 16px', textAlign: 'center', fontSize: 13, fontWeight: 600, color: '#64748b', borderBottom: '1px solid #e5e7eb' }}>Réalisé</th>
              <th style={{ padding: '14px 16px', textAlign: 'right', fontSize: 13, fontWeight: 600, color: '#64748b', borderBottom: '1px solid #e5e7eb' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {affectations.length === 0 ? (
              <tr>
                <td colSpan={6} style={{ padding: 40, textAlign: 'center' }}>
                  <UserCog size={48} color="#cbd5e1" style={{ margin: '0 auto 16px' }} />
                  <p style={{ color: '#64748b' }}>Aucune affectation trouvée</p>
                  <p style={{ color: '#94a3b8', fontSize: 14 }}>Créez votre première affectation enseignant</p>
                </td>
              </tr>
            ) : (
              affectations.map((affectation) => (
                <tr key={affectation.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                  <td style={{ padding: '14px 16px' }}>
                    <div style={{ fontWeight: 600, color: '#0f172a' }}>
                      {affectation.enseignant?.prenom} {affectation.enseignant?.nom}
                    </div>
                    <div style={{ fontSize: 12, color: '#64748b' }}>
                      {affectation.enseignant?.grade}
                    </div>
                  </td>
                  <td style={{ padding: '14px 16px' }}>
                    <div style={{ fontWeight: 600, color: '#0f172a' }}>
                      {affectation.uniteEnseignement?.code || affectation.elementConstitutif?.code}
                    </div>
                    <div style={{ fontSize: 12, color: '#64748b' }}>
                      {affectation.uniteEnseignement?.intitule || affectation.elementConstitutif?.intitule}
                    </div>
                  </td>
                  <td style={{ padding: '14px 16px', textAlign: 'center' }}>
                    <span style={{
                      padding: '4px 10px',
                      borderRadius: 12,
                      fontSize: 11,
                      fontWeight: 600,
                      background: affectation.typeSeance === 'CM' ? '#dbeafe' : affectation.typeSeance === 'TD' ? '#fce7f3' : '#d1fae5',
                      color: affectation.typeSeance === 'CM' ? '#1e40af' : affectation.typeSeance === 'TD' ? '#be185d' : '#065f46'
                    }}>
                      {affectation.typeSeance}
                    </span>
                  </td>
                  <td style={{ padding: '14px 16px', textAlign: 'center', fontWeight: 600, color: '#0f172a' }}>
                    {affectation.volumePrevu}h
                  </td>
                  <td style={{ padding: '14px 16px', textAlign: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4 }}>
                      <div style={{
                        width: 60,
                        height: 6,
                        background: '#e5e7eb',
                        borderRadius: 3,
                        overflow: 'hidden'
                      }}>
                        <div style={{
                          width: `${Math.min((affectation.volumeRealise / affectation.volumePrevu) * 100, 100)}%`,
                          height: '100%',
                          background: affectation.volumeRealise >= affectation.volumePrevu ? '#10b981' : '#3b82f6',
                          borderRadius: 3
                        }} />
                      </div>
                      <span style={{ fontSize: 12, color: '#64748b' }}>
                        {affectation.volumeRealise || 0}h
                      </span>
                    </div>
                  </td>
                  <td style={{ padding: '14px 16px', textAlign: 'right' }}>
                    <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                      <button
                        onClick={() => handleEdit(affectation)}
                        style={{
                          padding: '8px',
                          background: '#f1f5f9',
                          color: '#64748b',
                          border: 'none',
                          borderRadius: 6,
                          cursor: 'pointer'
                        }}
                      >
                        <Edit2 size={16} />
                      </button>
                      <button
                        onClick={() => handleDelete(affectation.id)}
                        style={{
                          padding: '8px',
                          background: '#fef2f2',
                          color: '#dc2626',
                          border: 'none',
                          borderRadius: 6,
                          cursor: 'pointer'
                        }}
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AffectationsPage;
