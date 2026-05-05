import React, { useState, useEffect } from 'react';
import { academicApi } from '../../api/client';
import { useAuthStore } from '../../store/authStore';
import toast from 'react-hot-toast';
import { 
  GraduationCap, BookOpen, Users, Calendar, FileText, Award, 
  Plus, Edit2, Trash2, Save, X, Search, Filter, Download,
  UserPlus, BookMarked, ClipboardList, TrendingUp, CheckCircle
} from 'lucide-react';

type Tab = 'parcours' | 'ue' | 'etudiants' | 'inscriptions' | 'notes' | 'stats';

export const AcademicManagementPage: React.FC = () => {
  const { user } = useAuthStore();
  const tid = user?.tenantId || '';
  const [activeTab, setActiveTab] = useState<Tab>('parcours');
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // États pour Parcours
  const [parcours, setParcours] = useState<any[]>([]);
  const [departements, setDepartements] = useState<any[]>([]);
  const [showParcoursForm, setShowParcoursForm] = useState(false);
  const [parcoursForm, setParcoursForm] = useState({
    id: '', departementId: '', code: '', nom: '', niveau: 'Licence', 
    dureeAnnees: 3, description: ''
  });

  // États pour UE
  const [ues, setUes] = useState<any[]>([]);
  const [selectedParcours, setSelectedParcours] = useState('');
  const [showUEForm, setShowUEForm] = useState(false);
  const [ueForm, setUEForm] = useState({
    id: '', parcoursId: '', code: '', intitule: '', creditsEcts: 3,
    coefficient: 1, volumeCm: 20, volumeTd: 20, volumeTp: 0,
    semestre: 1, anneeNiveau: 1, typeUe: 'obligatoire'
  });

  // États pour Étudiants
  const [etudiants, setEtudiants] = useState<any[]>([]);
  const [showEtudiantForm, setShowEtudiantForm] = useState(false);
  const [etudiantForm, setEtudiantForm] = useState({
    id: '', matricule: '', nom: '', prenom: '', dateNaissance: '',
    sexe: 'M', nationalite: 'Malagasy', email: '', telephone: '',
    adresse: '', nomParent: '', telephoneParent: ''
  });

  // Chargement initial
  useEffect(() => {
    if (!tid) return;
    loadDepartements();
    loadParcours();
  }, [tid]);

  useEffect(() => {
    if (activeTab === 'ue' && selectedParcours) {
      loadUEs();
    } else if (activeTab === 'etudiants') {
      loadEtudiants();
    }
  }, [activeTab, selectedParcours]);

  const loadDepartements = async () => {
    try {
      const { data } = await academicApi.getDepartements(tid);
      setDepartements(data);
    } catch (err) {
      console.error('Erreur chargement départements', err);
    }
  };

  const loadParcours = async () => {
    try {
      const { data } = await academicApi.getParcours(tid);
      setParcours(data);
    } catch (err) {
      console.error('Erreur chargement parcours', err);
    }
  };

  const loadUEs = async () => {
    try {
      const { data } = await academicApi.getUE(tid, selectedParcours);
      setUes(data);
    } catch (err) {
      console.error('Erreur chargement UE', err);
    }
  };

  const loadEtudiants = async () => {
    try {
      const { data } = await academicApi.getEtudiants(tid);
      setEtudiants(data);
    } catch (err) {
      console.error('Erreur chargement étudiants', err);
    }
  };

  // Gestion Parcours
  const handleSaveParcours = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (parcoursForm.id) {
        await academicApi.updateParcours(tid, parcoursForm.id, parcoursForm);
        toast.success('Parcours mis à jour');
      } else {
        await academicApi.createParcours(tid, parcoursForm);
        toast.success('Parcours créé');
      }
      loadParcours();
      setShowParcoursForm(false);
      resetParcoursForm();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Erreur');
    } finally {
      setLoading(false);
    }
  };

  const resetParcoursForm = () => {
    setParcoursForm({
      id: '', departementId: '', code: '', nom: '', niveau: 'Licence',
      dureeAnnees: 3, description: ''
    });
  };

  // Gestion UE
  const handleSaveUE = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (ueForm.id) {
        await academicApi.updateUE(tid, ueForm.id, ueForm);
        toast.success('UE mise à jour');
      } else {
        await academicApi.createUE(tid, { ...ueForm, parcoursId: selectedParcours });
        toast.success('UE créée');
      }
      loadUEs();
      setShowUEForm(false);
      resetUEForm();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Erreur');
    } finally {
      setLoading(false);
    }
  };

  const resetUEForm = () => {
    setUEForm({
      id: '', parcoursId: '', code: '', intitule: '', creditsEcts: 3,
      coefficient: 1, volumeCm: 20, volumeTd: 20, volumeTp: 0,
      semestre: 1, anneeNiveau: 1, typeUe: 'obligatoire'
    });
  };

  // Gestion Étudiants
  const handleSaveEtudiant = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (etudiantForm.id) {
        await academicApi.updateEtudiant(tid, etudiantForm.id, etudiantForm);
        toast.success('Étudiant mis à jour');
      } else {
        await academicApi.createEtudiant(tid, etudiantForm);
        toast.success('Étudiant créé');
      }
      loadEtudiants();
      setShowEtudiantForm(false);
      resetEtudiantForm();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Erreur');
    } finally {
      setLoading(false);
    }
  };

  const resetEtudiantForm = () => {
    setEtudiantForm({
      id: '', matricule: '', nom: '', prenom: '', dateNaissance: '',
      sexe: 'M', nationalite: 'Malagasy', email: '', telephone: '',
      adresse: '', nomParent: '', telephoneParent: ''
    });
  };

  // Filtrage
  const filteredParcours = parcours.filter(p => 
    p.nom?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.code?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredUEs = ues.filter(u =>
    u.intitule?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.code?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredEtudiants = etudiants.filter(e =>
    e.nom?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    e.prenom?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    e.matricule?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const tabs = [
    { id: 'parcours', label: 'Parcours', icon: <GraduationCap size={18} /> },
    { id: 'ue', label: 'Unités d\'Enseignement', icon: <BookOpen size={18} /> },
    { id: 'etudiants', label: 'Étudiants', icon: <Users size={18} /> },
    { id: 'inscriptions', label: 'Inscriptions', icon: <UserPlus size={18} /> },
    { id: 'notes', label: 'Notes', icon: <Award size={18} /> },
    { id: 'stats', label: 'Statistiques', icon: <TrendingUp size={18} /> },
  ];

  return (
    <div style={{ padding: 32, background: '#F5F5F0', minHeight: '100vh' }}>
      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 28, fontWeight: 900, color: '#0f172a', margin: '0 0 8px', display: 'flex', alignItems: 'center', gap: 12 }}>
          <BookMarked size={32} /> Gestion Académique
        </h1>
        <p style={{ color: '#64748b', fontSize: 14 }}>
          Gestion complète des parcours, UE, étudiants, inscriptions et notes
        </p>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 24, overflowX: 'auto', paddingBottom: 8 }}>
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as Tab)}
            style={{
              padding: '12px 20px',
              background: activeTab === tab.id ? 'linear-gradient(135deg, #1a5276, #148f77)' : '#fff',
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

      {/* Barre de recherche et actions */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 20 }}>
        <div style={{ flex: 1, position: 'relative' }}>
          <Search size={18} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
          <input
            type="text"
            placeholder="Rechercher..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            style={{
              width: '100%',
              padding: '12px 14px 12px 44px',
              border: '2px solid #e5e7eb',
              borderRadius: 10,
              fontSize: 14,
              outline: 'none'
            }}
          />
        </div>
        {activeTab === 'parcours' && (
          <button
            onClick={() => { resetParcoursForm(); setShowParcoursForm(true); }}
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
            <Plus size={18} /> Nouveau Parcours
          </button>
        )}
        {activeTab === 'ue' && selectedParcours && (
          <button
            onClick={() => { resetUEForm(); setShowUEForm(true); }}
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
            <Plus size={18} /> Nouvelle UE
          </button>
        )}
        {activeTab === 'etudiants' && (
          <button
            onClick={() => { resetEtudiantForm(); setShowEtudiantForm(true); }}
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
            <Plus size={18} /> Nouvel Étudiant
          </button>
        )}
      </div>

      {/* Contenu Parcours */}
      {activeTab === 'parcours' && (
        <div>
          {showParcoursForm && (
            <ParcoursFormComponent
              form={parcoursForm}
              setForm={setParcoursForm}
              departements={departements}
              onSubmit={handleSaveParcours}
              onCancel={() => setShowParcoursForm(false)}
              loading={loading}
            />
          )}
          <ParcoursListComponent
            parcours={filteredParcours}
            departements={departements}
            onEdit={(p) => { setParcoursForm(p); setShowParcoursForm(true); }}
          />
        </div>
      )}

      {/* Contenu UE */}
      {activeTab === 'ue' && (
        <UEManagementComponent
          parcours={parcours}
          selectedParcours={selectedParcours}
          setSelectedParcours={setSelectedParcours}
          ues={filteredUEs}
          showForm={showUEForm}
          setShowForm={setShowUEForm}
          form={ueForm}
          setForm={setUEForm}
          onSubmit={handleSaveUE}
          loading={loading}
        />
      )}

      {/* Contenu Étudiants */}
      {activeTab === 'etudiants' && (
        <div>
          {showEtudiantForm && (
            <EtudiantFormComponent
              form={etudiantForm}
              setForm={setEtudiantForm}
              onSubmit={handleSaveEtudiant}
              onCancel={() => setShowEtudiantForm(false)}
              loading={loading}
            />
          )}
          <EtudiantListComponent
            etudiants={filteredEtudiants}
            onEdit={(e) => { setEtudiantForm(e); setShowEtudiantForm(true); }}
          />
        </div>
      )}

      {/* Autres onglets */}
      {activeTab === 'inscriptions' && (
        <div style={{ background: '#fff', borderRadius: 14, padding: 40, textAlign: 'center' }}>
          <UserPlus size={48} color="#cbd5e1" />
          <p style={{ color: '#94a3b8', marginTop: 12 }}>Module Inscriptions en développement</p>
        </div>
      )}

      {activeTab === 'notes' && (
        <div style={{ background: '#fff', borderRadius: 14, padding: 40, textAlign: 'center' }}>
          <Award size={48} color="#cbd5e1" />
          <p style={{ color: '#94a3b8', marginTop: 12 }}>Utilisez la page "Saisie des Notes" pour gérer les notes</p>
        </div>
      )}

      {activeTab === 'stats' && (
        <StatsComponent parcours={parcours} etudiants={etudiants} ues={ues} />
      )}
    </div>
  );
};

