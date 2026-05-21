import React, { useState, useEffect } from 'react';
import { useAuthStore } from '../../store/authStore';
import { api } from '../../api/client';
import toast from 'react-hot-toast';
import {
  ClipboardList, CheckCircle, XCircle, AlertCircle, Search, Filter, Calendar
} from 'lucide-react';

interface Absence {
  id: string;
  etudiantId: string;
  seanceId: string;
  dateAbsence: string;
  motif: string;
  justificatifUrl?: string;
  estJustifie: boolean;
  statut: string;
  etudiant?: {
    nom: string;
    prenom: string;
    matricule?: string;
  };
}

export const AbsencesPage: React.FC = () => {
  const { user, tenant } = useAuthStore();
  const [loading, setLoading] = useState(true);
  const [absences, setAbsences] = useState<Absence[]>([]);
  const [filterStatut, setFilterStatut] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadAbsences();
  }, [user, tenant, filterStatut]);

  const loadAbsences = async () => {
    setLoading(true);
    try {
      const tid = tenant?.id || user?.tenantId;
      if (!tid) return;

      // Récupérer les présences avec statut absent
      const response = await api.get(`/academic/${tid}/presences`, {
        params: { statut: 'absent' }
      });
      setAbsences(response.data || []);
    } catch (err: any) {
      toast.error('Erreur lors du chargement des absences');
    } finally {
      setLoading(false);
    }
  };

  const handleJustifier = async (absenceId: string, accepte: boolean) => {
    try {
      const tid = tenant?.id || user?.tenantId;
      await api.post(`/surveillance/${tid}/valider-justification`, {
        presenceId: absenceId,
        accepte,
      });
      toast.success(accepte ? 'Absence justifiée' : 'Justification refusée');
      loadAbsences();
    } catch (err: any) {
      toast.error('Erreur lors de la validation');
    }
  };

  const filteredAbsences = absences.filter(a => {
    const matchesStatut = !filterStatut || a.estJustifie === (filterStatut === 'justifie');
    const matchesSearch = !searchTerm || 
      a.etudiant?.nom?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.etudiant?.prenom?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.motif?.toLowerCase().includes(searchTerm.toLowerCase());
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
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontSize: 28, fontWeight: 800, color: '#1e293b', margin: '0 0 8px' }}>
          Suivi des Absences
        </h1>
        <p style={{ color: '#64748b', fontSize: 14 }}>
          Gestion des absences et justificatifs des étudiants
        </p>
      </div>

      {/* Filtres */}
      <div style={{ display: 'flex', gap: 16, marginBottom: 24, flexWrap: 'wrap' }}>
        <div style={{ position: 'relative', flex: 1, minWidth: 200 }}>
          <Search size={20} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
          <input
            type="text"
            placeholder="Rechercher un étudiant..."
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
          <option value="non_justifie">Non justifiées</option>
          <option value="justifie">Justifiées</option>
        </select>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 16, marginBottom: 24 }}>
        <StatCard
          icon={<ClipboardList size={20} color="#1a5276" />}
          label="Total absences"
          value={absences.length}
        />
        <StatCard
          icon={<AlertCircle size={20} color="#f59e0b" />}
          label="Non justifiées"
          value={absences.filter(a => !a.estJustifie).length}
        />
        <StatCard
          icon={<CheckCircle size={20} color="#059669" />}
          label="Justifiées"
          value={absences.filter(a => a.estJustifie).length}
        />
      </div>

      {/* Liste des absences */}
      <div style={{ background: 'white', borderRadius: 12, boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
              <th style={{ padding: 16, textAlign: 'left', fontSize: 13, fontWeight: 600, color: '#64748b' }}>Étudiant</th>
              <th style={{ padding: 16, textAlign: 'left', fontSize: 13, fontWeight: 600, color: '#64748b' }}>Date</th>
              <th style={{ padding: 16, textAlign: 'left', fontSize: 13, fontWeight: 600, color: '#64748b' }}>Motif</th>
              <th style={{ padding: 16, textAlign: 'left', fontSize: 13, fontWeight: 600, color: '#64748b' }}>Statut</th>
              <th style={{ padding: 16, textAlign: 'center', fontSize: 13, fontWeight: 600, color: '#64748b' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredAbsences.map((absence) => (
              <tr key={absence.id} style={{ borderBottom: '1px solid #e2e8f0' }}>
                <td style={{ padding: 16 }}>
                  <div style={{ fontWeight: 600, color: '#1e293b' }}>
                    {absence.etudiant?.prenom} {absence.etudiant?.nom}
                  </div>
                  <div style={{ fontSize: 12, color: '#64748b' }}>
                    {absence.etudiant?.matricule}
                  </div>
                </td>
                <td style={{ padding: 16, color: '#475569' }}>
                  {new Date(absence.dateAbsence).toLocaleDateString('fr-FR')}
                </td>
                <td style={{ padding: 16, color: '#475569' }}>
                  {absence.motif || '-'}
                </td>
                <td style={{ padding: 16 }}>
                  <span style={{
                    padding: '4px 12px',
                    borderRadius: 12,
                    fontSize: 12,
                    fontWeight: 500,
                    background: absence.estJustifie ? '#dcfce7' : '#fee2e2',
                    color: absence.estJustifie ? '#166534' : '#991b1b',
                  }}>
                    {absence.estJustifie ? 'Justifiée' : 'Non justifiée'}
                  </span>
                </td>
                <td style={{ padding: 16, textAlign: 'center' }}>
                  {!absence.estJustifie && (
                    <div style={{ display: 'flex', gap: 8, justifyContent: 'center' }}>
                      <button
                        onClick={() => handleJustifier(absence.id, true)}
                        style={{
                          padding: '6px 12px',
                          background: '#059669',
                          color: 'white',
                          border: 'none',
                          borderRadius: 6,
                          cursor: 'pointer',
                          fontSize: 12,
                          display: 'flex',
                          alignItems: 'center',
                          gap: 4,
                        }}
                      >
                        <CheckCircle size={14} />
                        Valider
                      </button>
                      <button
                        onClick={() => handleJustifier(absence.id, false)}
                        style={{
                          padding: '6px 12px',
                          background: '#dc2626',
                          color: 'white',
                          border: 'none',
                          borderRadius: 6,
                          cursor: 'pointer',
                          fontSize: 12,
                          display: 'flex',
                          alignItems: 'center',
                          gap: 4,
                        }}
                      >
                        <XCircle size={14} />
                        Refuser
                      </button>
                    </div>
                  )}
                </td>
              </tr>
            ))}
            {filteredAbsences.length === 0 && (
              <tr>
                <td colSpan={5} style={{ padding: 40, textAlign: 'center', color: '#64748b' }}>
                  Aucune absence trouvée
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const StatCard: React.FC<{ icon: React.ReactNode; label: string; value: number }> = ({ icon, label, value }) => (
  <div style={{ background: 'white', padding: 16, borderRadius: 12, boxShadow: '0 1px 3px rgba(0,0,0,0.1)', display: 'flex', alignItems: 'center', gap: 12 }}>
    <div style={{ width: 40, height: 40, borderRadius: 8, background: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      {icon}
    </div>
    <div>
      <p style={{ margin: 0, fontSize: 24, fontWeight: 700, color: '#1e293b' }}>{value}</p>
      <p style={{ margin: 0, fontSize: 12, color: '#64748b' }}>{label}</p>
    </div>
  </div>
);

export default AbsencesPage;

// Made with Bob
