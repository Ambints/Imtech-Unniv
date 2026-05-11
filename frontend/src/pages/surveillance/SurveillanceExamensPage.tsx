import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  GraduationCap, ArrowLeft, Plus, Search, Eye, Edit,
  Users, MapPin, Calendar, Clock, CheckCircle, AlertTriangle
} from 'lucide-react';
import { api } from '../../api/client';
import { useAuthStore } from '../../store/authStore';

interface ExamenSurveillance {
  id: string;
  session: {
    id: string;
    nom: string;
    date: string;
    heureDebut: string;
    heureFin: string;
  };
  salle: {
    id: string;
    nom: string;
    capacite: number;
  };
  placesTotal: number;
  placesAttribuees: number;
  surveillant: {
    id: string;
    nom: string;
    prenom: string;
  };
  statut: 'preparation' | 'en_cours' | 'termine' | 'incident';
  planPlaces: any[];
  rapportIncident?: string;
}

const STATUT_LABELS: Record<string, string> = {
  preparation: 'En préparation',
  en_cours: 'En cours',
  termine: 'Terminé',
  incident: 'Incident signalé'
};

const STATUT_COLORS: Record<string, string> = {
  preparation: 'info',
  en_cours: 'primary',
  termine: 'success',
  incident: 'danger'
};

