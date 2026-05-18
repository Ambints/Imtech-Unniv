import React, { useState, useEffect } from 'react';
import { api } from '../../api/client';
import { useAuthStore } from '../../store/authStore';
import toast from 'react-hot-toast';
import {
  MapPin, Plus, Search, Filter, CheckCircle, XCircle, Eye, Calendar,
  Clock, User, AlertCircle, X, Save
} from 'lucide-react';

interface Conge {
  id: string;
  utilisateurId: string;
  typeConge: string;
  dateDebut: string;
  dateFin: string;
  nbJours: number;
  motif: string;
  statut: 'demande' | 'approuve' | 'refuse';
  utilisateurNom?: string;
  utilisateurPrenom?: string;
  approuvePar?: string;
  dateApprobation?: string;
}

interface SoldeConges {
  congesAcquisAnnuels: number;
  congesPris: number;
  soldeRestant: number;
}

export const CongesPage: React.FC = () => {
  const { user, tenant } = useAuthStore();
  const [loading, setLoading] = useState(true);
  const [conges, setConges] = useState<Conge[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatut, setFilterStatut] = useState<string>('');
  const [filterType, setFilterType] = useState<string>('');
  const [selectedConge, setSelectedConge] = useState<Conge | null>(null);
  const [showApprovalModal, setShowApprovalModal] = useState(false);
  const [approvalAction, setApprovalAction] = useState<'approve' | 'reject'>('approve');
  const [approvalComment, setApprovalComment] = useState('');

  const [formData, setFormData] = useState({
    utilisateurId: user?.id || '',
    typeConge: 'conge_annuel',
    dateDebut: '',
    dateFin: '',
    nbJours: 0,
    motif: ''
  });

  useEffect(() => {
    loadConges();
  }, [filterStatut, filterType]);

  const loadConges = async () => {
    setLoading(true);
    try {
      const filters: any = {};
      if (filterStatut) filters.statut = filterStatut;
      if (filterType) filters.typeConge = filterType;

      const response = await api.get('/rh/conges', { params: filters });
      setConges(response.data || []);
    } catch (error: any) {
      toast.error('Erreur lors du chargement des congés');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const calculateDays = (debut: string, fin: string): number => {
    if (!debut || !fin) return 0;
    const start = new Date(debut);
    const end = new Date(fin);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
    return diffDays;
  };

  useEffect(() => {
    if (formData.dateDebut && formData.dateFin) {
      const days = calculateDays(formData.dateDebut, formData.dateFin);
      setFormData(prev => ({ ...prev, nbJours: days }));
    }
  }, [formData.dateDebut, formData.dateFin]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await api.post('/rh/conges', formData);
      toast.success('Demande de congé créée avec succès');
      setShowForm(false);
      resetForm();
      loadConges();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Erreur lors de l\'enregistrement');
    } finally {
      setLoading(false);
    }
  };

  const handleApproval = async () => {
    if (!selectedConge) return;
    setLoading(true);

    try {
      if (approvalAction === 'approve') {
        await api.patch(`/rh/conges/${selectedConge.id}/approuver`, {
          approuvePar: user?.id,
          commentaire: approvalComment
        });
        toast.success('Congé approuvé');
      } else {
        await api.patch(`/rh/conges/${selectedConge.id}/refuser`, {
          approuvePar: user?.id,
          motif: approvalComment
        });
        toast.success('Congé refusé');
      }
      setShowApprovalModal(false);
      setSelectedConge(null);
      setApprovalComment('');
      loadConges();
    } catch (error: any) {
      toast.error('Erreur lors du traitement');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      utilisateurId: user?.id || '',
      typeConge: 'conge_annuel',
      dateDebut: '',
      dateFin: '',
      nbJours: 0,
      motif: ''
    });
  };

  const filteredConges = conges.filter(c => {
    const searchLower = searchTerm.toLowerCase();
    return (
      c.utilisateurNom?.toLowerCase().includes(searchLower) ||
      c.utilisateurPrenom?.toLowerCase().includes(searchLower) ||
      c.typeConge?.toLowerCase().includes(searchLower)
    );
  });

  const stats = {
    total: conges.length,
    enAttente: conges.filter(c => c.statut === 'demande').length,
    approuves: conges.filter(c => c.statut === 'approuve').length,
    refuses: conges.filter(c => c.statut === 'refuse').length
  };

  const getStatutBadge = (statut: string) => {
    const styles = {
      demande: { bg: '#fef3c7', color: '#f59e0b' },
      approuve: { bg: '#d1fae5', color: '#065f46' },
      refuse: { bg: '#fee2e2', color: '#991b1b' }
    };
    const style = styles[statut as keyof typeof styles] || styles.demande;
    return (
      <span style={{
        padding: '4px 10px',
        borderRadius: 12,
        fontSize: 11,
        fontWeight: 600,
        background: style.bg,
        color: style.color
      }}>
        {statut === 'demande' ? 'En attente' : statut === 'approuve' ? 'Approuvé' : 'Refusé'}
      </span>
    );
  };

  const getTypeLabel = (type: string) => {
    const types: any = {
      conge_annuel: 'Congé Annuel',
      conge_maladie: 'Congé Maladie',
      conge_maternite: 'Congé Maternité',
      conge_paternite: 'Congé Paternité',
      conge_sans_solde: 'Congé Sans Solde',
      autre: 'Autre'
    };
    return types[type] || type;
  };

  return (
    <div style={{ padding: 32 }}>
      {/* Header */}
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontSize: 28, fontWeight: 800, color: '#1e293b', margin: '0 0 8px', display: 'flex', alignItems: 'center', gap: 12 }}>
          <MapPin size={32} /> Gestion des Congés
        </h1>
        <p style={{ color: '#64748b', fontSize: 14 }}>
          Demandes de congés et validation
        </p>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, marginBottom: 24 }}>
        <div style={{ background: '#fff', borderRadius: 12, padding: 20, boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
          <div style={{ fontSize: 12, color: '#64748b', marginBottom: 8 }}>Total Demandes</div>
          <div style={{ fontSize: 28, fontWeight: 800, color: '#1e293b' }}>{stats.total}</div>
        </div>
        <div style={{ background: '#fff', borderRadius: 12, padding: 20, boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
          <div style={{ fontSize: 12, color: '#64748b', marginBottom: 8 }}>En Attente</div>
          <div style={{ fontSize: 28, fontWeight: 800, color: '#f59e0b' }}>{stats.enAttente}</div>
        </div>
        <div style={{ background: '#fff', borderRadius: 12, padding: 20, boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
          <div style={{ fontSize: 12, color: '#64748b', marginBottom: 8 }}>Approuvés</div>
          <div style={{ fontSize: 28, fontWeight: 800, color: '#10b981' }}>{stats.approuves}</div>
        </div>
        <div style={{ background: '#fff', borderRadius: 12, padding: 20, boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
          <div style={{ fontSize: 12, color: '#64748b', marginBottom: 8 }}>Refusés</div>
          <div style={{ fontSize: 28, fontWeight: 800, color: '#dc2626' }}>{stats.refuses}</div>
        </div>
      </div>

      {/* Filters & Actions */}
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
        <select
          value={filterStatut}
          onChange={(e) => setFilterStatut(e.target.value)}
          style={{ padding: '11px 14px', border: '2px solid #e5e7eb', borderRadius: 9, fontSize: 14 }}
        >
          <option value="">Tous les statuts</option>
          <option value="demande">En attente</option>
          <option value="approuve">Approuvés</option>
          <option value="refuse">Refusés</option>
        </select>
        <select
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
          style={{ padding: '11px 14px', border: '2px solid #e5e7eb', borderRadius: 9, fontSize: 14 }}
        >
          <option value="">Tous les types</option>
          <option value="conge_annuel">Congé Annuel</option>
          <option value="conge_maladie">Congé Maladie</option>
          <option value="conge_maternite">Congé Maternité</option>
          <option value="conge_paternite">Congé Paternité</option>
        </select>
        <button
          onClick={() => { resetForm(); setShowForm(true); }}
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
          <Plus size={18} /> Nouvelle Demande
        </button>
      </div>

      {/* Form Modal */}
      {showForm && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: 20 }}>
          <div style={{ background: '#fff', borderRadius: 14, padding: 24, maxWidth: 600, width: '100%', maxHeight: '90vh', overflow: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <h3 style={{ fontSize: 18, fontWeight: 700, color: '#0f172a', margin: 0 }}>
                Nouvelle demande de congé
              </h3>
              <button onClick={() => { setShowForm(false); resetForm(); }} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                <X size={24} color="#64748b" />
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div style={{ display: 'grid', gap: 16 }}>
                <div>
                  <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 6 }}>
                    Type de congé *
                  </label>
                  <select
                    required
                    value={formData.typeConge}
                    onChange={(e) => setFormData(prev => ({ ...prev, typeConge: e.target.value }))}
                    style={{ width: '100%', padding: '11px 14px', border: '2px solid #e5e7eb', borderRadius: 9, fontSize: 14 }}
                  >
                    <option value="conge_annuel">Congé Annuel</option>
                    <option value="conge_maladie">Congé Maladie</option>
                    <option value="conge_maternite">Congé Maternité</option>
                    <option value="conge_paternite">Congé Paternité</option>
                    <option value="conge_sans_solde">Congé Sans Solde</option>
                    <option value="autre">Autre</option>
                  </select>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 16 }}>
                  <div>
                    <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 6 }}>
                      Date de début *
                    </label>
                    <input
                      type="date"
                      required
                      value={formData.dateDebut}
                      onChange={(e) => setFormData(prev => ({ ...prev, dateDebut: e.target.value }))}
                      style={{ width: '100%', padding: '11px 14px', border: '2px solid #e5e7eb', borderRadius: 9, fontSize: 14 }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 6 }}>
                      Date de fin *
                    </label>
                    <input
                      type="date"
                      required
                      value={formData.dateFin}
                      onChange={(e) => setFormData(prev => ({ ...prev, dateFin: e.target.value }))}
                      style={{ width: '100%', padding: '11px 14px', border: '2px solid #e5e7eb', borderRadius: 9, fontSize: 14 }}
                    />
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 6 }}>
                    Nombre de jours
                  </label>
                  <input
                    type="number"
                    readOnly
                    value={formData.nbJours}
                    style={{ width: '100%', padding: '11px 14px', border: '2px solid #e5e7eb', borderRadius: 9, fontSize: 14, background: '#f8fafc' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 6 }}>
                    Motif *
                  </label>
                  <textarea
                    required
                    value={formData.motif}
                    onChange={(e) => setFormData(prev => ({ ...prev, motif: e.target.value }))}
                    rows={3}
                    style={{ width: '100%', padding: '11px 14px', border: '2px solid #e5e7eb', borderRadius: 9, fontSize: 14, resize: 'vertical' }}
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
                  <Save size={18} /> {loading ? 'Enregistrement...' : 'Soumettre'}
                </button>
                <button
                  type="button"
                  onClick={() => { setShowForm(false); resetForm(); }}
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

      {/* Approval Modal */}
      {showApprovalModal && selectedConge && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: 20 }}>
          <div style={{ background: '#fff', borderRadius: 14, padding: 24, maxWidth: 500, width: '100%' }}>
            <h3 style={{ fontSize: 18, fontWeight: 700, color: '#0f172a', marginBottom: 16 }}>
              {approvalAction === 'approve' ? 'Approuver' : 'Refuser'} la demande
            </h3>
            <div style={{ marginBottom: 16, padding: 16, background: '#f8fafc', borderRadius: 10 }}>
              <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 8 }}>
                {selectedConge.utilisateurPrenom} {selectedConge.utilisateurNom}
              </div>
              <div style={{ fontSize: 13, color: '#64748b' }}>
                {getTypeLabel(selectedConge.typeConge)} • {selectedConge.nbJours} jours
              </div>
              <div style={{ fontSize: 13, color: '#64748b' }}>
                Du {new Date(selectedConge.dateDebut).toLocaleDateString('fr-FR')} au {new Date(selectedConge.dateFin).toLocaleDateString('fr-FR')}
              </div>
            </div>
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 6 }}>
                Commentaire {approvalAction === 'reject' && '*'}
              </label>
              <textarea
                required={approvalAction === 'reject'}
                value={approvalComment}
                onChange={(e) => setApprovalComment(e.target.value)}
                rows={3}
                placeholder={approvalAction === 'approve' ? 'Commentaire optionnel...' : 'Motif du refus...'}
                style={{ width: '100%', padding: '11px 14px', border: '2px solid #e5e7eb', borderRadius: 9, fontSize: 14, resize: 'vertical' }}
              />
            </div>
            <div style={{ display: 'flex', gap: 12 }}>
              <button
                onClick={handleApproval}
                disabled={loading || (approvalAction === 'reject' && !approvalComment)}
                style={{
                  flex: 1,
                  padding: '13px',
                  background: approvalAction === 'approve' ? 'linear-gradient(135deg, #10b981, #059669)' : 'linear-gradient(135deg, #dc2626, #991b1b)',
                  color: '#fff',
                  border: 'none',
                  borderRadius: 10,
                  fontSize: 14,
                  fontWeight: 700,
                  cursor: loading ? 'not-allowed' : 'pointer',
                  opacity: (loading || (approvalAction === 'reject' && !approvalComment)) ? 0.5 : 1
                }}
              >
                {loading ? 'Traitement...' : (approvalAction === 'approve' ? 'Approuver' : 'Refuser')}
              </button>
              <button
                onClick={() => { setShowApprovalModal(false); setSelectedConge(null); setApprovalComment(''); }}
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
          </div>
        </div>
      )}

      {/* Table */}
      <div style={{ background: '#fff', borderRadius: 14, overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: '#f8fafc' }}>
              <th style={{ padding: '14px 16px', textAlign: 'left', fontSize: 13, fontWeight: 600, color: '#64748b', borderBottom: '1px solid #e5e7eb' }}>Employé</th>
              <th style={{ padding: '14px 16px', textAlign: 'left', fontSize: 13, fontWeight: 600, color: '#64748b', borderBottom: '1px solid #e5e7eb' }}>Type</th>
              <th style={{ padding: '14px 16px', textAlign: 'center', fontSize: 13, fontWeight: 600, color: '#64748b', borderBottom: '1px solid #e5e7eb' }}>Période</th>
              <th style={{ padding: '14px 16px', textAlign: 'center', fontSize: 13, fontWeight: 600, color: '#64748b', borderBottom: '1px solid #e5e7eb' }}>Durée</th>
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
            ) : filteredConges.length === 0 ? (
              <tr>
                <td colSpan={6} style={{ padding: 40, textAlign: 'center' }}>
                  <MapPin size={48} color="#cbd5e1" style={{ margin: '0 auto 16px' }} />
                  <p style={{ color: '#64748b' }}>Aucune demande de congé trouvée</p>
                </td>
              </tr>
            ) : (
              filteredConges.map((conge) => (
                <tr key={conge.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                  <td style={{ padding: '14px 16px' }}>
                    <div style={{ fontWeight: 600, color: '#0f172a' }}>
                      {conge.utilisateurPrenom} {conge.utilisateurNom}
                    </div>
                  </td>
                  <td style={{ padding: '14px 16px', fontSize: 13, color: '#64748b' }}>
                    {getTypeLabel(conge.typeConge)}
                  </td>
                  <td style={{ padding: '14px 16px', textAlign: 'center', fontSize: 13 }}>
                    <div>{new Date(conge.dateDebut).toLocaleDateString('fr-FR')}</div>
                    <div style={{ color: '#64748b', fontSize: 12 }}>
                      au {new Date(conge.dateFin).toLocaleDateString('fr-FR')}
                    </div>
                  </td>
                  <td style={{ padding: '14px 16px', textAlign: 'center', fontWeight: 600, color: '#0f172a' }}>
                    {conge.nbJours} jours
                  </td>
                  <td style={{ padding: '14px 16px', textAlign: 'center' }}>
                    {getStatutBadge(conge.statut)}
                  </td>
                  <td style={{ padding: '14px 16px', textAlign: 'right' }}>
                    <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                      {conge.statut === 'demande' && (
                        <>
                          <button
                            onClick={() => {
                              setSelectedConge(conge);
                              setApprovalAction('approve');
                              setShowApprovalModal(true);
                            }}
                            style={{
                              padding: '8px',
                              background: '#d1fae5',
                              color: '#065f46',
                              border: 'none',
                              borderRadius: 6,
                              cursor: 'pointer'
                            }}
                            title="Approuver"
                          >
                            <CheckCircle size={16} />
                          </button>
                          <button
                            onClick={() => {
                              setSelectedConge(conge);
                              setApprovalAction('reject');
                              setShowApprovalModal(true);
                            }}
                            style={{
                              padding: '8px',
                              background: '#fee2e2',
                              color: '#dc2626',
                              border: 'none',
                              borderRadius: 6,
                              cursor: 'pointer'
                            }}
                            title="Refuser"
                          >
                            <XCircle size={16} />
                          </button>
                        </>
                      )}
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

export default CongesPage;

// Made with Bob
