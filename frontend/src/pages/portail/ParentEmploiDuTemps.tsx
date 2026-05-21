import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

interface Seance {
  id: string;
  date_seance: string;
  heure_debut: string;
  heure_fin: string;
  type_seance: string;
  statut: string;
  matiere: string;
  matiere_code: string;
  ue_nom: string;
  ue_code: string;
  enseignant_nom: string;
  enseignant_prenom: string;
  salle: string;
  salle_capacite: number;
  batiment: string;
}

export const ParentEmploiDuTemps: React.FC = () => {
  const { etudiantId } = useParams<{ etudiantId: string }>();
  const navigate = useNavigate();
  const [emploiDuTemps, setEmploiDuTemps] = useState<Seance[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dateDebut, setDateDebut] = useState('');
  const [dateFin, setDateFin] = useState('');
  const [viewMode, setViewMode] = useState<'week' | 'list'>('week');

  useEffect(() => {
    // Définir la semaine en cours par défaut
    const today = new Date();
    const monday = new Date(today);
    monday.setDate(today.getDate() - today.getDay() + 1);
    const sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 6);

    setDateDebut(monday.toISOString().split('T')[0]);
    setDateFin(sunday.toISOString().split('T')[0]);
  }, []);

  useEffect(() => {
    if (dateDebut && dateFin) {
      loadEmploiDuTemps();
    }
  }, [etudiantId, dateDebut, dateFin]);

  const loadEmploiDuTemps = async () => {
    try {
      setLoading(true);
      const response = await axios.get(
        `/api/v1/portail/parent/enfants/${etudiantId}/emploi-du-temps?dateDebut=${dateDebut}&dateFin=${dateFin}`
      );
      setEmploiDuTemps(response.data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erreur lors du chargement de l\'emploi du temps');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      weekday: 'long',
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    });
  };

  const formatTime = (timeString: string) => {
    return timeString ? timeString.substring(0, 5) : '';
  };

  const getTypeSeanceBadge = (type: string) => {
    const badges: Record<string, string> = {
      'CM': 'primary',
      'TD': 'info',
      'TP': 'success'
    };
    return badges[type] || 'secondary';
  };

  const groupByDay = () => {
    const grouped: Record<string, Seance[]> = {};
    emploiDuTemps.forEach(seance => {
      if (!grouped[seance.date_seance]) {
        grouped[seance.date_seance] = [];
      }
      grouped[seance.date_seance].push(seance);
    });
    
    // Trier les séances par heure
    Object.keys(grouped).forEach(date => {
      grouped[date].sort((a, b) => a.heure_debut.localeCompare(b.heure_debut));
    });
    
    return grouped;
  };

  const changeWeek = (direction: 'prev' | 'next') => {
    const debut = new Date(dateDebut);
    const fin = new Date(dateFin);
    
    if (direction === 'prev') {
      debut.setDate(debut.getDate() - 7);
      fin.setDate(fin.getDate() - 7);
    } else {
      debut.setDate(debut.getDate() + 7);
      fin.setDate(fin.getDate() + 7);
    }
    
    setDateDebut(debut.toISOString().split('T')[0]);
    setDateFin(fin.toISOString().split('T')[0]);
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

  if (error) {
    return (
      <div className="container mt-4">
        <div className="alert alert-danger" role="alert">
          <i className="bi bi-exclamation-triangle me-2"></i>
          {error}
        </div>
        <button className="btn btn-primary" onClick={() => navigate(-1)}>
          <i className="bi bi-arrow-left me-2"></i>
          Retour
        </button>
      </div>
    );
  }

  const seancesByDay = groupByDay();
  const sortedDates = Object.keys(seancesByDay).sort();

  return (
    <div className="container-fluid py-4">
      {/* En-tête */}
      <div className="row mb-4">
        <div className="col-12">
          <button className="btn btn-outline-secondary mb-3" onClick={() => navigate(-1)}>
            <i className="bi bi-arrow-left me-2"></i>
            Retour au tableau de bord
          </button>
          <div className="d-flex justify-content-between align-items-center">
            <h3>
              <i className="bi bi-calendar-week me-2"></i>
              Emploi du Temps
            </h3>
            <div className="btn-group">
              <button
                className={`btn btn-outline-primary ${viewMode === 'week' ? 'active' : ''}`}
                onClick={() => setViewMode('week')}
              >
                <i className="bi bi-calendar-week me-1"></i>
                Semaine
              </button>
              <button
                className={`btn btn-outline-primary ${viewMode === 'list' ? 'active' : ''}`}
                onClick={() => setViewMode('list')}
              >
                <i className="bi bi-list-ul me-1"></i>
                Liste
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation semaine */}
      <div className="row mb-4">
        <div className="col-12">
          <div className="card shadow-sm">
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-center">
                <button className="btn btn-outline-primary" onClick={() => changeWeek('prev')}>
                  <i className="bi bi-chevron-left me-1"></i>
                  Semaine précédente
                </button>
                <h5 className="mb-0">
                  {formatDate(dateDebut)} - {formatDate(dateFin)}
                </h5>
                <button className="btn btn-outline-primary" onClick={() => changeWeek('next')}>
                  Semaine suivante
                  <i className="bi bi-chevron-right ms-1"></i>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Affichage par jour */}
      {viewMode === 'week' && (
        <div className="row">
          {sortedDates.length > 0 ? (
            sortedDates.map(date => (
              <div key={date} className="col-12 mb-4">
                <div className="card shadow-sm">
                  <div className="card-header bg-primary text-white">
                    <h5 className="mb-0">{formatDate(date)}</h5>
                  </div>
                  <div className="card-body">
                    {seancesByDay[date].length > 0 ? (
                      <div className="row g-3">
                        {seancesByDay[date].map(seance => (
                          <div key={seance.id} className="col-md-6 col-lg-4">
                            <div className="card h-100 border-start border-4 border-primary">
                              <div className="card-body">
                                <div className="d-flex justify-content-between align-items-start mb-2">
                                  <h6 className="mb-0">{seance.matiere}</h6>
                                  <span className={`badge bg-${getTypeSeanceBadge(seance.type_seance)}`}>
                                    {seance.type_seance}
                                  </span>
                                </div>
                                <p className="text-muted small mb-2">{seance.ue_nom}</p>
                                <div className="mb-2">
                                  <i className="bi bi-clock me-2 text-primary"></i>
                                  <strong>{formatTime(seance.heure_debut)} - {formatTime(seance.heure_fin)}</strong>
                                </div>
                                <div className="mb-2">
                                  <i className="bi bi-person me-2 text-primary"></i>
                                  {seance.enseignant_prenom} {seance.enseignant_nom}
                                </div>
                                <div>
                                  <i className="bi bi-geo-alt me-2 text-primary"></i>
                                  {seance.salle} {seance.batiment && `(${seance.batiment})`}
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-3 text-muted">
                        <i className="bi bi-calendar-x me-2"></i>
                        Aucun cours ce jour
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="col-12">
              <div className="card shadow-sm">
                <div className="card-body text-center py-5">
                  <i className="bi bi-calendar-x text-muted" style={{ fontSize: '3rem' }}></i>
                  <p className="text-muted mt-3">Aucun cours programmé pour cette période</p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Affichage en liste */}
      {viewMode === 'list' && (
        <div className="row">
          <div className="col-12">
            <div className="card shadow-sm">
              <div className="card-body">
                {emploiDuTemps.length > 0 ? (
                  <div className="table-responsive">
                    <table className="table table-hover">
                      <thead>
                        <tr>
                          <th>Date</th>
                          <th>Horaire</th>
                          <th>Type</th>
                          <th>Matière</th>
                          <th>Enseignant</th>
                          <th>Salle</th>
                        </tr>
                      </thead>
                      <tbody>
                        {emploiDuTemps.map(seance => (
                          <tr key={seance.id}>
                            <td>{formatDate(seance.date_seance)}</td>
                            <td>
                              <strong>{formatTime(seance.heure_debut)} - {formatTime(seance.heure_fin)}</strong>
                            </td>
                            <td>
                              <span className={`badge bg-${getTypeSeanceBadge(seance.type_seance)}`}>
                                {seance.type_seance}
                              </span>
                            </td>
                            <td>
                              <strong>{seance.matiere}</strong>
                              <br />
                              <small className="text-muted">{seance.ue_nom}</small>
                            </td>
                            <td>{seance.enseignant_prenom} {seance.enseignant_nom}</td>
                            <td>
                              {seance.salle}
                              {seance.batiment && (
                                <><br /><small className="text-muted">{seance.batiment}</small></>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="text-center py-5">
                    <i className="bi bi-calendar-x text-muted" style={{ fontSize: '3rem' }}></i>
                    <p className="text-muted mt-3">Aucun cours programmé pour cette période</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Légende */}
      <div className="row mt-4">
        <div className="col-12">
          <div className="card shadow-sm">
            <div className="card-body">
              <h6 className="mb-3">Légende</h6>
              <div className="d-flex gap-3 flex-wrap">
                <div>
                  <span className="badge bg-primary me-2">CM</span>
                  Cours Magistral
                </div>
                <div>
                  <span className="badge bg-info me-2">TD</span>
                  Travaux Dirigés
                </div>
                <div>
                  <span className="badge bg-success me-2">TP</span>
                  Travaux Pratiques
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ParentEmploiDuTemps;

// Made with Bob
