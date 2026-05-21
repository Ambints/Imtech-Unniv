import React, { useState, useEffect } from 'react';
import { useAuthStore } from '../../store/authStore';
import { api } from '../../api/client';
import { useLocation, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import {
  BookText, Pencil, CheckSquare, GraduationCap, Folder, FlaskConical,
  Calendar, Clock, Users, FileText, Upload, Download, Plus, Search,
  Filter, BarChart3, Award, AlertCircle, CheckCircle, MessageSquare,
  Loader2, Send, Mail, UserCheck
} from 'lucide-react';

interface Cours {
  id: string;
  nom: string;
  code: string;
  niveau: string;
  heures: string;
  etudiants: number;
  prochainCours?: string;
  salle?: string;
}

interface SessionEvaluation {
  id: string;
  cours: string;
  type: string;
  date: string;
  etudiants: number;
  statut: string;
  affectationId: string;
}

interface Etudiant {
  matricule: string;
  nom: string;
  prenom: string;
  parcours: string;
  moyenne: number;
  presence: number;
  photo?: string;
}

interface Ressource {
  id: string;
  titre: string;
  type_ressource: 'support' | 'exercice' | 'sujet_examen' | 'correction';
  type_fichier: string;
  taille_fichier: number;
  date_depot: string;
  nb_telechargements: number;
  fichier_url: string;
  cours_id?: string;
}

interface Message {
  id: string;
  destinataire: string;
  sujet: string;
  contenu: string;
  date_envoi: string;
  lu: boolean;
  type: 'direct' | 'masse';
}

interface Demande {
  id: string;
  type_ressource: string;
  motif: string;
  date_souhaitee: string;
  statut: string;
  priorite?: string;
}

interface Stats {
  nb_cours: number;
  nb_etudiants: number;
  nb_notes_a_saisir: number;
  nb_ressources: number;
}

export const EnseignantPortal: React.FC = () => {
  const { user, tenant } = useAuthStore();
  const location = useLocation();
  const navigate = useNavigate();
  
  // Déterminer l'onglet actif depuis l'URL
  const getTabFromPath = (): 'cours' | 'notes' | 'presences' | 'etudiants' | 'ressources' | 'messagerie' | 'demandes' => {
    const path = location.pathname;
    if (path.includes('/notes')) return 'notes';
    if (path.includes('/presences')) return 'presences';
    if (path.includes('/etudiants')) return 'etudiants';
    if (path.includes('/ressources')) return 'ressources';
    if (path.includes('/messagerie')) return 'messagerie';
    if (path.includes('/demandes')) return 'demandes';
    return 'cours';
  };
  
  const [activeTab, setActiveTab] = useState<'cours' | 'notes' | 'presences' | 'etudiants' | 'ressources' | 'messagerie' | 'demandes'>(getTabFromPath());
  const [loading, setLoading] = useState(true);
  
  // Synchroniser l'onglet avec l'URL
  useEffect(() => {
    setActiveTab(getTabFromPath());
  }, [location.pathname]);

  // États pour les données
  const [mesCours, setMesCours] = useState<Cours[]>([]);
  const [stats, setStats] = useState<Stats>({ nb_cours: 0, nb_etudiants: 0, nb_notes_a_saisir: 0, nb_ressources: 0 });
  const [sessionsEvaluation, setSessionsEvaluation] = useState<SessionEvaluation[]>([]);
  const [etudiants, setEtudiants] = useState<Etudiant[]>([]);
  const [ressources, setRessources] = useState<Ressource[]>([]);
  const [demandes, setDemandes] = useState<Demande[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [selectedCours, setSelectedCours] = useState<string>('');
  const [typeRessource, setTypeRessource] = useState<'support' | 'exercice' | 'sujet_examen' | 'correction'>('support');
  const [presenceSignee, setPresenceSignee] = useState(false);

  // Chargement initial
  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    setLoading(true);
    try {
      await Promise.all([
        loadMesCours(),
        loadStats(),
        loadSessionsEvaluation(),
        loadRessources(),
        loadDemandes(),
        loadMessages()
      ]);
    } catch (error) {
      console.error('Erreur chargement données:', error);
      toast.error('Impossible de charger les données');
    } finally {
      setLoading(false);
    }
  };

  const loadMesCours = async () => {
    try {
      const { data } = await api.get('/portail/enseignant/mes-cours');
      setMesCours(data);
    } catch (error) {
      console.error('Erreur chargement cours:', error);
    }
  };

  const loadStats = async () => {
    try {
      const { data } = await api.get('/portail/enseignant/mes-stats');
      setStats(data);
    } catch (error) {
      console.error('Erreur chargement stats:', error);
    }
  };

  const loadSessionsEvaluation = async () => {
    try {
      const { data } = await api.get('/portail/enseignant/sessions-evaluation');
      setSessionsEvaluation(data);
    } catch (error) {
      console.error('Erreur chargement sessions:', error);
    }
  };

  const loadEtudiants = async (affectationId: string) => {
    try {
      const { data } = await api.get(`/portail/enseignant/mes-etudiants/${affectationId}`);
      setEtudiants(data);
    } catch (error) {
      console.error('Erreur chargement étudiants:', error);
    }
  };

  const loadRessources = async () => {
    try {
      const { data } = await api.get('/portail/enseignant/supports-cours');
      setRessources(data);
    } catch (error) {
      console.error('Erreur chargement ressources:', error);
    }
  };

  const loadDemandes = async () => {
    try {
      const { data } = await api.get('/portail/enseignant/mes-demandes-ressources');
      setDemandes(data);
    } catch (error) {
      console.error('Erreur chargement demandes:', error);
    }
  };

  const loadMessages = async () => {
    try {
      const { data } = await api.get('/portail/enseignant/mes-messages');
      setMessages(data);
    } catch (error) {
      console.error('Erreur chargement messages:', error);
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const statsCards = [
    {
      label: 'Mes Cours',
      value: stats.nb_cours.toString(),
      icon: <BookText size={20} />,
      color: '#3b82f6',
      bgColor: 'rgba(59, 130, 246, 0.1)'
    },
    {
      label: 'Total Étudiants',
      value: stats.nb_etudiants.toString(),
      icon: <Users size={20} />,
      color: '#10b981',
      bgColor: 'rgba(16, 185, 129, 0.1)'
    },
    {
      label: 'Notes à Saisir',
      value: stats.nb_notes_a_saisir.toString(),
      icon: <Pencil size={20} />,
      color: '#f59e0b',
      bgColor: 'rgba(245, 158, 11, 0.1)'
    },
    {
      label: 'Ressources',
      value: stats.nb_ressources.toString(),
      icon: <Folder size={20} />,
      color: '#8b5cf6',
      bgColor: 'rgba(139, 92, 246, 0.1)'
    }
  ];

  const renderCours = () => (
    <div className="row g-4">
      {mesCours.map((cours) => (
        <div key={cours.id} className="col-12 col-lg-6">
          <div className="card border-0 shadow-sm h-100" style={{ borderRadius: 12 }}>
            <div className="card-body p-4">
              <div className="d-flex justify-content-between align-items-start mb-3">
                <div>
                  <h5 className="fw-bold mb-1" style={{ color: '#1e293b' }}>
                    {cours.nom}
                  </h5>
                  <p className="text-muted mb-0" style={{ fontSize: 13 }}>
                    {cours.code} • {cours.niveau}
                  </p>
                </div>
                <span className="badge bg-primary">{cours.etudiants} étudiants</span>
              </div>
              
              <div className="mb-3">
                <div className="d-flex align-items-center gap-2 mb-2">
                  <Clock size={16} color="#64748b" />
                  <span className="text-muted" style={{ fontSize: 13 }}>
                    {cours.heures}
                  </span>
                </div>
                {cours.prochainCours && (
                  <div className="d-flex align-items-center gap-2">
                    <Calendar size={16} color="#64748b" />
                    <span className="text-muted" style={{ fontSize: 13 }}>
                      Prochain cours: {cours.prochainCours} - {cours.salle}
                    </span>
                  </div>
                )}
              </div>

              <div className="d-flex gap-2">
                <button 
                  className="btn btn-sm btn-primary flex-grow-1"
                  onClick={() => {
                    setActiveTab('ressources');
                    setSelectedCours(cours.id);
                  }}
                >
                  <FileText size={14} className="me-1" />
                  Ressources
                </button>
                <button 
                  className="btn btn-sm btn-outline-primary"
                  onClick={() => {
                    setActiveTab('notes');
                    setSelectedCours(cours.id);
                  }}
                >
                  <Pencil size={14} className="me-1" />
                  Notes
                </button>
                <button 
                  className="btn btn-sm btn-outline-primary"
                  onClick={() => {
                    setActiveTab('presences');
                    setSelectedCours(cours.id);
                  }}
                >
                  <CheckSquare size={14} className="me-1" />
                  Présences
                </button>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  const renderNotes = () => (
    <div className="card border-0 shadow-sm" style={{ borderRadius: 12 }}>
      <div className="card-body p-4">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h5 className="fw-bold mb-0" style={{ color: '#1e293b' }}>
            <Pencil size={20} className="me-2" />
            Saisie des Notes
          </h5>
        </div>

        {sessionsEvaluation.length === 0 ? (
          <div className="alert alert-info">
            <AlertCircle size={20} className="me-2" />
            Aucune session d'évaluation disponible pour le moment.
          </div>
        ) : (
          <div className="d-flex flex-column gap-3">
            {sessionsEvaluation.map((session) => (
              <div
                key={session.id}
                className="p-3"
                style={{
                  background: '#f8fafc',
                  borderRadius: 10,
                  border: '1px solid #e5e7eb'
                }}
              >
                <div className="d-flex justify-content-between align-items-start mb-2">
                  <div>
                    <div className="fw-bold mb-1" style={{ fontSize: 14, color: '#1e293b' }}>
                      {session.cours}
                    </div>
                    <div className="text-muted" style={{ fontSize: 12 }}>
                      {session.type} • {formatDate(session.date)}
                    </div>
                  </div>
                  <span
                    className="badge"
                    style={{
                      background: session.statut === 'En attente' ? 'rgba(245, 158, 11, 0.1)' : 'rgba(59, 130, 246, 0.1)',
                      color: session.statut === 'En attente' ? '#f59e0b' : '#3b82f6'
                    }}
                  >
                    {session.statut}
                  </span>
                </div>
                <div className="d-flex justify-content-between align-items-center">
                  <span className="text-muted" style={{ fontSize: 13 }}>
                    {session.etudiants} étudiants
                  </span>
                  <button 
                    className="btn btn-sm btn-primary"
                    onClick={() => {
                      window.location.href = `/portail/enseignant/saisie-notes/${session.id}/${session.affectationId}`;
                    }}
                  >
                    Saisir les notes
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );

  const renderPresences = () => (
    <div className="card border-0 shadow-sm" style={{ borderRadius: 12 }}>
      <div className="card-body p-4">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h5 className="fw-bold mb-0" style={{ color: '#1e293b' }}>
            <CheckSquare size={20} className="me-2" />
            Gestion des Présences
          </h5>
          <div className="d-flex gap-2">
            <select
              className="form-select form-select-sm"
              style={{ width: 'auto' }}
              value={selectedCours}
              onChange={(e) => setSelectedCours(e.target.value)}
            >
              <option value="">Tous les cours</option>
              {mesCours.map(c => <option key={c.id} value={c.id}>{c.nom}</option>)}
            </select>
          </div>
        </div>

        {/* Signature de présence enseignant */}
        <div
          className="alert d-flex align-items-center justify-content-between mb-4"
          style={{
            background: presenceSignee ? 'rgba(16, 185, 129, 0.1)' : 'rgba(245, 158, 11, 0.1)',
            border: `1px solid ${presenceSignee ? '#10b981' : '#f59e0b'}`,
            borderRadius: 10
          }}
        >
          <div className="d-flex align-items-center gap-2">
            <UserCheck size={20} color={presenceSignee ? '#10b981' : '#f59e0b'} />
            <div style={{ fontSize: 13 }}>
              {presenceSignee
                ? '✓ Vous avez signé votre présence pour cette séance'
                : 'Signez votre présence avant de pointer les étudiants'
              }
            </div>
          </div>
          {!presenceSignee && (
            <button
              className="btn btn-sm"
              style={{
                background: '#f59e0b',
                color: '#fff',
                border: 'none'
              }}
              onClick={() => {
                setPresenceSignee(true);
                toast.success('Présence signée avec succès');
              }}
            >
              Signer ma présence
            </button>
          )}
        </div>

        <div className="alert alert-info d-flex align-items-center" role="alert">
          <AlertCircle size={20} className="me-2" />
          <div style={{ fontSize: 13 }}>
            Utilisez le système de pointage numérique ou saisissez manuellement les présences pour chaque séance.
          </div>
        </div>

        <div className="row g-3 mt-2">
          {mesCours
            .filter(c => !selectedCours || c.id === selectedCours)
            .map((cours) => (
              <div key={cours.id} className="col-12 col-md-6">
                <div className="p-3" style={{ background: '#f8fafc', borderRadius: 10 }}>
                  <div className="fw-bold mb-2" style={{ fontSize: 14, color: '#1e293b' }}>
                    {cours.nom}
                  </div>
                  <div className="d-flex justify-content-between align-items-center">
                    <span className="text-muted" style={{ fontSize: 13 }}>
                      {cours.etudiants} étudiants
                    </span>
                    <button
                      className="btn btn-sm btn-outline-primary"
                      disabled={!presenceSignee}
                      onClick={() => {
                        window.location.href = `/portail/enseignant/presences/${cours.id}`;
                      }}
                    >
                      Pointer présences
                    </button>
                  </div>
                </div>
              </div>
            ))}
        </div>
      </div>
    </div>
  );

  const renderEtudiants = () => (
    <div className="card border-0 shadow-sm" style={{ borderRadius: 12 }}>
      <div className="card-body p-4">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h5 className="fw-bold mb-0" style={{ color: '#1e293b' }}>
            <GraduationCap size={20} className="me-2" />
            Mes Étudiants
          </h5>
          <div className="d-flex gap-2">
            <select 
              className="form-select form-select-sm" 
              style={{ width: 'auto' }}
              onChange={(e) => {
                if (e.target.value) {
                  loadEtudiants(e.target.value);
                }
              }}
            >
              <option value="">Sélectionner un cours</option>
              {mesCours.map(c => <option key={c.id} value={c.id}>{c.nom}</option>)}
            </select>
          </div>
        </div>

        {etudiants.length === 0 ? (
          <div className="alert alert-info">
            <AlertCircle size={20} className="me-2" />
            Sélectionnez un cours pour voir la liste des étudiants.
          </div>
        ) : (
          <div className="table-responsive">
            <table className="table table-hover">
              <thead>
                <tr style={{ background: '#f8fafc' }}>
                  <th style={{ fontSize: 13, fontWeight: 600, color: '#64748b' }}>Matricule</th>
                  <th style={{ fontSize: 13, fontWeight: 600, color: '#64748b' }}>Nom</th>
                  <th style={{ fontSize: 13, fontWeight: 600, color: '#64748b' }}>Parcours</th>
                  <th style={{ fontSize: 13, fontWeight: 600, color: '#64748b' }}>Moyenne</th>
                  <th style={{ fontSize: 13, fontWeight: 600, color: '#64748b' }}>Présence</th>
                </tr>
              </thead>
              <tbody>
                {etudiants.map((etudiant, idx) => (
                  <tr key={idx}>
                    <td style={{ fontSize: 13 }}>{etudiant.matricule}</td>
                    <td>
                      <div className="d-flex align-items-center gap-2">
                        <div
                          className="d-flex align-items-center justify-content-center"
                          style={{
                            width: 32,
                            height: 32,
                            borderRadius: '50%',
                            background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
                            color: '#fff',
                            fontSize: 12,
                            fontWeight: 600
                          }}
                        >
                          {etudiant.nom[0]}{etudiant.prenom[0]}
                        </div>
                        <span style={{ fontSize: 13, fontWeight: 500 }}>
                          {etudiant.nom} {etudiant.prenom}
                        </span>
                      </div>
                    </td>
                    <td style={{ fontSize: 13 }}>{etudiant.parcours}</td>
                    <td>
                      <span
                        className="badge"
                        style={{
                          background: etudiant.moyenne >= 16 ? 'rgba(16, 185, 129, 0.1)' : etudiant.moyenne >= 14 ? 'rgba(59, 130, 246, 0.1)' : 'rgba(245, 158, 11, 0.1)',
                          color: etudiant.moyenne >= 16 ? '#10b981' : etudiant.moyenne >= 14 ? '#3b82f6' : '#f59e0b'
                        }}
                      >
                        {etudiant.moyenne.toFixed(2)}/20
                      </span>
                    </td>
                    <td>
                      <span
                        className="badge"
                        style={{
                          background: etudiant.presence >= 90 ? 'rgba(16, 185, 129, 0.1)' : 'rgba(245, 158, 11, 0.1)',
                          color: etudiant.presence >= 90 ? '#10b981' : '#f59e0b'
                        }}
                      >
                        {etudiant.presence}%
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );

  const renderRessources = () => {
    const filteredRessources = ressources.filter(r =>
      typeRessource === 'support' ? r.type_ressource === 'support' :
      typeRessource === 'exercice' ? r.type_ressource === 'exercice' :
      typeRessource === 'sujet_examen' ? r.type_ressource === 'sujet_examen' :
      r.type_ressource === 'correction'
    );

    const getTypeLabel = (type: string) => {
      switch(type) {
        case 'support': return 'Support de cours';
        case 'exercice': return 'Exercice';
        case 'sujet_examen': return 'Sujet d\'examen';
        case 'correction': return 'Correction';
        default: return type;
      }
    };

    const getTypeColor = (type: string) => {
      switch(type) {
        case 'support': return { bg: 'rgba(59, 130, 246, 0.1)', color: '#3b82f6' };
        case 'exercice': return { bg: 'rgba(16, 185, 129, 0.1)', color: '#10b981' };
        case 'sujet_examen': return { bg: 'rgba(245, 158, 11, 0.1)', color: '#f59e0b' };
        case 'correction': return { bg: 'rgba(139, 92, 246, 0.1)', color: '#8b5cf6' };
        default: return { bg: 'rgba(100, 116, 139, 0.1)', color: '#64748b' };
      }
    };

    return (
      <div className="card border-0 shadow-sm" style={{ borderRadius: 12 }}>
        <div className="card-body p-4">
          <div className="d-flex justify-content-between align-items-center mb-4">
            <h5 className="fw-bold mb-0" style={{ color: '#1e293b' }}>
              <Folder size={20} className="me-2" />
              Ressources Pédagogiques
            </h5>
            <button
              className="btn btn-primary btn-sm"
              onClick={() => {
                window.location.href = '/portail/enseignant/upload-ressource';
              }}
            >
              <Upload size={16} className="me-1" />
              Ajouter une ressource
            </button>
          </div>

          {/* Filtres par type */}
          <div className="d-flex gap-2 mb-4 flex-wrap">
            {[
              { key: 'support', label: 'Supports', icon: <FileText size={14} /> },
              { key: 'exercice', label: 'Exercices', icon: <Pencil size={14} /> },
              { key: 'sujet_examen', label: 'Sujets examens', icon: <Award size={14} /> },
              { key: 'correction', label: 'Corrections', icon: <CheckCircle size={14} /> }
            ].map((type) => (
              <button
                key={type.key}
                onClick={() => setTypeRessource(type.key as any)}
                className="btn btn-sm d-flex align-items-center gap-2"
                style={{
                  background: typeRessource === type.key ? 'linear-gradient(135deg, #1a5276, #148f77)' : '#f8fafc',
                  color: typeRessource === type.key ? '#fff' : '#64748b',
                  border: 'none',
                  borderRadius: 8,
                  fontSize: 12,
                  fontWeight: 600
                }}
              >
                {type.icon}
                {type.label}
              </button>
            ))}
          </div>

          {filteredRessources.length === 0 ? (
            <div className="alert alert-info">
              <AlertCircle size={20} className="me-2" />
              Aucune ressource de type "{getTypeLabel(typeRessource)}" disponible.
            </div>
          ) : (
            <div className="d-flex flex-column gap-2">
              {filteredRessources.map((ressource) => {
                const colors = getTypeColor(ressource.type_ressource);
                return (
                  <div
                    key={ressource.id}
                    className="p-3 d-flex justify-content-between align-items-center"
                    style={{
                      background: '#f8fafc',
                      borderRadius: 10,
                      border: '1px solid #e5e7eb'
                    }}
                  >
                    <div className="d-flex align-items-center gap-3">
                      <div
                        className="d-flex align-items-center justify-content-center"
                        style={{
                          width: 40,
                          height: 40,
                          borderRadius: 8,
                          background: colors.bg,
                          color: colors.color
                        }}
                      >
                        <FileText size={20} />
                      </div>
                      <div>
                        <div className="d-flex align-items-center gap-2 mb-1">
                          <span className="fw-medium" style={{ fontSize: 13, color: '#1e293b' }}>
                            {ressource.titre}
                          </span>
                          <span
                            className="badge"
                            style={{
                              background: colors.bg,
                              color: colors.color,
                              fontSize: 10
                            }}
                          >
                            {getTypeLabel(ressource.type_ressource)}
                          </span>
                        </div>
                        <div className="text-muted" style={{ fontSize: 11 }}>
                          {ressource.type_fichier.toUpperCase()} • {formatFileSize(ressource.taille_fichier)} • {formatDate(ressource.date_depot)} • {ressource.nb_telechargements} téléchargements
                        </div>
                      </div>
                    </div>
                    <div className="d-flex gap-2">
                      <a
                        href={ressource.fichier_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn btn-sm btn-outline-primary"
                      >
                        <Download size={14} />
                      </a>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderMessagerie = () => (
    <div className="card border-0 shadow-sm" style={{ borderRadius: 12 }}>
      <div className="card-body p-4">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h5 className="fw-bold mb-0" style={{ color: '#1e293b' }}>
            <MessageSquare size={20} className="me-2" />
            Messagerie & Communication
          </h5>
          <button 
            className="btn btn-primary btn-sm"
            onClick={() => {
              window.location.href = '/portail/enseignant/nouveau-message';
            }}
          >
            <Send size={16} className="me-1" />
            Nouveau Message
          </button>
        </div>

        {/* Options de communication */}
        <div className="row g-3 mb-4">
          <div className="col-12 col-md-4">
            <div 
              className="p-3 text-center"
              style={{
                background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
                borderRadius: 12,
                color: '#fff',
                cursor: 'pointer'
              }}
              onClick={() => window.location.href = '/portail/enseignant/message-direct'}
            >
              <Mail size={32} className="mb-2" />
              <div className="fw-bold mb-1" style={{ fontSize: 14 }}>Message Direct</div>
              <div style={{ fontSize: 11, opacity: 0.9 }}>Envoyer à un étudiant spécifique</div>
            </div>
          </div>
          <div className="col-12 col-md-4">
            <div 
              className="p-3 text-center"
              style={{
                background: 'linear-gradient(135deg, #10b981, #059669)',
                borderRadius: 12,
                color: '#fff',
                cursor: 'pointer'
              }}
              onClick={() => window.location.href = '/portail/enseignant/message-classe'}
            >
              <Users size={32} className="mb-2" />
              <div className="fw-bold mb-1" style={{ fontSize: 14 }}>Message de Classe</div>
              <div style={{ fontSize: 11, opacity: 0.9 }}>Envoyer à une classe entière</div>
            </div>
          </div>
          <div className="col-12 col-md-4">
            <div 
              className="p-3 text-center"
              style={{
                background: 'linear-gradient(135deg, #f59e0b, #d97706)',
                borderRadius: 12,
                color: '#fff',
                cursor: 'pointer'
              }}
              onClick={() => window.location.href = '/portail/enseignant/message-parcours'}
            >
              <GraduationCap size={32} className="mb-2" />
              <div className="fw-bold mb-1" style={{ fontSize: 14 }}>Message Parcours/Niveau</div>
              <div style={{ fontSize: 11, opacity: 0.9 }}>Filtrer par parcours ou niveau</div>
            </div>
          </div>
        </div>

        {/* Historique des messages */}
        <div className="mb-3">
          <h6 className="fw-bold mb-3" style={{ fontSize: 14, color: '#64748b' }}>
            Messages récents
          </h6>
        </div>

        {messages.length === 0 ? (
          <div className="alert alert-info">
            <AlertCircle size={20} className="me-2" />
            Aucun message envoyé pour le moment.
          </div>
        ) : (
          <div className="d-flex flex-column gap-2">
            {messages.map((message) => (
              <div
                key={message.id}
                className="p-3"
                style={{
                  background: '#f8fafc',
                  borderRadius: 10,
                  border: '1px solid #e5e7eb'
                }}
              >
                <div className="d-flex justify-content-between align-items-start mb-2">
                  <div>
                    <div className="fw-bold mb-1" style={{ fontSize: 14, color: '#1e293b' }}>
                      {message.sujet}
                    </div>
                    <div className="text-muted" style={{ fontSize: 12 }}>
                      À: {message.destinataire} • {formatDate(message.date_envoi)}
                    </div>
                  </div>
                  <span
                    className="badge"
                    style={{
                      background: message.type === 'direct' ? 'rgba(59, 130, 246, 0.1)' : 'rgba(16, 185, 129, 0.1)',
                      color: message.type === 'direct' ? '#3b82f6' : '#10b981',
                      fontSize: 10
                    }}
                  >
                    {message.type === 'direct' ? 'Direct' : 'Masse'}
                  </span>
                </div>
                <div className="text-muted" style={{ fontSize: 13 }}>
                  {message.contenu.substring(0, 100)}...
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );

  const renderDemandes = () => (
    <div className="card border-0 shadow-sm" style={{ borderRadius: 12 }}>
      <div className="card-body p-4">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h5 className="fw-bold mb-0" style={{ color: '#1e293b' }}>
            <FlaskConical size={20} className="me-2" />
            Demandes de Matériel & Salles
          </h5>
          <button 
            className="btn btn-primary btn-sm"
            onClick={() => {
              window.location.href = '/portail/enseignant/nouvelle-demande';
            }}
          >
            <Plus size={16} className="me-1" />
            Nouvelle Demande
          </button>
        </div>

        {demandes.length === 0 ? (
          <div className="alert alert-info">
            <AlertCircle size={20} className="me-2" />
            Aucune demande en cours. Créez-en une si vous avez besoin de matériel ou d'une salle.
          </div>
        ) : (
          <div className="d-flex flex-column gap-3">
            {demandes.map((demande) => (
              <div
                key={demande.id}
                className="p-3"
                style={{
                  background: '#f8fafc',
                  borderRadius: 10,
                  borderLeft: `3px solid ${
                    demande.priorite === 'Haute' ? '#ef4444' : demande.priorite === 'Moyenne' ? '#f59e0b' : '#3b82f6'
                  }`
                }}
              >
                <div className="d-flex justify-content-between align-items-start mb-2">
                  <div>
                    <span
                      className="badge mb-2"
                      style={{
                        background: 'rgba(59, 130, 246, 0.1)',
                        color: '#3b82f6',
                        fontSize: 10
                      }}
                    >
                      {demande.type_ressource}
                    </span>
                    <div className="fw-bold mb-1" style={{ fontSize: 14, color: '#1e293b' }}>
                      {demande.motif}
                    </div>
                    <div className="text-muted" style={{ fontSize: 12 }}>
                      {formatDate(demande.date_souhaitee)}
                    </div>
                  </div>
                  <span
                    className="badge"
                    style={{
                      background:
                        demande.statut === 'approuvee'
                          ? 'rgba(16, 185, 129, 0.1)'
                          : demande.statut === 'livree'
                          ? 'rgba(59, 130, 246, 0.1)'
                          : 'rgba(245, 158, 11, 0.1)',
                      color:
                        demande.statut === 'approuvee'
                          ? '#10b981'
                          : demande.statut === 'livree'
                          ? '#3b82f6'
                          : '#f59e0b'
                    }}
                  >
                    {demande.statut}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '400px' }}>
        <Loader2 size={40} className="animate-spin" color="#3b82f6" />
      </div>
    );
  }

  return (
    <div className="container-fluid p-4">
      {/* Header */}
      <div className="mb-4">
        <h1 className="h3 fw-bold mb-2" style={{ color: '#1e293b' }}>
          Portail Enseignant
        </h1>
        <p className="text-muted mb-0">
          Gestion de vos cours, notes et ressources pédagogiques
        </p>
      </div>

      {/* Stats */}
      <div className="row g-3 mb-4">
        {statsCards.map((stat, idx) => (
          <div key={idx} className="col-12 col-sm-6 col-lg-3">
            <div className="card border-0 shadow-sm h-100" style={{ borderRadius: 12 }}>
              <div className="card-body p-3">
                <div className="d-flex align-items-center gap-3">
                  <div
                    className="d-flex align-items-center justify-content-center"
                    style={{
                      width: 44,
                      height: 44,
                      borderRadius: 10,
                      background: stat.bgColor,
                      color: stat.color
                    }}
                  >
                    {stat.icon}
                  </div>
                  <div>
                    <div className="fw-bold" style={{ fontSize: 20, color: '#1e293b' }}>
                      {stat.value}
                    </div>
                    <div className="text-muted" style={{ fontSize: 12, fontWeight: 500 }}>
                      {stat.label}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="mb-4">
        <div className="d-flex gap-2 flex-wrap">
          {[
            { key: 'cours', label: 'Mes Cours', icon: <BookText size={16} />, path: '/portail/enseignant' },
            { key: 'notes', label: 'Saisie Notes', icon: <Pencil size={16} />, path: '/portail/enseignant/notes' },
            { key: 'presences', label: 'Présences', icon: <CheckSquare size={16} />, path: '/portail/enseignant/presences' },
            { key: 'etudiants', label: 'Étudiants', icon: <GraduationCap size={16} />, path: '/portail/enseignant/etudiants' },
            { key: 'ressources', label: 'Ressources', icon: <Folder size={16} />, path: '/portail/enseignant/ressources' },
            { key: 'messagerie', label: 'Messagerie', icon: <MessageSquare size={16} />, path: '/portail/enseignant/messagerie' },
            { key: 'demandes', label: 'Demandes', icon: <FlaskConical size={16} />, path: '/portail/enseignant/demandes' }
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => navigate(tab.path)}
              className="btn d-flex align-items-center gap-2"
              style={{
                padding: '10px 20px',
                borderRadius: 10,
                border: 'none',
                background: activeTab === tab.key ? 'linear-gradient(135deg, #1a5276, #148f77)' : '#f8fafc',
                color: activeTab === tab.key ? '#fff' : '#64748b',
                fontSize: 13,
                fontWeight: 600,
                transition: 'all 0.2s'
              }}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      {activeTab === 'cours' && renderCours()}
      {activeTab === 'notes' && renderNotes()}
      {activeTab === 'presences' && renderPresences()}
      {activeTab === 'etudiants' && renderEtudiants()}
      {activeTab === 'ressources' && renderRessources()}
      {activeTab === 'messagerie' && renderMessagerie()}
      {activeTab === 'demandes' && renderDemandes()}
    </div>
  );
};

// Made with Bob