// Composants auxiliaires
const ParcoursFormComponent: React.FC<any> = ({ form, setForm, departements, onSubmit, onCancel, loading }) => (
  <div style={{ background: '#fff', borderRadius: 14, padding: 24, marginBottom: 20, boxShadow: '0 2px 10px rgba(0,0,0,0.07)' }}>
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
      <h3 style={{ fontSize: 18, fontWeight: 700, color: '#0f172a', margin: 0 }}>
        {form.id ? 'Modifier le Parcours' : 'Nouveau Parcours'}
      </h3>
      <button onClick={onCancel} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
        <X size={24} color="#64748b" />
      </button>
    </div>
    <form onSubmit={onSubmit}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 16 }}>
        <div>
          <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 6 }}>Code *</label>
          <input
            type="text"
            required
            value={form.code}
            onChange={e => setForm((f: any) => ({ ...f, code: e.target.value }))}
            style={{ width: '100%', padding: '11px 14px', border: '2px solid #e5e7eb', borderRadius: 9, fontSize: 14 }}
          />
        </div>
        <div>
          <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 6 }}>Nom *</label>
          <input
            type="text"
            required
            value={form.nom}
            onChange={e => setForm((f: any) => ({ ...f, nom: e.target.value }))}
            style={{ width: '100%', padding: '11px 14px', border: '2px solid #e5e7eb', borderRadius: 9, fontSize: 14 }}
          />
        </div>
        <div>
          <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 6 }}>Département *</label>
          <select
            required
            value={form.departementId}
            onChange={e => setForm((f: any) => ({ ...f, departementId: e.target.value }))}
            style={{ width: '100%', padding: '11px 14px', border: '2px solid #e5e7eb', borderRadius: 9, fontSize: 14, background: '#fff' }}
          >
            <option value="">Sélectionner</option>
            {departements.map((d: any) => <option key={d.id} value={d.id}>{d.nom}</option>)}
          </select>
        </div>
        <div>
          <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 6 }}>Niveau</label>
          <select
            value={form.niveau}
            onChange={e => setForm((f: any) => ({ ...f, niveau: e.target.value }))}
            style={{ width: '100%', padding: '11px 14px', border: '2px solid #e5e7eb', borderRadius: 9, fontSize: 14, background: '#fff' }}
          >
            <option value="Licence">Licence</option>
            <option value="Master">Master</option>
            <option value="Doctorat">Doctorat</option>
          </select>
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
          <Save size={18} /> {loading ? 'Enregistrement...' : 'Enregistrer'}
        </button>
        <button
          type="button"
          onClick={onCancel}
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
);

