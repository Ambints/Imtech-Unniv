import React, { useState } from 'react';
import { useAuthStore } from '../../store/authStore';
import {
  Users, FileText, CreditCard, MapPin, Sparkles, Target, Plus, Search,
  Filter, Edit, Trash2, Eye, Calendar, Clock, DollarSign, Award,
  TrendingUp, AlertCircle, CheckCircle, Download, Upload
} from 'lucide-react';

export const RHPage: React.FC = () => {
  const { user, tenant } = useAuthStore();
  const [activeTab, setActiveTab] = useState<'personnel' | 'contrats' | 'paie' | 'conges' | 'evaluations'>('personnel');

  const stats = [
    {
      label: 'Total Personnel',
      value: '156',
      change: 5,
      icon: <Users size={20} />,
      color: '#3b82f6',
      bgColor: 'rgba(59, 130, 246, 0.1)'
    },
    {
      label: 'Enseignants',
      value: '98',
      change: 3,
      icon: <Award size={20} />,
      color: '#10b981',
      bgColor: 'rgba(16, 185, 129, 0.1)'
    },
    {
      label: 'Administratifs',
      value: '58',
      change: 2,
      icon: <Users size={20} />,
      color: '#f59e0b',
      bgColor: 'rgba(245, 158, 11, 0.1)'
    },
    {
      label: 'Masse Salariale',
      value: '45M Ar',
      change: 8,
      icon: <DollarSign size={20} />,
      color: '#8b5cf6',
      bgColor: 'rgba(139, 92, 246, 0.1)'
    }
  ];

  const personnel = [
    {
      id: 1,
      nom: 'Dr. MUKENDI Jean',
      poste: 'Professeur Titulaire',
      departement: 'Informatique',
      type: 'Permanent',
      statut: 'Actif',
      dateEmbauche: '15/09/2018',
      salaire: '450,000 Ar'
    },
    {
      id: 2,
      nom: 'KABONGO Marie',
      poste: 'Secrétaire Académique',
      departement: 'Administration',
      type: 'Permanent',
      statut: 'Actif',
      dateEmbauche: '01/02/2020',
      salaire: '280,000 Ar'
    },
    {
      id: 3,
      nom: 'Prof. TSHIMANGA Paul',
      poste: 'Enseignant Vacataire',
      departement: 'Théologie',
      type: 'Vacataire',
      statut: 'Actif',
      dateEmbauche: '10/09/2023',
      salaire: '15,000 Ar/h'
    },
    {
      id: 4,
      nom: 'MBUYI Grace',
      poste: 'Bibliothécaire',
      departement: 'Services',
      type: 'CDD',
      statut: 'Actif',
      dateEmbauche: '01/01/2025',
      salaire: '220,000 Ar'
    }
  ];

  const contrats = [
    {
      id: 1,
      employe: 'Dr. MUKENDI Jean',
      type: 'CDI',
      debut: '15/09/2018',
      fin: '-',
      statut: 'Actif',
      document: 'contrat_mukendi.pdf'
    },
    {
      id: 2,
      employe: 'MBUYI Grace',
      type: 'CDD',
      debut: '01/01/2025',
      fin: '31/12/2025',
      statut: 'Actif',
      document: 'contrat_mbuyi.pdf'
    },
    {
      id: 3,
      employe: 'Prof. TSHIMANGA Paul',
      type: 'Vacation',
      debut: '10/09/2023',
      fin: '30/06/2026',
      statut: 'Actif',
      document: 'contrat_tshimanga.pdf'
    }
  ];

  const paies = [
    {
      mois: 'Janvier 2026',
      employes: 156,
      montantTotal: '45,200,000 Ar',
      statut: 'Payé',
      date: '28/01/2026'
    },
    {
      mois: 'Décembre 2025',
      employes: 154,
      montantTotal: '44,800,000 Ar',
      statut: 'Payé',
      date: '28/12/2025'
    },
    {
      mois: 'Novembre 2025',
      employes: 152,
      montantTotal: '44,100,000 Ar',
      statut: 'Payé',
      date: '28/11/2025'
    }
  ];

  const conges = [
    {
      employe: 'Dr. MUKENDI Jean',
      type: 'Congé Annuel',
      debut: '15/07/2026',
      fin: '15/08/2026',
      duree: '31 jours',
      statut: 'Approuvé'
    },
    {
      employe: 'KABONGO Marie',
      type: 'Congé Maladie',
      debut: '05/01/2026',
      fin: '10/01/2026',
      duree: '5 jours',
      statut: 'Approuvé'
    },
    {
      employe: 'MBUYI Grace',
      type: 'Congé Annuel',
      debut: '20/02/2026',
      fin: '05/03/2026',
      duree: '14 jours',
      statut: 'En attente'
    }
  ];

  const evaluations = [
    {
      employe: 'Dr. MUKENDI Jean',
      periode: '2025',
      note: 18,
      appreciation: 'Excellent',
      date: '15/12/2025',
      statut: 'Validée'
    },
    {
      employe: 'KABONGO Marie',
      periode: '2025',
      note: 16,
      appreciation: 'Très Bien',
      date: '18/12/2025',
      statut: 'Validée'
    },
    {
      employe: 'MBUYI Grace',
      periode: '2025',
      note: 15,
      appreciation: 'Bien',
      date: '20/12/2025',
      statut: 'En cours'
    }
  ];

  const renderPersonnel = () => (
    <div className="card border-0 shadow-sm" style={{ borderRadius: 12 }}>
      <div className="card-body p-4">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h5 className="fw-bold mb-0" style={{ color: '#1e293b' }}>
            <Users size={20} className="me-2" />
            Gestion du Personnel
          </h5>
          <div className="d-flex gap-2">
            <div className="input-group input-group-sm" style={{ width: 250 }}>
              <span className="input-group-text">
                <Search size={16} />
              </span>
              <input type="text" className="form-control" placeholder="Rechercher..." />
            </div>
            <button className="btn btn-outline-secondary btn-sm">
              <Filter size={16} />
            </button>
            <button className="btn btn-primary btn-sm">
              <Plus size={16} className="me-1" />
              Nouveau Personnel
            </button>
          </div>
        </div>

        <div className="table-responsive">
          <table className="table table-hover">
            <thead>
              <tr style={{ background: '#f8fafc' }}>
                <th style={{ fontSize: 13, fontWeight: 600, color: '#64748b' }}>Nom</th>
                <th style={{ fontSize: 13, fontWeight: 600, color: '#64748b' }}>Poste</th>
                <th style={{ fontSize: 13, fontWeight: 600, color: '#64748b' }}>Département</th>
                <th style={{ fontSize: 13, fontWeight: 600, color: '#64748b' }}>Type</th>
                <th style={{ fontSize: 13, fontWeight: 600, color: '#64748b' }}>Statut</th>
                <th style={{ fontSize: 13, fontWeight: 600, color: '#64748b' }}>Embauche</th>
                <th style={{ fontSize: 13, fontWeight: 600, color: '#64748b' }}>Salaire</th>
                <th style={{ fontSize: 13, fontWeight: 600, color: '#64748b' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {personnel.map((p) => (
                <tr key={p.id}>
                  <td style={{ fontSize: 13, fontWeight: 500 }}>{p.nom}</td>
                  <td style={{ fontSize: 13 }}>{p.poste}</td>
                  <td style={{ fontSize: 13 }}>{p.departement}</td>
                  <td>
                    <span
                      className="badge"
                      style={{
                        background: p.type === 'Permanent' ? 'rgba(16, 185, 129, 0.1)' : p.type === 'CDD' ? 'rgba(59, 130, 246, 0.1)' : 'rgba(245, 158, 11, 0.1)',
                        color: p.type === 'Permanent' ? '#10b981' : p.type === 'CDD' ? '#3b82f6' : '#f59e0b',
                        fontSize: 11
                      }}
                    >
                      {p.type}
                    </span>
                  </td>
                  <td>
                    <span className="badge bg-success" style={{ fontSize: 11 }}>{p.statut}</span>
                  </td>
                  <td style={{ fontSize: 13, color: '#64748b' }}>{p.dateEmbauche}</td>
                  <td style={{ fontSize: 13, fontWeight: 600 }}>{p.salaire}</td>
                  <td>
                    <div className="d-flex gap-1">
                      <button className="btn btn-sm btn-outline-primary">
                        <Eye size={14} />
                      </button>
                      <button className="btn btn-sm btn-outline-secondary">
                        <Edit size={14} />
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

  const renderContrats = () => (
    <div className="card border-0 shadow-sm" style={{ borderRadius: 12 }}>
      <div className="card-body p-4">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h5 className="fw-bold mb-0" style={{ color: '#1e293b' }}>
            <FileText size={20} className="me-2" />
            Gestion des Contrats
          </h5>
          <button className="btn btn-primary btn-sm">
            <Plus size={16} className="me-1" />
            Nouveau Contrat
          </button>
        </div>

        <div className="table-responsive">
          <table className="table table-hover">
            <thead>
              <tr style={{ background: '#f8fafc' }}>
                <th style={{ fontSize: 13, fontWeight: 600, color: '#64748b' }}>Employé</th>
                <th style={{ fontSize: 13, fontWeight: 600, color: '#64748b' }}>Type</th>
                <th style={{ fontSize: 13, fontWeight: 600, color: '#64748b' }}>Début</th>
                <th style={{ fontSize: 13, fontWeight: 600, color: '#64748b' }}>Fin</th>
                <th style={{ fontSize: 13, fontWeight: 600, color: '#64748b' }}>Statut</th>
                <th style={{ fontSize: 13, fontWeight: 600, color: '#64748b' }}>Document</th>
                <th style={{ fontSize: 13, fontWeight: 600, color: '#64748b' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {contrats.map((c) => (
                <tr key={c.id}>
                  <td style={{ fontSize: 13, fontWeight: 500 }}>{c.employe}</td>
                  <td>
                    <span
                      className="badge"
                      style={{
                        background: c.type === 'CDI' ? 'rgba(16, 185, 129, 0.1)' : c.type === 'CDD' ? 'rgba(59, 130, 246, 0.1)' : 'rgba(245, 158, 11, 0.1)',
                        color: c.type === 'CDI' ? '#10b981' : c.type === 'CDD' ? '#3b82f6' : '#f59e0b'
                      }}
                    >
                      {c.type}
                    </span>
                  </td>
                  <td style={{ fontSize: 13 }}>{c.debut}</td>
                  <td style={{ fontSize: 13 }}>{c.fin}</td>
                  <td>
                    <span className="badge bg-success" style={{ fontSize: 11 }}>{c.statut}</span>
                  </td>
                  <td style={{ fontSize: 13, color: '#64748b' }}>{c.document}</td>
                  <td>
                    <div className="d-flex gap-1">
                      <button className="btn btn-sm btn-outline-primary">
                        <Download size={14} />
                      </button>
                      <button className="btn btn-sm btn-outline-secondary">
                        <Edit size={14} />
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

  const renderPaie = () => (
    <div className="card border-0 shadow-sm" style={{ borderRadius: 12 }}>
      <div className="card-body p-4">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h5 className="fw-bold mb-0" style={{ color: '#1e293b' }}>
            <CreditCard size={20} className="me-2" />
            Gestion de la Paie
          </h5>
          <button className="btn btn-primary btn-sm">
            <Plus size={16} className="me-1" />
            Générer Paie
          </button>
        </div>

        <div className="d-flex flex-column gap-3">
          {paies.map((paie, idx) => (
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
                    {paie.mois}
                  </div>
                  <div className="text-muted" style={{ fontSize: 12 }}>
                    {paie.employes} employés • {paie.date}
                  </div>
                </div>
                <span className="badge bg-success">{paie.statut}</span>
              </div>
              <div className="d-flex justify-content-between align-items-center">
                <div className="fw-bold" style={{ fontSize: 16, color: '#1e293b' }}>
                  {paie.montantTotal}
                </div>
                <div className="d-flex gap-2">
                  <button className="btn btn-sm btn-outline-primary">
                    <Download size={14} className="me-1" />
                    Télécharger
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

  const renderConges = () => (
    <div className="card border-0 shadow-sm" style={{ borderRadius: 12 }}>
      <div className="card-body p-4">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h5 className="fw-bold mb-0" style={{ color: '#1e293b' }}>
            <MapPin size={20} className="me-2" />
            Gestion des Congés
          </h5>
          <button className="btn btn-primary btn-sm">
            <Plus size={16} className="me-1" />
            Nouvelle Demande
          </button>
        </div>

        <div className="table-responsive">
          <table className="table table-hover">
            <thead>
              <tr style={{ background: '#f8fafc' }}>
                <th style={{ fontSize: 13, fontWeight: 600, color: '#64748b' }}>Employé</th>
                <th style={{ fontSize: 13, fontWeight: 600, color: '#64748b' }}>Type</th>
                <th style={{ fontSize: 13, fontWeight: 600, color: '#64748b' }}>Début</th>
                <th style={{ fontSize: 13, fontWeight: 600, color: '#64748b' }}>Fin</th>
                <th style={{ fontSize: 13, fontWeight: 600, color: '#64748b' }}>Durée</th>
                <th style={{ fontSize: 13, fontWeight: 600, color: '#64748b' }}>Statut</th>
                <th style={{ fontSize: 13, fontWeight: 600, color: '#64748b' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {conges.map((conge, idx) => (
                <tr key={idx}>
                  <td style={{ fontSize: 13, fontWeight: 500 }}>{conge.employe}</td>
                  <td style={{ fontSize: 13 }}>{conge.type}</td>
                  <td style={{ fontSize: 13 }}>{conge.debut}</td>
                  <td style={{ fontSize: 13 }}>{conge.fin}</td>
                  <td style={{ fontSize: 13 }}>{conge.duree}</td>
                  <td>
                    <span
                      className="badge"
                      style={{
                        background: conge.statut === 'Approuvé' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(245, 158, 11, 0.1)',
                        color: conge.statut === 'Approuvé' ? '#10b981' : '#f59e0b'
                      }}
                    >
                      {conge.statut}
                    </span>
                  </td>
                  <td>
                    <div className="d-flex gap-1">
                      <button className="btn btn-sm btn-outline-primary">
                        <CheckCircle size={14} />
                      </button>
                      <button className="btn btn-sm btn-outline-danger">
                        <AlertCircle size={14} />
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

  const renderEvaluations = () => (
    <div className="card border-0 shadow-sm" style={{ borderRadius: 12 }}>
      <div className="card-body p-4">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h5 className="fw-bold mb-0" style={{ color: '#1e293b' }}>
            <Sparkles size={20} className="me-2" />
            Évaluations Annuelles
          </h5>
          <button className="btn btn-primary btn-sm">
            <Plus size={16} className="me-1" />
            Nouvelle Évaluation
          </button>
        </div>

        <div className="table-responsive">
          <table className="table table-hover">
            <thead>
              <tr style={{ background: '#f8fafc' }}>
                <th style={{ fontSize: 13, fontWeight: 600, color: '#64748b' }}>Employé</th>
                <th style={{ fontSize: 13, fontWeight: 600, color: '#64748b' }}>Période</th>
                <th style={{ fontSize: 13, fontWeight: 600, color: '#64748b' }}>Note</th>
                <th style={{ fontSize: 13, fontWeight: 600, color: '#64748b' }}>Appréciation</th>
                <th style={{ fontSize: 13, fontWeight: 600, color: '#64748b' }}>Date</th>
                <th style={{ fontSize: 13, fontWeight: 600, color: '#64748b' }}>Statut</th>
                <th style={{ fontSize: 13, fontWeight: 600, color: '#64748b' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {evaluations.map((evaluation, idx) => (
                <tr key={idx}>
                  <td style={{ fontSize: 13, fontWeight: 500 }}>{evaluation.employe}</td>
                  <td style={{ fontSize: 13 }}>{evaluation.periode}</td>
                  <td>
                    <span
                      className="badge"
                      style={{
                        background: evaluation.note >= 16 ? 'rgba(16, 185, 129, 0.1)' : 'rgba(59, 130, 246, 0.1)',
                        color: evaluation.note >= 16 ? '#10b981' : '#3b82f6',
                        fontSize: 13,
                        fontWeight: 600
                      }}
                    >
                      {evaluation.note}/20
                    </span>
                  </td>
                  <td style={{ fontSize: 13 }}>{evaluation.appreciation}</td>
                  <td style={{ fontSize: 13, color: '#64748b' }}>{evaluation.date}</td>
                  <td>
                    <span
                      className="badge"
                      style={{
                        background: evaluation.statut === 'Validée' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(245, 158, 11, 0.1)',
                        color: evaluation.statut === 'Validée' ? '#10b981' : '#f59e0b'
                      }}
                    >
                      {evaluation.statut}
                    </span>
                  </td>
                  <td>
                    <div className="d-flex gap-1">
                      <button className="btn btn-sm btn-outline-primary">
                        <Eye size={14} />
                      </button>
                      <button className="btn btn-sm btn-outline-secondary">
                        <Edit size={14} />
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

  return (
    <div className="container-fluid p-4">
      {/* Header */}
      <div className="mb-4">
        <h1 className="h3 fw-bold mb-2" style={{ color: '#1e293b' }}>
          Ressources Humaines
        </h1>
        <p className="text-muted mb-0">
          Gestion du personnel, contrats, paie et évaluations
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
            { key: 'personnel', label: 'Personnel', icon: <Users size={16} /> },
            { key: 'contrats', label: 'Contrats', icon: <FileText size={16} /> },
            { key: 'paie', label: 'Paie', icon: <CreditCard size={16} /> },
            { key: 'conges', label: 'Congés', icon: <MapPin size={16} /> },
            { key: 'evaluations', label: 'Évaluations', icon: <Sparkles size={16} /> }
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
      {activeTab === 'personnel' && renderPersonnel()}
      {activeTab === 'contrats' && renderContrats()}
      {activeTab === 'paie' && renderPaie()}
      {activeTab === 'conges' && renderConges()}
      {activeTab === 'evaluations' && renderEvaluations()}
    </div>
  );
};

// Made with Bob
