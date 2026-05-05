import React, { useState } from 'react';
import { useAuthStore } from '../../store/authStore';
import {
  Send, Calendar, Users, MessageSquare, Bell, Plus, Search, Filter,
  Edit, Trash2, Eye, CheckCircle, Clock, AlertCircle, Image, FileText,
  Target, TrendingUp, BarChart3, Mail, Globe
} from 'lucide-react';

export const CommunicationPage: React.FC = () => {
  const { user, tenant } = useAuthStore();
  const [activeTab, setActiveTab] = useState<'actualites' | 'evenements' | 'campagnes' | 'stats'>('actualites');

  const stats = [
    {
      label: 'Actualités Publiées',
      value: '48',
      change: 12,
      icon: <Send size={20} />,
      color: '#3b82f6',
      bgColor: 'rgba(59, 130, 246, 0.1)'
    },
    {
      label: 'Événements à Venir',
      value: '8',
      change: 2,
      icon: <Calendar size={20} />,
      color: '#10b981',
      bgColor: 'rgba(16, 185, 129, 0.1)'
    },
    {
      label: 'Taux d\'Engagement',
      value: '78%',
      change: 5,
      icon: <TrendingUp size={20} />,
      color: '#f59e0b',
      bgColor: 'rgba(245, 158, 11, 0.1)'
    },
    {
      label: 'Abonnés Newsletter',
      value: '2,847',
      change: 156,
      icon: <Mail size={20} />,
      color: '#8b5cf6',
      bgColor: 'rgba(139, 92, 246, 0.1)'
    }
  ];

  const actualites = [
    {
      id: 1,
      titre: 'Rentrée Académique 2026-2027',
      contenu: 'La rentrée académique est fixée au 15 septembre 2026. Les inscriptions sont ouvertes...',
      categorie: 'Académique',
      statut: 'Publiée',
      date: '22/12/2025',
      vues: 1247,
      cible: 'Tous',
      auteur: 'Service Communication'
    },
    {
      id: 2,
      titre: 'Cérémonie de Remise des Diplômes',
      contenu: 'La cérémonie de remise des diplômes aura lieu le 30 janvier 2026 à 10h...',
      categorie: 'Événement',
      statut: 'Publiée',
      date: '20/12/2025',
      vues: 892,
      cible: 'Étudiants L3, M2',
      auteur: 'Service Communication'
    },
    {
      id: 3,
      titre: 'Nouvelle Bibliothèque Numérique',
      contenu: 'Accédez à plus de 10,000 ouvrages en ligne via notre nouvelle plateforme...',
      categorie: 'Services',
      statut: 'Brouillon',
      date: '18/12/2025',
      vues: 0,
      cible: 'Tous',
      auteur: 'Service Communication'
    },
    {
      id: 4,
      titre: 'Conférence: Intelligence Artificielle et Éthique',
      contenu: 'Conférence exceptionnelle avec le Pr. Jean MUKENDI sur l\'IA et l\'éthique chrétienne...',
      categorie: 'Académique',
      statut: 'Programmée',
      date: '15/12/2025',
      vues: 0,
      cible: 'Étudiants Info, Théologie',
      auteur: 'Service Communication'
    }
  ];

  const evenements = [
    {
      id: 1,
      titre: 'Messe de Rentrée',
      date: '15/09/2026',
      heure: '09:00',
      lieu: 'Chapelle Universitaire',
      participants: 'Tous',
      statut: 'Planifié',
      description: 'Messe solennelle de rentrée présidée par Mgr. l\'Archevêque'
    },
    {
      id: 2,
      titre: 'Journée Portes Ouvertes',
      date: '20/01/2026',
      heure: '08:00 - 17:00',
      lieu: 'Campus Principal',
      participants: 'Public',
      statut: 'En cours',
      description: 'Découverte des parcours et visite du campus'
    },
    {
      id: 3,
      titre: 'Séminaire de Formation Pédagogique',
      date: '25/01/2026',
      heure: '14:00',
      lieu: 'Amphi A',
      participants: 'Enseignants',
      statut: 'Planifié',
      description: 'Formation sur les nouvelles méthodes pédagogiques'
    },
    {
      id: 4,
      titre: 'Tournoi Sportif Inter-Facultés',
      date: '10/02/2026',
      heure: '08:00',
      lieu: 'Terrain de Sport',
      participants: 'Étudiants',
      statut: 'Planifié',
      description: 'Compétition sportive amicale entre les différentes facultés'
    }
  ];

  const campagnes = [
    {
      id: 1,
      nom: 'Campagne Inscriptions 2026',
      type: 'Email + Réseaux Sociaux',
      debut: '01/01/2026',
      fin: '31/08/2026',
      cible: 'Futurs Étudiants',
      statut: 'Active',
      envois: 5420,
      ouvertures: 3847,
      clics: 1256
    },
    {
      id: 2,
      nom: 'Promotion Master en Théologie',
      type: 'Email',
      debut: '15/12/2025',
      fin: '15/03/2026',
      cible: 'Étudiants L3',
      statut: 'Active',
      envois: 847,
      ouvertures: 623,
      clics: 189
    },
    {
      id: 3,
      nom: 'Journée Portes Ouvertes',
      type: 'Réseaux Sociaux',
      debut: '05/01/2026',
      fin: '20/01/2026',
      cible: 'Public',
      statut: 'Terminée',
      envois: 0,
      ouvertures: 0,
      clics: 0
    }
  ];

  const renderActualites = () => (
    <div className="card border-0 shadow-sm" style={{ borderRadius: 12 }}>
      <div className="card-body p-4">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h5 className="fw-bold mb-0" style={{ color: '#1e293b' }}>
            <Send size={20} className="me-2" />
            Gestion des Actualités
          </h5>
          <div className="d-flex gap-2">
            <div className="input-group input-group-sm" style={{ width: 250 }}>
              <span className="input-group-text">
                <Search size={16} />
              </span>
              <input
                type="text"
                className="form-control"
                placeholder="Rechercher..."
              />
            </div>
            <button className="btn btn-outline-secondary btn-sm">
              <Filter size={16} />
            </button>
            <button className="btn btn-primary btn-sm">
              <Plus size={16} className="me-1" />
              Nouvelle Actualité
            </button>
          </div>
        </div>

        <div className="d-flex flex-column gap-3">
          {actualites.map((actu) => (
            <div
              key={actu.id}
              className="p-3"
              style={{
                background: '#f8fafc',
                borderRadius: 10,
                border: '1px solid #e5e7eb'
              }}
            >
              <div className="d-flex justify-content-between align-items-start mb-2">
                <div className="flex-grow-1">
                  <div className="d-flex align-items-center gap-2 mb-2">
                    <h6 className="fw-bold mb-0" style={{ fontSize: 14, color: '#1e293b' }}>
                      {actu.titre}
                    </h6>
                    <span
                      className="badge"
                      style={{
                        background: 'rgba(59, 130, 246, 0.1)',
                        color: '#3b82f6',
                        fontSize: 10
                      }}
                    >
                      {actu.categorie}
                    </span>
                  </div>
                  <p className="text-muted mb-2" style={{ fontSize: 13 }}>
                    {actu.contenu}
                  </p>
                  <div className="d-flex align-items-center gap-3 text-muted" style={{ fontSize: 12 }}>
                    <span><Calendar size={14} className="me-1" />{actu.date}</span>
                    <span><Eye size={14} className="me-1" />{actu.vues} vues</span>
                    <span><Target size={14} className="me-1" />{actu.cible}</span>
                  </div>
                </div>
                <div className="d-flex flex-column align-items-end gap-2">
                  <span
                    className="badge"
                    style={{
                      background:
                        actu.statut === 'Publiée'
                          ? 'rgba(16, 185, 129, 0.1)'
                          : actu.statut === 'Brouillon'
                          ? 'rgba(100, 116, 139, 0.1)'
                          : 'rgba(245, 158, 11, 0.1)',
                      color:
                        actu.statut === 'Publiée'
                          ? '#10b981'
                          : actu.statut === 'Brouillon'
                          ? '#64748b'
                          : '#f59e0b'
                    }}
                  >
                    {actu.statut}
                  </span>
                  <div className="d-flex gap-1">
                    <button className="btn btn-sm btn-outline-primary">
                      <Edit size={14} />
                    </button>
                    <button className="btn btn-sm btn-outline-secondary">
                      <Eye size={14} />
                    </button>
                    <button className="btn btn-sm btn-outline-danger">
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderEvenements = () => (
    <div className="card border-0 shadow-sm" style={{ borderRadius: 12 }}>
      <div className="card-body p-4">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h5 className="fw-bold mb-0" style={{ color: '#1e293b' }}>
            <Calendar size={20} className="me-2" />
            Calendrier des Événements
          </h5>
          <button className="btn btn-primary btn-sm">
            <Plus size={16} className="me-1" />
            Nouvel Événement
          </button>
        </div>

        <div className="row g-3">
          {evenements.map((event) => (
            <div key={event.id} className="col-12 col-md-6">
              <div
                className="p-3 h-100"
                style={{
                  background: '#f8fafc',
                  borderRadius: 10,
                  border: '1px solid #e5e7eb'
                }}
              >
                <div className="d-flex justify-content-between align-items-start mb-2">
                  <h6 className="fw-bold mb-0" style={{ fontSize: 14, color: '#1e293b' }}>
                    {event.titre}
                  </h6>
                  <span
                    className="badge"
                    style={{
                      background:
                        event.statut === 'En cours'
                          ? 'rgba(16, 185, 129, 0.1)'
                          : 'rgba(59, 130, 246, 0.1)',
                      color: event.statut === 'En cours' ? '#10b981' : '#3b82f6'
                    }}
                  >
                    {event.statut}
                  </span>
                </div>
                <p className="text-muted mb-3" style={{ fontSize: 12 }}>
                  {event.description}
                </p>
                <div className="d-flex flex-column gap-1 mb-3">
                  <div className="d-flex align-items-center gap-2 text-muted" style={{ fontSize: 12 }}>
                    <Calendar size={14} />
                    <span>{event.date} à {event.heure}</span>
                  </div>
                  <div className="d-flex align-items-center gap-2 text-muted" style={{ fontSize: 12 }}>
                    <Globe size={14} />
                    <span>{event.lieu}</span>
                  </div>
                  <div className="d-flex align-items-center gap-2 text-muted" style={{ fontSize: 12 }}>
                    <Users size={14} />
                    <span>{event.participants}</span>
                  </div>
                </div>
                <div className="d-flex gap-2">
                  <button className="btn btn-sm btn-outline-primary flex-grow-1">
                    <Edit size={14} className="me-1" />
                    Modifier
                  </button>
                  <button className="btn btn-sm btn-outline-secondary">
                    <Eye size={14} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderCampagnes = () => (
    <div className="card border-0 shadow-sm" style={{ borderRadius: 12 }}>
      <div className="card-body p-4">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h5 className="fw-bold mb-0" style={{ color: '#1e293b' }}>
            <Target size={20} className="me-2" />
            Campagnes de Communication
          </h5>
          <button className="btn btn-primary btn-sm">
            <Plus size={16} className="me-1" />
            Nouvelle Campagne
          </button>
        </div>

        <div className="table-responsive">
          <table className="table table-hover">
            <thead>
              <tr style={{ background: '#f8fafc' }}>
                <th style={{ fontSize: 13, fontWeight: 600, color: '#64748b' }}>Nom</th>
                <th style={{ fontSize: 13, fontWeight: 600, color: '#64748b' }}>Type</th>
                <th style={{ fontSize: 13, fontWeight: 600, color: '#64748b' }}>Période</th>
                <th style={{ fontSize: 13, fontWeight: 600, color: '#64748b' }}>Cible</th>
                <th style={{ fontSize: 13, fontWeight: 600, color: '#64748b' }}>Performance</th>
                <th style={{ fontSize: 13, fontWeight: 600, color: '#64748b' }}>Statut</th>
                <th style={{ fontSize: 13, fontWeight: 600, color: '#64748b' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {campagnes.map((campagne) => (
                <tr key={campagne.id}>
                  <td style={{ fontSize: 13, fontWeight: 500 }}>{campagne.nom}</td>
                  <td style={{ fontSize: 13 }}>{campagne.type}</td>
                  <td style={{ fontSize: 13, color: '#64748b' }}>
                    {campagne.debut} - {campagne.fin}
                  </td>
                  <td style={{ fontSize: 13 }}>{campagne.cible}</td>
                  <td>
                    {campagne.envois > 0 ? (
                      <div style={{ fontSize: 11 }}>
                        <div className="text-muted">
                          {campagne.envois} envois
                        </div>
                        <div className="text-success">
                          {((campagne.ouvertures / campagne.envois) * 100).toFixed(1)}% ouvertures
                        </div>
                        <div className="text-primary">
                          {((campagne.clics / campagne.envois) * 100).toFixed(1)}% clics
                        </div>
                      </div>
                    ) : (
                      <span className="text-muted" style={{ fontSize: 12 }}>-</span>
                    )}
                  </td>
                  <td>
                    <span
                      className="badge"
                      style={{
                        background:
                          campagne.statut === 'Active'
                            ? 'rgba(16, 185, 129, 0.1)'
                            : 'rgba(100, 116, 139, 0.1)',
                        color: campagne.statut === 'Active' ? '#10b981' : '#64748b'
                      }}
                    >
                      {campagne.statut}
                    </span>
                  </td>
                  <td>
                    <div className="d-flex gap-1">
                      <button className="btn btn-sm btn-outline-primary">
                        <Edit size={14} />
                      </button>
                      <button className="btn btn-sm btn-outline-secondary">
                        <BarChart3 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const renderStats = () => (
    <div className="row g-4">
      <div className="col-12">
        <div className="card border-0 shadow-sm" style={{ borderRadius: 12 }}>
          <div className="card-body p-4">
            <h5 className="fw-bold mb-4" style={{ color: '#1e293b' }}>
              <BarChart3 size={20} className="me-2" />
              Statistiques de Communication
            </h5>
            <div className="alert alert-info d-flex align-items-center" role="alert">
              <AlertCircle size={20} className="me-2" />
              <div style={{ fontSize: 13 }}>
                Les statistiques détaillées seront disponibles prochainement avec l'intégration des outils d'analyse.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="container-fluid p-4">
      {/* Header */}
      <div className="mb-4">
        <h1 className="h3 fw-bold mb-2" style={{ color: '#1e293b' }}>
          Service Communication
        </h1>
        <p className="text-muted mb-0">
          Gestion des actualités, événements et campagnes de communication
        </p>
      </div>

      {/* Stats */}
      <div className="row g-3 mb-4">
        {stats.map((stat, idx) => (
          <div key={idx} className="col-12 col-sm-6 col-lg-3">
            <div className="card border-0 shadow-sm h-100" style={{ borderRadius: 12 }}>
              <div className="card-body p-3">
                <div className="d-flex align-items-start justify-content-between mb-2">
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
                  <div
                    className="d-flex align-items-center gap-1"
                    style={{
                      fontSize: 12,
                      fontWeight: 600,
                      color: '#10b981'
                    }}
                  >
                    <TrendingUp size={14} />
                    +{stat.change}
                  </div>
                </div>
                <div className="fw-bold mb-1" style={{ fontSize: 20, color: '#1e293b' }}>
                  {stat.value}
                </div>
                <div className="text-muted" style={{ fontSize: 12, fontWeight: 500 }}>
                  {stat.label}
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
            { key: 'actualites', label: 'Actualités', icon: <Send size={16} /> },
            { key: 'evenements', label: 'Événements', icon: <Calendar size={16} /> },
            { key: 'campagnes', label: 'Campagnes', icon: <Target size={16} /> },
            { key: 'stats', label: 'Statistiques', icon: <BarChart3 size={16} /> }
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
      {activeTab === 'actualites' && renderActualites()}
      {activeTab === 'evenements' && renderEvenements()}
      {activeTab === 'campagnes' && renderCampagnes()}
      {activeTab === 'stats' && renderStats()}
    </div>
  );
};

// Made with Bob