const ParcoursListComponent: React.FC<any> = ({ parcours, departements, onEdit }) => (
  <div style={{ background: '#fff', borderRadius: 14, padding: 24, boxShadow: '0 2px 10px rgba(0,0,0,0.07)' }}>
    <h3 style={{ fontSize: 16, fontWeight: 700, color: '#0f172a', marginBottom: 20 }}>
      Liste des Parcours ({parcours.length})
    </h3>
    {parcours.length === 0 ? (
      <div style={{ textAlign: 'center', padding: 40 }}>
        <GraduationCap size={48} color="#cbd5e1" />
        <p style={{ color: '#94a3b8', marginTop: 12 }}>Aucun parcours trouvé</p>
      </div>
    ) : (
      <div style={{ display: 'grid', gap: 12 }}>
        {parcours.map((p: any) => (
          <div key={p.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: 16, background: '#f8fafc', borderRadius: 10, border: '1px solid #e5e7eb' }}>
            <div>
              <div style={{ fontSize: 15, fontWeight: 700, color: '#0f172a', marginBottom: 4 }}>
                {p.code} - {p.nom}
              </div>
              <div style={{ fontSize: 12, color: '#64748b' }}>
                {p.niveau} · {p.dureeAnnees} ans · {departements.find((d: any) => d.id === p.departementId)?.nom || 'N/A'}
              </div>
            </div>
            <button
              onClick={() => onEdit(p)}
              style={{ padding: '8px 12px', background: '#fff', border: '1px solid #e5e7eb', borderRadius: 8, cursor: 'pointer' }}
            >
              <Edit2 size={16} color="#1a5276" />
            </button>
          </div>
        ))}
      </div>
    )}
  </div>
);

