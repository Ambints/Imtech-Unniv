import React, { useState, useEffect } from 'react';
import { useAuthStore } from '../../store/authStore';
import { api } from '../../api/client';
import { Scale, Users, CheckCircle, Clock, XCircle, Search, Filter } from 'lucide-react';

interface Deliberation {
  id: string;
  sessionExamenId: string;
  sessionNom: string;
  parcoursId: string;
  parcoursNom: string;
  dateDeliberation: Date;
  statut: string;
  nombreEtudiants: number;
  nombreAdmis: number;
  nombreAjourne: number;
  nombreAbsents: number;
} 

const DeliberationsPage: React.FC = () => {
  const { tenant } = useAuthStore();
  const [deliberations, setDeliberations] = useState<Deliberation[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatut, setFilterStatut] = useState('all');

  useEffect(() => {
    if (tenant?.id) {
      loadDeliberations();
    }
  }, [tenant]);

  const loadDeliberations = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/scolarite/${tenant?.id}/deliberations`);
      setDeliberations(response.data || []);
    } catch (error) {
      console.error('Erreur chargement délibérations:', error);
      setDeliberations([]);
    } finally {
      setLoading(false);
    }
  };

  const getStatutColor = (statut: string) => {
    switch (statut) {
      case 'en_attente': return '#f59e0b';
      case 'en_cours': return '#3b82f6';
      case 'terminee': return '#10b981';
      case 'validee': return '#059669';
      default: return '#6b7280';
    }
  };

  const filteredDeliberations = deliberations.filter(d => {
    const matchesSearch = d.sessionNom.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         d.parcoursNom.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatut = filterStatut === 'all' || d.statut === filterStatut;
    return matchesSearch && matchesStatut;
  });

  const totalEtudiants = deliberations.reduce((sum, d) => sum + d.nombreEtudiants, 0);
  const totalAdmis = deliberations.reduce((sum, d) => sum + d.nombreAdmis, 0);
  const totalAjournes = deliberations.reduce((sum, d) => sum + d.nombreAjourne, 0);

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
          <Scale size={32} color="#3b82f6" />
          Délibérations
        </h1>
        <p style={{ color: '#64748b' }}>Gestion des délibérations et validation des résultats</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 16, marginBottom: 24 }}>
        <div style={{ background: 'white', padding: 20, borderRadius: 12, border: '1px solid #e2e8f0' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
            <div>
              <p style={{ fontSize: 13, color: '#64748b', marginBottom: 4 }}>Total Étudiants</p>
              <p style={{ fontSize: 28, fontWeight: 700, color: '#1e293b' }}>{totalEtudiants}</p>
            </div>
            <Users size={24} color="#3b82f6" />
          </div>
        </div>

        <div style={{ background: 'white', padding: 20, borderRadius: 12, border: '1px solid #e2e8f0' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
            <div>
              <p style={{ fontSize: 13, color: '#64748b', marginBottom: 4 }}>Admis</p>
              <p style={{ fontSize: 28, fontWeight: 700, color: '#10b981' }}>{totalAdmis}</p>
              <p style={{ fontSize: 12, color: '#64748b', marginTop: 4 }}>
                {totalEtudiants > 0 ? `${((totalAdmis / totalEtudiants) * 100).toFixed(1)}%` : '0%'}
              </p>
            </div>
            <CheckCircle size={24} color="#10b981" />
          </div>
        </div>

        <div style={{ background: 'white', padding: 20, borderRadius: 12, border: '1px solid #e2e8f0' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
            <div>
              <p style={{ fontSize: 13, color: '#64748b', marginBottom: 4 }}>Ajournés</p>
              <p style={{ fontSize: 28, fontWeight: 700, color: '#f59e0b' }}>{totalAjournes}</p>
              <p style={{ fontSize: 12, color: '#64748b', marginTop: 4 }}>
                {totalEtudiants > 0 ? `${((totalAjournes / totalEtudiants) * 100).toFixed(1)}%` : '0%'}
              </p>
            </div>
            <XCircle size={24} color="#f59e0b" />
          </div>
        </div>

        <div style={{ background: 'white', padding: 20, borderRadius: 12, border: '1px solid #e2e8f0' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
            <div>
              <p style={{ fontSize: 13, color: '#64748b', marginBottom: 4 }}>Délibérations</p>
              <p style={{ fontSize: 28, fontWeight: 700, color: '#3b82f6' }}>{deliberations.length}</p>
            </div>
            <Scale size={24} color="#3b82f6" />
          </div>
        </div>
      </div>

      <div style={{ background: 'white', borderRadius: 12, border: '1px solid #e2e8f0', overflow: 'hidden' }}>
        <div style={{ padding: 20, borderBottom: '1px solid #e2e8f0' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <h2 style={{ fontSize: 18, fontWeight: 600, color: '#1e293b' }}>Liste des Délibérations</h2>
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
              onClick={() => alert('Nouvelle délibération à implémenter')}
            >
              <Scale size={16} />
              Nouvelle Délibération
            </button>
          </div>

          <div style={{ display: 'flex', gap: 12 }}>
            <div style={{ flex: 1, position: 'relative' }}>
              <Search size={18} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
              <input
                type="text"
                placeholder="Rechercher par session ou parcours..."
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
              value={filterStatut}
              onChange={(e) => setFilterStatut(e.target.value)}
              style={{
                padding: '10px 16px',
                border: '1px solid #e2e8f0',
                borderRadius: 8,
                fontSize: 14,
                cursor: 'pointer'
              }}
            >
              <option value="all">Tous les statuts</option>
              <option value="en_attente">En attente</option>
              <option value="en_cours">En cours</option>
              <option value="terminee">Terminée</option>
              <option value="validee">Validée</option>
            </select>
          </div>
        </div>

        {filteredDeliberations.length === 0 ? (
          <div style={{ padding: 48, textAlign: 'center', color: '#94a3b8' }}>
            <Scale size={48} style={{ margin: '0 auto 16px', opacity: 0.5 }} />
            <p>Aucune délibération trouvée</p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead style={{ background: '#f8fafc' }}>
                <tr>
                  <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: 13, fontWeight: 600, color: '#475569' }}>Session</th>
                  <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: 13, fontWeight: 600, color: '#475569' }}>Parcours</th>
                  <th style={{ padding: '12px 16px', textAlign: 'center', fontSize: 13, fontWeight: 600, color: '#475569' }}>Étudiants</th>
                  <th style={{ padding: '12px 16px', textAlign: 'center', fontSize: 13, fontWeight: 600, color: '#475569' }}>Admis</th>
                  <th style={{ padding: '12px 16px', textAlign: 'center', fontSize: 13, fontWeight: 600, color: '#475569' }}>Ajournés</th>
                  <th style={{ padding: '12px 16px', textAlign: 'center', fontSize: 13, fontWeight: 600, color: '#475569' }}>Absents</th>
                  <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: 13, fontWeight: 600, color: '#475569' }}>Date</th>
                  <th style={{ padding: '12px 16px', textAlign: 'center', fontSize: 13, fontWeight: 600, color: '#475569' }}>Statut</th>
                  <th style={{ padding: '12px 16px', textAlign: 'center', fontSize: 13, fontWeight: 600, color: '#475569' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredDeliberations.map((delib) => (
                  <tr key={delib.id} style={{ borderTop: '1px solid #e2e8f0' }}>
                    <td style={{ padding: '12px 16px', fontSize: 14, color: '#334155', fontWeight: 500 }}>
                      {delib.sessionNom}
                    </td>
                    <td style={{ padding: '12px 16px', fontSize: 14, color: '#334155' }}>
                      {delib.parcoursNom}
                    </td>
                    <td style={{ padding: '12px 16px', fontSize: 14, textAlign: 'center', fontWeight: 600 }}>
                      {delib.nombreEtudiants}
                    </td>
                    <td style={{ padding: '12px 16px', fontSize: 14, textAlign: 'center' }}>
                      <span style={{ color: '#10b981', fontWeight: 600 }}>{delib.nombreAdmis}</span>
                    </td>
                    <td style={{ padding: '12px 16px', fontSize: 14, textAlign: 'center' }}>
                      <span style={{ color: '#f59e0b', fontWeight: 600 }}>{delib.nombreAjourne}</span>
                    </td>
                    <td style={{ padding: '12px 16px', fontSize: 14, textAlign: 'center' }}>
                      <span style={{ color: '#6b7280', fontWeight: 600 }}>{delib.nombreAbsents}</span>
                    </td>
                    <td style={{ padding: '12px 16px', fontSize: 14, color: '#334155' }}>
                      {new Date(delib.dateDeliberation).toLocaleDateString('fr-FR')}
                    </td>
                    <td style={{ padding: '12px 16px', textAlign: 'center' }}>
                      <span style={{
                        display: 'inline-block',
                        padding: '4px 12px',
                        borderRadius: 12,
                        fontSize: 12,
                        fontWeight: 500,
                        background: `${getStatutColor(delib.statut)}20`,
                        color: getStatutColor(delib.statut)
                      }}>
                        {delib.statut.replace('_', ' ')}
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

export default DeliberationsPage;

// Made with Bob