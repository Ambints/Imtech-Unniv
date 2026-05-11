import React, { useState, useEffect } from 'react';
import { useAuthStore } from '../../store/authStore';
import { api } from '../../api/client';
import { GraduationCap, Award, CheckCircle, Clock, Download, Search, Filter } from 'lucide-react';

interface Diplome {
  id: string;
  numeroDiplome: string;
  etudiantId: string;
  etudiantNom: string;
  etudiantPrenom: string;
  matricule: string;
  parcoursId: string;
  parcoursNom: string;
  typeDiplome: string;
  dateObtention: Date;
  moyenneFinale: number;
  mentionGenerale: string;
  statut: string;
}

const DiplomesPage: React.FC = () => {
  const { tenant } = useAuthStore();
  const [diplomes, setDiplomes] = useState<Diplome[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatut, setFilterStatut] = useState('all');

  useEffect(() => {
    if (tenant?.id) {
      loadDiplomes();
    }
  }, [tenant]);

  const loadDiplomes = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/scolarite/${tenant?.id}/diplomes`);
      setDiplomes(response.data || []);
    } catch (error) {
      console.error('Erreur chargement diplômes:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatutColor = (statut: string) => {
    switch (statut) {
      case 'en_preparation': return '#f59e0b';
      case 'delivre': return '#10b981';
      case 'retire': return '#3b82f6';
      default: return '#6b7280';
    }
  };

  const getMentionColor = (mention: string) => {
    switch (mention) {
      case 'Très Bien': return '#10b981';
      case 'Bien': return '#3b82f6';
      case 'Assez Bien': return '#f59e0b';
      default: return '#6b7280';
    }
  };

  const filteredDiplomes = diplomes.filter(d => {
    const matchesSearch = d.etudiantNom.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         d.etudiantPrenom.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         d.matricule.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         d.numeroDiplome?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatut = filterStatut === 'all' || d.statut === filterStatut;
    return matchesSearch && matchesStatut;
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
          <GraduationCap size={32} color="#3b82f6" />
          Gestion des Diplômes
        </h1>
        <p style={{ color: '#64748b' }}>Vérification des conditions d'obtention et génération des diplômes</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 16, marginBottom: 24 }}>
        <div style={{ background: 'white', padding: 20, borderRadius: 12, border: '1px solid #e2e8f0' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
            <div>
              <p style={{ fontSize: 13, color: '#64748b', marginBottom: 4 }}>Total Diplômes</p>
              <p style={{ fontSize: 28, fontWeight: 700, color: '#1e293b' }}>{diplomes.length}</p>
            </div>
            <Award size={24} color="#3b82f6" />
          </div>
        </div>

        <div style={{ background: 'white', padding: 20, borderRadius: 12, border: '1px solid #e2e8f0' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
            <div>
              <p style={{ fontSize: 13, color: '#64748b', marginBottom: 4 }}>Délivrés</p>
              <p style={{ fontSize: 28, fontWeight: 700, color: '#10b981' }}>
                {diplomes.filter(d => d.statut === 'delivre').length}
              </p>
            </div>
            <CheckCircle size={24} color="#10b981" />
          </div>
        </div>

        <div style={{ background: 'white', padding: 20, borderRadius: 12, border: '1px solid #e2e8f0' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
            <div>
              <p style={{ fontSize: 13, color: '#64748b', marginBottom: 4 }}>En préparation</p>
              <p style={{ fontSize: 28, fontWeight: 700, color: '#f59e0b' }}>
                {diplomes.filter(d => d.statut === 'en_preparation').length}
              </p>
            </div>
            <Clock size={24} color="#f59e0b" />
          </div>
        </div>

        <div style={{ background: 'white', padding: 20, borderRadius: 12, border: '1px solid #e2e8f0' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
            <div>
              <p style={{ fontSize: 13, color: '#64748b', marginBottom: 4 }}>Retirés</p>
              <p style={{ fontSize: 28, fontWeight: 700, color: '#3b82f6' }}>
                {diplomes.filter(d => d.statut === 'retire').length}
              </p>
            </div>
            <Download size={24} color="#3b82f6" />
          </div>
        </div>
      </div>

      <div style={{ background: 'white', borderRadius: 12, border: '1px solid #e2e8f0', overflow: 'hidden' }}>
        <div style={{ padding: 20, borderBottom: '1px solid #e2e8f0' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <h2 style={{ fontSize: 18, fontWeight: 600, color: '#1e293b' }}>Liste des Diplômes</h2>
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
              onClick={() => alert('Génération de diplômes à implémenter')}
            >
              <GraduationCap size={16} />
              Générer Diplômes
            </button>
          </div>

          <div style={{ display: 'flex', gap: 12 }}>
            <div style={{ flex: 1, position: 'relative' }}>
              <Search size={18} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
              <input
                type="text"
                placeholder="Rechercher par nom, matricule ou numéro..."
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
              <option value="en_preparation">En préparation</option>
              <option value="delivre">Délivrés</option>
              <option value="retire">Retirés</option>
            </select>
          </div>
        </div>

        {filteredDiplomes.length === 0 ? (
          <div style={{ padding: 48, textAlign: 'center', color: '#94a3b8' }}>
            <GraduationCap size={48} style={{ margin: '0 auto 16px', opacity: 0.5 }} />
            <p>Aucun diplôme trouvé</p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead style={{ background: '#f8fafc' }}>
                <tr>
                  <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: 13, fontWeight: 600, color: '#475569' }}>N° Diplôme</th>
                  <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: 13, fontWeight: 600, color: '#475569' }}>Étudiant</th>
                  <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: 13, fontWeight: 600, color: '#475569' }}>Parcours</th>
                  <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: 13, fontWeight: 600, color: '#475569' }}>Type</th>
                  <th style={{ padding: '12px 16px', textAlign: 'center', fontSize: 13, fontWeight: 600, color: '#475569' }}>Moyenne</th>
                  <th style={{ padding: '12px 16px', textAlign: 'center', fontSize: 13, fontWeight: 600, color: '#475569' }}>Mention</th>
                  <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: 13, fontWeight: 600, color: '#475569' }}>Date</th>
                  <th style={{ padding: '12px 16px', textAlign: 'center', fontSize: 13, fontWeight: 600, color: '#475569' }}>Statut</th>
                  <th style={{ padding: '12px 16px', textAlign: 'center', fontSize: 13, fontWeight: 600, color: '#475569' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredDiplomes.map((diplome) => (
                  <tr key={diplome.id} style={{ borderTop: '1px solid #e2e8f0' }}>
                    <td style={{ padding: '12px 16px', fontSize: 14, color: '#334155', fontWeight: 600 }}>
                      {diplome.numeroDiplome || '-'}
                    </td>
                    <td style={{ padding: '12px 16px', fontSize: 14, color: '#334155' }}>
                      <div>
                        <div style={{ fontWeight: 500 }}>{diplome.etudiantNom} {diplome.etudiantPrenom}</div>
                        <div style={{ fontSize: 12, color: '#64748b' }}>{diplome.matricule}</div>
                      </div>
                    </td>
                    <td style={{ padding: '12px 16px', fontSize: 14, color: '#334155' }}>{diplome.parcoursNom}</td>
                    <td style={{ padding: '12px 16px', fontSize: 14, color: '#334155' }}>
                      <span style={{
                        padding: '4px 8px',
                        background: '#f1f5f9',
                        borderRadius: 6,
                        fontSize: 12
                      }}>
                        {diplome.typeDiplome}
                      </span>
                    </td>
                    <td style={{ padding: '12px 16px', fontSize: 14, textAlign: 'center', fontWeight: 600 }}>
                      {diplome.moyenneFinale?.toFixed(2)}/20
                    </td>
                    <td style={{ padding: '12px 16px', textAlign: 'center' }}>
                      <span style={{
                        display: 'inline-block',
                        padding: '4px 12px',
                        borderRadius: 12,
                        fontSize: 12,
                        fontWeight: 500,
                        background: `${getMentionColor(diplome.mentionGenerale)}20`,
                        color: getMentionColor(diplome.mentionGenerale)
                      }}>
                        {diplome.mentionGenerale}
                      </span>
                    </td>
                    <td style={{ padding: '12px 16px', fontSize: 14, color: '#334155' }}>
                      {new Date(diplome.dateObtention).toLocaleDateString('fr-FR')}
                    </td>
                    <td style={{ padding: '12px 16px', textAlign: 'center' }}>
                      <span style={{
                        display: 'inline-block',
                        padding: '4px 12px',
                        borderRadius: 12,
                        fontSize: 12,
                        fontWeight: 500,
                        background: `${getStatutColor(diplome.statut)}20`,
                        color: getStatutColor(diplome.statut)
                      }}>
                        {diplome.statut.replace('_', ' ')}
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
                          cursor: 'pointer',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: 6
                        }}
                      >
                        <Download size={14} />
                        PDF
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

export default DiplomesPage;

// Made with Bob
