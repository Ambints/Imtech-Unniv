import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useAuthStore } from '../../store/authStore';
import { financeApi } from '../../api/client';
import toast from 'react-hot-toast';
import {
  Banknote, TrendingUp, Wallet, CreditCard, Receipt,
  Calendar, Users, FileText, Settings, DollarSign,
  ArrowUpRight, ArrowDownRight, Clock, CheckCircle,
  AlertCircle, Printer, Download, Filter, Search
} from 'lucide-react';

interface DashboardStats {
  totalEncaisse: number;
  totalDepense: number;
  solde: number;
  transactionsJour: number;
  etudiantsPayants: number;
  impayes: number;
  moyennePaiement: number;
  dernierPaiement: string;
}

interface TransactionRecent {
  id: string;
  etudiant: string;
  montant: number;
  mode: string;
  date: string;
  statut: string;
  type: string;
}

interface FraisInscription {
  id: string;
  parcours_nom: string;
  montant_inscription: number;
  montant_scolarite: number;
  montant_total: number;
  annee_academique: string;
  actif: boolean;
}

interface CacheData {
  stats: DashboardStats | null;
  transactions: TransactionRecent[];
  fraisInscription: FraisInscription[];
}

export const CaissierDashboard: React.FC = () => {
  const { user, tenant, accessToken } = useAuthStore();
  const tenantId = tenant?.id || '';
  
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [transactions, setTransactions] = useState<TransactionRecent[]>([]);
  const [fraisInscription, setFraisInscription] = useState<FraisInscription[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPeriod, setSelectedPeriod] = useState('jour');
  const [dataCache, setDataCache] = useState<{[key: string]: {data: CacheData, timestamp: number}}>({});

  // Fonction de cache avec expiration (5 minutes)
  const getCachedData = useCallback((key: string): CacheData | null => {
    const cached = dataCache[key];
    if (cached && Date.now() - cached.timestamp < 300000) { // 5 minutes
      return cached.data;
    }
    return null;
  }, [dataCache]);

  const setCachedData = useCallback((key: string, data: CacheData) => {
    setDataCache(prev => ({
      ...prev,
      [key]: { data, timestamp: Date.now() }
    }));
  }, []);

  const loadDashboardData = useCallback(async () => {
    if (!tenantId || !accessToken) return;
    
    setLoading(true);
    try {
      const cacheKey = `dashboard-${selectedPeriod}-${new Date().toISOString().split('T')[0]}`;
      const cached = getCachedData(cacheKey);
      
      if (cached) {
        setStats(cached.stats);
        setTransactions(cached.transactions);
        setFraisInscription(cached.fraisInscription);
        setLoading(false);
        return;
      }

      // Utiliser l'endpoint existant /finance/caisse qui retourne les données du jour
      const caisseResponse = await financeApi.getCaisse(tenantId);
      const caisseData = caisseResponse.data;

      // Calculer les statistiques à partir des paiements
      const paiements = caisseData.paiements || [];
      const total = caisseData.total || 0;
      const nombrePaiements = caisseData.nombrePaiements || 0;

      // Calculer le nombre d'étudiants uniques (inscriptions uniques)
      const inscriptionsUniques = new Set(paiements.map((p: any) => p.inscriptionId));
      const etudiantsPayants = inscriptionsUniques.size;

      // Calculer la moyenne des paiements
      const moyennePaiement = nombrePaiements > 0 ? total / nombrePaiements : 0;

      const newStats: DashboardStats = {
        totalEncaisse: total,
        totalDepense: 0,
        solde: total,
        transactionsJour: nombrePaiements,
        etudiantsPayants,
        impayes: 0,
        moyennePaiement,
        dernierPaiement: paiements.length > 0 ? paiements[0].datePaiement : new Date().toISOString()
      };

      // Formater les transactions pour l'affichage
      const newTransactions: TransactionRecent[] = paiements.slice(0, 10).map((p: any) => ({
        id: p.id,
        etudiant: p.etudiantNomComplet || `${p.etudiantNom || ''} ${p.etudiantPrenom || ''}`.trim() || p.inscriptionId,
        montant: Number(p.montant),
        mode: p.modePaiement,
        date: p.datePaiement,
        statut: p.statut,
        type: 'Paiement'
      }));

      setStats(newStats);
      setTransactions(newTransactions);
      setFraisInscription([]); // Pas de frais d'inscription pour l'instant

      // Mettre en cache
      setCachedData(cacheKey, {
        stats: newStats,
        transactions: newTransactions,
        fraisInscription: []
      });

    } catch (error) {
      console.error('Erreur lors du chargement des données:', error);
      toast.error('Erreur de chargement des données de la caisse');
    } finally {
      setLoading(false);
    }
  }, [tenantId, accessToken, selectedPeriod, getCachedData, setCachedData]);

  useEffect(() => {
    if (!tenantId) return;
    loadDashboardData();
  }, [tenantId, selectedPeriod, loadDashboardData]);

  const fmt = useCallback((n: number) => Number(n || 0).toLocaleString('fr-FR') + ' Ar', []);

  // Mémoïser le composant StatCard pour éviter les re-renders
  const StatCard = useMemo(() => React.memo(({ title, value, icon, color, trend, trendValue }: any) => (
    <div style={{ 
      background: '#fff', 
      borderRadius: 16, 
      padding: 24, 
      boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
      border: `1px solid ${color}20`,
      position: 'relative',
      overflow: 'hidden'
    }}>
      <div style={{ 
        position: 'absolute', 
        top: 0, 
        right: 0, 
        width: 60, 
        height: 60, 
        background: `${color}10`,
        borderRadius: '0 16px 0 30px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        {icon}
      </div>
      <div style={{ position: 'relative', zIndex: 1 }}>
        <p style={{ color: '#64748b', fontSize: 12, fontWeight: 600, margin: '0 0 8px', textTransform: 'uppercase' }}>
          {title}
        </p>
        <p style={{ fontSize: 28, fontWeight: 800, color: '#1e293b', margin: '0 0 8px' }}>
          {value}
        </p>
        {trend && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            {trendValue > 0 ? (
              <ArrowUpRight size={16} color="#10b981" />
            ) : (
              <ArrowDownRight size={16} color="#ef4444" />
            )}
            <span style={{ fontSize: 12, color: trendValue > 0 ? '#10b981' : '#ef4444' }}>
              {Math.abs(trendValue)}%
            </span>
          </div>
        )}
      </div>
    </div>
  )), []);

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Chargement...</span>
        </div>
      </div>
    );
  }

  return (
    <div style={{ padding: 32, background: '#F8FAFC', minHeight: '100vh' }}>
      {/* Header */}
      <div style={{ marginBottom: 32 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
          <div>
            <h1 style={{ fontSize: 32, fontWeight: 900, color: '#1e293b', margin: 0, display: 'flex', alignItems: 'center', gap: 12 }}>
              <Banknote size={36} color="#1a5276" />
              Tableau de Bord Caisse
            </h1>
            <p style={{ color: '#64748b', fontSize: 16, margin: '4px 0 0' }}>
              Gestion des encaissements et suivi financier
            </p>
          </div>
          <div style={{ display: 'flex', gap: 12 }}>
            <select 
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value)}
              style={{ 
                padding: '10px 16px', 
                border: '2px solid #e2e8f0', 
                borderRadius: 10, 
                fontSize: 14,
                background: '#fff',
                cursor: 'pointer'
              }}
            >
              <option value="jour">Aujourd'hui</option>
              <option value="semaine">Cette semaine</option>
              <option value="mois">Ce mois</option>
              <option value="annee">Cette année</option>
            </select>
            <button
              onClick={loadDashboardData}
              style={{
                padding: '10px 16px',
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
              <Clock size={16} />
              Actualiser
            </button>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 20, marginBottom: 32 }}>
        <StatCard
          title="Total Encaissé"
          value={fmt(stats?.totalEncaisse || 0)}
          icon={<DollarSign size={28} color="#10b981" />}
          color="#10b981"
          trend={true}
          trendValue={12.5}
        />
        <StatCard
          title="Transactions du Jour"
          value={stats?.transactionsJour || 0}
          icon={<CreditCard size={28} color="#3b82f6" />}
          color="#3b82f6"
          trend={true}
          trendValue={8.2}
        />
        <StatCard
          title="Étudiants Payants"
          value={stats?.etudiantsPayants || 0}
          icon={<Users size={28} color="#8b5cf6" />}
          color="#8b5cf6"
          trend={true}
          trendValue={5.3}
        />
        <StatCard
          title="Moyenne Paiement"
          value={fmt(stats?.moyennePaiement || 0)}
          icon={<TrendingUp size={28} color="#f59e0b" />}
          color="#f59e0b"
          trend={false}
          trendValue={-2.1}
        />
      </div>

      {/* Main Content Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 24 }}>
        {/* Transactions Récentes */}
        <div style={{ background: '#fff', borderRadius: 16, padding: 24, boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
            <h3 style={{ fontSize: 18, fontWeight: 700, color: '#1e293b', margin: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
              <Receipt size={20} color="#1a5276" />
              Transactions Récentes
            </h3>
            <button style={{ padding: '8px 12px', background: '#f1f5f9', border: 'none', borderRadius: 8, fontSize: 12, color: '#64748b' }}>
              Voir tout
            </button>
          </div>
          
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid #f1f5f9' }}>
                  <th style={{ padding: '12px 8px', textAlign: 'left', fontSize: 12, fontWeight: 600, color: '#64748b', textTransform: 'uppercase' }}>Étudiant</th>
                  <th style={{ padding: '12px 8px', textAlign: 'left', fontSize: 12, fontWeight: 600, color: '#64748b', textTransform: 'uppercase' }}>Montant</th>
                  <th style={{ padding: '12px 8px', textAlign: 'left', fontSize: 12, fontWeight: 600, color: '#64748b', textTransform: 'uppercase' }}>Mode</th>
                  <th style={{ padding: '12px 8px', textAlign: 'left', fontSize: 12, fontWeight: 600, color: '#64748b', textTransform: 'uppercase' }}>Type</th>
                  <th style={{ padding: '12px 8px', textAlign: 'left', fontSize: 12, fontWeight: 600, color: '#64748b', textTransform: 'uppercase' }}>Statut</th>
                </tr>
              </thead>
              <tbody>
                {transactions.map((transaction) => (
                  <tr key={transaction.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '12px 8px', fontSize: 14, fontWeight: 500 }}>
                      {transaction.etudiant}
                    </td>
                    <td style={{ padding: '12px 8px', fontSize: 14, fontWeight: 700, color: '#10b981' }}>
                      {fmt(transaction.montant)}
                    </td>
                    <td style={{ padding: '12px 8px', fontSize: 13 }}>
                      <span style={{ 
                        padding: '4px 8px', 
                        borderRadius: 6, 
                        fontSize: 11, 
                        fontWeight: 600,
                        background: '#f1f5f9',
                        color: '#64748b'
                      }}>
                        {transaction.mode}
                      </span>
                    </td>
                    <td style={{ padding: '12px 8px', fontSize: 13 }}>
                      <span style={{ 
                        padding: '4px 8px', 
                        borderRadius: 6, 
                        fontSize: 11, 
                        fontWeight: 600,
                        background: transaction.type === 'inscription' ? '#dbeafe' : '#f3e8ff',
                        color: transaction.type === 'inscription' ? '#1e40af' : '#6b21a8'
                      }}>
                        {transaction.type}
                      </span>
                    </td>
                    <td style={{ padding: '12px 8px', fontSize: 13 }}>
                      <span style={{ 
                        padding: '4px 8px', 
                        borderRadius: 6, 
                        fontSize: 11, 
                        fontWeight: 600,
                        background: transaction.statut === 'valide' ? '#d1fae5' : '#fee2e2',
                        color: transaction.statut === 'valide' ? '#065f46' : '#991b1b'
                      }}>
                        {transaction.statut}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Frais d'Inscription */}
        <div style={{ background: '#fff', borderRadius: 16, padding: 24, boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
            <h3 style={{ fontSize: 18, fontWeight: 700, color: '#1e293b', margin: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
              <FileText size={20} color="#1a5276" />
              Frais d'Inscription
            </h3>
            <button style={{ padding: '8px 12px', background: '#1a5276', color: '#fff', border: 'none', borderRadius: 8, fontSize: 12, fontWeight: 600 }}>
              Gérer
            </button>
          </div>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {fraisInscription.map((frais) => (
              <div key={frais.id} style={{ 
                padding: 16, 
                border: '1px solid #e2e8f0', 
                borderRadius: 12,
                background: frais.actif ? '#f8fafc' : '#f1f5f9'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: 8 }}>
                  <div>
                    <h4 style={{ fontSize: 14, fontWeight: 700, color: '#1e293b', margin: 0 }}>
                      {frais.parcours_nom}
                    </h4>
                    <p style={{ fontSize: 12, color: '#64748b', margin: '2px 0 0' }}>
                      {frais.annee_academique}
                    </p>
                  </div>
                  <span style={{ 
                    padding: '4px 8px', 
                    borderRadius: 6, 
                    fontSize: 10, 
                    fontWeight: 600,
                    background: frais.actif ? '#d1fae5' : '#fee2e2',
                    color: frais.actif ? '#065f46' : '#991b1b'
                  }}>
                    {frais.actif ? 'Actif' : 'Inactif'}
                  </span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', gap: 16 }}>
                    <div>
                      <p style={{ fontSize: 11, color: '#64748b', margin: 0 }}>Inscription</p>
                      <p style={{ fontSize: 13, fontWeight: 600, color: '#1e293b', margin: 0 }}>
                        {fmt(frais.montant_inscription)}
                      </p>
                    </div>
                    <div>
                      <p style={{ fontSize: 11, color: '#64748b', margin: 0 }}>Scolarité</p>
                      <p style={{ fontSize: 13, fontWeight: 600, color: '#1e293b', margin: 0 }}>
                        {fmt(frais.montant_scolarite)}
                      </p>
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <p style={{ fontSize: 11, color: '#64748b', margin: 0 }}>Total</p>
                    <p style={{ fontSize: 14, fontWeight: 800, color: '#10b981', margin: 0 }}>
                      {fmt(frais.montant_total)}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div style={{ marginTop: 32, display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 16 }}>
        <button
          onClick={() => window.location.href = '/caisse/encaissement'}
          style={{
            padding: 20,
            background: '#fff',
            border: '2px solid #e2e8f0',
            borderRadius: 12,
            fontSize: 14,
            fontWeight: 600,
            color: '#1e293b',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            transition: 'all 0.2s'
          }}
          onMouseOver={(e) => e.currentTarget.style.borderColor = '#1a5276'}
          onMouseOut={(e) => e.currentTarget.style.borderColor = '#e2e8f0'}
        >
          <CreditCard size={24} color="#1a5276" />
          <div style={{ textAlign: 'left' }}>
            <div style={{ fontWeight: 700, marginBottom: 4 }}>Encaissement</div>
            <div style={{ fontSize: 12, color: '#64748b', fontWeight: 400 }}>Nouveau paiement</div>
          </div>
        </button>

        <button
          onClick={() => window.location.href = '/caisse/cloture'}
          style={{
            padding: 20,
            background: '#fff',
            border: '2px solid #e2e8f0',
            borderRadius: 12,
            fontSize: 14,
            fontWeight: 600,
            color: '#1e293b',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            transition: 'all 0.2s'
          }}
          onMouseOver={(e) => e.currentTarget.style.borderColor = '#1a5276'}
          onMouseOut={(e) => e.currentTarget.style.borderColor = '#e2e8f0'}
        >
          <Calendar size={24} color="#1a5276" />
          <div style={{ textAlign: 'left' }}>
            <div style={{ fontWeight: 700, marginBottom: 4 }}>Clôture</div>
            <div style={{ fontSize: 12, color: '#64748b', fontWeight: 400 }}>Fin de journée</div>
          </div>
        </button>

        <button
          onClick={() => window.location.href = '/caisse/rapports'}
          style={{
            padding: 20,
            background: '#fff',
            border: '2px solid #e2e8f0',
            borderRadius: 12,
            fontSize: 14,
            fontWeight: 600,
            color: '#1e293b',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            transition: 'all 0.2s'
          }}
          onMouseOver={(e) => e.currentTarget.style.borderColor = '#1a5276'}
          onMouseOut={(e) => e.currentTarget.style.borderColor = '#e2e8f0'}
        >
          <FileText size={24} color="#1a5276" />
          <div style={{ textAlign: 'left' }}>
            <div style={{ fontWeight: 700, marginBottom: 4 }}>Rapports</div>
            <div style={{ fontSize: 12, color: '#64748b', fontWeight: 400 }}>Statistiques</div>
          </div>
        </button>

        <button
          onClick={() => window.location.href = '/caisse/frais-inscription'}
          style={{
            padding: 20,
            background: '#fff',
            border: '2px solid #e2e8f0',
            borderRadius: 12,
            fontSize: 14,
            fontWeight: 600,
            color: '#1e293b',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            transition: 'all 0.2s'
          }}
          onMouseOver={(e) => e.currentTarget.style.borderColor = '#1a5276'}
          onMouseOut={(e) => e.currentTarget.style.borderColor = '#e2e8f0'}
        >
          <Settings size={24} color="#1a5276" />
          <div style={{ textAlign: 'left' }}>
            <div style={{ fontWeight: 700, marginBottom: 4 }}>Configuration</div>
            <div style={{ fontSize: 12, color: '#64748b', fontWeight: 400 }}>Frais d'inscription</div>
          </div>
        </button>
      </div>
    </div>
  );
};

// Made with Bob
