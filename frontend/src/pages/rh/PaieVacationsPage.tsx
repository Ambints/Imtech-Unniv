import React, { useState, useEffect } from 'react';
import { api } from '../../api/client';
import { useAuthStore } from '../../store/authStore';
import toast from 'react-hot-toast';
import {
  CreditCard, Plus, Search, Download, Eye, Calendar, DollarSign,
  Clock, CheckCircle, X, Save, FileText, TrendingUp
} from 'lucide-react';

interface FichePaie {
  id: string;
  contratId: string;
  annee: number;
  mois: number;
  salaireBrut: number;
  cotisations: number;
  primes: number;
  retenues: number;
  netAPayer: number;
  heuresSupp: number;
  montantHeuresSupp: number;
  statut: string;
  poste?: string;
  utilisateurNom?: string;
  utilisateurPrenom?: string;
}

interface HeureComplementaire {
  id: string;
  enseignantId: string;
  dateTravail: string;
  nbHeures: number;
  tauxHoraire: number;
  motif: string;
  statut: 'saisie' | 'valide';
  nom?: string;
  prenom?: string;
  validePar?: string;
  dateValidation?: string;
}

export const PaieVacationsPage: React.FC = () => {
  const { user, tenant } = useAuthStore();
  const [activeTab, setActiveTab] = useState<'fiches' | 'heures'>('fiches');
  const [loading, setLoading] = useState(true);
  const [fichesPaie, setFichesPaie] = useState<FichePaie[]>([]);
  const [heuresComp, setHeuresComp] = useState<HeureComplementaire[]>([]);
  const [showFicheForm, setShowFicheForm] = useState(false);
  const [showHeureForm, setShowHeureForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const [ficheFormData, setFicheFormData] = useState({
    contratId: '',
    annee: new Date().getFullYear(),
    mois: new Date().getMonth() + 1,
    salaireBrut: 0,
    primes: 0,
    retenues: 0,
    heuresSupp: 0,
    montantHeuresSupp: 0
  });

  const [heureFormData, setHeureFormData] = useState({
    enseignantId: '',
    dateTravail: new Date().toISOString().split('T')[0],
    nbHeures: 0,
    tauxHoraire: 15000,
    motif: ''
  });

  useEffect(() => {
    loadData();
  }, [activeTab]);

  const loadData = async () => {
    setLoading(true);
    try {
      if (activeTab === 'fiches') {
        const response = await api.get('/rh/fiches-paie');
        setFichesPaie(response.data || []);
      } else {
        const response = await api.get('/rh/heures-complementaires');
        setHeuresComp(response.data || []);
      }
    } catch (error: any) {
      toast.error('Erreur lors du chargement des données');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleFicheSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await api.post('/rh/fiches-paie', ficheFormData);
      toast.success('Fiche de paie créée avec succès');
      setShowFicheForm(false);
      resetFicheForm();
      loadData();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Erreur lors de l\'enregistrement');
    } finally {
      setLoading(false);
    }
  };

  const handleHeureSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await api.post('/rh/heures-complementaires', heureFormData);
      toast.success('Heures complémentaires enregistrées');
      setShowHeureForm(false);
      resetHeureForm();
      loadData();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Erreur lors de l\'enregistrement');
    } finally {
      setLoading(false);
    }
  };

  const handleValiderHeure = async (id: string) => {
    try {
      await api.patch(`/rh/heures-complementaires/${id}/valider`, {
        validePar: user?.id
      });
      toast.success('Heures validées');
      loadData();
    } catch (error: any) {
      toast.error('Erreur lors de la validation');
    }
  };

  const handleValiderFiche = async (id: string) => {
    try {
      await api.post(`/rh/fiches-paie/${id}/valider`);
      toast.success('Fiche de paie validée');
      loadData();
    } catch (error: any) {
      toast.error('Erreur lors de la validation');
    }
  };

  const handleGenererMasse = async () => {
    const annee = prompt('Année :');
    const mois = prompt('Mois (1-12) :');
    if (!annee || !mois) return;

    try {
      const response = await api.get('/rh/fiches-paie/masse', {
        params: { annee: parseInt(annee), mois: parseInt(mois) }
      });
      toast.success(`${response.data.generees} fiches générées`);
      loadData();
    } catch (error: any) {
      toast.error('Erreur lors de la génération');
    }
  };

  const resetFicheForm = () => {
    setFicheFormData({
      contratId: '',
      annee: new Date().getFullYear(),
      mois: new Date().getMonth() + 1,
      salaireBrut: 0,
      primes: 0,
      retenues: 0,
      heuresSupp: 0,
      montantHeuresSupp: 0
    });
  };

  const resetHeureForm = () => {
    setHeureFormData({
      enseignantId: '',
      dateTravail: new Date().toISOString().split('T')[0],
      nbHeures: 0,
      tauxHoraire: 15000,
      motif: ''
    });
  };

  const filteredFiches = fichesPaie.filter(f => {
    const searchLower = searchTerm.toLowerCase();
    return (
      f.utilisateurNom?.toLowerCase().includes(searchLower) ||
      f.utilisateurPrenom?.toLowerCase().includes(searchLower) ||
      f.poste?.toLowerCase().includes(searchLower)
    );
  });

  const filteredHeures = heuresComp.filter(h => {
    const searchLower = searchTerm.toLowerCase();
    return (
      h.nom?.toLowerCase().includes(searchLower) ||
      h.prenom?.toLowerCase().includes(searchLower)
    );
  });

  const statsFiches = {
    total: fichesPaie.length,
    masseSalariale: fichesPaie.reduce((sum, f) => sum + f.netAPayer, 0),
    brouillon: fichesPaie.filter(f => f.statut === 'brouillon').length,
    valide: fichesPaie.filter(f => f.statut === 'valide').length
  };

  const statsHeures = {
    total: heuresComp.length,
    totalHeures: heuresComp.reduce((sum, h) => sum + h.nbHeures, 0),
    coutTotal: heuresComp.reduce((sum, h) => sum + (h.nbHeures * h.tauxHoraire), 0),
    enAttente: heuresComp.filter(h => h.statut === 'saisie').length,
    valide: heuresComp.filter(h => h.statut === 'valide').length
  };

  const getMoisLabel = (mois: number) => {
    const moisLabels = ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 
                        'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'];
    return moisLabels[mois - 1] || mois;
  };

  return (
    <div style={{ padding: 32 }}>
      {/* Header */}
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontSize: 28, fontWeight: 800, color: '#1e293b', margin: '0 0 8px', display: 'flex', alignItems: 'center', gap: 12 }}>
          <CreditCard size={32} /> Paie & Vacations
        </h1>
        <p style={{ color: '#64748b', fontSize: 14 }}>
          Gestion des fiches de paie et heures complémentaires
        </p>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 24 }}>
        <button
          onClick={() => setActiveTab('fiches')}
          style={{
            padding: '12px 24px',
            borderRadius: 10,
            border: 'none',
            background: activeTab === 'fiches' ? 'linear-gradient(135deg, #148f77, #1a5276)' : '#f8fafc',
            color: activeTab === 'fiches' ? '#fff' : '#64748b',
            fontSize: 14,
            fontWeight: 600,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: 8
          }}
        >
          <FileText size={18} /> Fiches de Paie
        </button>
        <button
          onClick={() => setActiveTab('heures')}
          style={{
            padding: '12px 24px',
            borderRadius: 10,
            border: 'none',
            background: activeTab === 'heures' ? 'linear-gradient(135deg, #148f77, #1a5276)' : '#f8fafc',
            color: activeTab === 'heures' ? '#fff' : '#64748b',
            fontSize: 14,
            fontWeight: 600,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: 8
          }}
        >
          <Clock size={18} /> Heures Complémentaires
        </button>
      </div>

      {/* Stats */}
      {activeTab === 'fiches' ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, marginBottom: 24 }}>
          <div style={{ background: '#fff', borderRadius: 12, padding: 20, boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
            <div style={{ fontSize: 12, color: '#64748b', marginBottom: 8 }}>Total Fiches</div>
            <div style={{ fontSize: 28, fontWeight: 800, color: '#1e293b' }}>{statsFiches.total}</div>
          </div>
          <div style={{ background: '#fff', borderRadius: 12, padding: 20, boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
            <div style={{ fontSize: 12, color: '#64748b', marginBottom: 8 }}>Masse Salariale</div>
            <div style={{ fontSize: 24, fontWeight: 800, color: '#8b5cf6' }}>
              {statsFiches.masseSalariale.toLocaleString()} Ar
            </div>
          </div>
          <div style={{ background: '#fff', borderRadius: 12, padding: 20, boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
            <div style={{ fontSize: 12, color: '#64748b', marginBottom: 8 }}>Brouillon</div>
            <div style={{ fontSize: 28, fontWeight: 800, color: '#f59e0b' }}>{statsFiches.brouillon}</div>
          </div>
          <div style={{ background: '#fff', borderRadius: 12, padding: 20, boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
            <div style={{ fontSize: 12, color: '#64748b', marginBottom: 8 }}>Validées</div>
            <div style={{ fontSize: 28, fontWeight: 800, color: '#10b981' }}>{statsFiches.valide}</div>
          </div>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, marginBottom: 24 }}>
          <div style={{ background: '#fff', borderRadius: 12, padding: 20, boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
            <div style={{ fontSize: 12, color: '#64748b', marginBottom: 8 }}>Total Heures</div>
            <div style={{ fontSize: 28, fontWeight: 800, color: '#1e293b' }}>{statsHeures.totalHeures}h</div>
          </div>
          <div style={{ background: '#fff', borderRadius: 12, padding: 20, boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
            <div style={{ fontSize: 12, color: '#64748b', marginBottom: 8 }}>Coût Total</div>
            <div style={{ fontSize: 24, fontWeight: 800, color: '#8b5cf6' }}>
              {statsHeures.coutTotal.toLocaleString()} Ar
            </div>
          </div>
          <div style={{ background: '#fff', borderRadius: 12, padding: 20, boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
            <div style={{ fontSize: 12, color: '#64748b', marginBottom: 8 }}>En Attente</div>
            <div style={{ fontSize: 28, fontWeight: 800, color: '#f59e0b' }}>{statsHeures.enAttente}</div>
          </div>
          <div style={{ background: '#fff', borderRadius: 12, padding: 20, boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
            <div style={{ fontSize: 12, color: '#64748b', marginBottom: 8 }}>Validées</div>
            <div style={{ fontSize: 28, fontWeight: 800, color: '#10b981' }}>{statsHeures.valide}</div>
          </div>
        </div>
      )}

      {/* Actions */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 24, flexWrap: 'wrap' }}>
        <div style={{ flex: 1, minWidth: 250, position: 'relative' }}>
          <Search size={18} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
          <input
            type="text"
            placeholder="Rechercher..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ width: '100%', padding: '11px 11px 11px 40px', border: '2px solid #e5e7eb', borderRadius: 9, fontSize: 14 }}
          />
        </div>
        {activeTab === 'fiches' && (
          <>
            <button
              onClick={handleGenererMasse}
              style={{
                padding: '11px 20px',
                background: '#fff',
                color: '#148f77',
                border: '2px solid #148f77',
                borderRadius: 9,
                fontSize: 14,
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 8
              }}
            >
              <TrendingUp size={18} /> Génération Masse
            </button>
            <button
              onClick={() => { resetFicheForm(); setShowFicheForm(true); }}
              style={{
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
                gap: 8
              }}
            >
              <Plus size={18} /> Nouvelle Fiche
            </button>
          </>
        )}
        {activeTab === 'heures' && (
          <button
            onClick={() => { resetHeureForm(); setShowHeureForm(true); }}
            style={{
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
              gap: 8
            }}
          >
            <Plus size={18} /> Saisir Heures
          </button>
        )}
      </div>

      {/* Fiche Form Modal */}
      {showFicheForm && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: 20 }}>
          <div style={{ background: '#fff', borderRadius: 14, padding: 24, maxWidth: 600, width: '100%', maxHeight: '90vh', overflow: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <h3 style={{ fontSize: 18, fontWeight: 700, color: '#0f172a', margin: 0 }}>
                Nouvelle fiche de paie
              </h3>
              <button onClick={() => { setShowFicheForm(false); resetFicheForm(); }} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                <X size={24} color="#64748b" />
              </button>
            </div>

            <form onSubmit={handleFicheSubmit}>
              <div style={{ display: 'grid', gap: 16 }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 16 }}>
                  <div>
                    <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 6 }}>
                      Année *
                    </label>
                    <input
                      type="number"
                      required
                      value={ficheFormData.annee}
                      onChange={(e) => setFicheFormData(prev => ({ ...prev, annee: parseInt(e.target.value) }))}
                      style={{ width: '100%', padding: '11px 14px', border: '2px solid #e5e7eb', borderRadius: 9, fontSize: 14 }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 6 }}>
                      Mois *
                    </label>
                    <select
                      required
                      value={ficheFormData.mois}
                      onChange={(e) => setFicheFormData(prev => ({ ...prev, mois: parseInt(e.target.value) }))}
                      style={{ width: '100%', padding: '11px 14px', border: '2px solid #e5e7eb', borderRadius: 9, fontSize: 14 }}
                    >
                      {Array.from({ length: 12 }, (_, i) => i + 1).map(m => (
                        <option key={m} value={m}>{getMoisLabel(m)}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 6 }}>
                    Salaire brut (Ar) *
                  </label>
                  <input
                    type="number"
                    required
                    min={0}
                    value={ficheFormData.salaireBrut}
                    onChange={(e) => setFicheFormData(prev => ({ ...prev, salaireBrut: Number(e.target.value) }))}
                    style={{ width: '100%', padding: '11px 14px', border: '2px solid #e5e7eb', borderRadius: 9, fontSize: 14 }}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 16 }}>
                  <div>
                    <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 6 }}>
                      Primes (Ar)
                    </label>
                    <input
                      type="number"
                      min={0}
                      value={ficheFormData.primes}
                      onChange={(e) => setFicheFormData(prev => ({ ...prev, primes: Number(e.target.value) }))}
                      style={{ width: '100%', padding: '11px 14px', border: '2px solid #e5e7eb', borderRadius: 9, fontSize: 14 }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 6 }}>
                      Retenues (Ar)
                    </label>
                    <input
                      type="number"
                      min={0}
                      value={ficheFormData.retenues}
                      onChange={(e) => setFicheFormData(prev => ({ ...prev, retenues: Number(e.target.value) }))}
                      style={{ width: '100%', padding: '11px 14px', border: '2px solid #e5e7eb', borderRadius: 9, fontSize: 14 }}
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 16 }}>
                  <div>
                    <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 6 }}>
                      Heures supplémentaires
                    </label>
                    <input
                      type="number"
                      min={0}
                      value={ficheFormData.heuresSupp}
                      onChange={(e) => setFicheFormData(prev => ({ ...prev, heuresSupp: Number(e.target.value) }))}
                      style={{ width: '100%', padding: '11px 14px', border: '2px solid #e5e7eb', borderRadius: 9, fontSize: 14 }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 6 }}>
                      Montant heures supp (Ar)
                    </label>
                    <input
                      type="number"
                      min={0}
                      value={ficheFormData.montantHeuresSupp}
                      onChange={(e) => setFicheFormData(prev => ({ ...prev, montantHeuresSupp: Number(e.target.value) }))}
                      style={{ width: '100%', padding: '11px 14px', border: '2px solid #e5e7eb', borderRadius: 9, fontSize: 14 }}
                    />
                  </div>
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
                  <Save size={18} /> {loading ? 'Enregistrement...' : 'Créer'}
                </button>
                <button
                  type="button"
                  onClick={() => { setShowFicheForm(false); resetFicheForm(); }}
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
        </div>
      )}

      {/* Heure Form Modal */}
      {showHeureForm && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: 20 }}>
          <div style={{ background: '#fff', borderRadius: 14, padding: 24, maxWidth: 600, width: '100%' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <h3 style={{ fontSize: 18, fontWeight: 700, color: '#0f172a', margin: 0 }}>
                Saisir heures complémentaires
              </h3>
              <button onClick={() => { setShowHeureForm(false); resetHeureForm(); }} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                <X size={24} color="#64748b" />
              </button>
            </div>

            <form onSubmit={handleHeureSubmit}>
              <div style={{ display: 'grid', gap: 16 }}>
                <div>
                  <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 6 }}>
                    Date *
                  </label>
                  <input
                    type="date"
                    required
                    value={heureFormData.dateTravail}
                    onChange={(e) => setHeureFormData(prev => ({ ...prev, dateTravail: e.target.value }))}
                    style={{ width: '100%', padding: '11px 14px', border: '2px solid #e5e7eb', borderRadius: 9, fontSize: 14 }}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 16 }}>
                  <div>
                    <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 6 }}>
                      Nombre d'heures *
                    </label>
                    <input
                      type="number"
                      required
                      min={0}
                      step={0.5}
                      value={heureFormData.nbHeures}
                      onChange={(e) => setHeureFormData(prev => ({ ...prev, nbHeures: Number(e.target.value) }))}
                      style={{ width: '100%', padding: '11px 14px', border: '2px solid #e5e7eb', borderRadius: 9, fontSize: 14 }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 6 }}>
                      Taux horaire (Ar) *
                    </label>
                    <input
                      type="number"
                      required
                      min={0}
                      value={heureFormData.tauxHoraire}
                      onChange={(e) => setHeureFormData(prev => ({ ...prev, tauxHoraire: Number(e.target.value) }))}
                      style={{ width: '100%', padding: '11px 14px', border: '2px solid #e5e7eb', borderRadius: 9, fontSize: 14 }}
                    />
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 6 }}>
                    Motif *
                  </label>
                  <textarea
                    required
                    value={heureFormData.motif}
                    onChange={(e) => setHeureFormData(prev => ({ ...prev, motif: e.target.value }))}
                    rows={3}
                    style={{ width: '100%', padding: '11px 14px', border: '2px solid #e5e7eb', borderRadius: 9, fontSize: 14, resize: 'vertical' }}
                  />
                </div>

                <div style={{ padding: 12, background: '#f8fafc', borderRadius: 8 }}>
                  <div style={{ fontSize: 12, color: '#64748b', marginBottom: 4 }}>Montant total</div>
                  <div style={{ fontSize: 20, fontWeight: 700, color: '#1e293b' }}>
                    {(heureFormData.nbHeures * heureFormData.tauxHoraire).toLocaleString()} Ar
                  </div>
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
                  <Save size={18} /> {loading ? 'Enregistrement...' : 'Enregistrer'}
                </button>
                <button
                  type="button"
                  onClick={() => { setShowHeureForm(false); resetHeureForm(); }}
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
        </div>
      )}

      {/* Tables */}
      <div style={{ background: '#fff', borderRadius: 14, overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
        {activeTab === 'fiches' ? (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#f8fafc' }}>
                <th style={{ padding: '14px 16px', textAlign: 'left', fontSize: 13, fontWeight: 600, color: '#64748b', borderBottom: '1px solid #e5e7eb' }}>Employé</th>
                <th style={{ padding: '14px 16px', textAlign: 'center', fontSize: 13, fontWeight: 600, color: '#64748b', borderBottom: '1px solid #e5e7eb' }}>Période</th>
                <th style={{ padding: '14px 16px', textAlign: 'right', fontSize: 13, fontWeight: 600, color: '#64748b', borderBottom: '1px solid #e5e7eb' }}>Brut</th>
                <th style={{ padding: '14px 16px', textAlign: 'right', fontSize: 13, fontWeight: 600, color: '#64748b', borderBottom: '1px solid #e5e7eb' }}>Net</th>
                <th style={{ padding: '14px 16px', textAlign: 'center', fontSize: 13, fontWeight: 600, color: '#64748b', borderBottom: '1px solid #e5e7eb' }}>Statut</th>
                <th style={{ padding: '14px 16px', textAlign: 'right', fontSize: 13, fontWeight: 600, color: '#64748b', borderBottom: '1px solid #e5e7eb' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6} style={{ padding: 40, textAlign: 'center', color: '#64748b' }}>
                    Chargement...
                  </td>
                </tr>
              ) : filteredFiches.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ padding: 40, textAlign: 'center' }}>
                    <CreditCard size={48} color="#cbd5e1" style={{ margin: '0 auto 16px' }} />
                    <p style={{ color: '#64748b' }}>Aucune fiche de paie trouvée</p>
                  </td>
                </tr>
              ) : (
                filteredFiches.map((fiche) => (
                  <tr key={fiche.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '14px 16px' }}>
                      <div style={{ fontWeight: 600, color: '#0f172a' }}>
                        {fiche.utilisateurPrenom} {fiche.utilisateurNom}
                      </div>
                      <div style={{ fontSize: 12, color: '#64748b' }}>{fiche.poste}</div>
                    </td>
                    <td style={{ padding: '14px 16px', textAlign: 'center', fontSize: 13 }}>
                      {getMoisLabel(fiche.mois)} {fiche.annee}
                    </td>
                    <td style={{ padding: '14px 16px', textAlign: 'right', fontWeight: 600, color: '#0f172a' }}>
                      {fiche.salaireBrut.toLocaleString()} Ar
                    </td>
                    <td style={{ padding: '14px 16px', textAlign: 'right', fontWeight: 700, color: '#10b981' }}>
                      {fiche.netAPayer.toLocaleString()} Ar
                    </td>
                    <td style={{ padding: '14px 16px', textAlign: 'center' }}>
                      <span style={{
                        padding: '4px 10px',
                        borderRadius: 12,
                        fontSize: 11,
                        fontWeight: 600,
                        background: fiche.statut === 'valide' ? '#d1fae5' : '#fef3c7',
                        color: fiche.statut === 'valide' ? '#065f46' : '#f59e0b'
                      }}>
                        {fiche.statut === 'valide' ? 'Validée' : 'Brouillon'}
                      </span>
                    </td>
                    <td style={{ padding: '14px 16px', textAlign: 'right' }}>
                      <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                        {fiche.statut === 'brouillon' && (
                          <button
                            onClick={() => handleValiderFiche(fiche.id)}
                            style={{
                              padding: '8px',
                              background: '#d1fae5',
                              color: '#065f46',
                              border: 'none',
                              borderRadius: 6,
                              cursor: 'pointer'
                            }}
                            title="Valider"
                          >
                            <CheckCircle size={16} />
                          </button>
                        )}
                        <button
                          style={{
                            padding: '8px',
                            background: '#f1f5f9',
                            color: '#64748b',
                            border: 'none',
                            borderRadius: 6,
                            cursor: 'pointer'
                          }}
                          title="Télécharger"
                        >
                          <Download size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#f8fafc' }}>
                <th style={{ padding: '14px 16px', textAlign: 'left', fontSize: 13, fontWeight: 600, color: '#64748b', borderBottom: '1px solid #e5e7eb' }}>Enseignant</th>
                <th style={{ padding: '14px 16px', textAlign: 'center', fontSize: 13, fontWeight: 600, color: '#64748b', borderBottom: '1px solid #e5e7eb' }}>Date</th>
                <th style={{ padding: '14px 16px', textAlign: 'center', fontSize: 13, fontWeight: 600, color: '#64748b', borderBottom: '1px solid #e5e7eb' }}>Heures</th>
                <th style={{ padding: '14px 16px', textAlign: 'right', fontSize: 13, fontWeight: 600, color: '#64748b', borderBottom: '1px solid #e5e7eb' }}>Taux</th>
                <th style={{ padding: '14px 16px', textAlign: 'right', fontSize: 13, fontWeight: 600, color: '#64748b', borderBottom: '1px solid #e5e7eb' }}>Montant</th>
                <th style={{ padding: '14px 16px', textAlign: 'center', fontSize: 13, fontWeight: 600, color: '#64748b', borderBottom: '1px solid #e5e7eb' }}>Statut</th>
                <th style={{ padding: '14px 16px', textAlign: 'right', fontSize: 13, fontWeight: 600, color: '#64748b', borderBottom: '1px solid #e5e7eb' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={7} style={{ padding: 40, textAlign: 'center', color: '#64748b' }}>
                    Chargement...
                  </td>
                </tr>
              ) : filteredHeures.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ padding: 40, textAlign: 'center' }}>
                    <Clock size={48} color="#cbd5e1" style={{ margin: '0 auto 16px' }} />
                    <p style={{ color: '#64748b' }}>Aucune heure complémentaire trouvée</p>
                  </td>
                </tr>
              ) : (
                filteredHeures.map((heure) => (
                  <tr key={heure.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '14px 16px' }}>
                      <div style={{ fontWeight: 600, color: '#0f172a' }}>
                        {heure.prenom} {heure.nom}
                      </div>
                      <div style={{ fontSize: 12, color: '#64748b' }}>{heure.motif}</div>
                    </td>
                    <td style={{ padding: '14px 16px', textAlign: 'center', fontSize: 13 }}>
                      {new Date(heure.dateTravail).toLocaleDateString('fr-FR')}
                    </td>
                    <td style={{ padding: '14px 16px', textAlign: 'center', fontWeight: 600, color: '#0f172a' }}>
                      {heure.nbHeures}h
                    </td>
                    <td style={{ padding: '14px 16px', textAlign: 'right', fontSize: 13, color: '#64748b' }}>
                      {heure.tauxHoraire.toLocaleString()} Ar
                    </td>
                    <td style={{ padding: '14px 16px', textAlign: 'right', fontWeight: 700, color: '#10b981' }}>
                      {(heure.nbHeures * heure.tauxHoraire).toLocaleString()} Ar
                    </td>
                    <td style={{ padding: '14px 16px', textAlign: 'center' }}>
                      <span style={{
                        padding: '4px 10px',
                        borderRadius: 12,
                        fontSize: 11,
                        fontWeight: 600,
                        background: heure.statut === 'valide' ? '#d1fae5' : '#fef3c7',
                        color: heure.statut === 'valide' ? '#065f46' : '#f59e0b'
                      }}>
                        {heure.statut === 'valide' ? 'Validée' : 'En attente'}
                      </span>
                    </td>
                    <td style={{ padding: '14px 16px', textAlign: 'right' }}>
                      {heure.statut === 'saisie' && (
                        <button
                          onClick={() => handleValiderHeure(heure.id)}
                          style={{
                            padding: '8px',
                            background: '#d1fae5',
                            color: '#065f46',
                            border: 'none',
                            borderRadius: 6,
                            cursor: 'pointer'
                          }}
                          title="Valider"
                        >
                          <CheckCircle size={16} />
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default PaieVacationsPage;

// Made with Bob
