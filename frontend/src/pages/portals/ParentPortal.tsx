import React, { useState } from 'react';
import { useAuthStore } from '../../store/authStore';
import {
  User, BarChart3, ClipboardList, CreditCard, MessageSquare, Calendar,
  TrendingUp, TrendingDown, AlertCircle, CheckCircle, Clock, DollarSign,
  BookOpen, Award, Phone, Mail, MapPin, FileText
} from 'lucide-react';

export const ParentPortal: React.FC = () => {
  const { user, tenant } = useAuthStore();
  const [activeTab, setActiveTab] = useState<'overview' | 'notes' | 'absences' | 'paiements' | 'messages'>('overview');

  // Mock data - à remplacer par des appels API
  const enfant = {
    nom: 'MUKENDI',
    prenom: 'Grace',
    matricule: 'ETU-2024-1847',
    parcours: 'Licence en Informatique',
    niveau: 'L2',
    photo: null,
    email: 'grace.mukendi@student.imtech.cd',
    telephone: '+243 812 345 678'
  };

  const stats = [
    {
      label: 'Moyenne Générale',
      value: '14.8/20',
      change: 0.5,
      icon: <BarChart3 size={20} />,
      color: '#10b981',
      bgColor: 'rgba(16, 185, 129, 0.1)'
    },
    {
      label: 'Taux de Présence',
      value: '94%',
      change: -2,
      icon: <CheckCircle size={20} />,
      color: '#3b82f6',
      bgColor: 'rgba(59, 130, 246, 0.1)'
    },
    {
      label: 'Solde Scolarité',
      value: '150K Ar',
      change: null,
      icon: <DollarSign size={20} />,
      color: '#f59e0b',
      bgColor: 'rgba(245, 158, 11, 0.1)'
    },
    {
      label: 'Messages Non Lus',
      value: '3',
      change: null,
      icon: <MessageSquare size={20} />,
      color: '#8b5cf6',
      bgColor: 'rgba(139, 92, 246, 0.1)'
    }
  ];

  const recentNotes = [
    { matiere: 'Algorithmique Avancée', note: 16, coef: 3, date: '15/12/2025', mention: 'Bien' },
    { matiere: 'Base de Données', note: 14.5, coef: 3, date: '12/12/2025', mention: 'Assez Bien' },
    { matiere: 'Réseaux Informatiques', note: 15, coef: 2, date: '10/12/2025', mention: 'Bien' },
    { matiere: 'Anglais Technique', note: 13, coef: 2, date: '08/12/2025', mention: 'Assez Bien' }
  ];

  const absences = [
    { date: '20/12/2025', matiere: 'Algorithmique Avancée', type: 'Absence', justifiee: true, motif: 'Maladie (certificat médical)' },
    { date: '18/12/2025', matiere: 'Base de Données', type: 'Retard', justifiee: false, motif: '-' },
    { date: '15/12/2025', matiere: 'Réseaux Informatiques', type: 'Absence', justifiee: true, motif: 'Rendez-vous médical' }
  ];

  const paiements = [
    { date: '05/01/2026', montant: 200000, motif: 'Frais de scolarité - Janvier', statut: 'Payé', reference: 'PAY-2026-001' },
    { date: '05/12/2025', montant: 200000, motif: 'Frais de scolarité - Décembre', statut: 'Payé', reference: 'PAY-2025-012' },
    { date: '05/11/2025', montant: 200000, motif: 'Frais de scolarité - Novembre', statut: 'Payé', reference: 'PAY-2025-011' },
    { date: '05/02/2026', montant: 200000, motif: 'Frais de scolarité - Février', statut: 'En attente', reference: '-' }
  ];

  const messages = [
    { expediteur: 'Secrétariat L2 Informatique', sujet: 'Convocation réunion parents', date: '22/12/2025', lu: false },
    { expediteur: 'Service Scolarité', sujet: 'Relevé de notes disponible', date: '20/12/2025', lu: false },
    { expediteur: 'Surveillant Général', sujet: 'Justificatif d\'absence requis', date: '18/12/2025', lu: false },
    { expediteur: 'Prof. Algorithmique', sujet: 'Félicitations pour les résultats', date: '15/12/2025', lu: true }
  ];

  const renderOverview = () => (
    <div className="row g-4">
      {/* Student Info Card */}
      <div className="col-12 col-lg-4">
        <div className="card border-0 shadow-sm" style={{ borderRadius: 12 }}>
          <div className="card-body p-4">
            <div className="text-center mb-4">
              <div
                className="mx-auto mb-3 d-flex align-items-center justify-content-center"
                style={{
                  width: 80,
                  height: 80,
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
                  color: '#fff',
                  fontSize: 32,
                  fontWeight: 700
                }}
              >
                {enfant.prenom.charAt(0)}{enfant.nom.charAt(0)}
              </div>
              <h5 className="fw-bold mb-1" style={{ color: '#1e293b' }}>
                {enfant.prenom} {enfant.nom}
              </h5>
              <p className="text-muted mb-2" style={{ fontSize: 13 }}>
                {enfant.matricule}
              </p>
              <span className="badge bg-primary">{enfant.parcours}</span>
              <span className="badge bg-secondary ms-2">{enfant.niveau}</span>
            </div>
            <div className="d-flex flex-column gap-2">
              <div className="d-flex align-items-center gap-2 text-muted" style={{ fontSize: 13 }}>
                <Mail size={16} />
                <span className="text-truncate">{enfant.email}</span>
              </div>
              <div className="d-flex align-items-center gap-2 text-muted" style={{ fontSize: 13 }}>
                <Phone size={16} />
                <span>{enfant.telephone}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="col-12 col-lg-8">
        <div className="row g-3">
          {stats.map((stat, idx) => (
            <div key={idx} className="col-12 col-sm-6">
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
                    {stat.change !== null && (
                      <div
                        className="d-flex align-items-center gap-1"
                        style={{
                          fontSize: 12,
                          fontWeight: 600,
                          color: stat.change >= 0 ? '#10b981' : '#ef4444'
                        }}
                      >
                        {stat.change >= 0 ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                        {Math.abs(stat.change)}
                      </div>
                    )}
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
      </div>

      {/* Recent Notes */}
      <div className="col-12 col-lg-6">
        <div className="card border-0 shadow-sm" style={{ borderRadius: 12 }}>
          <div className="card-body p-4">
            <h5 className="fw-bold mb-3" style={{ color: '#1e293b' }}>
              <Award size={20} className="me-2" />
              Dernières Notes
            </h5>
            <div className="d-flex flex-column gap-2">
              {recentNotes.map((note, idx) => (
                <div key={idx} className="p-3" style={{ background: '#f8fafc', borderRadius: 10 }}>
                  <div className="d-flex justify-content-between align-items-start mb-2">
                    <div className="fw-medium" style={{ fontSize: 13, color: '#1e293b' }}>
                      {note.matiere}
                    </div>
                    <span
                      className="badge"
                      style={{
                        background: note.note >= 16 ? 'rgba(16, 185, 129, 0.1)' : note.note >= 14 ? 'rgba(59, 130, 246, 0.1)' : 'rgba(245, 158, 11, 0.1)',
                        color: note.note >= 16 ? '#10b981' : note.note >= 14 ? '#3b82f6' : '#f59e0b'
                      }}
                    >
                      {note.note}/20
                    </span>
                  </div>
                  <div className="d-flex justify-content-between align-items-center">
                    <span className="text-muted" style={{ fontSize: 11 }}>
                      Coef. {note.coef} • {note.date}
                    </span>
                    <span className="text-muted" style={{ fontSize: 11 }}>
                      {note.mention}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Recent Absences */}
      <div className="col-12 col-lg-6">
        <div className="card border-0 shadow-sm" style={{ borderRadius: 12 }}>
          <div className="card-body p-4">
            <h5 className="fw-bold mb-3" style={{ color: '#1e293b' }}>
              <ClipboardList size={20} className="me-2" />
              Absences & Retards Récents
            </h5>
            <div className="d-flex flex-column gap-2">
              {absences.map((absence, idx) => (
                <div
                  key={idx}
                  className="p-3"
                  style={{
                    background: '#f8fafc',
                    borderRadius: 10,
                    borderLeft: `3px solid ${absence.justifiee ? '#10b981' : '#ef4444'}`
                  }}
                >
                  <div className="d-flex justify-content-between align-items-start mb-2">
                    <div className="fw-medium" style={{ fontSize: 13, color: '#1e293b' }}>
                      {absence.matiere}
                    </div>
                    <span
                      className="badge"
                      style={{
                        background: absence.type === 'Absence' ? 'rgba(239, 68, 68, 0.1)' : 'rgba(245, 158, 11, 0.1)',
                        color: absence.type === 'Absence' ? '#ef4444' : '#f59e0b'
                      }}
                    >
                      {absence.type}
                    </span>
                  </div>
                  <div className="text-muted mb-1" style={{ fontSize: 11 }}>
                    {absence.date}
                  </div>
                  <div className="d-flex align-items-center gap-2">
                    {absence.justifiee ? (
                      <CheckCircle size={14} color="#10b981" />
                    ) : (
                      <AlertCircle size={14} color="#ef4444" />
                    )}
                    <span className="text-muted" style={{ fontSize: 11 }}>
                      {absence.motif}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderNotes = () => (
    <div className="card border-0 shadow-sm" style={{ borderRadius: 12 }}>
      <div className="card-body p-4">
        <h5 className="fw-bold mb-4" style={{ color: '#1e293b' }}>
          Bulletin de Notes - Semestre 1 (2025-2026)
        </h5>
        <div className="table-responsive">
          <table className="table table-hover">
            <thead>
              <tr style={{ background: '#f8fafc' }}>
                <th style={{ fontSize: 13, fontWeight: 600, color: '#64748b' }}>Matière</th>
                <th style={{ fontSize: 13, fontWeight: 600, color: '#64748b' }}>Note</th>
                <th style={{ fontSize: 13, fontWeight: 600, color: '#64748b' }}>Coef.</th>
                <th style={{ fontSize: 13, fontWeight: 600, color: '#64748b' }}>Date</th>
                <th style={{ fontSize: 13, fontWeight: 600, color: '#64748b' }}>Mention</th>
              </tr>
            </thead>
            <tbody>
              {recentNotes.map((note, idx) => (
                <tr key={idx}>
                  <td style={{ fontSize: 13, fontWeight: 500 }}>{note.matiere}</td>
                  <td>
                    <span
                      className="badge"
                      style={{
                        background: note.note >= 16 ? 'rgba(16, 185, 129, 0.1)' : note.note >= 14 ? 'rgba(59, 130, 246, 0.1)' : 'rgba(245, 158, 11, 0.1)',
                        color: note.note >= 16 ? '#10b981' : note.note >= 14 ? '#3b82f6' : '#f59e0b',
                        fontSize: 13,
                        fontWeight: 600
                      }}
                    >
                      {note.note}/20
                    </span>
                  </td>
                  <td style={{ fontSize: 13 }}>{note.coef}</td>
                  <td style={{ fontSize: 13, color: '#64748b' }}>{note.date}</td>
                  <td style={{ fontSize: 13, color: '#64748b' }}>{note.mention}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const renderAbsences = () => (
    <div className="card border-0 shadow-sm" style={{ borderRadius: 12 }}>
      <div className="card-body p-4">
        <h5 className="fw-bold mb-4" style={{ color: '#1e293b' }}>
          Historique des Absences & Retards
        </h5>
        <div className="d-flex flex-column gap-3">
          {absences.map((absence, idx) => (
            <div
              key={idx}
              className="p-3"
              style={{
                background: '#f8fafc',
                borderRadius: 10,
                borderLeft: `4px solid ${absence.justifiee ? '#10b981' : '#ef4444'}`
              }}
            >
              <div className="d-flex justify-content-between align-items-start mb-2">
                <div>
                  <div className="fw-bold mb-1" style={{ fontSize: 14, color: '#1e293b' }}>
                    {absence.matiere}
                  </div>
                  <div className="text-muted" style={{ fontSize: 12 }}>
                    {absence.date}
                  </div>
                </div>
                <span
                  className="badge"
                  style={{
                    background: absence.type === 'Absence' ? 'rgba(239, 68, 68, 0.1)' : 'rgba(245, 158, 11, 0.1)',
                    color: absence.type === 'Absence' ? '#ef4444' : '#f59e0b'
                  }}
                >
                  {absence.type}
                </span>
              </div>
              <div className="d-flex align-items-center gap-2">
                {absence.justifiee ? (
                  <>
                    <CheckCircle size={16} color="#10b981" />
                    <span style={{ fontSize: 13, color: '#10b981', fontWeight: 500 }}>Justifiée</span>
                  </>
                ) : (
                  <>
                    <AlertCircle size={16} color="#ef4444" />
                    <span style={{ fontSize: 13, color: '#ef4444', fontWeight: 500 }}>Non justifiée</span>
                  </>
                )}
                <span className="text-muted ms-2" style={{ fontSize: 12 }}>
                  {absence.motif}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderPaiements = () => (
    <div className="card border-0 shadow-sm" style={{ borderRadius: 12 }}>
      <div className="card-body p-4">
        <h5 className="fw-bold mb-4" style={{ color: '#1e293b' }}>
          Historique des Paiements
        </h5>
        <div className="table-responsive">
          <table className="table table-hover">
            <thead>
              <tr style={{ background: '#f8fafc' }}>
                <th style={{ fontSize: 13, fontWeight: 600, color: '#64748b' }}>Date</th>
                <th style={{ fontSize: 13, fontWeight: 600, color: '#64748b' }}>Motif</th>
                <th style={{ fontSize: 13, fontWeight: 600, color: '#64748b' }}>Montant</th>
                <th style={{ fontSize: 13, fontWeight: 600, color: '#64748b' }}>Référence</th>
                <th style={{ fontSize: 13, fontWeight: 600, color: '#64748b' }}>Statut</th>
              </tr>
            </thead>
            <tbody>
              {paiements.map((paiement, idx) => (
                <tr key={idx}>
                  <td style={{ fontSize: 13 }}>{paiement.date}</td>
                  <td style={{ fontSize: 13, fontWeight: 500 }}>{paiement.motif}</td>
                  <td style={{ fontSize: 13, fontWeight: 600 }}>{paiement.montant.toLocaleString()} Ar</td>
                  <td style={{ fontSize: 13, color: '#64748b' }}>{paiement.reference}</td>
                  <td>
                    <span
                      className="badge"
                      style={{
                        background: paiement.statut === 'Payé' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(245, 158, 11, 0.1)',
                        color: paiement.statut === 'Payé' ? '#10b981' : '#f59e0b'
                      }}
                    >
                      {paiement.statut}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const renderMessages = () => (
    <div className="card border-0 shadow-sm" style={{ borderRadius: 12 }}>
      <div className="card-body p-4">
        <h5 className="fw-bold mb-4" style={{ color: '#1e293b' }}>
          Messagerie
        </h5>
        <div className="d-flex flex-column gap-2">
          {messages.map((message, idx) => (
            <div
              key={idx}
              className="p-3"
              style={{
                background: message.lu ? '#fff' : '#f0f9ff',
                borderRadius: 10,
                border: '1px solid',
                borderColor: message.lu ? '#e5e7eb' : '#bfdbfe',
                cursor: 'pointer'
              }}
            >
              <div className="d-flex justify-content-between align-items-start mb-2">
                <div className="fw-bold" style={{ fontSize: 13, color: '#1e293b' }}>
                  {message.expediteur}
                </div>
                <span className="text-muted" style={{ fontSize: 11 }}>
                  {message.date}
                </span>
              </div>
              <div className="d-flex align-items-center gap-2">
                {!message.lu && (
                  <div
                    style={{
                      width: 8,
                      height: 8,
                      borderRadius: '50%',
                      background: '#3b82f6'
                    }}
                  />
                )}
                <div style={{ fontSize: 13, color: '#64748b' }}>
                  {message.sujet}
                </div>
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
          Portail Parent
        </h1>
        <p className="text-muted mb-0">
          Suivi académique et financier de votre enfant
        </p>
      </div>

      {/* Tabs */}
      <div className="mb-4">
        <div className="d-flex gap-2 flex-wrap">
          {[
            { key: 'overview', label: 'Vue d\'ensemble', icon: <User size={16} /> },
            { key: 'notes', label: 'Bulletins', icon: <BarChart3 size={16} /> },
            { key: 'absences', label: 'Absences', icon: <ClipboardList size={16} /> },
            { key: 'paiements', label: 'Paiements', icon: <CreditCard size={16} /> },
            { key: 'messages', label: 'Messages', icon: <MessageSquare size={16} /> }
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
      {activeTab === 'overview' && renderOverview()}
      {activeTab === 'notes' && renderNotes()}
      {activeTab === 'absences' && renderAbsences()}
      {activeTab === 'paiements' && renderPaiements()}
      {activeTab === 'messages' && renderMessages()}
    </div>
  );
};

// Made with Bob
