import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useAuthStore } from '../../store/authStore';
import { CheckCircle, XCircle, Clock, Eye, AlertTriangle, RefreshCw, DollarSign, Users } from 'lucide-react';
import { api } from '../../api/client';

interface PaiementInscription {
  id: string;
  inscription_id: string;
  etudiant_id: string;
  etudiant_nom: string;
  etudiant_prenom: string;
  etudiant_matricule: string;
  montant: number;
  methode_paiement: string;
  reference_paiement: string;
  date_paiement: string;
  preuve_url: string | null;
  statut: string;
  annee_niveau: number;
  parcours_nom: string;
  annee_academique: string;
  valide_par: string | null;
  date_validation: string | null;
  note_validation: string | null;
  motif_rejet: string | null;
  validateur_nom: string | null;
  validateur_prenom: string | null;
}

// Memoized StatCard component
const StatCard = React.memo(({ icon, label, value, subValue, color }: any) => (
  <div style={{
    background: '#fff',
    borderRadius: 16,
    padding: 20,
    boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
    display: 'flex',
    alignItems: 'center',
    gap: 16
  }}>
    <div style={{
      width: 56,
      height: 56,
      borderRadius: 14,
      background: `${color}15`,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      flexShrink: 0
    }}>
      {icon}
    </div>
    <div style={{ flex: 1 }}>
      <div style={{ fontSize: 13, color: '#64748b', marginBottom: 4, fontWeight: 500 }}>{label}</div>
      <div style={{ fontSize: 28, fontWeight: 800, color: '#1e293b', marginBottom: 2 }}>{value}</div>
      {subValue && <div style={{ fontSize: 12, color: '#64748b', fontWeight: 600 }}>{subValue}</div>}
    </div>
  </div>
));

