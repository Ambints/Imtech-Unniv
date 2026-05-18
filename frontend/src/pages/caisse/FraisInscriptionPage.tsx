import React, { useState, useEffect } from 'react';
import { useAuthStore } from '../../store/authStore';
import { api } from '../../api/client';
import toast from 'react-hot-toast';
import {
  Settings, Plus, Edit2, Trash2, Search, Filter, DollarSign,
  Calendar, Save, X, CheckCircle, AlertCircle, Clock,
  Building2, Users, FileText, Eye, EyeOff
} from 'lucide-react';

interface FraisInscription {
  id: string;
  parcours_id: string;
  parcours_code: string;
  parcours_nom: string;
  departement_nom: string;
  annee_academique_id: string;
  annee_academique: string;
  montant_inscription: number;
  montant_scolarite: number;
  montant_total: number;
  description: string;
  actif: boolean;
  date_limite_paiement: string;
  modalites_paiement: {
    especes: boolean;
    cheque: boolean;
    virement: boolean;
    carte_bancaire: boolean;
    echelonnement: boolean;
    nombre_echeances_max?: number;
  };
  nb_inscriptions: number;
  total_encaisse: number;
}

interface Parcours {
  id: string;
  code: string;
  nom: string;
  departement_nom: string;
}

interface AnneeAcademique {
  id: string;
  libelle: string;
  annee_debut: number;
  annee_fin: number;
  active: boolean;
}

interface FraisForm {
  parcours_id: string;
  annee_academique_id: string;
  montant_inscription: string;
  montant_scolarite: string;
  montant_total: string;
  description: string;
  date_limite_paiement: string;
  modalites_paiement: {
    especes: boolean;
    cheque: boolean;
    virement: boolean;
    carte_bancaire: boolean;
    echelonnement: boolean;
    nombre_echeances_max?: number;
  };
}

