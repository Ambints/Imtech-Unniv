import React, { useState, useEffect } from 'react';
import { useAuthStore } from '../../store/authStore';
import toast from 'react-hot-toast';
import { 
  Calendar, Clock, DollarSign, AlertCircle, CheckCircle, Plus, Edit2, Trash2,
  Search, Filter, User, FileText, Bell, Send, Eye, EyeOff, RefreshCw, X
} from 'lucide-react';

interface Echeancier {
  id: string;
  inscription_id: string;
  etudiant_nom: string;
  etudiant_matricule: string;
  parcours_nom: string;
  num_tranche: number;
  montant_du: number;
  date_echeance: string;
  statut: 'en_attente' | 'paye' | 'en_retard' | 'annule';
  montant_paye?: number;
  date_paiement?: string;
  mode_paiement?: string;
  observations?: string;
}

interface Relance {
  id: string;
  echeancier_id: string;
  date_envoi: string;
  type_envoi: 'email' | 'sms';
  message: string;
  statut: 'envoyee' | 'en_attente' | 'echec';
  destinataire: string;
}

interface EcheancierForm {
  inscription_id: string;
  num_tranche: number;
  montant_du: string;
  date_echeance: string;
  observations: string;
}

export const EcheanciersPage: React.FC = () => {
  const { user, tenant } = useAuthStore();
  const tenantId = tenant?.id || '';
  
  const [echeanciers, setEcheanciers] = useState<Echeancier[]>([]);
  const [relances, setRelances] = useState<Relance[]>([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [showRelanceModal, setShowRelanceModal] = useState(false);
  const [selectedEcheancier, setSelectedEcheancier] = useState<Echeancier | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatut, setFilterStatut] = useState<'all' | 'en_attente' | 'paye' | 'en_retard' | 'annule'>('all');
  const [filterRetard, setFilterRetard] = useState(false);
  
  const [form, setForm] = useState<EcheancierForm>({
    inscription_id: '',
    num_tranche: 1,
    montant_du: '',
    date_echeance: '',
    observations: ''
  });

  const [relanceForm, setRelanceForm] = useState({
    type_envoi: 'email' as 'email' | 'sms',
    message: '',
    destinataire: ''
  });

  useEffect(() => {
    loadData();
  }, [tenantId]);

  const loadData = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      
      // Charger les échéanciers
      const echeanciersResponse = await fetch(`/api/caissier/echeanciers`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (echeanciersResponse.ok) {
        const echeanciersData = await echeanciersResponse.json();
        setEcheanciers(echeanciersData);
      }
    } catch (error) {
      console.error('Erreur lors du chargement des données:', error);
      toast.error('Erreur de chargement');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!form.inscription_id || !form.montant_du || !form.date_echeance) {
      toast.error('Veuillez remplir tous les champs obligatoires');
      return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/caissier/echeanciers`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          ...form,
          montant_du: parseFloat(form.montant_du)
        })
      });

      if (response.ok) {
        toast.success('Échéancier créé avec succès!');
        setShowForm(false);
        resetForm();
        loadData();
      } else {
        const error = await response.json();
        toast.error(error.message || 'Erreur lors de la création');
      }
    } catch (error) {
      console.error('Erreur:', error);
      toast.error('Erreur de connexion');
    } finally {
      setLoading(false);
    }
  };

  const handleModifierEcheance = async (id: string, nouvelleDate: string, motif: string) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/caissier/echeanciers/${id}/modifier`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          nouvelleDate,
          motif
        })
      });

      if (response.ok) {
        toast.success('Échéance modifiée avec succès!');
        loadData();
      } else {
        const error = await response.json();
        toast.error(error.message || 'Erreur lors de la modification');
      }
    } catch (error) {
      console.error('Erreur:', error);
      toast.error('Erreur de connexion');
    }
  };

  const handleRelance = async () => {
    if (!selectedEcheancier || !relanceForm.message) {
      toast.error('Veuillez sélectionner un échéancier et rédiger un message');
      return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/caissier/relances`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          echeancier_id: selectedEcheancier.id,
          type_envoi: relanceForm.type_envoi,
          message: relanceForm.message,
          destinataire: relanceForm.destinataire
        })
      });

      if (response.ok) {
        toast.success('Relance envoyée avec succès!');
        setShowRelanceModal(false);
        setSelectedEcheancier(null);
        setRelanceForm({ type_envoi: 'email', message: '', destinataire: '' });
        loadData();
      } else {
        const error = await response.json();
        toast.error(error.message || 'Erreur lors de l\'envoi');
      }
    } catch (error) {
      console.error('Erreur:', error);
      toast.error('Erreur de connexion');
    } finally {
      setLoading(false);
    }
  };

  const getImpayes = async (jours: number = 30) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/caissier/impayes?jours=${jours}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (response.ok) {
        const impayesData = await response.json();
        setEcheanciers(impayesData);
        toast.success(`${impayesData.length} impayés trouvés`);
      }
    } catch (error) {
      console.error('Erreur:', error);
      toast.error('Erreur de chargement');
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
    const matchesSearch = e.etudiant_nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         e.etudiant_matricule.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         e.parcours_nom.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatut = filterStatut === 'all' || e.statut === filterStatut;
    const matchesRetard = !filterRetard || e.statut === 'en_retard';
    return matchesSearch && matchesStatut && matchesRetard;
  });

  const stats = {
    total: echeanciers.length,
    en_attente: echeanciers.filter(e => e.statut === 'en_attente').length,
    paye: echeanciers.filter(e => e.statut === 'paye').length,
    en_retard: echeanciers.filter(e => e.statut === 'en_retard').length,
    montant_total_du: echeanciers.reduce((sum, e) => sum + e.montant_du, 0),
    montant_total_paye: echeanciers.reduce((sum, e) => sum + (e.montant_paye || 0), 0),
    montant_impaye: echeanciers
      .filter(e => e.statut === 'en_retard' || e.statut === 'en_attente')
      .reduce((sum, e) => sum + (e.montant_du - (e.montant_paye || 0)), 0)
  };

  const getStatutColor = (statut: string) => {
    switch (statut) {
      case 'paye': return '#10b981';
      case 'en_attente': return '#f59e0b';
      case 'en_retard': return '#ef4444';
      case 'annule': return '#64748b';
      default: return '#64748b';
    }
  };

  const getStatutIcon = (statut: string) => {
    switch (statut) {
      case 'paye': return <CheckCircle size={16} />;
      case 'en_attente': return <Clock size={16} />;
      case 'en_retard': return <AlertCircle size={16} />;
      case 'annule': return <EyeOff size={16} />;
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
          <div style={{ display: 'flex', gap: 12 }}>
            <button
              onClick={() => getImpayes(30)}
              style={{
                padding: '10px 16px',
                background: '#ef4444',
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
              <AlertCircle size={18} />
              Impayés (30j)
            </button>
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
            <div style={{ fontSize: 24, fontWeight: 800, color: '#8b5cf6' }}>{fmt(stats.montant_impaye)}</div>
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
            onChange={(e) => setFilterStatut(e.target.value as any)}
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
            <option value="annule">Annulés</option>
          </select>
          <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
            <input
              type="checkbox"
              checked={filterRetard}
              onChange={(e) => setFilterRetard(e.target.checked)}
              style={{ cursor: 'pointer' }}
            />
            <span style={{ fontSize: 14, color: '#64748b' }}>Uniquement les retards</span>
          </label>
        </div>
      </div>

      {/* Table */}
      <div style={{ background: '#fff', borderRadius: 16, padding: 24, boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid #f1f5f9' }}>
                <th style={{ padding: '12px 8px', textAlign: 'left', fontSize: 12, fontWeight: 600, color: '#64748b', textTransform: 'uppercase' }}>Étudiant</th>
                <th style={{ padding: '12px 8px', textAlign: 'left', fontSize: 12, fontWeight: 600, color: '#64748b', textTransform: 'uppercase' }}>Parcours</th>
                <th style={{ padding: '12px 8px', textAlign: 'center', fontSize: 12, fontWeight: 600, color: '#64748b', textTransform: 'uppercase' }}>Tranche</th>
                <th style={{ padding: '12px 8px', textAlign: 'center', fontSize: 12, fontWeight: 600, color: '#64748b', textTransform: 'uppercase' }}>Montant Du</th>
                <th style={{ padding: '12px 8px', textAlign: 'center', fontSize: 12, fontWeight: 600, color: '#64748b', textTransform: 'uppercase' }}>Date Échéance</th>
                <th style={{ padding: '12px 8px', textAlign: 'center', fontSize: 12, fontWeight: 600, color: '#64748b', textTransform: 'uppercase' }}>Statut</th>
                <th style={{ padding: '12px 8px', textAlign: 'center', fontSize: 12, fontWeight: 600, color: '#64748b', textTransform: 'uppercase' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredEcheanciers.map((echeancier) => (
                <tr key={echeancier.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                  <td style={{ padding: '12px 8px' }}>
                    <div>
                      <div style={{ fontSize: 14, fontWeight: 600, color: '#1e293b' }}>
                        {echeancier.etudiant_nom}
                      </div>
                      <div style={{ fontSize: 12, color: '#64748b' }}>
                        {echeancier.etudiant_matricule}
                      </div>
                    </div>
                  </td>
                  <td style={{ padding: '12px 8px', fontSize: 14, color: '#1e293b' }}>
                    {echeancier.parcours_nom}
                  </td>
                  <td style={{ padding: '12px 8px', textAlign: 'center', fontSize: 14, fontWeight: 600, color: '#1e293b' }}>
                    {echeancier.num_tranche}/{echeancier.num_tranche + 1}
                  </td>
                  <td style={{ padding: '12px 8px', textAlign: 'center', fontSize: 14, fontWeight: 700, color: '#f59e0b' }}>
                    {fmt(echeancier.montant_du)}
                    {echeancier.montant_paye && (
                      <div style={{ fontSize: 11, color: '#10b981' }}>
                        Payé: {fmt(echeancier.montant_paye)}
                      </div>
                    )}
                  </td>
                  <td style={{ padding: '12px 8px', textAlign: 'center', fontSize: 14, color: '#1e293b' }}>
                    {new Date(echeancier.date_echeance).toLocaleDateString('fr-FR')}
                    {echeancier.date_paiement && (
                      <div style={{ fontSize: 11, color: '#10b981' }}>
                        Payé: {new Date(echeancier.date_paiement).toLocaleDateString('fr-FR')}
                      </div>
                    )}
                  </td>
                  <td style={{ padding: '12px 8px', textAlign: 'center' }}>
                    <span style={{ 
                      padding: '6px 12px', 
                      borderRadius: 20, 
                      fontSize: 11, 
                      fontWeight: 600,
                      background: `${getStatutColor(echeancier.statut)}20`,
                      color: getStatutColor(echeancier.statut),
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 4
                    }}>
                      {getStatutIcon(echeancier.statut)}
                      {echeancier.statut.replace('_', ' ')}
                    </span>
                  </td>
                  <td style={{ padding: '12px 8px', textAlign: 'center' }}>
                    <div style={{ display: 'flex', gap: 8, justifyContent: 'center' }}>
                      {echeancier.statut === 'en_retard' && (
                        <button
                          onClick={() => {
                            setSelectedEcheancier(echeancier);
                            setRelanceForm({
                              type_envoi: 'email',
                              message: `Rappel: Votre échéance de paiement de ${fmt(echeancier.montant_du)} est en retard depuis le ${new Date(echeancier.date_echeance).toLocaleDateString('fr-FR')}. Merci de régulariser votre situation.`,
                              destinataire: ''
                            });
                            setShowRelanceModal(true);
                          }}
                          style={{
                            padding: '6px',
                            background: '#fee2e2',
                            border: 'none',
                            borderRadius: 6,
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center'
                          }}
                          title="Envoyer une relance"
                        >
                          <Bell size={16} color="#ef4444" />
                        </button>
                      )}
                      {echeancier.statut === 'en_attente' && (
                        <button
                          onClick={() => {
                            const nouvelleDate = prompt('Nouvelle date d\'échéance (YYYY-MM-DD):');
                            if (nouvelleDate) {
                              const motif = prompt('Motif du report:');
                              if (motif) {
                                handleModifierEcheance(echeancier.id, nouvelleDate, motif);
                              }
                            }
                          }}
                          style={{
                            padding: '6px',
                            background: '#f1f5f9',
                            border: 'none',
                            borderRadius: 6,
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center'
                          }}
                          title="Reporter l'échéance"
                        >
                          <RefreshCw size={16} color="#3b82f6" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
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
            width: '90%'
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
                  ID Inscription *
                </label>
                <input
                  type="text"
                  value={form.inscription_id}
                  onChange={(e) => setForm(prev => ({ ...prev, inscription_id: e.target.value }))}
                  placeholder="UUID de l'inscription"
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

      {/* Modal Relance */}
      {showRelanceModal && selectedEcheancier && (
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
            maxWidth: 600,
            width: '90%'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
              <h3 style={{ fontSize: 20, fontWeight: 700, color: '#1e293b', margin: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
                <Bell size={24} color="#ef4444" />
                Envoyer une Relance
              </h3>
              <button
                onClick={() => {
                  setShowRelanceModal(false);
                  setSelectedEcheancier(null);
                  setRelanceForm({ type_envoi: 'email', message: '', destinataire: '' });
                }}
                style={{ background: 'none', border: 'none', cursor: 'pointer' }}
              >
                <X size={24} color="#64748b" />
              </button>
            </div>

            <div style={{ padding: 16, background: '#fee2e2', borderRadius: 12, marginBottom: 20 }}>
              <div style={{ fontSize: 14, fontWeight: 600, color: '#991b1b', marginBottom: 8 }}>
                Étudiant: {selectedEcheancier.etudiant_nom}
              </div>
              <div style={{ fontSize: 12, color: '#64748b' }}>
                Montant: {fmt(selectedEcheancier.montant_du)} | 
                Échéance: {new Date(selectedEcheancier.date_echeance).toLocaleDateString('fr-FR')}
              </div>
            </div>

            <div style={{ marginBottom: 20 }}>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 8 }}>
                Type d'envoi
              </label>
              <div style={{ display: 'flex', gap: 12 }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
                  <input
                    type="radio"
                    value="email"
                    checked={relanceForm.type_envoi === 'email'}
                    onChange={(e) => setRelanceForm(prev => ({ ...prev, type_envoi: 'email' }))}
                    style={{ cursor: 'pointer' }}
                  />
                  <span style={{ fontSize: 14, color: '#374151' }}>Email</span>
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
                  <input
                    type="radio"
                    value="sms"
                    checked={relanceForm.type_envoi === 'sms'}
                    onChange={(e) => setRelanceForm(prev => ({ ...prev, type_envoi: 'sms' }))}
                    style={{ cursor: 'pointer' }}
                  />
                  <span style={{ fontSize: 14, color: '#374151' }}>SMS</span>
                </label>
              </div>
            </div>

            <div style={{ marginBottom: 20 }}>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 8 }}>
                Destinataire
              </label>
              <input
                type="text"
                value={relanceForm.destinataire}
                onChange={(e) => setRelanceForm(prev => ({ ...prev, destinataire: e.target.value }))}
                placeholder={relanceForm.type_envoi === 'email' ? 'email@example.com' : '+261 34 00 000 00'}
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
                Message de relance
              </label>
              <textarea
                value={relanceForm.message}
                onChange={(e) => setRelanceForm(prev => ({ ...prev, message: e.target.value }))}
                rows={6}
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
                onClick={() => {
                  setShowRelanceModal(false);
                  setSelectedEcheancier(null);
                  setRelanceForm({ type_envoi: 'email', message: '', destinataire: '' });
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
                onClick={handleRelance}
                disabled={loading}
                style={{
                  flex: 2,
                  padding: '12px',
                  background: loading ? '#94a3b8' : '#ef4444',
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
                    <Send size={18} />
                    Envoyer la Relance
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
