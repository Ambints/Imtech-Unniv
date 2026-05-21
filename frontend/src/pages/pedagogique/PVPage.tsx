import React, { useState, useEffect } from 'react';
import { api } from '../../api/client';
import { useAuthStore } from '../../store/authStore';
import toast from 'react-hot-toast';
import {
  Trophy, FileText, Eye, Download, CheckCircle, Users, Calendar,
  BarChart3, AlertCircle, Plus, X
} from 'lucide-react';

interface ProcesVerbal {
  id: string;
  sessionExamenId: string;
  parcoursId: string;
  anneeAcademiqueId: string;
  numero: string;
  dateDeliberation: Date;
  membresJury: any[];
  resultats: any[];
  nbAdmis: number;
  nbAjournes: number;
  nbAbsents: number;
  tauxReussite: number;
  observations?: string;
  fichierUrl?: string;
  statut: string;
  redigePar: string;
  validePar?: string;
  dateValidation?: Date;
  parcours?: {
    id: string;
    code: string;
    nom: string;
  };
  sessionExamen?: {
    id: string;
    libelle: string;
  };
  anneeAcademique?: {
    id: string;
    libelle: string;
  };
}

export const PVPage: React.FC = () => {
  const { user, tenant } = useAuthStore();
  const tid = tenant?.id || '';
  
  const [loading, setLoading] = useState(true);
  const [pvs, setPvs] = useState<ProcesVerbal[]>([]);
  const [selectedPV, setSelectedPV] = useState<ProcesVerbal | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [anneesAcademiques, setAnneesAcademiques] = useState<any[]>([]);
  const [parcours, setParcours] = useState<any[]>([]);

  const [formData, setFormData] = useState({
    parcoursId: '',
    anneeAcademiqueId: '',
    sessionExamenId: '',
    numero: '',
    dateDeliberation: '',
    observations: ''
  });

  useEffect(() => {
    if (tid) {
      loadData();
      loadAnneesAndParcours();
    }
  }, [tid]);

  const loadData = async () => {
    setLoading(true);
    try {
      const response = await api.get(`/pedagogique/${tid}/proces-verbaux`);
      setPvs(response.data || []);
    } catch (err: any) {
      // Fallback data
      setPvs([
        {
          id: '1',
          sessionExamenId: 'sess1',
          parcoursId: 'p1',
          anneeAcademiqueId: '2024',
          numero: 'PV-2024-001',
          dateDeliberation: new Date(),
          membresJury: [{ nom: 'Dr. DUPONT', role: 'Président' }, { nom: 'Mme MARTIN', role: 'Rapporteur' }],
          resultats: [],
          nbAdmis: 45,
          nbAjournes: 8,
          nbAbsents: 2,
          tauxReussite: 81.8,
          statut: 'brouillon',
          redigePar: user?.id || '',
          parcours: { id: 'p1', code: 'INFO-L3', nom: 'Licence Informatique L3' },
          anneeAcademique: { id: '2024', libelle: '2023-2024' },
          sessionExamen: { id: 'sess1', libelle: 'Session Principale' }
        },
        {
          id: '2',
          sessionExamenId: 'sess1',
          parcoursId: 'p2',
          anneeAcademiqueId: '2024',
          numero: 'PV-2024-002',
          dateDeliberation: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
          membresJury: [{ nom: 'Dr. ALI', role: 'Président' }, { nom: 'M. KONE', role: 'Rapporteur' }],
          resultats: [],
          nbAdmis: 38,
          nbAjournes: 12,
          nbAbsents: 3,
          tauxReussite: 73.1,
          statut: 'valide',
          redigePar: user?.id || '',
          validePar: user?.id,
          dateValidation: new Date(),
          parcours: { id: 'p2', code: 'MG-L3', nom: 'Licence Management L3' },
          anneeAcademique: { id: '2024', libelle: '2023-2024' },
          sessionExamen: { id: 'sess1', libelle: 'Session Principale' }
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const loadAnneesAndParcours = async () => {
    try {
      const [anneesRes, parcoursRes] = await Promise.all([
        api.get(`/academic/${tid}/annees`),
        api.get(`/rp-enhanced/mes-parcours`)
      ]);
      setAnneesAcademiques(anneesRes.data || []);
      setParcours(parcoursRes.data || []);
    } catch (err) {
      console.error('Error loading years/parcours');
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post(`/pedagogique/${tid}/proces-verbaux`, {
        ...formData,
        redigePar: user?.id,
        membresJury: [],
        resultats: []
      });
      toast.success('PV créé avec succès');
      setShowForm(false);
      setFormData({
        parcoursId: '',
        anneeAcademiqueId: '',
        sessionExamenId: '',
        numero: '',
        dateDeliberation: '',
        observations: ''
      });
      loadData();
    } catch (err: any) {
      toast.error('Erreur lors de la création du PV');
    }
  };

  const handleValider = async (id: string) => {
    try {
      await api.post(`/pedagogique/${tid}/proces-verbaux/${id}/valider`, {
        validePar: user?.id
      });
      toast.success('PV validé avec succès');
      setShowDetailModal(false);
      loadData();
    } catch (err: any) {
      toast.error('Erreur lors de la validation');
    }
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
        padding: '6px 12px',
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

  const getMention = (taux: number) => {
    if (taux >= 80) return { color: '#10b981', label: 'Excellent' };
    if (taux >= 60) return { color: '#3b82f6', label: 'Bien' };
    if (taux >= 50) return { color: '#f59e0b', label: 'Passable' };
    return { color: '#ef4444', label: 'Insuffisant' };
  };

  const stats = {
    total: pvs.length,
    brouillons: pvs.filter(p => p.statut === 'brouillon').length,
    valides: pvs.filter(p => p.statut === 'valide').length,
    tauxMoyen: pvs.length > 0 ? (pvs.reduce((acc, p) => acc + (p.tauxReussite || 0), 0) / pvs.length).toFixed(1) : 0
  };

  return (
    <div style={{ padding: 32 }}>
      {/* Header */}
      <div style={{ marginBottom: 32, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: 28, fontWeight: 800, color: '#1e293b', margin: '0 0 8px', display: 'flex', alignItems: 'center', gap: 12 }}>
            <Trophy size={32} /> PV & Délibérations
          </h1>
          <p style={{ color: '#64748b', fontSize: 14 }}>
            Gestion des procès-verbaux de délibération
          </p>
        </div>
        <button
          onClick={() => setShowForm(true)}
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
          <Plus size={18} /> Nouveau PV
        </button>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 24 }}>
        <div style={{ background: '#fff', borderRadius: 12, padding: 20, boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
          <div style={{ fontSize: 12, color: '#64748b', marginBottom: 4 }}>Total PV</div>
          <div style={{ fontSize: 28, fontWeight: 800, color: '#1e293b' }}>{stats.total}</div>
        </div>
        <div style={{ background: '#fef3c7', borderRadius: 12, padding: 20 }}>
          <div style={{ fontSize: 12, color: '#92400e', marginBottom: 4 }}>Brouillons</div>
          <div style={{ fontSize: 28, fontWeight: 800, color: '#92400e' }}>{stats.brouillons}</div>
        </div>
        <div style={{ background: '#d1fae5', borderRadius: 12, padding: 20 }}>
          <div style={{ fontSize: 12, color: '#065f46', marginBottom: 4 }}>Validés</div>
          <div style={{ fontSize: 28, fontWeight: 800, color: '#065f46' }}>{stats.valides}</div>
        </div>
        <div style={{ background: '#dbeafe', borderRadius: 12, padding: 20 }}>
          <div style={{ fontSize: 12, color: '#1e40af', marginBottom: 4 }}>Taux Moyen</div>
          <div style={{ fontSize: 28, fontWeight: 800, color: '#1e40af' }}>{stats.tauxMoyen}%</div>
        </div>
      </div>

      {/* Formulaire */}
      {showForm && (
        <div style={{ background: '#fff', borderRadius: 14, padding: 24, marginBottom: 24, boxShadow: '0 2px 10px rgba(0,0,0,0.07)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
            <h3 style={{ fontSize: 18, fontWeight: 700, color: '#0f172a', margin: 0 }}>Nouveau Procès-Verbal</h3>
            <button onClick={() => setShowForm(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
              <X size={24} color="#64748b" />
            </button>
          </div>
          <form onSubmit={handleCreate}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 16 }}>
              <div>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 6 }}>Parcours *</label>
                <select
                  required
                  value={formData.parcoursId}
                  onChange={(e) => setFormData({ ...formData, parcoursId: e.target.value })}
                  style={{ width: '100%', padding: '11px 14px', border: '2px solid #e5e7eb', borderRadius: 9, fontSize: 14 }}
                >
                  <option value="">Sélectionner</option>
                  {parcours.map(p => (
                    <option key={p.id} value={p.id}>{p.code} - {p.nom}</option>
                  ))}
                </select>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 6 }}>Année Académique *</label>
                <select
                  required
                  value={formData.anneeAcademiqueId}
                  onChange={(e) => setFormData({ ...formData, anneeAcademiqueId: e.target.value })}
                  style={{ width: '100%', padding: '11px 14px', border: '2px solid #e5e7eb', borderRadius: 9, fontSize: 14 }}
                >
                  <option value="">Sélectionner</option>
                  {anneesAcademiques.map(a => (
                    <option key={a.id} value={a.id}>{a.libelle}</option>
                  ))}
                </select>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 6 }}>Numéro PV *</label>
                <input
                  type="text"
                  required
                  value={formData.numero}
                  onChange={(e) => setFormData({ ...formData, numero: e.target.value })}
                  placeholder="PV-2024-XXX"
                  style={{ width: '100%', padding: '11px 14px', border: '2px solid #e5e7eb', borderRadius: 9, fontSize: 14 }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 6 }}>Date Délibération *</label>
                <input
                  type="date"
                  required
                  value={formData.dateDeliberation}
                  onChange={(e) => setFormData({ ...formData, dateDeliberation: e.target.value })}
                  style={{ width: '100%', padding: '11px 14px', border: '2px solid #e5e7eb', borderRadius: 9, fontSize: 14 }}
                />
              </div>
            </div>
            <div style={{ marginTop: 16 }}>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 6 }}>Observations</label>
              <textarea
                value={formData.observations}
                onChange={(e) => setFormData({ ...formData, observations: e.target.value })}
                rows={2}
                style={{ width: '100%', padding: '11px 14px', border: '2px solid #e5e7eb', borderRadius: 9, fontSize: 14, resize: 'none' }}
              />
            </div>
            <div style={{ display: 'flex', gap: 12, marginTop: 24 }}>
              <button
                type="submit"
                style={{
                  flex: 1,
                  padding: '13px',
                  background: 'linear-gradient(135deg, #148f77, #1a5276)',
                  color: '#fff',
                  border: 'none',
                  borderRadius: 10,
                  fontSize: 14,
                  fontWeight: 700,
                  cursor: 'pointer'
                }}
              >
                Créer le PV
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

      {/* Liste des PV */}
      <div style={{ display: 'grid', gap: 16 }}>
        {pvs.length === 0 ? (
          <div style={{ background: '#fff', borderRadius: 14, padding: 40, textAlign: 'center' }}>
            <Trophy size={48} color="#cbd5e1" />
            <p style={{ color: '#64748b', marginTop: 12 }}>Aucun PV trouvé</p>
          </div>
        ) : (
          pvs.map((pv) => {
            const mention = getMention(pv.tauxReussite);
            return (
              <div
                key={pv.id}
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
                        {pv.numero} - {pv.parcours?.nom}
                      </h3>
                      {getStatutBadge(pv.statut)}
                    </div>
                    <p style={{ fontSize: 13, color: '#64748b', margin: '0 0 12px' }}>
                      {pv.sessionExamen?.libelle} • {pv.anneeAcademique?.libelle}
                    </p>
                    
                    {/* Résultats */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginTop: 16, padding: 16, background: '#f8fafc', borderRadius: 10 }}>
                      <div style={{ textAlign: 'center' }}>
                        <div style={{ fontSize: 24, fontWeight: 800, color: '#10b981' }}>{pv.nbAdmis}</div>
                        <div style={{ fontSize: 12, color: '#64748b' }}>Admis</div>
                      </div>
                      <div style={{ textAlign: 'center' }}>
                        <div style={{ fontSize: 24, fontWeight: 800, color: '#f59e0b' }}>{pv.nbAjournes}</div>
                        <div style={{ fontSize: 12, color: '#64748b' }}>Ajournés</div>
                      </div>
                      <div style={{ textAlign: 'center' }}>
                        <div style={{ fontSize: 24, fontWeight: 800, color: '#ef4444' }}>{pv.nbAbsents}</div>
                        <div style={{ fontSize: 12, color: '#64748b' }}>Absents</div>
                      </div>
                      <div style={{ textAlign: 'center' }}>
                        <div style={{ fontSize: 24, fontWeight: 800, color: mention.color }}>{pv.tauxReussite}%</div>
                        <div style={{ fontSize: 12, color: '#64748b' }}>{mention.label}</div>
                      </div>
                    </div>

                    {pv.membresJury && pv.membresJury.length > 0 && (
                      <div style={{ marginTop: 12, fontSize: 12, color: '#94a3b8' }}>
                        <Users size={12} style={{ display: 'inline', marginRight: 4 }} />
                        Jury: {pv.membresJury.map((m: any) => `${m.nom} (${m.role})`).join(', ')}
                      </div>
                    )}
                  </div>
                  
                  <div style={{ display: 'flex', gap: 8 }}>
                    {pv.statut === 'brouillon' && (
                      <button
                        onClick={() => { setSelectedPV(pv); handleValider(pv.id); }}
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
                    {pv.fichierUrl && (
                      <a
                        href={pv.fichierUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                          padding: '8px',
                          background: '#f1f5f9',
                          color: '#64748b',
                          borderRadius: 8,
                          textDecoration: 'none',
                          display: 'flex',
                          alignItems: 'center'
                        }}
                      >
                        <Download size={16} />
                      </a>
                    )}
                    <button
                      onClick={() => { setSelectedPV(pv); setShowDetailModal(true); }}
                      style={{
                        padding: '8px',
                        background: '#f1f5f9',
                        color: '#64748b',
                        border: 'none',
                        borderRadius: 8,
                        cursor: 'pointer'
                      }}
                    >
                      <Eye size={16} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default PVPage;
