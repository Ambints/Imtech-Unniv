import React, { useState, useEffect } from 'react';
import { useAuthStore } from '../../store/authStore';
import { api } from '../../api/client';

interface DashboardData {
  parcours: any[];
  sujetsEnAttente: number;
  pvEnAttente: number;
}

const ResponsablePedagogiquePage: React.FC = () => {
  const { user } = useAuthStore();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(false);

  // States for different sections
  const [referentiels, setReferentiels] = useState<any[]>([]);
  const [maquettes, setMaquettes] = useState<any[]>([]);
  const [affectations, setAffectations] = useState<any[]>([]);
  const [sujets, setSujets] = useState<any[]>([]);
  const [procesVerbaux, setProcesVerbaux] = useState<any[]>([]);

  // Form states
  const [showReferentielForm, setShowReferentielForm] = useState(false);
  const [showMaquetteForm, setShowMaquetteForm] = useState(false);
  const [showAffectationForm, setShowAffectationForm] = useState(false);

  useEffect(() => {
    if (user?.tenantId) {
      loadDashboard();
    }
  }, [user]);

  useEffect(() => {
    if (user?.tenantId && activeTab !== 'dashboard') {
      loadTabData();
    }
  }, [activeTab, user]);

  const loadDashboard = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/pedagogique/${user?.tenantId}/dashboard`);
      setDashboardData(response.data);
    } catch (error) {
      console.error('Erreur chargement dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadTabData = async () => {
    try {
      setLoading(true);
      switch (activeTab) {
        case 'referentiels':
          const refRes = await api.get(`/pedagogique/${user?.tenantId}/referentiels`);
          setReferentiels(refRes.data);
          break;
        case 'maquettes':
          const maqRes = await api.get(`/pedagogique/${user?.tenantId}/maquettes`);
          setMaquettes(maqRes.data);
          break;
        case 'affectations':
          const affRes = await api.get(`/pedagogique/${user?.tenantId}/affectations`);
          setAffectations(affRes.data);
          break;
        case 'sujets':
          const sujRes = await api.get(`/pedagogique/${user?.tenantId}/sujets`);
          setSujets(sujRes.data);
          break;
        case 'pv':
          const pvRes = await api.get(`/pedagogique/${user?.tenantId}/proces-verbaux`);
          setProcesVerbaux(pvRes.data);
          break;
      }
    } catch (error) {
      console.error('Erreur chargement données:', error);
    } finally {
      setLoading(false);
    }
  };

  const validerSujet = async (id: string) => {
    try {
      await api.post(`/pedagogique/${user?.tenantId}/sujets/${id}/valider`, {});
      alert('Sujet validé avec succès');
      loadTabData();
    } catch (error) {
      console.error('Erreur validation sujet:', error);
      alert('Erreur lors de la validation');
    }
  };

  const validerPV = async (id: string) => {
    try {
      await api.post(`/pedagogique/${user?.tenantId}/proces-verbaux/${id}/valider`, {});
      alert('Procès-verbal validé avec succès');
      loadTabData();
    } catch (error) {
      console.error('Erreur validation PV:', error);
      alert('Erreur lors de la validation');
    }
  };

  const calculerStats = async (parcoursId: string, anneeId: string) => {
    try {
      await api.post(`/pedagogique/${user?.tenantId}/statistiques/calculer`, {
        parcoursId,
        anneeAcademiqueId: anneeId
      });
      alert('Statistiques calculées avec succès');
      loadTabData();
    } catch (error) {
      console.error('Erreur calcul statistiques:', error);
      alert('Erreur lors du calcul');
    }
  };

  const renderDashboard = () => (
    <div className="row g-4">
      <div className="col-12">
        <h4 className="mb-4">
          <i className="bi bi-speedometer2 me-2"></i>
          Tableau de Bord - Responsable Pédagogique
        </h4>
      </div>

      {/* Statistiques rapides */}
      <div className="col-md-3">
        <div className="card border-primary">
          <div className="card-body text-center">
            <i className="bi bi-file-earmark-text fs-1 text-primary"></i>
            <h3 className="mt-2">{dashboardData?.sujetsEnAttente || 0}</h3>
            <p className="text-muted mb-0">Sujets en attente</p>
          </div>
        </div>
      </div>

      <div className="col-md-3">
        <div className="card border-warning">
          <div className="card-body text-center">
            <i className="bi bi-file-earmark-check fs-1 text-warning"></i>
            <h3 className="mt-2">{dashboardData?.pvEnAttente || 0}</h3>
            <p className="text-muted mb-0">PV en attente</p>
          </div>
        </div>
      </div>

      <div className="col-md-3">
        <div className="card border-success">
          <div className="card-body text-center">
            <i className="bi bi-diagram-3 fs-1 text-success"></i>
            <h3 className="mt-2">{dashboardData?.parcours?.length || 0}</h3>
            <p className="text-muted mb-0">Parcours gérés</p>
          </div>
        </div>
      </div>

      {/* Parcours gérés */}
      <div className="col-12">
        <div className="card">
          <div className="card-header bg-primary text-white">
            <h5 className="mb-0">
              <i className="bi bi-diagram-3 me-2"></i>
              Parcours sous ma responsabilité
            </h5>
          </div>
          <div className="card-body">
            {dashboardData?.parcours && dashboardData.parcours.length > 0 ? (
              <div className="table-responsive">
                <table className="table table-hover">
                  <thead>
                    <tr>
                      <th>Code</th>
                      <th>Nom</th>
                      <th>Niveau</th>
                      <th>Durée</th>
                      <th>Statut</th>
                    </tr>
                  </thead>
                  <tbody>
                    {dashboardData.parcours.map((p: any) => (
                      <tr key={p.id}>
                        <td><strong>{p.code}</strong></td>
                        <td>{p.nom}</td>
                        <td><span className="badge bg-info">{p.niveau}</span></td>
                        <td>{p.dureeAnnees} ans</td>
                        <td>
                          {p.actif ? (
                            <span className="badge bg-success">Actif</span>
                          ) : (
                            <span className="badge bg-secondary">Inactif</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-muted text-center">Aucun parcours assigné</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  const renderReferentiels = () => (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h4><i className="bi bi-list-check me-2"></i>Référentiels de Compétences</h4>
        <button className="btn btn-primary" onClick={() => setShowReferentielForm(true)}>
          <i className="bi bi-plus-circle me-2"></i>Nouveau Référentiel
        </button>
      </div>

      <div className="card">
        <div className="card-body">
          {referentiels.length > 0 ? (
            <div className="table-responsive">
              <table className="table table-hover">
                <thead>
                  <tr>
                    <th>Code</th>
                    <th>Intitulé</th>
                    <th>Parcours</th>
                    <th>Niveau</th>
                    <th>Statut</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {referentiels.map((ref: any) => (
                    <tr key={ref.id}>
                      <td><strong>{ref.code}</strong></td>
                      <td>{ref.intitule}</td>
                      <td>{ref.parcoursId}</td>
                      <td><span className="badge bg-info">{ref.niveau}</span></td>
                      <td>
                        {ref.statut === 'valide' && <span className="badge bg-success">Validé</span>}
                        {ref.statut === 'brouillon' && <span className="badge bg-warning">Brouillon</span>}
                      </td>
                      <td>
                        <button className="btn btn-sm btn-outline-primary me-2">
                          <i className="bi bi-eye"></i>
                        </button>
                        {ref.statut === 'brouillon' && (
                          <button className="btn btn-sm btn-success">
                            <i className="bi bi-check-circle"></i> Valider
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-muted text-center">Aucun référentiel</p>
          )}
        </div>
      </div>
    </div>
  );

  const renderSujets = () => (
    <div>
      <h4 className="mb-4"><i className="bi bi-file-earmark-text me-2"></i>Validation des Sujets d'Examens</h4>

      <div className="card">
        <div className="card-body">
          {sujets.length > 0 ? (
            <div className="table-responsive">
              <table className="table table-hover">
                <thead>
                  <tr>
                    <th>Titre</th>
                    <th>UE/EC</th>
                    <th>Enseignant</th>
                    <th>Date soumission</th>
                    <th>Statut</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {sujets.map((sujet: any) => (
                    <tr key={sujet.id}>
                      <td><strong>{sujet.titre}</strong></td>
                      <td>{sujet.ueId || sujet.ecId}</td>
                      <td>{sujet.enseignantId}</td>
                      <td>{new Date(sujet.dateSoumission).toLocaleDateString()}</td>
                      <td>
                        {sujet.statut === 'soumis' && <span className="badge bg-warning">En attente</span>}
                        {sujet.statut === 'en_relecture' && <span className="badge bg-info">En relecture</span>}
                        {sujet.statut === 'valide' && <span className="badge bg-success">Validé</span>}
                        {sujet.statut === 'rejete' && <span className="badge bg-danger">Rejeté</span>}
                      </td>
                      <td>
                        <button className="btn btn-sm btn-outline-primary me-2">
                          <i className="bi bi-eye"></i>
                        </button>
                        {sujet.statut === 'soumis' && (
                          <>
                            <button 
                              className="btn btn-sm btn-success me-2"
                              onClick={() => validerSujet(sujet.id)}
                            >
                              <i className="bi bi-check-circle"></i> Valider
                            </button>
                            <button className="btn btn-sm btn-danger">
                              <i className="bi bi-x-circle"></i> Rejeter
                            </button>
                          </>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-muted text-center">Aucun sujet en attente</p>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <div className="container-fluid py-4">
      {/* Navigation tabs */}
      <ul className="nav nav-tabs mb-4">
        <li className="nav-item">
          <button className={`nav-link ${activeTab === 'dashboard' ? 'active' : ''}`} onClick={() => setActiveTab('dashboard')}>
            <i className="bi bi-speedometer2 me-2"></i>Dashboard
          </button>
        </li>
        <li className="nav-item">
          <button className={`nav-link ${activeTab === 'referentiels' ? 'active' : ''}`} onClick={() => setActiveTab('referentiels')}>
            <i className="bi bi-list-check me-2"></i>Référentiels
          </button>
        </li>
        <li className="nav-item">
          <button className={`nav-link ${activeTab === 'maquettes' ? 'active' : ''}`} onClick={() => setActiveTab('maquettes')}>
            <i className="bi bi-diagram-3 me-2"></i>Maquettes
          </button>
        </li>
        <li className="nav-item">
          <button className={`nav-link ${activeTab === 'affectations' ? 'active' : ''}`} onClick={() => setActiveTab('affectations')}>
            <i className="bi bi-person-badge me-2"></i>Affectations
          </button>
        </li>
        <li className="nav-item">
          <button className={`nav-link ${activeTab === 'sujets' ? 'active' : ''}`} onClick={() => setActiveTab('sujets')}>
            <i className="bi bi-file-earmark-text me-2"></i>Sujets
          </button>
        </li>
        <li className="nav-item">
          <button className={`nav-link ${activeTab === 'pv' ? 'active' : ''}`} onClick={() => setActiveTab('pv')}>
            <i className="bi bi-file-earmark-check me-2"></i>PV
          </button>
        </li>
      </ul>

      {/* Content */}
      {loading ? (
        <div className="text-center py-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Chargement...</span>
          </div>
        </div>
      ) : (
        <>
          {activeTab === 'dashboard' && renderDashboard()}
          {activeTab === 'referentiels' && renderReferentiels()}
          {activeTab === 'sujets' && renderSujets()}
        </>
      )}
    </div>
  );
};

export default ResponsablePedagogiquePage;

// Made with Bob
