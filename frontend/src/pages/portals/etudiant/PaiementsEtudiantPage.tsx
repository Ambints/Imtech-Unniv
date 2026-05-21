import React, { useState, useEffect } from 'react';
import { financeApi } from '../../../api/client';
import { useAuthStore } from '../../../store/authStore';
import { CreditCard, Download, CheckCircle, Clock, AlertCircle } from 'lucide-react';

export const PaiementsEtudiantPage: React.FC = () => {
  const { user } = useAuthStore();
  const tid = user?.tenantId || '';
  const [paiements, setPaiements] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!tid || !user?.id) return;
    setLoading(true);
    financeApi.getPaiementsEtudiant(tid, user.id)
      .then(r => setPaiements(r.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [tid, user?.id]);

  const totalPaye = paiements.reduce((sum, p) => sum + Number(p.montant || 0), 0);
  const fraisInscription = 500000; // Exemple
  const reste = fraisInscription - totalPaye;

  const statusColors: Record<string, { bg: string; text: string; icon: React.ReactNode }> = {
    paid: { bg: '#dcfce7', text: '#166534', icon: <CheckCircle size={16} /> },
    pending: { bg: '#fef3c7', text: '#92400e', icon: <Clock size={16} /> },
    overdue: { bg: '#fee2e2', text: '#991b1b', icon: <AlertCircle size={16} /> },
  };

  return (
    <div style={{ padding: 32, background: '#F5F5F0', minHeight: '100vh' }}>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 28, fontWeight: 900, color: '#0f172a', margin: '0 0 8px', display: 'flex', alignItems: 'center', gap: 12 }}>
          <CreditCard size={32} color="#1a5276" />
          Mes Paiements
        </h1>
        <p style={{ color: '#64748b', fontSize: 14, margin: 0 }}>
          Historique et suivi de vos paiements
        </p>
      </div>

      {/* Résumé financier */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 24 }}>
        {[
          { label: 'Total Payé', value: `${totalPaye.toLocaleString('fr')} Ar`, color: '#148f77' },
          { label: 'Frais Inscription', value: `${fraisInscription.toLocaleString('fr')} Ar`, color: '#1a5276' },
          { label: 'Reste à Payer', value: `${reste.toLocaleString('fr')} Ar`, color: reste > 0 ? '#e74c3c' : '#148f77' },
        ].map(s => (
          <div key={s.label} style={{ background: '#fff', borderRadius: 12, padding: 20, boxShadow: '0 2px 8px rgba(0,0,0,0.06)', borderTop: `4px solid ${s.color}` }}>
            <p style={{ color: '#94a3b8', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', margin: '0 0 8px' }}>{s.label}</p>
            <p style={{ fontSize: 24, fontWeight: 900, color: s.color, margin: 0 }}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Liste des paiements */}
      <div style={{ background: '#fff', borderRadius: 14, padding: 24, boxShadow: '0 2px 10px rgba(0,0,0,0.07)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <h2 style={{ fontSize: 18, fontWeight: 700, color: '#0f172a', margin: 0 }}>Historique des Paiements</h2>
        </div>

        {loading ? (
          <p style={{ textAlign: 'center', color: '#94a3b8', padding: 40 }}>Chargement...</p>
        ) : paiements.length === 0 ? (
          <p style={{ textAlign: 'center', color: '#94a3b8', padding: 40 }}>Aucun paiement enregistré</p>
        ) : (
          <div style={{ display: 'grid', gap: 12 }}>
            {paiements.map((p, i) => {
              const status = statusColors[p.status || 'paid'];
              return (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: 16, background: '#f8fafc', borderRadius: 10, border: '1px solid #e2e8f0' }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 15, fontWeight: 700, color: '#0f172a', marginBottom: 4 }}>{p.motif || 'Frais de scolarité'}</div>
                    <div style={{ fontSize: 12, color: '#64748b' }}>
                      Réf: {p.reference || 'PAY-' + (i + 1)} · Mode: {p.mode || 'Espèces'}
                    </div>
                  </div>
                  <div style={{ textAlign: 'right', marginRight: 16 }}>
                    <div style={{ fontSize: 18, fontWeight: 700, color: '#148f77', marginBottom: 4 }}>
                      {Number(p.montant || 0).toLocaleString('fr')} Ar
                    </div>
                    <div style={{ fontSize: 11, color: '#94a3b8' }}>
                      {new Date(p.createdAt || Date.now()).toLocaleDateString('fr-FR')}
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <span style={{ padding: '4px 10px', borderRadius: 999, fontSize: 11, fontWeight: 700, background: status.bg, color: status.text, display: 'flex', alignItems: 'center', gap: 4 }}>
                      {status.icon} {p.status === 'paid' ? 'Payé' : p.status === 'pending' ? 'En attente' : 'En retard'}
                    </span>
                    <button style={{ padding: '6px 12px', background: '#1a5276', color: '#fff', border: 'none', borderRadius: 6, fontSize: 11, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4 }}>
                      <Download size={14} /> Reçu
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

// Made with Bob
