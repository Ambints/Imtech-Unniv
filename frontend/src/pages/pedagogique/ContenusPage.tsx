import React, { useState, useEffect } from 'react';
import { api } from '../../api/client';
import { useAuthStore } from '../../store/authStore';
import toast from 'react-hot-toast';
import {
  Folder, CheckCircle, XCircle, Eye, FileText, Calendar, User,
  Search, Filter, Download, MessageSquare
} from 'lucide-react';

interface ContenuCours {
  id: string;
  ueId?: string;
  ecId?: string;
  enseignantId: string;
  titre: string;
  description?: string;
  objectifs?: string;
  planCours?: any[];
  bibliographie?: any[];
  ressources?: any[];
  fichierSyllabusUrl?: string;
  statut: string;
  soumisPar: string;
  dateSoumission?: Date;
  validePar?: string;
  dateValidation?: Date;
  commentaires?: string;
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
}

export const ContenusPage: React.FC = () => {
  const { user, tenant } = useAuthStore();

  const [loading, setLoading] = useState(false);
  const [contenus, setContenus] = useState<ContenuCours[]>([]);
  const [filterStatut, setFilterStatut] = useState<string>('tous');
  const [selectedContenu, setSelectedContenu] = useState<ContenuCours | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [commentaire, setCommentaire] = useState('');

  // Fonctionnalité désactivée temporairement
  const featureDisabled = true;

  const loadContenus = async () => {
    // Fonctionnalité désactivée - utiliser uniquement les données de démo
    setContenus([
      {
        id: '1',
        titre: 'Cours de Programmation Java Avancée',
        description: 'Support complet pour le cours de Java L3',
        enseignantId: 'ens1',
        soumisPar: 'ens1',
        statut: 'soumis',
        dateSoumission: new Date(),
        enseignant: { id: 'ens1', nom: 'DUPONT', prenom: 'Jean' },
        uniteEnseignement: { id: 'ue1', code: 'UE1-INFO', intitule: 'Programmation Avancée' }
      },
      {
        id: '2',
        titre: 'Base de données - Modélisation MERISE',
        description: 'Cours complet sur la modélisation de données',
        enseignantId: 'ens2',
        soumisPar: 'ens2',
        statut: 'valide',
        dateSoumission: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        dateValidation: new Date(),
        validePar: user?.id,
        enseignant: { id: 'ens2', nom: 'MARTIN', prenom: 'Marie' },
        uniteEnseignement: { id: 'ue2', code: 'UE2-INFO', intitule: 'Bases de Données' }
      }
    ]);
  };

  // Charger les données au montage
  useEffect(() => {
    loadContenus();
  }, []);

  const handleValider = async (id: string) => {
    // Simulation locale - fonctionnalité désactivée
    setContenus(prev => prev.map(c =>
      c.id === id ? { ...c, statut: 'valide', validePar: user?.id, dateValidation: new Date() } : c
    ));
    toast.success('Contenu validé (mode démo)');
    setShowDetailModal(false);
    setCommentaire('');
  };

  const handleRejeter = async (id: string) => {
    if (!commentaire.trim()) {
      toast.error('Veuillez indiquer un motif de rejet');
      return;
    }
    // Simulation locale - fonctionnalité désactivée
    setContenus(prev => prev.map(c =>
      c.id === id ? { ...c, statut: 'rejete', commentaires: commentaire } : c
    ));
    toast.success('Contenu rejeté (mode démo)');
    setShowDetailModal(false);
    setCommentaire('');
  };

  const getStatutBadge = (statut: string) => {
    const styles: Record<string, { bg: string; color: string; icon: React.ReactNode; label: string }> = {
      brouillon: { bg: '#f3f4f6', color: '#6b7280', icon: <Folder size={14} />, label: 'Brouillon' },
      soumis: { bg: '#dbeafe', color: '#1e40af', icon: <FileText size={14} />, label: 'En attente' },
      valide: { bg: '#d1fae5', color: '#065f46', icon: <CheckCircle size={14} />, label: 'Validé' },
      rejete: { bg: '#fee2e2', color: '#991b1b', icon: <XCircle size={14} />, label: 'Rejeté' }
    };
    const style = styles[statut] || styles.brouillon;
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
        {style.icon} {style.label}
      </span>
    );
  };

  const filteredContenus = filterStatut === 'tous' 
    ? contenus 
    : contenus.filter(c => c.statut === filterStatut);

  const stats = {
    total: contenus.length,
    enAttente: contenus.filter(c => c.statut === 'soumis').length,
    valides: contenus.filter(c => c.statut === 'valide').length,
    rejetes: contenus.filter(c => c.statut === 'rejete').length
  };

  return (
    <div style={{ padding: 32 }}>
      {/* Header */}
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontSize: 28, fontWeight: 800, color: '#1e293b', margin: '0 0 8px', display: 'flex', alignItems: 'center', gap: 12 }}>
          <Folder size={32} /> Contenus Pédagogiques
        </h1>
        <p style={{ color: '#64748b', fontSize: 14 }}>
          Validation et gestion des supports de cours
        </p>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 24 }}>
        <div style={{ background: '#fff', borderRadius: 12, padding: 20, boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
          <div style={{ fontSize: 12, color: '#64748b', marginBottom: 4 }}>Total</div>
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
      <div style={{ marginBottom: 24, display: 'flex', gap: 12, alignItems: 'center' }}>
        <Filter size={18} color="#64748b" />
        <div style={{ display: 'flex', gap: 8 }}>
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
      </div>

      {/* Liste des contenus */}
      <div style={{ display: 'grid', gap: 16 }}>
        {filteredContenus.length === 0 ? (
          <div style={{ background: '#fff', borderRadius: 14, padding: 40, textAlign: 'center' }}>
            <Folder size={48} color="#cbd5e1" />
            <p style={{ color: '#64748b', marginTop: 12 }}>Aucun contenu trouvé</p>
          </div>
        ) : (
          filteredContenus.map((contenu) => (
            <div
              key={contenu.id}
              style={{
                background: '#fff',
                borderRadius: 14,
                padding: 20,
                boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                cursor: 'pointer',
                transition: 'transform 0.2s',
              }}
              onClick={() => { setSelectedContenu(contenu); setShowDetailModal(true); }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
                    <h3 style={{ fontSize: 16, fontWeight: 700, color: '#0f172a', margin: 0 }}>
                      {contenu.titre}
                    </h3>
                    {getStatutBadge(contenu.statut)}
                  </div>
                  <p style={{ fontSize: 13, color: '#64748b', margin: '0 0 12px' }}>
                    {contenu.description}
                  </p>
                  <div style={{ display: 'flex', gap: 16, fontSize: 12, color: '#94a3b8' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                      <User size={14} />
                      {contenu.enseignant?.prenom} {contenu.enseignant?.nom}
                    </span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                      <Folder size={14} />
                      {contenu.uniteEnseignement?.code} - {contenu.uniteEnseignement?.intitule}
                    </span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                      <Calendar size={14} />
                      Soumis le {new Date(contenu.dateSoumission || '').toLocaleDateString('fr-FR')}
                    </span>
                  </div>
                </div>
                <button
                  onClick={(e) => { e.stopPropagation(); setSelectedContenu(contenu); setShowDetailModal(true); }}
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

      {/* Modal de détail */}
      {showDetailModal && selectedContenu && (
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
                Détails du contenu
              </h2>
              <button
                onClick={() => setShowDetailModal(false)}
                style={{ background: 'none', border: 'none', cursor: 'pointer' }}
              >
                <XCircle size={24} color="#64748b" />
              </button>
            </div>

            <div style={{ marginBottom: 24 }}>
              <div style={{ marginBottom: 16 }}>
                <label style={{ fontSize: 12, color: '#64748b', fontWeight: 600, textTransform: 'uppercase' }}>Titre</label>
                <p style={{ fontSize: 16, fontWeight: 600, color: '#0f172a', margin: '4px 0 0' }}>{selectedContenu.titre}</p>
              </div>
              <div style={{ marginBottom: 16 }}>
                <label style={{ fontSize: 12, color: '#64748b', fontWeight: 600, textTransform: 'uppercase' }}>Description</label>
                <p style={{ fontSize: 14, color: '#374151', margin: '4px 0 0' }}>{selectedContenu.description}</p>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 16 }}>
                <div>
                  <label style={{ fontSize: 12, color: '#64748b', fontWeight: 600, textTransform: 'uppercase' }}>Enseignant</label>
                  <p style={{ fontSize: 14, color: '#374151', margin: '4px 0 0' }}>
                    {selectedContenu.enseignant?.prenom} {selectedContenu.enseignant?.nom}
                  </p>
                </div>
                <div>
                  <label style={{ fontSize: 12, color: '#64748b', fontWeight: 600, textTransform: 'uppercase' }}>UE</label>
                  <p style={{ fontSize: 14, color: '#374151', margin: '4px 0 0' }}>
                    {selectedContenu.uniteEnseignement?.code}
                  </p>
                </div>
              </div>
            </div>

            {selectedContenu.fichierSyllabusUrl && (
              <div style={{ marginBottom: 24 }}>
                <a
                  href={selectedContenu.fichierSyllabusUrl}
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
                  <Download size={18} /> Télécharger le syllabus
                </a>
              </div>
            )}

            {selectedContenu.statut === 'soumis' && (
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
                    onClick={() => handleValider(selectedContenu.id)}
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
                    <CheckCircle size={18} /> Valider
                  </button>
                  <button
                    onClick={() => handleRejeter(selectedContenu.id)}
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

            {selectedContenu.commentaires && (
              <div style={{ marginTop: 24, padding: 16, background: '#f8fafc', borderRadius: 8 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                  <MessageSquare size={16} color="#64748b" />
                  <span style={{ fontSize: 12, fontWeight: 600, color: '#64748b' }}>Commentaire</span>
                </div>
                <p style={{ fontSize: 14, color: '#374151', margin: 0 }}>{selectedContenu.commentaires}</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ContenusPage;