const UEManagementComponent: React.FC<any> = ({ parcours, selectedParcours, setSelectedParcours, ues, showForm, setShowForm, form, setForm, onSubmit, loading }) => (
  <div>
    <div style={{ marginBottom: 20 }}>
      <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 8 }}>
        Sélectionner un parcours
      </label>
      <select
        value={selectedParcours}
        onChange={e => setSelectedParcours(e.target.value)}
        style={{ width: '100%', maxWidth: 400, padding: '12px 14px', border: '2px solid #e5e7eb', borderRadius: 10, fontSize: 14, background: '#fff' }}
      >
        <option value="">— Choisir un parcours —</option>
        {parcours.map((p: any) => <option key={p.id} value={p.id}>{p.code} - {p.nom}</option>)}
      </select>
    </div>

    {selectedParcours && (
      <>
        {showForm && (
          <UEFormComponent
            form={form}
            setForm={setForm}
            onSubmit={onSubmit}
            onCancel={() => setShowForm(false)}
            loading={loading}
          />
        )}
        <UEListComponent ues={ues} onEdit={(u: any) => { setForm(u); setShowForm(true); }} />
      </>
    )}
  </div>
);

const UEFormComponent: React.FC<any> = ({ form, setForm, onSubmit, onCancel, loading }) => (
  <div style={{ background: '#fff', borderRadius: 14, padding: 24, marginBottom: 20, boxShadow: '0 2px 10px rgba(0,0,0,0.07)' }}>
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
      <h3 style={{ fontSize: 18, fontWeight: 700, color: '#0f172a', margin: 0 }}>
        {form.id ? 'Modifier l\'UE' : 'Nouvelle UE'}
      </h3>
      <button onClick={onCancel} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
        <X size={24} color="#64748b" />
      </button>
    </div>
    <form onSubmit={onSubmit}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
        <div>
          <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 6 }}>Code *</label>
          <input
            type="text"
            required
            value={form.code}
            onChange={e => setForm((f: any) => ({ ...f, code: e.target.value }))}
            style={{ width: '100%', padding: '11px 14px', border: '2px solid #e5e7eb', borderRadius: 9, fontSize: 14 }}
          />
        </div>
        <div style={{ gridColumn: 'span 2' }}>
          <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 6 }}>Intitulé *</label>
          <input
            type="text"
            required
            value={form.intitule}
            onChange={e => setForm((f: any) => ({ ...f, intitule: e.target.value }))}
            style={{ width: '100%', padding: '11px 14px', border: '2px solid #e5e7eb', borderRadius: 9, fontSize: 14 }}
          />
        </div>
        <div>
          <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 6 }}>Crédits ECTS</label>
          <input
            type="number"
            min="1"
            value={form.creditsEcts}
            onChange={e => setForm((f: any) => ({ ...f, creditsEcts: Number(e.target.value) }))}
            style={{ width: '100%', padding: '11px 14px', border: '2px solid #e5e7eb', borderRadius: 9, fontSize: 14 }}
          />
        </div>
        <div>
          <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 6 }}>Coefficient</label>
          <input
            type="number"
            step="0.5"
            min="0.5"
            value={form.coefficient}
            onChange={e => setForm((f: any) => ({ ...f, coefficient: Number(e.target.value) }))}
            style={{ width: '100%', padding: '11px 14px', border: '2px solid #e5e7eb', borderRadius: 9, fontSize: 14 }}
          />
        </div>
        <div>
          <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 6 }}>Semestre</label>
          <select
            value={form.semestre}
            onChange={e => setForm((f: any) => ({ ...f, semestre: Number(e.target.value) }))}
            style={{ width: '100%', padding: '11px 14px', border: '2px solid #e5e7eb', borderRadius: 9, fontSize: 14, background: '#fff' }}
          >
            {[1, 2, 3, 4, 5, 6].map(s => <option key={s} value={s}>S{s}</option>)}
          </select>
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
          <Save size={18} /> {loading ? 'Enregistrement...' : 'Enregistrer'}
        </button>
        <button
          type="button"
          onClick={onCancel}
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
);

