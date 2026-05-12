import React, { useState, useEffect } from 'react';
import { useAuthStore } from '../../store/authStore';
import toast from 'react-hot-toast';
import { 
  Calendar, DollarSign, CheckCircle, AlertCircle, Clock, TrendingUp,
  CreditCard, Wallet, Smartphone, Building2, Download, Printer,
  Eye, EyeOff, RefreshCw, Save, X, FileText, Settings
} from 'lucide-react';

interface ClotureCaisse {
  id: string;
  date_cloture: string;
  caissier_id: string;
  caissier_nom: string;
  total_especes: number;
  total_cheques: number;
  total_virements: number;
  total_carte_bancaire: number;
  total_mobile_money: number;
  total_general: number;
  nombre_paiements: number;
  details_paiements: {
    inscription: { montant: number; nombre: number };
    scolarite: { montant: number; nombre: number };
    autres: { montant: number; nombre: number };
  };
  solde_banque_theorique: number;
  solde_banque_reel: number;
  ecart: number;
  motif_ecart: string;
  valide: boolean;
  valide_par: string;
  date_validation: string;
  observations: string;
}

interface PaiementDuJour {
  id: string;
  etudiant_nom: string;
  etudiant_matricule: string;
  parcours_nom: string;
  montant: number;
  mode_paiement: string;
  type_paiement: string;
  date_paiement: string;
  numero_recu: string;
}

interface RapprochementBancaire {
  solde_theorique: number;
  solde_reel: number;
  ecart: number;
  motif_ecart?: string;
  dernier_mise_jour: string;
}

