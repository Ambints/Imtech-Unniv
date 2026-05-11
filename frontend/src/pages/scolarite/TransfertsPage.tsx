import React, { useState, useEffect } from 'react';
import { useAuthStore } from '../../store/authStore';
import { api } from '../../api/client';
import { ArrowRightLeft, Users, CheckCircle, Clock, Search, Plus } from 'lucide-react';

interface Transfert {
  id: string;
  etudiantId: string;
  etudiantNom: string;
  etudiantPrenom: string;
  matricule: string;
  type: string;
  etablissementOrigine?: string;
  etablissementDestination?: string;
  datedemande: Date;
  statut: string;
  creditsValides?: number;
}

const TransfertsPage: React.FC = () => {
  const { tenant } = useAuthStore();
  const [transferts, setTransferts] = useState<Transfert[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');

  useEffect(() => {
    if (tenant?.id) {
      loadTransferts();
    } else {
      // Si pas de tenant, arrêter le chargement après un délai
      const timer = setTimeout(() => {
        console.warn('[TransfertsPage] No tenant ID available');
        setLoading(false);
        setTransferts([]);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [tenant]);

  const loadTransferts = async () => {
    try {
      setLoading(true);
      if (!tenant?.id) {
        console.error('[TransfertsPage] No tenant ID');
        setTransferts([]);
        setLoading(false);
        return;
      }
      const response = await api.get(`/scolarite/${tenant.id}/transferts`);
      setTransferts(response.data || []);
    } catch (error) {
      console.error('Erreur chargement transferts:', error);
      setTransferts([]);
    } finally {
      setLoading(false);
    }
  };

  const getTypeLabel = (type: string) => {
    const types: Record<string, string> = {
      transfert_entrant: 'Transfert Entrant',
      transfert_sortant: 'Transfert Sortant',
      equivalence: 'Équivalence de Crédits'
    };
    return types[type] || type;
  };

  const getStatutColor = (statut: string) => {
    switch (statut) {
      case 'en_attente': return '#f59e0b';
      case 'approuve': return '#10b981';
      case 'rejete': return '#ef4444';
      default: return '#6b7280';
    }
  };

  const filteredTransferts = transferts.filter(t => {
    const matchesSearch = t.etudiantNom.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         t.etudiantPrenom.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         t.matricule.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'all' || t.type === filterType;
    return matchesSearch && matchesType;
  });

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ width: 40, height: 40, border: '3px solid #e5e7eb', borderTop: '3px solid #3b82f6', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto 16px' }}></div>
          <p style={{ color: '#6b7280' }}>Chargement...</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ padding: 24 }}>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 28, fontWeight: 700, color: '#1e293b', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 12 }}>
          <ArrowRightLeft size={32} color="#3b82f6" />
          Transferts & Équivalences
        </h1>
        <p style={{ color: '#64748b' }}>Gestion des transferts d'étudiants et reconnaissance d'équivalences</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 16, marginBottom: 24 }}>
        <div style={{ background: 'white', padding: 20, borderRadius: 12, border: '1px solid #e2e8f0' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
            <div>
              <p style={{ fontSize: 13, color: '#64748b', marginBottom: 4 }}>Total Demandes</p>
              <p style={{ fontSize: 28, fontWeight: 700, color: '#1e293b' }}>{transferts.length}</p>
            </div>
            <Users size={24} color="#3b82f6" />
          </div>
        </div>

        <div style={{ background: 'white', padding: 20, borderRadius: 12, border: '1px solid #e2e8f0' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
            <div>
              <p style={{ fontSize: 13, color: '#64748b', marginBottom: 4 }}>Approuvées</p>
              <p style={{ fontSize: 28, fontWeight: 700, color: '#10b981' }}>
                {transferts.filter(t => t.statut === 'approuve').length}
              </p>
            </div>
            <CheckCircle size={24} color="#10b981" />
          </div>
        </div>

        <div style={{ background: 'white', padding: 20, borderRadius: 12, border: '1px solid #e2e8f0' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
            <div>
              <p style={{ fontSize: 13, color: '#64748b', marginBottom: 4 }}>En attente</p>
              <p style={{ fontSize: 28, fontWeight: 700, color: '#f59e0b' }}>
                {transferts.filter(t => t.statut === 'en_attente').length}
              </p>
            </div>
            <Clock size={24} color="#f59e0b" />
          </div>
        </div>
      </div>

      <div style={{ background: 'white', borderRadius: 12, border: '1px solid #e2e8f0', overflow: 'hidden' }}>
        <div style={{ padding: 20, borderBottom: '1px solid #e2e8f0' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <h2 style={{ fontSize: 18, fontWeight: 600, color: '#1e293b' }}>Liste des Demandes</h2>
            <button
              style={{
                padding: '8px 16px',
                background: '#3b82f6',
                color: 'white',
                border: 'none',
                borderRadius: 8,
                fontSize: 14,
                fontWeight: 500,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 8
              }}
              onClick={() => alert('Nouvelle demande à implémenter')}
            >
              <Plus size={16} />
              Nouvelle Demande
            </button>
          </div>

          <div style={{ display: 'flex', gap: 12 }}>
            <div style={{ flex: 1, position: 'relative' }}>
              <Search size={18} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
              <input
                type="text"
                placeholder="Rechercher par nom ou matricule..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px 12px 10px 40px',
                  border: '1px solid #e2e8f0',
                  borderRadius: 8,
                  fontSize: 14
                }}
              />
            </div>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              style={{
                padding: '10px 16px',
                border: '1px solid #e2e8f0',
                borderRadius: 8,
                fontSize: 14,
                cursor: 'pointer'
              }}
            >
              <option value="all">Tous les types</option>
              <option value="transfert_entrant">Transfert Entrant</option>
              <option value="transfert_sortant">Transfert Sortant</option>
              <option value="equivalence">Équivalence</option>
            </select>
          </div>
        </div>

        {filteredTransferts.length === 0 ? (
          <div style={{ padding: 48, textAlign: 'center', color: '#94a3b8' }}>
            <ArrowRightLeft size={48} style={{ margin: '0 auto 16px', opacity: 0.5 }} />
            <p>Aucune demande trouvée</p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead style={{ background: '#f8fafc' }}>
                <tr>
                  <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: 13, fontWeight: 600, color: '#475569' }}>Étudiant</th>
                  <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: 13, fontWeight: 600, color: '#475569' }}>Type</th>
                  <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: 13, fontWeight: 600, color: '#475569' }}>Établissement</th>
                  <th style={{ padding: '12px 16px', textAlign: 'center', fontSize: 13, fontWeight: 600, color: '#475569' }}>Crédits</th>
                  <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: 13, fontWeight: 600, color: '#475569' }}>Date Demande</th>
                  <th style={{ padding: '12px 16px', textAlign: 'center', fontSize: 13, fontWeight: 600, color: '#475569' }}>Statut</th>
                  <th style={{ padding: '12px 16px', textAlign: 'center', fontSize: 13, fontWeight: 600, color: '#475569' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredTransferts.map((transfert) => (
                  <tr key={transfert.id} style={{ borderTop: '1px solid #e2e8f0' }}>
                    <td style={{ padding: '12px 16px', fontSize: 14, color: '#334155' }}>
                      <div>
                        <div style={{ fontWeight: 500 }}>{transfert.etudiantNom} {transfert.etudiantPrenom}</div>
                        <div style={{ fontSize: 12, color: '#64748b' }}>{transfert.matricule}</div>
                      </div>
                    </td>
                    <td style={{ padding: '12px 16px', fontSize: 14, color: '#334155' }}>
                      <span style={{
                        padding: '4px 8px',
                        background: '#f1f5f9',
                        borderRadius: 6,
                        fontSize: 12
                      }}>
                        {getTypeLabel(transfert.type)}
                      </span>
                    </td>
                    <td style={{ padding: '12px 16px', fontSize: 14, color: '#334155' }}>
                      {transfert.etablissementOrigine || transfert.etablissementDestination || '-'}
                    </td>
                    <td style={{ padding: '12px 16px', fontSize: 14, textAlign: 'center', fontWeight: 600 }}>
                      {transfert.creditsValides || '-'}
                    </td>
                    <td style={{ padding: '12px 16px', fontSize: 14, color: '#334155' }}>
                      {new Date(transfert.datedemande).toLocaleDateString('fr-FR')}
                    </td>
                    <td style={{ padding: '12px 16px', textAlign: 'center' }}>
                      <span style={{
                        display: 'inline-block',
                        padding: '4px 12px',
                        borderRadius: 12,
                        fontSize: 12,
                        fontWeight: 500,
                        background: `${getStatutColor(transfert.statut)}20`,
                        color: getStatutColor(transfert.statut)
                      }}>
                        {transfert.statut.replace('_', ' ')}
                      </span>
                    </td>
                    <td style={{ padding: '12px 16px', textAlign: 'center' }}>
                      <button
                        style={{
                          padding: '6px 12px',
                          background: '#3b82f6',
                          color: 'white',
                          border: 'none',
                          borderRadius: 6,
                          fontSize: 13,
                          cursor: 'pointer'
                        }}
                      >
                        Détails
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default TransfertsPage;

// Made with Bob
