import React, { useState, useEffect } from 'react';
import { api } from '../../api/client';
import { useAuthStore } from '../../store/authStore';
import toast from 'react-hot-toast';
import {
  GraduationCap, BookOpen, Users, TrendingUp, TrendingDown, UserCheck,
  Plus, Edit2, Save, X, Search, FileText, ChevronDown, ChevronRight,
  School, Award, Calendar, Clock, CheckCircle, AlertTriangle,
  LayoutDashboard, Layers, Target, BarChart3
} from 'lucide-react';

type Tab = 'maquettes' | 'affectations' | 'performance' | 'assiduite';

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

interface AnneeAcademique {
  id: string;
  libelle: string;
}

interface PerformanceStats {
  parcoursId: string;
  anneeAcademiqueId: string;
  nbInscrits: number;
  nbPresents: number;
  tauxAssiduite: number;
  tauxReussite: number;
  moyenneGenerale: number;
  statsParUE: Array<{
    ueId: string;
    code: string;
    intitule: string;
    creditsECTS: number;
    moyenne: number;
    tauxReussite: number;
    nbEtudiants: number;
  }>;
}

interface PerformanceDashboard {
  parcours: Parcours;
  performance: PerformanceStats;
  affectations: Affectation[];
  statsEnseignants: Array<{
    enseignantId: string;
    nom: string;
    prenom: string;
    grade?: string;
    nbCours: number;
    volumePrevu: number;
    volumeRealise: number;
    tauxRealisation: number;
  }>;
  repartitionParType: {
    CM: number;
    TD: number;
    TP: number;
    AUTRE: number;
  };
  totalHeuresPrevues: number;
  totalHeuresRealisees: number;
}

interface SuiviAssiduite {
  etudiantId: string;
  inscriptionId: string;
  totalSeances: number;
  nbPresents: number;
  nbAbsences: number;
  nbAbsencesJustifiees: number;
  nbRetards: number;
  tauxAssiduite: number;
  alerteAssiduite: boolean;
}

