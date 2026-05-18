import React, { useState, useEffect, useCallback } from 'react';
import { useAuthStore } from '../../store/authStore';
import { financeApi } from '../../api/client';
import toast from 'react-hot-toast';
import { 
  Calendar, Clock, DollarSign, AlertCircle, CheckCircle, Plus, 
  Search, User, FileText, Bell, RefreshCw, X
} from 'lucide-react';

interface Echeancier {
  id: string;
  inscription_id: string;
  etudiant_nom: string;
  etudiant_prenom: string;
  etudiant_matricule: string;
  parcours_nom: string;
  num_tranche: number;
  montant_du: number;
  date_echeance: string;
  statut: string;
  statut_calcule?: string;
  annee_niveau?: number;
  annee_academique?: string;
}

interface InscriptionActive {
  id: string;
  etudiant_id: string;
  nom: string;
  prenom: string;
  matricule: string;
  parcours_nom: string;
  annee_niveau: number;
  annee_academique: string;
}

interface EcheancierForm {
  inscription_id: string;
  num_tranche: number;
  montant_du: string;
  date_echeance: string;
  observations: string;
}

export const EcheanciersPage: React.FC = () => {
  const { tenant } = useAuthStore();
  const tenantId = tenant?.id || '';
  
  const [echeanciers, setEcheanciers] = useState<Echeancier[]>([]);
  const [inscriptions, setInscriptions] = useState<InscriptionActive[]>([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatut, setFilterStatut] = useState<string>('all');
  
  const [form, setForm] = useState<EcheancierForm>({
    inscription_id: '',
    num_tranche: 1,
    montant_du: '',
    date_echeance: '',
    observations: ''
  });

  const loadData = useCallback(async () => {
    if (!tenantId) return;
    
    setLoading(true);
    try {
      const [echeanciersRes, inscriptionsRes] = await Promise.all([
        financeApi.getEcheanciers(tenantId),
        financeApi.getInscriptionsActives(tenantId)
      ]);
      
      setEcheanciers(echeanciersRes.data || []);
      setInscriptions(inscriptionsRes.data || []);
    } catch (error: any) {
      console.error('Erreur chargement:', error);
      toast.error(error.response?.data?.message || 'Erreur de chargement');
    } finally {
      setLoading(false);
    }
  }, [tenantId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!form.inscription_id || !form.montant_du || !form.date_echeance) {
      toast.error('Veuillez remplir tous les champs obligatoires');
      return;
    }

    setLoading(true);
    try {
      await financeApi.creerEcheancier(tenantId, {
        inscriptionId: form.inscription_id,
        numTranche: form.num_tranche,
        montantDu: parseFloat(form.montant_du),
        dateEcheance: form.date_echeance,
        observations: form.observations || null
      });

      toast.success('Échéancier créé avec succès!');
      setShowForm(false);
      resetForm();
      loadData();
    } catch (error: any) {
      console.error('Erreur:', error);
      toast.error(error.response?.data?.message || 'Erreur lors de la création');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setForm({
      inscription_id: '',
      num_tranche: 1,
      montant_du: '',
      date_echeance: '',
      observations: ''
    });
  };

  const fmt = (n: number) => Number(n || 0).toLocaleString('fr-FR') + ' Ar';

  const filteredEcheanciers = echeanciers.filter(e => {
    const matchesSearch = 
      e.etudiant_nom?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      e.etudiant_prenom?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      e.etudiant_matricule?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      e.parcours_nom?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const statut = e.statut_calcule || e.statut;
    const matchesStatut = filterStatut === 'all' || statut === filterStatut;
    
    return matchesSearch && matchesStatut;
  });

  const stats = {
    total: echeanciers.length,
    en_attente: echeanciers.filter(e => (e.statut_calcule || e.statut) === 'en_attente').length,
    paye: echeanciers.filter(e => (e.statut_calcule || e.statut) === 'paye').length,
    en_retard: echeanciers.filter(e => (e.statut_calcule || e.statut) === 'en_retard').length,
    montant_impaye: echeanciers
      .filter(e => ['en_retard', 'en_attente'].includes(e.statut_calcule || e.statut))
      .reduce((sum, e) => sum + e.montant_du, 0)
  };

  const getStatutColor = (statut: string) => {
    switch (statut) {
      case 'paye': return '#10b981';
      case 'en_attente': return '#f59e0b';
      case 'en_retard': return '#ef4444';
      default: return '#64748b';
    }
  };

  const getStatutIcon = (statut: string) => {
    switch (statut) {
      case 'paye': return <CheckCircle size={16} />;
      case 'en_attente': return <Clock size={16} />;
      case 'en_retard': return <AlertCircle size={16} />;
      default: return <Clock size={16} />;
    }
  };

  return (
    <div style={{ padding: 32, background: '#F8FAFC', minHeight: '100vh' }}>
      {/* Header */}
      <div style={{ marginBottom: 32 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <div>
            <h1 style={{ fontSize: 28, fontWeight: 900, color: '#1e293b', margin: 0, display: 'flex', alignItems: 'center', gap: 12 }}>
              <Calendar size={32} color="#1a5276" />
              Échéanciers & Relances
            </h1>
            <p style={{ color: '#64748b', fontSize: 16, margin: '4px 0 0' }}>
              Gestion des échéances de paiement et relances automatiques
            </p>
          </div>
          <button
            onClick={() => setShowForm(true)}
            style={{
              padding: '10px 20px',
              background: '#1a5276',
              color: '#fff',
              border: 'none',
              borderRadius: 10,
              fontSize: 14,
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 8
            }}
          >
            <Plus size={18} />
            Nouveau Échéancier
          </button>
        </div>

        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, marginBottom: 24 }}>
          <div style={{ background: '#fff', padding: 16, borderRadius: 12, border: '1px solid #e2e8f0' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
              <FileText size={20} color="#3b82f6" />
              <span style={{ fontSize: 12, fontWeight: 600, color: '#64748b' }}>Total Échéanciers</span>
            </div>
            <div style={{ fontSize: 24, fontWeight: 800, color: '#1e293b' }}>{stats.total}</div>
          </div>
          <div style={{ background: '#fff', padding: 16, borderRadius: 12, border: '1px solid #e2e8f0' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
              <Clock size={20} color="#f59e0b" />
              <span style={{ fontSize: 12, fontWeight: 600, color: '#64748b' }}>En Attente</span>
            </div>
            <div style={{ fontSize: 24, fontWeight: 800, color: '#f59e0b' }}>{stats.en_attente}</div>
          </div>
          <div style={{ background: '#fff', padding: 16, borderRadius: 12, border: '1px solid #e2e8f0' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
              <CheckCircle size={20} color="#10b981" />
              <span style={{ fontSize: 12, fontWeight: 600, color: '#64748b' }}>Payés</span>
            </div>
            <div style={{ fontSize: 24, fontWeight: 800, color: '#10b981' }}>{stats.paye}</div>
          </div>
          <div style={{ background: '#fff', padding: 16, borderRadius: 12, border: '1px solid #e2e8f0' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
              <AlertCircle size={20} color="#ef4444" />
              <span style={{ fontSize: 12, fontWeight: 600, color: '#64748b' }}>En Retard</span>
            </div>
            <div style={{ fontSize: 24, fontWeight: 800, color: '#ef4444' }}>{stats.en_retard}</div>
          </div>
          <div style={{ background: '#fff', padding: 16, borderRadius: 12, border: '1px solid #e2e8f0' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
              <DollarSign size={20} color="#8b5cf6" />
              <span style={{ fontSize: 12, fontWeight: 600, color: '#64748b' }}>Montant Impayé</span>
            </div>
            <div style={{ fontSize: 20, fontWeight: 800, color: '#8b5cf6' }}>{fmt(stats.montant_impaye)}</div>
          </div>
        </div>

        {/* Filters */}
        <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
          <div style={{ position: 'relative', flex: 1 }}>
            <Search size={20} color="#64748b" style={{ position: 'absolute', left: 16, top: 14 }} />
            <input
              type="text"
              placeholder="Rechercher par étudiant, matricule ou parcours..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                width: '100%',
                padding: '12px 16px 12px 44px',
                border: '2px solid #e2e8f0',
                borderRadius: 10,
                fontSize: 14,
                outline: 'none'
              }}
            />
          </div>
          <select
            value={filterStatut}
            onChange={(e) => setFilterStatut(e.target.value)}
            style={{
              padding: '12px 16px',
              border: '2px solid #e2e8f0',
              borderRadius: 10,
              fontSize: 14,
              background: '#fff',
              cursor: 'pointer'
            }}
          >
            <option value="all">Tous les statuts</option>
            <option value="en_attente">En attente</option>
            <option value="paye">Payés</option>
            <option value="en_retard">En retard</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div style={{ background: '#fff', borderRadius: 16, padding: 24, boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: 40 }}>
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Chargement...</span>
            </div>
          </div>
        ) : filteredEcheanciers.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 40, color: '#64748b' }}>
            <Calendar size={48} style={{ margin: '0 auto 16px', opacity: 0.3 }} />
            <p style={{ fontSize: 16, fontWeight: 600 }}>Aucun échéancier trouvé</p>
            <p style={{ fontSize: 14 }}>Créez un nouvel échéancier pour commencer</p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid #f1f5f9' }}>
                  <th style={{ padding: '12px 8px', textAlign: 'left', fontSize: 12, fontWeight: 600, color: '#64748b', textTransform: 'uppercase' }}>Étudiant</th>
                  <th style={{ padding: '12px 8px', textAlign: 'left', fontSize: 12, fontWeight: 600, color: '#64748b', textTransform: 'uppercase' }}>Parcours</th>
                  <th style={{ padding: '12px 8px', textAlign: 'center', fontSize: 12, fontWeight: 600, color: '#64748b', textTransform: 'uppercase' }}>Tranche</th>
                  <th style={{ padding: '12px 8px', textAlign: 'center', fontSize: 12, fontWeight: 600, color: '#64748b', textTransform: 'uppercase' }}>Montant</th>
                  <th style={{ padding: '12px 8px', textAlign: 'center', fontSize: 12, fontWeight: 600, color: '#64748b', textTransform: 'uppercase' }}>Échéance</th>
                  <th style={{ padding: '12px 8px', textAlign: 'center', fontSize: 12, fontWeight: 600, color: '#64748b', textTransform: 'uppercase' }}>Statut</th>
                </tr>
              </thead>
              <tbody>
                {filteredEcheanciers.map((ech) => {
                  const statut = ech.statut_calcule || ech.statut;
                  return (
                    <tr key={ech.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                      <td style={{ padding: '12px 8px' }}>
                        <div>
                          <div style={{ fontSize: 14, fontWeight: 600, color: '#1e293b' }}>
                            {ech.etudiant_nom} {ech.etudiant_prenom}
                          </div>
                          <div style={{ fontSize: 12, color: '#64748b' }}>
                            {ech.etudiant_matricule}
                          </div>
                        </div>
                      </td>
                      <td style={{ padding: '12px 8px', fontSize: 14, color: '#1e293b' }}>
                        {ech.parcours_nom}
                      </td>
                      <td style={{ padding: '12px 8px', textAlign: 'center', fontSize: 14, fontWeight: 600, color: '#1e293b' }}>
                        {ech.num_tranche}
                      </td>
                      <td style={{ padding: '12px 8px', textAlign: 'center', fontSize: 14, fontWeight: 700, color: '#f59e0b' }}>
                        {fmt(ech.montant_du)}
                      </td>
                      <td style={{ padding: '12px 8px', textAlign: 'center', fontSize: 14, color: '#1e293b' }}>
                        {new Date(ech.date_echeance).toLocaleDateString('fr-FR')}
                      </td>
                      <td style={{ padding: '12px 8px', textAlign: 'center' }}>
                        <span style={{ 
                          padding: '6px 12px', 
                          borderRadius: 20, 
                          fontSize: 11, 
                          fontWeight: 600,
                          background: `${getStatutColor(statut)}20`,
                          color: getStatutColor(statut),
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: 4
                        }}>
                          {getStatutIcon(statut)}
                          {statut.replace('_', ' ')}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal Formulaire */}
      {showForm && (
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
          zIndex: 1000
        }}>
          <div style={{
            background: '#fff',
            borderRadius: 16,
            padding: 32,
            maxWidth: 500,
            width: '90%',
            maxHeight: '90vh',
            overflowY: 'auto'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
              <h3 style={{ fontSize: 20, fontWeight: 700, color: '#1e293b', margin: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
                <Calendar size={24} color="#1a5276" />
                Nouveau Échéancier
              </h3>
              <button
                onClick={() => {
                  setShowForm(false);
                  resetForm();
                }}
                style={{ background: 'none', border: 'none', cursor: 'pointer' }}
              >
                <X size={24} color="#64748b" />
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div style={{ marginBottom: 20 }}>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 8 }}>
                  Étudiant Inscrit *
                </label>
                <select
                  value={form.inscription_id}
                  onChange={(e) => setForm(prev => ({ ...prev, inscription_id: e.target.value }))}
                  required
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    border: '2px solid #e2e8f0',
                    borderRadius: 10,
                    fontSize: 14,
                    outline: 'none',
                    background: '#fff',
                    cursor: 'pointer'
                  }}
                >
                  <option value="">Sélectionner un étudiant</option>
                  {inscriptions.map(ins => (
                    <option key={ins.id} value={ins.id}>
                      {ins.nom} {ins.prenom} ({ins.matricule}) - {ins.parcours_nom} - Niveau {ins.annee_niveau}
                    </option>
                  ))}
                </select>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 20 }}>
                <div>
                  <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 8 }}>
                    Numéro Tranche
                  </label>
                  <input
                    type="number"
                    value={form.num_tranche}
                    onChange={(e) => setForm(prev => ({ ...prev, num_tranche: parseInt(e.target.value) || 1 }))}
                    min="1"
                    style={{
                      width: '100%',
                      padding: '12px 16px',
                      border: '2px solid #e2e8f0',
                      borderRadius: 10,
                      fontSize: 14,
                      outline: 'none'
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 8 }}>
                    Montant Du (Ar) *
                  </label>
                  <input
                    type="number"
                    value={form.montant_du}
                    onChange={(e) => setForm(prev => ({ ...prev, montant_du: e.target.value }))}
                    required
                    style={{
                      width: '100%',
                      padding: '12px 16px',
                      border: '2px solid #e2e8f0',
                      borderRadius: 10,
                      fontSize: 14,
                      outline: 'none'
                    }}
                  />
                </div>
              </div>

              <div style={{ marginBottom: 20 }}>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 8 }}>
                  Date Échéance *
                </label>
                <input
                  type="date"
                  value={form.date_echeance}
                  onChange={(e) => setForm(prev => ({ ...prev, date_echeance: e.target.value }))}
                  required
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    border: '2px solid #e2e8f0',
                    borderRadius: 10,
                    fontSize: 14,
                    outline: 'none'
                  }}
                />
              </div>

              <div style={{ marginBottom: 24 }}>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 8 }}>
                  Observations
                </label>
                <textarea
                  value={form.observations}
                  onChange={(e) => setForm(prev => ({ ...prev, observations: e.target.value }))}
                  rows={3}
                  placeholder="Observations sur l'échéancier..."
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    border: '2px solid #e2e8f0',
                    borderRadius: 10,
                    fontSize: 14,
                    outline: 'none',
                    resize: 'vertical'
                  }}
                />
              </div>

              <div style={{ display: 'flex', gap: 12 }}>
                <button
                  type="button"
                  onClick={() => {
                    setShowForm(false);
                    resetForm();
                  }}
                  style={{
                    flex: 1,
                    padding: '12px',
                    background: '#fff',
                    color: '#64748b',
                    border: '2px solid #e2e8f0',
                    borderRadius: 10,
                    fontSize: 14,
                    fontWeight: 600,
                    cursor: 'pointer'
                  }}
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  style={{
                    flex: 2,
                    padding: '12px',
                    background: loading ? '#94a3b8' : '#1a5276',
                    color: '#fff',
                    border: 'none',
                    borderRadius: 10,
                    fontSize: 14,
                    fontWeight: 600,
                    cursor: loading ? 'not-allowed' : 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 8
                  }}
                >
                  {loading ? (
                    <div className="spinner-border spinner-border-sm" role="status">
                      <span className="visually-hidden">Chargement...</span>
                    </div>
                  ) : (
                    <>
                      <Plus size={18} />
                      Créer
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

// Made with Bob
