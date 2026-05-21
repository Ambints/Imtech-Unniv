import React, { useState, useEffect } from 'react';
import { api } from '../../api/client';
import toast from 'react-hot-toast';
import { Star, Plus, Search, Eye, Edit2, Trash2, X, Save, Calendar, User, FileText } from 'lucide-react';

interface Evaluation {
  id: string;
  utilisateurId: string;
  evaluateurId: string;
  dateEvaluation: string;
  periode: string;
  noteGlobale?: number;
  competencesTechniques?: number;
  competencesRelationnelles?: number;
  assiduite?: number;
  initiative?: number;
  commentaires?: string;
  objectifsAtteints?: string;
  axesAmelioration?: string;
  statut: string;
  utilisateurNom?: string;
  utilisateurPrenom?: string;
  evaluateurNom?: string;
  evaluateurPrenom?: string;
}

export const EvaluationsPage: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [evaluations, setEvaluations] = useState<Evaluation[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [selectedEval, setSelectedEval] = useState<Evaluation | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatut, setFilterStatut] = useState('');

  useEffect(() => {
    loadData();
  }, [filterStatut]);

  const loadData = async () => {
    setLoading(true);
    try {
      const params: any = {};
      if (filterStatut) params.statut = filterStatut;

      const response = await api.get('/rh/evaluations', { params });
      setEvaluations(response.data || []);
    } catch (error: any) {
      toast.error('Erreur lors du chargement des évaluations');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const filteredEvaluations = evaluations.filter(e => {
    if (!searchTerm) return true;
    const search = searchTerm.toLowerCase();
    return (
      e.utilisateurNom?.toLowerCase().includes(search) ||
      e.utilisateurPrenom?.toLowerCase().includes(search) ||
      e.periode?.toLowerCase().includes(search)
    );
  });

  const stats = {
    total: evaluations.length,
    enCours: evaluations.filter(e => e.statut === 'en_cours').length,
    terminees: evaluations.filter(e => e.statut === 'terminee').length,
    moyenneGlobale: evaluations.length > 0
      ? (evaluations.reduce((sum, e) => sum + (e.noteGlobale || 0), 0) / evaluations.filter(e => e.noteGlobale).length).toFixed(1)
      : '0'
  };

  const getStatutColor = (statut: string) => {
    const colors: Record<string, string> = {
      en_cours: '#f59e0b',
      terminee: '#10b981',
      planifiee: '#3b82f6'
    };
    return colors[statut] || '#64748b';
  };

  const getStatutLabel = (statut: string) => {
    const labels: Record<string, string> = {
      en_cours: 'En cours',
      terminee: 'Terminée',
      planifiee: 'Planifiée'
    };
    return labels[statut] || statut;
  };

  const renderStars = (note?: number) => {
    if (!note) return <span style={{ color: '#cbd5e1' }}>Non évalué</span>;
    return (
      <div style={{ display: 'flex', gap: 4 }}>
        {[1, 2, 3, 4, 5].map(i => (
          <Star
            key={i}
            size={16}
            fill={i <= note ? '#fbbf24' : 'none'}
            stroke={i <= note ? '#fbbf24' : '#cbd5e1'}
          />
        ))}
        <span style={{ marginLeft: 8, fontWeight: 600, color: '#1e293b' }}>{note}/5</span>
      </div>
    );
  };

  if (loading) {
    return (
      <div style={{ padding: 32, textAlign: 'center' }}>
        <div style={{ fontSize: 18, color: '#64748b' }}>Chargement...</div>
      </div>
    );
  }

  return (
    <div style={{ padding: 32 }}>
      {/* Header */}
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontSize: 28, fontWeight: 800, color: '#1e293b', margin: '0 0 8px', display: 'flex', alignItems: 'center', gap: 12 }}>
          <Star size={32} /> Évaluations du Personnel
        </h1>
        <p style={{ color: '#64748b', fontSize: 14 }}>
          Gestion des évaluations annuelles et suivi des performances
        </p>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, marginBottom: 24 }}>
        <div style={{ background: '#fff', borderRadius: 12, padding: 20, boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
          <div style={{ fontSize: 12, color: '#64748b', marginBottom: 8 }}>Total Évaluations</div>
          <div style={{ fontSize: 28, fontWeight: 800, color: '#1e293b' }}>{stats.total}</div>
        </div>
        <div style={{ background: '#fff', borderRadius: 12, padding: 20, boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
          <div style={{ fontSize: 12, color: '#64748b', marginBottom: 8 }}>En Cours</div>
          <div style={{ fontSize: 28, fontWeight: 800, color: '#f59e0b' }}>{stats.enCours}</div>
        </div>
        <div style={{ background: '#fff', borderRadius: 12, padding: 20, boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
          <div style={{ fontSize: 12, color: '#64748b', marginBottom: 8 }}>Terminées</div>
          <div style={{ fontSize: 28, fontWeight: 800, color: '#10b981' }}>{stats.terminees}</div>
        </div>
        <div style={{ background: '#fff', borderRadius: 12, padding: 20, boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
          <div style={{ fontSize: 12, color: '#64748b', marginBottom: 8 }}>Moyenne Globale</div>
          <div style={{ fontSize: 28, fontWeight: 800, color: '#8b5cf6' }}>{stats.moyenneGlobale}/5</div>
        </div>
      </div>

      {/* Filters & Actions */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 24, flexWrap: 'wrap' }}>
        <div style={{ flex: 1, minWidth: 250, position: 'relative' }}>
          <Search size={18} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
          <input
            type="text"
            placeholder="Rechercher..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ width: '100%', padding: '11px 11px 11px 40px', border: '2px solid #e5e7eb', borderRadius: 9, fontSize: 14 }}
          />
        </div>
        <select
          value={filterStatut}
          onChange={(e) => setFilterStatut(e.target.value)}
          style={{ padding: '11px 14px', border: '2px solid #e5e7eb', borderRadius: 9, fontSize: 14 }}
        >
          <option value="">Tous les statuts</option>
          <option value="planifiee">Planifiée</option>
          <option value="en_cours">En cours</option>
          <option value="terminee">Terminée</option>
        </select>
        <button
          onClick={() => setShowForm(true)}
          style={{
            padding: '11px 20px',
            background: 'linear-gradient(135deg, #148f77, #1a5276)',
            color: '#fff',
            border: 'none',
            borderRadius: 9,
            fontSize: 14,
            fontWeight: 700,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: 8
          }}
        >
          <Plus size={18} /> Nouvelle Évaluation
        </button>
      </div>

      {/* Table */}
      <div style={{ background: '#fff', borderRadius: 12, boxShadow: '0 1px 3px rgba(0,0,0,0.1)', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead style={{ background: '#f8fafc', borderBottom: '2px solid #e5e7eb' }}>
            <tr>
              <th style={{ padding: '14px 16px', textAlign: 'left', fontSize: 12, fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>
                Employé
              </th>
              <th style={{ padding: '14px 16px', textAlign: 'left', fontSize: 12, fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>
                Période
              </th>
              <th style={{ padding: '14px 16px', textAlign: 'left', fontSize: 12, fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>
                Date
              </th>
              <th style={{ padding: '14px 16px', textAlign: 'left', fontSize: 12, fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>
                Note Globale
              </th>
              <th style={{ padding: '14px 16px', textAlign: 'center', fontSize: 12, fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>
                Statut
              </th>
              <th style={{ padding: '14px 16px', textAlign: 'right', fontSize: 12, fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {filteredEvaluations.length === 0 ? (
              <tr>
                <td colSpan={6} style={{ padding: 40, textAlign: 'center', color: '#94a3b8' }}>
                  Aucune évaluation trouvée
                </td>
              </tr>
            ) : (
              filteredEvaluations.map((e) => (
                <tr key={e.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                  <td style={{ padding: '14px 16px' }}>
                    <div style={{ fontWeight: 600, color: '#1e293b' }}>
                      {e.utilisateurPrenom} {e.utilisateurNom}
                    </div>
                    <div style={{ fontSize: 12, color: '#64748b', marginTop: 2 }}>
                      Évaluateur: {e.evaluateurPrenom} {e.evaluateurNom}
                    </div>
                  </td>
                  <td style={{ padding: '14px 16px', color: '#64748b' }}>
                    {e.periode}
                  </td>
                  <td style={{ padding: '14px 16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#64748b' }}>
                      <Calendar size={16} />
                      {new Date(e.dateEvaluation).toLocaleDateString('fr-FR')}
                    </div>
                  </td>
                  <td style={{ padding: '14px 16px' }}>
                    {renderStars(e.noteGlobale)}
                  </td>
                  <td style={{ padding: '14px 16px', textAlign: 'center' }}>
                    <span style={{
                      padding: '4px 12px',
                      borderRadius: 20,
                      fontSize: 12,
                      fontWeight: 600,
                      background: `${getStatutColor(e.statut)}15`,
                      color: getStatutColor(e.statut)
                    }}>
                      {getStatutLabel(e.statut)}
                    </span>
                  </td>
                  <td style={{ padding: '14px 16px', textAlign: 'right' }}>
                    <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                      <button
                        onClick={() => { setSelectedEval(e); setShowDetails(true); }}
                        style={{
                          padding: '8px 12px',
                          background: '#eff6ff',
                          color: '#3b82f6',
                          border: 'none',
                          borderRadius: 8,
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: 6
                        }}
                      >
                        <Eye size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Info */}
      <div style={{ marginTop: 24, padding: 16, background: '#fef3c7', borderRadius: 12, border: '1px solid #fde68a' }}>
        <div style={{ display: 'flex', alignItems: 'start', gap: 12 }}>
          <FileText size={20} style={{ color: '#f59e0b', marginTop: 2 }} />
          <div>
            <div style={{ fontWeight: 600, color: '#92400e', marginBottom: 4 }}>
              Évaluations annuelles
            </div>
            <div style={{ fontSize: 14, color: '#92400e' }}>
              Les évaluations permettent de suivre les performances du personnel et d'identifier les axes d'amélioration.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EvaluationsPage;

// Made with Bob