export const FraisInscriptionPage: React.FC = () => {
  const { user, tenant } = useAuthStore();
  const tenantId = tenant?.id || '';
  
  const [frais, setFrais] = useState<FraisInscription[]>([]);
  const [parcours, setParcours] = useState<Parcours[]>([]);
  const [anneesAcademiques, setAnneesAcademiques] = useState<AnneeAcademique[]>([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingFrais, setEditingFrais] = useState<FraisInscription | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterActif, setFilterActif] = useState<'all' | 'actif' | 'inactif'>('all');
  const [showStats, setShowStats] = useState(false);
  
  const [form, setForm] = useState<FraisForm>({
    parcours_id: '',
    annee_academique_id: '',
    montant_inscription: '',
    montant_scolarite: '',
    montant_total: '',
    description: '',
    date_limite_paiement: '',
    modalites_paiement: {
      especes: true,
      cheque: true,
      virement: true,
      carte_bancaire: true,
      echelonnement: false,
      nombre_echeances_max: 3
    }
  });

  useEffect(() => {
    loadData();
  }, [tenantId]);

  // Calcul automatique du total
  useEffect(() => {
    const inscription = parseFloat(form.montant_inscription) || 0;
    const scolarite = parseFloat(form.montant_scolarite) || 0;
    const total = inscription + scolarite;
    
    setForm(prev => ({
      ...prev,
      montant_total: total > 0 ? total.toString() : ''
    }));
  }, [form.montant_inscription, form.montant_scolarite]);

  const loadData = async () => {
    if (!tenantId) {
      toast.error('Tenant ID manquant');
      return;
    }

    setLoading(true);
    try {
      // Charger les données en parallèle
      const [fraisResponse, parcoursResponse, anneesResponse] = await Promise.all([
        api.get(`/finance/${tenantId}/grille-tarifaire`).catch(() => ({ data: [] })),
        api.get(`/academic/${tenantId}/parcours`).catch(() => ({ data: [] })),
        api.get(`/academic/${tenantId}/annees`).catch(() => ({ data: [] }))
      ]);

      setFrais(fraisResponse.data || []);
      setParcours(parcoursResponse.data || []);
      setAnneesAcademiques(anneesResponse.data || []);

      console.log('✅ Données chargées:', {
        frais: fraisResponse.data?.length || 0,
        parcours: parcoursResponse.data?.length || 0,
        annees: anneesResponse.data?.length || 0
      });
    } catch (error: any) {
      console.error('❌ Erreur lors du chargement des données:', error);
      toast.error(error.response?.data?.message || 'Erreur de chargement');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!form.parcours_id || !form.annee_academique_id || !form.montant_inscription) {
      toast.error('Veuillez remplir tous les champs obligatoires');
      return;
    }

    if (!tenantId) {
      toast.error('Tenant ID manquant');
      return;
    }

    setLoading(true);
    try {
      const payload = {
        parcoursId: form.parcours_id,
        anneeAcademiqueId: form.annee_academique_id,
        montantInscription: parseFloat(form.montant_inscription),
        montantScolarite: parseFloat(form.montant_scolarite) || 0,
        description: form.description || null,
        dateLimitePaiement: form.date_limite_paiement || null,
        modalitesPaiement: form.modalites_paiement
      };

      if (editingFrais) {
        await api.put(`/finance/${tenantId}/grille-tarifaire/${editingFrais.id}`, payload);
        toast.success('Frais mis à jour avec succès!');
      } else {
        await api.post(`/finance/${tenantId}/grille-tarifaire`, payload);
        toast.success('Frais créés avec succès!');
      }

      setShowForm(false);
      setEditingFrais(null);
      resetForm();
      loadData();
    } catch (error: any) {
      console.error('❌ Erreur:', error);
      toast.error(error.response?.data?.message || 'Erreur lors de l\'opération');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (fraisItem: FraisInscription) => {
    setEditingFrais(fraisItem);
    setForm({
      parcours_id: fraisItem.parcours_id,
      annee_academique_id: fraisItem.annee_academique_id,
      montant_inscription: fraisItem.montant_inscription.toString(),
      montant_scolarite: fraisItem.montant_scolarite.toString(),
      montant_total: fraisItem.montant_total.toString(),
      description: fraisItem.description || '',
      date_limite_paiement: fraisItem.date_limite_paiement || '',
      modalites_paiement: fraisItem.modalites_paiement
    });
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ces frais?')) return;

    if (!tenantId) {
      toast.error('Tenant ID manquant');
      return;
    }

    try {
      await api.delete(`/finance/${tenantId}/grille-tarifaire/${id}`);
      toast.success('Frais supprimés avec succès!');
      loadData();
    } catch (error: any) {
      console.error('Erreur:', error);
      toast.error(error.response?.data?.message || 'Erreur lors de la suppression');
    }
  };

  const toggleActif = async (id: string, actif: boolean) => {
    if (!tenantId) {
      toast.error('Tenant ID manquant');
      return;
    }

    try {
      await api.patch(`/finance/${tenantId}/grille-tarifaire/${id}/toggle-actif`);
      toast.success(`Frais ${!actif ? 'activés' : 'désactivés'} avec succès!`);
      loadData();
    } catch (error: any) {
      console.error('Erreur:', error);
      toast.error(error.response?.data?.message || 'Erreur lors de la mise à jour');
    }
  };

  const resetForm = () => {
    setForm({
      parcours_id: '',
      annee_academique_id: '',
      montant_inscription: '',
      montant_scolarite: '',
      montant_total: '',
      description: '',
      date_limite_paiement: '',
      modalites_paiement: {
        especes: true,
        cheque: true,
        virement: true,
        carte_bancaire: true,
        echelonnement: false,
        nombre_echeances_max: 3
      }
    });
  };

  const fmt = (n: number) => Number(n || 0).toLocaleString('fr-FR') + ' Ar';

  const filteredFrais = frais.filter(f => {
    const matchesSearch = f.parcours_nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         f.parcours_code.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         f.annee_academique.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterActif === 'all' || 
                         (filterActif === 'actif' && f.actif) || 
                         (filterActif === 'inactif' && !f.actif);
    return matchesSearch && matchesFilter;
  });

  const stats = {
    total: frais.length,
    actifs: frais.filter(f => f.actif).length,
    inactifs: frais.filter(f => !f.actif).length,
    totalMontant: frais.reduce((sum, f) => sum + f.montant_total, 0),
    totalEncaisse: frais.reduce((sum, f) => sum + f.total_encaisse, 0)
  };

  return (
    <div style={{ padding: 32, background: '#F8FAFC', minHeight: '100vh' }}>
      {/* Header */}
      <div style={{ marginBottom: 32 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <div>
            <h1 style={{ fontSize: 28, fontWeight: 900, color: '#1e293b', margin: 0, display: 'flex', alignItems: 'center', gap: 12 }}>
              <Settings size={32} color="#1a5276" />
              Frais d'Inscription
            </h1>
            <p style={{ color: '#64748b', fontSize: 16, margin: '4px 0 0' }}>
              Configuration des frais par parcours et année académique
            </p>
          </div>
          <div style={{ display: 'flex', gap: 12 }}>
            <button
              onClick={() => setShowStats(!showStats)}
              style={{
                padding: '10px 16px',
                background: showStats ? '#1a5276' : '#fff',
                color: showStats ? '#fff' : '#1a5276',
                border: '2px solid #1a5276',
                borderRadius: 10,
                fontSize: 14,
                fontWeight: 600,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 8
              }}
            >
              <FileText size={18} />
              Statistiques
            </button>
            <button
              onClick={() => {
                setShowForm(true);
                setEditingFrais(null);
                resetForm();
              }}
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
              Nouveaux Frais
            </button>
          </div>
        </div>

        {/* Stats */}
        {showStats && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, marginBottom: 24 }}>
            <div style={{ background: '#fff', padding: 16, borderRadius: 12, border: '1px solid #e2e8f0' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                <Building2 size={20} color="#3b82f6" />
                <span style={{ fontSize: 12, fontWeight: 600, color: '#64748b' }}>Total Configurations</span>
              </div>
              <div style={{ fontSize: 24, fontWeight: 800, color: '#1e293b' }}>{stats.total}</div>
            </div>
            <div style={{ background: '#fff', padding: 16, borderRadius: 12, border: '1px solid #e2e8f0' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                <CheckCircle size={20} color="#10b981" />
                <span style={{ fontSize: 12, fontWeight: 600, color: '#64748b' }}>Actives</span>
              </div>
              <div style={{ fontSize: 24, fontWeight: 800, color: '#10b981' }}>{stats.actifs}</div>
            </div>
            <div style={{ background: '#fff', padding: 16, borderRadius: 12, border: '1px solid #e2e8f0' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                <DollarSign size={20} color="#f59e0b" />
                <span style={{ fontSize: 12, fontWeight: 600, color: '#64748b' }}>Montant Total</span>
              </div>
              <div style={{ fontSize: 24, fontWeight: 800, color: '#f59e0b' }}>{fmt(stats.totalMontant)}</div>
            </div>
            <div style={{ background: '#fff', padding: 16, borderRadius: 12, border: '1px solid #e2e8f0' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                <Users size={20} color="#8b5cf6" />
                <span style={{ fontSize: 12, fontWeight: 600, color: '#64748b' }}>Total Encaissé</span>
              </div>
              <div style={{ fontSize: 24, fontWeight: 800, color: '#8b5cf6' }}>{fmt(stats.totalEncaisse)}</div>
            </div>
          </div>
        )}

        {/* Filters */}
        <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
          <div style={{ position: 'relative', flex: 1 }}>
            <Search size={20} color="#64748b" style={{ position: 'absolute', left: 16, top: 14 }} />
            <input
              type="text"
              placeholder="Rechercher par parcours, code ou année académique..."
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
            value={filterActif}
            onChange={(e) => setFilterActif(e.target.value as any)}
            style={{
              padding: '12px 16px',
              border: '2px solid #e2e8f0',
              borderRadius: 10,
              fontSize: 14,
              background: '#fff',
              cursor: 'pointer'
            }}
          >
            <option value="all">Tous</option>
            <option value="actif">Actifs</option>
            <option value="inactif">Inactifs</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div style={{ background: '#fff', borderRadius: 16, padding: 24, boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid #f1f5f9' }}>
                <th style={{ padding: '12px 8px', textAlign: 'left', fontSize: 12, fontWeight: 600, color: '#64748b', textTransform: 'uppercase' }}>Parcours</th>
                <th style={{ padding: '12px 8px', textAlign: 'left', fontSize: 12, fontWeight: 600, color: '#64748b', textTransform: 'uppercase' }}>Année Académique</th>
                <th style={{ padding: '12px 8px', textAlign: 'center', fontSize: 12, fontWeight: 600, color: '#64748b', textTransform: 'uppercase' }}>Frais Inscription</th>
                <th style={{ padding: '12px 8px', textAlign: 'center', fontSize: 12, fontWeight: 600, color: '#64748b', textTransform: 'uppercase' }}>Frais Scolarité</th>
                <th style={{ padding: '12px 8px', textAlign: 'center', fontSize: 12, fontWeight: 600, color: '#64748b', textTransform: 'uppercase' }}>Total</th>
                <th style={{ padding: '12px 8px', textAlign: 'center', fontSize: 12, fontWeight: 600, color: '#64748b', textTransform: 'uppercase' }}>Inscriptions</th>
                <th style={{ padding: '12px 8px', textAlign: 'center', fontSize: 12, fontWeight: 600, color: '#64748b', textTransform: 'uppercase' }}>Statut</th>
                <th style={{ padding: '12px 8px', textAlign: 'center', fontSize: 12, fontWeight: 600, color: '#64748b', textTransform: 'uppercase' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredFrais.map((fraisItem) => (
                <tr key={fraisItem.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                  <td style={{ padding: '12px 8px' }}>
                    <div>
                      <div style={{ fontSize: 14, fontWeight: 600, color: '#1e293b' }}>
                        {fraisItem.parcours_nom}
                      </div>
                      <div style={{ fontSize: 12, color: '#64748b' }}>
                        {fraisItem.parcours_code}
                      </div>
                      {fraisItem.departement_nom && (
                        <div style={{ fontSize: 11, color: '#94a3b8' }}>
                          {fraisItem.departement_nom}
                        </div>
                      )}
                    </div>
                  </td>
                  <td style={{ padding: '12px 8px', fontSize: 14, color: '#1e293b' }}>
                    {fraisItem.annee_academique}
                  </td>
                  <td style={{ padding: '12px 8px', textAlign: 'center', fontSize: 14, fontWeight: 600, color: '#1e293b' }}>
                    {fmt(fraisItem.montant_inscription)}
                  </td>
                  <td style={{ padding: '12px 8px', textAlign: 'center', fontSize: 14, fontWeight: 600, color: '#1e293b' }}>
                    {fmt(fraisItem.montant_scolarite)}
                  </td>
                  <td style={{ padding: '12px 8px', textAlign: 'center', fontSize: 14, fontWeight: 800, color: '#10b981' }}>
                    {fmt(fraisItem.montant_total)}
                  </td>
                  <td style={{ padding: '12px 8px', textAlign: 'center' }}>
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 600, color: '#1e293b' }}>
                        {fraisItem.nb_inscriptions}
                      </div>
                      <div style={{ fontSize: 11, color: '#64748b' }}>
                        {fmt(fraisItem.total_encaisse)}
                      </div>
                    </div>
                  </td>
                  <td style={{ padding: '12px 8px', textAlign: 'center' }}>
                    <span style={{ 
                      padding: '4px 8px', 
                      borderRadius: 6, 
                      fontSize: 11, 
                      fontWeight: 600,
                      background: fraisItem.actif ? '#d1fae5' : '#fee2e2',
                      color: fraisItem.actif ? '#065f46' : '#991b1b'
                    }}>
                      {fraisItem.actif ? 'Actif' : 'Inactif'}
                    </span>
                  </td>
                  <td style={{ padding: '12px 8px', textAlign: 'center' }}>
                    <div style={{ display: 'flex', gap: 8, justifyContent: 'center' }}>
                      <button
                        onClick={() => handleEdit(fraisItem)}
                        style={{
                          padding: '6px',
                          background: '#f1f5f9',
                          border: 'none',
                          borderRadius: 6,
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center'
                        }}
                        title="Modifier"
                      >
                        <Edit2 size={16} color="#3b82f6" />
                      </button>
                      <button
                        onClick={() => toggleActif(fraisItem.id, fraisItem.actif)}
                        style={{
                          padding: '6px',
                          background: fraisItem.actif ? '#fee2e2' : '#d1fae5',
                          border: 'none',
                          borderRadius: 6,
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center'
                        }}
                        title={fraisItem.actif ? 'Désactiver' : 'Activer'}
                      >
                        {fraisItem.actif ? <EyeOff size={16} color="#ef4444" /> : <Eye size={16} color="#10b981" />}
                      </button>
                      <button
                        onClick={() => handleDelete(fraisItem.id)}
                        style={{
                          padding: '6px',
                          background: '#fee2e2',
                          border: 'none',
                          borderRadius: 6,
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center'
                        }}
                        title="Supprimer"
                      >
                        <Trash2 size={16} color="#ef4444" />
                      </button>
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
            maxWidth: 600,
            width: '90%',
            maxHeight: '80vh',
            overflowY: 'auto'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
              <h3 style={{ fontSize: 20, fontWeight: 700, color: '#1e293b', margin: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
                <Settings size={24} color="#1a5276" />
                {editingFrais ? 'Modifier les Frais' : 'Nouveaux Frais d\'Inscription'}
              </h3>
              <button
                onClick={() => {
                  setShowForm(false);
                  setEditingFrais(null);
                  resetForm();
                }}
                style={{ background: 'none', border: 'none', cursor: 'pointer' }}
              >
                <X size={24} color="#64748b" />
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 20 }}>
                <div>
                  <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 8 }}>
                    Parcours *
                  </label>
                  <select
                    value={form.parcours_id}
                    onChange={(e) => setForm(prev => ({ ...prev, parcours_id: e.target.value }))}
                    required
                    style={{
                      width: '100%',
                      padding: '12px 16px',
                      border: '2px solid #e2e8f0',
                      borderRadius: 10,
                      fontSize: 14,
                      outline: 'none'
                    }}
                  >
                    <option value="">Sélectionner un parcours</option>
                    {parcours.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.code} - {p.nom}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 8 }}>
                    Année Académique *
                  </label>
                  <select
                    value={form.annee_academique_id}
                    onChange={(e) => setForm(prev => ({ ...prev, annee_academique_id: e.target.value }))}
                    required
                    style={{
                      width: '100%',
                      padding: '12px 16px',
                      border: '2px solid #e2e8f0',
                      borderRadius: 10,
                      fontSize: 14,
                      outline: 'none'
                    }}
                  >
                    <option value="">Sélectionner une année</option>
                    {anneesAcademiques.map((aa) => (
                      <option key={aa.id} value={aa.id}>
                        {aa.libelle}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16, marginBottom: 20 }}>
                <div>
                  <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 8 }}>
                    Frais d'Inscription (Ar) *
                  </label>
                  <input
                    type="number"
                    value={form.montant_inscription}
                    onChange={(e) => setForm(prev => ({ ...prev, montant_inscription: e.target.value }))}
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

                <div>
                  <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 8 }}>
                    Frais de Scolarité (Ar)
                  </label>
                  <input
                    type="number"
                    value={form.montant_scolarite}
                    onChange={(e) => setForm(prev => ({ ...prev, montant_scolarite: e.target.value }))}
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
                    Total (Ar)
                  </label>
                  <input
                    type="number"
                    value={form.montant_total}
                    onChange={(e) => setForm(prev => ({ ...prev, montant_total: e.target.value }))}
                    placeholder="Calculé automatiquement"
                    style={{
                      width: '100%',
                      padding: '12px 16px',
                      border: '2px solid #e2e8f0',
                      borderRadius: 10,
                      fontSize: 14,
                      outline: 'none',
                      background: '#f8fafc'
                    }}
                    readOnly
                  />
                </div>
              </div>

              <div style={{ marginBottom: 20 }}>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 8 }}>
                  Date Limite de Paiement
                </label>
                <input
                  type="date"
                  value={form.date_limite_paiement}
                  onChange={(e) => setForm(prev => ({ ...prev, date_limite_paiement: e.target.value }))}
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

              <div style={{ marginBottom: 20 }}>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 8 }}>
                  Description
                </label>
                <textarea
                  value={form.description}
                  onChange={(e) => setForm(prev => ({ ...prev, description: e.target.value }))}
                  rows={3}
                  placeholder="Description des frais..."
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

              <div style={{ marginBottom: 24 }}>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 12 }}>
                  Modalités de Paiement
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
                  {[
                    { key: 'especes', label: 'Espèces' },
                    { key: 'cheque', label: 'Chèque' },
                    { key: 'virement', label: 'Virement' },
                    { key: 'carte_bancaire', label: 'Carte Bancaire' },
                    { key: 'echelonnement', label: 'Échelonnement' }
                  ].map(({ key, label }) => (
                    <label key={key} style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
                      <input
                        type="checkbox"
                        checked={form.modalites_paiement[key as keyof typeof form.modalites_paiement] as boolean}
                        onChange={(e) => setForm(prev => ({
                          ...prev,
                          modalites_paiement: {
                            ...prev.modalites_paiement,
                            [key]: e.target.checked
                          }
                        }))}
                        style={{ cursor: 'pointer' }}
                      />
                      <span style={{ fontSize: 13, color: '#374151' }}>{label}</span>
                    </label>
                  ))}
                </div>

                {form.modalites_paiement.echelonnement && (
                  <div style={{ marginTop: 12 }}>
                    <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#374151', marginBottom: 4 }}>
                      Nombre d'échéances maximum
                    </label>
                    <input
                      type="number"
                      min="2"
                      max="12"
                      value={form.modalites_paiement.nombre_echeances_max}
                      onChange={(e) => setForm(prev => ({
                        ...prev,
                        modalites_paiement: {
                          ...prev.modalites_paiement,
                          nombre_echeances_max: parseInt(e.target.value) || 3
                        }
                      }))}
                      style={{
                        width: '120px',
                        padding: '8px 12px',
                        border: '2px solid #e2e8f0',
                        borderRadius: 8,
                        fontSize: 13,
                        outline: 'none'
                      }}
                    />
                  </div>
                )}
              </div>

              <div style={{ display: 'flex', gap: 12 }}>
                <button
                  type="button"
                  onClick={() => {
                    setShowForm(false);
                    setEditingFrais(null);
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
                      <Save size={18} />
                      {editingFrais ? 'Mettre à Jour' : 'Créer'}
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
