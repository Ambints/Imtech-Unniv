import React from 'react';
import { useDemandesRessource, useTraiterDemande } from '../hooks/useInventaire';

export default function DemandesRessourcePage() {
  const { data: demandes, isLoading } = useDemandesRessource();
  const traiterMutation = useTraiterDemande();

  const handleTraiter = async (id: string, statut: 'approuvee' | 'rejetee') => {
    const commentaire = statut === 'rejetee' 
      ? prompt('Motif du rejet:')
      : undefined;
    
    if (statut === 'rejetee' && !commentaire) return;

    await traiterMutation.mutateAsync({ 
      id, 
      data: { statut, commentaire_rejet: commentaire } 
    });
  };

  const getStatutBadge = (statut: string) => {
    const classes = {
      soumise: 'bg-warning text-dark',
      approuvee: 'bg-success',
      rejetee: 'bg-danger',
    };
    return classes[statut as keyof typeof classes] || 'bg-secondary';
  };

  if (isLoading) {
    return (
      <div className="container-fluid py-4">
        <div className="d-flex justify-content-center">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Chargement...</span>
          </div>
        </div>
      </div>
    );
  }

  const soumises = demandes?.filter(d => d.statut === 'soumise') || [];
  const traitees = demandes?.filter(d => d.statut !== 'soumise') || [];

  return (
    <div className="container-fluid py-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>
          <i className="bi bi-inbox me-2"></i>
          Demandes de ressources
        </h2>
      </div>

      {/* Statistiques */}
      <div className="row g-3 mb-4">
        <div className="col-md-3">
          <div className="card border-0 shadow-sm">
            <div className="card-body">
              <div className="d-flex justify-content-between">
                <div>
                  <p className="text-muted mb-1 small">En attente</p>
                  <h4 className="mb-0 text-warning">{soumises.length}</h4>
                </div>
                <div className="bg-warning bg-opacity-10 p-3 rounded">
                  <i className="bi bi-hourglass text-warning fs-4"></i>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card border-0 shadow-sm">
            <div className="card-body">
              <div className="d-flex justify-content-between">
                <div>
                  <p className="text-muted mb-1 small">Total</p>
                  <h4 className="mb-0">{demandes?.length || 0}</h4>
                </div>
                <div className="bg-primary bg-opacity-10 p-3 rounded">
                  <i className="bi bi-inbox text-primary fs-4"></i>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Demandes en attente */}
      {soumises.length > 0 && (
        <div className="card border-0 shadow-sm mb-4">
          <div className="card-header bg-warning">
            <h5 className="mb-0">
              <i className="bi bi-hourglass me-2"></i>
              Demandes en attente de traitement
            </h5>
          </div>
          <div className="card-body p-0">
            <div className="table-responsive">
              <table className="table table-hover mb-0">
                <thead className="table-light">
                  <tr>
                    <th>Type</th>
                    <th>Date souhaitée</th>
                    <th>Horaire</th>
                    <th>Participants</th>
                    <th>Demandeur</th>
                    <th>Motif</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {soumises.map((demande) => (
                    <tr key={demande.id}>
                      <td>
                        <span className="badge bg-info">{demande.type_ressource}</span>
                      </td>
                      <td>
                        {new Date(demande.date_souhaitee).toLocaleDateString('fr-FR')}
                      </td>
                      <td className="text-muted small">
                        {demande.heure_debut && demande.heure_fin
                          ? `${demande.heure_debut} - ${demande.heure_fin}`
                          : '-'}
                      </td>
                      <td className="text-muted">{demande.nb_participants || '-'}</td>
                      <td>
                        {demande.demandeur_nom}
                        <br />
                        <span className="badge bg-secondary">{demande.demandeur_role}</span>
                      </td>
                      <td className="text-muted small">
                        {demande.motif ? (
                          <span title={demande.motif}>
                            {demande.motif.substring(0, 50)}
                            {demande.motif.length > 50 && '...'}
                          </span>
                        ) : '-'}
                      </td>
                      <td>
                        <div className="btn-group btn-group-sm">
                          <button
                            className="btn btn-success"
                            onClick={() => handleTraiter(demande.id, 'approuvee')}
                            disabled={traiterMutation.isPending}
                            title="Approuver"
                          >
                            <i className="bi bi-check-lg"></i>
                          </button>
                          <button
                            className="btn btn-danger"
                            onClick={() => handleTraiter(demande.id, 'rejetee')}
                            disabled={traiterMutation.isPending}
                            title="Rejeter"
                          >
                            <i className="bi bi-x-lg"></i>
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
      )}

      {/* Demandes traitées */}
      {traitees.length > 0 && (
        <div className="card border-0 shadow-sm">
          <div className="card-header">
            <h5 className="mb-0">
              <i className="bi bi-archive me-2"></i>
              Historique des demandes
            </h5>
          </div>
          <div className="card-body p-0">
            <div className="table-responsive">
              <table className="table table-hover mb-0">
                <thead className="table-light">
                  <tr>
                    <th>Type</th>
                    <th>Date souhaitée</th>
                    <th>Demandeur</th>
                    <th>Statut</th>
                    <th>Traité par</th>
                    <th>Date traitement</th>
                    <th>Commentaire</th>
                  </tr>
                </thead>
                <tbody>
                  {traitees.map((demande) => (
                    <tr key={demande.id}>
                      <td>
                        <span className="badge bg-info">{demande.type_ressource}</span>
                      </td>
                      <td>
                        {new Date(demande.date_souhaitee).toLocaleDateString('fr-FR')}
                      </td>
                      <td>{demande.demandeur_nom}</td>
                      <td>
                        <span className={`badge ${getStatutBadge(demande.statut)}`}>
                          {demande.statut}
                        </span>
                      </td>
                      <td className="text-muted">{demande.traite_par_nom || '-'}</td>
                      <td className="text-muted small">
                        {demande.date_traitement 
                          ? new Date(demande.date_traitement).toLocaleDateString('fr-FR')
                          : '-'}
                      </td>
                      <td className="text-muted small">
                        {demande.commentaire_rejet || '-'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {demandes?.length === 0 && (
        <div className="alert alert-info">
          <i className="bi bi-info-circle me-2"></i>
          Aucune demande de ressource pour le moment.
        </div>
      )}
    </div>
  );
}

// Made with Bob
