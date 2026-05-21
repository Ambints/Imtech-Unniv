import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  CheckCircle, Clock, AlertTriangle, Eye, Scale, Users,
  Calendar, TrendingUp, FileText, Bell, QrCode, UserCheck
} from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { api } from '../../api/client';
import toast from 'react-hot-toast';

interface StatCard {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  color: string;
  trend?: string;
  bgColor: string;
}

interface RecentActivity {
  id: string;
  type: 'presence' | 'absence' | 'incident' | 'sanction';
  message: string;
  time: string;
  severity?: 'low' | 'medium' | 'high';
}

interface Alert {
  id: string;
  type: 'absence_repetee' | 'retard_frequent' | 'incident_grave';
  etudiantNom: string;
  message: string;
  gravite: 'faible' | 'moyenne' | 'elevee';
  timestamp: string;
}

export const SurveillanceDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState<StatCard[]>([]);
  const [recentActivities, setRecentActivities] = useState<RecentActivity[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    const { tenant } = useAuthStore.getState();
    if (!tenant?.id) return;

    try {
      // Appel API réel pour récupérer les données du dashboard
      const response = await api.get(`/surveillance/${tenant.id}/dashboard`);
      const data = response.data;

      setStats([
        {
          title: 'Présences Aujourd\'hui',
          value: data.presencesAujourdhui || 0,
          icon: <CheckCircle size={24} />,
          color: '#10b981',
          bgColor: 'rgba(16, 185, 129, 0.1)'
        },
        {
          title: 'Absences Aujourd\'hui',
          value: data.absencesAujourdhui || 0,
          icon: <Clock size={24} />,
          color: '#f59e0b',
          bgColor: 'rgba(245, 158, 11, 0.1)'
        },
        {
          title: 'Alertes Non Lues',
          value: data.alertesNonLues || 0,
          icon: <AlertTriangle size={24} />,
          color: '#ef4444',
          bgColor: 'rgba(239, 68, 68, 0.1)'
        },
        {
          title: 'Examens en Cours',
          value: data.examensEnCours || 0,
          icon: <Eye size={24} />,
          color: '#3b82f6',
          bgColor: 'rgba(59, 130, 246, 0.1)'
        }
      ]);

      // Les activités récentes et alertes seront chargées via d'autres endpoints si disponibles
      setRecentActivities([]);
      setAlerts([]);

      setLoading(false);
    } catch (error: any) {
      console.error('Erreur lors du chargement des données:', error);
      toast.error(error.response?.data?.message || 'Erreur lors du chargement du dashboard');
      setLoading(false);
    }
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'presence': return <CheckCircle size={18} className="text-success" />;
      case 'absence': return <Clock size={18} className="text-warning" />;
      case 'incident': return <AlertTriangle size={18} className="text-danger" />;
      case 'sanction': return <Scale size={18} className="text-info" />;
      default: return <FileText size={18} />;
    }
  };

  const getSeverityBadge = (severity?: string) => {
    switch (severity) {
      case 'high': return 'danger';
      case 'medium': return 'warning';
      case 'low': return 'info';
      default: return 'secondary';
    }
  };

  const getGraviteBadge = (gravite: string) => {
    switch (gravite) {
      case 'elevee': return 'danger';
      case 'moyenne': return 'warning';
      case 'faible': return 'info';
      default: return 'secondary';
    }
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '400px' }}>
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Chargement...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="container-fluid p-4">
      {/* Header */}
      <div className="row mb-4">
        <div className="col">
          <h2 className="mb-1">
            <Eye className="me-2" size={28} />
            Tableau de Bord - Surveillance
          </h2>
          <p className="text-muted mb-0">Vue d'ensemble de la discipline et de l'assiduité</p>
        </div>
        <div className="col-auto">
          <button 
            className="btn btn-primary me-2"
            onClick={() => navigate('/surveillance/presences')}
          >
            <QrCode size={18} className="me-2" />
            Scanner QR Code
          </button>
          <button 
            className="btn btn-outline-primary"
            onClick={() => navigate('/surveillance/incidents')}
          >
            <AlertTriangle size={18} className="me-2" />
            Signaler Incident
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="row g-3 mb-4">
        {stats.map((stat, index) => (
          <div key={index} className="col-12 col-sm-6 col-xl-3">
            <div className="card border-0 shadow-sm h-100">
              <div className="card-body">
                <div className="d-flex align-items-start justify-content-between mb-3">
                  <div 
                    className="rounded-3 p-3 d-flex align-items-center justify-content-center"
                    style={{ backgroundColor: stat.bgColor }}
                  >
                    <div style={{ color: stat.color }}>
                      {stat.icon}
                    </div>
                  </div>
                  {stat.trend && (
                    <span className={`badge ${stat.trend.startsWith('+') ? 'bg-success' : 'bg-danger'} bg-opacity-10 text-${stat.trend.startsWith('+') ? 'success' : 'danger'}`}>
                      {stat.trend}
                    </span>
                  )}
                </div>
                <h3 className="mb-1 fw-bold">{stat.value}</h3>
                <p className="text-muted mb-0 small">{stat.title}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="row g-4">
        {/* Alertes Disciplinaires */}
        <div className="col-12 col-lg-6">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-header bg-white border-0 d-flex align-items-center justify-content-between py-3">
              <h5 className="mb-0 fw-semibold">
                <Bell size={20} className="me-2 text-danger" />
                Alertes Disciplinaires
              </h5>
              <span className="badge bg-danger">{alerts.length}</span>
            </div>
            <div className="card-body">
              {alerts.length === 0 ? (
                <div className="text-center py-5 text-muted">
                  <Bell size={48} className="mb-3 opacity-25" />
                  <p>Aucune alerte pour le moment</p>
                </div>
              ) : (
                <div className="list-group list-group-flush">
                  {alerts.map((alert) => (
                    <div key={alert.id} className="list-group-item px-0 border-0 border-bottom">
                      <div className="d-flex align-items-start">
                        <div className="flex-grow-1">
                          <div className="d-flex align-items-center mb-1">
                            <strong className="me-2">{alert.etudiantNom}</strong>
                            <span className={`badge bg-${getGraviteBadge(alert.gravite)} bg-opacity-10 text-${getGraviteBadge(alert.gravite)}`}>
                              {alert.gravite}
                            </span>
                          </div>
                          <p className="mb-1 small text-muted">{alert.message}</p>
                          <small className="text-muted">
                            {new Date(alert.timestamp).toLocaleString('fr-FR')}
                          </small>
                        </div>
                        <button className="btn btn-sm btn-outline-primary ms-2">
                          Traiter
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Activités Récentes */}
        <div className="col-12 col-lg-6">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-header bg-white border-0 d-flex align-items-center justify-content-between py-3">
              <h5 className="mb-0 fw-semibold">
                <TrendingUp size={20} className="me-2 text-primary" />
                Activités Récentes
              </h5>
            </div>
            <div className="card-body">
              <div className="list-group list-group-flush">
                {recentActivities.map((activity) => (
                  <div key={activity.id} className="list-group-item px-0 border-0 border-bottom">
                    <div className="d-flex align-items-start">
                      <div className="me-3 mt-1">
                        {getActivityIcon(activity.type)}
                      </div>
                      <div className="flex-grow-1">
                        <p className="mb-1 small">{activity.message}</p>
                        <small className="text-muted">{activity.time}</small>
                      </div>
                      {activity.severity && (
                        <span className={`badge bg-${getSeverityBadge(activity.severity)} bg-opacity-10 text-${getSeverityBadge(activity.severity)} ms-2`}>
                          {activity.severity}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Actions Rapides */}
      <div className="row g-3 mt-4">
        <div className="col-12">
          <h5 className="mb-3 fw-semibold">Actions Rapides</h5>
        </div>
        <div className="col-12 col-sm-6 col-md-4 col-lg-3">
          <button 
            className="btn btn-outline-primary w-100 py-3"
            onClick={() => navigate('/surveillance/presences')}
          >
            <UserCheck size={24} className="mb-2" />
            <div className="small fw-semibold">Faire l'Appel</div>
          </button>
        </div>
        <div className="col-12 col-sm-6 col-md-4 col-lg-3">
          <button 
            className="btn btn-outline-warning w-100 py-3"
            onClick={() => navigate('/surveillance/absences')}
          >
            <Clock size={24} className="mb-2" />
            <div className="small fw-semibold">Gérer Absences</div>
          </button>
        </div>
        <div className="col-12 col-sm-6 col-md-4 col-lg-3">
          <button 
            className="btn btn-outline-danger w-100 py-3"
            onClick={() => navigate('/surveillance/incidents')}
          >
            <AlertTriangle size={24} className="mb-2" />
            <div className="small fw-semibold">Signaler Incident</div>
          </button>
        </div>
        <div className="col-12 col-sm-6 col-md-4 col-lg-3">
          <button 
            className="btn btn-outline-info w-100 py-3"
            onClick={() => navigate('/surveillance/examens')}
          >
            <Eye size={24} className="mb-2" />
            <div className="small fw-semibold">Surveiller Examen</div>
          </button>
        </div>
        <div className="col-12 col-sm-6 col-md-4 col-lg-3">
          <button 
            className="btn btn-outline-secondary w-100 py-3"
            onClick={() => navigate('/surveillance/sanctions')}
          >
            <Scale size={24} className="mb-2" />
            <div className="small fw-semibold">Gérer Sanctions</div>
          </button>
        </div>
        <div className="col-12 col-sm-6 col-md-4 col-lg-3">
          <button 
            className="btn btn-outline-success w-100 py-3"
            onClick={() => navigate('/surveillance/rapports')}
          >
            <FileText size={24} className="mb-2" />
            <div className="small fw-semibold">Rapports</div>
          </button>
        </div>
      </div>
    </div>
  );
};

export default SurveillanceDashboard;

// Made with Bob
