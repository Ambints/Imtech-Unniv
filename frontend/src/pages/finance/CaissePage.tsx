import React, { useState, useEffect } from 'react';
import { financeApi } from '../../api/client';
import { useAuthStore } from '../../store/authStore';
import toast from 'react-hot-toast';
import { Banknote, TrendingUp, TrendingDown, Wallet, CreditCard, Clock, CheckCircle, Receipt, Printer, ClipboardList, Landmark, Smartphone } from 'lucide-react';

export const CaissePage: React.FC = () => {
  const { user } = useAuthStore();
  const tid = user?.tenantId || '';
  const [caisse, setCaisse] = useState<any>(null);
  const [paiements, setPaiements] = useState<any[]>([]);
  const [form, setForm] = useState({ etudiantId: '', montant: '', mode: 'cash', motif: 'scolarite', anneeAcademique: '2024-2025' });
  const [loading, setLoading] = useState(false);
  const [recu, setRecu] = useState<any>(null);

  useEffect(() => {
    if (!tid) return;
    financeApi.getCaisse(tid).then(r => setCaisse(r.data)).catch(() => {});
    financeApi.getTousPaiements(tid).then(r => setPaiements(r.data.slice(0, 10))).catch(() => {});
  }, [tid]);

  const handlePaiement = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.etudiantId || !form.montant) return toast.error('Remplir tous les champs');
    setLoading(true);
    try {
      const { data } = await financeApi.payer(tid, { ...form, montant: Number(form.montant) });
      setRecu(data.recu);
      toast.success('Paiement enregistré !');
      financeApi.getCaisse(tid).then(r => setCaisse(r.data));
      financeApi.getTousPaiements(tid).then(r => setPaiements(r.data.slice(0, 10)));
      setForm(f => ({ ...f, etudiantId: '', montant: '' }));
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Erreur paiement');
    } finally {
      setLoading(false);
    }
  };

  const fmt = (n: number) => Number(n || 0).toLocaleString('fr') + ' Ar';

  return (
    <div style={{ padding: 32, background: '#F5F5F0', minHeight: '100vh' }}>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 24, fontWeight: 900, color: '#0f172a', margin: '0 0 6px', display: 'flex', alignItems: 'center', gap: 10 }}><Banknote size={28} /> Gestion de la Caisse</h1>
        <p style={{ color: '#64748b', fontSize: 14 }}>Encaissement, reçus et clôture journalière</p>
      </div>

      {/* Caisse Summary */}
      {caisse && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 24 }}>
          {[
            { label: 'Total Encaissé', value: fmt(caisse.totalEncaisse), color: '#148f77', icon: <TrendingUp size={24} color="#148f77" /> },
            { label: 'Total Dépensé', value: fmt(caisse.totalDepense), color: '#e74c3c', icon: <TrendingDown size={24} color="#e74c3c" /> },
            { label: 'Solde du Jour', value: fmt(caisse.solde), color: '#1a5276', icon: <Wallet size={24} color="#1a5276" /> },
          ].map(c => (
            <div key={c.label} style={{ background: '#fff', borderRadius: 14, padding: 20, boxShadow: '0 2px 10px rgba(0,0,0,0.07)', borderTop: `3px solid ${c.color}` }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <p style={{ color: '#94a3b8', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', margin: '0 0 8px' }}>{c.label}</p>
                  <p style={{ fontSize: 22, fontWeight: 900, color: c.color, margin: 0 }}>{c.value}</p>
                </div>
                <span style={{ display: 'flex' }}>{c.icon}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
        {/* Formulaire Paiement */}
        <div style={{ background: '#fff', borderRadius: 14, padding: '24px', boxShadow: '0 2px 10px rgba(0,0,0,0.07)' }}>
          <h3 style={{ fontSize: 16, fontWeight: 700, color: '#0f172a', margin: '0 0 20px', display: 'flex', alignItems: 'center', gap: 8 }}><CreditCard size={18} /> Enregistrer un Paiement</h3>
          <form onSubmit={handlePaiement}>
            {[
              { label: 'Matricule / ID Étudiant', key: 'etudiantId', type: 'text', placeholder: 'ETU-2024-001' },
              { label: 'Montant (Ar)', key: 'montant', type: 'number', placeholder: '150000' },
            ].map(f => (
              <div key={f.key} style={{ marginBottom: 16 }}>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 6 }}>{f.label}</label>
                <input
                  type={f.type} placeholder={f.placeholder} required
                  value={(form as any)[f.key]}
                  onChange={e => setForm(prev => ({ ...prev, [f.key]: e.target.value }))}
                  style={{ width: '100%', padding: '11px 14px', border: '2px solid #e5e7eb', borderRadius: 9, fontSize: 14, outline: 'none' }}
                  onFocus={e => e.target.style.borderColor = '#1a5276'}
                  onBlur={e => e.target.style.borderColor = '#e5e7eb'}
                />
              </div>
            ))}
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 6 }}>Mode de Paiement</label>
              <select value={form.mode} onChange={e => setForm(f => ({ ...f, mode: e.target.value }))}
                style={{ width: '100%', padding: '11px 14px', border: '2px solid #e5e7eb', borderRadius: 9, fontSize: 14, outline: 'none', background: '#fff' }}>
                <option value="cash">Espèces</option>
                <option value="virement">Virement Bancaire</option>
                <option value="carte">Carte Bancaire</option>
                <option value="mobile_money">Mobile Money</option>
              </select>
            </div>
            <div style={{ marginBottom: 20 }}>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 6 }}>Motif</label>
              <select value={form.motif} onChange={e => setForm(f => ({ ...f, motif: e.target.value }))}
                style={{ width: '100%', padding: '11px 14px', border: '2px solid #e5e7eb', borderRadius: 9, fontSize: 14, outline: 'none', background: '#fff' }}>
                <option value="inscription">Frais d'Inscription</option>
                <option value="scolarite">Frais de Scolarité</option>
                <option value="bibliotheque">Bibliothèque</option>
                <option value="examen">Frais d'Examen</option>
                <option value="diplome">Frais Diplôme</option>
                <option value="autre">Autre</option>
              </select>
            </div>
            <button type="submit" disabled={loading} style={{
              width: '100%', padding: '13px',
              background: loading ? '#94a3b8' : 'linear-gradient(135deg, #148f77, #1a5276)',
              color: '#fff', border: 'none', borderRadius: 10, fontSize: 14, fontWeight: 700, cursor: 'pointer',
            }}>
              {loading ? <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}><Clock size={16} /> Traitement...</span> : <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}><CheckCircle size={16} /> Valider le Paiement</span>}
            </button>
          </form>
        </div>

        {/* Reçu ou historique */}
        <div>
          {recu && (
            <div style={{ background: '#fff', borderRadius: 14, padding: '24px', boxShadow: '0 2px 10px rgba(0,0,0,0.07)', marginBottom: 20, border: '2px solid #148f77' }}>
              <h3 style={{ fontSize: 16, fontWeight: 700, color: '#148f77', margin: '0 0 16px', textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                <Receipt size={20} /> Reçu de Paiement
              </h3>
              <div style={{ background: '#f0fdf4', borderRadius: 10, padding: 16 }}>
                {[
                  ['N° Reçu', recu.numeroRecu],
                  ['Date', new Date(recu.date).toLocaleDateString('fr-FR')],
                  ['Étudiant', recu.etudiantId],
                  ['Montant', Number(recu.montant).toLocaleString('fr') + ' Ar'],
                  ['Mode', recu.mode.toUpperCase()],
                  ['Motif', recu.motif],
                  ['Statut', 'PAYÉ'],
                ].map(([k, v]) => (
                  <div key={k} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid #dcfce7', fontSize: 13 }}>
                    <span style={{ color: '#64748b', fontWeight: 600 }}>{k}</span>
                    <span style={{ color: '#0f172a', fontWeight: 700 }}>{v}</span>
                  </div>
                ))}
              </div>
              <button style={{ width: '100%', marginTop: 14, padding: '10px', background: '#1a5276', color: '#fff', border: 'none', borderRadius: 9, fontSize: 13, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
                <Printer size={16} /> Imprimer le Reçu
              </button>
            </div>
          )}

          <div style={{ background: '#fff', borderRadius: 14, padding: '20px', boxShadow: '0 2px 10px rgba(0,0,0,0.07)' }}>
            <h3 style={{ fontSize: 15, fontWeight: 700, color: '#0f172a', margin: '0 0 14px', display: 'flex', alignItems: 'center', gap: 8 }}><ClipboardList size={18} /> Derniers Paiements</h3>
            {paiements.length === 0 ? (
              <p style={{ color: '#94a3b8', textAlign: 'center', padding: 20, fontSize: 13 }}>Aucun paiement aujourd'hui</p>
            ) : (
              paiements.map((p, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid #f1f5f9' }}>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: '#0f172a' }}>{p.etudiantId}</div>
                    <div style={{ fontSize: 11, color: '#94a3b8' }}>{p.motif} · {p.mode}</div>
                  </div>
                  <span style={{ fontSize: 14, fontWeight: 700, color: '#148f77' }}>
                    {Number(p.montant).toLocaleString('fr')} Ar
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