export const ValidationPaiementsPage: React.FC = () => {
  const { tenant, user } = useAuthStore();
  const tenantId = tenant?.id || 'default';
  const [paiements, setPaiements] = useState<PaiementInscription[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [selectedPaiement, setSelectedPaiement] = useState<PaiementInscription | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [actionType, setActionType] = useState<'valider' | 'rejeter'>('valider');
  const [noteValidation, setNoteValidation] = useState('');
  const [motifRejet, setMotifRejet] = useState('');
  const [filterStatut, setFilterStatut] = useState<'en_attente' | 'tous'>('en_attente');
  const [stats, setStats] = useState<any>(null);

  useEffect(() => {
    loadPaiements();
    loadStats();
  }, [filterStatut]);

  const loadPaiements = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const url = filterStatut === 'en_attente'
        ? `/finance/paiements-inscription/en-attente`
        : `/finance/paiements-inscription`;

      const response = await api.get(url);
      setPaiements(Array.isArray(response.data) ? response.data : []);
      setError('');
    } catch (err: any) {
      setError(`Erreur de connexion: ${err.response?.data?.message || err.message || 'Serveur inaccessible'}`);
      setPaiements([]);
      console.error('Erreur:', err);
    } finally {
      setLoading(false);
    }
  }, [filterStatut]);

  const loadStats = useCallback(async () => {
    try {
      const response = await api.get(`/finance/paiements-inscription/statistiques`);
      setStats(response.data);
    } catch (err) {
      console.error('Erreur chargement stats:', err);
      setStats(null);
    }
  }, []);

  const handleAction = useCallback((paiement: PaiementInscription, type: 'valider' | 'rejeter') => {
    setSelectedPaiement(paiement);
    setActionType(type);
    setShowModal(true);
    setNoteValidation('');
    setMotifRejet('');
  }, []);

  const handleSubmitAction = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPaiement) return;

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const endpoint = actionType === 'valider' ? 'valider' : 'rejeter';
      const body = actionType === 'valider'
        ? { caissierId: user?.id, noteValidation }
        : { caissierId: user?.id, motifRejet };

      const response = await api.post(
        `/finance/paiements-inscription/${selectedPaiement.id}/${endpoint}`,
        body
      );

      setSuccess(response.data.message || `Paiement ${actionType === 'valider' ? 'validé' : 'rejeté'} avec succès`);
      setShowModal(false);
      loadPaiements();
      loadStats();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erreur lors de l\'action');
      console.error('Erreur:', err);
    } finally {
      setLoading(false);
    }
  }, [selectedPaiement, actionType, user, noteValidation, motifRejet, loadPaiements, loadStats]);

  const getMethodePaiementLabel = useCallback((methode: string) => {
    switch (methode) {
      case 'virement_bancaire':
        return 'Virement bancaire';
      case 'mobile_money':
        return 'Mobile Money';
      default:
        return methode;
    }
  }, []);

  const getStatusBadge = useCallback((statut: string) => {
    const styles = {
      en_attente: { bg: '#fef3c7', color: '#92400e', icon: <Clock size={14} /> },
      valide: { bg: '#d1fae5', color: '#065f46', icon: <CheckCircle size={14} /> },
      rejete: { bg: '#fee2e2', color: '#991b1b', icon: <XCircle size={14} /> }
    };
    const style = styles[statut as keyof typeof styles] || { bg: '#f3f4f6', color: '#374151', icon: null };
    
    return (
      <span style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 4,
        padding: '4px 12px',
        borderRadius: 20,
        fontSize: 12,
        fontWeight: 600,
        background: style.bg,
        color: style.color
      }}>
        {style.icon}
        {statut === 'en_attente' ? 'En attente' : statut === 'valide' ? 'Validé' : 'Rejeté'}
      </span>
    );
  }, []);

  const fmt = useCallback((n: number) => Number(n || 0).toLocaleString('fr-FR') + ' Ar', []);

  return (
    <div style={{ padding: 32, background: '#F8FAFC', minHeight: '100vh' }}>
      {/* Header */}
      <div style={{ marginBottom: 32 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
          <div>
            <h1 style={{ fontSize: 28, fontWeight: 900, color: '#1e293b', margin: 0, display: 'flex', alignItems: 'center', gap: 12 }}>
              <CheckCircle size={32} color="#1a5276" />
              Validation des Paiements
            </h1>
            <p style={{ color: '#64748b', fontSize: 16, margin: '4px 0 0' }}>
              Gérez les paiements soumis par les étudiants
            </p>
          </div>
          <button
            onClick={() => { loadPaiements(); loadStats(); }}
            style={{
              padding: '12px 24px',
              background: '#1a5276',
              color: '#fff',
              border: 'none',
              borderRadius: 12,
              fontSize: 14,
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              boxShadow: '0 4px 12px rgba(26,82,118,0.3)'
            }}
          >
            <RefreshCw size={18} />
            Actualiser
          </button>
        </div>
      </div>

      {/* Alertes */}
      {error && (
        <div style={{
          marginBottom: 24,
          padding: 16,
          background: '#fee2e2',
          border: '2px solid #fca5a5',
          borderRadius: 12,
          display: 'flex',
          alignItems: 'start',
          gap: 12
        }}>
          <AlertTriangle size={20} color="#dc2626" style={{ flexShrink: 0, marginTop: 2 }} />
          <div style={{ flex: 1 }}>
            <p style={{ color: '#991b1b', fontSize: 14, fontWeight: 600, margin: 0 }}>{error}</p>
          </div>
          <button onClick={() => setError('')} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
            <XCircle size={18} color="#dc2626" />
          </button>
        </div>
      )}

      {success && (
        <div style={{
          marginBottom: 24,
          padding: 16,
          background: '#d1fae5',
          border: '2px solid #6ee7b7',
          borderRadius: 12,
          display: 'flex',
          alignItems: 'start',
          gap: 12
        }}>
          <CheckCircle size={20} color="#059669" style={{ flexShrink: 0, marginTop: 2 }} />
          <div style={{ flex: 1 }}>
            <p style={{ color: '#065f46', fontSize: 14, fontWeight: 600, margin: 0 }}>{success}</p>
          </div>
          <button onClick={() => setSuccess('')} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
            <XCircle size={18} color="#059669" />
          </button>
        </div>
      )}

      {/* Statistiques */}
      {stats && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 20, marginBottom: 32 }}>
          <StatCard
            icon={<Clock size={28} color="#f59e0b" />}
            label="EN ATTENTE"
            value={stats.en_attente || 0}
            subValue={fmt(stats.total_en_attente || 0)}
            color="#f59e0b"
          />
          <StatCard
            icon={<CheckCircle size={28} color="#10b981" />}
            label="VALIDÉS"
            value={stats.valides || 0}
            subValue={fmt(stats.total_valide || 0)}
            color="#10b981"
          />
          <StatCard
            icon={<XCircle size={28} color="#ef4444" />}
            label="REJETÉS"
            value={stats.rejetes || 0}
            subValue=""
            color="#ef4444"
          />
          <StatCard
            icon={<DollarSign size={28} color="#8b5cf6" />}
            label="TOTAL"
            value={(stats.en_attente || 0) + (stats.valides || 0) + (stats.rejetes || 0)}
            subValue={fmt((stats.total_en_attente || 0) + (stats.total_valide || 0))}
            color="#8b5cf6"
          />
        </div>
      )}

      {/* Filtres */}
      <div style={{ background: '#fff', borderRadius: 16, padding: 20, marginBottom: 24, boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }}>
        <div style={{ display: 'flex', gap: 12 }}>
          <button
            onClick={() => setFilterStatut('en_attente')}
            style={{
              padding: '12px 24px',
              background: filterStatut === 'en_attente' ? '#1a5276' : '#f1f5f9',
              color: filterStatut === 'en_attente' ? '#fff' : '#64748b',
              border: 'none',
              borderRadius: 10,
              fontSize: 14,
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
          >
            En attente ({stats?.en_attente || 0})
          </button>
          <button
            onClick={() => setFilterStatut('tous')}
            style={{
              padding: '12px 24px',
              background: filterStatut === 'tous' ? '#1a5276' : '#f1f5f9',
              color: filterStatut === 'tous' ? '#fff' : '#64748b',
              border: 'none',
              borderRadius: 10,
              fontSize: 14,
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
          >
            Tous les paiements
          </button>
        </div>
      </div>

      {/* Liste des paiements */}
      <div style={{ background: '#fff', borderRadius: 16, overflow: 'hidden', boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }}>
        {loading ? (
          <div style={{ padding: 64, textAlign: 'center' }}>
            <div style={{
              width: 48,
              height: 48,
              border: '4px solid #e2e8f0',
              borderTop: '4px solid #1a5276',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite',
              margin: '0 auto 16px'
            }} />
            <p style={{ color: '#64748b', fontSize: 14 }}>Chargement...</p>
          </div>
        ) : paiements.length === 0 ? (
          <div style={{ padding: 64, textAlign: 'center' }}>
            <Clock size={64} color="#cbd5e1" style={{ margin: '0 auto 16px' }} />
            <p style={{ color: '#64748b', fontSize: 16, fontWeight: 600 }}>Aucun paiement à afficher</p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: '#f8fafc', borderBottom: '2px solid #e2e8f0' }}>
                  <th style={{ padding: '16px', textAlign: 'left', fontSize: 12, fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Étudiant</th>
                  <th style={{ padding: '16px', textAlign: 'left', fontSize: 12, fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Parcours</th>
                  <th style={{ padding: '16px', textAlign: 'left', fontSize: 12, fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Montant</th>
                  <th style={{ padding: '16px', textAlign: 'left', fontSize: 12, fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Méthode</th>
                  <th style={{ padding: '16px', textAlign: 'left', fontSize: 12, fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Référence</th>
                  <th style={{ padding: '16px', textAlign: 'left', fontSize: 12, fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Date</th>
                  <th style={{ padding: '16px', textAlign: 'left', fontSize: 12, fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Statut</th>
                  <th style={{ padding: '16px', textAlign: 'left', fontSize: 12, fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {paiements.map((paiement, index) => (
                  <tr key={paiement.id} style={{ borderBottom: '1px solid #f1f5f9', background: index % 2 === 0 ? '#fff' : '#fafbfc' }}>
                    <td style={{ padding: '16px' }}>
                      <div style={{ fontSize: 14, fontWeight: 600, color: '#1e293b', marginBottom: 2 }}>
                        {paiement.etudiant_prenom} {paiement.etudiant_nom}
                      </div>
                      <div style={{ fontSize: 12, color: '#64748b' }}>{paiement.etudiant_matricule}</div>
                    </td>
                    <td style={{ padding: '16px' }}>
                      <div style={{ fontSize: 14, color: '#1e293b', marginBottom: 2 }}>{paiement.parcours_nom}</div>
                      <div style={{ fontSize: 12, color: '#64748b' }}>{paiement.annee_academique}</div>
                    </td>
                    <td style={{ padding: '16px' }}>
                      <div style={{ fontSize: 16, fontWeight: 700, color: '#1a5276' }}>{fmt(paiement.montant)}</div>
                    </td>
                    <td style={{ padding: '16px' }}>
                      <div style={{ fontSize: 13, color: '#475569' }}>{getMethodePaiementLabel(paiement.methode_paiement)}</div>
                    </td>
                    <td style={{ padding: '16px' }}>
                      <div style={{ fontSize: 12, fontFamily: 'monospace', color: '#64748b' }}>{paiement.reference_paiement}</div>
                    </td>
                    <td style={{ padding: '16px' }}>
                      <div style={{ fontSize: 13, color: '#475569' }}>
                        {new Date(paiement.date_paiement).toLocaleDateString('fr-FR')}
                      </div>
                    </td>
                    <td style={{ padding: '16px' }}>{getStatusBadge(paiement.statut)}</td>
                    <td style={{ padding: '16px' }}>
                      <div style={{ display: 'flex', gap: 8 }}>
                        {paiement.statut === 'en_attente' && (
                          <>
                            <button
                              onClick={() => handleAction(paiement, 'valider')}
                              style={{
                                padding: 8,
                                background: '#d1fae5',
                                color: '#059669',
                                border: 'none',
                                borderRadius: 8,
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                              }}
                              title="Valider"
                            >
                              <CheckCircle size={18} />
                            </button>
                            <button
                              onClick={() => handleAction(paiement, 'rejeter')}
                              style={{
                                padding: 8,
                                background: '#fee2e2',
                                color: '#dc2626',
                                border: 'none',
                                borderRadius: 8,
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                              }}
                              title="Rejeter"
                            >
                              <XCircle size={18} />
                            </button>
                          </>
                        )}
                        {paiement.preuve_url && (
                          <a
                            href={paiement.preuve_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{
                              padding: 8,
                              background: '#dbeafe',
                              color: '#2563eb',
                              border: 'none',
                              borderRadius: 8,
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              textDecoration: 'none'
                            }}
                            title="Voir la preuve"
                          >
                            <Eye size={18} />
                          </a>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal de confirmation */}
      {showModal && selectedPaiement && (
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
          zIndex: 1000,
          padding: 16
        }}>
          <div style={{
            background: '#fff',
            borderRadius: 16,
            maxWidth: 500,
            width: '100%',
            boxShadow: '0 20px 60px rgba(0,0,0,0.3)'
          }}>
            <div style={{ padding: 24, borderBottom: '2px solid #f1f5f9' }}>
              <h3 style={{ fontSize: 20, fontWeight: 700, color: '#1e293b', margin: 0 }}>
                {actionType === 'valider' ? '✅ Valider le paiement' : '❌ Rejeter le paiement'}
              </h3>
            </div>
            <form onSubmit={handleSubmitAction}>
              <div style={{ padding: 24 }}>
                <div style={{ padding: 16, background: '#f8fafc', borderRadius: 12, marginBottom: 20 }}>
                  <div style={{ marginBottom: 12 }}>
                    <p style={{ fontSize: 12, color: '#64748b', margin: '0 0 4px' }}>Étudiant:</p>
                    <p style={{ fontSize: 16, fontWeight: 600, color: '#1e293b', margin: 0 }}>
                      {selectedPaiement.etudiant_prenom} {selectedPaiement.etudiant_nom}
                    </p>
                  </div>
                  <div style={{ marginBottom: 12 }}>
                    <p style={{ fontSize: 12, color: '#64748b', margin: '0 0 4px' }}>Montant:</p>
                    <p style={{ fontSize: 18, fontWeight: 700, color: '#1a5276', margin: 0 }}>
                      {fmt(selectedPaiement.montant)}
                    </p>
                  </div>
                  <div>
                    <p style={{ fontSize: 12, color: '#64748b', margin: '0 0 4px' }}>Référence:</p>
                    <p style={{ fontSize: 13, fontFamily: 'monospace', color: '#475569', margin: 0 }}>
                      {selectedPaiement.reference_paiement}
                    </p>
                  </div>
                </div>

                {actionType === 'valider' ? (
                  <div>
                    <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 8 }}>
                      Note de validation (optionnel)
                    </label>
                    <textarea
                      value={noteValidation}
                      onChange={(e) => setNoteValidation(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '12px 16px',
                        border: '2px solid #e2e8f0',
                        borderRadius: 10,
                        fontSize: 14,
                        outline: 'none',
                        resize: 'vertical',
                        fontFamily: 'inherit'
                      }}
                      rows={3}
                      placeholder="Ajouter une note..."
                    />
                  </div>
                ) : (
                  <div>
                    <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 8 }}>
                      Motif du rejet (requis)
                    </label>
                    <textarea
                      value={motifRejet}
                      onChange={(e) => setMotifRejet(e.target.value)}
                      required
                      style={{
                        width: '100%',
                        padding: '12px 16px',
                        border: '2px solid #e2e8f0',
                        borderRadius: 10,
                        fontSize: 14,
                        outline: 'none',
                        resize: 'vertical',
                        fontFamily: 'inherit'
                      }}
                      rows={3}
                      placeholder="Expliquez pourquoi ce paiement est rejeté..."
                    />
                  </div>
                )}
              </div>

              <div style={{ padding: '16px 24px 24px', display: 'flex', gap: 12 }}>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  style={{
                    flex: 1,
                    padding: '12px',
                    background: '#f1f5f9',
                    color: '#64748b',
                    border: 'none',
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
                  disabled={loading || (actionType === 'rejeter' && !motifRejet)}
                  style={{
                    flex: 1,
                    padding: '12px',
                    background: actionType === 'valider' ? '#10b981' : '#ef4444',
                    color: '#fff',
                    border: 'none',
                    borderRadius: 10,
                    fontSize: 14,
                    fontWeight: 600,
                    cursor: loading || (actionType === 'rejeter' && !motifRejet) ? 'not-allowed' : 'pointer',
                    opacity: loading || (actionType === 'rejeter' && !motifRejet) ? 0.5 : 1
                  }}
                >
                  {loading ? 'Traitement...' : actionType === 'valider' ? 'Valider' : 'Rejeter'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

// Made with Bob
