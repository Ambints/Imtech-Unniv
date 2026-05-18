import React, { useState, useEffect, useCallback } from 'react';
import { useAuthStore } from '../../store/authStore';
import { financeApi } from '../../api/client';
import toast from 'react-hot-toast';
import { 
  AlertCircle, Search, DollarSign, Calendar, User, 
  Phone, Mail, Bell, TrendingUp, Clock, FileText
} from 'lucide-react';

interface Impaye {
  id: string;
  inscription_id: string;
  num_tranche: number;
  montant_du: number;
  date_echeance: string;
  statut: string;
  jours_retard: number;
  // Infos étudiant
  etudiant_nom?: string;
  etudiant_prenom?: string;
  etudiant_matricule?: string;
  etudiant_email?: string;
  etudiant_telephone?: string;
  parcours_nom?: string;
  annee_niveau?: number;
}

export const ImpayesPage: React.FC = () => {
  const { tenant } = useAuthStore();
  const tenantId = tenant?.id || '';
  
  const [impayes, setImpayes] = useState<Impaye[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRetard, setFilterRetard] = useState<string>('all');

  const loadImpayes = useCallback(async () => {
    if (!tenantId) return;
    
    setLoading(true);
    try {
      // Récupérer tous les échéanciers
      const response = await financeApi.getEcheanciers(tenantId);
      const echeanciers = response.data || [];
      
      // Filtrer uniquement les impayés (en_retard)
      const impayesData = echeanciers
        .filter((e: any) => (e.statut_calcule || e.statut) === 'en_retard')
        .map((e: any) => {
          const dateEcheance = new Date(e.date_echeance);
          const aujourd_hui = new Date();
          const joursRetard = Math.floor((aujourd_hui.getTime() - dateEcheance.getTime()) / (1000 * 60 * 60 * 24));
          
          return {
            ...e,
            jours_retard: joursRetard
          };
        })
        .sort((a: any, b: any) => b.jours_retard - a.jours_retard); // Trier par jours de retard décroissant
      
      setImpayes(impayesData);
    } catch (error: any) {
      console.error('Erreur chargement:', error);
      toast.error(error.response?.data?.message || 'Erreur de chargement');
    } finally {
      setLoading(false);
    }
  }, [tenantId]);

  useEffect(() => {
    loadImpayes();
  }, [loadImpayes]);

  const handleRelance = (impaye: Impaye) => {
    toast.success(`Relance envoyée à ${impaye.etudiant_nom} ${impaye.etudiant_prenom}`);
    // TODO: Implémenter l'envoi de relance (email/SMS)
  };

  const fmt = (n: number) => Number(n || 0).toLocaleString('fr-FR') + ' Ar';

  const filteredImpayes = impayes.filter(imp => {
    const matchesSearch = 
      imp.etudiant_nom?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      imp.etudiant_prenom?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      imp.etudiant_matricule?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      imp.parcours_nom?.toLowerCase().includes(searchTerm.toLowerCase());
    
    let matchesRetard = true;
    if (filterRetard === '7') matchesRetard = imp.jours_retard <= 7;
    else if (filterRetard === '30') matchesRetard = imp.jours_retard <= 30;
    else if (filterRetard === '90') matchesRetard = imp.jours_retard <= 90;
    else if (filterRetard === '90+') matchesRetard = imp.jours_retard > 90;
    
    return matchesSearch && matchesRetard;
  });

  const stats = {
    total: impayes.length,
    montant_total: impayes.reduce((sum, imp) => sum + Number(imp.montant_du), 0),
    moins_7j: impayes.filter(imp => imp.jours_retard <= 7).length,
    moins_30j: impayes.filter(imp => imp.jours_retard > 7 && imp.jours_retard <= 30).length,
    moins_90j: impayes.filter(imp => imp.jours_retard > 30 && imp.jours_retard <= 90).length,
    plus_90j: impayes.filter(imp => imp.jours_retard > 90).length,
  };

  const getRetardColor = (jours: number) => {
    if (jours <= 7) return '#f59e0b';
    if (jours <= 30) return '#ef4444';
    if (jours <= 90) return '#dc2626';
    return '#991b1b';
  };

  const getRetardLabel = (jours: number) => {
    if (jours === 0) return "Aujourd'hui";
    if (jours === 1) return '1 jour';
    return `${jours} jours`;
  };

  return (
    <div style={{ padding: 32, background: '#F8FAFC', minHeight: '100vh' }}>
      {/* Header */}
      <div style={{ marginBottom: 32 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <div>
            <h1 style={{ fontSize: 28, fontWeight: 900, color: '#1e293b', margin: 0, display: 'flex', alignItems: 'center', gap: 12 }}>
              <AlertCircle size={32} color="#ef4444" />
              Impayés
            </h1>
            <p style={{ color: '#64748b', fontSize: 16, margin: '4px 0 0' }}>
              Suivi des paiements en retard et relances
            </p>
          </div>
          <button
            onClick={loadImpayes}
            style={{
              padding: '10px 20px',
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
            <Clock size={18} />
            Actualiser
          </button>
        </div>

        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 16, marginBottom: 24 }}>
          <div style={{ background: '#fff', padding: 16, borderRadius: 12, border: '2px solid #ef4444' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
              <AlertCircle size={20} color="#ef4444" />
              <span style={{ fontSize: 12, fontWeight: 600, color: '#64748b' }}>Total Impayés</span>
            </div>
            <div style={{ fontSize: 24, fontWeight: 800, color: '#ef4444' }}>{stats.total}</div>
          </div>
          <div style={{ background: '#fff', padding: 16, borderRadius: 12, border: '1px solid #e2e8f0' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
              <DollarSign size={20} color="#dc2626" />
              <span style={{ fontSize: 12, fontWeight: 600, color: '#64748b' }}>Montant Total</span>
            </div>
            <div style={{ fontSize: 18, fontWeight: 800, color: '#dc2626' }}>{fmt(stats.montant_total)}</div>
          </div>
          <div style={{ background: '#fff', padding: 16, borderRadius: 12, border: '1px solid #e2e8f0' }}>
            <div style={{ fontSize: 12, fontWeight: 600, color: '#64748b', marginBottom: 8 }}>Par Période</div>
            <div style={{ fontSize: 11, color: '#1e293b', display: 'flex', flexDirection: 'column', gap: 2 }}>
              <div style={{ color: '#f59e0b' }}>≤ 7j: {stats.moins_7j}</div>
              <div style={{ color: '#ef4444' }}>≤ 30j: {stats.moins_30j}</div>
              <div style={{ color: '#dc2626' }}>≤ 90j: {stats.moins_90j}</div>
              <div style={{ color: '#991b1b' }}>{'>'} 90j: {stats.plus_90j}</div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
          <div style={{ position: 'relative', flex: 1 }}>
            <Search size={20} color="#64748b" style={{ position: 'absolute', left: 16, top: 14 }} />
            <input
              type="text"
              placeholder="Rechercher par étudiant, matricule ou parcours..."
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
          <select
            value={filterRetard}
            onChange={(e) => setFilterRetard(e.target.value)}
            style={{
              padding: '12px 16px',
              border: '2px solid #e2e8f0',
              borderRadius: 10,
              fontSize: 14,
              background: '#fff',
              cursor: 'pointer',
              minWidth: 200
            }}
          >
            <option value="all">Toutes les périodes</option>
            <option value="7">Moins de 7 jours</option>
            <option value="30">Moins de 30 jours</option>
            <option value="90">Moins de 90 jours</option>
            <option value="90+">Plus de 90 jours</option>
          </select>
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
        ) : filteredImpayes.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 40, color: '#64748b' }}>
            <AlertCircle size={48} style={{ margin: '0 auto 16px', opacity: 0.3, color: '#10b981' }} />
            <p style={{ fontSize: 16, fontWeight: 600, color: '#10b981' }}>Aucun impayé trouvé</p>
            <p style={{ fontSize: 14 }}>Tous les paiements sont à jour !</p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid #f1f5f9' }}>
                  <th style={{ padding: '12px 8px', textAlign: 'left', fontSize: 12, fontWeight: 600, color: '#64748b', textTransform: 'uppercase' }}>Étudiant</th>
                  <th style={{ padding: '12px 8px', textAlign: 'left', fontSize: 12, fontWeight: 600, color: '#64748b', textTransform: 'uppercase' }}>Parcours</th>
                  <th style={{ padding: '12px 8px', textAlign: 'center', fontSize: 12, fontWeight: 600, color: '#64748b', textTransform: 'uppercase' }}>Tranche</th>
                  <th style={{ padding: '12px 8px', textAlign: 'center', fontSize: 12, fontWeight: 600, color: '#64748b', textTransform: 'uppercase' }}>Montant</th>
                  <th style={{ padding: '12px 8px', textAlign: 'center', fontSize: 12, fontWeight: 600, color: '#64748b', textTransform: 'uppercase' }}>Échéance</th>
                  <th style={{ padding: '12px 8px', textAlign: 'center', fontSize: 12, fontWeight: 600, color: '#64748b', textTransform: 'uppercase' }}>Retard</th>
                  <th style={{ padding: '12px 8px', textAlign: 'center', fontSize: 12, fontWeight: 600, color: '#64748b', textTransform: 'uppercase' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredImpayes.map((impaye) => (
                  <tr key={impaye.id} style={{ borderBottom: '1px solid #f1f5f9', background: impaye.jours_retard > 90 ? '#fef2f2' : 'transparent' }}>
                    <td style={{ padding: '12px 8px' }}>
                      <div>
                        <div style={{ fontSize: 14, fontWeight: 600, color: '#1e293b' }}>
                          {impaye.etudiant_nom} {impaye.etudiant_prenom}
                        </div>
                        <div style={{ fontSize: 12, color: '#64748b' }}>
                          {impaye.etudiant_matricule}
                        </div>
                        {impaye.etudiant_email && (
                          <div style={{ fontSize: 11, color: '#64748b', display: 'flex', alignItems: 'center', gap: 4, marginTop: 2 }}>
                            <Mail size={10} />
                            {impaye.etudiant_email}
                          </div>
                        )}
                      </div>
                    </td>
                    <td style={{ padding: '12px 8px', fontSize: 14, color: '#1e293b' }}>
                      {impaye.parcours_nom}
                      {impaye.annee_niveau && (
                        <div style={{ fontSize: 12, color: '#64748b' }}>
                          Niveau {impaye.annee_niveau}
                        </div>
                      )}
                    </td>
                    <td style={{ padding: '12px 8px', textAlign: 'center', fontSize: 14, fontWeight: 600, color: '#1e293b' }}>
                      {impaye.num_tranche}
                    </td>
                    <td style={{ padding: '12px 8px', textAlign: 'center', fontSize: 15, fontWeight: 700, color: '#ef4444' }}>
                      {fmt(impaye.montant_du)}
                    </td>
                    <td style={{ padding: '12px 8px', textAlign: 'center', fontSize: 14, color: '#1e293b' }}>
                      {new Date(impaye.date_echeance).toLocaleDateString('fr-FR')}
                    </td>
                    <td style={{ padding: '12px 8px', textAlign: 'center' }}>
                      <span style={{ 
                        padding: '6px 12px', 
                        borderRadius: 20, 
                        fontSize: 12, 
                        fontWeight: 700,
                        background: `${getRetardColor(impaye.jours_retard)}20`,
                        color: getRetardColor(impaye.jours_retard),
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 4
                      }}>
                        <AlertCircle size={14} />
                        {getRetardLabel(impaye.jours_retard)}
                      </span>
                    </td>
                    <td style={{ padding: '12px 8px', textAlign: 'center' }}>
                      <button
                        onClick={() => handleRelance(impaye)}
                        style={{
                          padding: '6px 12px',
                          background: '#fee2e2',
                          border: 'none',
                          borderRadius: 6,
                          cursor: 'pointer',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: 4,
                          fontSize: 12,
                          fontWeight: 600,
                          color: '#dc2626'
                        }}
                        title="Envoyer une relance"
                      >
                        <Bell size={14} />
                        Relancer
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Légende */}
      <div style={{ marginTop: 24, padding: 20, background: '#fff', borderRadius: 12, border: '1px solid #e2e8f0' }}>
        <h3 style={{ fontSize: 14, fontWeight: 700, color: '#1e293b', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
          <FileText size={18} />
          Légende des retards
        </h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ width: 12, height: 12, borderRadius: '50%', background: '#f59e0b' }}></div>
            <span style={{ fontSize: 13, color: '#64748b' }}>≤ 7 jours : Retard léger</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ width: 12, height: 12, borderRadius: '50%', background: '#ef4444' }}></div>
            <span style={{ fontSize: 13, color: '#64748b' }}>≤ 30 jours : Retard modéré</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ width: 12, height: 12, borderRadius: '50%', background: '#dc2626' }}></div>
            <span style={{ fontSize: 13, color: '#64748b' }}>≤ 90 jours : Retard important</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ width: 12, height: 12, borderRadius: '50%', background: '#991b1b' }}></div>
            <span style={{ fontSize: 13, color: '#64748b' }}>{'>'} 90 jours : Retard critique</span>
          </div>
        </div>
      </div>
    </div>
  );
};

// Made with Bob