export const ClotureCaissePage: React.FC = () => {
  const { user, tenant } = useAuthStore();
  const tenantId = tenant?.id || '';
  
  const [cloture, setCloture] = useState<ClotureCaisse | null>(null);
  const [paiementsDuJour, setPaiementsDuJour] = useState<PaiementDuJour[]>([]);
  const [rapprochement, setRapprochement] = useState<RapprochementBancaire | null>(null);
  const [loading, setLoading] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [showValidationModal, setShowValidationModal] = useState(false);
  const [showRapprochementModal, setShowRapprochementModal] = useState(false);
  const [calculating, setCalculating] = useState(false);
  const [observations, setObservations] = useState('');
  
  const [formRapprochement, setFormRapprochement] = useState({
    solde_reel: '',
    motif_ecart: ''
  });

  useEffect(() => {
    if (selectedDate) {
      loadClotureData();
    }
  }, [selectedDate, tenantId]);

  const loadClotureData = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      
      // Charger la clôture existante
      const clotureResponse = await fetch(`/api/caissier/cloture/journaliere?date=${selectedDate}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (clotureResponse.ok) {
        const clotureData = await clotureResponse.json();
        setCloture(clotureData);
      } else {
        setCloture(null);
      }

      // Charger les paiements du jour
      const paiementsResponse = await fetch(`/api/caissier/paiements?date=${selectedDate}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (paiementsResponse.ok) {
        const paiementsData = await paiementsResponse.json();
        setPaiementsDuJour(paiementsData);
      }

      // Charger le rapprochement bancaire
      const rapprochementResponse = await fetch(`/api/caissier/rapprochement-bancaire?date=${selectedDate}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (rapprochementResponse.ok) {
        const rapprochementData = await rapprochementResponse.json();
        setRapprochement(rapprochementData);
        setFormRapprochement({
          solde_reel: rapprochementData.solde_reel.toString(),
          motif_ecart: rapprochementData.motif_ecart || ''
        });
      }
    } catch (error) {
      console.error('Erreur lors du chargement des données:', error);
      toast.error('Erreur de chargement');
    } finally {
      setLoading(false);
    }
  };

  const calculerTotaux = async () => {
    setCalculating(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/caissier/calculer-totaux`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          date_cloture: selectedDate,
          caissier_id: user?.id
        })
      });

      if (response.ok) {
        toast.success('Totaux calculés avec succès!');
        loadClotureData();
      } else {
        const error = await response.json();
        toast.error(error.message || 'Erreur lors du calcul');
      }
    } catch (error) {
      console.error('Erreur:', error);
      toast.error('Erreur de connexion');
    } finally {
      setCalculating(false);
    }
  };

  const validerCloture = async () => {
    if (!cloture) {
      toast.error('Aucune clôture à valider');
      return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/caissier/cloture/journaliere`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          date: selectedDate,
          observations: observations
        })
      });

      if (response.ok) {
        toast.success('Clôture validée avec succès!');
        setShowValidationModal(false);
        loadClotureData();
      } else {
        const error = await response.json();
        toast.error(error.message || 'Erreur lors de la validation');
      }
    } catch (error) {
      console.error('Erreur:', error);
      toast.error('Erreur de connexion');
    } finally {
      setLoading(false);
    }
  };

  const sauvegarderRapprochement = async () => {
    if (!formRapprochement.solde_reel) {
      toast.error('Veuillez entrer le solde bancaire réel');
      return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/caissier/rapprochement-bancaire`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          date: selectedDate,
          solde_reel: parseFloat(formRapprochement.solde_reel),
          motif_ecart: formRapprochement.motif_ecart
        })
      });

      if (response.ok) {
        toast.success('Rapprochement sauvegardé avec succès!');
        setShowRapprochementModal(false);
        loadClotureData();
      } else {
        const error = await response.json();
        toast.error(error.message || 'Erreur lors de la sauvegarde');
      }
    } catch (error) {
      console.error('Erreur:', error);
      toast.error('Erreur de connexion');
    } finally {
      setLoading(false);
    }
  };

  const fmt = (n: number) => Number(n || 0).toLocaleString('fr-FR') + ' Ar';

  const getIconForMode = (mode: string) => {
    switch (mode) {
      case 'especes': return <Wallet size={16} color="#10b981" />;
      case 'cheque': return <CreditCard size={16} color="#3b82f6" />;
      case 'virement': return <Building2 size={16} color="#8b5cf6" />;
      case 'carte_bancaire': return <CreditCard size={16} color="#f59e0b" />;
      case 'mobile_money': return <Smartphone size={16} color="#ef4444" />;
      default: return <DollarSign size={16} color="#64748b" />;
    }
  };

  const StatCard = ({ title, value, icon, color, subtitle }: any) => (
    <div style={{ 
      background: '#fff', 
      borderRadius: 12, 
      padding: 20, 
      boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
      border: `1px solid ${color}20`
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
        <div style={{ 
          padding: 8, 
          borderRadius: 8, 
          background: `${color}10`,
          display: 'flex',
          alignItems: 'center'
        }}>
          {icon}
        </div>
        <div>
          <p style={{ fontSize: 12, fontWeight: 600, color: '#64748b', margin: 0, textTransform: 'uppercase' }}>
            {title}
          </p>
          <p style={{ fontSize: 20, fontWeight: 800, color: '#1e293b', margin: 0 }}>
            {value}
          </p>
          {subtitle && (
            <p style={{ fontSize: 11, color: '#64748b', margin: '2px 0 0' }}>
              {subtitle}
            </p>
          )}
        </div>
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
              <Calendar size={32} color="#1a5276" />
              Clôture de Caisse
            </h1>
            <p style={{ color: '#64748b', fontSize: 16, margin: '4px 0 0' }}>
              Gestion de la clôture journalière et rapprochement bancaire
            </p>
          </div>
          <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              style={{
                padding: '10px 16px',
                border: '2px solid #e2e8f0',
                borderRadius: 10,
                fontSize: 14,
                cursor: 'pointer'
              }}
            />
            <button
              onClick={calculerTotaux}
              disabled={calculating}
              style={{
                padding: '10px 16px',
                background: calculating ? '#94a3b8' : '#3b82f6',
                color: '#fff',
                border: 'none',
                borderRadius: 10,
                fontSize: 14,
                fontWeight: 600,
                cursor: calculating ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 8
              }}
            >
              {calculating ? (
                <div className="spinner-border spinner-border-sm" role="status">
                  <span className="visually-hidden">Chargement...</span>
                </div>
              ) : (
                <>
                  <RefreshCw size={18} />
                  Calculer
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Status de la Clôture */}
      {cloture && (
        <div style={{ 
          background: cloture.valide ? '#d1fae5' : '#fef3c7', 
          border: `2px solid ${cloture.valide ? '#10b981' : '#f59e0b'}`,
          borderRadius: 12, 
          padding: 16, 
          marginBottom: 24,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            {cloture.valide ? (
              <CheckCircle size={24} color="#10b981" />
            ) : (
              <Clock size={24} color="#f59e0b" />
            )}
            <div>
              <h3 style={{ fontSize: 16, fontWeight: 700, color: '#1e293b', margin: 0 }}>
                Clôture {cloture.valide ? 'Validée' : 'En Cours'}
              </h3>
              <p style={{ fontSize: 13, color: '#64748b', margin: '2px 0 0' }}>
                {cloture.valide ? `Validée par ${cloture.valide_par} le ${new Date(cloture.date_validation).toLocaleDateString('fr-FR')}` : 'En attente de validation'}
              </p>
            </div>
          </div>
          {!cloture.valide && (
            <button
              onClick={() => setShowValidationModal(true)}
              style={{
                padding: '8px 16px',
                background: '#10b981',
                color: '#fff',
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
              <CheckCircle size={16} />
              Valider
            </button>
          )}
        </div>
      )}

      {/* Statistiques */}
      {cloture && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, marginBottom: 32 }}>
          <StatCard
            title="Total Général"
            value={fmt(cloture.total_general)}
            icon={<DollarSign size={20} color="#10b981" />}
            color="#10b981"
            subtitle={`${cloture.nombre_paiements} transactions`}
          />
          <StatCard
            title="Espèces"
            value={fmt(cloture.total_especes)}
            icon={<Wallet size={20} color="#10b981" />}
            color="#10b981"
          />
          <StatCard
            title="Chèques"
            value={fmt(cloture.total_cheques)}
            icon={<CreditCard size={20} color="#3b82f6" />}
            color="#3b82f6"
          />
          <StatCard
            title="Virements"
            value={fmt(cloture.total_virements)}
            icon={<Building2 size={20} color="#8b5cf6" />}
            color="#8b5cf6"
          />
          <StatCard
            title="Carte Bancaire"
            value={fmt(cloture.total_carte_bancaire)}
            icon={<CreditCard size={20} color="#f59e0b" />}
            color="#f59e0b"
          />
          <StatCard
            title="Mobile Money"
            value={fmt(cloture.total_mobile_money)}
            icon={<Smartphone size={20} color="#ef4444" />}
            color="#ef4444"
          />
        </div>
      )}

      {/* Rapprochement Bancaire */}
      {rapprochement && (
        <div style={{ 
          background: '#fff', 
          borderRadius: 16, 
          padding: 24, 
          boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
          marginBottom: 32
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
            <h3 style={{ fontSize: 18, fontWeight: 700, color: '#1e293b', margin: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
              <TrendingUp size={20} color="#1a5276" />
              Rapprochement Bancaire
            </h3>
            <button
              onClick={() => setShowRapprochementModal(true)}
              style={{
                padding: '8px 16px',
                background: '#1a5276',
                color: '#fff',
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
              <Settings size={16} />
              Modifier
            </button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
            <div style={{ padding: 16, background: '#f8fafc', borderRadius: 12 }}>
              <p style={{ fontSize: 12, fontWeight: 600, color: '#64748b', margin: '0 0 8px', textTransform: 'uppercase' }}>
                Solde Théorique
              </p>
              <p style={{ fontSize: 20, fontWeight: 800, color: '#1e293b', margin: 0 }}>
                {fmt(rapprochement.solde_theorique)}
              </p>
            </div>
            <div style={{ padding: 16, background: '#f8fafc', borderRadius: 12 }}>
              <p style={{ fontSize: 12, fontWeight: 600, color: '#64748b', margin: '0 0 8px', textTransform: 'uppercase' }}>
                Solde Bancaire Réel
              </p>
              <p style={{ fontSize: 20, fontWeight: 800, color: '#1e293b', margin: 0 }}>
                {fmt(rapprochement.solde_reel)}
              </p>
            </div>
            <div style={{ 
              padding: 16, 
              background: rapprochement.ecart === 0 ? '#d1fae5' : '#fee2e2', 
              borderRadius: 12 
            }}>
              <p style={{ fontSize: 12, fontWeight: 600, color: '#64748b', margin: '0 0 8px', textTransform: 'uppercase' }}>
                Écart
              </p>
              <p style={{ 
                fontSize: 20, 
                fontWeight: 800, 
                color: rapprochement.ecart === 0 ? '#065f46' : '#991b1b', 
                margin: 0 
              }}>
                {fmt(Math.abs(rapprochement.ecart))}
              </p>
              {rapprochement.motif_ecart && (
                <p style={{ fontSize: 11, color: '#64748b', margin: '4px 0 0' }}>
                  {rapprochement.motif_ecart}
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Paiements du Jour */}
      <div style={{ 
        background: '#fff', 
        borderRadius: 16, 
        padding: 24, 
        boxShadow: '0 4px 12px rgba(0,0,0,0.08)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <h3 style={{ fontSize: 18, fontWeight: 700, color: '#1e293b', margin: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
            <FileText size={20} color="#1a5276" />
            Paiements du {new Date(selectedDate).toLocaleDateString('fr-FR')}
          </h3>
          <div style={{ display: 'flex', gap: 8 }}>
            <button
              onClick={() => {
                // Exporter en CSV
                toast.success('Export CSV en cours...');
              }}
              style={{
                padding: '8px 12px',
                background: '#f1f5f9',
                color: '#64748b',
                border: 'none',
                borderRadius: 8,
                fontSize: 12,
                fontWeight: 600,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 6
              }}
            >
              <Download size={16} />
              CSV
            </button>
            <button
              onClick={() => {
                // Imprimer
                window.print();
              }}
              style={{
                padding: '8px 12px',
                background: '#f1f5f9',
                color: '#64748b',
                border: 'none',
                borderRadius: 8,
                fontSize: 12,
                fontWeight: 600,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 6
              }}
            >
              <Printer size={16} />
              Imprimer
            </button>
          </div>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid #f1f5f9' }}>
                <th style={{ padding: '12px 8px', textAlign: 'left', fontSize: 12, fontWeight: 600, color: '#64748b', textTransform: 'uppercase' }}>Étudiant</th>
                <th style={{ padding: '12px 8px', textAlign: 'left', fontSize: 12, fontWeight: 600, color: '#64748b', textTransform: 'uppercase' }}>Parcours</th>
                <th style={{ padding: '12px 8px', textAlign: 'center', fontSize: 12, fontWeight: 600, color: '#64748b', textTransform: 'uppercase' }}>Montant</th>
                <th style={{ padding: '12px 8px', textAlign: 'center', fontSize: 12, fontWeight: 600, color: '#64748b', textTransform: 'uppercase' }}>Mode</th>
                <th style={{ padding: '12px 8px', textAlign: 'center', fontSize: 12, fontWeight: 600, color: '#64748b', textTransform: 'uppercase' }}>Type</th>
                <th style={{ padding: '12px 8px', textAlign: 'center', fontSize: 12, fontWeight: 600, color: '#64748b', textTransform: 'uppercase' }}>Reçu</th>
                <th style={{ padding: '12px 8px', textAlign: 'center', fontSize: 12, fontWeight: 600, color: '#64748b', textTransform: 'uppercase' }}>Heure</th>
              </tr>
            </thead>
            <tbody>
              {paiementsDuJour.map((paiement) => (
                <tr key={paiement.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                  <td style={{ padding: '12px 8px' }}>
                    <div>
                      <div style={{ fontSize: 14, fontWeight: 600, color: '#1e293b' }}>
                        {paiement.etudiant_nom}
                      </div>
                      <div style={{ fontSize: 12, color: '#64748b' }}>
                        {paiement.etudiant_matricule}
                      </div>
                    </div>
                  </td>
                  <td style={{ padding: '12px 8px', fontSize: 14, color: '#1e293b' }}>
                    {paiement.parcours_nom}
                  </td>
                  <td style={{ padding: '12px 8px', textAlign: 'center', fontSize: 14, fontWeight: 700, color: '#10b981' }}>
                    {fmt(paiement.montant)}
                  </td>
                  <td style={{ padding: '12px 8px', textAlign: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4 }}>
                      {getIconForMode(paiement.mode_paiement)}
                      <span style={{ fontSize: 12, color: '#64748b' }}>
                        {paiement.mode_paiement.replace('_', ' ')}
                      </span>
                    </div>
                  </td>
                  <td style={{ padding: '12px 8px', textAlign: 'center' }}>
                    <span style={{ 
                      padding: '4px 8px', 
                      borderRadius: 6, 
                      fontSize: 11, 
                      fontWeight: 600,
                      background: paiement.type_paiement === 'inscription' ? '#dbeafe' : '#f3e8ff',
                      color: paiement.type_paiement === 'inscription' ? '#1e40af' : '#6b21a8'
                    }}>
                      {paiement.type_paiement}
                    </span>
                  </td>
                  <td style={{ padding: '12px 8px', textAlign: 'center', fontSize: 13, color: '#64748b' }}>
                    {paiement.numero_recu}
                  </td>
                  <td style={{ padding: '12px 8px', textAlign: 'center', fontSize: 13, color: '#64748b' }}>
                    {new Date(paiement.date_paiement).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Validation */}
      {showValidationModal && (
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
            maxWidth: 500,
            width: '90%'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
              <h3 style={{ fontSize: 20, fontWeight: 700, color: '#1e293b', margin: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
                <CheckCircle size={24} color="#10b981" />
                Valider la Clôture
              </h3>
              <button
                onClick={() => setShowValidationModal(false)}
                style={{ background: 'none', border: 'none', cursor: 'pointer' }}
              >
                <X size={24} color="#64748b" />
              </button>
            </div>

            <div style={{ marginBottom: 20 }}>
              <p style={{ fontSize: 14, color: '#64748b', marginBottom: 16 }}>
                Êtes-vous sûr de vouloir valider la clôture du {new Date(selectedDate).toLocaleDateString('fr-FR')}? 
                Cette action sera définitive.
              </p>

              {cloture && (
                <div style={{ padding: 16, background: '#f8fafc', borderRadius: 12, marginBottom: 16 }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                    <div>
                      <p style={{ fontSize: 12, color: '#64748b', margin: '0 0 4px' }}>Total Encaissé:</p>
                      <p style={{ fontSize: 16, fontWeight: 700, color: '#10b981', margin: 0 }}>
                        {fmt(cloture.total_general)}
                      </p>
                    </div>
                    <div>
                      <p style={{ fontSize: 12, color: '#64748b', margin: '0 0 4px' }}>Nombre Transactions:</p>
                      <p style={{ fontSize: 16, fontWeight: 700, color: '#1e293b', margin: 0 }}>
                        {cloture.nombre_paiements}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              <div>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 8 }}>
                  Observations (Optionnel)
                </label>
                <textarea
                  value={observations}
                  onChange={(e) => setObservations(e.target.value)}
                  rows={3}
                  placeholder="Observations sur la clôture..."
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
            </div>

            <div style={{ display: 'flex', gap: 12 }}>
              <button
                onClick={() => setShowValidationModal(false)}
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
                onClick={validerCloture}
                disabled={loading}
                style={{
                  flex: 2,
                  padding: '12px',
                  background: loading ? '#94a3b8' : '#10b981',
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
                    <CheckCircle size={18} />
                    Valider la Clôture
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Rapprochement */}
      {showRapprochementModal && (
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
            maxWidth: 500,
            width: '90%'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
              <h3 style={{ fontSize: 20, fontWeight: 700, color: '#1e293b', margin: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
                <TrendingUp size={24} color="#1a5276" />
                Rapprochement Bancaire
              </h3>
              <button
                onClick={() => setShowRapprochementModal(false)}
                style={{ background: 'none', border: 'none', cursor: 'pointer' }}
              >
                <X size={24} color="#64748b" />
              </button>
            </div>

            <div style={{ marginBottom: 20 }}>
              <div style={{ padding: 16, background: '#f8fafc', borderRadius: 12, marginBottom: 16 }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <div>
                    <p style={{ fontSize: 12, color: '#64748b', margin: '0 0 4px' }}>Solde Théorique:</p>
                    <p style={{ fontSize: 16, fontWeight: 700, color: '#1e293b', margin: 0 }}>
                      {fmt(rapprochement?.solde_theorique || 0)}
                    </p>
                  </div>
                  <div>
                    <p style={{ fontSize: 12, color: '#64748b', margin: '0 0 4px' }}>Écart Actuel:</p>
                    <p style={{ 
                      fontSize: 16, 
                      fontWeight: 700, 
                      color: (rapprochement?.ecart || 0) === 0 ? '#065f46' : '#991b1b', 
                      margin: 0 
                    }}>
                      {fmt(Math.abs(rapprochement?.ecart || 0))}
                    </p>
                  </div>
                </div>
              </div>

              <div style={{ marginBottom: 16 }}>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 8 }}>
                  Solde Bancaire Réel (Ar)
                </label>
                <input
                  type="number"
                  value={formRapprochement.solde_reel}
                  onChange={(e) => setFormRapprochement(prev => ({ ...prev, solde_reel: e.target.value }))}
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

              <div style={{ marginBottom: 16 }}>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 8 }}>
                  Motif de l'Écart (si applicable)
                </label>
                <textarea
                  value={formRapprochement.motif_ecart}
                  onChange={(e) => setFormRapprochement(prev => ({ ...prev, motif_ecart: e.target.value }))}
                  rows={3}
                  placeholder="Expliquer la raison de l'écart..."
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

              {(parseFloat(formRapprochement.solde_reel) || 0) > 0 && (
                <div style={{ 
                  padding: 12, 
                  background: '#f8fafc', 
                  borderRadius: 8,
                  marginBottom: 16 
                }}>
                  <p style={{ fontSize: 12, color: '#64748b', margin: '0 0 4px' }}>Nouvel Écart:</p>
                  <p style={{ 
                    fontSize: 14, 
                    fontWeight: 700, 
                    color: Math.abs((parseFloat(formRapprochement.solde_reel) || 0) - (rapprochement?.solde_theorique || 0)) === 0 ? '#065f46' : '#991b1b', 
                    margin: 0 
                  }}>
                    {fmt(Math.abs((parseFloat(formRapprochement.solde_reel) || 0) - (rapprochement?.solde_theorique || 0)))}
                  </p>
                </div>
              )}
            </div>

            <div style={{ display: 'flex', gap: 12 }}>
              <button
                onClick={() => setShowRapprochementModal(false)}
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
                onClick={sauvegarderRapprochement}
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
                    Sauvegarder
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
