import React, { useState, useEffect } from 'react';
import { api } from '../../api/client';
import { useAuthStore } from '../../store/authStore';
import toast from 'react-hot-toast';
import {
  School, Plus, Edit2, Save, X, ChevronDown, ChevronRight, BookOpen,
  CheckCircle, Layers, Clock, Award
} from 'lucide-react';

interface Parcours {
  id: string;
  code: string;
  nom: string;
  niveau: string;
  dureeAnnees: number;
  description?: string;
  totalCreditsECTS?: number;
  totalVolumeCM?: number;
  totalVolumeTD?: number;
  totalVolumeTP?: number;
  unites?: UniteEnseignement[];
  statut?: string;
}

interface UniteEnseignement {
  id: string;
  code: string;
  intitule: string;
  creditsEcts: number;
  coefficient: number;
  volumeCm: number;
  volumeTd: number;
  volumeTp: number;
  semestre: number;
  anneeNiveau: number;
  typeUe: string;
  elementsConstitutifs?: ElementConstitutif[];
}

interface ElementConstitutif {
  id: string;
  code: string;
  intitule: string;
  coefficient: number;
}

interface AnneeAcademique {
  id: string;
  libelle: string;
  active?: boolean;
}

export const MaquettesPage: React.FC = () => {
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
  const [error, setError] = useState<string | null>(null);
  const [parcours, setParcours] = useState<Parcours[]>([]);
  const [anneesAcademiques, setAnneesAcademiques] = useState<AnneeAcademique[]>([]);
  const [expandedParcours, setExpandedParcours] = useState<Set<string>>(new Set());
  const [showParcoursForm, setShowParcoursForm] = useState(false);
  const [showUEForm, setShowUEForm] = useState<string | null>(null);
  const [showECForm, setShowECForm] = useState<{parcoursId: string, ueId: string} | null>(null);
  
  const [parcoursForm, setParcoursForm] = useState({
    code: '',
    nom: '',
    niveau: 'Licence',
    dureeAnnees: 3,
    description: ''
  });
  
  const [ueForm, setUEForm] = useState({
    code: '',
    intitule: '',
    creditsEcts: 6,
    coefficient: 3,
    volumeCm: 20,
    volumeTd: 15,
    volumeTp: 10,
    semestre: 1,
    anneeNiveau: 1,
    typeUe: 'obligatoire'
  });
  
  const [ecForm, setECForm] = useState({
    code: '',
    intitule: '',
    coefficient: 1.5
  });

  useEffect(() => {
    const abortController = new AbortController();

    // Attendre que le store soit réhydraté
    if (!isHydrated) {
      console.log('⏳ Attente réhydratation store...');
      return () => abortController.abort();
    }

    if (tid) {
      console.log('✅ Tenant ID trouvé, chargement des données:', tid);
      loadData(abortController.signal);
    } else {
      // Si pas de tenant ID après réhydratation, session invalide
      console.error('❌ Pas de tenant ID après réhydratation');
      setLoading(false);
      setError('Session invalide. Veuillez vous reconnecter.');
      toast.error('Session invalide. Veuillez vous reconnecter.');
    }

    return () => {
      abortController.abort();
    };
  }, [tid, isHydrated]);

  const loadData = async (signal?: AbortSignal) => {
    // Garde: ne pas faire de requête si pas de tenant ID
    if (!tid) {
      console.error('❌ loadData appelé sans tenant ID');
      setError('Session invalide. Veuillez vous reconnecter.');
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      // Add timeout to prevent infinite loading
      const timeout = new Promise((_, reject) => {
        const timer = setTimeout(() => reject(new Error('Timeout')), 10000);
        // Cleanup timer if aborted
        signal?.addEventListener('abort', () => {
          clearTimeout(timer);
          reject(new Error('Aborted'));
        });
      });

      const dataPromise = Promise.all([
        api.get(`/rp-enhanced/maquettes`, { signal }),
        api.get(`/academic/${tid}/annees`, { signal })
      ]);

      const [parcoursResponse, anneesResponse] = await Promise.race([dataPromise, timeout]) as any;

      // Vérifier si la réponse est valide
      if (!parcoursResponse?.data || !Array.isArray(parcoursResponse.data)) {
        console.warn('Format de réponse inattendu pour les maquettes:', parcoursResponse);
        setParcours([]);
      } else {
        setParcours(parcoursResponse.data);
      }

      if (!anneesResponse?.data || !Array.isArray(anneesResponse.data)) {
        console.warn('Format de réponse inattendu pour les années:', anneesResponse);
        setAnneesAcademiques([]);
      } else {
        setAnneesAcademiques(anneesResponse.data);
      }

      // If no data, show info message
      if (!parcoursResponse?.data || parcoursResponse.data.length === 0) {
        toast('Aucune maquette disponible. Vous devez être assigné comme responsable d\'un parcours.', {
          icon: 'ℹ️',
          duration: 5000
        });
      }
    } catch (err: any) {
      // Ignorer les erreurs d'abort (composant démonté)
      if (err.message === 'Aborted' || err.name === 'AbortError' || err.code === 'ERR_CANCELED') {
        console.log('Requête annulée (composant démonté ou nouvelle requête)');
        return;
      }

      console.error('Erreur chargement maquettes:', err);
      const errorMsg = err.message === 'Timeout'
        ? 'Le chargement a pris trop de temps. Vérifiez votre connexion.'
        : err.response?.data?.message || err.message || 'Erreur de chargement';
      setError(errorMsg);
      toast.error(errorMsg);

      // Données vides par défaut en cas d'erreur (pas de fallback mock en production)
      setParcours([]);
      setAnneesAcademiques([]);
    } finally {
      // Garantir que le loading s'arrête même si le composant est démonté
      setLoading(false);
    }
  };

  const handleCreateParcours = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tid) {
      toast.error('Session invalide. Veuillez vous reconnecter.');
      return;
    }
    setLoading(true);
    try {
      await api.post(`/rp-enhanced/maquettes`, {
        parcours: parcoursForm,
        unites: []
      });
      toast.success('Maquette créée avec succès');
      setShowParcoursForm(false);
      setParcoursForm({ code: '', nom: '', niveau: 'Licence', dureeAnnees: 3, description: '' });
      loadData();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Erreur lors de la création');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateUE = async (e: React.FormEvent, parcoursId: string) => {
    e.preventDefault();
    if (!tid) {
      toast.error('Session invalide. Veuillez vous reconnecter.');
      return;
    }
    setLoading(true);
    try {
      await api.post(`/rp-enhanced/maquettes/${parcoursId}/ues`, ueForm);
      toast.success('UE créée avec succès');
      setShowUEForm(null);
      setUEForm({
        code: '', intitule: '', creditsEcts: 6, coefficient: 3,
        volumeCm: 20, volumeTd: 15, volumeTp: 10, semestre: 1, anneeNiveau: 1, typeUe: 'obligatoire'
      });
      loadData();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Erreur lors de la création');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateEC = async (e: React.FormEvent, parcoursId: string, ueId: string) => {
    e.preventDefault();
    if (!tid) {
      toast.error('Session invalide. Veuillez vous reconnecter.');
      return;
    }
    setLoading(true);
    try {
      await api.post(`/rp-enhanced/maquettes/${parcoursId}/ues/${ueId}/ecs`, ecForm);
      toast.success('EC créé avec succès');
      setShowECForm(null);
      setECForm({ code: '', intitule: '', coefficient: 1.5 });
      loadData();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Erreur lors de la création');
    } finally {
      setLoading(false);
    }
  };

  const handleValiderMaquette = async (parcoursId: string) => {
    if (!tid) {
      toast.error('Session invalide. Veuillez vous reconnecter.');
      return;
    }
    try {
      await api.post(`/rp-enhanced/maquettes/${parcoursId}/valider`);
      toast.success('Maquette validée avec succès');
      loadData();
    } catch (err: any) {
      toast.error('Erreur lors de la validation');
    }
  };

  const toggleParcoursExpansion = (id: string) => {
    const newSet = new Set(expandedParcours);
    if (newSet.has(id)) {
      newSet.delete(id);
    } else {
      newSet.add(id);
    }
    setExpandedParcours(newSet);
  };

  const getStatutBadge = (statut?: string) => {
    const styles: Record<string, { bg: string; color: string }> = {
      brouillon: { bg: '#fef3c7', color: '#92400e' },
      valide: { bg: '#d1fae5', color: '#065f46' },
      archive: { bg: '#f3f4f6', color: '#6b7280' }
    };
    const style = styles[statut || 'brouillon'];
    return (
      <span style={{
        padding: '4px 10px',
        borderRadius: 12,
        fontSize: 11,
        fontWeight: 600,
        background: style.bg,
        color: style.color
      }}>
        {statut || 'brouillon'}
      </span>
    );
  };

  const calculateTotals = (p: Parcours) => {
    const totalUEs = p.unites?.length || 0;
    const totalECs = p.unites?.reduce((acc, ue) => acc + (ue.elementsConstitutifs?.length || 0), 0) || 0;
    const totalCredits = p.unites?.reduce((acc, ue) => acc + (ue.creditsEcts || 0), 0) || 0;
    const totalCM = p.unites?.reduce((acc, ue) => acc + (ue.volumeCm || 0), 0) || 0;
    const totalTD = p.unites?.reduce((acc, ue) => acc + (ue.volumeTd || 0), 0) || 0;
    const totalTP = p.unites?.reduce((acc, ue) => acc + (ue.volumeTp || 0), 0) || 0;
    return { totalUEs, totalECs, totalCredits, totalCM, totalTD, totalTP };
  };

  // État de réhydratation du store
  if (!isHydrated) {
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
        <p style={{ color: '#64748b' }}>Initialisation de la session...</p>
      </div>
    );
  }

  // État de chargement initial
  if (loading && parcours.length === 0 && !error) {
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
        <p style={{ color: '#64748b' }}>Chargement des maquettes...</p>
        <p style={{ color: '#94a3b8', fontSize: 12, marginTop: 8 }}>
          Tenant ID: {tid || 'Non disponible'}
        </p>
      </div>
    );
  }

  // État d'erreur avec possibilité de réessayer
  if (error && parcours.length === 0) {
    return (
      <div style={{ padding: 40, textAlign: 'center' }}>
        <School size={48} color="#ef4444" />
        <p style={{ color: '#ef4444', marginTop: 16, fontWeight: 600 }}>Erreur de chargement</p>
        <p style={{ color: '#64748b', marginTop: 8, fontSize: 14 }}>{error}</p>
        <button
          onClick={() => {
            setError(null);
            loadData();
          }}
          style={{
            marginTop: 20,
            padding: '10px 20px',
            background: '#1a5276',
            color: '#fff',
            border: 'none',
            borderRadius: 8,
            fontSize: 14,
            fontWeight: 600,
            cursor: 'pointer',
            display: 'inline-flex',
            alignItems: 'center',
            gap: 8
          }}
        >
          Réessayer
        </button>
      </div>
    );
  }

  return (
    <div style={{ padding: 32 }}>
      {/* Alerte si pas de tenant ID */}
      {!tid && (
        <div style={{
          background: '#fee2e2',
          border: '1px solid #ef4444',
          borderRadius: 8,
          padding: '12px 16px',
          marginBottom: 20,
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          color: '#dc2626'
        }}>
          <School size={20} />
          <span style={{ fontWeight: 600 }}>Session invalide. Veuillez vous reconnecter pour accéder aux maquettes.</span>
        </div>
      )}

      {/* Header */}
      <div style={{ marginBottom: 32, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: 28, fontWeight: 800, color: '#1e293b', margin: '0 0 8px', display: 'flex', alignItems: 'center', gap: 12 }}>
            <School size={32} /> Maquettes Pédagogiques
          </h1>
          <p style={{ color: '#64748b', fontSize: 14 }}>
            Gestion des parcours, UE et éléments constitutifs
          </p>
        </div>
        <button
          onClick={() => setShowParcoursForm(true)}
          disabled={!tid}
          style={{
            padding: '12px 24px',
            background: !tid ? '#94a3b8' : 'linear-gradient(135deg, #148f77, #1a5276)',
            color: '#fff',
            border: 'none',
            borderRadius: 10,
            fontSize: 14,
            fontWeight: 700,
            cursor: !tid ? 'not-allowed' : 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            opacity: !tid ? 0.7 : 1
          }}
        >
          <Plus size={18} /> Nouvelle Maquette
        </button>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 24 }}>
        <div style={{ background: '#fff', borderRadius: 12, padding: 20, boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
          <div style={{ fontSize: 12, color: '#64748b', marginBottom: 4 }}>Total Maquettes</div>
          <div style={{ fontSize: 28, fontWeight: 800, color: '#1e293b' }}>{parcours.length}</div>
        </div>
        <div style={{ background: '#fff', borderRadius: 12, padding: 20, boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
          <div style={{ fontSize: 12, color: '#64748b', marginBottom: 4 }}>Total UE</div>
          <div style={{ fontSize: 28, fontWeight: 800, color: '#1e293b' }}>
            {parcours.reduce((acc, p) => acc + (p.unites?.length || 0), 0)}
          </div>
        </div>
        <div style={{ background: '#fff', borderRadius: 12, padding: 20, boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
          <div style={{ fontSize: 12, color: '#64748b', marginBottom: 4 }}>Maquettes Validées</div>
          <div style={{ fontSize: 28, fontWeight: 800, color: '#10b981' }}>
            {parcours.filter(p => p.statut === 'valide').length}
          </div>
        </div>
        <div style={{ background: '#fff', borderRadius: 12, padding: 20, boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
          <div style={{ fontSize: 12, color: '#64748b', marginBottom: 4 }}>En Brouillon</div>
          <div style={{ fontSize: 28, fontWeight: 800, color: '#f59e0b' }}>
            {parcours.filter(p => p.statut === 'brouillon' || !p.statut).length}
          </div>
        </div>
      </div>

      {/* Formulaire Parcours */}
      {showParcoursForm && (
        <div style={{ background: '#fff', borderRadius: 14, padding: 24, marginBottom: 24, boxShadow: '0 2px 10px rgba(0,0,0,0.07)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
            <h3 style={{ fontSize: 18, fontWeight: 700, color: '#0f172a', margin: 0 }}>Nouvelle Maquette</h3>
            <button onClick={() => setShowParcoursForm(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
              <X size={24} color="#64748b" />
            </button>
          </div>
          <form onSubmit={handleCreateParcours}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 16 }}>
              <div>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 6 }}>Code *</label>
                <input
                  type="text"
                  required
                  value={parcoursForm.code}
                  onChange={(e) => setParcoursForm(f => ({ ...f, code: e.target.value }))}
                  placeholder="Ex: INFO-L3"
                  style={{ width: '100%', padding: '11px 14px', border: '2px solid #e5e7eb', borderRadius: 9, fontSize: 14 }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 6 }}>Nom *</label>
                <input
                  type="text"
                  required
                  value={parcoursForm.nom}
                  onChange={(e) => setParcoursForm(f => ({ ...f, nom: e.target.value }))}
                  placeholder="Ex: Licence Informatique"
                  style={{ width: '100%', padding: '11px 14px', border: '2px solid #e5e7eb', borderRadius: 9, fontSize: 14 }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 6 }}>Niveau *</label>
                <select
                  required
                  value={parcoursForm.niveau}
                  onChange={(e) => setParcoursForm(f => ({ ...f, niveau: e.target.value }))}
                  style={{ width: '100%', padding: '11px 14px', border: '2px solid #e5e7eb', borderRadius: 9, fontSize: 14 }}
                >
                  <option value="Licence">Licence</option>
                  <option value="Master">Master</option>
                  <option value="Doctorat">Doctorat</option>
                </select>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 6 }}>Durée (années)</label>
                <input
                  type="number"
                  min={1} max={5}
                  value={parcoursForm.dureeAnnees}
                  onChange={(e) => setParcoursForm(f => ({ ...f, dureeAnnees: parseInt(e.target.value) }))}
                  style={{ width: '100%', padding: '11px 14px', border: '2px solid #e5e7eb', borderRadius: 9, fontSize: 14 }}
                />
              </div>
            </div>
            <div style={{ marginTop: 16 }}>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 6 }}>Description</label>
              <textarea
                value={parcoursForm.description}
                onChange={(e) => setParcoursForm(f => ({ ...f, description: e.target.value }))}
                rows={2}
                style={{ width: '100%', padding: '11px 14px', border: '2px solid #e5e7eb', borderRadius: 9, fontSize: 14, resize: 'none' }}
              />
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
                <Save size={18} /> {loading ? 'Enregistrement...' : 'Créer la Maquette'}
              </button>
              <button
                type="button"
                onClick={() => setShowParcoursForm(false)}
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

      {/* Liste des maquettes */}
      <div style={{ display: 'grid', gap: 16 }}>
        {parcours.length === 0 ? (
          <div style={{ background: '#fff', borderRadius: 14, padding: 40, textAlign: 'center' }}>
            <School size={48} color="#cbd5e1" />
            <p style={{ color: '#64748b', marginTop: 12 }}>Aucune maquette trouvée</p>
          </div>
        ) : (
          parcours.map((p) => {
            const totals = calculateTotals(p);
            const isExpanded = expandedParcours.has(p.id);
            
            return (
              <div
                key={p.id}
                style={{
                  background: '#fff',
                  borderRadius: 14,
                  boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                  overflow: 'hidden'
                }}
              >
                {/* Header de la maquette */}
                <div
                  onClick={() => toggleParcoursExpansion(p.id)}
                  style={{
                    padding: 20,
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    cursor: 'pointer',
                    background: isExpanded ? '#f8fafc' : '#fff',
                    borderBottom: isExpanded ? '1px solid #e5e7eb' : 'none'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    {isExpanded ? <ChevronDown size={20} color="#64748b" /> : <ChevronRight size={20} color="#64748b" />}
                    <div>
                      <div style={{ fontSize: 16, fontWeight: 700, color: '#0f172a', display: 'flex', alignItems: 'center', gap: 8 }}>
                        {p.code} - {p.nom}
                        {getStatutBadge(p.statut)}
                      </div>
                      <div style={{ fontSize: 13, color: '#64748b', marginTop: 4 }}>
                        {p.niveau} • {p.dureeAnnees} ans • {totals.totalUEs} UE • {totals.totalCredits} ECTS
                      </div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                    <div style={{ textAlign: 'right', fontSize: 12, color: '#94a3b8' }}>
                      <div>CM: {totals.totalCM}h TD: {totals.totalTD}h TP: {totals.totalTP}h</div>
                      <div>{totals.totalECs} ECs</div>
                    </div>
                    {p.statut !== 'valide' && (
                      <button
                        onClick={(e) => { e.stopPropagation(); handleValiderMaquette(p.id); }}
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
                  </div>
                </div>

                {/* Contenu déplié */}
                {isExpanded && (
                  <div style={{ padding: 20 }}>
                    {/* Formulaire UE */}
                    {showUEForm === p.id ? (
                      <div style={{ background: '#f8fafc', borderRadius: 10, padding: 16, marginBottom: 16 }}>
                        <h4 style={{ fontSize: 14, fontWeight: 700, color: '#0f172a', margin: '0 0 12px' }}>Nouvelle UE</h4>
                        <form onSubmit={(e) => handleCreateUE(e, p.id)}>
                          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
                            <div>
                              <label style={{ fontSize: 12, fontWeight: 600, color: '#64748b' }}>Code UE</label>
                              <input
                                type="text"
                                required
                                value={ueForm.code}
                                onChange={(e) => setUEForm(f => ({ ...f, code: e.target.value }))}
                                style={{ width: '100%', padding: '8px 12px', border: '1px solid #e5e7eb', borderRadius: 6, fontSize: 13, marginTop: 4 }}
                              />
                            </div>
                            <div style={{ gridColumn: 'span 2' }}>
                              <label style={{ fontSize: 12, fontWeight: 600, color: '#64748b' }}>Intitulé</label>
                              <input
                                type="text"
                                required
                                value={ueForm.intitule}
                                onChange={(e) => setUEForm(f => ({ ...f, intitule: e.target.value }))}
                                style={{ width: '100%', padding: '8px 12px', border: '1px solid #e5e7eb', borderRadius: 6, fontSize: 13, marginTop: 4 }}
                              />
                            </div>
                            <div>
                              <label style={{ fontSize: 12, fontWeight: 600, color: '#64748b' }}>Crédits ECTS</label>
                              <input
                                type="number"
                                value={ueForm.creditsEcts}
                                onChange={(e) => setUEForm(f => ({ ...f, creditsEcts: parseInt(e.target.value) }))}
                                style={{ width: '100%', padding: '8px 12px', border: '1px solid #e5e7eb', borderRadius: 6, fontSize: 13, marginTop: 4 }}
                              />
                            </div>
                            <div>
                              <label style={{ fontSize: 12, fontWeight: 600, color: '#64748b' }}>Semestre</label>
                              <select
                                value={ueForm.semestre}
                                onChange={(e) => setUEForm(f => ({ ...f, semestre: parseInt(e.target.value) }))}
                                style={{ width: '100%', padding: '8px 12px', border: '1px solid #e5e7eb', borderRadius: 6, fontSize: 13, marginTop: 4 }}
                              >
                                <option value={1}>S1</option>
                                <option value={2}>S2</option>
                              </select>
                            </div>
                            <div>
                              <label style={{ fontSize: 12, fontWeight: 600, color: '#64748b' }}>Année</label>
                              <input
                                type="number"
                                min={1} max={p.dureeAnnees}
                                value={ueForm.anneeNiveau}
                                onChange={(e) => setUEForm(f => ({ ...f, anneeNiveau: parseInt(e.target.value) }))}
                                style={{ width: '100%', padding: '8px 12px', border: '1px solid #e5e7eb', borderRadius: 6, fontSize: 13, marginTop: 4 }}
                              />
                            </div>
                          </div>
                          <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
                            <button
                              type="submit"
                              disabled={loading}
                              style={{
                                padding: '8px 16px',
                                background: loading ? '#94a3b8' : '#148f77',
                                color: '#fff',
                                border: 'none',
                                borderRadius: 8,
                                fontSize: 13,
                                fontWeight: 600,
                                cursor: loading ? 'not-allowed' : 'pointer'
                              }}
                            >
                              <Save size={14} /> Enregistrer
                            </button>
                            <button
                              type="button"
                              onClick={() => setShowUEForm(null)}
                              style={{
                                padding: '8px 16px',
                                background: '#fff',
                                color: '#64748b',
                                border: '1px solid #e5e7eb',
                                borderRadius: 8,
                                fontSize: 13,
                                fontWeight: 600,
                                cursor: 'pointer'
                              }}
                            >
                              Annuler
                            </button>
                          </div>
                        </form>
                      </div>
                    ) : (
                      <button
                        onClick={() => setShowUEForm(p.id)}
                        style={{
                          padding: '10px 16px',
                          background: '#f0fdf4',
                          color: '#148f77',
                          border: 'none',
                          borderRadius: 8,
                          fontSize: 13,
                          fontWeight: 600,
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: 6,
                          marginBottom: 16
                        }}
                      >
                        <Plus size={14} /> Ajouter une UE
                      </button>
                    )}

                    {/* Liste des UE */}
                    <div style={{ display: 'grid', gap: 12 }}>
                      {p.unites?.map((ue) => (
                        <div key={ue.id} style={{ background: '#f8fafc', borderRadius: 10, padding: 16 }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                            <div>
                              <div style={{ fontSize: 14, fontWeight: 700, color: '#0f172a', display: 'flex', alignItems: 'center', gap: 8 }}>
                                <BookOpen size={16} color="#1a5276" />
                                {ue.code} - {ue.intitule}
                                <span style={{
                                  padding: '2px 8px',
                                  background: ue.typeUe === 'obligatoire' ? '#dbeafe' : '#fce7f3',
                                  color: ue.typeUe === 'obligatoire' ? '#1e40af' : '#be185d',
                                  borderRadius: 12,
                                  fontSize: 10,
                                  fontWeight: 600,
                                  textTransform: 'uppercase'
                                }}>
                                  {ue.typeUe}
                                </span>
                              </div>
                              <div style={{ fontSize: 12, color: '#64748b', marginTop: 4 }}>
                                <Award size={12} style={{ display: 'inline', marginRight: 4 }} />
                                {ue.creditsEcts} ECTS • Coef: {ue.coefficient} • 
                                <Clock size={12} style={{ display: 'inline', margin: '0 4px' }} />
                                CM: {ue.volumeCm}h TD: {ue.volumeTd}h TP: {ue.volumeTp}h • S{ue.semestre} • Année {ue.anneeNiveau}
                              </div>
                            </div>
                          </div>

                          {/* ECs */}
                          {ue.elementsConstitutifs && ue.elementsConstitutifs.length > 0 && (
                            <div style={{ marginTop: 12, paddingLeft: 24 }}>
                              <div style={{ fontSize: 12, fontWeight: 600, color: '#64748b', marginBottom: 8 }}>Éléments Constitutifs:</div>
                              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                                {ue.elementsConstitutifs.map((ec) => (
                                  <span
                                    key={ec.id}
                                    style={{
                                      padding: '4px 10px',
                                      background: '#fff',
                                      border: '1px solid #e5e7eb',
                                      borderRadius: 6,
                                      fontSize: 12,
                                      color: '#374151'
                                    }}
                                  >
                                    <Layers size={12} style={{ display: 'inline', marginRight: 4, color: '#1a5276' }} />
                                    {ec.code} - {ec.intitule} (coef: {ec.coefficient})
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Formulaire EC */}
                          {showECForm?.parcoursId === p.id && showECForm?.ueId === ue.id ? (
                            <form
                              onSubmit={(e) => handleCreateEC(e, p.id, ue.id)}
                              style={{ marginTop: 12, padding: 12, background: '#fff', borderRadius: 8, display: 'flex', gap: 8 }}
                            >
                              <input
                                type="text"
                                placeholder="Code EC"
                                required
                                value={ecForm.code}
                                onChange={(e) => setECForm(f => ({ ...f, code: e.target.value }))}
                                style={{ flex: 1, padding: '8px 12px', border: '1px solid #e5e7eb', borderRadius: 6, fontSize: 13 }}
                              />
                              <input
                                type="text"
                                placeholder="Intitulé"
                                required
                                value={ecForm.intitule}
                                onChange={(e) => setECForm(f => ({ ...f, intitule: e.target.value }))}
                                style={{ flex: 2, padding: '8px 12px', border: '1px solid #e5e7eb', borderRadius: 6, fontSize: 13 }}
                              />
                              <input
                                type="number"
                                placeholder="Coef"
                                step="0.5"
                                value={ecForm.coefficient}
                                onChange={(e) => setECForm(f => ({ ...f, coefficient: parseFloat(e.target.value) }))}
                                style={{ width: 80, padding: '8px 12px', border: '1px solid #e5e7eb', borderRadius: 6, fontSize: 13 }}
                              />
                              <button
                                type="submit"
                                disabled={loading}
                                style={{
                                  padding: '8px 12px',
                                  background: loading ? '#94a3b8' : '#148f77',
                                  color: '#fff',
                                  border: 'none',
                                  borderRadius: 6,
                                  fontSize: 12,
                                  fontWeight: 600,
                                  cursor: loading ? 'not-allowed' : 'pointer'
                                }}
                              >
                                <Save size={14} />
                              </button>
                              <button
                                type="button"
                                onClick={() => setShowECForm(null)}
                                style={{
                                  padding: '8px',
                                  background: '#f1f5f9',
                                  color: '#64748b',
                                  border: 'none',
                                  borderRadius: 6,
                                  cursor: 'pointer'
                                }}
                              >
                                <X size={14} />
                              </button>
                            </form>
                          ) : (
                            <button
                              onClick={() => setShowECForm({ parcoursId: p.id, ueId: ue.id })}
                              style={{
                                marginTop: 12,
                                padding: '6px 12px',
                                background: '#fff',
                                color: '#148f77',
                                border: '1px dashed #148f77',
                                borderRadius: 6,
                                fontSize: 12,
                                fontWeight: 600,
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: 4
                              }}
                            >
                              <Plus size={12} /> Ajouter un EC
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default MaquettesPage;
