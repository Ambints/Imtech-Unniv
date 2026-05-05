import React, { useState, useEffect } from 'react';
import { financeApi } from '../../api/client';
import { useAuthStore } from '../../store/authStore';
import toast from 'react-hot-toast';
import {
  Banknote, TrendingUp, TrendingDown, Wallet, CreditCard,
  Plus, Edit2, Save, X, Search, FileText,
  DollarSign, PieChart, Receipt, CheckCircle
} from 'lucide-react';

type Tab = 'caisse' | 'paiements' | 'budgets' | 'depenses';

export const FinanceManagementPage: React.FC = () => {
  const { user } = useAuthStore();
  const tid = user?.tenantId || '';
  const [activeTab, setActiveTab] = useState<Tab>('caisse');
  const [loading, setLoading] = useState(false);

  // États pour Caisse
  const [caisse, setCaisse] = useState<any>(null);
  const [paiements, setPaiements] = useState<any[]>([]);
  const [paiementForm, setPaiementForm] = useState({
    inscriptionId: '', montant: '', modePaiement: 'especes', reference: '',
    echeancierId: ''
  });
  const [recu, setRecu] = useState<any>(null);

  // États pour Budgets
  const [budgets, setBudgets] = useState<any[]>([]);
  const [showBudgetForm, setShowBudgetForm] = useState(false);
  const [budgetForm, setBudgetForm] = useState({
    id: '', categorie: 'fonctionnement', montantPrevu: '', description: ''
  });

  // États pour Dépenses
  const [depenses, setDepenses] = useState<any[]>([]);
  const [showDepenseForm, setShowDepenseForm] = useState(false);
  const [depenseForm, setDepenseForm] = useState({
    libelle: '', montant: '', categorie: 'fournitures', 
    dateDepense: '', fournisseur: '', numeroFacture: ''
  });

  useEffect(() => {
    if (!tid) return;
    if (activeTab === 'caisse') {
      loadCaisse();
      loadPaiements();
    } else if (activeTab === 'budgets') {
      loadBudgets();
    } else if (activeTab === 'depenses') {
      loadDepenses();
    }
  }, [tid, activeTab]);

  const loadCaisse = async () => {
    try {
      const { data } = await financeApi.getCaisse(tid);
      setCaisse(data);
    } catch (err) {
      console.error('Erreur chargement caisse', err);
    }
  };

  const loadPaiements = async () => {
    try {
      const { data } = await financeApi.getTousPaiements(tid);
      setPaiements(data);
    } catch (err) {
      console.error('Erreur chargement paiements', err);
    }
  };

  const loadBudgets = async () => {
    try {
      const { data } = await financeApi.getBudgets(tid);
      setBudgets(data);
    } catch (err) {
      console.error('Erreur chargement budgets', err);
    }
  };

  const loadDepenses = async () => {
    try {
      const { data } = await financeApi.getDepenses(tid);
      setDepenses(data);
    } catch (err) {
      console.error('Erreur chargement dépenses', err);
    }
  };

  const handlePaiement = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await financeApi.payer(tid, {
        ...paiementForm,
        montant: Number(paiementForm.montant)
      });
      setRecu(data.recu);
      toast.success('Paiement enregistré !');
      loadCaisse();
      loadPaiements();
      setPaiementForm(f => ({ ...f, inscriptionId: '', montant: '', reference: '' }));
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Erreur paiement');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveBudget = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await financeApi.creerBudget(tid, {
        ...budgetForm,
        montantPrevu: Number(budgetForm.montantPrevu)
      });
      toast.success('Budget créé');
      loadBudgets();
      setShowBudgetForm(false);
      setBudgetForm({ id: '', categorie: 'fonctionnement', montantPrevu: '', description: '' });
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Erreur');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveDepense = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await financeApi.ajouterDepense(tid, {
        ...depenseForm,
        montant: Number(depenseForm.montant)
      });
      toast.success('Dépense enregistrée');
      loadDepenses();
      setShowDepenseForm(false);
      setDepenseForm({ libelle: '', montant: '', categorie: 'fournitures', dateDepense: '', fournisseur: '', numeroFacture: '' });
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Erreur');
    } finally {
      setLoading(false);
    }
  };

  const fmt = (n: number) => Number(n || 0).toLocaleString('fr') + ' Ar';

  const tabs = [
    { id: 'caisse', label: 'Caisse', icon: <Wallet size={18} /> },
    { id: 'paiements', label: 'Paiements', icon: <CreditCard size={18} /> },
    { id: 'budgets', label: 'Budgets', icon: <PieChart size={18} /> },
    { id: 'depenses', label: 'Dépenses', icon: <TrendingDown size={18} /> },
  ];

  return (
    <div style={{ padding: 32, background: '#F5F5F0', minHeight: '100vh' }}>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 28, fontWeight: 900, color: '#0f172a', margin: '0 0 8px', display: 'flex', alignItems: 'center', gap: 12 }}>
          <DollarSign size={32} /> Gestion des Finances
        </h1>
        <p style={{ color: '#64748b', fontSize: 14 }}>
          Gestion complète de la caisse, paiements, budgets et dépenses
        </p>
      </div>

      <div style={{ display: 'flex', gap: 8, marginBottom: 24, overflowX: 'auto', paddingBottom: 8 }}>
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as Tab)}
            style={{
              padding: '12px 20px',
              background: activeTab === tab.id ? 'linear-gradient(135deg, #148f77, #1a5276)' : '#fff',
              color: activeTab === tab.id ? '#fff' : '#64748b',
              border: activeTab === tab.id ? 'none' : '2px solid #e5e7eb',
              borderRadius: 10,
              fontSize: 13,
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              whiteSpace: 'nowrap',
              transition: 'all 0.2s'
            }}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'caisse' && (
        <div>
          {caisse && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 24 }}>
              {[
                { label: 'Total Encaissé', value: fmt(caisse.totalEncaisse), color: '#148f77', icon: <TrendingUp size={24} /> },
                { label: 'Total Dépensé', value: fmt(caisse.totalDepense), color: '#e74c3c', icon: <TrendingDown size={24} /> },
                { label: 'Solde du Jour', value: fmt(caisse.solde), color: '#1a5276', icon: <Wallet size={24} /> },
              ].map(c => (
                <div key={c.label} style={{ background: '#fff', borderRadius: 14, padding: 20, boxShadow: '0 2px 10px rgba(0,0,0,0.07)', borderTop: `3px solid ${c.color}` }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <p style={{ color: '#94a3b8', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', margin: '0 0 8px' }}>{c.label}</p>
                      <p style={{ fontSize: 22, fontWeight: 900, color: c.color, margin: 0 }}>{c.value}</p>
                    </div>
                    <span style={{ color: c.color }}>{c.icon}</span>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
            <div style={{ background: '#fff', borderRadius: 14, padding: 24, boxShadow: '0 2px 10px rgba(0,0,0,0.07)' }}>
              <h3 style={{ fontSize: 16, fontWeight: 700, color: '#0f172a', margin: '0 0 20px', display: 'flex', alignItems: 'center', gap: 8 }}>
                <CreditCard size={18} /> Enregistrer un Paiement
              </h3>
              <form onSubmit={handlePaiement}>
                <div style={{ marginBottom: 16 }}>
                  <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 6 }}>ID Inscription *</label>
                  <input
                    type="text"
                    required
                    value={paiementForm.inscriptionId}
                    onChange={e => setPaiementForm(f => ({ ...f, inscriptionId: e.target.value }))}
                    placeholder="UUID de l'inscription"
                    style={{ width: '100%', padding: '11px 14px', border: '2px solid #e5e7eb', borderRadius: 9, fontSize: 14 }}
                  />
                </div>
                <div style={{ marginBottom: 16 }}>
                  <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 6 }}>Montant (Ar) *</label>
                  <input
                    type="number"
                    required
                    value={paiementForm.montant}
                    onChange={e => setPaiementForm(f => ({ ...f, montant: e.target.value }))}
                    style={{ width: '100%', padding: '11px 14px', border: '2px solid #e5e7eb', borderRadius: 9, fontSize: 14 }}
                  />
                </div>
                <div style={{ marginBottom: 16 }}>
                  <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 6 }}>Mode de Paiement</label>
                  <select
                    value={paiementForm.modePaiement}
                    onChange={e => setPaiementForm(f => ({ ...f, modePaiement: e.target.value }))}
                    style={{ width: '100%', padding: '11px 14px', border: '2px solid #e5e7eb', borderRadius: 9, fontSize: 14, background: '#fff' }}
                  >
                    <option value="especes">Espèces</option>
                    <option value="cheque">Chèque</option>
                    <option value="virement">Virement Bancaire</option>
                    <option value="carte_bancaire">Carte Bancaire</option>
                    <option value="mobile_money">Mobile Money</option>
                  </select>
                </div>
                <div style={{ marginBottom: 16 }}>
                  <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 6 }}>Référence (optionnel)</label>
                  <input
                    type="text"
                    value={paiementForm.reference}
                    onChange={e => setPaiementForm(f => ({ ...f, reference: e.target.value }))}
                    placeholder="N° chèque, virement..."
                    style={{ width: '100%', padding: '11px 14px', border: '2px solid #e5e7eb', borderRadius: 9, fontSize: 14 }}
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  style={{
                    width: '100%',
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
                  <CheckCircle size={18} /> {loading ? 'Traitement...' : 'Valider le Paiement'}
                </button>
              </form>
            </div>

            <div>
              {recu && (
                <div style={{ background: '#fff', borderRadius: 14, padding: 24, boxShadow: '0 2px 10px rgba(0,0,0,0.07)', marginBottom: 20, border: '2px solid #148f77' }}>
                  <h3 style={{ fontSize: 16, fontWeight: 700, color: '#148f77', margin: '0 0 16px', textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                    <Receipt size={20} /> Reçu de Paiement
                  </h3>
                  <div style={{ background: '#f0fdf4', borderRadius: 10, padding: 16 }}>
                    {[
                      ['N° Reçu', recu.numeroRecu],
                      ['Date', new Date(recu.date).toLocaleDateString('fr-FR')],
                      ['Montant', fmt(recu.montant)],
                      ['Mode', (recu.modePaiement || recu.mode)?.toUpperCase()],
                      ['Statut', recu.statut],
                    ].map(([k, v]) => (
                      <div key={k} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid #dcfce7', fontSize: 13 }}>
                        <span style={{ color: '#64748b', fontWeight: 600 }}>{k}</span>
                        <span style={{ color: '#0f172a', fontWeight: 700 }}>{v}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div style={{ background: '#fff', borderRadius: 14, padding: 20, boxShadow: '0 2px 10px rgba(0,0,0,0.07)' }}>
                <h3 style={{ fontSize: 15, fontWeight: 700, color: '#0f172a', margin: '0 0 14px' }}>Derniers Paiements</h3>
                {paiements.length === 0 ? (
                  <p style={{ color: '#94a3b8', textAlign: 'center', padding: 20, fontSize: 13 }}>Aucun paiement</p>
                ) : (
                  paiements.slice(0, 10).map((p, i) => (
                    <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid #f1f5f9' }}>
                      <div>
                        <div style={{ fontSize: 13, fontWeight: 600, color: '#0f172a' }}>{p.inscriptionId?.slice(0, 8) || 'N/A'}...</div>
                        <div style={{ fontSize: 11, color: '#94a3b8' }}>{p.modePaiement} · {p.statut}</div>
                      </div>
                      <span style={{ fontSize: 14, fontWeight: 700, color: '#148f77' }}>
                        {fmt(p.montant)}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'paiements' && (
        <div style={{ background: '#fff', borderRadius: 14, padding: 24, boxShadow: '0 2px 10px rgba(0,0,0,0.07)' }}>
          <h3 style={{ fontSize: 16, fontWeight: 700, color: '#0f172a', marginBottom: 20 }}>
            Tous les Paiements ({paiements.length})
          </h3>
          {paiements.length === 0 ? (
            <div style={{ textAlign: 'center', padding: 40 }}>
              <CreditCard size={48} color="#cbd5e1" />
              <p style={{ color: '#94a3b8', marginTop: 12 }}>Aucun paiement trouvé</p>
            </div>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: '#f8fafc', borderBottom: '2px solid #e5e7eb' }}>
                  {['Date', 'Inscription', 'Montant', 'Mode', 'Statut'].map(h => (
                    <th key={h} style={{ padding: '12px', textAlign: 'left', fontSize: 12, fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {paiements.map((p, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '14px', fontSize: 13 }}>{new Date(p.datePaiement).toLocaleDateString('fr-FR')}</td>
                    <td style={{ padding: '14px', fontSize: 13, fontWeight: 600 }}>{p.inscriptionId?.slice(0, 12)}...</td>
                    <td style={{ padding: '14px', fontSize: 14, fontWeight: 700, color: '#148f77' }}>{fmt(p.montant)}</td>
                    <td style={{ padding: '14px', fontSize: 13 }}>{p.modePaiement}</td>
                    <td style={{ padding: '14px', fontSize: 13 }}>
                      <span className={`badge bg-${p.statut === 'valide' ? 'success' : p.statut === 'annule' ? 'danger' : 'warning'}`}>
                        {p.statut}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {activeTab === 'budgets' && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 20 }}>
            <button
              onClick={() => setShowBudgetForm(true)}
              style={{
                padding: '12px 20px',
                background: 'linear-gradient(135deg, #148f77, #1a5276)',
                color: '#fff',
                border: 'none',
                borderRadius: 10,
                fontSize: 13,
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 8
              }}
            >
              <Plus size={18} /> Nouveau Budget
            </button>
          </div>

          {showBudgetForm && (
            <div style={{ background: '#fff', borderRadius: 14, padding: 24, marginBottom: 20, boxShadow: '0 2px 10px rgba(0,0,0,0.07)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                <h3 style={{ fontSize: 18, fontWeight: 700, color: '#0f172a', margin: 0 }}>Nouveau Budget</h3>
                <button onClick={() => setShowBudgetForm(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                  <X size={24} color="#64748b" />
                </button>
              </div>
              <form onSubmit={handleSaveBudget}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 16 }}>
                  <div>
                    <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 6 }}>Catégorie *</label>
                    <select
                      required
                      value={budgetForm.categorie}
                      onChange={e => setBudgetForm(f => ({ ...f, categorie: e.target.value }))}
                      style={{ width: '100%', padding: '11px 14px', border: '2px solid #e5e7eb', borderRadius: 9, fontSize: 14, background: '#fff' }}
                    >
                      <option value="fonctionnement">Fonctionnement</option>
                      <option value="investissement">Investissement</option>
                      <option value="personnel">Personnel</option>
                      <option value="pedagogie">Pédagogie</option>
                    </select>
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 6 }}>Montant Prévu (Ar) *</label>
                    <input
                      type="number"
                      required
                      value={budgetForm.montantPrevu}
                      onChange={e => setBudgetForm(f => ({ ...f, montantPrevu: e.target.value }))}
                      style={{ width: '100%', padding: '11px 14px', border: '2px solid #e5e7eb', borderRadius: 9, fontSize: 14 }}
                    />
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 12, marginTop: 20 }}>
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
                    onClick={() => setShowBudgetForm(false)}
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
          )}

          <div style={{ background: '#fff', borderRadius: 14, padding: 24, boxShadow: '0 2px 10px rgba(0,0,0,0.07)' }}>
            <h3 style={{ fontSize: 16, fontWeight: 700, color: '#0f172a', marginBottom: 20 }}>
              Liste des Budgets ({budgets.length})
            </h3>
            {budgets.length === 0 ? (
              <div style={{ textAlign: 'center', padding: 40 }}>
                <PieChart size={48} color="#cbd5e1" />
                <p style={{ color: '#94a3b8', marginTop: 12 }}>Aucun budget trouvé</p>
              </div>
            ) : (
              <div style={{ display: 'grid', gap: 12 }}>
                {budgets.map(b => (
                  <div key={b.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: 16, background: '#f8fafc', borderRadius: 10, border: '1px solid #e5e7eb' }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 15, fontWeight: 700, color: '#0f172a', marginBottom: 4 }}>
                        {b.categorie}
                      </div>
                      <div style={{ fontSize: 12, color: '#64748b' }}>
                        Prévu: {fmt(b.montantPrevu)} · Réalisé: {fmt(b.montantRealise || 0)}
                      </div>
                    </div>
                    <div style={{ width: 200 }}>
                      <div style={{ background: '#e5e7eb', borderRadius: 999, height: 8, overflow: 'hidden' }}>
                        <div style={{ 
                          width: `${Math.min(100, (b.montantRealise / b.montantPrevu) * 100)}%`, 
                          height: '100%', 
                          background: 'linear-gradient(90deg, #148f77, #1a5276)'
                        }} />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'depenses' && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 20 }}>
            <button
              onClick={() => setShowDepenseForm(true)}
              style={{
                padding: '12px 20px',
                background: 'linear-gradient(135deg, #148f77, #1a5276)',
                color: '#fff',
                border: 'none',
                borderRadius: 10,
                fontSize: 13,
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 8
              }}
            >
              <Plus size={18} /> Nouvelle Dépense
            </button>
          </div>

          {showDepenseForm && (
            <div style={{ background: '#fff', borderRadius: 14, padding: 24, marginBottom: 20, boxShadow: '0 2px 10px rgba(0,0,0,0.07)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                <h3 style={{ fontSize: 18, fontWeight: 700, color: '#0f172a', margin: 0 }}>Nouvelle Dépense</h3>
                <button onClick={() => setShowDepenseForm(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                  <X size={24} color="#64748b" />
                </button>
              </div>
              <form onSubmit={handleSaveDepense}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 16 }}>
                  <div>
                    <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 6 }}>Libellé *</label>
                    <input
                      type="text"
                      required
                      value={depenseForm.libelle}
                      onChange={e => setDepenseForm(f => ({ ...f, libelle: e.target.value }))}
                      style={{ width: '100%', padding: '11px 14px', border: '2px solid #e5e7eb', borderRadius: 9, fontSize: 14 }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 6 }}>Montant (Ar) *</label>
                    <input
                      type="number"
                      required
                      value={depenseForm.montant}
                      onChange={e => setDepenseForm(f => ({ ...f, montant: e.target.value }))}
                      style={{ width: '100%', padding: '11px 14px', border: '2px solid #e5e7eb', borderRadius: 9, fontSize: 14 }}
                    />
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 12, marginTop: 20 }}>
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
                    onClick={() => setShowDepenseForm(false)}
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
          )}

          <div style={{ background: '#fff', borderRadius: 14, padding: 24, boxShadow: '0 2px 10px rgba(0,0,0,0.07)' }}>
            <h3 style={{ fontSize: 16, fontWeight: 700, color: '#0f172a', marginBottom: 20 }}>
              Liste des Dépenses ({depenses.length})
            </h3>
            {depenses.length === 0 ? (
              <div style={{ textAlign: 'center', padding: 40 }}>
                <TrendingDown size={48} color="#cbd5e1" />
                <p style={{ color: '#94a3b8', marginTop: 12 }}>Aucune dépense trouvée</p>
              </div>
            ) : (
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ background: '#f8fafc', borderBottom: '2px solid #e5e7eb' }}>
                    {['Date', 'Libellé', 'Montant', 'Catégorie'].map(h => (
                      <th key={h} style={{ padding: '12px', textAlign: 'left', fontSize: 12, fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {depenses.map((d, i) => (
                    <tr key={i} style={{ borderBottom: '1px solid #f1f5f9' }}>
                      <td style={{ padding: '14px', fontSize: 13 }}>{new Date(d.dateDepense).toLocaleDateString('fr-FR')}</td>
                      <td style={{ padding: '14px', fontSize: 13, fontWeight: 600 }}>{d.libelle}</td>
                      <td style={{ padding: '14px', fontSize: 14, fontWeight: 700, color: '#e74c3c' }}>{fmt(d.montant)}</td>
                      <td style={{ padding: '14px', fontSize: 13 }}>{d.categorie}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}

    </div>
  );
};

// Made with Bob
