import React, { useState, useEffect } from 'react';
import { useAuthStore } from '../../store/authStore';
import { api } from '../../api/client';
import { useLocation, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import {
  BookText, Pencil, CheckSquare, GraduationCap, Folder, FlaskConical,
  Calendar, Clock, Users, FileText, Upload, Download, Plus, Search,
  Filter, BarChart3, Award, AlertCircle, CheckCircle, MessageSquare,
  Loader2
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
  type_fichier: string;
  taille_fichier: number;
  date_depot: string;
  nb_telechargements: number;
  fichier_url: string;
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
  const getTabFromPath = (): 'cours' | 'notes' | 'presences' | 'etudiants' | 'ressources' | 'demandes' => {
    const path = location.pathname;
    if (path.includes('/notes')) return 'notes';
    if (path.includes('/presences')) return 'presences';
    if (path.includes('/etudiants')) return 'etudiants';
    if (path.includes('/ressources')) return 'ressources';
    if (path.includes('/demandes')) return 'demandes';
    return 'cours';
  };
  
  const [activeTab, setActiveTab] = useState<'cours' | 'notes' | 'presences' | 'etudiants' | 'ressources' | 'demandes'>(getTabFromPath());
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
  const [selectedCours, setSelectedCours] = useState<string>('');

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
        loadDemandes()
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

  const renderRessources = () => (
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

        {ressources.length === 0 ? (
          <div className="alert alert-info">
            <AlertCircle size={20} className="me-2" />
            Aucune ressource disponible. Commencez par en ajouter une.
          </div>
        ) : (
          <div className="d-flex flex-column gap-2">
            {ressources.map((ressource) => (
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
                      background: 'rgba(59, 130, 246, 0.1)',
                      color: '#3b82f6'
                    }}
                  >
                    <FileText size={20} />
                  </div>
                  <div>
                    <div className="fw-medium mb-1" style={{ fontSize: 13, color: '#1e293b' }}>
                      {ressource.titre}
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
      {activeTab === 'demandes' && renderDemandes()}
    </div>
  );
};

// Made with Bob
