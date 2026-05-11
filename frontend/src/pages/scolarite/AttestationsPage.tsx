import React, { useState, useEffect } from 'react';
import { useAuthStore } from '../../store/authStore';
import { api } from '../../api/client';
import { FileText, CheckCircle, Clock, Download, Search, Plus } from 'lucide-react';

interface Attestation {
  id: string;
  etudiantId: string;
  etudiantNom: string;
  etudiantPrenom: string;
  matricule: string;
  typeAttestation: string;
  anneeAcademique: string;
  dateEmission: Date;
  statut: string;
  numeroAttestation: string;
}

const AttestationsPage: React.FC = () => {
  const { tenant } = useAuthStore();
  const [attestations, setAttestations] = useState<Attestation[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');

  useEffect(() => {
    if (tenant?.id) {
      loadAttestations();
    }
  }, [tenant]);

  const loadAttestations = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/scolarite/${tenant?.id}/attestations`);
      setAttestations(response.data || []);
    } catch (error) {
      console.error('Erreur chargement attestations:', error);
      setAttestations([]);
    } finally {
      setLoading(false);
    }
  };

  const getTypeLabel = (type: string) => {
    const types: Record<string, string> = {
      inscription: "Attestation d'Inscription",
      scolarite: 'Certificat de Scolarité',
      reussite: 'Attestation de Réussite',
      presence: 'Attestation de Présence',
      stage: 'Convention de Stage'
    };
    return types[type] || type;
  };

  const getStatutColor = (statut: string) => {
    switch (statut) {
      case 'en_attente': return '#f59e0b';
      case 'delivree': return '#10b981';
      case 'annulee': return '#ef4444';
      default: return '#6b7280';
    }
  };

  const filteredAttestations = attestations.filter(a => {
    const matchesSearch = a.etudiantNom.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         a.etudiantPrenom.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         a.matricule.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         a.numeroAttestation.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'all' || a.typeAttestation === filterType;
    return matchesSearch && matchesType;
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
          <FileText size={32} color="#3b82f6" />
          Attestations
        </h1>
        <p style={{ color: '#64748b' }}>Gestion des attestations et certificats de scolarité</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 16, marginBottom: 24 }}>
        <div style={{ background: 'white', padding: 20, borderRadius: 12, border: '1px solid #e2e8f0' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
            <div>
              <p style={{ fontSize: 13, color: '#64748b', marginBottom: 4 }}>Total Attestations</p>
              <p style={{ fontSize: 28, fontWeight: 700, color: '#1e293b' }}>{attestations.length}</p>
            </div>
            <FileText size={24} color="#3b82f6" />
          </div>
        </div>

        <div style={{ background: 'white', padding: 20, borderRadius: 12, border: '1px solid #e2e8f0' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
            <div>
              <p style={{ fontSize: 13, color: '#64748b', marginBottom: 4 }}>Délivrées</p>
              <p style={{ fontSize: 28, fontWeight: 700, color: '#10b981' }}>
                {attestations.filter(a => a.statut === 'delivree').length}
              </p>
            </div>
            <CheckCircle size={24} color="#10b981" />
          </div>
        </div>

        <div style={{ background: 'white', padding: 20, borderRadius: 12, border: '1px solid #e2e8f0' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
            <div>
              <p style={{ fontSize: 13, color: '#64748b', marginBottom: 4 }}>En attente</p>
              <p style={{ fontSize: 28, fontWeight: 700, color: '#f59e0b' }}>
                {attestations.filter(a => a.statut === 'en_attente').length}
              </p>
            </div>
            <Clock size={24} color="#f59e0b" />
          </div>
        </div>
      </div>

      <div style={{ background: 'white', borderRadius: 12, border: '1px solid #e2e8f0', overflow: 'hidden' }}>
        <div style={{ padding: 20, borderBottom: '1px solid #e2e8f0' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <h2 style={{ fontSize: 18, fontWeight: 600, color: '#1e293b' }}>Liste des Attestations</h2>
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
              onClick={() => alert('Nouvelle attestation à implémenter')}
            >
              <Plus size={16} />
              Nouvelle Attestation
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
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              style={{
                padding: '10px 16px',
                border: '1px solid #e2e8f0',
                borderRadius: 8,
                fontSize: 14,
                cursor: 'pointer'
              }}
            >
              <option value="all">Tous les types</option>
              <option value="inscription">Inscription</option>
              <option value="scolarite">Scolarité</option>
              <option value="reussite">Réussite</option>
              <option value="presence">Présence</option>
              <option value="stage">Stage</option>
            </select>
          </div>
        </div>

        {filteredAttestations.length === 0 ? (
          <div style={{ padding: 48, textAlign: 'center', color: '#94a3b8' }}>
            <FileText size={48} style={{ margin: '0 auto 16px', opacity: 0.5 }} />
            <p>Aucune attestation trouvée</p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead style={{ background: '#f8fafc' }}>
                <tr>
                  <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: 13, fontWeight: 600, color: '#475569' }}>N° Attestation</th>
                  <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: 13, fontWeight: 600, color: '#475569' }}>Étudiant</th>
                  <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: 13, fontWeight: 600, color: '#475569' }}>Type</th>
                  <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: 13, fontWeight: 600, color: '#475569' }}>Année</th>
                  <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: 13, fontWeight: 600, color: '#475569' }}>Date Émission</th>
                  <th style={{ padding: '12px 16px', textAlign: 'center', fontSize: 13, fontWeight: 600, color: '#475569' }}>Statut</th>
                  <th style={{ padding: '12px 16px', textAlign: 'center', fontSize: 13, fontWeight: 600, color: '#475569' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredAttestations.map((attestation) => (
                  <tr key={attestation.id} style={{ borderTop: '1px solid #e2e8f0' }}>
                    <td style={{ padding: '12px 16px', fontSize: 14, color: '#334155', fontWeight: 600 }}>
                      {attestation.numeroAttestation}
                    </td>
                    <td style={{ padding: '12px 16px', fontSize: 14, color: '#334155' }}>
                      <div>
                        <div style={{ fontWeight: 500 }}>{attestation.etudiantNom} {attestation.etudiantPrenom}</div>
                        <div style={{ fontSize: 12, color: '#64748b' }}>{attestation.matricule}</div>
                      </div>
                    </td>
                    <td style={{ padding: '12px 16px', fontSize: 14, color: '#334155' }}>
                      {getTypeLabel(attestation.typeAttestation)}
                    </td>
                    <td style={{ padding: '12px 16px', fontSize: 14, color: '#334155' }}>
                      {attestation.anneeAcademique}
                    </td>
                    <td style={{ padding: '12px 16px', fontSize: 14, color: '#334155' }}>
                      {new Date(attestation.dateEmission).toLocaleDateString('fr-FR')}
                    </td>
                    <td style={{ padding: '12px 16px', textAlign: 'center' }}>
                      <span style={{
                        display: 'inline-block',
                        padding: '4px 12px',
                        borderRadius: 12,
                        fontSize: 12,
                        fontWeight: 500,
                        background: `${getStatutColor(attestation.statut)}20`,
                        color: getStatutColor(attestation.statut)
                      }}>
                        {attestation.statut.replace('_', ' ')}
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

export default AttestationsPage;

// Made with Bob
