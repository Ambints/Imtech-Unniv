import React, { useState, useEffect } from 'react';
import { api } from '../../api/client';
import { useAuthStore } from '../../store/authStore';
import toast from 'react-hot-toast';
import {
  Briefcase, CheckCircle, XCircle, Eye, Calendar, User, FileText,
  Building, Award, Clock, Search, Filter, Plus, Download, X
} from 'lucide-react';

interface StageMemoire {
  id: string;
  etudiantId: string;
  parcoursId: string;
  anneeAcademiqueId: string;
  type: string;
  titre: string;
  description?: string;
  entrepriseOrganisme?: string;
  maitreStage?: string;
  encadrantId?: string;
  dateDebut?: Date;
  dateFin?: Date;
  dateSoutenance?: Date;
  lieuSoutenance?: string;
  noteFinale?: number;
  mention?: string;
  statut: string;
  validePar?: string;
  dateValidation?: Date;
  etudiant?: {
    id: string;
    nom: string;
    prenom: string;
    matricule?: string;
  };
  encadrant?: {
    id: string;
    nom: string;
    prenom: string;
  };
  parcours?: {
    id: string;
    code: string;
    nom: string;
  };
}

export const StagesPage: React.FC = () => {
  const { user, tenant } = useAuthStore();
  const tid = tenant?.id || '';
  
  const [loading, setLoading] = useState(true);
  const [stages, setStages] = useState<StageMemoire[]>([]);
  const [filterType, setFilterType] = useState<string>('tous');
  const [filterStatut, setFilterStatut] = useState<string>('tous');
  const [selectedStage, setSelectedStage] = useState<StageMemoire | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  useEffect(() => {
    if (tid) loadStages();
  }, [tid]);

  const loadStages = async () => {
    setLoading(true);
    try {
      const response = await api.get(`/pedagogique/${tid}/stages-memoires`);
      setStages(response.data || []);
    } catch (err: any) {
      // Fallback data
      setStages([
        {
          id: '1',
          etudiantId: 'et1',
          parcoursId: 'p1',
          anneeAcademiqueId: '2024',
          type: 'stage',
          titre: 'Développement d\'une application de gestion des notes',
          description: 'Stage de fin d\'études au sein de la Direction des Systèmes d\'Information',
          entrepriseOrganisme: 'Tech Solutions CI',
          maitreStage: 'M. KONÉ Amadou',
          encadrantId: 'ens1',
          dateDebut: new Date('2024-03-01'),
          dateFin: new Date('2024-06-30'),
          statut: 'en_cours',
          etudiant: { id: 'et1', nom: 'KOUASSI', prenom: 'Marie', matricule: 'ET2021001' },
          encadrant: { id: 'ens1', nom: 'DUPONT', prenom: 'Jean' },
          parcours: { id: 'p1', code: 'INFO-L3', nom: 'Licence Informatique' }
        },
        {
          id: '2',
          etudiantId: 'et2',
          parcoursId: 'p1',
          anneeAcademiqueId: '2024',
          type: 'memoire',
          titre: 'Intelligence Artificielle dans l\'éducation',
          description: 'Étude sur l\'impact des outils IA dans l\'apprentissage',
          encadrantId: 'ens2',
          dateSoutenance: new Date('2024-07-15'),
          lieuSoutenance: 'Amphithéâtre A',
          noteFinale: 15.5,
          mention: 'Bien',
          statut: 'termine',
          etudiant: { id: 'et2', nom: 'YAO', prenom: 'Koffi', matricule: 'ET2021002' },
          encadrant: { id: 'ens2', nom: 'MARTIN', prenom: 'Sophie' },
          parcours: { id: 'p1', code: 'INFO-L3', nom: 'Licence Informatique' }
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleValider = async (id: string) => {
    try {
      await api.post(`/pedagogique/${tid}/stages-memoires/${id}/valider`, {
        validePar: user?.id
      });
      toast.success('Stage/Mémoire validé');
      loadStages();
    } catch (err: any) {
      toast.error('Erreur lors de la validation');
    }
  };

  const getTypeBadge = (type: string) => {
    const styles: Record<string, { bg: string; color: string; icon: React.ReactNode }> = {
      stage: { bg: '#dbeafe', color: '#1e40af', icon: <Briefcase size={12} /> },
      memoire: { bg: '#fce7f3', color: '#be185d', icon: <FileText size={12} /> },
      projet: { bg: '#d1fae5', color: '#065f46', icon: <Award size={12} /> }
    };
    const style = styles[type] || styles.stage;
    return (
      <span style={{
        padding: '4px 10px',
        borderRadius: 12,
        fontSize: 11,
        fontWeight: 600,
        background: style.bg,
        color: style.color,
        display: 'inline-flex',
        alignItems: 'center',
        gap: 4,
        textTransform: 'uppercase'
      }}>
        {style.icon} {type}
      </span>
    );
  };

  const getStatutBadge = (statut: string) => {
    const styles: Record<string, { bg: string; color: string; label: string }> = {
      en_cours: { bg: '#dbeafe', color: '#1e40af', label: 'En cours' },
      termine: { bg: '#fef3c7', color: '#92400e', label: 'Terminé' },
      valide: { bg: '#d1fae5', color: '#065f46', label: 'Validé' },
      abandonne: { bg: '#fee2e2', color: '#991b1b', label: 'Abandonné' }
    };
    const style = styles[statut] || styles.en_cours;
    return (
      <span style={{
        padding: '6px 12px',
        borderRadius: 20,
        fontSize: 12,
        fontWeight: 600,
        background: style.bg,
        color: style.color
      }}>
        {style.label}
      </span>
    );
  };

  const filteredStages = stages.filter(s => {
    if (filterType !== 'tous' && s.type !== filterType) return false;
    if (filterStatut !== 'tous' && s.statut !== filterStatut) return false;
    return true;
  });

  const stats = {
    total: stages.length,
    enCours: stages.filter(s => s.statut === 'en_cours').length,
    termines: stages.filter(s => s.statut === 'termine').length,
    valides: stages.filter(s => s.statut === 'valide').length
  };

  return (
    <div style={{ padding: 32 }}>
      {/* Header */}
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontSize: 28, fontWeight: 800, color: '#1e293b', margin: '0 0 8px', display: 'flex', alignItems: 'center', gap: 12 }}>
          <Briefcase size={32} /> Stages & Mémoires
        </h1>
        <p style={{ color: '#64748b', fontSize: 14 }}>
          Suivi des stages, mémoires et projets de fin d'études
        </p>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 24 }}>
        <div style={{ background: '#fff', borderRadius: 12, padding: 20, boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
          <div style={{ fontSize: 12, color: '#64748b', marginBottom: 4 }}>Total</div>
          <div style={{ fontSize: 28, fontWeight: 800, color: '#1e293b' }}>{stats.total}</div>
        </div>
        <div style={{ background: '#dbeafe', borderRadius: 12, padding: 20 }}>
          <div style={{ fontSize: 12, color: '#1e40af', marginBottom: 4 }}>En cours</div>
          <div style={{ fontSize: 28, fontWeight: 800, color: '#1e40af' }}>{stats.enCours}</div>
        </div>
        <div style={{ background: '#fef3c7', borderRadius: 12, padding: 20 }}>
          <div style={{ fontSize: 12, color: '#92400e', marginBottom: 4 }}>Terminés</div>
          <div style={{ fontSize: 28, fontWeight: 800, color: '#92400e' }}>{stats.termines}</div>
        </div>
        <div style={{ background: '#d1fae5', borderRadius: 12, padding: 20 }}>
          <div style={{ fontSize: 12, color: '#065f46', marginBottom: 4 }}>Validés</div>
          <div style={{ fontSize: 28, fontWeight: 800, color: '#065f46' }}>{stats.valides}</div>
        </div>
      </div>

      {/* Filtres */}
      <div style={{ marginBottom: 24, display: 'flex', gap: 12, flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', gap: 8 }}>
          {['tous', 'stage', 'memoire', 'projet'].map((type) => (
            <button
              key={type}
              onClick={() => setFilterType(type)}
              style={{
                padding: '8px 16px',
                background: filterType === type ? '#1a5276' : '#fff',
                color: filterType === type ? '#fff' : '#64748b',
                border: '1px solid ' + (filterType === type ? '#1a5276' : '#e5e7eb'),
                borderRadius: 8,
                fontSize: 13,
                fontWeight: 600,
                cursor: 'pointer',
                textTransform: 'capitalize'
              }}
            >
              {type === 'tous' ? 'Tous' : type + 's'}
            </button>
          ))}
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          {['tous', 'en_cours', 'termine', 'valide'].map((statut) => (
            <button
              key={statut}
              onClick={() => setFilterStatut(statut)}
              style={{
                padding: '8px 16px',
                background: filterStatut === statut ? '#148f77' : '#fff',
                color: filterStatut === statut ? '#fff' : '#64748b',
                border: '1px solid ' + (filterStatut === statut ? '#148f77' : '#e5e7eb'),
                borderRadius: 8,
                fontSize: 13,
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              {statut === 'tous' ? 'Tous statuts' : statut === 'en_cours' ? 'En cours' : statut === 'termine' ? 'Terminés' : 'Validés'}
            </button>
          ))}
        </div>
      </div>

      {/* Liste des stages */}
      <div style={{ display: 'grid', gap: 16 }}>
        {filteredStages.length === 0 ? (
          <div style={{ background: '#fff', borderRadius: 14, padding: 40, textAlign: 'center' }}>
            <Briefcase size={48} color="#cbd5e1" />
            <p style={{ color: '#64748b', marginTop: 12 }}>Aucun stage/mémoire trouvé</p>
          </div>
        ) : (
          filteredStages.map((stage) => (
            <div
              key={stage.id}
              style={{
                background: '#fff',
                borderRadius: 14,
                padding: 20,
                boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
                    <h3 style={{ fontSize: 16, fontWeight: 700, color: '#0f172a', margin: 0 }}>
                      {stage.titre}
                    </h3>
                    {getTypeBadge(stage.type)}
                    {getStatutBadge(stage.statut)}
                  </div>
                  <p style={{ fontSize: 13, color: '#64748b', margin: '0 0 12px' }}>
                    {stage.description}
                  </p>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16, fontSize: 12, color: '#94a3b8' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                      <User size={14} />
                      {stage.etudiant?.prenom} {stage.etudiant?.nom} ({stage.etudiant?.matricule})
                    </span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                      <Briefcase size={14} />
                      {stage.parcours?.code}
                    </span>
                    {stage.entrepriseOrganisme && (
                      <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                        <Building size={14} />
                        {stage.entrepriseOrganisme}
                      </span>
                    )}
                    {stage.encadrant && (
                      <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                        <User size={14} />
                        Enc: {stage.encadrant.prenom} {stage.encadrant.nom}
                      </span>
                    )}
                    {stage.noteFinale !== undefined && (
                      <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontWeight: 600, color: '#1a5276' }}>
                        <Award size={14} />
                        Note: {stage.noteFinale}/20 - {stage.mention}
                      </span>
                    )}
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  {stage.statut === 'termine' && (
                    <button
                      onClick={() => handleValider(stage.id)}
                      style={{
                        padding: '8px 16px',
                        background: '#d1fae5',
                        color: '#065f46',
                        border: 'none',
                        borderRadius: 8,
                        fontSize: 12,
                        fontWeight: 600,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 6
                      }}
                    >
                      <CheckCircle size={14} /> Valider
                    </button>
                  )}
                  <button
                    onClick={() => { setSelectedStage(stage); setShowDetailModal(true); }}
                    style={{
                      padding: '8px',
                      background: '#f1f5f9',
                      color: '#64748b',
                      border: 'none',
                      borderRadius: 8,
                      cursor: 'pointer'
                    }}
                  >
                    <Eye size={16} />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default StagesPage;
