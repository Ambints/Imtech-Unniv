import React, { useState, useEffect } from 'react';
import { useAuthStore } from '../../store/authStore';
import toast from 'react-hot-toast';
import { 
  FileText, Download, Calendar, TrendingUp, DollarSign, Users,
  CreditCard, Building2, Smartphone, Wallet, BarChart3, PieChart,
  LineChart, Filter, Search, Printer, Eye, EyeOff, RefreshCw
} from 'lucide-react';

interface RapportAnnuel {
  annee: number;
  totaux: {
    total_annuel: number;
    nb_transactions: number;
    nb_etudiants: number;
    montant_moyen: number;
  };
  evolutionMensuelle: Array<{
    mois: number;
    total_mois: number;
    nb_transactions: number;
  }>;
  topParcours: Array<{
    parcours_code: string;
    parcours_nom: string;
    total_parcours: number;
    nb_transactions: number;
  }>;
  repartitionModesPaiement: Array<{
    mode_paiement: string;
    total: number;
    nb_transactions: number;
    pourcentage: number;
  }>;
}

interface RapportParcours {
  parcours_code: string;
  parcours_nom: string;
  departement_nom: string;
  total_encaisse: number;
  nb_transactions: number;
  nb_etudiants: number;
  montant_moyen: number;
  total_inscriptions: number;
  total_scolarite: number;
}

interface RapportModesPaiement {
  mode_paiement: string;
  nb_transactions: number;
  total: number;
  montant_moyen: number;
  montant_min: number;
  montant_max: number;
}

