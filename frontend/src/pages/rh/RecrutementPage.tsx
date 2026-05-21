import React, { useState, useEffect } from 'react';
import { api } from '../../api/client';
import toast from 'react-hot-toast';
import { Target, Plus, Search, Eye, Edit2, Trash2, X, Save, Calendar, Users, Briefcase, MapPin } from 'lucide-react';

interface Recrutement {
  id: string;
  poste: string;
  typeContrat: string;
  departementId?: string;
  nbPostes: number;
  dateCloture: string;
  statut: string;
  description?: string;
  departementNom?: string;
  createdAt: string;
}

export const RecrutementPage: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [recrutements, setRecrutements] = useState<Recrutement[]>([]);
  const [showForm, setShowForm] = useState(false);
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

      const response = await api.get('/rh/recrutements', { params });
      setRecrutements(response.data || []);
    } catch (error: any) {
      toast.error('Erreur lors du chargement des recrutements');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const filteredRecrutements = recrutements.filter(r => {
    if (!searchTerm) return true;
    const search = searchTerm.toLowerCase();
    return (
      r.poste.toLowerCase().includes(search) ||
      r.typeContrat.toLowerCase().includes(search) ||
      r.departementNom?.toLowerCase().includes(search)
    );
  });

  const stats = {
    total: recrutements.length,
    ouverts: recrutements.filter(r => r.statut === 'ouvert').length,
    clotures: recrutements.filter(r => r.statut === 'cloture').length,
    postesTotal: recrutements.reduce((sum, r) => sum + r.nbPostes, 0)
  };

  const getStatutColor = (statut: string) => {
    const colors: Record<string, string> = {
      ouvert: '#10b981',
      cloture: '#64748b',
      pourvus: '#3b82f6'
    };
    return colors[statut] || '#64748b';
  };

  const getStatutLabel = (statut: string) => {
    const labels: Record<string, string> = {
      ouvert: 'Ouvert',
      cloture: 'Clôturé',
      pourvus: 'Pourvus'
    };
    return labels[statut] || statut;
  };

  const getTypeContratColor = (type: string) => {
    const colors: Record<string, string> = {
      CDI: '#10b981',
      CDD: '#3b82f6',
      Vacation: '#f59e0b',
      Stage: '#8b5cf6'
    };
    return colors[type] || '#64748b';
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
          <Target size={32} /> Recrutement
        </h1>
        <p style={{ color: '#64748b', fontSize: 14 }}>
          Gestion des processus de recrutement et offres d'emploi
        </p>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, marginBottom: 24 }}>
        <div style={{ background: '#fff', borderRadius: 12, padding: 20, boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
          <div style={{ fontSize: 12, color: '#64748b', marginBottom: 8 }}>Total Recrutements</div>
          <div style={{ fontSize: 28, fontWeight: 800, color: '#1e293b' }}>{stats.total}</div>
        </div>
        <div style={{ background: '#fff', borderRadius: 12, padding: 20, boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
          <div style={{ fontSize: 12, color: '#64748b', marginBottom: 8 }}>Ouverts</div>
          <div style={{ fontSize: 28, fontWeight: 800, color: '#10b981' }}>{stats.ouverts}</div>
        </div>
        <div style={{ background: '#fff', borderRadius: 12, padding: 20, boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
          <div style={{ fontSize: 12, color: '#64748b', marginBottom: 8 }}>Clôturés</div>
          <div style={{ fontSize: 28, fontWeight: 800, color: '#64748b' }}>{stats.clotures}</div>
        </div>
        <div style={{ background: '#fff', borderRadius: 12, padding: 20, boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
          <div style={{ fontSize: 12, color: '#64748b', marginBottom: 8 }}>Postes à Pourvoir</div>
          <div style={{ fontSize: 28, fontWeight: 800, color: '#3b82f6' }}>{stats.postesTotal}</div>
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
          <option value="ouvert">Ouvert</option>
          <option value="cloture">Clôturé</option>
          <option value="pourvus">Pourvus</option>
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
          <Plus size={18} /> Nouveau Recrutement
        </button>
      </div>

      {/* Cards Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: 20 }}>
        {filteredRecrutements.length === 0 ? (
          <div style={{ gridColumn: '1 / -1', padding: 40, textAlign: 'center', color: '#94a3b8', background: '#fff', borderRadius: 12 }}>
            Aucun recrutement trouvé
          </div>
        ) : (
          filteredRecrutements.map((r) => (
            <div
              key={r.id}
              style={{
                background: '#fff',
                borderRadius: 12,
                padding: 24,
                boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                border: '2px solid #f1f5f9',
                transition: 'all 0.2s',
                cursor: 'pointer'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = '#148f77';
                e.currentTarget.style.boxShadow = '0 4px 12px rgba(20,143,119,0.15)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = '#f1f5f9';
                e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.1)';
              }}
            >
              {/* Header */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: 16 }}>
                <div style={{ flex: 1 }}>
                  <h3 style={{ fontSize: 18, fontWeight: 700, color: '#1e293b', margin: '0 0 8px' }}>
                    {r.poste}
                  </h3>
                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                    <span style={{
                      padding: '4px 12px',
                      borderRadius: 20,
                      fontSize: 12,
                      fontWeight: 600,
                      background: `${getTypeContratColor(r.typeContrat)}15`,
                      color: getTypeContratColor(r.typeContrat)
                    }}>
                      {r.typeContrat}
                    </span>
                    <span style={{
                      padding: '4px 12px',
                      borderRadius: 20,
                      fontSize: 12,
                      fontWeight: 600,
                      background: `${getStatutColor(r.statut)}15`,
                      color: getStatutColor(r.statut)
                    }}>
                      {getStatutLabel(r.statut)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Info */}
              <div style={{ marginBottom: 16, display: 'flex', flexDirection: 'column', gap: 12 }}>
                {r.departementNom && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#64748b', fontSize: 14 }}>
                    <MapPin size={16} />
                    {r.departementNom}
                  </div>
                )}
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#64748b', fontSize: 14 }}>
                  <Users size={16} />
                  {r.nbPostes} poste{r.nbPostes > 1 ? 's' : ''} à pourvoir
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#64748b', fontSize: 14 }}>
                  <Calendar size={16} />
                  Clôture: {new Date(r.dateCloture).toLocaleDateString('fr-FR')}
                </div>
              </div>

              {/* Description */}
              {r.description && (
                <div style={{
                  padding: 12,
                  background: '#f8fafc',
                  borderRadius: 8,
                  fontSize: 13,
                  color: '#64748b',
                  marginBottom: 16,
                  lineHeight: 1.5
                }}>
                  {r.description.length > 100 ? `${r.description.substring(0, 100)}...` : r.description}
                </div>
              )}

              {/* Actions */}
              <div style={{ display: 'flex', gap: 8, paddingTop: 16, borderTop: '1px solid #f1f5f9' }}>
                <button
                  style={{
                    flex: 1,
                    padding: '8px 16px',
                    background: '#eff6ff',
                    color: '#3b82f6',
                    border: 'none',
                    borderRadius: 8,
                    fontSize: 13,
                    fontWeight: 600,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 6
                  }}
                >
                  <Eye size={16} /> Détails
                </button>
                <button
                  style={{
                    flex: 1,
                    padding: '8px 16px',
                    background: '#f0fdf4',
                    color: '#10b981',
                    border: 'none',
                    borderRadius: 8,
                    fontSize: 13,
                    fontWeight: 600,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 6
                  }}
                >
                  <Edit2 size={16} /> Modifier
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Info */}
      <div style={{ marginTop: 24, padding: 16, background: '#f0f9ff', borderRadius: 12, border: '1px solid #bae6fd' }}>
        <div style={{ display: 'flex', alignItems: 'start', gap: 12 }}>
          <Briefcase size={20} style={{ color: '#0284c7', marginTop: 2 }} />
          <div>
            <div style={{ fontWeight: 600, color: '#075985', marginBottom: 4 }}>
              Processus de recrutement
            </div>
            <div style={{ fontSize: 14, color: '#075985' }}>
              Gérez vos offres d'emploi, suivez les candidatures et organisez les entretiens depuis cette interface.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RecrutementPage;

// Made with Bob