export const SurveillanceExamensPage: React.FC = () => {
  const navigate = useNavigate();
  const { tenant } = useAuthStore();
  const tenantId = tenant?.id;
  const [examens, setExamens] = useState<ExamenSurveillance[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedExamen, setSelectedExamen] = useState<ExamenSurveillance | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatut, setFilterStatut] = useState<string>('all');
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);

  useEffect(() => {
    if (tenantId) {
      loadExamens();
    }
  }, [tenantId, selectedDate]);

  const loadExamens = async () => {
    if (!tenantId) return;
    try {
      setLoading(true);
      const response = await api.get(`/surveillance/${tenantId}/examens?date=${selectedDate}`);
      setExamens(response.data);
    } catch (error) {
      console.error('Erreur chargement examens:', error);
      // Fallback avec données mockées
      setExamens([
        {
          id: '1',
          session: {
            id: 's1',
            nom: 'Examen Mathématiques L1',
            date: new Date().toISOString(),
            heureDebut: '08:00',
            heureFin: '10:00'
          },
          salle: {
            id: 'salle1',
            nom: 'Amphithéâtre A',
            capacite: 150
          },
          placesTotal: 150,
          placesAttribuees: 120,
          surveillant: {
            id: 'surv1',
            nom: 'DIALLO',
            prenom: 'Mamadou'
          },
          statut: 'preparation',
          planPlaces: []
        },
        {
          id: '2',
          session: {
            id: 's2',
            nom: 'Examen Comptabilité L2',
            date: new Date().toISOString(),
            heureDebut: '10:30',
            heureFin: '12:30'
          },
          salle: {
            id: 'salle2',
            nom: 'Salle B105',
            capacite: 50
          },
          placesTotal: 50,
          placesAttribuees: 45,
          surveillant: {
            id: 'surv2',
            nom: 'KONE',
            prenom: 'Fatou'
          },
          statut: 'en_cours',
          planPlaces: []
        },
        {
          id: '3',
          session: {
            id: 's3',
            nom: 'Examen Droit Civil L1',
            date: new Date(Date.now() - 86400000).toISOString(),
            heureDebut: '14:00',
            heureFin: '16:00'
          },
          salle: {
            id: 'salle3',
            nom: 'Salle C201',
            capacite: 60
          },
          placesTotal: 60,
          placesAttribuees: 58,
          surveillant: {
            id: 'surv3',
            nom: 'TRAORE',
            prenom: 'Ibrahim'
          },
          statut: 'termine',
          planPlaces: []
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleDemarrer = async (id: string) => {
    if (!tenantId) return;
    try {
      await api.patch(`/surveillance/${tenantId}/examens/${id}/demarrer`);
      loadExamens();
      alert('Examen démarré');
    } catch (error) {
      console.error('Erreur démarrage:', error);
      alert('Erreur lors du démarrage');
    }
  };

  const handleTerminer = async (id: string) => {
    if (!tenantId) return;
    if (!confirm('Êtes-vous sûr de vouloir terminer cet examen ?')) return;
    try {
      await api.patch(`/surveillance/${tenantId}/examens/${id}/terminer`);
      loadExamens();
      alert('Examen terminé');
    } catch (error) {
      console.error('Erreur terminaison:', error);
      alert('Erreur lors de la terminaison');
    }
  };

  const handleSignalerIncident = async (id: string) => {
    const rapport = prompt('Décrivez l\'incident:');
    if (!rapport || !tenantId) return;
    try {
      await api.patch(`/surveillance/${tenantId}/examens/${id}/incident`, { rapport });
      loadExamens();
      alert('Incident signalé');
    } catch (error) {
      console.error('Erreur signalement:', error);
      alert('Erreur lors du signalement');
    }
  };

  const filteredExamens = examens.filter(examen => {
    const matchSearch = 
      examen.session.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
      examen.salle.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
      examen.surveillant.nom.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchStatut = filterStatut === 'all' || examen.statut === filterStatut;
    
    return matchSearch && matchStatut;
  });

  const stats = {
    preparation: examens.filter(e => e.statut === 'preparation').length,
    enCours: examens.filter(e => e.statut === 'en_cours').length,
    termines: examens.filter(e => e.statut === 'termine').length,
    incidents: examens.filter(e => e.statut === 'incident').length
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
          <button className="btn btn-link text-decoration-none p-0 mb-2" onClick={() => navigate('/surveillance')}>
            <ArrowLeft size={20} className="me-2" />
            Retour au Dashboard
          </button>
          <h2 className="mb-1">
            <GraduationCap className="me-2" size={28} />
            Surveillance des Examens
          </h2>
          <p className="text-muted mb-0">Configuration des salles et suivi des examens</p>
        </div>
      </div>

      {/* Filters */}
      <div className="card border-0 shadow-sm mb-4">
        <div className="card-body">
          <div className="row g-3">
            <div className="col-12 col-md-6">
              <div className="input-group">
                <span className="input-group-text bg-white">
                  <Search size={18} />
                </span>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Rechercher..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            <div className="col-6 col-md-3">
              <input
                type="date"
                className="form-control"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
              />
            </div>
            <div className="col-6 col-md-3">
              <select 
                className="form-select"
                value={filterStatut}
                onChange={(e) => setFilterStatut(e.target.value)}
              >
                <option value="all">Tous statuts</option>
                <option value="preparation">En préparation</option>
                <option value="en_cours">En cours</option>
                <option value="termine">Terminés</option>
                <option value="incident">Incidents</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="row g-3 mb-4">
        <div className="col-6 col-md-3">
          <div className="card border-0 shadow-sm">
            <div className="card-body text-center">
              <div className="text-info mb-2">
                <Clock size={32} />
              </div>
              <h3 className="mb-0 fw-bold">{stats.preparation}</h3>
              <small className="text-muted">En préparation</small>
            </div>
          </div>
        </div>
        <div className="col-6 col-md-3">
          <div className="card border-0 shadow-sm">
            <div className="card-body text-center">
              <div className="text-primary mb-2">
                <GraduationCap size={32} />
              </div>
              <h3 className="mb-0 fw-bold">{stats.enCours}</h3>
              <small className="text-muted">En cours</small>
            </div>
          </div>
        </div>
        <div className="col-6 col-md-3">
          <div className="card border-0 shadow-sm">
            <div className="card-body text-center">
              <div className="text-success mb-2">
                <CheckCircle size={32} />
              </div>
              <h3 className="mb-0 fw-bold">{stats.termines}</h3>
              <small className="text-muted">Terminés</small>
            </div>
          </div>
        </div>
        <div className="col-6 col-md-3">
          <div className="card border-0 shadow-sm">
            <div className="card-body text-center">
              <div className="text-danger mb-2">
                <AlertTriangle size={32} />
              </div>
              <h3 className="mb-0 fw-bold">{stats.incidents}</h3>
              <small className="text-muted">Incidents</small>
            </div>
          </div>
        </div>
      </div>

      {/* Liste des examens */}
      <div className="row g-3">
        {filteredExamens.length === 0 ? (
          <div className="col-12">
            <div className="card border-0 shadow-sm">
              <div className="card-body text-center py-5">
                <GraduationCap size={48} className="text-muted mb-3 opacity-25" />
                <p className="text-muted">Aucun examen trouvé</p>
              </div>
            </div>
          </div>
        ) : (
          filteredExamens.map(examen => (
            <div key={examen.id} className="col-12 col-lg-6">
              <div className="card border-0 shadow-sm h-100">
                <div className="card-body">
                  <div className="d-flex justify-content-between align-items-start mb-3">
                    <div>
                      <h5 className="mb-1">{examen.session.nom}</h5>
                      <span className={`badge bg-${STATUT_COLORS[examen.statut]} bg-opacity-10 text-${STATUT_COLORS[examen.statut]}`}>
                        {STATUT_LABELS[examen.statut]}
                      </span>
                    </div>
                    <GraduationCap size={32} className="text-muted opacity-25" />
                  </div>

                  <div className="mb-3">
                    <div className="d-flex align-items-center mb-2">
                      <Calendar size={16} className="me-2 text-muted" />
                      <span className="small">{new Date(examen.session.date).toLocaleDateString('fr-FR')}</span>
                    </div>
                    <div className="d-flex align-items-center mb-2">
                      <Clock size={16} className="me-2 text-muted" />
                      <span className="small">{examen.session.heureDebut} - {examen.session.heureFin}</span>
                    </div>
                    <div className="d-flex align-items-center mb-2">
                      <MapPin size={16} className="me-2 text-muted" />
                      <span className="small">{examen.salle.nom} (Capacité: {examen.salle.capacite})</span>
                    </div>
                    <div className="d-flex align-items-center mb-2">
                      <Users size={16} className="me-2 text-muted" />
                      <span className="small">
                        {examen.placesAttribuees}/{examen.placesTotal} places attribuées
                      </span>
                    </div>
                    <div className="small text-muted">
                      <strong>Surveillant:</strong> {examen.surveillant.prenom} {examen.surveillant.nom}
                    </div>
                  </div>

                  {examen.rapportIncident && (
                    <div className="alert alert-danger small mb-3">
                      <AlertTriangle size={14} className="me-1" />
                      <strong>Incident:</strong> {examen.rapportIncident}
                    </div>
                  )}

                  <div className="d-flex gap-2">
                    {examen.statut === 'preparation' && (
                      <button 
                        className="btn btn-sm btn-primary flex-grow-1"
                        onClick={() => handleDemarrer(examen.id)}
                      >
                        <CheckCircle size={16} className="me-1" />
                        Démarrer
                      </button>
                    )}
                    {examen.statut === 'en_cours' && (
                      <>
                        <button 
                          className="btn btn-sm btn-success flex-grow-1"
                          onClick={() => handleTerminer(examen.id)}
                        >
                          <CheckCircle size={16} className="me-1" />
                          Terminer
                        </button>
                        <button 
                          className="btn btn-sm btn-danger"
                          onClick={() => handleSignalerIncident(examen.id)}
                        >
                          <AlertTriangle size={16} />
                        </button>
                      </>
                    )}
                    <button 
                      className="btn btn-sm btn-outline-secondary"
                      onClick={() => setSelectedExamen(examen)}
                    >
                      <Eye size={16} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default SurveillanceExamensPage;

// Made with Bob