export const ReportingPage: React.FC = () => {
  const { user, tenant } = useAuthStore();
  const tenantId = tenant?.id || '';
  
  const [rapportAnnuel, setRapportAnnuel] = useState<RapportAnnuel | null>(null);
  const [rapportsParcours, setRapportsParcours] = useState<RapportParcours[]>([]);
  const [rapportsModesPaiement, setRapportsModesPaiement] = useState<RapportModesPaiement[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedReport, setSelectedReport] = useState<'annuel' | 'parcours' | 'modes'>('annuel');
  const [dateRange, setDateRange] = useState({
    debut: new Date(new Date().getFullYear(), 0, 1).toISOString().split('T')[0],
    fin: new Date(new Date().getFullYear(), 11, 31).toISOString().split('T')[0]
  });
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    if (selectedReport === 'annuel') {
      loadRapportAnnuel();
    } else if (selectedReport === 'parcours') {
      loadRapportsParcours();
    } else if (selectedReport === 'modes') {
      loadRapportsModesPaiement();
    }
  }, [selectedReport, selectedYear, dateRange, tenantId]);

  const loadRapportAnnuel = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/caissier/rapports/annuel?annee=${selectedYear}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (response.ok) {
        const data = await response.json();
        setRapportAnnuel(data);
      } else {
        const error = await response.json();
        toast.error(error.message || 'Erreur lors du chargement');
      }
    } catch (error) {
      console.error('Erreur:', error);
      toast.error('Erreur de connexion');
    } finally {
      setLoading(false);
    }
  };

  const loadRapportsParcours = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/caissier/rapports/parcours?dateDebut=${dateRange.debut}&dateFin=${dateRange.fin}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (response.ok) {
        const data = await response.json();
        setRapportsParcours(data);
      } else {
        const error = await response.json();
        toast.error(error.message || 'Erreur lors du chargement');
      }
    } catch (error) {
      console.error('Erreur:', error);
      toast.error('Erreur de connexion');
    } finally {
      setLoading(false);
    }
  };

  const loadRapportsModesPaiement = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/caissier/rapports/modes-paiement?dateDebut=${dateRange.debut}&dateFin=${dateRange.fin}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (response.ok) {
        const data = await response.json();
        setRapportsModesPaiement(data);
      } else {
        const error = await response.json();
        toast.error(error.message || 'Erreur lors du chargement');
      }
    } catch (error) {
      console.error('Erreur:', error);
      toast.error('Erreur de connexion');
    } finally {
      setLoading(false);
    }
  };

  const exportReport = async (format: 'pdf' | 'excel' | 'csv') => {
    try {
      const token = localStorage.getItem('token');
      let url = '';
      
      if (selectedReport === 'annuel') {
        url = `/api/caissier/rapports/annuel/export?annee=${selectedYear}&format=${format}`;
      } else if (selectedReport === 'parcours') {
        url = `/api/caissier/rapports/parcours/export?dateDebut=${dateRange.debut}&dateFin=${dateRange.fin}&format=${format}`;
      } else {
        url = `/api/caissier/rapports/modes-paiement/export?dateDebut=${dateRange.debut}&dateFin=${dateRange.fin}&format=${format}`;
      }
      
      const response = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (response.ok) {
        const blob = await response.blob();
        const downloadUrl = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = downloadUrl;
        a.download = `rapport-${selectedReport}-${new Date().toISOString().split('T')[0]}.${format}`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(downloadUrl);
        document.body.removeChild(a);
        toast.success(`Rapport exporté en ${format.toUpperCase()}`);
      } else {
        toast.error('Erreur lors de l\'export');
      }
    } catch (error) {
      console.error('Erreur:', error);
      toast.error('Erreur d\'export');
    }
  };

  const fmt = (n: number) => Number(n || 0).toLocaleString('fr-FR') + ' Ar';

  const getMonthName = (month: number) => {
    const months = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin', 'Juil', 'Août', 'Sep', 'Oct', 'Nov', 'Déc'];
    return months[month - 1];
  };

  const getModeIcon = (mode: string) => {
    switch (mode) {
      case 'especes': return <Wallet size={16} color="#10b981" />;
      case 'cheque': return <CreditCard size={16} color="#3b82f6" />;
      case 'virement': return <Building2 size={16} color="#8b5cf6" />;
      case 'carte_bancaire': return <CreditCard size={16} color="#f59e0b" />;
      case 'mobile_money': return <Smartphone size={16} color="#ef4444" />;
      default: return <DollarSign size={16} color="#64748b" />;
    }
  };

  const StatCard = ({ title, value, icon, color, subtitle, trend }: any) => (
    <div style={{ 
      background: '#fff', 
      borderRadius: 16, 
      padding: 24, 
      boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
      border: `1px solid ${color}20`
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 16 }}>
        <div style={{ 
          padding: 12, 
          borderRadius: 12, 
          background: `${color}10`,
          display: 'flex',
          alignItems: 'center'
        }}>
          {icon}
        </div>
        <div style={{ flex: 1 }}>
          <p style={{ fontSize: 12, fontWeight: 600, color: '#64748b', margin: 0, textTransform: 'uppercase' }}>
            {title}
          </p>
          <p style={{ fontSize: 24, fontWeight: 800, color: '#1e293b', margin: 0 }}>
            {value}
          </p>
          {subtitle && (
            <p style={{ fontSize: 12, color: '#64748b', margin: '2px 0 0' }}>
              {subtitle}
            </p>
          )}
        </div>
        {trend && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            {trend > 0 ? (
              <TrendingUp size={16} color="#10b981" />
            ) : (
              <TrendingUp size={16} color="#ef4444" style={{ transform: 'rotate(180deg)' }} />
            )}
            <span style={{ fontSize: 12, color: trend > 0 ? '#10b981' : '#ef4444' }}>
              {Math.abs(trend)}%
            </span>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div style={{ padding: 32, background: '#F8FAFC', minHeight: '100vh' }}>
      {/* Header */}
      <div style={{ marginBottom: 32 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <div>
            <h1 style={{ fontSize: 28, fontWeight: 900, color: '#1e293b', margin: 0, display: 'flex', alignItems: 'center', gap: 12 }}>
              <FileText size={32} color="#1a5276" />
              Rapports & Statistiques
            </h1>
            <p style={{ color: '#64748b', fontSize: 16, margin: '4px 0 0' }}>
              Analyse financière et reporting détaillé
            </p>
          </div>
          <div style={{ display: 'flex', gap: 12 }}>
            <button
              onClick={() => exportReport('pdf')}
              style={{
                padding: '10px 16px',
                background: '#dc2626',
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
              <Download size={18} />
              PDF
            </button>
            <button
              onClick={() => exportReport('excel')}
              style={{
                padding: '10px 16px',
                background: '#059669',
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
              <Download size={18} />
              Excel
            </button>
            <button
              onClick={() => exportReport('csv')}
              style={{
                padding: '10px 16px',
                background: '#7c3aed',
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
              <Download size={18} />
              CSV
            </button>
          </div>
        </div>

        {/* Report Type Selector */}
        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          <div style={{ display: 'flex', background: '#fff', borderRadius: 12, padding: 4, border: '1px solid #e2e8f0' }}>
            {[
              { value: 'annuel', label: 'Rapport Annuel', icon: <Calendar size={16} /> },
              { value: 'parcours', label: 'Par Parcours', icon: <Users size={16} /> },
              { value: 'modes', label: 'Modes Paiement', icon: <CreditCard size={16} /> }
            ].map((report) => (
              <button
                key={report.value}
                onClick={() => setSelectedReport(report.value as any)}
                style={{
                  padding: '8px 16px',
                  background: selectedReport === report.value ? '#1a5276' : 'transparent',
                  color: selectedReport === report.value ? '#fff' : '#64748b',
                  border: 'none',
                  borderRadius: 8,
                  fontSize: 14,
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6
                }}
              >
                {report.icon}
                {report.label}
              </button>
            ))}
          </div>

          {/* Date Filters */}
          {selectedReport === 'annuel' ? (
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(parseInt(e.target.value))}
              style={{
                padding: '10px 16px',
                border: '2px solid #e2e8f0',
                borderRadius: 10,
                fontSize: 14,
                background: '#fff',
                cursor: 'pointer'
              }}
            >
              {Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i).map(year => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>
          ) : (
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <input
                type="date"
                value={dateRange.debut}
                onChange={(e) => setDateRange(prev => ({ ...prev, debut: e.target.value }))}
                style={{
                  padding: '10px 16px',
                  border: '2px solid #e2e8f0',
                  borderRadius: 10,
                  fontSize: 14,
                  cursor: 'pointer'
                }}
              />
              <span style={{ color: '#64748b', fontSize: 14 }}>au</span>
              <input
                type="date"
                value={dateRange.fin}
                onChange={(e) => setDateRange(prev => ({ ...prev, fin: e.target.value }))}
                style={{
                  padding: '10px 16px',
                  border: '2px solid #e2e8f0',
                  borderRadius: 10,
                  fontSize: 14,
                  cursor: 'pointer'
                }}
              />
            </div>
          )}
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 400 }}>
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Chargement...</span>
          </div>
        </div>
      )}

      {/* Rapport Annuel */}
      {!loading && selectedReport === 'annuel' && rapportAnnuel && (
        <div>
          {/* Stats Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 20, marginBottom: 32 }}>
            <StatCard
              title="Total Annuel"
              value={fmt(rapportAnnuel.totaux.total_annuel)}
              icon={<DollarSign size={24} color="#10b981" />}
              color="#10b981"
              subtitle={`${rapportAnnuel.totaux.nb_transactions} transactions`}
              trend={12.5}
            />
            <StatCard
              title="Étudiants Uniques"
              value={rapportAnnuel.totaux.nb_etudiants}
              icon={<Users size={24} color="#3b82f6" />}
              color="#3b82f6"
              subtitle="Paiants cette année"
              trend={8.3}
            />
            <StatCard
              title="Moyenne Paiement"
              value={fmt(rapportAnnuel.totaux.montant_moyen)}
              icon={<TrendingUp size={24} color="#8b5cf6" />}
              color="#8b5cf6"
              subtitle="Par transaction"
              trend={-2.1}
            />
            <StatCard
              title="Transactions"
              value={rapportAnnuel.totaux.nb_transactions}
              icon={<BarChart3 size={24} color="#f59e0b" />}
              color="#f59e0b"
              subtitle="Total enregistrées"
              trend={15.7}
            />
          </div>

          {/* Evolution Mensuelle */}
          <div style={{ 
            background: '#fff', 
            borderRadius: 16, 
            padding: 24, 
            boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
            marginBottom: 32
          }}>
            <h3 style={{ fontSize: 18, fontWeight: 700, color: '#1e293b', margin: '0 0 20px', display: 'flex', alignItems: 'center', gap: 8 }}>
              <LineChart size={20} color="#1a5276" />
              Évolution Mensuelle
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 16 }}>
              {rapportAnnuel.evolutionMensuelle.map((mois) => (
                <div key={mois.mois} style={{ 
                  padding: 16, 
                  background: '#f8fafc', 
                  borderRadius: 12,
                  border: '1px solid #e2e8f0'
                }}>
                  <div style={{ fontSize: 12, color: '#64748b', marginBottom: 8 }}>
                    {getMonthName(mois.mois)}
                  </div>
                  <div style={{ fontSize: 16, fontWeight: 700, color: '#1e293b', marginBottom: 4 }}>
                    {fmt(mois.total_mois)}
                  </div>
                  <div style={{ fontSize: 11, color: '#64748b' }}>
                    {mois.nb_transactions} transactions
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Top Parcours */}
          <div style={{ 
            background: '#fff', 
            borderRadius: 16, 
            padding: 24, 
            boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
            marginBottom: 32
          }}>
            <h3 style={{ fontSize: 18, fontWeight: 700, color: '#1e293b', margin: '0 0 20px', display: 'flex', alignItems: 'center', gap: 8 }}>
              <BarChart3 size={20} color="#1a5276" />
              Top Parcours par Revenus
            </h3>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: '2px solid #f1f5f9' }}>
                    <th style={{ padding: '12px 8px', textAlign: 'left', fontSize: 12, fontWeight: 600, color: '#64748b', textTransform: 'uppercase' }}>Parcours</th>
                    <th style={{ padding: '12px 8px', textAlign: 'center', fontSize: 12, fontWeight: 600, color: '#64748b', textTransform: 'uppercase' }}>Total Encaissé</th>
                    <th style={{ padding: '12px 8px', textAlign: 'center', fontSize: 12, fontWeight: 600, color: '#64748b', textTransform: 'uppercase' }}>Transactions</th>
                    <th style={{ padding: '12px 8px', textAlign: 'center', fontSize: 12, fontWeight: 600, color: '#64748b', textTransform: 'uppercase' }}>Part du Total</th>
                  </tr>
                </thead>
                <tbody>
                  {rapportAnnuel.topParcours.map((parcours, index) => (
                    <tr key={parcours.parcours_code} style={{ borderBottom: '1px solid #f1f5f9' }}>
                      <td style={{ padding: '12px 8px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <div style={{ 
                            width: 24, 
                            height: 24, 
                            borderRadius: '50%', 
                            background: '#1a5276', 
                            color: '#fff', 
                            display: 'flex', 
                            alignItems: 'center', 
                            justifyContent: 'center', 
                            fontSize: 12, 
                            fontWeight: 700 
                          }}>
                            {index + 1}
                          </div>
                          <div>
                            <div style={{ fontSize: 14, fontWeight: 600, color: '#1e293b' }}>
                              {parcours.parcours_nom}
                            </div>
                            <div style={{ fontSize: 12, color: '#64748b' }}>
                              {parcours.parcours_code}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td style={{ padding: '12px 8px', textAlign: 'center', fontSize: 14, fontWeight: 700, color: '#10b981' }}>
                        {fmt(parcours.total_parcours)}
                      </td>
                      <td style={{ padding: '12px 8px', textAlign: 'center', fontSize: 14, color: '#1e293b' }}>
                        {parcours.nb_transactions}
                      </td>
                      <td style={{ padding: '12px 8px', textAlign: 'center' }}>
                        <div style={{ 
                          display: 'flex', 
                          alignItems: 'center', 
                          justifyContent: 'center', 
                          gap: 8 
                        }}>
                          <div style={{ 
                            width: 60, 
                            height: 8, 
                            background: '#e2e8f0', 
                            borderRadius: 4, 
                            overflow: 'hidden' 
                          }}>
                            <div style={{ 
                              width: `${(parcours.total_parcours / rapportAnnuel.totaux.total_annuel) * 100}%`, 
                              height: '100%', 
                              background: '#10b981' 
                            }} />
                          </div>
                          <span style={{ fontSize: 12, color: '#64748b', minWidth: 40 }}>
                            {((parcours.total_parcours / rapportAnnuel.totaux.total_annuel) * 100).toFixed(1)}%
                          </span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Répartition Modes Paiement */}
          <div style={{ 
            background: '#fff', 
            borderRadius: 16, 
            padding: 24, 
            boxShadow: '0 4px 12px rgba(0,0,0,0.08)'
          }}>
            <h3 style={{ fontSize: 18, fontWeight: 700, color: '#1e293b', margin: '0 0 20px', display: 'flex', alignItems: 'center', gap: 8 }}>
              <PieChart size={20} color="#1a5276" />
              Répartition par Mode de Paiement
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16 }}>
              {rapportAnnuel.repartitionModesPaiement.map((mode) => (
                <div key={mode.mode_paiement} style={{ 
                  padding: 16, 
                  background: '#f8fafc', 
                  borderRadius: 12,
                  border: '1px solid #e2e8f0'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                    {getModeIcon(mode.mode_paiement)}
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 14, fontWeight: 600, color: '#1e293b', textTransform: 'capitalize' }}>
                        {mode.mode_paiement.replace('_', ' ')}
                      </div>
                      <div style={{ fontSize: 11, color: '#64748b' }}>
                        {mode.nb_transactions} transactions
                      </div>
                    </div>
                  </div>
                  <div style={{ fontSize: 18, fontWeight: 800, color: '#10b981', marginBottom: 8 }}>
                    {fmt(mode.total)}
                  </div>
                  <div style={{ fontSize: 12, color: '#64748b' }}>
                    {mode.pourcentage.toFixed(1)}% du total
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Rapports Parcours */}
      {!loading && selectedReport === 'parcours' && rapportsParcours.length > 0 && (
        <div style={{ 
          background: '#fff', 
          borderRadius: 16, 
          padding: 24, 
          boxShadow: '0 4px 12px rgba(0,0,0,0.08)'
        }}>
          <h3 style={{ fontSize: 18, fontWeight: 700, color: '#1e293b', margin: '0 0 20px', display: 'flex', alignItems: 'center', gap: 8 }}>
            <Users size={20} color="#1a5276" />
            Rapports par Parcours
          </h3>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid #f1f5f9' }}>
                  <th style={{ padding: '12px 8px', textAlign: 'left', fontSize: 12, fontWeight: 600, color: '#64748b', textTransform: 'uppercase' }}>Parcours</th>
                  <th style={{ padding: '12px 8px', textAlign: 'center', fontSize: 12, fontWeight: 600, color: '#64748b', textTransform: 'uppercase' }}>Département</th>
                  <th style={{ padding: '12px 8px', textAlign: 'center', fontSize: 12, fontWeight: 600, color: '#64748b', textTransform: 'uppercase' }}>Total Encaissé</th>
                  <th style={{ padding: '12px 8px', textAlign: 'center', fontSize: 12, fontWeight: 600, color: '#64748b', textTransform: 'uppercase' }}>Transactions</th>
                  <th style={{ padding: '12px 8px', textAlign: 'center', fontSize: 12, fontWeight: 600, color: '#64748b', textTransform: 'uppercase' }}>Étudiants</th>
                  <th style={{ padding: '12px 8px', textAlign: 'center', fontSize: 12, fontWeight: 600, color: '#64748b', textTransform: 'uppercase' }}>Moyenne</th>
                  <th style={{ padding: '12px 8px', textAlign: 'center', fontSize: 12, fontWeight: 600, color: '#64748b', textTransform: 'uppercase' }}>Inscriptions</th>
                  <th style={{ padding: '12px 8px', textAlign: 'center', fontSize: 12, fontWeight: 600, color: '#64748b', textTransform: 'uppercase' }}>Scolarité</th>
                </tr>
              </thead>
              <tbody>
                {rapportsParcours.map((parcours) => (
                  <tr key={parcours.parcours_code} style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '12px 8px' }}>
                      <div>
                        <div style={{ fontSize: 14, fontWeight: 600, color: '#1e293b' }}>
                          {parcours.parcours_nom}
                        </div>
                        <div style={{ fontSize: 12, color: '#64748b' }}>
                          {parcours.parcours_code}
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: '12px 8px', fontSize: 14, color: '#1e293b' }}>
                      {parcours.departement_nom}
                    </td>
                    <td style={{ padding: '12px 8px', textAlign: 'center', fontSize: 14, fontWeight: 700, color: '#10b981' }}>
                      {fmt(parcours.total_encaisse)}
                    </td>
                    <td style={{ padding: '12px 8px', textAlign: 'center', fontSize: 14, color: '#1e293b' }}>
                      {parcours.nb_transactions}
                    </td>
                    <td style={{ padding: '12px 8px', textAlign: 'center', fontSize: 14, color: '#1e293b' }}>
                      {parcours.nb_etudiants}
                    </td>
                    <td style={{ padding: '12px 8px', textAlign: 'center', fontSize: 14, fontWeight: 600, color: '#1e293b' }}>
                      {fmt(parcours.montant_moyen)}
                    </td>
                    <td style={{ padding: '12px 8px', textAlign: 'center', fontSize: 14, color: '#3b82f6' }}>
                      {fmt(parcours.total_inscriptions)}
                    </td>
                    <td style={{ padding: '12px 8px', textAlign: 'center', fontSize: 14, color: '#8b5cf6' }}>
                      {fmt(parcours.total_scolarite)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Rapports Modes Paiement */}
      {!loading && selectedReport === 'modes' && rapportsModesPaiement.length > 0 && (
        <div style={{ 
          background: '#fff', 
          borderRadius: 16, 
          padding: 24, 
          boxShadow: '0 4px 12px rgba(0,0,0,0.08)'
        }}>
          <h3 style={{ fontSize: 18, fontWeight: 700, color: '#1e293b', margin: '0 0 20px', display: 'flex', alignItems: 'center', gap: 8 }}>
            <CreditCard size={20} color="#1a5276" />
            Statistiques par Mode de Paiement
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 20 }}>
            {rapportsModesPaiement.map((mode) => (
              <div key={mode.mode_paiement} style={{ 
                padding: 20, 
                background: '#f8fafc', 
                borderRadius: 12,
                border: '1px solid #e2e8f0'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
                  {getModeIcon(mode.mode_paiement)}
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 16, fontWeight: 700, color: '#1e293b', textTransform: 'capitalize' }}>
                      {mode.mode_paiement.replace('_', ' ')}
                    </div>
                    <div style={{ fontSize: 12, color: '#64748b' }}>
                      {mode.nb_transactions} transactions
                    </div>
                  </div>
                </div>
                
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
                  <div>
                    <p style={{ fontSize: 11, color: '#64748b', margin: '0 0 4px' }}>Total</p>
                    <p style={{ fontSize: 18, fontWeight: 800, color: '#10b981', margin: 0 }}>
                      {fmt(mode.total)}
                    </p>
                  </div>
                  <div>
                    <p style={{ fontSize: 11, color: '#64748b', margin: '0 0 4px' }}>Moyenne</p>
                    <p style={{ fontSize: 16, fontWeight: 600, color: '#1e293b', margin: 0 }}>
                      {fmt(mode.montant_moyen)}
                    </p>
                  </div>
                </div>
                
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, paddingTop: 12, borderTop: '1px solid #e2e8f0' }}>
                  <div>
                    <p style={{ fontSize: 11, color: '#64748b', margin: '0 0 4px' }}>Min</p>
                    <p style={{ fontSize: 14, color: '#64748b', margin: 0 }}>
                      {fmt(mode.montant_min)}
                    </p>
                  </div>
                  <div>
                    <p style={{ fontSize: 11, color: '#64748b', margin: '0 0 4px' }}>Max</p>
                    <p style={{ fontSize: 14, color: '#64748b', margin: 0 }}>
                      {fmt(mode.montant_max)}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
