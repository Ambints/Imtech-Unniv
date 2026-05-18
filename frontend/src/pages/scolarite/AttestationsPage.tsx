import React, { useState, useEffect } from 'react';
import { useAuthStore } from '../../store/authStore';
import { api } from '../../api/client';
import { FileText, CheckCircle, Clock, Download, Search, Plus, X, User, Check, XCircle } from 'lucide-react';

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

interface Etudiant {
  id: string;
  nom: string;
  prenom: string;
  matricule: string;
}

const AttestationsPage: React.FC = () => {
  const { tenant } = useAuthStore();
  const [attestations, setAttestations] = useState<Attestation[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  
  // Modal nouvelle attestation
  const [showModal, setShowModal] = useState(false);
  const [etudiants, setEtudiants] = useState<Etudiant[]>([]);
  const [loadingEtudiants, setLoadingEtudiants] = useState(false);
  const [searchEtudiant, setSearchEtudiant] = useState('');
  const [selectedEtudiant, setSelectedEtudiant] = useState<Etudiant | null>(null);
  const [typeAttestation, setTypeAttestation] = useState('inscription');
  const [motif, setMotif] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (tenant?.id) {
      loadAttestations();
    }
  }, [tenant]);

  useEffect(() => {
    if (showModal && etudiants.length === 0) {
      loadEtudiants();
    }
  }, [showModal]);

  const loadAttestations = async () => {
    if (!tenant?.id) {
      console.warn('Tenant ID non défini');
      return;
    }
    
    try {
      setLoading(true);
      const response = await api.get(`/scolarite/${tenant.id}/attestations`);
      setAttestations(response.data || []);
    } catch (error: any) {
      console.error('Erreur chargement attestations:', error);
      console.error('Détails:', error.response?.data);
      
      // Si la table n'existe pas, afficher un message informatif
      if (error.response?.status === 400 && error.response?.data?.message?.includes('attestation')) {
        console.warn('⚠️ La table attestation n\'existe pas encore. Exécutez le script SQL de migration.');
      }
      
      setAttestations([]);
    } finally {
      setLoading(false);
    }
  };

  const loadEtudiants = async () => {
    try {
      setLoadingEtudiants(true);
      const response = await api.get(`/academic/${tenant?.id}/etudiants`);
      setEtudiants(response.data || []);
    } catch (error) {
      console.error('Erreur chargement étudiants:', error);
      setEtudiants([]);
    } finally {
      setLoadingEtudiants(false);
    }
  };

  const handleCreateAttestation = async () => {
    if (!selectedEtudiant) {
      alert('Veuillez sélectionner un étudiant');
      return;
    }

    try {
      setSubmitting(true);
      await api.post(`/scolarite/${tenant?.id}/attestations`, {
        etudiantId: selectedEtudiant.id,
        typeAttestation,
        motif: motif.trim() || undefined
      });
      
      alert('Attestation créée avec succès');
      setShowModal(false);
      setSelectedEtudiant(null);
      setTypeAttestation('inscription');
      setMotif('');
      loadAttestations();
    } catch (error: any) {
      alert(error.response?.data?.message || 'Erreur lors de la création de l\'attestation');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDownloadPDF = async (attestationId: string) => {
    try {
      const response = await api.get(`/scolarite/${tenant?.id}/attestations/${attestationId}/pdf`, {
        responseType: 'blob'
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `attestation-${attestationId}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Erreur téléchargement PDF:', error);
      alert('Erreur lors du téléchargement du PDF');
    }
  };

  const handleValider = async (attestationId: string) => {
    if (!confirm('Voulez-vous valider cette attestation ?')) return;
    
    try {
      await api.put(`/scolarite/${tenant?.id}/attestations/${attestationId}/valider`);
      alert('Attestation validée avec succès');
      loadAttestations();
    } catch (error: any) {
      alert(error.response?.data?.message || 'Erreur lors de la validation');
    }
  };

  const handleRejeter = async (attestationId: string) => {
    const motifRejet = prompt('Motif du rejet:');
    if (!motifRejet) return;
    
    try {
      await api.put(`/scolarite/${tenant?.id}/attestations/${attestationId}/rejeter`, {
        motifRejet
      });
      alert('Attestation rejetée');
      loadAttestations();
    } catch (error: any) {
      alert(error.response?.data?.message || 'Erreur lors du rejet');
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
      case 'validee': return '#8b5cf6';
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

  const filteredEtudiants = etudiants.filter(e =>
    e.nom.toLowerCase().includes(searchEtudiant.toLowerCase()) ||
    e.prenom.toLowerCase().includes(searchEtudiant.toLowerCase()) ||
    e.matricule.toLowerCase().includes(searchEtudiant.toLowerCase())
  );

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
              onClick={() => setShowModal(true)}
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
                      <div style={{ display: 'flex', gap: 8, justifyContent: 'center' }}>
                        <button
                          onClick={() => handleDownloadPDF(attestation.id)}
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
                          title="Télécharger PDF"
                        >
                          <Download size={14} />
                          PDF
                        </button>
                        
                        {attestation.statut === 'en_attente' && (
                          <>
                            <button
                              onClick={() => handleValider(attestation.id)}
                              style={{
                                padding: '6px 12px',
                                background: '#10b981',
                                color: 'white',
                                border: 'none',
                                borderRadius: 6,
                                fontSize: 13,
                                cursor: 'pointer',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: 6
                              }}
                              title="Valider"
                            >
                              <Check size={14} />
                            </button>
                            
                            <button
                              onClick={() => handleRejeter(attestation.id)}
                              style={{
                                padding: '6px 12px',
                                background: '#ef4444',
                                color: 'white',
                                border: 'none',
                                borderRadius: 6,
                                fontSize: 13,
                                cursor: 'pointer',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: 6
                              }}
                              title="Rejeter"
                            >
                              <XCircle size={14} />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal Nouvelle Attestation */}
      {showModal && (
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
          zIndex: 1000,
          padding: 20
        }}>
          <div style={{
            background: 'white',
            borderRadius: 12,
            maxWidth: 600,
            width: '100%',
            maxHeight: '90vh',
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column'
          }}>
            {/* Header */}
            <div style={{ padding: 20, borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ fontSize: 18, fontWeight: 600, color: '#1e293b', margin: 0 }}>
                Nouvelle Attestation
              </h3>
              <button
                onClick={() => setShowModal(false)}
                style={{
                  padding: 8,
                  background: 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  color: '#64748b'
                }}
              >
                <X size={20} />
              </button>
            </div>

            {/* Body */}
            <div style={{ flex: 1, overflow: 'auto', padding: 20 }}>
              {/* Sélection Étudiant */}
              <div style={{ marginBottom: 20 }}>
                <label style={{ display: 'block', fontSize: 14, fontWeight: 500, color: '#475569', marginBottom: 8 }}>
                  Étudiant *
                </label>
                
                {selectedEtudiant ? (
                  <div style={{
                    padding: 12,
                    border: '2px solid #3b82f6',
                    borderRadius: 8,
                    background: '#eff6ff',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <User size={20} color="#3b82f6" />
                      <div>
                        <div style={{ fontWeight: 600, color: '#1e293b' }}>
                          {selectedEtudiant.nom} {selectedEtudiant.prenom}
                        </div>
                        <div style={{ fontSize: 12, color: '#64748b' }}>
                          {selectedEtudiant.matricule}
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => setSelectedEtudiant(null)}
                      style={{
                        padding: '4px 12px',
                        background: '#ef4444',
                        color: 'white',
                        border: 'none',
                        borderRadius: 6,
                        fontSize: 12,
                        cursor: 'pointer'
                      }}
                    >
                      Changer
                    </button>
                  </div>
                ) : (
                  <>
                    <div style={{ position: 'relative', marginBottom: 12 }}>
                      <Search size={18} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                      <input
                        type="text"
                        placeholder="Rechercher un étudiant..."
                        value={searchEtudiant}
                        onChange={(e) => setSearchEtudiant(e.target.value)}
                        style={{
                          width: '100%',
                          padding: '10px 12px 10px 40px',
                          border: '1px solid #e2e8f0',
                          borderRadius: 8,
                          fontSize: 14
                        }}
                      />
                    </div>
                    
                    <div style={{
                      maxHeight: 200,
                      overflow: 'auto',
                      border: '1px solid #e2e8f0',
                      borderRadius: 8
                    }}>
                      {loadingEtudiants ? (
                        <div style={{ padding: 20, textAlign: 'center', color: '#64748b' }}>
                          Chargement...
                        </div>
                      ) : filteredEtudiants.length === 0 ? (
                        <div style={{ padding: 20, textAlign: 'center', color: '#64748b' }}>
                          Aucun étudiant trouvé
                        </div>
                      ) : (
                        filteredEtudiants.map(etudiant => (
                          <div
                            key={etudiant.id}
                            onClick={() => setSelectedEtudiant(etudiant)}
                            style={{
                              padding: 12,
                              borderBottom: '1px solid #e2e8f0',
                              cursor: 'pointer',
                              transition: 'background 0.2s'
                            }}
                            onMouseEnter={(e) => e.currentTarget.style.background = '#f8fafc'}
                            onMouseLeave={(e) => e.currentTarget.style.background = 'white'}
                          >
                            <div style={{ fontWeight: 500, color: '#1e293b' }}>
                              {etudiant.nom} {etudiant.prenom}
                            </div>
                            <div style={{ fontSize: 12, color: '#64748b' }}>
                              {etudiant.matricule}
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </>
                )}
              </div>

              {/* Type d'Attestation */}
              <div style={{ marginBottom: 20 }}>
                <label style={{ display: 'block', fontSize: 14, fontWeight: 500, color: '#475569', marginBottom: 8 }}>
                  Type d'Attestation *
                </label>
                <select
                  value={typeAttestation}
                  onChange={(e) => setTypeAttestation(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    border: '1px solid #e2e8f0',
                    borderRadius: 8,
                    fontSize: 14,
                    cursor: 'pointer'
                  }}
                >
                  <option value="inscription">Attestation d'Inscription</option>
                  <option value="scolarite">Certificat de Scolarité</option>
                  <option value="reussite">Attestation de Réussite</option>
                </select>
              </div>

              {/* Motif */}
              <div style={{ marginBottom: 20 }}>
                <label style={{ display: 'block', fontSize: 14, fontWeight: 500, color: '#475569', marginBottom: 8 }}>
                  Motif (optionnel)
                </label>
                <textarea
                  value={motif}
                  onChange={(e) => setMotif(e.target.value)}
                  placeholder="Précisez le motif de la demande..."
                  rows={3}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    border: '1px solid #e2e8f0',
                    borderRadius: 8,
                    fontSize: 14,
                    resize: 'vertical',
                    fontFamily: 'inherit'
                  }}
                />
              </div>
            </div>

            {/* Footer */}
            <div style={{ padding: 20, borderTop: '1px solid #e2e8f0', display: 'flex', justifyContent: 'flex-end', gap: 12 }}>
              <button
                onClick={() => setShowModal(false)}
                disabled={submitting}
                style={{
                  padding: '10px 20px',
                  background: '#f1f5f9',
                  color: '#475569',
                  border: 'none',
                  borderRadius: 8,
                  fontSize: 14,
                  fontWeight: 500,
                  cursor: submitting ? 'not-allowed' : 'pointer',
                  opacity: submitting ? 0.6 : 1
                }}
              >
                Annuler
              </button>
              <button
                onClick={handleCreateAttestation}
                disabled={!selectedEtudiant || submitting}
                style={{
                  padding: '10px 20px',
                  background: !selectedEtudiant || submitting ? '#cbd5e1' : '#10b981',
                  color: 'white',
                  border: 'none',
                  borderRadius: 8,
                  fontSize: 14,
                  fontWeight: 500,
                  cursor: !selectedEtudiant || submitting ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8
                }}
              >
                <Plus size={16} />
                {submitting ? 'Création...' : 'Créer Attestation'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AttestationsPage;

// Made with Bob
