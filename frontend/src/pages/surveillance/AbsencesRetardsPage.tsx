import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Clock, ArrowLeft, Search, Filter, Calendar,
  User, CheckCircle, XCircle, AlertCircle, FileText
} from 'lucide-react';
import { api } from '../../api/client';
import { useAuthStore } from '../../store/authStore';

interface Absence {
  id: string;
  etudiant: {
    id: string;
    nom: string;
    prenom: string;
    matricule: string;
    classe: string;
  };
  date: string;
  cours: string;
  type: 'absence' | 'retard';
  duree?: number; // minutes de retard
  justifie: boolean;
  justificatif?: string;
  observations?: string;
}

const TYPE_LABELS: Record<string, string> = {
  absence: 'Absence',
  retard: 'Retard'
};

const TYPE_COLORS: Record<string, string> = {
  absence: 'danger',
  retard: 'warning'
};

export const AbsencesRetardsPage: React.FC = () => {
  const navigate = useNavigate();
  const { tenant } = useAuthStore();
  const tenantId = tenant?.id;
  const [absences, setAbsences] = useState<Absence[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [filterJustifie, setFilterJustifie] = useState<string>('all');
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);

  useEffect(() => {
    if (tenantId) {
      loadAbsences();
    }
  }, [tenantId, selectedDate]);

  const loadAbsences = async () => {
    if (!tenantId) return;
    try {
      setLoading(true);
      const response = await api.get(`/surveillance/${tenantId}/absences?date=${selectedDate}`);
      setAbsences(response.data || []);
    } catch (error) {
      console.error('Erreur chargement absences:', error);
      setAbsences([]);
    } finally {
      setLoading(false);
    }
  };

  const handleJustifier = async (id: string) => {
    if (!tenantId) return;
    try {
      await api.patch(`/surveillance/${tenantId}/absences/${id}/justifier`);
      loadAbsences();
      alert('Absence/Retard justifié(e)');
    } catch (error) {
      console.error('Erreur justification:', error);
      alert('Erreur lors de la justification');
    }
  };

  const filteredAbsences = absences.filter(absence => {
    const matchSearch = 
      absence.etudiant.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
      absence.etudiant.prenom.toLowerCase().includes(searchTerm.toLowerCase()) ||
      absence.etudiant.matricule.includes(searchTerm) ||
      absence.cours.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchType = filterType === 'all' || absence.type === filterType;
    const matchJustifie = filterJustifie === 'all' || 
      (filterJustifie === 'justifie' && absence.justifie) ||
      (filterJustifie === 'non_justifie' && !absence.justifie);
    
    return matchSearch && matchType && matchJustifie;
  });

  const stats = {
    absences: absences.filter(a => a.type === 'absence').length,
    retards: absences.filter(a => a.type === 'retard').length,
    justifies: absences.filter(a => a.justifie).length,
    nonJustifies: absences.filter(a => !a.justifie).length
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
            <Clock className="me-2" size={28} />
            Absences & Retards
          </h2>
          <p className="text-muted mb-0">Suivi des absences et retards des étudiants</p>
        </div>
      </div>

      {/* Filters */}
      <div className="card border-0 shadow-sm mb-4">
        <div className="card-body">
          <div className="row g-3">
            <div className="col-12 col-md-4">
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
            <div className="col-6 col-md-2">
              <input
                type="date"
                className="form-control"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
              />
            </div>
            <div className="col-6 col-md-2">
              <select 
                className="form-select"
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
              >
                <option value="all">Tous types</option>
                <option value="absence">Absences</option>
                <option value="retard">Retards</option>
              </select>
            </div>
            <div className="col-12 col-md-2">
              <select 
                className="form-select"
                value={filterJustifie}
                onChange={(e) => setFilterJustifie(e.target.value)}
              >
                <option value="all">Tous</option>
                <option value="justifie">Justifiés</option>
                <option value="non_justifie">Non justifiés</option>
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
              <div className="text-danger mb-2">
                <XCircle size={32} />
              </div>
              <h3 className="mb-0 fw-bold">{stats.absences}</h3>
              <small className="text-muted">Absences</small>
            </div>
          </div>
        </div>
        <div className="col-6 col-md-3">
          <div className="card border-0 shadow-sm">
            <div className="card-body text-center">
              <div className="text-warning mb-2">
                <Clock size={32} />
              </div>
              <h3 className="mb-0 fw-bold">{stats.retards}</h3>
              <small className="text-muted">Retards</small>
            </div>
          </div>
        </div>
        <div className="col-6 col-md-3">
          <div className="card border-0 shadow-sm">
            <div className="card-body text-center">
              <div className="text-success mb-2">
                <CheckCircle size={32} />
              </div>
              <h3 className="mb-0 fw-bold">{stats.justifies}</h3>
              <small className="text-muted">Justifiés</small>
            </div>
          </div>
        </div>
        <div className="col-6 col-md-3">
          <div className="card border-0 shadow-sm">
            <div className="card-body text-center">
              <div className="text-danger mb-2">
                <AlertCircle size={32} />
              </div>
              <h3 className="mb-0 fw-bold">{stats.nonJustifies}</h3>
              <small className="text-muted">Non justifiés</small>
            </div>
          </div>
        </div>
      </div>

      {/* Liste */}
      <div className="card border-0 shadow-sm">
        <div className="card-body">
          {filteredAbsences.length === 0 ? (
            <div className="text-center py-5">
              <Clock size={48} className="text-muted mb-3 opacity-25" />
              <p className="text-muted">Aucune absence ou retard trouvé(e)</p>
            </div>
          ) : (
            <div className="table-responsive">
              <table className="table table-hover align-middle">
                <thead className="table-light">
                  <tr>
                    <th>Étudiant</th>
                    <th>Classe</th>
                    <th>Cours</th>
                    <th>Type</th>
                    <th>Durée</th>
                    <th>Statut</th>
                    <th>Justificatif</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredAbsences.map(absence => (
                    <tr key={absence.id}>
                      <td>
                        <div className="d-flex align-items-center">
                          <div className="rounded-circle bg-primary bg-opacity-10 d-flex align-items-center justify-content-center me-2" 
                               style={{ width: 36, height: 36 }}>
                            <span className="fw-bold text-primary small">
                              {absence.etudiant.prenom[0]}{absence.etudiant.nom[0]}
                            </span>
                          </div>
                          <div>
                            <div className="fw-semibold">{absence.etudiant.prenom} {absence.etudiant.nom}</div>
                            <small className="text-muted">{absence.etudiant.matricule}</small>
                          </div>
                        </div>
                      </td>
                      <td>{absence.etudiant.classe}</td>
                      <td>{absence.cours}</td>
                      <td>
                        <span className={`badge bg-${TYPE_COLORS[absence.type]} bg-opacity-10 text-${TYPE_COLORS[absence.type]}`}>
                          {TYPE_LABELS[absence.type]}
                        </span>
                      </td>
                      <td>
                        {absence.type === 'retard' && absence.duree ? (
                          <span className="text-warning fw-semibold">{absence.duree} min</span>
                        ) : (
                          <span className="text-muted">-</span>
                        )}
                      </td>
                      <td>
                        {absence.justifie ? (
                          <span className="badge bg-success bg-opacity-10 text-success">
                            <CheckCircle size={14} className="me-1" />
                            Justifié
                          </span>
                        ) : (
                          <span className="badge bg-danger bg-opacity-10 text-danger">
                            <XCircle size={14} className="me-1" />
                            Non justifié
                          </span>
                        )}
                      </td>
                      <td>
                        {absence.justificatif ? (
                          <div className="small">
                            <FileText size={14} className="me-1" />
                            {absence.justificatif}
                          </div>
                        ) : (
                          <span className="text-muted small">-</span>
                        )}
                      </td>
                      <td>
                        {!absence.justifie && (
                          <button 
                            className="btn btn-sm btn-outline-success"
                            onClick={() => handleJustifier(absence.id)}
                            title="Justifier"
                          >
                            <CheckCircle size={16} />
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AbsencesRetardsPage;

// Made with Bob