const UEListComponent: React.FC<any> = ({ ues, onEdit }) => (
  <div style={{ background: '#fff', borderRadius: 14, padding: 24, boxShadow: '0 2px 10px rgba(0,0,0,0.07)' }}>
    <h3 style={{ fontSize: 16, fontWeight: 700, color: '#0f172a', marginBottom: 20 }}>
      Unités d'Enseignement ({ues.length})
    </h3>
    {ues.length === 0 ? (
      <div style={{ textAlign: 'center', padding: 40 }}>
        <BookOpen size={48} color="#cbd5e1" />
        <p style={{ color: '#94a3b8', marginTop: 12 }}>Aucune UE trouvée</p>
      </div>
    ) : (
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ background: '#f8fafc', borderBottom: '2px solid #e5e7eb' }}>
            {['Code', 'Intitulé', 'Crédits', 'Coef.', 'Semestre', 'Actions'].map(h => (
              <th key={h} style={{ padding: '12px', textAlign: 'left', fontSize: 12, fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {ues.map((u: any) => (
            <tr key={u.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
              <td style={{ padding: '14px', fontSize: 13, fontWeight: 600, color: '#1a5276' }}>{u.code}</td>
              <td style={{ padding: '14px', fontSize: 13 }}>{u.intitule}</td>
              <td style={{ padding: '14px', fontSize: 13 }}>{u.creditsEcts}</td>
              <td style={{ padding: '14px', fontSize: 13 }}>{u.coefficient}</td>
              <td style={{ padding: '14px', fontSize: 13 }}>S{u.semestre}</td>
              <td style={{ padding: '14px' }}>
                <button
                  onClick={() => onEdit(u)}
                  style={{ padding: '6px 10px', background: '#fff', border: '1px solid #e5e7eb', borderRadius: 6, cursor: 'pointer' }}
                >
                  <Edit2 size={14} color="#1a5276" />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    )}
  </div>
);

const EtudiantFormComponent: React.FC<any> = ({ form, setForm, onSubmit, onCancel, loading }) => (
  <div style={{ background: '#fff', borderRadius: 14, padding: 24, marginBottom: 20, boxShadow: '0 2px 10px rgba(0,0,0,0.07)' }}>
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
      <h3 style={{ fontSize: 18, fontWeight: 700, color: '#0f172a', margin: 0 }}>
        {form.id ? 'Modifier l\'Étudiant' : 'Nouvel Étudiant'}
      </h3>
      <button onClick={onCancel} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
        <X size={24} color="#64748b" />
      </button>
    </div>
    <form onSubmit={onSubmit}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
        <div>
          <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 6 }}>Matricule *</label>
          <input
            type="text"
            required
            value={form.matricule}
            onChange={e => setForm((f: any) => ({ ...f, matricule: e.target.value }))}
            style={{ width: '100%', padding: '11px 14px', border: '2px solid #e5e7eb', borderRadius: 9, fontSize: 14 }}
          />
        </div>
        <div>
          <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 6 }}>Nom *</label>
          <input
            type="text"
            required
            value={form.nom}
            onChange={e => setForm((f: any) => ({ ...f, nom: e.target.value }))}
            style={{ width: '100%', padding: '11px 14px', border: '2px solid #e5e7eb', borderRadius: 9, fontSize: 14 }}
          />
        </div>
        <div>
          <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 6 }}>Prénom *</label>
          <input
            type="text"
            required
            value={form.prenom}
            onChange={e => setForm((f: any) => ({ ...f, prenom: e.target.value }))}
            style={{ width: '100%', padding: '11px 14px', border: '2px solid #e5e7eb', borderRadius: 9, fontSize: 14 }}
          />
        </div>
        <div>
          <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 6 }}>Date de Naissance *</label>
          <input
            type="date"
            required
            value={form.dateNaissance}
            onChange={e => setForm((f: any) => ({ ...f, dateNaissance: e.target.value }))}
            style={{ width: '100%', padding: '11px 14px', border: '2px solid #e5e7eb', borderRadius: 9, fontSize: 14 }}
          />
        </div>
        <div>
          <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 6 }}>Email</label>
          <input
            type="email"
            value={form.email}
            onChange={e => setForm((f: any) => ({ ...f, email: e.target.value }))}
            style={{ width: '100%', padding: '11px 14px', border: '2px solid #e5e7eb', borderRadius: 9, fontSize: 14 }}
          />
        </div>
        <div>
          <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 6 }}>Téléphone</label>
          <input
            type="tel"
            value={form.telephone}
            onChange={e => setForm((f: any) => ({ ...f, telephone: e.target.value }))}
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
          <Save size={18} /> {loading ? 'Enregistrement...' : 'Enregistrer'}
        </button>
        <button
          type="button"
          onClick={onCancel}
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
);

