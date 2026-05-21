import React, { useState, useEffect } from 'react';
import { api } from '../../api/client';
import { useAuthStore } from '../../store/authStore';
import toast from 'react-hot-toast';
import {
  FileEdit, CheckCircle, XCircle, Eye, Clock, Calendar, User, AlertCircle,
  Download, MessageSquare, FileText
} from 'lucide-react';

interface SujetExamen {
  id: string;
  sessionExamenId: string;
  ueId?: string;
  ecId?: string;
  enseignantId: string;
  titre: string;
  description?: string;
  fichierUrl?: string;
  dureeMinutes: number;
  baremeTotal: number;
  statut: string;
  soumisPar: string;
  dateSoumission: Date;
  reluPar?: string;
  dateRelecture?: Date;
  validePar?: string;
  dateValidation?: Date;
  commentaires?: string;
  motifRejet?: string;
  enseignant?: {
    id: string;
    nom: string;
    prenom: string;
  };
  uniteEnseignement?: {
    id: string;
    code: string;
    intitule: string;
  };
  sessionExamen?: {
    id: string;
    libelle: string;
    dateDebut?: Date;
  };
}

export const SujetsExamensPage: React.FC = () => {
  const { user, tenant } = useAuthStore();
  const tid = tenant?.id || '';
  
  const [loading, setLoading] = useState(true);
  const [sujets, setSujets] = useState<SujetExamen[]>([]);
  const [filterStatut, setFilterStatut] = useState<string>('tous');
  const [selectedSujet, setSelectedSujet] = useState<SujetExamen | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [commentaire, setCommentaire] = useState('');

  useEffect(() => {
    if (tid) loadSujets();
  }, [tid]);

  const loadSujets = async () => {
    setLoading(true);
    try {
      const response = await api.get(`/pedagogique/${tid}/sujets`);
      setSujets(response.data || []);
    } catch (err: any) {
      // Fallback data
      setSujets([
        {
          id: '1',
          sessionExamenId: 'sess1',
          titre: 'Examen Final Programmation Java',
          description: 'Examen portant sur les concepts avancés de Java',
          enseignantId: 'ens1',
          soumisPar: 'ens1',
          statut: 'soumis',
          dateSoumission: new Date(),
          dureeMinutes: 120,
          baremeTotal: 20,
          enseignant: { id: 'ens1', nom: 'DUPONT', prenom: 'Jean' },
          uniteEnseignement: { id: 'ue1', code: 'UE1-INFO', intitule: 'Programmation Avancée' },
          sessionExamen: { id: 'sess1', libelle: 'Session Principale 2024' }
        },
        {
          id: '2',
          sessionExamenId: 'sess1',
          titre: 'Contrôle Continu Base de Données',
          description: 'QCM et exercices pratiques',
          enseignantId: 'ens2',
          soumisPar: 'ens2',
          statut: 'valide',
          dateSoumission: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
          dateValidation: new Date(),
          validePar: user?.id,
          dureeMinutes: 60,
          baremeTotal: 20,
          enseignant: { id: 'ens2', nom: 'MARTIN', prenom: 'Marie' },
          uniteEnseignement: { id: 'ue2', code: 'UE2-INFO', intitule: 'Bases de Données' },
          sessionExamen: { id: 'sess1', libelle: 'Session Principale 2024' }
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleValider = async (id: string) => {
    try {
      await api.post(`/pedagogique/${tid}/sujets/${id}/valider`, {
        validePar: user?.id,
        commentaires: commentaire
      });
      toast.success('Sujet validé avec succès');
      setShowDetailModal(false);
      setCommentaire('');
      loadSujets();
    } catch (err: any) {
      toast.error('Erreur lors de la validation');
    }
  };

  const handleRejeter = async (id: string) => {
    if (!commentaire.trim()) {
      toast.error('Veuillez indiquer un motif de rejet');
      return;
    }
    try {
      await api.post(`/pedagogique/${tid}/sujets/${id}/rejeter`, {
        motifRejet: commentaire
      });
      toast.success('Sujet rejeté');
      setShowDetailModal(false);
      setCommentaire('');
      loadSujets();
    } catch (err: any) {
      toast.error('Erreur lors du rejet');
    }
  };

  const getStatutBadge = (statut: string) => {
    const styles: Record<string, { bg: string; color: string; label: string }> = {
      soumis: { bg: '#dbeafe', color: '#1e40af', label: 'En attente de validation' },
      en_relecture: { bg: '#fef3c7', color: '#92400e', label: 'En relecture' },
      valide: { bg: '#d1fae5', color: '#065f46', label: 'Validé' },
      rejete: { bg: '#fee2e2', color: '#991b1b', label: 'Rejeté' }
    };
    const style = styles[statut] || styles.soumis;
    return (
      <span style={{
        padding: '6px 12px',
        borderRadius: 20,
        fontSize: 12,
        fontWeight: 600,
        background: style.bg,
        color: style.color,
        display: 'inline-flex',
        alignItems: 'center',
        gap: 6
      }}>
        {statut === 'valide' ? <CheckCircle size={14} /> : statut === 'rejete' ? <XCircle size={14} /> : <Clock size={14} />}
        {style.label}
      </span>
    );
  };

  const filteredSujets = filterStatut === 'tous' 
    ? sujets 
    : sujets.filter(s => s.statut === filterStatut);

  const stats = {
    total: sujets.length,
    enAttente: sujets.filter(s => s.statut === 'soumis').length,
    valides: sujets.filter(s => s.statut === 'valide').length,
    rejetes: sujets.filter(s => s.statut === 'rejete').length
  };

  return (
    <div style={{ padding: 32 }}>
      {/* Header */}
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontSize: 28, fontWeight: 800, color: '#1e293b', margin: '0 0 8px', display: 'flex', alignItems: 'center', gap: 12 }}>
          <FileEdit size={32} /> Sujets d'Examens
        </h1>
        <p style={{ color: '#64748b', fontSize: 14 }}>
          Validation des sujets d'examens soumis par les enseignants
        </p>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 24 }}>
        <div style={{ background: '#fff', borderRadius: 12, padding: 20, boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
          <div style={{ fontSize: 12, color: '#64748b', marginBottom: 4 }}>Total Sujets</div>
          <div style={{ fontSize: 28, fontWeight: 800, color: '#1e293b' }}>{stats.total}</div>
        </div>
        <div style={{ background: '#dbeafe', borderRadius: 12, padding: 20 }}>
          <div style={{ fontSize: 12, color: '#1e40af', marginBottom: 4 }}>En attente</div>
          <div style={{ fontSize: 28, fontWeight: 800, color: '#1e40af' }}>{stats.enAttente}</div>
        </div>
        <div style={{ background: '#d1fae5', borderRadius: 12, padding: 20 }}>
          <div style={{ fontSize: 12, color: '#065f46', marginBottom: 4 }}>Validés</div>
          <div style={{ fontSize: 28, fontWeight: 800, color: '#065f46' }}>{stats.valides}</div>
        </div>
        <div style={{ background: '#fee2e2', borderRadius: 12, padding: 20 }}>
          <div style={{ fontSize: 12, color: '#991b1b', marginBottom: 4 }}>Rejetés</div>
          <div style={{ fontSize: 28, fontWeight: 800, color: '#991b1b' }}>{stats.rejetes}</div>
        </div>
      </div>

      {/* Filtres */}
      <div style={{ marginBottom: 24, display: 'flex', gap: 8 }}>
        {['tous', 'soumis', 'valide', 'rejete'].map((statut) => (
          <button
            key={statut}
            onClick={() => setFilterStatut(statut)}
            style={{
              padding: '8px 16px',
              background: filterStatut === statut ? '#1a5276' : '#fff',
              color: filterStatut === statut ? '#fff' : '#64748b',
              border: '1px solid ' + (filterStatut === statut ? '#1a5276' : '#e5e7eb'),
              borderRadius: 8,
              fontSize: 13,
              fontWeight: 600,
              cursor: 'pointer',
              textTransform: 'capitalize'
            }}
          >
            {statut === 'tous' ? 'Tous' : statut === 'soumis' ? 'En attente' : statut === 'valide' ? 'Validés' : 'Rejetés'}
          </button>
        ))}
      </div>

      {/* Liste des sujets */}
      <div style={{ display: 'grid', gap: 16 }}>
        {filteredSujets.length === 0 ? (
          <div style={{ background: '#fff', borderRadius: 14, padding: 40, textAlign: 'center' }}>
            <FileText size={48} color="#cbd5e1" />
            <p style={{ color: '#64748b', marginTop: 12 }}>Aucun sujet trouvé</p>
          </div>
        ) : (
          filteredSujets.map((sujet) => (
            <div
              key={sujet.id}
              onClick={() => { setSelectedSujet(sujet); setShowDetailModal(true); }}
              style={{
                background: '#fff',
                borderRadius: 14,
                padding: 20,
                boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                cursor: 'pointer'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
                    <h3 style={{ fontSize: 16, fontWeight: 700, color: '#0f172a', margin: 0 }}>
                      {sujet.titre}
                    </h3>
                    {getStatutBadge(sujet.statut)}
                  </div>
                  <p style={{ fontSize: 13, color: '#64748b', margin: '0 0 12px' }}>
                    {sujet.description}
                  </p>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16, fontSize: 12, color: '#94a3b8' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                      <User size={14} />
                      {sujet.enseignant?.prenom} {sujet.enseignant?.nom}
                    </span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                      <FileEdit size={14} />
                      {sujet.uniteEnseignement?.code}
                    </span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                      <Calendar size={14} />
                      {sujet.sessionExamen?.libelle}
                    </span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                      <Clock size={14} />
                      {sujet.dureeMinutes} min
                    </span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                      <AlertCircle size={14} />
                      Barème: {sujet.baremeTotal}/20
                    </span>
                  </div>
                </div>
                <button
                  onClick={(e) => { e.stopPropagation(); setSelectedSujet(sujet); setShowDetailModal(true); }}
                  style={{
                    padding: '10px',
                    background: '#f1f5f9',
                    color: '#64748b',
                    border: 'none',
                    borderRadius: 8,
                    cursor: 'pointer'
                  }}
                >
                  <Eye size={18} />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modal */}
      {showDetailModal && selectedSujet && (
        <div style={{
          position: 'fixed',
          top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            background: '#fff',
            borderRadius: 16,
            padding: 32,
            maxWidth: 600,
            width: '90%',
            maxHeight: '80vh',
            overflow: 'auto'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
              <h2 style={{ fontSize: 20, fontWeight: 700, color: '#0f172a', margin: 0 }}>
                Détails du sujet
              </h2>
              <button onClick={() => setShowDetailModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                <XCircle size={24} color="#64748b" />
              </button>
            </div>

            <div style={{ marginBottom: 24 }}>
              <div style={{ marginBottom: 16 }}>
                <label style={{ fontSize: 12, color: '#64748b', fontWeight: 600, textTransform: 'uppercase' }}>Titre</label>
                <p style={{ fontSize: 16, fontWeight: 600, color: '#0f172a', margin: '4px 0 0' }}>{selectedSujet.titre}</p>
              </div>
              <div style={{ marginBottom: 16 }}>
                <label style={{ fontSize: 12, color: '#64748b', fontWeight: 600, textTransform: 'uppercase' }}>Description</label>
                <p style={{ fontSize: 14, color: '#374151', margin: '4px 0 0' }}>{selectedSujet.description}</p>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 16 }}>
                <div>
                  <label style={{ fontSize: 12, color: '#64748b', fontWeight: 600, textTransform: 'uppercase' }}>Enseignant</label>
                  <p style={{ fontSize: 14, color: '#374151', margin: '4px 0 0' }}>
                    {selectedSujet.enseignant?.prenom} {selectedSujet.enseignant?.nom}
                  </p>
                </div>
                <div>
                  <label style={{ fontSize: 12, color: '#64748b', fontWeight: 600, textTransform: 'uppercase' }}>UE</label>
                  <p style={{ fontSize: 14, color: '#374151', margin: '4px 0 0' }}>
                    {selectedSujet.uniteEnseignement?.code} - {selectedSujet.uniteEnseignement?.intitule}
                  </p>
                </div>
                <div>
                  <label style={{ fontSize: 12, color: '#64748b', fontWeight: 600, textTransform: 'uppercase' }}>Session</label>
                  <p style={{ fontSize: 14, color: '#374151', margin: '4px 0 0' }}>
                    {selectedSujet.sessionExamen?.libelle}
                  </p>
                </div>
                <div>
                  <label style={{ fontSize: 12, color: '#64748b', fontWeight: 600, textTransform: 'uppercase' }}>Durée / Barème</label>
                  <p style={{ fontSize: 14, color: '#374151', margin: '4px 0 0' }}>
                    {selectedSujet.dureeMinutes} min / {selectedSujet.baremeTotal} pts
                  </p>
                </div>
              </div>
            </div>

            {selectedSujet.fichierUrl && (
              <div style={{ marginBottom: 24 }}>
                <a
                  href={selectedSujet.fichierUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 8,
                    padding: '12px 20px',
                    background: '#f1f5f9',
                    color: '#1a5276',
                    borderRadius: 8,
                    textDecoration: 'none',
                    fontWeight: 600
                  }}
                >
                  <Download size={18} /> Télécharger le sujet
                </a>
              </div>
            )}

            {selectedSujet.statut === 'soumis' && (
              <div>
                <label style={{ fontSize: 12, color: '#64748b', fontWeight: 600, textTransform: 'uppercase', display: 'block', marginBottom: 8 }}>
                  Commentaire / Motif
                </label>
                <textarea
                  value={commentaire}
                  onChange={(e) => setCommentaire(e.target.value)}
                  placeholder="Ajouter un commentaire..."
                  rows={3}
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '1px solid #e5e7eb',
                    borderRadius: 8,
                    fontSize: 14,
                    resize: 'none',
                    marginBottom: 16
                  }}
                />
                <div style={{ display: 'flex', gap: 12 }}>
                  <button
                    onClick={() => handleValider(selectedSujet.id)}
                    style={{
                      flex: 1,
                      padding: '12px',
                      background: '#10b981',
                      color: '#fff',
                      border: 'none',
                      borderRadius: 8,
                      fontSize: 14,
                      fontWeight: 600,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 8
                    }}
                  >
                    <CheckCircle size={18} /> Valider le sujet
                  </button>
                  <button
                    onClick={() => handleRejeter(selectedSujet.id)}
                    style={{
                      flex: 1,
                      padding: '12px',
                      background: '#ef4444',
                      color: '#fff',
                      border: 'none',
                      borderRadius: 8,
                      fontSize: 14,
                      fontWeight: 600,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 8
                    }}
                  >
                    <XCircle size={18} /> Rejeter
                  </button>
                </div>
              </div>
            )}

            {selectedSujet.commentaires && (
              <div style={{ marginTop: 24, padding: 16, background: '#f8fafc', borderRadius: 8 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                  <MessageSquare size={16} color="#64748b" />
                  <span style={{ fontSize: 12, fontWeight: 600, color: '#64748b' }}>Commentaire</span>
                </div>
                <p style={{ fontSize: 14, color: '#374151', margin: 0 }}>{selectedSujet.commentaires}</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default SujetsExamensPage;
