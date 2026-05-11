import React, { useState, useEffect } from 'react';
import { useAuthStore } from '../../store/authStore';
import { api } from '../../api/client';
import toast from 'react-hot-toast';
import {
  FileText, Search, Plus, Calendar, CheckCircle, Clock, AlertCircle
} from 'lucide-react';

interface Dossier {
  id: string;
  etudiantId: string;
  type: string;
  statut: string;
  documents: any[];
  notesInternes: string;
  archived: boolean;
  createdAt: string;
  etudiant?: {
    nom: string;
    prenom: string;
    matricule?: string;
  };
}

export const DossiersPage: React.FC = () => {
  const { user, tenant } = useAuthStore();
  const [loading, setLoading] = useState(true);
  const [dossiers, setDossiers] = useState<Dossier[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatut, setFilterStatut] = useState<string>('');

  useEffect(() => {
    loadDossiers();
  }, [user, tenant]);

  const loadDossiers = async () => {
    setLoading(true);
    try {
      const tid = tenant?.id || user?.tenantId;
      if (!tid) return;

      const response = await api.get(`/secretaire/${tid}/dossiers`);
      setDossiers(response.data || []);
    } catch (err: any) {
      toast.error('Erreur lors du chargement des dossiers');
    } finally {
      setLoading(false);
    }
  };

  const handleArchiver = async (dossierId: string) => {
    try {
      const tid = tenant?.id || user?.tenantId;
      await api.post(`/secretaire/${tid}/dossiers/${dossierId}/archiver`);
      toast.success('Dossier archivé');
      loadDossiers();
    } catch (err: any) {
      toast.error('Erreur lors de l\'archivage');
    }
  };

  const filteredDossiers = dossiers.filter(d => {
    const matchesStatut = !filterStatut || d.statut === filterStatut;
    const matchesSearch = !searchTerm || 
      d.etudiant?.nom?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      d.etudiant?.prenom?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      d.type?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatut && matchesSearch;
  });

  if (loading) {
    return (
      <div style={{ padding: 40, textAlign: 'center' }}>
        <div className="animate-spin" style={{ width: 60, height: 60, border: '4px solid #f3f3f3', borderTop: '4px solid #1a5276', borderRadius: '50%', margin: '0 auto 20px' }} />
        <h3 style={{ color: '#64748b' }}>Chargement...</h3>
      </div>
    );
  }

  return (
    <div style={{ padding: 32 }}>
      {/* Header */}
      <div style={{ marginBottom: 32, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: 28, fontWeight: 800, color: '#1e293b', margin: '0 0 8px' }}>
            Dossiers Étudiants
          </h1>
          <p style={{ color: '#64748b', fontSize: 14 }}>
            Gestion des documents administratifs et archives
          </p>
        </div>
        <button
          onClick={() => window.location.href = '/secretariat/dossiers/nouveau'}
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
            gap: 8,
          }}
        >
          <Plus size={18} />
          Nouveau dossier
        </button>
      </div>

      {/* Filtres */}
      <div style={{ display: 'flex', gap: 16, marginBottom: 24, flexWrap: 'wrap' }}>
        <div style={{ position: 'relative', flex: 1, minWidth: 200 }}>
          <Search size={20} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
          <input
            type="text"
            placeholder="Rechercher un étudiant ou type de dossier..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              width: '100%',
              padding: '10px 12px 10px 40px',
              border: '1px solid #e2e8f0',
              borderRadius: 8,
              fontSize: 14,
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
            background: 'white',
          }}
        >
          <option value="">Tous les statuts</option>
          <option value="actif">Actif</option>
          <option value="en_attente">En attente</option>
          <option value="archive">Archivé</option>
        </select>
      </div>

      {/* Liste des dossiers */}
      <div style={{ background: 'white', borderRadius: 12, boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
              <th style={{ padding: 16, textAlign: 'left', fontSize: 13, fontWeight: 600, color: '#64748b' }}>Étudiant</th>
              <th style={{ padding: 16, textAlign: 'left', fontSize: 13, fontWeight: 600, color: '#64748b' }}>Type</th>
              <th style={{ padding: 16, textAlign: 'left', fontSize: 13, fontWeight: 600, color: '#64748b' }}>Documents</th>
              <th style={{ padding: 16, textAlign: 'left', fontSize: 13, fontWeight: 600, color: '#64748b' }}>Statut</th>
              <th style={{ padding: 16, textAlign: 'center', fontSize: 13, fontWeight: 600, color: '#64748b' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredDossiers.map((dossier) => (
              <tr key={dossier.id} style={{ borderBottom: '1px solid #e2e8f0' }}>
                <td style={{ padding: 16 }}>
                  <div style={{ fontWeight: 600, color: '#1e293b' }}>
                    {dossier.etudiant?.prenom} {dossier.etudiant?.nom}
                  </div>
                  <div style={{ fontSize: 12, color: '#64748b' }}>
                    {dossier.etudiant?.matricule}
                  </div>
                </td>
                <td style={{ padding: 16, color: '#475569' }}>
                  {dossier.type}
                </td>
                <td style={{ padding: 16 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <FileText size={16} color="#64748b" />
                    <span style={{ color: '#475569' }}>
                      {dossier.documents?.length || 0} document(s)
                    </span>
                  </div>
                </td>
                <td style={{ padding: 16 }}>
                  <span style={{
                    padding: '4px 12px',
                    borderRadius: 12,
                    fontSize: 12,
                    fontWeight: 500,
                    background: dossier.statut === 'actif' ? '#dcfce7' : 
                               dossier.statut === 'en_attente' ? '#fef3c7' : '#f3f4f6',
                    color: dossier.statut === 'actif' ? '#166534' :
                           dossier.statut === 'en_attente' ? '#92400e' : '#6b7280',
                  }}>
                    {dossier.statut}
                  </span>
                </td>
                <td style={{ padding: 16, textAlign: 'center' }}>
                  <div style={{ display: 'flex', gap: 8, justifyContent: 'center' }}>
                    <button
                      onClick={() => window.location.href = `/secretariat/dossiers/${dossier.id}`}
                      style={{
                        padding: '6px 12px',
                        background: '#f1f5f9',
                        color: '#475569',
                        border: 'none',
                        borderRadius: 6,
                        cursor: 'pointer',
                        fontSize: 12,
                      }}
                    >
                      Voir
                    </button>
                    {!dossier.archived && (
                      <button
                        onClick={() => handleArchiver(dossier.id)}
                        style={{
                          padding: '6px 12px',
                          background: '#fef3c7',
                          color: '#92400e',
                          border: 'none',
                          borderRadius: 6,
                          cursor: 'pointer',
                          fontSize: 12,
                        }}
                      >
                        Archiver
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
            {filteredDossiers.length === 0 && (
              <tr>
                <td colSpan={5} style={{ padding: 40, textAlign: 'center', color: '#64748b' }}>
                  Aucun dossier trouvé
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default DossiersPage;

// Made with Bob
