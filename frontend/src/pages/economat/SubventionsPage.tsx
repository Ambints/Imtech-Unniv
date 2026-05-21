import React, { useState, useEffect } from 'react';
import { api } from '../../api/client';

interface Subvention {
  id: string;
  source: string;
  montant_recu: number;
  montant_utilise: number;
  solde: number;
  date_reception: string;
  annee: string;
}

interface Utilisation {
  libelle: string;
  montant: number;
  date_depense: string;
  statut: string;
  source: string;
}

const SubventionsPage: React.FC = () => {
  const [subventions, setSubventions] = useState<Subvention[]>([]);
  const [utilisations, setUtilisations] = useState<Utilisation[]>([]);
  const [selectedSubvention, setSelectedSubvention] = useState<Subvention | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSubventions();
  }, []);

  const fetchSubventions = async () => {
    try {
      setLoading(true);
      const response = await api.get('/economat/subventions');
      setSubventions(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error('Erreur:', error);
      setSubventions([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchUtilisations = async (subventionId: string) => {
    try {
      const response = await api.get(`/economat/subventions/${subventionId}/utilisation`);
      setUtilisations(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error('Erreur:', error);
      setUtilisations([]);
    }
  };

  const handleSelectSubvention = (subvention: Subvention) => {
    setSelectedSubvention(subvention);
    fetchUtilisations(subvention.id);
  };

  const formatMoney = (amount: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'MGA',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const totalSubventions = Array.isArray(subventions) ? subventions.reduce((sum, s) => sum + s.montant_recu, 0) : 0;
  const totalUtilise = Array.isArray(subventions) ? subventions.reduce((sum, s) => sum + s.montant_utilise, 0) : 0;
  const totalSolde = Array.isArray(subventions) ? subventions.reduce((sum, s) => sum + s.solde, 0) : 0;

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>
          <i className="bi bi-gift me-2"></i>
          Subventions
        </h2>
        <button className="btn btn-primary" onClick={fetchSubventions}>
          <i className="bi bi-arrow-clockwise me-2"></i>
          Actualiser
        </button>
      </div>

      {/* Summary Cards */}
      <div className="row mb-4">
        <div className="col-md-4">
          <div className="card border-primary">
            <div className="card-body">
              <h6 className="text-muted">Total Subventions</h6>
              <h3 className="text-primary">{formatMoney(totalSubventions)}</h3>
              <small className="text-muted">{subventions.length} subvention(s)</small>
            </div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card border-warning">
            <div className="card-body">
              <h6 className="text-muted">Montant Utilisé</h6>
              <h3 className="text-warning">{formatMoney(totalUtilise)}</h3>
              <small className="text-muted">
                {totalSubventions > 0 ? ((totalUtilise / totalSubventions) * 100).toFixed(1) : 0}% utilisé
              </small>
            </div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card border-success">
            <div className="card-body">
              <h6 className="text-muted">Solde Disponible</h6>
              <h3 className="text-success">{formatMoney(totalSolde)}</h3>
              <small className="text-muted">
                {totalSubventions > 0 ? ((totalSolde / totalSubventions) * 100).toFixed(1) : 0}% disponible
              </small>
            </div>
          </div>
        </div>
      </div>

      <div className="row">
        {/* Liste des Subventions */}
        <div className="col-md-6">
          <div className="card">
            <div className="card-header">
              <h5 className="mb-0">Liste des Subventions</h5>
            </div>
            <div className="card-body" style={{ maxHeight: '600px', overflowY: 'auto' }}>
              {loading ? (
                <div className="text-center py-4">
                  <div className="spinner-border text-primary" role="status"></div>
                </div>
              ) : subventions.length === 0 ? (
                <div className="text-center text-muted py-4">
                  <i className="bi bi-gift" style={{ fontSize: '3rem' }}></i>
                  <p className="mt-3">Aucune subvention enregistrée</p>
                </div>
              ) : (
                subventions.map((subvention) => (
                  <div
                    key={subvention.id}
                    className={`card mb-3 cursor-pointer ${
                      selectedSubvention?.id === subvention.id ? 'border-primary' : ''
                    }`}
                    onClick={() => handleSelectSubvention(subvention)}
                    style={{ cursor: 'pointer' }}
                  >
                    <div className="card-body">
                      <div className="d-flex justify-content-between align-items-start mb-2">
                        <div>
                          <h6 className="mb-1">{subvention.source}</h6>
                          <small className="text-muted">
                            <i className="bi bi-calendar me-1"></i>
                            {new Date(subvention.date_reception).toLocaleDateString('fr-FR')}
                          </small>
                        </div>
                        <span className="badge bg-info">{subvention.annee}</span>
                      </div>

                      <div className="mb-2">
                        <div className="d-flex justify-content-between mb-1">
                          <small>Montant reçu:</small>
                          <strong>{formatMoney(subvention.montant_recu)}</strong>
                        </div>
                        <div className="d-flex justify-content-between mb-1">
                          <small>Utilisé:</small>
                          <span className="text-warning">{formatMoney(subvention.montant_utilise)}</span>
                        </div>
                        <div className="d-flex justify-content-between">
                          <small>Solde:</small>
                          <span className="text-success fw-bold">{formatMoney(subvention.solde)}</span>
                        </div>
                      </div>

                      <div className="progress" style={{ height: '8px' }}>
                        <div
                          className="progress-bar bg-warning"
                          style={{
                            width: `${(subvention.montant_utilise / subvention.montant_recu) * 100}%`,
                          }}
                        ></div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Détail de l'Utilisation */}
        <div className="col-md-6">
          {selectedSubvention ? (
            <div className="card">
              <div className="card-header">
                <h5 className="mb-0">Utilisation - {selectedSubvention.source}</h5>
              </div>
              <div className="card-body">
                <div className="alert alert-info mb-3">
                  <div className="d-flex justify-content-between">
                    <span>Budget initial:</span>
                    <strong>{formatMoney(selectedSubvention.montant_recu)}</strong>
                  </div>
                  <div className="d-flex justify-content-between">
                    <span>Dépensé:</span>
                    <strong className="text-warning">
                      {formatMoney(selectedSubvention.montant_utilise)}
                    </strong>
                  </div>
                  <div className="d-flex justify-content-between">
                    <span>Reste:</span>
                    <strong className="text-success">{formatMoney(selectedSubvention.solde)}</strong>
                  </div>
                </div>

                {utilisations.length === 0 ? (
                  <div className="text-center text-muted py-4">
                    <i className="bi bi-inbox" style={{ fontSize: '2rem' }}></i>
                    <p className="mt-2">Aucune dépense enregistrée</p>
                  </div>
                ) : (
                  <div className="table-responsive">
                    <table className="table table-sm table-hover">
                      <thead>
                        <tr>
                          <th>Date</th>
                          <th>Libellé</th>
                          <th>Montant</th>
                          <th>Statut</th>
                        </tr>
                      </thead>
                      <tbody>
                        {utilisations.map((util, idx) => (
                          <tr key={idx}>
                            <td>{new Date(util.date_depense).toLocaleDateString('fr-FR')}</td>
                            <td>{util.libelle}</td>
                            <td className="fw-bold">{formatMoney(util.montant)}</td>
                            <td>
                              <span
                                className={`badge ${
                                  util.statut === 'paye'
                                    ? 'bg-success'
                                    : util.statut === 'approuve'
                                    ? 'bg-info'
                                    : 'bg-warning'
                                }`}
                              >
                                {util.statut}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                      <tfoot>
                        <tr className="table-light">
                          <td colSpan={2} className="fw-bold">
                            Total
                          </td>
                          <td className="fw-bold">
                            {formatMoney(utilisations.reduce((sum, u) => sum + u.montant, 0))}
                          </td>
                          <td></td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="card">
              <div className="card-body text-center text-muted py-5">
                <i className="bi bi-arrow-left-circle" style={{ fontSize: '3rem' }}></i>
                <p className="mt-3">Sélectionnez une subvention pour voir son utilisation</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SubventionsPage;

// Made with Bob
