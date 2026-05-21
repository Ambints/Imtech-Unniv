import React, { useState, useEffect } from 'react';
import { api, academicApi } from '../../api/client';
import { useAuthStore } from '../../store/authStore';

interface Incident {
  id: string;
  etudiant_id: string;
  etudiant_nom?: string;
  date_incident: string;
  type_incident: string;
  description: string;
  sanction?: string;
  duree_sanction?: number;
  statut: string;
  rapporte_par_nom?: string;
  arbitre_par_nom?: string;
  observations?: string;
  created_at: string;
}

interface Stats {
  total_incidents: number;
  incidents_ouverts: number;
  incidents_en_cours: number;
  incidents_clos: number;
  retards: number;
  absenteisme: number;
  incivilite: number;
  triche: number;
  violence: number;
  autres: number;
}

const GestionDisciplinePage: React.FC = () => {
  const { user } = useAuthStore();
  const tid = user?.tenantId || '';
  const currentUserId = user?.id || '';
  
  const [activeTab, setActiveTab] = useState<'incidents' | 'stats'>('incidents');
  
  // États pour les incidents
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [showIncidentModal, setShowIncidentModal] = useState(false);
  const [currentIncident, setCurrentIncident] = useState<Partial<Incident>>({});
  const [editingIncident, setEditingIncident] = useState<Incident | null>(null);
  
  // États pour les statistiques
  const [stats, setStats] = useState<Stats | null>(null);
  const [incidentsByType, setIncidentsByType] = useState<any[]>([]);
  
  // États pour les filtres
  const [filterStatut, setFilterStatut] = useState<string>('');
  const [filterType, setFilterType] = useState<string>('');
  
  const [etudiants, setEtudiants] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadData();
    loadEtudiants();
  }, [activeTab, filterStatut, filterType]);

  const loadData = async () => {
    setLoading(true);
    try {
      if (activeTab === 'incidents') {
        const params = new URLSearchParams();
        if (filterStatut) params.append('statut', filterStatut);
        if (filterType) params.append('typeIncident', filterType);
        
        const response = await api.get(`/discipline/incidents?${params.toString()}`);
        setIncidents(response.data);
      } else if (activeTab === 'stats') {
        const [statsRes, typeRes] = await Promise.all([
          api.get('/discipline/stats'),
          api.get('/discipline/rapports/types')
        ]);
        setStats(statsRes.data);
        setIncidentsByType(typeRes.data);
      }
    } catch (error) {
      console.error('Erreur chargement données:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadEtudiants = async () => {
    try {
      if (!tid) return;
      const response = await academicApi.getEtudiants(tid);
      setEtudiants(response.data);
    } catch (error) {
      console.error('Erreur chargement étudiants:', error);
    }
  };

  // ========== GESTION DES INCIDENTS ==========
  const handleCreateIncident = async () => {
    try {
      if (!currentIncident.etudiant_id || !currentIncident.type_incident || !currentIncident.description) {
        alert('Veuillez remplir tous les champs obligatoires');
        return;
      }

      const incidentData = {
        etudiantId: currentIncident.etudiant_id,
        dateIncident: currentIncident.date_incident,
        typeIncident: currentIncident.type_incident,
        description: currentIncident.description,
        sanction: currentIncident.sanction,
        dureeSanction: currentIncident.duree_sanction,
        observations: currentIncident.observations,
        rapportePar: currentUserId
      };

      if (editingIncident) {
        await api.patch(`/discipline/incidents/${editingIncident.id}`, incidentData);
        alert('Incident modifié avec succès');
      } else {
        await api.post('/discipline/incidents', incidentData);
        alert('Incident créé avec succès');
      }
      setShowIncidentModal(false);
      setCurrentIncident({});
      setEditingIncident(null);
      loadData();
    } catch (error) {
      console.error('Erreur sauvegarde incident:', error);
      alert('Erreur lors de la sauvegarde de l\'incident');
    }
  };

  const handleEditIncident = (incident: Incident) => {
    setEditingIncident(incident);
    setCurrentIncident({
      etudiant_id: incident.etudiant_id,
      date_incident: incident.date_incident,
      type_incident: incident.type_incident,
      description: incident.description,
      sanction: incident.sanction,
      duree_sanction: incident.duree_sanction,
      observations: incident.observations
    });
    setShowIncidentModal(true);
  };

  const handleValiderIncident = async (id: string) => {
    try {
      await api.patch(`/discipline/incidents/${id}/valider`, { validePar: currentUserId });
      loadData();
      alert('Incident validé avec succès');
    } catch (error) {
      console.error('Erreur validation incident:', error);
      alert('Erreur lors de la validation');
    }
  };

  const handleDeleteIncident = async (id: string) => {
    if (!confirm('Supprimer cet incident ?')) return;
    try {
      await api.delete(`/discipline/incidents/${id}`);
      loadData();
      alert('Incident supprimé avec succès');
    } catch (error) {
      console.error('Erreur suppression incident:', error);
      alert('Erreur lors de la suppression');
    }
  };

  const getStatutBadgeClass = (statut: string) => {
    switch (statut) {
      case 'ouvert': return 'bg-warning';
      case 'en_cours': return 'bg-info';
      case 'clos': return 'bg-success';
      case 'arbitrage': return 'bg-danger';
      default: return 'bg-secondary';
    }
  };

  const getTypeBadgeClass = (type: string) => {
    switch (type) {
      case 'retard': return 'bg-warning';
      case 'absenteisme': return 'bg-info';
      case 'incivilite': return 'bg-danger';
      case 'triche': return 'bg-danger';
      case 'violence': return 'bg-danger';
      default: return 'bg-secondary';
    }
  };

  // ========== RENDU DES ONGLETS ==========
  const renderIncidents = () => (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h5>Gestion des Incidents Disciplinaires</h5>
        <button 
          className="btn btn-primary"
          onClick={() => {
            setCurrentIncident({});
            setEditingIncident(null);
            setShowIncidentModal(true);
          }}
        >
          <i className="bi bi-plus-circle me-2"></i>
          Nouveau Incident
        </button>
      </div>

      {/* Filtres */}
      <div className="row mb-3">
        <div className="col-md-4">
          <select
            className="form-select"
            value={filterStatut}
            onChange={(e) => setFilterStatut(e.target.value)}
          >
            <option value="">Tous les statuts</option>
            <option value="ouvert">Ouvert</option>
            <option value="en_cours">En cours</option>
            <option value="clos">Clos</option>
            <option value="arbitrage">Arbitrage</option>
          </select>
        </div>
        <div className="col-md-4">
          <select
            className="form-select"
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
          >
            <option value="">Tous les types</option>
            <option value="retard">Retard</option>
            <option value="absenteisme">Absentéisme</option>
            <option value="incivilite">Incivilité</option>
            <option value="triche">Triche</option>
            <option value="violence">Violence</option>
            <option value="autre">Autre</option>
          </select>
        </div>
      </div>

      <div className="table-responsive">
        <table className="table table-hover">
          <thead>
            <tr>
              <th>Date</th>
              <th>Étudiant</th>
              <th>Type</th>
              <th>Description</th>
              <th>Sanction</th>
              <th>Statut</th>
              <th>Rapporté par</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {incidents.map(incident => (
              <tr key={incident.id}>
                <td>{new Date(incident.date_incident).toLocaleDateString()}</td>
                <td>{incident.etudiant_nom || 'N/A'}</td>
                <td>
                  <span className={`badge ${getTypeBadgeClass(incident.type_incident)}`}>
                    {incident.type_incident}
                  </span>
                </td>
                <td>
                  <small>{incident.description.substring(0, 50)}...</small>
                </td>
                <td>{incident.sanction || '-'}</td>
                <td>
                  <span className={`badge ${getStatutBadgeClass(incident.statut)}`}>
                    {incident.statut}
                  </span>
                </td>
                <td>
                  <small>{incident.rapporte_par_nom || 'N/A'}</small>
                </td>
                <td>
                  <button
                    className="btn btn-sm btn-outline-primary me-1"
                    onClick={() => handleEditIncident(incident)}
                    title="Modifier"
                  >
                    <i className="bi bi-pencil"></i>
                  </button>
                  {incident.statut === 'ouvert' && (
                    <button
                      className="btn btn-sm btn-success me-1"
                      onClick={() => handleValiderIncident(incident.id)}
                      title="Valider"
                    >
                      <i className="bi bi-check-circle"></i>
                    </button>
                  )}
                  <button
                    className="btn btn-sm btn-outline-danger"
                    onClick={() => handleDeleteIncident(incident.id)}
                    title="Supprimer"
                  >
                    <i className="bi bi-trash"></i>
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderStats = () => (
    <div>
      <h5 className="mb-4">Statistiques Disciplinaires</h5>

      {stats && (
        <>
          <div className="row mb-4">
            <div className="col-md-3">
              <div className="card bg-primary text-white">
                <div className="card-body">
                  <h3>{stats.total_incidents}</h3>
                  <p className="mb-0">Total Incidents</p>
                </div>
              </div>
            </div>
            <div className="col-md-3">
              <div className="card bg-warning text-white">
                <div className="card-body">
                  <h3>{stats.incidents_ouverts}</h3>
                  <p className="mb-0">Ouverts</p>
                </div>
              </div>
            </div>
            <div className="col-md-3">
              <div className="card bg-info text-white">
                <div className="card-body">
                  <h3>{stats.incidents_en_cours}</h3>
                  <p className="mb-0">En cours</p>
                </div>
              </div>
            </div>
            <div className="col-md-3">
              <div className="card bg-success text-white">
                <div className="card-body">
                  <h3>{stats.incidents_clos}</h3>
                  <p className="mb-0">Clos</p>
                </div>
              </div>
            </div>
          </div>

          <h6 className="mb-3">Répartition par Type</h6>
          <div className="row">
            <div className="col-md-4 mb-3">
              <div className="card">
                <div className="card-body">
                  <h6>Retards</h6>
                  <h4 className="text-warning">{stats.retards}</h4>
                </div>
              </div>
            </div>
            <div className="col-md-4 mb-3">
              <div className="card">
                <div className="card-body">
                  <h6>Absentéisme</h6>
                  <h4 className="text-info">{stats.absenteisme}</h4>
                </div>
              </div>
            </div>
            <div className="col-md-4 mb-3">
              <div className="card">
                <div className="card-body">
                  <h6>Incivilité</h6>
                  <h4 className="text-danger">{stats.incivilite}</h4>
                </div>
              </div>
            </div>
            <div className="col-md-4 mb-3">
              <div className="card">
                <div className="card-body">
                  <h6>Triche</h6>
                  <h4 className="text-danger">{stats.triche}</h4>
                </div>
              </div>
            </div>
            <div className="col-md-4 mb-3">
              <div className="card">
                <div className="card-body">
                  <h6>Violence</h6>
                  <h4 className="text-danger">{stats.violence}</h4>
                </div>
              </div>
            </div>
            <div className="col-md-4 mb-3">
              <div className="card">
                <div className="card-body">
                  <h6>Autres</h6>
                  <h4 className="text-secondary">{stats.autres}</h4>
                </div>
              </div>
            </div>
          </div>

          {incidentsByType.length > 0 && (
            <>
              <h6 className="mb-3 mt-4">Détails par Type</h6>
              <div className="table-responsive">
                <table className="table">
                  <thead>
                    <tr>
                      <th>Type</th>
                      <th>Total</th>
                      <th>Ouverts</th>
                      <th>Clos</th>
                    </tr>
                  </thead>
                  <tbody>
                    {incidentsByType.map((item, index) => (
                      <tr key={index}>
                        <td className="text-capitalize">{item.type_incident}</td>
                        <td><strong>{item.nombre}</strong></td>
                        <td><span className="badge bg-warning">{item.ouverts}</span></td>
                        <td><span className="badge bg-success">{item.clos}</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </>
      )}
    </div>
  );

  return (
    <div className="container-fluid py-4">
      <h3 className="mb-4">Gestion de la Discipline</h3>

      <ul className="nav nav-tabs mb-4">
        <li className="nav-item">
          <button 
            className={`nav-link ${activeTab === 'incidents' ? 'active' : ''}`}
            onClick={() => setActiveTab('incidents')}
          >
            <i className="bi bi-exclamation-triangle me-2"></i>
            Incidents
          </button>
        </li>
        <li className="nav-item">
          <button 
            className={`nav-link ${activeTab === 'stats' ? 'active' : ''}`}
            onClick={() => setActiveTab('stats')}
          >
            <i className="bi bi-bar-chart me-2"></i>
            Statistiques
          </button>
        </li>
      </ul>

      {loading ? (
        <div className="text-center py-5">
          <div className="spinner-border" role="status">
            <span className="visually-hidden">Chargement...</span>
          </div>
        </div>
      ) : (
        <>
          {activeTab === 'incidents' && renderIncidents()}
          {activeTab === 'stats' && renderStats()}
        </>
      )}

      {/* Modal Incident */}
      {showIncidentModal && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-lg">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">
                  {editingIncident ? 'Modifier l\'Incident' : 'Nouveau Incident'}
                </h5>
                <button 
                  type="button" 
                  className="btn-close"
                  onClick={() => {
                    setShowIncidentModal(false);
                    setEditingIncident(null);
                  }}
                ></button>
              </div>
              <div className="modal-body">
                <div className="mb-3">
                  <label className="form-label">Étudiant *</label>
                  <select
                    className="form-select"
                    value={currentIncident.etudiant_id || ''}
                    onChange={(e) => setCurrentIncident({...currentIncident, etudiant_id: e.target.value})}
                    disabled={!!editingIncident}
                  >
                    <option value="">Sélectionner un étudiant</option>
                    {etudiants.map(etudiant => (
                      <option key={etudiant.id} value={etudiant.id}>
                        {etudiant.nom} {etudiant.prenom}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="row">
                  <div className="col-md-6 mb-3">
                    <label className="form-label">Date de l'incident *</label>
                    <input
                      type="date"
                      className="form-control"
                      value={currentIncident.date_incident || ''}
                      onChange={(e) => setCurrentIncident({...currentIncident, date_incident: e.target.value})}
                    />
                  </div>
                  <div className="col-md-6 mb-3">
                    <label className="form-label">Type d'incident *</label>
                    <select
                      className="form-select"
                      value={currentIncident.type_incident || ''}
                      onChange={(e) => setCurrentIncident({...currentIncident, type_incident: e.target.value})}
                    >
                      <option value="">Sélectionner un type</option>
                      <option value="retard">Retard</option>
                      <option value="absenteisme">Absentéisme</option>
                      <option value="incivilite">Incivilité</option>
                      <option value="triche">Triche</option>
                      <option value="violence">Violence</option>
                      <option value="autre">Autre</option>
                    </select>
                  </div>
                </div>
                <div className="mb-3">
                  <label className="form-label">Description *</label>
                  <textarea
                    className="form-control"
                    rows={4}
                    value={currentIncident.description || ''}
                    onChange={(e) => setCurrentIncident({...currentIncident, description: e.target.value})}
                  ></textarea>
                </div>
                <div className="row">
                  <div className="col-md-8 mb-3">
                    <label className="form-label">Sanction (optionnel)</label>
                    <input
                      type="text"
                      className="form-control"
                      value={currentIncident.sanction || ''}
                      onChange={(e) => setCurrentIncident({...currentIncident, sanction: e.target.value})}
                      placeholder="Ex: Avertissement, Exclusion temporaire..."
                    />
                  </div>
                  <div className="col-md-4 mb-3">
                    <label className="form-label">Durée (jours)</label>
                    <input
                      type="number"
                      className="form-control"
                      value={currentIncident.duree_sanction || ''}
                      onChange={(e) => setCurrentIncident({...currentIncident, duree_sanction: parseInt(e.target.value)})}
                    />
                  </div>
                </div>
                <div className="mb-3">
                  <label className="form-label">Observations</label>
                  <textarea
                    className="form-control"
                    rows={3}
                    value={currentIncident.observations || ''}
                    onChange={(e) => setCurrentIncident({...currentIncident, observations: e.target.value})}
                  ></textarea>
                </div>
              </div>
              <div className="modal-footer">
                <button 
                  type="button" 
                  className="btn btn-secondary"
                  onClick={() => {
                    setShowIncidentModal(false);
                    setEditingIncident(null);
                  }}
                >
                  Annuler
                </button>
                <button 
                  type="button" 
                  className="btn btn-primary"
                  onClick={handleCreateIncident}
                >
                  {editingIncident ? 'Modifier' : 'Créer'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GestionDisciplinePage;

// Made with Bob
