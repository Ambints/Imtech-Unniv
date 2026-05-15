import React, { useState, useEffect } from 'react';
import { api } from '../../api/client';
import { useAuthStore } from '../../store/authStore';
import toast from 'react-hot-toast';
import {
  BookText, Plus, Edit2, Save, X, Search, CheckCircle, AlertTriangle,
  Target, FileText, Eye, Archive
} from 'lucide-react';

interface Referentiel {
  id: string;
  parcoursId: string;
  code: string;
  intitule: string;
  description?: string;
  niveau: string;
  competences: any[];
  statut: string;
  validePar?: string;
  dateValidation?: Date;
  createdAt: Date;
}

interface Parcours {
  id: string;
  code: string;
  nom: string;
  niveau: string;
}

export const ReferentielsPage: React.FC = () => {
  const { user, tenant, isHydrated } = useAuthStore();

  // Récupérer le tenant ID depuis le store ou localStorage
  const getTenantId = (): string => {
    // 1. Essayer le store Zustand
    if (tenant?.id) return tenant.id;

    // 2. Fallback: localStorage
    try {
      const stored = localStorage.getItem('imtech-auth-v1');
      if (stored) {
        const parsed = JSON.parse(stored);
        const tid = parsed?.state?.tenant?.id;
        if (tid) return tid;
      }
    } catch (e) {
      console.error('Erreur lecture localStorage:', e);
    }

    // 3. Dernier recours: user.tenantId
    if (user && 'tenantId' in user && user.tenantId) {
      return user.tenantId as string;
    }

    return '';
  };

  const tid = getTenantId();
  
  const [loading, setLoading] = useState(true);
  const [referentiels, setReferentiels] = useState<Referentiel[]>([]);
  const [parcours, setParcours] = useState<Parcours[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [selectedParcours, setSelectedParcours] = useState<string>('');
  
  const [formData, setFormData] = useState({
    parcoursId: '',
    code: '',
    intitule: '',
    description: '',
    niveau: 'Licence',
    competences: [] as string[]
  });
  const [newCompetence, setNewCompetence] = useState('');

  useEffect(() => {
    console.log('[ReferentielsPage] useEffect triggered, tid:', tid, 'tenant:', tenant);
    if (tid) {
      console.log('[ReferentielsPage] tid is valid, calling loadData');
      loadData();
    } else {
      console.error('[ReferentielsPage] tid is empty or undefined!');
    }
  }, [tid]);

  const loadData = async () => {
    setLoading(true);
    console.log('[ReferentielsPage] Starting loadData with tid:', tid);
    try {
      // Add timeout to prevent infinite loading
      const timeout = new Promise((_, reject) =>
        setTimeout(() => {
          console.error('[ReferentielsPage] Timeout after 10 seconds');
          reject(new Error('Timeout'));
        }, 10000)
      );
      
      console.log('[ReferentielsPage] Fetching referentiels...');
      const refPromise = api.get(`/pedagogique/${tid}/referentiels`).catch(err => {
        console.error('[ReferentielsPage] Error fetching referentiels:', err.response?.data || err.message);
        return { data: [] };
      });
      
      console.log('[ReferentielsPage] Fetching mes-parcours...');
      const parcoursPromise = api.get(`/rp-enhanced/mes-parcours`).catch(err => {
        console.error('[ReferentielsPage] Error fetching mes-parcours:', err.response?.data || err.message);
        return { data: [] };
      });
      
      const dataPromise = Promise.all([refPromise, parcoursPromise]);
      
      const [refResponse, parcoursResponse] = await Promise.race([dataPromise, timeout]) as any;
      
      console.log('[ReferentielsPage] Referentiels received:', refResponse.data?.length || 0);
      console.log('[ReferentielsPage] Parcours received:', parcoursResponse.data?.length || 0);
      
      setReferentiels(refResponse.data || []);
      setParcours(parcoursResponse.data || []);
      
      // If no data, show info message
      if ((!refResponse.data || refResponse.data.length === 0) &&
          (!parcoursResponse.data || parcoursResponse.data.length === 0)) {
        toast('Aucune donnée disponible. Vous devez être assigné comme responsable d\'un parcours.', {
          icon: 'ℹ️',
          duration: 5000
        });
      }
    } catch (err: any) {
      console.error('Erreur chargement referentiels:', err);
      const errorMsg = err.message === 'Timeout'
        ? 'Le chargement a pris trop de temps. Vérifiez votre connexion.'
        : err.response?.data?.message || 'Erreur de chargement';
      toast.error(errorMsg);
      // Fallback data pour démo
      setReferentiels([
        {
          id: 'ref1',
          parcoursId: 'p1',
          code: 'REF-INFO-L3',
          intitule: 'Référentiel Informatique L3',
          description: 'Compétences en développement et gestion de projets IT',
          niveau: 'Licence',
          dateValidation: new Date(),
          createdAt: new Date(),
          statut: 'valide',
          competences: [
            { id: 'c1', code: 'C1', intitule: 'Développement d\'applications web', niveau: 'avancé', domaine: 'Dev' },
            { id: 'c2', code: 'C2', intitule: 'Gestion de bases de données', niveau: 'avancé', domaine: 'Data' },
            { id: 'c3', code: 'C3', intitule: 'Conception UML', niveau: 'intermédiaire', domaine: 'Design' }
          ]
        },
        {
          id: 'ref2',
          parcoursId: 'p2',
          code: 'REF-MG-L3',
          intitule: 'Référentiel Management L3',
          description: 'Compétences en gestion et leadership',
          niveau: 'Licence',
          createdAt: new Date(),
          statut: 'brouillon',
          competences: [
            { id: 'c4', code: 'C1', intitule: 'Gestion d\'équipe', niveau: 'intermédiaire', domaine: 'RH' },
            { id: 'c5', code: 'C2', intitule: 'Stratégie d\'entreprise', niveau: 'avancé', domaine: 'Strat' }
          ]
        }
      ]);
      setParcours([
        { id: 'p1', code: 'INFO-L3', nom: 'Licence Informatique L3', niveau: 'Licence' },
        { id: 'p2', code: 'MG-L3', nom: 'Licence Management L3', niveau: 'Licence' }
      ]);
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
        competences: formData.competences.map(c => ({ intitule: c, niveau: 'acquis' }))
      };
      
      if (editingId) {
        await api.patch(`/pedagogique/${tid}/referentiels/${editingId}`, data);
        toast.success('Référentiel mis à jour');
      } else {
        await api.post(`/pedagogique/${tid}/referentiels`, data);
        toast.success('Référentiel créé avec succès');
      }
      
      setShowForm(false);
      setEditingId(null);
      resetForm();
      loadData();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Erreur lors de l\'enregistrement');
    } finally {
      setLoading(false);
    }
  };

  const handleValidate = async (id: string) => {
    try {
      await api.post(`/pedagogique/${tid}/referentiels/${id}/valider`, {
        validePar: user?.id
      });
      toast.success('Référentiel validé');
      loadData();
    } catch (err: any) {
      toast.error('Erreur lors de la validation');
    }
  };

  const handleEdit = (ref: Referentiel) => {
    setFormData({
      parcoursId: ref.parcoursId,
      code: ref.code,
      intitule: ref.intitule,
      description: ref.description || '',
      niveau: ref.niveau,
      competences: ref.competences?.map((c: any) => c.intitule) || []
    });
    setEditingId(ref.id);
    setShowForm(true);
  };

  const resetForm = () => {
    setFormData({
      parcoursId: '',
      code: '',
      intitule: '',
      description: '',
      niveau: 'Licence',
      competences: []
    });
    setNewCompetence('');
  };

  const addCompetence = () => {
    if (newCompetence.trim()) {
      setFormData(prev => ({
        ...prev,
        competences: [...prev.competences, newCompetence.trim()]
      }));
      setNewCompetence('');
    }
  };

  const removeCompetence = (index: number) => {
    setFormData(prev => ({
      ...prev,
      competences: prev.competences.filter((_, i) => i !== index)
    }));
  };

  const filteredReferentiels = selectedParcours
    ? referentiels.filter(r => r.parcoursId === selectedParcours)
    : referentiels;

  const getParcoursName = (id: string) => {
    const p = parcours.find(p => p.id === id);
    return p ? `${p.code} - ${p.nom}` : 'Parcours inconnu';
  };

  const getStatutBadge = (statut: string) => {
    const styles: Record<string, { bg: string; color: string; label: string }> = {
      brouillon: { bg: '#fef3c7', color: '#92400e', label: 'Brouillon' },
      valide: { bg: '#d1fae5', color: '#065f46', label: 'Validé' },
      archive: { bg: '#f3f4f6', color: '#6b7280', label: 'Archivé' }
    };
    const style = styles[statut] || styles.brouillon;
    return (
      <span style={{
        padding: '4px 12px',
        borderRadius: 20,
        fontSize: 12,
        fontWeight: 600,
        background: style.bg,
        color: style.color
      }}>
        {style.label}
      </span>
    );
  };

  if (loading && referentiels.length === 0) {
    return (
      <div style={{ padding: 40, textAlign: 'center' }}>
        <div style={{
          width: 50, height: 50,
          border: '4px solid #f3f3f3',
          borderTop: '4px solid #1a5276',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite',
          margin: '0 auto 20px'
        }} />
        <p style={{ color: '#64748b' }}>Chargement des référentiels...</p>
      </div>
    );
  }

  return (
    <div style={{ padding: 32 }}>
      {/* Header */}
      <div style={{ marginBottom: 32, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: 28, fontWeight: 800, color: '#1e293b', margin: '0 0 8px', display: 'flex', alignItems: 'center', gap: 12 }}>
            <BookText size={32} /> Référentiels de Compétences
          </h1>
          <p style={{ color: '#64748b', fontSize: 14 }}>
            Gestion des référentiels et compétences par parcours
          </p>
        </div>
        <button
          onClick={() => { setShowForm(true); setEditingId(null); resetForm(); }}
          style={{
            padding: '12px 24px',
            background: 'linear-gradient(135deg, #148f77, #1a5276)',
            color: '#fff',
            border: 'none',
            borderRadius: 10,
            fontSize: 14,
            fontWeight: 700,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: 8
          }}
        >
          <Plus size={18} /> Nouveau Référentiel
        </button>
      </div>

      {/* Filtres */}
      <div style={{ marginBottom: 24, display: 'flex', gap: 16, alignItems: 'center' }}>
        <div style={{ flex: 1, maxWidth: 400 }}>
          <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 6 }}>
            Filtrer par parcours
          </label>
          <select
            value={selectedParcours}
            onChange={(e) => setSelectedParcours(e.target.value)}
            style={{ width: '100%', padding: '10px 14px', border: '2px solid #e5e7eb', borderRadius: 8, fontSize: 14 }}
          >
            <option value="">Tous les parcours</option>
            {parcours.map(p => (
              <option key={p.id} value={p.id}>{p.code} - {p.nom}</option>
            ))}
          </select>
        </div>
        <div style={{ display: 'flex', gap: 8, marginTop: 20 }}>
          <div style={{ padding: '8px 16px', background: '#fff', borderRadius: 8, border: '1px solid #e5e7eb' }}>
            <span style={{ fontSize: 12, color: '#64748b' }}>Total: </span>
            <span style={{ fontSize: 14, fontWeight: 700, color: '#1e293b' }}>{filteredReferentiels.length}</span>
          </div>
          <div style={{ padding: '8px 16px', background: '#fef3c7', borderRadius: 8 }}>
            <span style={{ fontSize: 12, color: '#92400e' }}>Brouillons: </span>
            <span style={{ fontSize: 14, fontWeight: 700, color: '#92400e' }}>
              {filteredReferentiels.filter(r => r.statut === 'brouillon').length}
            </span>
          </div>
          <div style={{ padding: '8px 16px', background: '#d1fae5', borderRadius: 8 }}>
            <span style={{ fontSize: 12, color: '#065f46' }}>Validés: </span>
            <span style={{ fontSize: 14, fontWeight: 700, color: '#065f46' }}>
              {filteredReferentiels.filter(r => r.statut === 'valide').length}
            </span>
          </div>
        </div>
      </div>

      {/* Formulaire */}
      {showForm && (
        <div style={{ background: '#fff', borderRadius: 14, padding: 24, marginBottom: 24, boxShadow: '0 2px 10px rgba(0,0,0,0.07)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
            <h3 style={{ fontSize: 18, fontWeight: 700, color: '#0f172a', margin: 0 }}>
              {editingId ? 'Modifier le référentiel' : 'Nouveau référentiel'}
            </h3>
            <button onClick={() => setShowForm(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
              <X size={24} color="#64748b" />
            </button>
          </div>
          
          <form onSubmit={handleSubmit}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 16 }}>
              <div>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 6 }}>
                  Parcours *
                </label>
                <select
                  required
                  value={formData.parcoursId}
                  onChange={(e) => setFormData(prev => ({ ...prev, parcoursId: e.target.value }))}
                  style={{ width: '100%', padding: '11px 14px', border: '2px solid #e5e7eb', borderRadius: 9, fontSize: 14 }}
                >
                  <option value="">Sélectionner un parcours</option>
                  {parcours.map(p => (
                    <option key={p.id} value={p.id}>{p.code} - {p.nom}</option>
                  ))}
                </select>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 6 }}>
                  Niveau *
                </label>
                <select
                  required
                  value={formData.niveau}
                  onChange={(e) => setFormData(prev => ({ ...prev, niveau: e.target.value }))}
                  style={{ width: '100%', padding: '11px 14px', border: '2px solid #e5e7eb', borderRadius: 9, fontSize: 14 }}
                >
                  <option value="Licence">Licence</option>
                  <option value="Master">Master</option>
                  <option value="Doctorat">Doctorat</option>
                </select>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 6 }}>
                  Code *
                </label>
                <input
                  type="text"
                  required
                  value={formData.code}
                  onChange={(e) => setFormData(prev => ({ ...prev, code: e.target.value }))}
                  placeholder="Ex: REF-INFO-L3"
                  style={{ width: '100%', padding: '11px 14px', border: '2px solid #e5e7eb', borderRadius: 9, fontSize: 14 }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 6 }}>
                  Intitulé *
                </label>
                <input
                  type="text"
                  required
                  value={formData.intitule}
                  onChange={(e) => setFormData(prev => ({ ...prev, intitule: e.target.value }))}
                  placeholder="Ex: Compétences Informatique L3"
                  style={{ width: '100%', padding: '11px 14px', border: '2px solid #e5e7eb', borderRadius: 9, fontSize: 14 }}
                />
              </div>
            </div>
            
            <div style={{ marginTop: 16 }}>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 6 }}>
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                rows={3}
                style={{ width: '100%', padding: '11px 14px', border: '2px solid #e5e7eb', borderRadius: 9, fontSize: 14, resize: 'none' }}
              />
            </div>

            <div style={{ marginTop: 16 }}>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 6 }}>
                Compétences
              </label>
              <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
                <input
                  type="text"
                  value={newCompetence}
                  onChange={(e) => setNewCompetence(e.target.value)}
                  placeholder="Ajouter une compétence..."
                  style={{ flex: 1, padding: '10px 14px', border: '2px solid #e5e7eb', borderRadius: 9, fontSize: 14 }}
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addCompetence())}
                />
                <button
                  type="button"
                  onClick={addCompetence}
                  style={{
                    padding: '10px 20px',
                    background: '#1a5276',
                    color: '#fff',
                    border: 'none',
                    borderRadius: 9,
                    fontSize: 14,
                    fontWeight: 600,
                    cursor: 'pointer'
                  }}
                >
                  <Plus size={18} />
                </button>
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {formData.competences.map((comp, index) => (
                  <span
                    key={index}
                    style={{
                      padding: '6px 12px',
                      background: '#f0f9ff',
                      color: '#0369a1',
                      borderRadius: 20,
                      fontSize: 13,
                      display: 'flex',
                      alignItems: 'center',
                      gap: 8
                    }}
                  >
                    <Target size={14} />
                    {comp}
                    <button
                      type="button"
                      onClick={() => removeCompetence(index)}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
                    >
                      <X size={14} />
                    </button>
                  </span>
                ))}
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

      {/* Liste des référentiels */}
      <div style={{ display: 'grid', gap: 16 }}>
        {filteredReferentiels.length === 0 ? (
          <div style={{ background: '#fff', borderRadius: 14, padding: 40, textAlign: 'center' }}>
            <BookText size={48} color="#cbd5e1" />
            <p style={{ color: '#64748b', marginTop: 12 }}>Aucun référentiel trouvé</p>
            <p style={{ color: '#94a3b8', fontSize: 14 }}>Créez votre premier référentiel de compétences</p>
          </div>
        ) : (
          filteredReferentiels.map((ref) => (
            <div
              key={ref.id}
              style={{
                background: '#fff',
                borderRadius: 14,
                padding: 20,
                boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
                    <h3 style={{ fontSize: 16, fontWeight: 700, color: '#0f172a', margin: 0 }}>
                      {ref.code} - {ref.intitule}
                    </h3>
                    {getStatutBadge(ref.statut)}
                  </div>
                  <p style={{ fontSize: 13, color: '#64748b', margin: '0 0 12px' }}>
                    {getParcoursName(ref.parcoursId)} • {ref.niveau}
                  </p>
                  {ref.description && (
                    <p style={{ fontSize: 13, color: '#64748b', margin: '0 0 12px' }}>
                      {ref.description}
                    </p>
                  )}
                  
                  {/* Compétences */}
                  {ref.competences && ref.competences.length > 0 && (
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 12 }}>
                      {ref.competences.map((comp: any, idx: number) => (
                        <span
                          key={idx}
                          style={{
                            padding: '4px 10px',
                            background: '#f0f9ff',
                            color: '#0369a1',
                            borderRadius: 16,
                            fontSize: 12
                          }}
                        >
                          <Target size={12} style={{ marginRight: 4, display: 'inline' }} />
                          {comp.intitule || comp}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
                
                <div style={{ display: 'flex', gap: 8 }}>
                  {ref.statut === 'brouillon' && (
                    <button
                      onClick={() => handleValidate(ref.id)}
                      style={{
                        padding: '8px 16px',
                        background: '#d1fae5',
                        color: '#065f46',
                        border: 'none',
                        borderRadius: 8,
                        fontSize: 12,
                        fontWeight: 600,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 6
                      }}
                    >
                      <CheckCircle size={14} /> Valider
                    </button>
                  )}
                  <button
                    onClick={() => handleEdit(ref)}
                    style={{
                      padding: '8px',
                      background: '#f1f5f9',
                      color: '#64748b',
                      border: 'none',
                      borderRadius: 8,
                      cursor: 'pointer'
                    }}
                  >
                    <Edit2 size={16} />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default ReferentielsPage;
