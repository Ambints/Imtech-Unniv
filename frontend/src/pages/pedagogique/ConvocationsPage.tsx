import React, { useState, useEffect } from 'react';
import { useAuthStore } from '../../store/authStore';
import { api } from '../../api/client';
import toast from 'react-hot-toast';
import {
  Mail, Plus, X, Send, CheckCircle, FileText, Calendar,
  Clock, MapPin, Users, AlertTriangle, Printer, Search
} from 'lucide-react';

interface Convocation {
  id: string;
  etudiantId?: string;
  sessionExamenId?: string;
  type: string;
  libelle: string;
  message?: string;
  dateConvocation: string;
  heureConvocation?: string;
  lieu?: string;
  salleId?: string;
  statut: string;
  dateEnvoi?: string;
  etudiant?: {
    id: string;
    nom: string;
    prenom: string;
    matricule?: string;
  };
  salle?: {
    nom: string;
  };
}

interface SessionExamen {
  id: string;
  libelle: string;
  dateDebut?: string;
  dateFin?: string;
  typeSession: string;
}

interface Etudiant {
  id: string;
  nom: string;
  prenom: string;
  matricule: string;
}

export const ConvocationsPage: React.FC = () => {
  const { user, tenant } = useAuthStore();
  const [loading, setLoading] = useState(true);
  const [convocations, setConvocations] = useState<Convocation[]>([]);
  const [sessionsExamen, setSessionsExamen] = useState<SessionExamen[]>([]);
  const [etudiants, setEtudiants] = useState<Etudiant[]>([]);
  const [selectedConvocations, setSelectedConvocations] = useState<string[]>([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showGenerateModal, setShowGenerateModal] = useState(false);
  const [filterStatut, setFilterStatut] = useState<string>('');
  
  const [createForm, setCreateForm] = useState({
    etudiantId: '',
    type: 'examen',
    libelle: '',
    message: '',
    dateConvocation: '',
    heureConvocation: '',
    lieu: '',
  });

  const [generateForm, setGenerateForm] = useState({
    sessionExamenId: '',
  });

  useEffect(() => {
    loadData();
    loadSessionsExamen();
  }, [user, tenant]);

  const loadData = async () => {
    setLoading(true);
    try {
      const tid = tenant?.id || user?.tenantId;
      if (!tid) return;

      // Charger les convocations
      const params = new URLSearchParams();
      if (filterStatut) params.append('statut', filterStatut);
      
      const response = await api.get(`/secretaire/${tid}/convocations?${params}`);
      setConvocations(response.data || []);

      // Charger les étudiants pour le select
      const etudiantsResponse = await api.get(`/academic/${tid}/etudiants`);
      setEtudiants(etudiantsResponse.data || []);
    } catch (err: any) {
      toast.error('Erreur lors du chargement des données');
    } finally {
      setLoading(false);
    }
  };

  const loadSessionsExamen = async () => {
    try {
      const tid = tenant?.id || user?.tenantId;
      if (!tid) return;

      const response = await api.get(`/academic/${tid}/sessions`);
      setSessionsExamen(response.data || []);
    } catch (err: any) {
      console.error('Erreur chargement sessions:', err);
    }
  };

  const handleCreateConvocation = async () => {
    try {
      const tid = tenant?.id || user?.tenantId;
      
      await api.post(`/secretaire/${tid}/convocations`, createForm);
      toast.success('Convocation créée avec succès');
      setShowCreateModal(false);
      loadData();
      setCreateForm({
        etudiantId: '',
        type: 'examen',
        libelle: '',
        message: '',
        dateConvocation: '',
        heureConvocation: '',
        lieu: '',
      });
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Erreur lors de la création');
    }
  };

  const handleGenerateConvocations = async () => {
    try {
      const tid = tenant?.id || user?.tenantId;
      
      await api.post(`/secretaire/${tid}/convocations/generer-examen`, {
        sessionExamenId: generateForm.sessionExamenId,
      });
      toast.success('Convocations générées avec succès');
      setShowGenerateModal(false);
      loadData();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Erreur lors de la génération');
    }
  };

  const handleEnvoyerConvocations = async () => {
    if (selectedConvocations.length === 0) {
      toast.error('Veuillez sélectionner au moins une convocation');
      return;
    }

    try {
      const tid = tenant?.id || user?.tenantId;
      
      await api.post(`/secretaire/${tid}/convocations/envoyer`, {
        convocationIds: selectedConvocations,
      });
      toast.success(`${selectedConvocations.length} convocation(s) envoyée(s)`);
      setSelectedConvocations([]);
      loadData();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Erreur lors de l\'envoi');
    }
  };

  const toggleSelection = (id: string) => {
    setSelectedConvocations(prev =>
      prev.includes(id)
        ? prev.filter(convId => convId !== id)
        : [...prev, id]
    );
  };

  const selectAll = () => {
    const selectable = convocations
      .filter(c => c.statut === 'brouillon')
      .map(c => c.id);
    
    if (selectedConvocations.length === selectable.length) {
      setSelectedConvocations([]);
    } else {
      setSelectedConvocations(selectable);
    }
  };

  const getStatutLabel = (statut: string) => {
    const labels: Record<string, { text: string; color: string; bg: string }> = {
      brouillon: { text: 'Brouillon', color: '#6b7280', bg: '#f3f4f6' },
      envoyee: { text: 'Envoyée', color: '#1a5276', bg: '#dbeafe' },
      lue: { text: 'Lue', color: '#7c3aed', bg: '#ede9fe' },
      confirme: { text: 'Confirmée', color: '#059669', bg: '#d1fae5' },
      annule: { text: 'Annulée', color: '#dc2626', bg: '#fee2e2' },
    };
    return labels[statut] || { text: statut, color: '#6b7280', bg: '#f3f4f6' };
  };

  const getTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      examen: 'Examen',
      rattrapage: 'Rattrapage',
      soutenance: 'Soutenance',
      reunion: 'Réunion',
      conseil_discipline: 'Conseil de discipline',
    };
    return labels[type] || type;
  };

  return (
    <div style={{ padding: 32 }}>
      {/* Header */}
      <div style={{ marginBottom: 32 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
          <h1 style={{ fontSize: 28, fontWeight: 800, color: '#1e293b', margin: 0 }}>
            Convocations
          </h1>
          <div style={{ display: 'flex', gap: 12 }}>
            <button
              onClick={() => setShowGenerateModal(true)}
              style={{
                padding: '12px 20px',
                background: '#8b5cf6',
                color: 'white',
                border: 'none',
                borderRadius: 8,
                cursor: 'pointer',
                fontSize: 14,
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                gap: 8
              }}
            >
              <Users size={18} />
              Générer par session
            </button>
            <button
              onClick={() => setShowCreateModal(true)}
              style={{
                padding: '12px 20px',
                background: '#1a5276',
                color: 'white',
                border: 'none',
                borderRadius: 8,
                cursor: 'pointer',
                fontSize: 14,
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                gap: 8
              }}
            >
              <Plus size={18} />
              Créer individuelle
            </button>
          </div>
        </div>
        <p style={{ color: '#64748b', fontSize: 14, margin: 0 }}>
          Gérer les convocations aux examens, soutenances et réunions
        </p>
      </div>

      {/* Filtres et actions */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
          <select
            value={filterStatut}
            onChange={(e) => {
              setFilterStatut(e.target.value);
              loadData();
            }}
            style={{
              padding: '10px 16px',
              borderRadius: 8,
              border: '1px solid #d1d5db',
              fontSize: 14
            }}
          >
            <option value="">Tous les statuts</option>
            <option value="brouillon">Brouillon</option>
            <option value="envoyee">Envoyée</option>
            <option value="lue">Lue</option>
            <option value="confirme">Confirmée</option>
          </select>
        </div>

        {selectedConvocations.length > 0 && (
          <button
            onClick={handleEnvoyerConvocations}
            style={{
              padding: '10px 20px',
              background: '#059669',
              color: 'white',
              border: 'none',
              borderRadius: 8,
              cursor: 'pointer',
              fontSize: 14,
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              gap: 8
            }}
          >
            <Send size={18} />
            Envoyer ({selectedConvocations.length})
          </button>
        )}
      </div>

      {/* Table */}
      <div style={{ background: 'white', borderRadius: 12, boxShadow: '0 1px 3px rgba(0,0,0,0.1)', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: '#f8fafc' }}>
              <th style={{ padding: '16px', textAlign: 'left', borderBottom: '1px solid #e2e8f0' }}>
                <input
                  type="checkbox"
                  onChange={selectAll}
                  checked={
                    selectedConvocations.length > 0 &&
                    selectedConvocations.length === convocations.filter(c => c.statut === 'brouillon').length
                  }
                />
              </th>
              <th style={{ padding: '16px', textAlign: 'left', borderBottom: '1px solid #e2e8f0', fontSize: 14, fontWeight: 600, color: '#374151' }}>
                Type
              </th>
              <th style={{ padding: '16px', textAlign: 'left', borderBottom: '1px solid #e2e8f0', fontSize: 14, fontWeight: 600, color: '#374151' }}>
                Libellé
              </th>
              <th style={{ padding: '16px', textAlign: 'left', borderBottom: '1px solid #e2e8f0', fontSize: 14, fontWeight: 600, color: '#374151' }}>
                Destinataire
              </th>
              <th style={{ padding: '16px', textAlign: 'left', borderBottom: '1px solid #e2e8f0', fontSize: 14, fontWeight: 600, color: '#374151' }}>
                Date & Heure
              </th>
              <th style={{ padding: '16px', textAlign: 'left', borderBottom: '1px solid #e2e8f0', fontSize: 14, fontWeight: 600, color: '#374151' }}>
                Statut
              </th>
              <th style={{ padding: '16px', textAlign: 'center', borderBottom: '1px solid #e2e8f0', fontSize: 14, fontWeight: 600, color: '#374151' }}>
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={7} style={{ textAlign: 'center', padding: 40 }}>
                  Chargement...
                </td>
              </tr>
            ) : convocations.length === 0 ? (
              <tr>
                <td colSpan={7} style={{ textAlign: 'center', padding: 40, color: '#9ca3af' }}>
                  <Mail size={48} style={{ marginBottom: 12, opacity: 0.5 }} />
                  <p>Aucune convocation trouvée</p>
                </td>
              </tr>
            ) : (
              convocations.map(convocation => {
                const statutStyle = getStatutLabel(convocation.statut);
                return (
                  <tr key={convocation.id} style={{ borderBottom: '1px solid #e2e8f0' }}>
                    <td style={{ padding: '16px' }}>
                      {convocation.statut === 'brouillon' && (
                        <input
                          type="checkbox"
                          checked={selectedConvocations.includes(convocation.id)}
                          onChange={() => toggleSelection(convocation.id)}
                        />
                      )}
                    </td>
                    <td style={{ padding: '16px', fontSize: 14 }}>
                      <span style={{
                        padding: '4px 12px',
                        background: '#f3f4f6',
                        borderRadius: 20,
                        fontSize: 12,
                        fontWeight: 500
                      }}>
                        {getTypeLabel(convocation.type)}
                      </span>
                    </td>
                    <td style={{ padding: '16px', fontSize: 14, fontWeight: 500 }}>
                      {convocation.libelle}
                    </td>
                    <td style={{ padding: '16px', fontSize: 14 }}>
                      {convocation.etudiant ? (
                        <div>
                          <div style={{ fontWeight: 500 }}>
                            {convocation.etudiant.prenom} {convocation.etudiant.nom}
                          </div>
                          <div style={{ fontSize: 12, color: '#64748b' }}>
                            {convocation.etudiant.matricule}
                          </div>
                        </div>
                      ) : (
                        <span style={{ color: '#9ca3af' }}>Générale</span>
                      )}
                    </td>
                    <td style={{ padding: '16px', fontSize: 14 }}>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                        <span>{new Date(convocation.dateConvocation).toLocaleDateString('fr-FR')}</span>
                        {convocation.heureConvocation && (
                          <span style={{ fontSize: 12, color: '#64748b' }}>{convocation.heureConvocation}</span>
                        )}
                        {convocation.lieu && (
                          <span style={{ fontSize: 12, color: '#64748b' }}>
                            <MapPin size={12} style={{ display: 'inline', marginRight: 4 }} />
                            {convocation.lieu}
                          </span>
                        )}
                      </div>
                    </td>
                    <td style={{ padding: '16px' }}>
                      <span style={{
                        padding: '4px 12px',
                        borderRadius: 20,
                        fontSize: 12,
                        fontWeight: 500,
                        background: statutStyle.bg,
                        color: statutStyle.color
                      }}>
                        {statutStyle.text}
                      </span>
                    </td>
                    <td style={{ padding: '16px', textAlign: 'center' }}>
                      <button
                        style={{
                          padding: '6px 12px',
                          background: '#f3f4f6',
                          border: 'none',
                          borderRadius: 6,
                          cursor: 'pointer',
                          fontSize: 12
                        }}
                        title="Imprimer"
                      >
                        <Printer size={16} />
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Modal création convocation individuelle */}
      {showCreateModal && (
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
            background: 'white',
            borderRadius: 12,
            padding: 32,
            width: '90%',
            maxWidth: 500,
            maxHeight: '90vh',
            overflow: 'auto'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
              <h2 style={{ margin: 0, fontSize: 20, fontWeight: 700 }}>Créer une convocation</h2>
              <button
                onClick={() => setShowCreateModal(false)}
                style={{ padding: 8, background: 'none', border: 'none', cursor: 'pointer' }}
              >
                <X size={24} />
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div>
                <label style={{ display: 'block', marginBottom: 8, fontWeight: 600, fontSize: 14 }}>
                  Type de convocation
                </label>
                <select
                  value={createForm.type}
                  onChange={(e) => setCreateForm({ ...createForm, type: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    borderRadius: 8,
                    border: '1px solid #d1d5db',
                    fontSize: 14
                  }}
                >
                  <option value="examen">Examen</option>
                  <option value="rattrapage">Rattrapage</option>
                  <option value="soutenance">Soutenance</option>
                  <option value="reunion">Réunion</option>
                  <option value="conseil_discipline">Conseil de discipline</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: 8, fontWeight: 600, fontSize: 14 }}>
                  Étudiant (optionnel pour convocation générale)
                </label>
                <select
                  value={createForm.etudiantId}
                  onChange={(e) => setCreateForm({ ...createForm, etudiantId: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    borderRadius: 8,
                    border: '1px solid #d1d5db',
                    fontSize: 14
                  }}
                >
                  <option value="">Tous les étudiants</option>
                  {etudiants.map(etudiant => (
                    <option key={etudiant.id} value={etudiant.id}>
                      {etudiant.prenom} {etudiant.nom} ({etudiant.matricule})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: 8, fontWeight: 600, fontSize: 14 }}>
                  Libellé
                </label>
                <input
                  type="text"
                  value={createForm.libelle}
                  onChange={(e) => setCreateForm({ ...createForm, libelle: e.target.value })}
                  placeholder="Ex: Convocation à l'examen de programmation"
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    borderRadius: 8,
                    border: '1px solid #d1d5db',
                    fontSize: 14
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: 8, fontWeight: 600, fontSize: 14 }}>
                  Message
                </label>
                <textarea
                  value={createForm.message}
                  onChange={(e) => setCreateForm({ ...createForm, message: e.target.value })}
                  rows={3}
                  placeholder="Message détaillé pour le destinataire..."
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    borderRadius: 8,
                    border: '1px solid #d1d5db',
                    fontSize: 14,
                    resize: 'vertical'
                  }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 16 }}>
                <div>
                  <label style={{ display: 'block', marginBottom: 8, fontWeight: 600, fontSize: 14 }}>
                    Date
                  </label>
                  <input
                    type="date"
                    value={createForm.dateConvocation}
                    onChange={(e) => setCreateForm({ ...createForm, dateConvocation: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      borderRadius: 8,
                      border: '1px solid #d1d5db',
                      fontSize: 14
                    }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: 8, fontWeight: 600, fontSize: 14 }}>
                    Heure
                  </label>
                  <input
                    type="time"
                    value={createForm.heureConvocation}
                    onChange={(e) => setCreateForm({ ...createForm, heureConvocation: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      borderRadius: 8,
                      border: '1px solid #d1d5db',
                      fontSize: 14
                    }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: 8, fontWeight: 600, fontSize: 14 }}>
                  Lieu
                </label>
                <input
                  type="text"
                  value={createForm.lieu}
                  onChange={(e) => setCreateForm({ ...createForm, lieu: e.target.value })}
                  placeholder="Ex: Salle A101, Amphithéâtre B..."
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    borderRadius: 8,
                    border: '1px solid #d1d5db',
                    fontSize: 14
                  }}
                />
              </div>
            </div>

            <div style={{ display: 'flex', gap: 12, marginTop: 24 }}>
              <button
                onClick={() => setShowCreateModal(false)}
                style={{
                  flex: 1,
                  padding: '12px 20px',
                  border: '1px solid #d1d5db',
                  borderRadius: 8,
                  background: 'white',
                  cursor: 'pointer',
                  fontSize: 14
                }}
              >
                Annuler
              </button>
              <button
                onClick={handleCreateConvocation}
                style={{
                  flex: 1,
                  padding: '12px 20px',
                  background: '#1a5276',
                  color: 'white',
                  border: 'none',
                  borderRadius: 8,
                  cursor: 'pointer',
                  fontSize: 14,
                  fontWeight: 600
                }}
              >
                Créer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal génération convocations */}
      {showGenerateModal && (
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
            background: 'white',
            borderRadius: 12,
            padding: 32,
            width: '90%',
            maxWidth: 400
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
              <h2 style={{ margin: 0, fontSize: 20, fontWeight: 700 }}>Générer des convocations</h2>
              <button
                onClick={() => setShowGenerateModal(false)}
                style={{ padding: 8, background: 'none', border: 'none', cursor: 'pointer' }}
              >
                <X size={24} />
              </button>
            </div>

            <p style={{ color: '#64748b', marginBottom: 16 }}>
              Sélectionnez une session d'examen pour générer automatiquement les convocations pour tous les étudiants inscrits.
            </p>

            <div style={{ marginBottom: 24 }}>
              <label style={{ display: 'block', marginBottom: 8, fontWeight: 600, fontSize: 14 }}>
                Session d'examen
              </label>
              <select
                value={generateForm.sessionExamenId}
                onChange={(e) => setGenerateForm({ ...generateForm, sessionExamenId: e.target.value })}
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  borderRadius: 8,
                  border: '1px solid #d1d5db',
                  fontSize: 14
                }}
              >
                <option value="">Sélectionner une session</option>
                {sessionsExamen.map(session => (
                  <option key={session.id} value={session.id}>
                    {session.libelle} ({session.typeSession})
                  </option>
                ))}
              </select>
            </div>

            <div style={{ display: 'flex', gap: 12 }}>
              <button
                onClick={() => setShowGenerateModal(false)}
                style={{
                  flex: 1,
                  padding: '12px 20px',
                  border: '1px solid #d1d5db',
                  borderRadius: 8,
                  background: 'white',
                  cursor: 'pointer',
                  fontSize: 14
                }}
              >
                Annuler
              </button>
              <button
                onClick={handleGenerateConvocations}
                disabled={!generateForm.sessionExamenId}
                style={{
                  flex: 1,
                  padding: '12px 20px',
                  background: generateForm.sessionExamenId ? '#8b5cf6' : '#9ca3af',
                  color: 'white',
                  border: 'none',
                  borderRadius: 8,
                  cursor: generateForm.sessionExamenId ? 'pointer' : 'not-allowed',
                  fontSize: 14,
                  fontWeight: 600
                }}
              >
                Générer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ConvocationsPage;

// Made with Bob