const EtudiantListComponent: React.FC<any> = ({ etudiants, onEdit }) => (
  <div style={{ background: '#fff', borderRadius: 14, padding: 24, boxShadow: '0 2px 10px rgba(0,0,0,0.07)' }}>
    <h3 style={{ fontSize: 16, fontWeight: 700, color: '#0f172a', marginBottom: 20 }}>
      Liste des Étudiants ({etudiants.length})
    </h3>
    {etudiants.length === 0 ? (
      <div style={{ textAlign: 'center', padding: 40 }}>
        <Users size={48} color="#cbd5e1" />
        <p style={{ color: '#94a3b8', marginTop: 12 }}>Aucun étudiant trouvé</p>
      </div>
    ) : (
      <div style={{ display: 'grid', gap: 12 }}>
        {etudiants.map((e: any) => (
          <div key={e.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: 16, background: '#f8fafc', borderRadius: 10, border: '1px solid #e5e7eb' }}>
            <div>
              <div style={{ fontSize: 15, fontWeight: 700, color: '#0f172a', marginBottom: 4 }}>
                {e.matricule} - {e.nom} {e.prenom}
              </div>
              <div style={{ fontSize: 12, color: '#64748b' }}>
                {e.email} · {e.telephone}
              </div>
            </div>
            <button
              onClick={() => onEdit(e)}
              style={{ padding: '8px 12px', background: '#fff', border: '1px solid #e5e7eb', borderRadius: 8, cursor: 'pointer' }}
            >
              <Edit2 size={16} color="#1a5276" />
            </button>
          </div>
        ))}
      </div>
    )}
  </div>
);

const StatsComponent: React.FC<any> = ({ parcours, etudiants, ues }) => (
  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20 }}>
    {[
      { label: 'Total Parcours', value: parcours.length, color: '#1a5276', icon: <GraduationCap size={32} /> },
      { label: 'Total Étudiants', value: etudiants.length, color: '#148f77', icon: <Users size={32} /> },
      { label: 'Total UE', value: ues.length, color: '#e74c3c', icon: <BookOpen size={32} /> },
    ].map(stat => (
      <div key={stat.label} style={{ background: '#fff', borderRadius: 14, padding: 24, boxShadow: '0 2px 10px rgba(0,0,0,0.07)', borderTop: `4px solid ${stat.color}` }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <p style={{ color: '#94a3b8', fontSize: 12, fontWeight: 700, textTransform: 'uppercase', margin: '0 0 8px' }}>{stat.label}</p>
            <p style={{ fontSize: 32, fontWeight: 900, color: stat.color, margin: 0 }}>{stat.value}</p>
          </div>
          <span style={{ color: stat.color }}>{stat.icon}</span>
        </div>
      </div>
    ))}
  </div>
);

// Made with Bob
