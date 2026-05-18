import React, { useState, useEffect, useCallback } from 'react';
import { useAuthStore } from '../../store/authStore';
import { financeApi } from '../../api/client';
import toast from 'react-hot-toast';
import { 
  Receipt, Search, Download, Printer, Eye, Calendar,
  User, DollarSign, CreditCard, FileText, Filter
} from 'lucide-react';

interface Recu {
  id: string;
  numeroRecu: string;
  reference: string;
  inscriptionId: string;
  montant: number;
  modePaiement: string;
  datePaiement: string;
  statut: string;
  caissierId: string;
  observations?: string;
  recuUrl?: string;
  // Infos étudiant (via JOIN)
  etudiantNom?: string;
  etudiantPrenom?: string;
  etudiantMatricule?: string;
  parcoursNom?: string;
  etudiantNomComplet?: string;
  anneeNiveau?: string;
}

export const RecusQuittancesPage: React.FC = () => {
  const { tenant } = useAuthStore();
  const tenantId = tenant?.id || '';
  
  const [recus, setRecus] = useState<Recu[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterMode, setFilterMode] = useState<string>('all');
  const [dateDebut, setDateDebut] = useState('');
  const [dateFin, setDateFin] = useState('');
  const [selectedRecu, setSelectedRecu] = useState<Recu | null>(null);
  const [showPreview, setShowPreview] = useState(false);

  const loadRecus = useCallback(async () => {
    if (!tenantId) return;
    
    setLoading(true);
    try {
      // Récupérer tous les paiements (qui contiennent les reçus)
      const response = await financeApi.getTousPaiements(tenantId);
      setRecus(response.data || []);
    } catch (error: any) {
      console.error('Erreur chargement:', error);
      toast.error(error.response?.data?.message || 'Erreur de chargement');
    } finally {
      setLoading(false);
    }
  }, [tenantId]);

  useEffect(() => {
    loadRecus();
  }, [loadRecus]);

  const handlePrint = (recu: Recu) => {
    setSelectedRecu(recu);
    setShowPreview(true);
    
    // Imprimer après un court délai pour laisser le modal s'afficher
    setTimeout(() => {
      window.print();
    }, 500);
  };

  const handleDownload = (recu: Recu) => {
    // Générer un PDF du reçu (à implémenter côté backend)
    toast.success('Téléchargement du reçu en cours...');
    // TODO: Appeler l'API pour générer et télécharger le PDF
  };

  const fmt = (n: number) => Number(n || 0).toLocaleString('fr-FR') + ' Ar';

  const filteredRecus = recus.filter(r => {
    const matchesSearch =
      r.numeroRecu?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.reference?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.etudiantNom?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.etudiantPrenom?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.etudiantMatricule?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesMode = filterMode === 'all' || r.modePaiement === filterMode;
    
    let matchesDate = true;
    if (dateDebut && dateFin) {
      const recuDate = new Date(r.datePaiement);
      const debut = new Date(dateDebut);
      const fin = new Date(dateFin);
      matchesDate = recuDate >= debut && recuDate <= fin;
    }
    
    return matchesSearch && matchesMode && matchesDate;
  });

  const stats = {
    total: recus.length,
    montant_total: recus.reduce((sum, r) => sum + Number(r.montant), 0),
    especes: recus.filter(r => r.modePaiement === 'especes').length,
    mobile_money: recus.filter(r => r.modePaiement === 'mobile_money').length,
    virement: recus.filter(r => r.modePaiement === 'virement').length,
    carte: recus.filter(r => r.modePaiement === 'carte_bancaire').length,
  };

  const getModeIcon = (mode: string) => {
    switch (mode) {
      case 'especes': return '💵';
      case 'mobile_money': return '📱';
      case 'virement': return '🏦';
      case 'carte_bancaire': return '💳';
      case 'cheque': return '📝';
      default: return '💰';
    }
  };

  const getModeLabel = (mode: string) => {
    switch (mode) {
      case 'especes': return 'Espèces';
      case 'mobile_money': return 'Mobile Money';
      case 'virement': return 'Virement';
      case 'carte_bancaire': return 'Carte Bancaire';
      case 'cheque': return 'Chèque';
      default: return mode;
    }
  };

  return (
    <div style={{ padding: 32, background: '#F8FAFC', minHeight: '100vh' }}>
      {/* Header */}
      <div style={{ marginBottom: 32 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <div>
            <h1 style={{ fontSize: 28, fontWeight: 900, color: '#1e293b', margin: 0, display: 'flex', alignItems: 'center', gap: 12 }}>
              <Receipt size={32} color="#1a5276" />
              Reçus & Quittances
            </h1>
            <p style={{ color: '#64748b', fontSize: 16, margin: '4px 0 0' }}>
              Consultation et impression des reçus de paiement
            </p>
          </div>
        </div>

        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 16, marginBottom: 24 }}>
          <div style={{ background: '#fff', padding: 16, borderRadius: 12, border: '1px solid #e2e8f0' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
              <Receipt size={20} color="#3b82f6" />
              <span style={{ fontSize: 12, fontWeight: 600, color: '#64748b' }}>Total Reçus</span>
            </div>
            <div style={{ fontSize: 24, fontWeight: 800, color: '#1e293b' }}>{stats.total}</div>
          </div>
          <div style={{ background: '#fff', padding: 16, borderRadius: 12, border: '1px solid #e2e8f0' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
              <DollarSign size={20} color="#10b981" />
              <span style={{ fontSize: 12, fontWeight: 600, color: '#64748b' }}>Montant Total</span>
            </div>
            <div style={{ fontSize: 20, fontWeight: 800, color: '#10b981' }}>{fmt(stats.montant_total)}</div>
          </div>
          <div style={{ background: '#fff', padding: 16, borderRadius: 12, border: '1px solid #e2e8f0' }}>
            <div style={{ fontSize: 12, fontWeight: 600, color: '#64748b', marginBottom: 8 }}>Par Mode</div>
            <div style={{ fontSize: 12, color: '#1e293b', display: 'flex', flexDirection: 'column', gap: 4 }}>
              <div>💵 Espèces: {stats.especes}</div>
              <div>📱 Mobile: {stats.mobile_money}</div>
              <div>🏦 Virement: {stats.virement}</div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr', gap: 16, alignItems: 'end' }}>
          <div style={{ position: 'relative' }}>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#64748b', marginBottom: 8 }}>
              Rechercher
            </label>
            <Search size={20} color="#64748b" style={{ position: 'absolute', left: 16, bottom: 14 }} />
            <input
              type="text"
              placeholder="N° reçu, référence, étudiant..."
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
          <div>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#64748b', marginBottom: 8 }}>
              Mode de paiement
            </label>
            <select
              value={filterMode}
              onChange={(e) => setFilterMode(e.target.value)}
              style={{
                width: '100%',
                padding: '12px 16px',
                border: '2px solid #e2e8f0',
                borderRadius: 10,
                fontSize: 14,
                background: '#fff',
                cursor: 'pointer'
              }}
            >
              <option value="all">Tous</option>
              <option value="especes">Espèces</option>
              <option value="mobile_money">Mobile Money</option>
              <option value="virement">Virement</option>
              <option value="carte_bancaire">Carte</option>
              <option value="cheque">Chèque</option>
            </select>
          </div>
          <div>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#64748b', marginBottom: 8 }}>
              Date début
            </label>
            <input
              type="date"
              value={dateDebut}
              onChange={(e) => setDateDebut(e.target.value)}
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
            <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#64748b', marginBottom: 8 }}>
              Date fin
            </label>
            <input
              type="date"
              value={dateFin}
              onChange={(e) => setDateFin(e.target.value)}
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
      </div>

      {/* Table */}
      <div style={{ background: '#fff', borderRadius: 16, padding: 24, boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: 40 }}>
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Chargement...</span>
            </div>
          </div>
        ) : filteredRecus.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 40, color: '#64748b' }}>
            <Receipt size={48} style={{ margin: '0 auto 16px', opacity: 0.3 }} />
            <p style={{ fontSize: 16, fontWeight: 600 }}>Aucun reçu trouvé</p>
            <p style={{ fontSize: 14 }}>Aucun paiement n'a été enregistré</p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid #f1f5f9' }}>
                  <th style={{ padding: '12px 8px', textAlign: 'left', fontSize: 12, fontWeight: 600, color: '#64748b', textTransform: 'uppercase' }}>N° Reçu</th>
                  <th style={{ padding: '12px 8px', textAlign: 'left', fontSize: 12, fontWeight: 600, color: '#64748b', textTransform: 'uppercase' }}>Étudiant</th>
                  <th style={{ padding: '12px 8px', textAlign: 'center', fontSize: 12, fontWeight: 600, color: '#64748b', textTransform: 'uppercase' }}>Montant</th>
                  <th style={{ padding: '12px 8px', textAlign: 'center', fontSize: 12, fontWeight: 600, color: '#64748b', textTransform: 'uppercase' }}>Mode</th>
                  <th style={{ padding: '12px 8px', textAlign: 'center', fontSize: 12, fontWeight: 600, color: '#64748b', textTransform: 'uppercase' }}>Date</th>
                  <th style={{ padding: '12px 8px', textAlign: 'center', fontSize: 12, fontWeight: 600, color: '#64748b', textTransform: 'uppercase' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredRecus.map((recu) => (
                  <tr key={recu.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '12px 8px' }}>
                      <div>
                        <div style={{ fontSize: 14, fontWeight: 600, color: '#1e293b' }}>
                          {recu.numeroRecu}
                        </div>
                        <div style={{ fontSize: 11, color: '#64748b' }}>
                          Réf: {recu.reference}
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: '12px 8px' }}>
                      <div>
                        <div style={{ fontSize: 14, fontWeight: 600, color: '#1e293b' }}>
                          {recu.etudiantNom || 'N/A'} {recu.etudiantPrenom || ''}
                        </div>
                        <div style={{ fontSize: 12, color: '#64748b' }}>
                          {recu.etudiantMatricule || (recu.inscriptionId ? recu.inscriptionId.substring(0, 8) : 'N/A')}
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: '12px 8px', textAlign: 'center', fontSize: 15, fontWeight: 700, color: '#10b981' }}>
                      {fmt(recu.montant)}
                    </td>
                    <td style={{ padding: '12px 8px', textAlign: 'center' }}>
                      <span style={{
                        padding: '6px 12px',
                        borderRadius: 20,
                        fontSize: 12,
                        fontWeight: 600,
                        background: '#f1f5f9',
                        color: '#1e293b',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 4
                      }}>
                        {getModeIcon(recu.modePaiement)}
                        {getModeLabel(recu.modePaiement)}
                      </span>
                    </td>
                    <td style={{ padding: '12px 8px', textAlign: 'center', fontSize: 14, color: '#1e293b' }}>
                      {new Date(recu.datePaiement).toLocaleDateString('fr-FR')}
                      <div style={{ fontSize: 11, color: '#64748b' }}>
                        {new Date(recu.datePaiement).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </td>
                    <td style={{ padding: '12px 8px', textAlign: 'center' }}>
                      <div style={{ display: 'flex', gap: 8, justifyContent: 'center' }}>
                        <button
                          onClick={() => {
                            setSelectedRecu(recu);
                            setShowPreview(true);
                          }}
                          style={{
                            padding: '6px 12px',
                            background: '#eff6ff',
                            border: 'none',
                            borderRadius: 6,
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: 4,
                            fontSize: 12,
                            fontWeight: 600,
                            color: '#3b82f6'
                          }}
                          title="Voir le reçu"
                        >
                          <Eye size={14} />
                          Voir
                        </button>
                        <button
                          onClick={() => handlePrint(recu)}
                          style={{
                            padding: '6px 12px',
                            background: '#f0fdf4',
                            border: 'none',
                            borderRadius: 6,
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: 4,
                            fontSize: 12,
                            fontWeight: 600,
                            color: '#10b981'
                          }}
                          title="Imprimer"
                        >
                          <Printer size={14} />
                          Imprimer
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal Prévisualisation Reçu */}
      {showPreview && selectedRecu && (
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
            padding: 40,
            maxWidth: 600,
            width: '90%',
            maxHeight: '90vh',
            overflowY: 'auto'
          }}>
            {/* En-tête du reçu */}
            <div style={{ textAlign: 'center', marginBottom: 32, borderBottom: '2px solid #1a5276', paddingBottom: 16 }}>
              <h2 style={{ fontSize: 24, fontWeight: 900, color: '#1a5276', margin: 0 }}>
                REÇU DE PAIEMENT
              </h2>
              <p style={{ fontSize: 14, color: '#64748b', margin: '8px 0 0' }}>
                {(tenant as any)?.nom || 'IMTECH UNIVERSITY'}
              </p>
            </div>

            {/* Informations du reçu */}
            <div style={{ marginBottom: 24 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
                <div>
                  <div style={{ fontSize: 12, color: '#64748b', marginBottom: 4 }}>N° Reçu</div>
                  <div style={{ fontSize: 16, fontWeight: 700, color: '#1e293b' }}>{selectedRecu.numeroRecu}</div>
                </div>
                <div>
                  <div style={{ fontSize: 12, color: '#64748b', marginBottom: 4 }}>Date</div>
                  <div style={{ fontSize: 16, fontWeight: 700, color: '#1e293b' }}>
                    {new Date(selectedRecu.datePaiement).toLocaleDateString('fr-FR')}
                  </div>
                </div>
              </div>

              <div style={{ background: '#f8fafc', padding: 16, borderRadius: 12, marginBottom: 16 }}>
                <div style={{ fontSize: 12, color: '#64748b', marginBottom: 8 }}>Étudiant</div>
                <div style={{ fontSize: 16, fontWeight: 700, color: '#1e293b' }}>
                  {selectedRecu.etudiantNom || 'N/A'} {selectedRecu.etudiantPrenom || ''}
                </div>
                <div style={{ fontSize: 14, color: '#64748b' }}>
                  Matricule: {selectedRecu.etudiantMatricule || 'N/A'}
                </div>
              </div>

              <div style={{ background: '#f0fdf4', padding: 20, borderRadius: 12, marginBottom: 16, border: '2px solid #10b981' }}>
                <div style={{ fontSize: 12, color: '#64748b', marginBottom: 8 }}>Montant Payé</div>
                <div style={{ fontSize: 32, fontWeight: 900, color: '#10b981' }}>
                  {fmt(selectedRecu.montant)}
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <div>
                  <div style={{ fontSize: 12, color: '#64748b', marginBottom: 4 }}>Mode de paiement</div>
                  <div style={{ fontSize: 14, fontWeight: 600, color: '#1e293b' }}>
                    {getModeIcon(selectedRecu.modePaiement)} {getModeLabel(selectedRecu.modePaiement)}
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: 12, color: '#64748b', marginBottom: 4 }}>Référence</div>
                  <div style={{ fontSize: 14, fontWeight: 600, color: '#1e293b' }}>
                    {selectedRecu.reference}
                  </div>
                </div>
              </div>

              {selectedRecu.observations && (
                <div style={{ marginTop: 16, padding: 12, background: '#fef3c7', borderRadius: 8 }}>
                  <div style={{ fontSize: 12, color: '#92400e', marginBottom: 4 }}>Observations</div>
                  <div style={{ fontSize: 13, color: '#78350f' }}>{selectedRecu.observations}</div>
                </div>
              )}
            </div>

            {/* Footer */}
            <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: 16, marginTop: 24 }}>
              <p style={{ fontSize: 11, color: '#64748b', textAlign: 'center', margin: 0 }}>
                Ce reçu est valable comme preuve de paiement
              </p>
            </div>

            {/* Boutons */}
            <div style={{ display: 'flex', gap: 12, marginTop: 24 }}>
              <button
                onClick={() => {
                  setShowPreview(false);
                  setSelectedRecu(null);
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
                Fermer
              </button>
              <button
                onClick={() => window.print()}
                style={{
                  flex: 1,
                  padding: '12px',
                  background: '#10b981',
                  color: '#fff',
                  border: 'none',
                  borderRadius: 10,
                  fontSize: 14,
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 8
                }}
              >
                <Printer size={18} />
                Imprimer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Made with Bob