export const RPManagementPage: React.FC = () => {
  // Debug: Test if component mounts
  console.log('[RP] Component mounting...');
  
  const { user, tenant } = useAuthStore();
  console.log('[RP] Auth state:', { user: user?.role, tenant: tenant?.id });
  
  const tid = tenant?.id || '';
  const [activeTab, setActiveTab] = useState<Tab>('maquettes');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isReady, setIsReady] = useState(false);
  const [debugInfo, setDebugInfo] = useState<string>('Initialisation...');

  // États pour les parcours
  const [mesParcours, setMesParcours] = useState<Parcours[]>([]);
  const [parcoursSelectionne, setParcoursSelectionne] = useState<string>('');
  const [anneeAcademique, setAnneeAcademique] = useState<string>('');
  const [anneesAcademiques, setAnneesAcademiques] = useState<AnneeAcademique[]>([]);

  // États pour les maquettes
  const [expandedParcours, setExpandedParcours] = useState<Set<string>>(new Set());
  const [showMaquetteForm, setShowMaquetteForm] = useState(false);
  const [showUEForm, setShowUEForm] = useState<string | null>(null);
  const [maquetteForm, setMaquetteForm] = useState({
    code: '',
    nom: '',
    niveau: 'Licence',
    dureeAnnees: 3,
    description: '',
    departementId: '',
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
    typeUe: 'obligatoire',
  });

  // États pour les affectations
  const [affectations, setAffectations] = useState<Affectation[]>([]);
  const [enseignants, setEnseignants] = useState<Enseignant[]>([]);
  const [showAffectationForm, setShowAffectationForm] = useState(false);
  const [affectationForm, setAffectationForm] = useState({
    enseignantId: '',
    ueId: '',
    ecId: '',
    anneeAcademiqueId: '',
    typeSeance: 'CM',
    volumePrevu: 30,
  });

  // États pour performance
  const [performanceDashboard, setPerformanceDashboard] = useState<PerformanceDashboard | null>(null);

  // États pour assiduité
  const [suiviAssiduite, setSuiviAssiduite] = useState<SuiviAssiduite[]>([]);

  useEffect(() => {
    console.log('[RP] useEffect triggered, tid:', tid);
    setDebugInfo(`Tenant ID: ${tid || 'non disponible'}`);
    
    if (!tid) {
      setIsReady(false);
      setDebugInfo('En attente du tenant...');
      return;
    }
    
    const loadInitialData = async () => {
      console.log('[RP] Starting data load...');
      setLoading(true);
      setDebugInfo('Chargement des données...');
      setError(null);
      try {
        await Promise.all([
          loadMesParcours(),
          loadAnneesAcademiques(),
          loadEnseignants()
        ]);
        console.log('[RP] Data loaded successfully');
        setDebugInfo('Données chargées avec succès');
        setIsReady(true);
      } catch (err: any) {
        console.error('[RP] Erreur chargement initial:', err);
        setDebugInfo(`Erreur: ${err.message || 'Inconnue'}`);
        setError('Erreur lors du chargement des données. Veuillez réessayer.');
      } finally {
        setLoading(false);
      }
    };
    
    loadInitialData();
  }, [tid]);

  useEffect(() => {
    if (parcoursSelectionne && anneeAcademique) {
      if (activeTab === 'affectations') {
        loadAffectations();
      } else if (activeTab === 'performance') {
        loadPerformanceDashboard();
      } else if (activeTab === 'assiduite') {
        loadSuiviAssiduite();
      }
    }
  }, [parcoursSelectionne, anneeAcademique, activeTab]);

  const loadMesParcours = async () => {
    try {
      const response = await api.get(`/rp-enhanced/${tid}/mes-parcours`);
      const data = response.data || [];
      setMesParcours(data);
      if (data.length > 0 && !parcoursSelectionne) {
        setParcoursSelectionne(data[0].id);
      }
    } catch (err: any) {
      console.error('Erreur chargement parcours:', err);
      // Ne pas bloquer le chargement initial pour cette erreur
    }
  };

  const loadAnneesAcademiques = async () => {
    try {
      // Note: Using academic API to get years
      const response = await api.get(`/academic/${tid}/annees`);
      const data = response.data || [];
      setAnneesAcademiques(data);
      if (data.length > 0 && !anneeAcademique) {
        const active = data.find((a: any) => a.active) || data[0];
        setAnneeAcademique(active.id);
      }
    } catch (err: any) {
      console.error('Erreur chargement années académiques', err);
      // Fallback: créer une année par défaut
      setAnneesAcademiques([{ id: '2024-2025', libelle: '2024-2025' }]);
      setAnneeAcademique('2024-2025');
    }
  };

  const loadEnseignants = async () => {
    try {
      const response = await api.get(`/academic/${tid}/enseignants`);
      setEnseignants(response.data || []);
    } catch (err: any) {
      console.error('Erreur chargement enseignants', err);
    }
  };

  const loadAffectations = async () => {
    setLoading(true);
    try {
      const response = await api.get(
        `/rp-enhanced/${tid}/parcours/${parcoursSelectionne}/affectations?anneeAcademiqueId=${anneeAcademique}`
      );
      setAffectations(response.data);
    } catch (err: any) {
      toast.error('Erreur lors du chargement des affectations');
    } finally {
      setLoading(false);
    }
  };

  const loadPerformanceDashboard = async () => {
    setLoading(true);
    try {
      const response = await api.get(
        `/rp-enhanced/${tid}/parcours/${parcoursSelectionne}/dashboard-performance?anneeAcademiqueId=${anneeAcademique}`
      );
      setPerformanceDashboard(response.data);
    } catch (err: any) {
      toast.error('Erreur lors du chargement du dashboard de performance');
    } finally {
      setLoading(false);
    }
  };

  const loadSuiviAssiduite = async () => {
    setLoading(true);
    try {
      const response = await api.get(
        `/rp-enhanced/${tid}/parcours/${parcoursSelectionne}/assiduite?anneeAcademiqueId=${anneeAcademique}`
      );
      setSuiviAssiduite(response.data);
    } catch (err: any) {
      toast.error('Erreur lors du chargement du suivi d\'assiduité');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateMaquette = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post(`/rp-enhanced/${tid}/maquettes`, {
        parcours: maquetteForm,
        unites: [],
      });
      toast.success('Maquette créée avec succès');
      setShowMaquetteForm(false);
      setMaquetteForm({
        code: '',
        nom: '',
        niveau: 'Licence',
        dureeAnnees: 3,
        description: '',
        departementId: '',
      });
      loadMesParcours();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Erreur lors de la création');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateUE = async (e: React.FormEvent, parcoursId: string) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post(`/rp-enhanced/${tid}/maquettes/${parcoursId}/ues`, ueForm);
      toast.success('UE créée avec succès');
      setShowUEForm(null);
      setUEForm({
        code: '',
        intitule: '',
        creditsEcts: 6,
        coefficient: 3,
        volumeCm: 20,
        volumeTd: 15,
        volumeTp: 10,
        semestre: 1,
        anneeNiveau: 1,
        typeUe: 'obligatoire',
      });
      loadMesParcours();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Erreur lors de la création');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateAffectation = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post(`/rp-enhanced/${tid}/affectations`, {
        ...affectationForm,
        anneeAcademiqueId: anneeAcademique,
      });
      toast.success('Affectation créée avec succès');
      setShowAffectationForm(false);
      setAffectationForm({
        enseignantId: '',
        ueId: '',
        ecId: '',
        anneeAcademiqueId: '',
        typeSeance: 'CM',
        volumePrevu: 30,
      });
      loadAffectations();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Erreur lors de la création');
    } finally {
      setLoading(false);
    }
  };

  const toggleParcoursExpansion = (parcoursId: string) => {
    const newExpanded = new Set(expandedParcours);
    if (newExpanded.has(parcoursId)) {
      newExpanded.delete(parcoursId);
    } else {
      newExpanded.add(parcoursId);
    }
    setExpandedParcours(newExpanded);
  };

  const tabs = [
    { id: 'maquettes' as Tab, label: 'Maquettes', icon: <School size={18} /> },
    { id: 'affectations' as Tab, label: 'Affectations', icon: <UserCheck size={18} /> },
    { id: 'performance' as Tab, label: 'Performance', icon: <BarChart3 size={18} /> },
    { id: 'assiduite' as Tab, label: 'Assiduité', icon: <Clock size={18} /> },
  ];

  const getUEForParcours = (parcoursId: string): UniteEnseignement[] => {
    const parcours = mesParcours.find(p => p.id === parcoursId);
    return parcours?.unites || [];
  };

  const parcoursActuel = mesParcours.find(p => p.id === parcoursSelectionne);

  // Affichage d'état de chargement initial
  if (!tid) {
    return (
      <div style={{ padding: 32, background: '#F5F5F0', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ width: 48, height: 48, border: '4px solid #e5e7eb', borderTop: '4px solid #148f77', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto 16px' }} />
          <p style={{ color: '#64748b' }}>Chargement du tenant...</p>
        </div>
      </div>
    );
  }

  // Affichage d'erreur
  if (error) {
    return (
      <div style={{ padding: 32, background: '#F5F5F0', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center', background: '#fff', padding: 32, borderRadius: 14, boxShadow: '0 2px 10px rgba(0,0,0,0.07)' }}>
          <AlertTriangle size={48} color="#e74c3c" style={{ marginBottom: 16 }} />
          <h3 style={{ color: '#0f172a', marginBottom: 8 }}>Erreur de chargement</h3>
          <p style={{ color: '#64748b', marginBottom: 16 }}>{error}</p>
          <button
            onClick={() => window.location.reload()}
            style={{ padding: '12px 24px', background: '#148f77', color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer' }}
          >
            Recharger la page
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ padding: 32, background: '#F5F5F0', minHeight: '100vh' }}>
      {/* Debug Panel - Always visible */}
      <div style={{ background: '#1e293b', color: '#94a3b8', padding: '8px 16px', borderRadius: 8, marginBottom: 16, fontSize: 12, fontFamily: 'monospace' }}>
        <strong style={{ color: '#22c55e' }}>[DEBUG]</strong> {debugInfo} | User: {user?.role || 'N/A'} | Tenant: {tenant?.id?.slice(0,8) || 'N/A'}...
      </div>
      
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 28, fontWeight: 900, color: '#0f172a', margin: '0 0 8px', display: 'flex', alignItems: 'center', gap: 12 }}>
          <GraduationCap size={32} /> Gestion Pédagogique
        </h1>
        <p style={{ color: '#64748b', fontSize: 14 }}>
          Gestion des maquettes, affectations des enseignants et suivi des performances
        </p>
      </div>

      {/* Sélection Parcours et Année */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 24 }}>
        <div>
          <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 6 }}>
            Parcours
          </label>
          <select
            value={parcoursSelectionne}
            onChange={(e) => setParcoursSelectionne(e.target.value)}
            disabled={mesParcours.length === 0}
            style={{ width: '100%', padding: '11px 14px', border: '2px solid #e5e7eb', borderRadius: 9, fontSize: 14, background: '#fff' }}
          >
            {mesParcours.length === 0 ? (
              <option value="">Aucun parcours disponible</option>
            ) : (
              mesParcours.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.code} - {p.nom}
                </option>
              ))
            )}
          </select>
        </div>
        <div>
          <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 6 }}>
            Année Académique
          </label>
          <select
            value={anneeAcademique}
            onChange={(e) => setAnneeAcademique(e.target.value)}
            disabled={anneesAcademiques.length === 0}
            style={{ width: '100%', padding: '11px 14px', border: '2px solid #e5e7eb', borderRadius: 9, fontSize: 14, background: '#fff' }}
          >
            {anneesAcademiques.length === 0 ? (
              <option value="">Chargement...</option>
            ) : (
              anneesAcademiques.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.libelle}
                </option>
              ))
            )}
          </select>
        </div>
        <div style={{ display: 'flex', alignItems: 'flex-end' }}>
          <button
            onClick={() => {
              if (activeTab === 'maquettes') loadMesParcours();
              else if (activeTab === 'affectations') loadAffectations();
              else if (activeTab === 'performance') loadPerformanceDashboard();
              else if (activeTab === 'assiduite') loadSuiviAssiduite();
            }}
            disabled={loading}
            style={{
              padding: '11px 20px',
              background: loading ? '#94a3b8' : 'linear-gradient(135deg, #148f77, #1a5276)',
              color: '#fff',
              border: 'none',
              borderRadius: 9,
              fontSize: 14,
              fontWeight: 700,
              cursor: loading ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 8,
            }}
          >
            <TrendingUp size={18} /> {loading ? 'Chargement...' : 'Actualiser'}
          </button>
        </div>
      </div>

      {/* Message si aucun parcours */}
      {mesParcours.length === 0 && !loading && (
        <div style={{ background: '#fef3c7', border: '1px solid #f59e0b', borderRadius: 10, padding: 16, marginBottom: 24 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <AlertTriangle size={24} color="#f59e0b" />
            <div>
              <p style={{ margin: 0, fontWeight: 600, color: '#92400e' }}>Aucun parcours assigné</p>
              <p style={{ margin: '4px 0 0', fontSize: 13, color: '#a16207' }}>
                Vous n'êtes assigné à aucun parcours. Contactez l'administrateur pour vous assigner un parcours,
                ou créez une nouvelle maquette pour commencer.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 24, overflowX: 'auto', paddingBottom: 8 }}>
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{
              padding: '12px 20px',
              background: activeTab === tab.id ? 'linear-gradient(135deg, #148f77, #1a5276)' : '#fff',
              color: activeTab === tab.id ? '#fff' : '#64748b',
              border: activeTab === tab.id ? 'none' : '2px solid #e5e7eb',
              borderRadius: 10,
              fontSize: 13,
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              whiteSpace: 'nowrap',
              transition: 'all 0.2s'
            }}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      {/* Onglet Maquettes */}
      {activeTab === 'maquettes' && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 20 }}>
            <button
              onClick={() => setShowMaquetteForm(true)}
              style={{
                padding: '12px 20px',
                background: 'linear-gradient(135deg, #148f77, #1a5276)',
                color: '#fff',
                border: 'none',
                borderRadius: 10,
                fontSize: 13,
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 8
              }}
            >
              <Plus size={18} /> Nouvelle Maquette
            </button>
          </div>

          {showMaquetteForm && (
            <div style={{ background: '#fff', borderRadius: 14, padding: 24, marginBottom: 20, boxShadow: '0 2px 10px rgba(0,0,0,0.07)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                <h3 style={{ fontSize: 18, fontWeight: 700, color: '#0f172a', margin: 0 }}>Nouvelle Maquette</h3>
                <button onClick={() => setShowMaquetteForm(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                  <X size={24} color="#64748b" />
                </button>
              </div>
              <form onSubmit={handleCreateMaquette}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 16 }}>
                  <div>
                    <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 6 }}>Code *</label>
                    <input
                      type="text"
                      required
                      value={maquetteForm.code}
                      onChange={e => setMaquetteForm(f => ({ ...f, code: e.target.value }))}
                      placeholder="Ex: INFO-L3"
                      style={{ width: '100%', padding: '11px 14px', border: '2px solid #e5e7eb', borderRadius: 9, fontSize: 14 }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 6 }}>Nom *</label>
                    <input
                      type="text"
                      required
                      value={maquetteForm.nom}
                      onChange={e => setMaquetteForm(f => ({ ...f, nom: e.target.value }))}
                      placeholder="Ex: Licence Informatique"
                      style={{ width: '100%', padding: '11px 14px', border: '2px solid #e5e7eb', borderRadius: 9, fontSize: 14 }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 6 }}>Niveau *</label>
                    <select
                      required
                      value={maquetteForm.niveau}
                      onChange={e => setMaquetteForm(f => ({ ...f, niveau: e.target.value }))}
                      style={{ width: '100%', padding: '11px 14px', border: '2px solid #e5e7eb', borderRadius: 9, fontSize: 14, background: '#fff' }}
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
                      min={1}
                      max={5}
                      value={maquetteForm.dureeAnnees}
                      onChange={e => setMaquetteForm(f => ({ ...f, dureeAnnees: parseInt(e.target.value) }))}
                      style={{ width: '100%', padding: '11px 14px', border: '2px solid #e5e7eb', borderRadius: 9, fontSize: 14 }}
                    />
                  </div>
                </div>
                <div style={{ marginTop: 16 }}>
                  <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 6 }}>Description</label>
                  <textarea
                    value={maquetteForm.description}
                    onChange={e => setMaquetteForm(f => ({ ...f, description: e.target.value }))}
                    rows={2}
                    style={{ width: '100%', padding: '11px 14px', border: '2px solid #e5e7eb', borderRadius: 9, fontSize: 14, resize: 'none' }}
                  />
                </div>
                <div style={{ display: 'flex', gap: 12, marginTop: 20 }}>
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
                    onClick={() => setShowMaquetteForm(false)}
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

          <div style={{ display: 'grid', gap: 16 }}>
            {mesParcours.length === 0 ? (
              <div style={{ background: '#fff', borderRadius: 14, padding: 40, textAlign: 'center', boxShadow: '0 2px 10px rgba(0,0,0,0.07)' }}>
                <School size={48} color="#cbd5e1" />
                <p style={{ color: '#94a3b8', marginTop: 12 }}>Aucune maquette trouvée</p>
              </div>
            ) : (
              mesParcours.map((parcours) => (
                <div key={parcours.id} style={{ background: '#fff', borderRadius: 14, boxShadow: '0 2px 10px rgba(0,0,0,0.07)', overflow: 'hidden' }}>
                  <div
                    onClick={() => toggleParcoursExpansion(parcours.id)}
                    style={{
                      padding: 20,
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      cursor: 'pointer',
                      background: expandedParcours.has(parcours.id) ? '#f8fafc' : '#fff',
                      borderBottom: expandedParcours.has(parcours.id) ? '1px solid #e5e7eb' : 'none'
                    }}
                  >
                    <div>
                      <div style={{ fontSize: 16, fontWeight: 700, color: '#0f172a' }}>
                        {parcours.code} - {parcours.nom}
                      </div>
                      <div style={{ fontSize: 13, color: '#64748b', marginTop: 4 }}>
                        {parcours.niveau} • {parcours.dureeAnnees} ans •
                        <span style={{ color: '#148f77', fontWeight: 600 }}> {parcours.totalCreditsECTS || 0} ECTS</span>
                      </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: 12, color: '#94a3b8' }}>UE: {parcours.unites?.length || 0}</div>
                        <div style={{ fontSize: 12, color: '#94a3b8' }}>CM: {parcours.totalVolumeCM || 0}h TD: {parcours.totalVolumeTD || 0}h</div>
                      </div>
                      {expandedParcours.has(parcours.id) ? <ChevronDown size={20} color="#64748b" /> : <ChevronRight size={20} color="#64748b" />}
                    </div>
                  </div>

                  {expandedParcours.has(parcours.id) && (
                    <div style={{ padding: 20 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                        <h4 style={{ fontSize: 15, fontWeight: 700, color: '#0f172a', margin: 0 }}>Unités d'Enseignement</h4>
                        <button
                          onClick={() => setShowUEForm(parcours.id)}
                          style={{
                            padding: '8px 16px',
                            background: '#f0fdf4',
                            color: '#148f77',
                            border: 'none',
                            borderRadius: 8,
                            fontSize: 12,
                            fontWeight: 700,
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: 6
                          }}
                        >
                          <Plus size={14} /> Ajouter UE
                        </button>
                      </div>

                      {showUEForm === parcours.id && (
                        <div style={{ background: '#f8fafc', borderRadius: 10, padding: 16, marginBottom: 16 }}>
                          <form onSubmit={(e) => handleCreateUE(e, parcours.id)}>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
                              <div>
                                <label style={{ fontSize: 12, fontWeight: 600, color: '#64748b' }}>Code UE</label>
                                <input
                                  type="text"
                                  required
                                  value={ueForm.code}
                                  onChange={e => setUEForm(f => ({ ...f, code: e.target.value }))}
                                  style={{ width: '100%', padding: '8px 12px', border: '1px solid #e5e7eb', borderRadius: 6, fontSize: 13, marginTop: 4 }}
                                />
                              </div>
                              <div style={{ gridColumn: 'span 2' }}>
                                <label style={{ fontSize: 12, fontWeight: 600, color: '#64748b' }}>Intitulé</label>
                                <input
                                  type="text"
                                  required
                                  value={ueForm.intitule}
                                  onChange={e => setUEForm(f => ({ ...f, intitule: e.target.value }))}
                                  style={{ width: '100%', padding: '8px 12px', border: '1px solid #e5e7eb', borderRadius: 6, fontSize: 13, marginTop: 4 }}
                                />
                              </div>
                              <div>
                                <label style={{ fontSize: 12, fontWeight: 600, color: '#64748b' }}>Crédits ECTS</label>
                                <input
                                  type="number"
                                  value={ueForm.creditsEcts}
                                  onChange={e => setUEForm(f => ({ ...f, creditsEcts: parseInt(e.target.value) }))}
                                  style={{ width: '100%', padding: '8px 12px', border: '1px solid #e5e7eb', borderRadius: 6, fontSize: 13, marginTop: 4 }}
                                />
                              </div>
                              <div>
                                <label style={{ fontSize: 12, fontWeight: 600, color: '#64748b' }}>Semestre</label>
                                <select
                                  value={ueForm.semestre}
                                  onChange={e => setUEForm(f => ({ ...f, semestre: parseInt(e.target.value) }))}
                                  style={{ width: '100%', padding: '8px 12px', border: '1px solid #e5e7eb', borderRadius: 6, fontSize: 13, marginTop: 4 }}
                                >
                                  <option value={1}>S1</option>
                                  <option value={2}>S2</option>
                                </select>
                              </div>
                              <div>
                                <label style={{ fontSize: 12, fontWeight: 600, color: '#64748b' }}>Année niveau</label>
                                <input
                                  type="number"
                                  min={1}
                                  max={parcours.dureeAnnees}
                                  value={ueForm.anneeNiveau}
                                  onChange={e => setUEForm(f => ({ ...f, anneeNiveau: parseInt(e.target.value) }))}
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
                                  borderRadius: 6,
                                  fontSize: 12,
                                  fontWeight: 700,
                                  cursor: loading ? 'not-allowed' : 'pointer'
                                }}
                              >
                                {loading ? '...' : 'Créer'}
                              </button>
                              <button
                                type="button"
                                onClick={() => setShowUEForm(null)}
                                style={{
                                  padding: '8px 16px',
                                  background: '#fff',
                                  color: '#64748b',
                                  border: '1px solid #e5e7eb',
                                  borderRadius: 6,
                                  fontSize: 12,
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

                      {parcours.unites?.length === 0 ? (
                        <p style={{ color: '#94a3b8', fontSize: 13, textAlign: 'center', padding: 20 }}>Aucune UE dans cette maquette</p>
                      ) : (
                        <div style={{ display: 'grid', gap: 12 }}>
                          {parcours.unites?.map((ue) => (
                            <div key={ue.id} style={{ background: '#f8fafc', borderRadius: 10, padding: 16 }}>
                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <div>
                                  <div style={{ fontSize: 14, fontWeight: 700, color: '#0f172a' }}>
                                    {ue.code} - {ue.intitule}
                                  </div>
                                  <div style={{ fontSize: 12, color: '#64748b', marginTop: 4 }}>
                                    S{ue.semestre} • {ue.creditsEcts} ECTS • Coef: {ue.coefficient}
                                  </div>
                                </div>
                                <div style={{ fontSize: 12, color: '#64748b' }}>
                                  CM: {ue.volumeCm}h • TD: {ue.volumeTd}h • TP: {ue.volumeTp}h
                                </div>
                              </div>
                              {ue.elementsConstitutifs && ue.elementsConstitutifs.length > 0 && (
                                <div style={{ marginTop: 12, paddingTop: 12, borderTop: '1px dashed #e5e7eb' }}>
                                  <div style={{ fontSize: 11, fontWeight: 600, color: '#94a3b8', marginBottom: 8 }}>Éléments Constitutifs</div>
                                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                                    {ue.elementsConstitutifs.map((ec) => (
                                      <span key={ec.id} style={{ fontSize: 12, background: '#fff', padding: '4px 8px', borderRadius: 4, color: '#64748b' }}>
                                        {ec.code} - {ec.intitule} (Coef: {ec.coefficient})
                                      </span>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Onglet Affectations */}
      {activeTab === 'affectations' && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
            <div>
              <h3 style={{ fontSize: 16, fontWeight: 700, color: '#0f172a', margin: 0 }}>
                Affectations - {parcoursActuel?.nom}
              </h3>
              <p style={{ color: '#64748b', fontSize: 13, margin: '4px 0 0' }}>
                {anneesAcademiques.find(a => a.id === anneeAcademique)?.libelle}
              </p>
            </div>
            <button
              onClick={() => setShowAffectationForm(true)}
              style={{
                padding: '12px 20px',
                background: 'linear-gradient(135deg, #148f77, #1a5276)',
                color: '#fff',
                border: 'none',
                borderRadius: 10,
                fontSize: 13,
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 8
              }}
            >
              <Plus size={18} /> Nouvelle Affectation
            </button>
          </div>

          {showAffectationForm && (
            <div style={{ background: '#fff', borderRadius: 14, padding: 24, marginBottom: 20, boxShadow: '0 2px 10px rgba(0,0,0,0.07)' }}>
              <h4 style={{ fontSize: 16, fontWeight: 700, color: '#0f172a', margin: '0 0 20px' }}>Nouvelle Affectation</h4>
              <form onSubmit={handleCreateAffectation}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 16 }}>
                  <div>
                    <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 6 }}>Enseignant *</label>
                    <select
                      required
                      value={affectationForm.enseignantId}
                      onChange={e => setAffectationForm(f => ({ ...f, enseignantId: e.target.value }))}
                      style={{ width: '100%', padding: '11px 14px', border: '2px solid #e5e7eb', borderRadius: 9, fontSize: 14, background: '#fff' }}
                    >
                      <option value="">Choisir un enseignant</option>
                      {enseignants.map(ens => (
                        <option key={ens.id} value={ens.id}>
                          {ens.prenom} {ens.nom} {ens.grade && `(${ens.grade})`}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 6 }}>Type de séance</label>
                    <select
                      value={affectationForm.typeSeance}
                      onChange={e => setAffectationForm(f => ({ ...f, typeSeance: e.target.value }))}
                      style={{ width: '100%', padding: '11px 14px', border: '2px solid #e5e7eb', borderRadius: 9, fontSize: 14, background: '#fff' }}
                    >
                      <option value="CM">Cours Magistral (CM)</option>
                      <option value="TD">Travaux Dirigés (TD)</option>
                      <option value="TP">Travaux Pratiques (TP)</option>
                    </select>
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 6 }}>UE</label>
                    <select
                      value={affectationForm.ueId}
                      onChange={e => setAffectationForm(f => ({ ...f, ueId: e.target.value, ecId: '' }))}
                      style={{ width: '100%', padding: '11px 14px', border: '2px solid #e5e7eb', borderRadius: 9, fontSize: 14, background: '#fff' }}
                    >
                      <option value="">Choisir une UE</option>
                      {getUEForParcours(parcoursSelectionne).map(ue => (
                        <option key={ue.id} value={ue.id}>
                          {ue.code} - {ue.intitule}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 6 }}>Volume horaire prévu (h)</label>
                    <input
                      type="number"
                      min={1}
                      value={affectationForm.volumePrevu}
                      onChange={e => setAffectationForm(f => ({ ...f, volumePrevu: parseInt(e.target.value) }))}
                      style={{ width: '100%', padding: '11px 14px', border: '2px solid #e5e7eb', borderRadius: 9, fontSize: 14 }}
                    />
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 12, marginTop: 20 }}>
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
                    <Save size={18} /> {loading ? 'Enregistrement...' : 'Créer l\'Affectation'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowAffectationForm(false)}
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

          <div style={{ background: '#fff', borderRadius: 14, padding: 24, boxShadow: '0 2px 10px rgba(0,0,0,0.07)' }}>
            <h4 style={{ fontSize: 16, fontWeight: 700, color: '#0f172a', margin: '0 0 20px' }}>
              Liste des Affectations ({affectations.length})
            </h4>
            {affectations.length === 0 ? (
              <div style={{ textAlign: 'center', padding: 40 }}>
                <UserCheck size={48} color="#cbd5e1" />
                <p style={{ color: '#94a3b8', marginTop: 12 }}>Aucune affectation trouvée</p>
              </div>
            ) : (
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ background: '#f8fafc', borderBottom: '2px solid #e5e7eb' }}>
                    {['Enseignant', 'Cours', 'Type', 'Volume', 'Progression'].map(h => (
                      <th key={h} style={{ padding: '12px', textAlign: 'left', fontSize: 12, fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {affectations.map((aff) => (
                    <tr key={aff.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                      <td style={{ padding: '14px' }}>
                        <div style={{ fontSize: 13, fontWeight: 600, color: '#0f172a' }}>
                          {aff.enseignant?.prenom} {aff.enseignant?.nom}
                        </div>
                        <div style={{ fontSize: 11, color: '#64748b' }}>{aff.enseignant?.grade}</div>
                      </td>
                      <td style={{ padding: '14px' }}>
                        <div style={{ fontSize: 13, fontWeight: 600, color: '#0f172a' }}>
                          {aff.uniteEnseignement?.code || aff.elementConstitutif?.code}
                        </div>
                        <div style={{ fontSize: 11, color: '#64748b' }}>
                          {aff.uniteEnseignement?.intitule || aff.elementConstitutif?.intitule}
                        </div>
                      </td>
                      <td style={{ padding: '14px' }}>
                        <span style={{
                          padding: '4px 8px',
                          background: aff.typeSeance === 'CM' ? '#dbeafe' : aff.typeSeance === 'TD' ? '#dcfce7' : '#fef3c7',
                          color: aff.typeSeance === 'CM' ? '#1e40af' : aff.typeSeance === 'TD' ? '#166534' : '#92400e',
                          borderRadius: 4,
                          fontSize: 11,
                          fontWeight: 700
                        }}>
                          {aff.typeSeance}
                        </span>
                      </td>
                      <td style={{ padding: '14px', fontSize: 13 }}>
                        <div>Prévu: {aff.volumePrevu}h</div>
                        <div style={{ color: '#64748b', fontSize: 11 }}>Réalisé: {aff.volumeRealise || 0}h</div>
                      </td>
                      <td style={{ padding: '14px' }}>
                        <div style={{ width: 100 }}>
                          <div style={{ background: '#e5e7eb', borderRadius: 999, height: 6, overflow: 'hidden' }}>
                            <div style={{
                              width: `${Math.min(100, ((aff.volumeRealise || 0) / (aff.volumePrevu || 1)) * 100)}%`,
                              height: '100%',
                              background: ((aff.volumeRealise || 0) / (aff.volumePrevu || 1)) >= 0.8 ? '#148f77' : '#f59e0b',
                            }} />
                          </div>
                          <div style={{ fontSize: 10, color: '#64748b', marginTop: 4, textAlign: 'center' }}>
                            {Math.round(((aff.volumeRealise || 0) / (aff.volumePrevu || 1)) * 100)}%
                          </div>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}

      {/* Onglet Performance */}
      {activeTab === 'performance' && performanceDashboard && (
        <div>
          {/* KPI Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 24 }}>
            {[
              { label: 'Étudiants Inscrits', value: performanceDashboard.performance.nbInscrits, color: '#1a5276', icon: <Users size={24} /> },
              { label: 'Taux de Réussite', value: `${performanceDashboard.performance.tauxReussite.toFixed(1)}%`, color: '#148f77', icon: <Award size={24} /> },
              { label: 'Moyenne Générale', value: `${performanceDashboard.performance.moyenneGenerale.toFixed(2)}/20`, color: '#7c3aed', icon: <Target size={24} /> },
              { label: 'Taux d\'Assiduité', value: `${performanceDashboard.performance.tauxAssiduite.toFixed(1)}%`, color: '#0ea5e9', icon: <Clock size={24} /> },
            ].map((card, idx) => (
              <div key={idx} style={{ background: '#fff', borderRadius: 14, padding: 20, boxShadow: '0 2px 10px rgba(0,0,0,0.07)', borderTop: `3px solid ${card.color}` }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <p style={{ color: '#94a3b8', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', margin: '0 0 8px' }}>{card.label}</p>
                    <p style={{ fontSize: 22, fontWeight: 900, color: card.color, margin: 0 }}>{card.value}</p>
                  </div>
                  <span style={{ color: card.color }}>{card.icon}</span>
                </div>
              </div>
            ))}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 20 }}>
            {/* Stats par UE */}
            <div style={{ background: '#fff', borderRadius: 14, padding: 24, boxShadow: '0 2px 10px rgba(0,0,0,0.07)' }}>
              <h4 style={{ fontSize: 16, fontWeight: 700, color: '#0f172a', margin: '0 0 20px' }}>
                <BarChart3 size={20} style={{ marginRight: 8 }} /> Performance par UE
              </h4>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ background: '#f8fafc', borderBottom: '2px solid #e5e7eb' }}>
                    {['Code', 'Intitulé', 'ECTS', 'Étudiants', 'Moyenne', 'Taux Réussite'].map(h => (
                      <th key={h} style={{ padding: '10px', textAlign: 'left', fontSize: 11, fontWeight: 700, color: '#64748b' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {performanceDashboard.performance.statsParUE.map((ue) => (
                    <tr key={ue.ueId} style={{ borderBottom: '1px solid #f1f5f9' }}>
                      <td style={{ padding: '10px', fontSize: 13, fontWeight: 600 }}>{ue.code}</td>
                      <td style={{ padding: '10px', fontSize: 13 }}>{ue.intitule}</td>
                      <td style={{ padding: '10px', fontSize: 13 }}>{ue.creditsECTS}</td>
                      <td style={{ padding: '10px', fontSize: 13 }}>{ue.nbEtudiants}</td>
                      <td style={{ padding: '10px' }}>
                        <span style={{
                          padding: '4px 8px',
                          background: ue.moyenne >= 10 ? '#dcfce7' : '#fee2e2',
                          color: ue.moyenne >= 10 ? '#166534' : '#991b1b',
                          borderRadius: 4,
                          fontSize: 12,
                          fontWeight: 700
                        }}>
                          {ue.moyenne.toFixed(2)}
                        </span>
                      </td>
                      <td style={{ padding: '10px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <div style={{ width: 60, background: '#e5e7eb', borderRadius: 999, height: 6, overflow: 'hidden' }}>
                            <div style={{
                              width: `${Math.min(100, ue.tauxReussite)}%`,
                              height: '100%',
                              background: ue.tauxReussite >= 70 ? '#148f77' : ue.tauxReussite >= 50 ? '#f59e0b' : '#e74c3c',
                            }} />
                          </div>
                          <span style={{ fontSize: 11, color: '#64748b' }}>{ue.tauxReussite.toFixed(0)}%</span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Stats enseignants */}
            <div style={{ background: '#fff', borderRadius: 14, padding: 24, boxShadow: '0 2px 10px rgba(0,0,0,0.07)' }}>
              <h4 style={{ fontSize: 16, fontWeight: 700, color: '#0f172a', margin: '0 0 20px' }}>
                <UserCheck size={20} style={{ marginRight: 8 }} /> Enseignants Actifs
              </h4>
              <div style={{ display: 'grid', gap: 12 }}>
                {performanceDashboard.statsEnseignants.length === 0 ? (
                  <p style={{ color: '#94a3b8', fontSize: 13, textAlign: 'center' }}>Aucun enseignant affecté</p>
                ) : (
                  performanceDashboard.statsEnseignants.map((ens) => (
                    <div key={ens.enseignantId} style={{ background: '#f8fafc', borderRadius: 10, padding: 12 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                          <div style={{ fontSize: 13, fontWeight: 700, color: '#0f172a' }}>
                            {ens.prenom} {ens.nom}
                          </div>
                          <div style={{ fontSize: 11, color: '#64748b' }}>{ens.grade} • {ens.nbCours} cours</div>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                          <div style={{ fontSize: 12, fontWeight: 700, color: '#148f77' }}>
                            {ens.tauxRealisation.toFixed(0)}%
                          </div>
                          <div style={{ fontSize: 10, color: '#94a3b8' }}>
                            {ens.volumeRealise}/{ens.volumePrevu}h
                          </div>
                        </div>
                      </div>
                      <div style={{ marginTop: 8, background: '#e5e7eb', borderRadius: 999, height: 4, overflow: 'hidden' }}>
                        <div style={{
                          width: `${Math.min(100, ens.tauxRealisation)}%`,
                          height: '100%',
                          background: ens.tauxRealisation >= 80 ? '#148f77' : ens.tauxRealisation >= 60 ? '#f59e0b' : '#e74c3c',
                        }} />
                      </div>
                    </div>
                  ))
                )}
              </div>

              <div style={{ marginTop: 20, paddingTop: 20, borderTop: '1px solid #e5e7eb' }}>
                <h5 style={{ fontSize: 13, fontWeight: 700, color: '#0f172a', margin: '0 0 12px' }}>Répartition par type</h5>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
                  {[
                    { label: 'CM', value: performanceDashboard.repartitionParType.CM, color: '#dbeafe' },
                    { label: 'TD', value: performanceDashboard.repartitionParType.TD, color: '#dcfce7' },
                    { label: 'TP', value: performanceDashboard.repartitionParType.TP, color: '#fef3c7' },
                  ].map(type => (
                    <div key={type.label} style={{ background: type.color, borderRadius: 8, padding: 12, textAlign: 'center' }}>
                      <div style={{ fontSize: 18, fontWeight: 900, color: '#0f172a' }}>{type.value}</div>
                      <div style={{ fontSize: 11, color: '#64748b' }}>{type.label}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Onglet Assiduité */}
      {activeTab === 'assiduite' && (
        <div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 24 }}>
            {[
              { label: 'Étudiants Suivis', value: suiviAssiduite.length, color: '#1a5276', icon: <Users size={24} /> },
              { label: 'Alertes (< 75%)', value: suiviAssiduite.filter(s => s.alerteAssiduite).length, color: '#e74c3c', icon: <AlertTriangle size={24} /> },
              { label: 'Taux Moyen', value: `${suiviAssiduite.length > 0 ? (suiviAssiduite.reduce((sum, s) => sum + s.tauxAssiduite, 0) / suiviAssiduite.length).toFixed(1) : 0}%`, color: '#148f77', icon: <TrendingUp size={24} /> },
              { label: 'Absences Justifiées', value: suiviAssiduite.reduce((sum, s) => sum + s.nbAbsencesJustifiees, 0), color: '#7c3aed', icon: <FileText size={24} /> },
            ].map((card, idx) => (
              <div key={idx} style={{ background: '#fff', borderRadius: 14, padding: 20, boxShadow: '0 2px 10px rgba(0,0,0,0.07)', borderTop: `3px solid ${card.color}` }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <p style={{ color: '#94a3b8', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', margin: '0 0 8px' }}>{card.label}</p>
                    <p style={{ fontSize: 22, fontWeight: 900, color: card.color, margin: 0 }}>{card.value}</p>
                  </div>
                  <span style={{ color: card.color }}>{card.icon}</span>
                </div>
              </div>
            ))}
          </div>

          <div style={{ background: '#fff', borderRadius: 14, padding: 24, boxShadow: '0 2px 10px rgba(0,0,0,0.07)' }}>
            <h4 style={{ fontSize: 16, fontWeight: 700, color: '#0f172a', margin: '0 0 20px' }}>
              <Clock size={20} style={{ marginRight: 8 }} /> Suivi d'Assiduité Détaillé
            </h4>
            {suiviAssiduite.length === 0 ? (
              <div style={{ textAlign: 'center', padding: 40 }}>
                <Clock size={48} color="#cbd5e1" />
                <p style={{ color: '#94a3b8', marginTop: 12 }}>Aucune donnée d'assiduité disponible</p>
              </div>
            ) : (
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ background: '#f8fafc', borderBottom: '2px solid #e5e7eb' }}>
                    {['ID Étudiant', 'Séances', 'Présences', 'Absences', 'Retards', 'Taux', 'Alerte'].map(h => (
                      <th key={h} style={{ padding: '10px', textAlign: 'left', fontSize: 11, fontWeight: 700, color: '#64748b' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {suiviAssiduite.map((etudiant) => (
                    <tr
                      key={etudiant.etudiantId}
                      style={{
                        borderBottom: '1px solid #f1f5f9',
                        background: etudiant.alerteAssiduite ? '#fef2f2' : 'transparent'
                      }}
                    >
                      <td style={{ padding: '10px', fontSize: 13, fontWeight: 600 }}>{etudiant.etudiantId.slice(0, 8)}...</td>
                      <td style={{ padding: '10px', fontSize: 13 }}>{etudiant.totalSeances}</td>
                      <td style={{ padding: '10px', fontSize: 13, color: '#148f77', fontWeight: 600 }}>{etudiant.nbPresents}</td>
                      <td style={{ padding: '10px', fontSize: 13 }}>
                        <span style={{ color: etudiant.nbAbsences > 0 ? '#e74c3c' : '#64748b' }}>
                          {etudiant.nbAbsences} ({etudiant.nbAbsencesJustifiees}J)
                        </span>
                      </td>
                      <td style={{ padding: '10px', fontSize: 13 }}>{etudiant.nbRetards}</td>
                      <td style={{ padding: '10px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <div style={{ width: 60, background: '#e5e7eb', borderRadius: 999, height: 6, overflow: 'hidden' }}>
                            <div style={{
                              width: `${Math.min(100, etudiant.tauxAssiduite)}%`,
                              height: '100%',
                              background: etudiant.tauxAssiduite >= 75 ? '#148f77' : etudiant.tauxAssiduite >= 50 ? '#f59e0b' : '#e74c3c',
                            }} />
                          </div>
                          <span style={{ fontSize: 11, fontWeight: 700, color: etudiant.tauxAssiduite >= 75 ? '#148f77' : '#e74c3c' }}>
                            {etudiant.tauxAssiduite.toFixed(1)}%
                          </span>
                        </div>
                      </td>
                      <td style={{ padding: '10px' }}>
                        {etudiant.alerteAssiduite && (
                          <span style={{
                            padding: '4px 8px',
                            background: '#fee2e2',
                            color: '#991b1b',
                            borderRadius: 4,
                            fontSize: 11,
                            fontWeight: 700,
                            display: 'flex',
                            alignItems: 'center',
                            gap: 4
                          }}>
                            <AlertTriangle size={12} /> Alerte
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default RPManagementPage;
