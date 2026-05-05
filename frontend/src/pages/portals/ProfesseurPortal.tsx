import React, { useState } from 'react';
import { useAuthStore } from '../../store/authStore';
import {
  BookText, Pencil, CheckSquare, GraduationCap, Folder, FlaskConical,
  Calendar, Clock, Users, FileText, Upload, Download, Plus, Search,
  Filter, BarChart3, Award, AlertCircle, CheckCircle, MessageSquare
} from 'lucide-react';

export const ProfesseurPortal: React.FC = () => {
  const { user, tenant } = useAuthStore();
  const [activeTab, setActiveTab] = useState<'cours' | 'notes' | 'presences' | 'etudiants' | 'ressources' | 'demandes'>('cours');

  // Mock data
  const mesCours = [
    {
      id: 1,
      nom: 'Algorithmique Avancée',
      code: 'INFO-301',
      niveau: 'L3 Informatique',
      heures: '48h CM + 24h TD',
      etudiants: 45,
      prochainCours: '05/01/2026 08:00',
      salle: 'Amphi A'
    },
    {
      id: 2,
      nom: 'Base de Données Distribuées',
      code: 'INFO-302',
      niveau: 'L3 Informatique',
      heures: '36h CM + 36h TP',
      etudiants: 42,
      prochainCours: '06/01/2026 10:00',
      salle: 'Lab Info 2'
    },
    {
      id: 3,
      nom: 'Génie Logiciel',
      code: 'INFO-303',
      niveau: 'L3 Informatique',
      heures: '42h CM + 18h TD',
      etudiants: 48,
      prochainCours: '07/01/2026 14:00',
      salle: 'Salle 205'
    }
  ];

  const stats = [
    {
      label: 'Mes Cours',
      value: '3',
      icon: <BookText size={20} />,
      color: '#3b82f6',
      bgColor: 'rgba(59, 130, 246, 0.1)'
    },
    {
      label: 'Total Étudiants',
      value: '135',
      icon: <Users size={20} />,
      color: '#10b981',
      bgColor: 'rgba(16, 185, 129, 0.1)'
    },
    {
      label: 'Notes à Saisir',
      value: '12',
      icon: <Pencil size={20} />,
      color: '#f59e0b',
      bgColor: 'rgba(245, 158, 11, 0.1)'
    },
    {
      label: 'Ressources',
      value: '24',
      icon: <Folder size={20} />,
      color: '#8b5cf6',
      bgColor: 'rgba(139, 92, 246, 0.1)'
    }
  ];

  const notesASaisir = [
    { cours: 'Algorithmique Avancée', type: 'Examen Final', date: '20/12/2025', etudiants: 45, statut: 'En attente' },
    { cours: 'Base de Données Distribuées', type: 'TP #3', date: '18/12/2025', etudiants: 42, statut: 'En attente' },
    { cours: 'Génie Logiciel', type: 'Projet', date: '15/12/2025', etudiants: 48, statut: 'Partiel' }
  ];

  const etudiants = [
    { matricule: 'ETU-2024-1847', nom: 'MUKENDI Grace', parcours: 'L3 Info', moyenne: 14.8, presence: 94, photo: null },
    { matricule: 'ETU-2024-1523', nom: 'KABONGO Jean', parcours: 'L3 Info', moyenne: 16.2, presence: 98, photo: null },
    { matricule: 'ETU-2024-1698', nom: 'TSHIMANGA Marie', parcours: 'L3 Info', moyenne: 13.5, presence: 89, photo: null },
    { matricule: 'ETU-2024-1432', nom: 'MBUYI Patrick', parcours: 'L3 Info', moyenne: 15.7, presence: 96, photo: null }
  ];

  const ressources = [
    { titre: 'Cours 1 - Introduction aux Algorithmes', type: 'PDF', taille: '2.4 MB', date: '15/12/2025', telechargements: 42 },
    { titre: 'TP 3 - Arbres Binaires', type: 'PDF', taille: '1.8 MB', date: '18/12/2025', telechargements: 38 },
    { titre: 'Correction Examen Partiel', type: 'PDF', taille: '3.2 MB', date: '20/12/2025', telechargements: 45 },
    { titre: 'Projet Final - Énoncé', type: 'DOCX', taille: '856 KB', date: '22/12/2025', telechargements: 44 }
  ];

  const demandes = [
    { type: 'Matériel', objet: 'Projecteur pour Amphi A', date: '22/12/2025', statut: 'Approuvée', priorite: 'Haute' },
    { type: 'Salle', objet: 'Réservation Lab Info 3 - TP Final', date: '20/12/2025', statut: 'En attente', priorite: 'Moyenne' },
    { type: 'Matériel', objet: 'Marqueurs et effaceur', date: '18/12/2025', statut: 'Livrée', priorite: 'Basse' }
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
                <div className="d-flex align-items-center gap-2">
                  <Calendar size={16} color="#64748b" />
                  <span className="text-muted" style={{ fontSize: 13 }}>
                    Prochain cours: {cours.prochainCours} - {cours.salle}
                  </span>
                </div>
              </div>

              <div className="d-flex gap-2">
                <button className="btn btn-sm btn-primary flex-grow-1">
                  <FileText size={14} className="me-1" />
                  Ressources
                </button>
                <button className="btn btn-sm btn-outline-primary">
                  <Pencil size={14} className="me-1" />
                  Notes
                </button>
                <button className="btn btn-sm btn-outline-primary">
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
          <button className="btn btn-primary btn-sm">
            <Plus size={16} className="me-1" />
            Nouvelle Évaluation
          </button>
        </div>

        <div className="d-flex flex-column gap-3">
          {notesASaisir.map((note, idx) => (
            <div
              key={idx}
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
                    {note.cours}
                  </div>
                  <div className="text-muted" style={{ fontSize: 12 }}>
                    {note.type} • {note.date}
                  </div>
                </div>
                <span
                  className="badge"
                  style={{
                    background: note.statut === 'En attente' ? 'rgba(245, 158, 11, 0.1)' : 'rgba(59, 130, 246, 0.1)',
                    color: note.statut === 'En attente' ? '#f59e0b' : '#3b82f6'
                  }}
                >
                  {note.statut}
                </span>
              </div>
              <div className="d-flex justify-content-between align-items-center">
                <span className="text-muted" style={{ fontSize: 13 }}>
                  {note.etudiants} étudiants
                </span>
                <button className="btn btn-sm btn-primary">
                  Saisir les notes
                </button>
              </div>
            </div>
          ))}
        </div>
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
            <select className="form-select form-select-sm" style={{ width: 'auto' }}>
              <option>Tous les cours</option>
              {mesCours.map(c => <option key={c.id}>{c.nom}</option>)}
            </select>
            <button className="btn btn-primary btn-sm">
              <Plus size={16} className="me-1" />
              Nouvelle Feuille
            </button>
          </div>
        </div>

        <div className="alert alert-info d-flex align-items-center" role="alert">
          <AlertCircle size={20} className="me-2" />
          <div style={{ fontSize: 13 }}>
            Utilisez le système de pointage numérique ou saisissez manuellement les présences pour chaque séance.
          </div>
        </div>

        <div className="row g-3 mt-2">
          {mesCours.map((cours) => (
            <div key={cours.id} className="col-12 col-md-6">
              <div className="p-3" style={{ background: '#f8fafc', borderRadius: 10 }}>
                <div className="fw-bold mb-2" style={{ fontSize: 14, color: '#1e293b' }}>
                  {cours.nom}
                </div>
                <div className="d-flex justify-content-between align-items-center">
                  <span className="text-muted" style={{ fontSize: 13 }}>
                    {cours.etudiants} étudiants
                  </span>
                  <button className="btn btn-sm btn-outline-primary">
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
            <div className="input-group input-group-sm" style={{ width: 250 }}>
              <span className="input-group-text">
                <Search size={16} />
              </span>
              <input
                type="text"
                className="form-control"
                placeholder="Rechercher un étudiant..."
              />
            </div>
            <button className="btn btn-outline-secondary btn-sm">
              <Filter size={16} />
            </button>
          </div>
        </div>

        <div className="table-responsive">
          <table className="table table-hover">
            <thead>
              <tr style={{ background: '#f8fafc' }}>
                <th style={{ fontSize: 13, fontWeight: 600, color: '#64748b' }}>Matricule</th>
                <th style={{ fontSize: 13, fontWeight: 600, color: '#64748b' }}>Nom</th>
                <th style={{ fontSize: 13, fontWeight: 600, color: '#64748b' }}>Parcours</th>
                <th style={{ fontSize: 13, fontWeight: 600, color: '#64748b' }}>Moyenne</th>
                <th style={{ fontSize: 13, fontWeight: 600, color: '#64748b' }}>Présence</th>
                <th style={{ fontSize: 13, fontWeight: 600, color: '#64748b' }}>Actions</th>
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
                        {etudiant.nom.split(' ').map(n => n[0]).join('')}
                      </div>
                      <span style={{ fontSize: 13, fontWeight: 500 }}>{etudiant.nom}</span>
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
                      {etudiant.moyenne}/20
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
                  <td>
                    <button className="btn btn-sm btn-outline-primary">
                      Voir détails
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
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
          <button className="btn btn-primary btn-sm">
            <Upload size={16} className="me-1" />
            Ajouter une ressource
          </button>
        </div>

        <div className="d-flex flex-column gap-2">
          {ressources.map((ressource, idx) => (
            <div
              key={idx}
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
                    {ressource.type} • {ressource.taille} • {ressource.date} • {ressource.telechargements} téléchargements
                  </div>
                </div>
              </div>
              <div className="d-flex gap-2">
                <button className="btn btn-sm btn-outline-primary">
                  <Download size={14} />
                </button>
                <button className="btn btn-sm btn-outline-secondary">
                  <Pencil size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
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
          <button className="btn btn-primary btn-sm">
            <Plus size={16} className="me-1" />
            Nouvelle Demande
          </button>
        </div>

        <div className="d-flex flex-column gap-3">
          {demandes.map((demande, idx) => (
            <div
              key={idx}
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
                    {demande.type}
                  </span>
                  <div className="fw-bold mb-1" style={{ fontSize: 14, color: '#1e293b' }}>
                    {demande.objet}
                  </div>
                  <div className="text-muted" style={{ fontSize: 12 }}>
                    {demande.date}
                  </div>
                </div>
                <span
                  className="badge"
                  style={{
                    background:
                      demande.statut === 'Approuvée'
                        ? 'rgba(16, 185, 129, 0.1)'
                        : demande.statut === 'Livrée'
                        ? 'rgba(59, 130, 246, 0.1)'
                        : 'rgba(245, 158, 11, 0.1)',
                    color:
                      demande.statut === 'Approuvée'
                        ? '#10b981'
                        : demande.statut === 'Livrée'
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
      </div>
    </div>
  );

  return (
    <div className="container-fluid p-4">
      {/* Header */}
      <div className="mb-4">
        <h1 className="h3 fw-bold mb-2" style={{ color: '#1e293b' }}>
          Portail Professeur
        </h1>
        <p className="text-muted mb-0">
          Gestion de vos cours, notes et ressources pédagogiques
        </p>
      </div>

      {/* Stats */}
      <div className="row g-3 mb-4">
        {stats.map((stat, idx) => (
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
            { key: 'cours', label: 'Mes Cours', icon: <BookText size={16} /> },
            { key: 'notes', label: 'Saisie Notes', icon: <Pencil size={16} /> },
            { key: 'presences', label: 'Présences', icon: <CheckSquare size={16} /> },
            { key: 'etudiants', label: 'Étudiants', icon: <GraduationCap size={16} /> },
            { key: 'ressources', label: 'Ressources', icon: <Folder size={16} /> },
            { key: 'demandes', label: 'Demandes', icon: <FlaskConical size={16} /> }
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as any)}
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
