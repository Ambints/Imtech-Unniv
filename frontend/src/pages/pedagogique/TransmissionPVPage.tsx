import React, { useState, useEffect } from 'react';
import { useAuthStore } from '../../store/authStore';
import { api } from '../../api/client';
import toast from 'react-hot-toast';
import {
  FileText, Send, CheckCircle, Clock, Archive,
  AlertTriangle, Download, ChevronRight
} from 'lucide-react';

interface ProcesVerbal {
  id: string;
  numero: string;
  dateDeliberation: string;
  sessionExamenId: string;
  parcoursId: string;
  nbAdmis: number;
  nbAjournes: number;
  nbAbsents: number;
  tauxReussite: number;
  statut: string;
  fichierUrl?: string;
  transmisAScolarite?: boolean;
  dateTransmissionScolarite?: string;
  transmisPar?: string;
  sessionExamen?: {
    libelle: string;
    typeSession: string;
  };
}

interface Parcours {
  id: string;
  code: string;
  nom: string;
}

export const TransmissionPVPage: React.FC = () => {
  const { user, tenant } = useAuthStore();
  const [loading, setLoading] = useState(true);
  const [pvsATransmettre, setPvsATransmettre] = useState<ProcesVerbal[]>([]);
  const [pvsTransmis, setPvsTransmis] = useState<ProcesVerbal[]>([]);
  const [parcoursList, setParcoursList] = useState<Parcours[]>([]);
  const [selectedParcours, setSelectedParcours] = useState<string>('');
  const [selectedPVs, setSelectedPVs] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState<'a-transmettre' | 'transmis'>('a-transmettre');

  useEffect(() => {
    loadParcours();
  }, [user, tenant]);

  useEffect(() => {
    if (selectedParcours) {
      loadPVs();
    }
  }, [selectedParcours, activeTab]);

  const loadParcours = async () => {
    try {
      const tid = tenant?.id || user?.tenantId;
      if (!tid) return;

      const response = await api.get(`/academic/${tid}/parcours`);
      const parcours = response.data || [];
      setParcoursList(parcours);
      
      if (parcours.length > 0) {
        setSelectedParcours(parcours[0].id);
      }
    } catch (err: any) {
      toast.error('Erreur lors du chargement des parcours');
    }
  };

  const loadPVs = async () => {
    setLoading(true);
    try {
      const tid = tenant?.id || user?.tenantId;
      if (!tid || !selectedParcours) return;

      if (activeTab === 'a-transmettre') {
        const response = await api.get(`/secretaire/${tid}/pvs-a-transmettre?parcoursId=${selectedParcours}`);
        setPvsATransmettre(response.data || []);
      } else {
        const response = await api.get(`/secretaire/${tid}/pvs-transmis?parcoursId=${selectedParcours}`);
        setPvsTransmis(response.data || []);
      }
    } catch (err: any) {
      toast.error('Erreur lors du chargement des PV');
    } finally {
      setLoading(false);
    }
  };

  const handleTransmettre = async (pvId: string) => {
    try {
      const tid = tenant?.id || user?.tenantId;
      await api.post(`/secretaire/${tid}/pvs/${pvId}/transmettre`);
      toast.success('PV transmis à la scolarité centrale');
      loadPVs();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Erreur lors de la transmission');
    }
  };

  const handleTransmettreBatch = async () => {
    if (selectedPVs.length === 0) {
      toast.error('Veuillez sélectionner au moins un PV');
      return;
    }

    try {
      const tid = tenant?.id || user?.tenantId;
      const response = await api.post(`/secretaire/${tid}/pvs/transmettre-batch`, {
        pvIds: selectedPVs,
      });
      toast.success(response.data.message);
      setSelectedPVs([]);
      loadPVs();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Erreur lors de la transmission');
    }
  };

  const toggleSelection = (id: string) => {
    setSelectedPVs(prev =>
      prev.includes(id)
        ? prev.filter(pvId => pvId !== id)
        : [...prev, id]
    );
  };

  const selectAll = () => {
    if (selectedPVs.length === pvsATransmettre.length) {
      setSelectedPVs([]);
    } else {
      setSelectedPVs(pvsATransmettre.map(pv => pv.id));
    }
  };

  const getStatutLabel = (statut: string) => {
    const labels: Record<string, { text: string; color: string; bg: string }> = {
      brouillon: { text: 'Brouillon', color: '#6b7280', bg: '#f3f4f6' },
      valide: { text: 'Validé', color: '#059669', bg: '#d1fae5' },
      transmis_scolarite: { text: 'Transmis à la scolarité', color: '#1a5276', bg: '#dbeafe' },
      archive: { text: 'Archivé', color: '#6b7280', bg: '#f3f4f6' },
    };
    return labels[statut] || { text: statut, color: '#6b7280', bg: '#f3f4f6' };
  };

  return (
    <div style={{ padding: 32 }}>
      {/* Header */}
      <div style={{ marginBottom: 32 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h1 style={{ fontSize: 28, fontWeight: 800, color: '#1e293b', margin: '0 0 8px' }}>
              Transmission des PV à la Scolarité
            </h1>
            <p style={{ color: '#64748b', fontSize: 14, margin: 0 }}>
              Transmettre les procès-verbaux de délibération à la scolarité centrale
            </p>
          </div>
          {activeTab === 'a-transmettre' && selectedPVs.length > 0 && (
            <button
              onClick={handleTransmettreBatch}
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
              <Send size={18} />
              Transmettre ({selectedPVs.length})
            </button>
          )}
        </div>
      </div>

      {/* Sélecteur de parcours */}
      <div style={{ marginBottom: 24 }}>
        <label style={{ display: 'block', marginBottom: 8, fontWeight: 600, fontSize: 14 }}>
          Parcours
        </label>
        <select
          value={selectedParcours}
          onChange={(e) => setSelectedParcours(e.target.value)}
          style={{
            padding: '10px 16px',
            borderRadius: 8,
            border: '1px solid #d1d5db',
            fontSize: 14,
            minWidth: 300
          }}
        >
          {parcoursList.map(p => (
            <option key={p.id} value={p.id}>
              {p.code} - {p.nom}
            </option>
          ))}
        </select>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 24, borderBottom: '1px solid #e5e7eb' }}>
        <button
          onClick={() => setActiveTab('a-transmettre')}
          style={{
            padding: '12px 20px',
            background: 'none',
            border: 'none',
            borderBottom: activeTab === 'a-transmettre' ? '2px solid #1a5276' : '2px solid transparent',
            color: activeTab === 'a-transmettre' ? '#1a5276' : '#6b7280',
            fontWeight: activeTab === 'a-transmettre' ? 600 : 500,
            cursor: 'pointer',
            fontSize: 14,
            display: 'flex',
            alignItems: 'center',
            gap: 8
          }}
        >
          <Clock size={18} />
          À transmettre
          {pvsATransmettre.length > 0 && (
            <span style={{
              padding: '2px 8px',
              background: '#1a5276',
              color: 'white',
              borderRadius: 12,
              fontSize: 12
            }}>
              {pvsATransmettre.length}
            </span>
          )}
        </button>
        <button
          onClick={() => setActiveTab('transmis')}
          style={{
            padding: '12px 20px',
            background: 'none',
            border: 'none',
            borderBottom: activeTab === 'transmis' ? '2px solid #1a5276' : '2px solid transparent',
            color: activeTab === 'transmis' ? '#1a5276' : '#6b7280',
            fontWeight: activeTab === 'transmis' ? 600 : 500,
            cursor: 'pointer',
            fontSize: 14,
            display: 'flex',
            alignItems: 'center',
            gap: 8
          }}
        >
          <CheckCircle size={18} />
          Transmis
        </button>
      </div>

      {/* Liste des PV */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: 40 }}>Chargement...</div>
      ) : (
        <div style={{ background: 'white', borderRadius: 12, boxShadow: '0 1px 3px rgba(0,0,0,0.1)', overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#f8fafc' }}>
                {activeTab === 'a-transmettre' && (
                  <th style={{ padding: '16px', textAlign: 'left', borderBottom: '1px solid #e2e8f0' }}>
                    <input
                      type="checkbox"
                      onChange={selectAll}
                      checked={selectedPVs.length === pvsATransmettre.length && pvsATransmettre.length > 0}
                    />
                  </th>
                )}
                <th style={{ padding: '16px', textAlign: 'left', borderBottom: '1px solid #e2e8f0', fontSize: 14, fontWeight: 600, color: '#374151' }}>
                  Numéro
                </th>
                <th style={{ padding: '16px', textAlign: 'left', borderBottom: '1px solid #e2e8f0', fontSize: 14, fontWeight: 600, color: '#374151' }}>
                  Session
                </th>
                <th style={{ padding: '16px', textAlign: 'left', borderBottom: '1px solid #e2e8f0', fontSize: 14, fontWeight: 600, color: '#374151' }}>
                  Date de délibération
                </th>
                <th style={{ padding: '16px', textAlign: 'center', borderBottom: '1px solid #e2e8f0', fontSize: 14, fontWeight: 600, color: '#374151' }}>
                  Résultats
                </th>
                <th style={{ padding: '16px', textAlign: 'left', borderBottom: '1px solid #e2e8f0', fontSize: 14, fontWeight: 600, color: '#374151' }}>
                  Statut
                </th>
                {activeTab === 'transmis' && (
                  <th style={{ padding: '16px', textAlign: 'left', borderBottom: '1px solid #e2e8f0', fontSize: 14, fontWeight: 600, color: '#374151' }}>
                    Transmis le
                  </th>
                )}
                <th style={{ padding: '16px', textAlign: 'center', borderBottom: '1px solid #e2e8f0', fontSize: 14, fontWeight: 600, color: '#374151' }}>
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {activeTab === 'a-transmettre' && pvsATransmettre.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center', padding: 40, color: '#9ca3af' }}>
                    <CheckCircle size={48} style={{ marginBottom: 12, opacity: 0.5 }} />
                    <p>Aucun PV en attente de transmission</p>
                  </td>
                </tr>
              ) : activeTab === 'transmis' && pvsTransmis.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center', padding: 40, color: '#9ca3af' }}>
                    <Archive size={48} style={{ marginBottom: 12, opacity: 0.5 }} />
                    <p>Aucun PV transmis</p>
                  </td>
                </tr>
              ) : (
                (activeTab === 'a-transmettre' ? pvsATransmettre : pvsTransmis).map(pv => {
                  const statutStyle = getStatutLabel(pv.statut);
                  return (
                    <tr key={pv.id} style={{ borderBottom: '1px solid #e2e8f0' }}>
                      {activeTab === 'a-transmettre' && (
                        <td style={{ padding: '16px' }}>
                          <input
                            type="checkbox"
                            checked={selectedPVs.includes(pv.id)}
                            onChange={() => toggleSelection(pv.id)}
                          />
                        </td>
                      )}
                      <td style={{ padding: '16px', fontSize: 14, fontWeight: 600 }}>
                        {pv.numero}
                      </td>
                      <td style={{ padding: '16px', fontSize: 14 }}>
                        {pv.sessionExamen?.libelle || 'Session non définie'}
                      </td>
                      <td style={{ padding: '16px', fontSize: 14 }}>
                        {new Date(pv.dateDeliberation).toLocaleDateString('fr-FR')}
                      </td>
                      <td style={{ padding: '16px', fontSize: 14, textAlign: 'center' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 4, fontSize: 12 }}>
                          <span style={{ color: '#059669' }}>{pv.nbAdmis} admis</span>
                          <span style={{ color: '#dc2626' }}>{pv.nbAjournes} ajournés</span>
                          <span style={{ color: '#6b7280' }}>{pv.nbAbsents} absents</span>
                          <span style={{ fontWeight: 600, color: '#1e293b' }}>{pv.tauxReussite}% réussite</span>
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
                      {activeTab === 'transmis' && (
                        <td style={{ padding: '16px', fontSize: 14 }}>
                          {pv.dateTransmissionScolarite
                            ? new Date(pv.dateTransmissionScolarite).toLocaleDateString('fr-FR')
                            : '-'
                          }
                        </td>
                      )}
                      <td style={{ padding: '16px', textAlign: 'center' }}>
                        <div style={{ display: 'flex', gap: 8, justifyContent: 'center' }}>
                          {pv.fichierUrl && (
                            <button
                              style={{
                                padding: '6px 12px',
                                background: '#f3f4f6',
                                border: 'none',
                                borderRadius: 6,
                                cursor: 'pointer',
                                fontSize: 12
                              }}
                              title="Télécharger le PV"
                            >
                              <Download size={16} />
                            </button>
                          )}
                          {activeTab === 'a-transmettre' && (
                            <button
                              onClick={() => handleTransmettre(pv.id)}
                              style={{
                                padding: '6px 12px',
                                background: '#1a5276',
                                color: 'white',
                                border: 'none',
                                borderRadius: 6,
                                cursor: 'pointer',
                                fontSize: 12,
                                display: 'flex',
                                alignItems: 'center',
                                gap: 4
                              }}
                            >
                              <Send size={14} />
                              Transmettre
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Info box */}
      <div style={{
        marginTop: 24,
        padding: 16,
        background: '#eff6ff',
        borderRadius: 8,
        border: '1px solid #bfdbfe',
        display: 'flex',
        alignItems: 'flex-start',
        gap: 12
      }}>
        <AlertTriangle size={20} color="#1a5276" style={{ flexShrink: 0, marginTop: 2 }} />
        <div>
          <p style={{ margin: 0, fontSize: 14, fontWeight: 600, color: '#1e3a8a' }}>
            Information importante
          </p>
          <p style={{ margin: '4px 0 0', fontSize: 13, color: '#1e40af' }}>
            Une fois transmis à la scolarité centrale, les PV ne peuvent plus être modifiés par le secrétaire de parcours. 
            Assurez-vous que toutes les informations sont correctes avant la transmission.
          </p>
        </div>
      </div>
    </div>
  );
};

export default TransmissionPVPage;

// Made with Bob
