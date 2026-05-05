import React, { useState } from 'react';
import { useAuthStore } from '../../store/authStore';
import {
  Briefcase, Wallet, Landmark, Banknote, BarChart3, TrendingUp, TrendingDown,
  Plus, Search, Filter, Edit, Eye, Download, DollarSign, AlertCircle,
  CheckCircle, Calendar, FileText, Target, PieChart
} from 'lucide-react';

export const EconomatPage: React.FC = () => {
  const { user, tenant } = useAuthStore();
  const [activeTab, setActiveTab] = useState<'budget' | 'depenses' | 'fournisseurs' | 'recouvrement' | 'rapport'>('budget');

  const stats = [
    {
      label: 'Budget Annuel',
      value: '850M Ar',
      change: 12,
      icon: <Briefcase size={20} />,
      color: '#3b82f6',
      bgColor: 'rgba(59, 130, 246, 0.1)'
    },
    {
      label: 'Dépenses Mois',
      value: '45M Ar',
      change: -5,
      icon: <Wallet size={20} />,
      color: '#ef4444',
      bgColor: 'rgba(239, 68, 68, 0.1)'
    },
    {
      label: 'Recouvrement',
      value: '78%',
      change: 8,
      icon: <Banknote size={20} />,
      color: '#10b981',
      bgColor: 'rgba(16, 185, 129, 0.1)'
    },
    {
      label: 'Subventions',
      value: '120M Ar',
      change: 15,
      icon: <Landmark size={20} />,
      color: '#8b5cf6',
      bgColor: 'rgba(139, 92, 246, 0.1)'
    }
  ];

  const budgets = [
    {
      departement: 'Informatique',
      budgetAlloue: '150,000,000 Ar',
      depense: '98,500,000 Ar',
      pourcentage: 65.7,
      statut: 'En cours'
    },
    {
      departement: 'Théologie',
      budgetAlloue: '120,000,000 Ar',
      depense: '85,200,000 Ar',
      pourcentage: 71,
      statut: 'En cours'
    },
    {
      departement: 'Administration',
      budgetAlloue: '200,000,000 Ar',
      depense: '156,000,000 Ar',
      pourcentage: 78,
      statut: 'En cours'
    },
    {
      departement: 'Bibliothèque',
      budgetAlloue: '80,000,000 Ar',
      depense: '52,000,000 Ar',
      pourcentage: 65,
      statut: 'En cours'
    }
  ];

  const depenses = [
    {
      date: '22/01/2026',
      description: 'Achat matériel informatique',
      categorie: 'Équipement',
      montant: '8,500,000 Ar',
      departement: 'Informatique',
      statut: 'Validée'
    },
    {
      date: '20/01/2026',
      description: 'Fournitures de bureau',
      categorie: 'Consommables',
      montant: '1,200,000 Ar',
      departement: 'Administration',
      statut: 'Validée'
    },
    {
      date: '18/01/2026',
      description: 'Abonnement bases de données',
      categorie: 'Services',
      montant: '15,000,000 Ar',
      departement: 'Bibliothèque',
      statut: 'En attente'
    },
    {
      date: '15/01/2026',
      description: 'Maintenance climatisation',
      categorie: 'Maintenance',
      montant: '3,500,000 Ar',
      departement: 'Logistique',
      statut: 'Validée'
    }
  ];

  const fournisseurs = [
    {
      nom: 'TECH SOLUTIONS SARL',
      categorie: 'Informatique',
      contact: '+243 812 345 678',
      email: 'contact@techsolutions.cd',
      montantTotal: '45,000,000 Ar',
      statut: 'Actif'
    },
    {
      nom: 'PAPETERIE MODERNE',
      categorie: 'Fournitures',
      contact: '+243 898 765 432',
      email: 'info@papeterie.cd',
      montantTotal: '12,500,000 Ar',
      statut: 'Actif'
    },
    {
      nom: 'CLIMATECH',
      categorie: 'Maintenance',
      contact: '+243 823 456 789',
      email: 'service@climatech.cd',
      montantTotal: '8,200,000 Ar',
      statut: 'Actif'
    }
  ];

  const recouvrement = [
    {
      parcours: 'Licence Informatique',
      etudiants: 245,
      montantAttendu: '122,500,000 Ar',
      montantRecouvre: '98,000,000 Ar',
      pourcentage: 80,
      impaye: '24,500,000 Ar'
    },
    {
      parcours: 'Master Théologie',
      etudiants: 89,
      montantAttendu: '53,400,000 Ar',
      montantRecouvre: '45,000,000 Ar',
      pourcentage: 84,
      impaye: '8,400,000 Ar'
    },
    {
      parcours: 'Licence Gestion',
      etudiants: 178,
      montantAttendu: '89,000,000 Ar',
      montantRecouvre: '62,300,000 Ar',
      pourcentage: 70,
      impaye: '26,700,000 Ar'
    }
  ];

  const renderBudget = () => (
    <div className="card border-0 shadow-sm" style={{ borderRadius: 12 }}>
      <div className="card-body p-4">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h5 className="fw-bold mb-0" style={{ color: '#1e293b' }}>
            <Briefcase size={20} className="me-2" />
            Budget par Département
          </h5>
          <button className="btn btn-primary btn-sm">
            <Plus size={16} className="me-1" />
            Allouer Budget
          </button>
        </div>

        <div className="d-flex flex-column gap-3">
          {budgets.map((budget, idx) => (
            <div
              key={idx}
              className="p-3"
              style={{
                background: '#f8fafc',
                borderRadius: 10,
                border: '1px solid #e5e7eb'
              }}
            >
              <div className="d-flex justify-content-between align-items-start mb-3">
                <div>
                  <div className="fw-bold mb-1" style={{ fontSize: 14, color: '#1e293b' }}>
                    {budget.departement}
                  </div>
                  <div className="text-muted" style={{ fontSize: 12 }}>
                    Budget alloué: {budget.budgetAlloue}
                  </div>
                </div>
                <span className="badge bg-primary">{budget.statut}</span>
              </div>
              <div className="mb-2">
                <div className="d-flex justify-content-between mb-1">
                  <span className="text-muted" style={{ fontSize: 12 }}>
                    Dépensé: {budget.depense}
                  </span>
                  <span className="fw-bold" style={{ fontSize: 12, color: '#1e293b' }}>
                    {budget.pourcentage}%
                  </span>
                </div>
                <div className="progress" style={{ height: 8, borderRadius: 4 }}>
                  <div
                    className="progress-bar"
                    role="progressbar"
                    style={{
                      width: `${budget.pourcentage}%`,
                      background: budget.pourcentage > 80 ? '#ef4444' : budget.pourcentage > 60 ? '#f59e0b' : '#10b981'
                    }}
                    aria-valuenow={budget.pourcentage}
                    aria-valuemin={0}
                    aria-valuemax={100}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderDepenses = () => (
    <div className="card border-0 shadow-sm" style={{ borderRadius: 12 }}>
      <div className="card-body p-4">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h5 className="fw-bold mb-0" style={{ color: '#1e293b' }}>
            <Wallet size={20} className="me-2" />
            Suivi des Dépenses
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
              Nouvelle Dépense
            </button>
          </div>
        </div>

        <div className="table-responsive">
          <table className="table table-hover">
            <thead>
              <tr style={{ background: '#f8fafc' }}>
                <th style={{ fontSize: 13, fontWeight: 600, color: '#64748b' }}>Date</th>
                <th style={{ fontSize: 13, fontWeight: 600, color: '#64748b' }}>Description</th>
                <th style={{ fontSize: 13, fontWeight: 600, color: '#64748b' }}>Catégorie</th>
                <th style={{ fontSize: 13, fontWeight: 600, color: '#64748b' }}>Département</th>
                <th style={{ fontSize: 13, fontWeight: 600, color: '#64748b' }}>Montant</th>
                <th style={{ fontSize: 13, fontWeight: 600, color: '#64748b' }}>Statut</th>
                <th style={{ fontSize: 13, fontWeight: 600, color: '#64748b' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {depenses.map((depense, idx) => (
                <tr key={idx}>
                  <td style={{ fontSize: 13 }}>{depense.date}</td>
                  <td style={{ fontSize: 13, fontWeight: 500 }}>{depense.description}</td>
                  <td style={{ fontSize: 13 }}>{depense.categorie}</td>
                  <td style={{ fontSize: 13 }}>{depense.departement}</td>
                  <td style={{ fontSize: 13, fontWeight: 600 }}>{depense.montant}</td>
                  <td>
                    <span
                      className="badge"
                      style={{
                        background: depense.statut === 'Validée' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(245, 158, 11, 0.1)',
                        color: depense.statut === 'Validée' ? '#10b981' : '#f59e0b'
                      }}
                    >
                      {depense.statut}
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

  const renderFournisseurs = () => (
    <div className="card border-0 shadow-sm" style={{ borderRadius: 12 }}>
      <div className="card-body p-4">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h5 className="fw-bold mb-0" style={{ color: '#1e293b' }}>
            <Landmark size={20} className="me-2" />
            Gestion des Fournisseurs
          </h5>
          <button className="btn btn-primary btn-sm">
            <Plus size={16} className="me-1" />
            Nouveau Fournisseur
          </button>
        </div>

        <div className="d-flex flex-column gap-3">
          {fournisseurs.map((fournisseur, idx) => (
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
                    {fournisseur.nom}
                  </div>
                  <div className="text-muted mb-2" style={{ fontSize: 12 }}>
                    {fournisseur.categorie}
                  </div>
                  <div className="d-flex flex-column gap-1">
                    <div className="text-muted" style={{ fontSize: 12 }}>
                      📞 {fournisseur.contact}
                    </div>
                    <div className="text-muted" style={{ fontSize: 12 }}>
                      ✉️ {fournisseur.email}
                    </div>
                  </div>
                </div>
                <div className="text-end">
                  <span className="badge bg-success mb-2">{fournisseur.statut}</span>
                  <div className="fw-bold" style={{ fontSize: 14, color: '#1e293b' }}>
                    {fournisseur.montantTotal}
                  </div>
                  <div className="text-muted" style={{ fontSize: 11 }}>
                    Total facturé
                  </div>
                </div>
              </div>
              <div className="d-flex gap-2 mt-2">
                <button className="btn btn-sm btn-outline-primary flex-grow-1">
                  <Eye size={14} className="me-1" />
                  Voir détails
                </button>
                <button className="btn btn-sm btn-outline-secondary">
                  <Edit size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderRecouvrement = () => (
    <div className="card border-0 shadow-sm" style={{ borderRadius: 12 }}>
      <div className="card-body p-4">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h5 className="fw-bold mb-0" style={{ color: '#1e293b' }}>
            <Banknote size={20} className="me-2" />
            Recouvrement des Frais de Scolarité
          </h5>
          <button className="btn btn-primary btn-sm">
            <Download size={16} className="me-1" />
            Exporter
          </button>
        </div>

        <div className="table-responsive">
          <table className="table table-hover">
            <thead>
              <tr style={{ background: '#f8fafc' }}>
                <th style={{ fontSize: 13, fontWeight: 600, color: '#64748b' }}>Parcours</th>
                <th style={{ fontSize: 13, fontWeight: 600, color: '#64748b' }}>Étudiants</th>
                <th style={{ fontSize: 13, fontWeight: 600, color: '#64748b' }}>Attendu</th>
                <th style={{ fontSize: 13, fontWeight: 600, color: '#64748b' }}>Recouvré</th>
                <th style={{ fontSize: 13, fontWeight: 600, color: '#64748b' }}>Taux</th>
                <th style={{ fontSize: 13, fontWeight: 600, color: '#64748b' }}>Impayé</th>
              </tr>
            </thead>
            <tbody>
              {recouvrement.map((rec, idx) => (
                <tr key={idx}>
                  <td style={{ fontSize: 13, fontWeight: 500 }}>{rec.parcours}</td>
                  <td style={{ fontSize: 13 }}>{rec.etudiants}</td>
                  <td style={{ fontSize: 13 }}>{rec.montantAttendu}</td>
                  <td style={{ fontSize: 13, fontWeight: 600, color: '#10b981' }}>{rec.montantRecouvre}</td>
                  <td>
                    <span
                      className="badge"
                      style={{
                        background: rec.pourcentage >= 80 ? 'rgba(16, 185, 129, 0.1)' : 'rgba(245, 158, 11, 0.1)',
                        color: rec.pourcentage >= 80 ? '#10b981' : '#f59e0b',
                        fontSize: 12,
                        fontWeight: 600
                      }}
                    >
                      {rec.pourcentage}%
                    </span>
                  </td>
                  <td style={{ fontSize: 13, fontWeight: 600, color: '#ef4444' }}>{rec.impaye}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const renderRapport = () => (
    <div className="row g-4">
      <div className="col-12">
        <div className="card border-0 shadow-sm" style={{ borderRadius: 12 }}>
          <div className="card-body p-4">
            <h5 className="fw-bold mb-4" style={{ color: '#1e293b' }}>
              <BarChart3 size={20} className="me-2" />
              Rapport Financier Exécutif
            </h5>
            <div className="alert alert-info d-flex align-items-center" role="alert">
              <AlertCircle size={20} className="me-2" />
              <div style={{ fontSize: 13 }}>
                Les rapports financiers détaillés seront disponibles prochainement avec graphiques et analyses.
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
          Économat - Direction Financière
        </h1>
        <p className="text-muted mb-0">
          Gestion du budget, dépenses, fournisseurs et recouvrement
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
                      color: stat.change >= 0 ? '#10b981' : '#ef4444'
                    }}
                  >
                    {stat.change >= 0 ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                    {Math.abs(stat.change)}%
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
            { key: 'budget', label: 'Budget', icon: <Briefcase size={16} /> },
            { key: 'depenses', label: 'Dépenses', icon: <Wallet size={16} /> },
            { key: 'fournisseurs', label: 'Fournisseurs', icon: <Landmark size={16} /> },
            { key: 'recouvrement', label: 'Recouvrement', icon: <Banknote size={16} /> },
            { key: 'rapport', label: 'Rapport', icon: <BarChart3 size={16} /> }
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
      {activeTab === 'budget' && renderBudget()}
      {activeTab === 'depenses' && renderDepenses()}
      {activeTab === 'fournisseurs' && renderFournisseurs()}
      {activeTab === 'recouvrement' && renderRecouvrement()}
      {activeTab === 'rapport' && renderRapport()}
    </div>
  );
};

// Made with Bob
