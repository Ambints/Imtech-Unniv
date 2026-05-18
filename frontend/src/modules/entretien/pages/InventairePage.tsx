import React from 'react';
import { useInventaireBatiments, useInventaireSallesParType, useInventaireStocksParCategorie } from '../hooks';

export default function InventairePage() {
  const { data: batiments, isLoading: loadingBatiments } = useInventaireBatiments();
  const { data: salles, isLoading: loadingSalles } = useInventaireSallesParType();
  const { data: stocks, isLoading: loadingStocks } = useInventaireStocksParCategorie();

  const isLoading = loadingBatiments || loadingSalles || loadingStocks;

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

  return (
    <div className="container-fluid py-4">
      <h2 className="mb-4">
        <i className="bi bi-clipboard-data me-2"></i>
        Inventaire Général
      </h2>

      {/* Inventaire Bâtiments */}
      <div className="mb-4">
        <h5 className="mb-3">
          <i className="bi bi-building me-2"></i>
          Bâtiments ({batiments?.length || 0})
        </h5>
        <div className="row g-3">
          {batiments?.map((batiment) => (
            <div key={batiment.id} className="col-md-6 col-lg-4">
              <div className="card h-100">
                <div className="card-body">
                  <h6 className="card-title">
                    {batiment.nom}
                    {batiment.code && <span className="text-muted small"> ({batiment.code})</span>}
                  </h6>
                  <div className="row g-2 mt-2">
                    <div className="col-6">
                      <div className="text-center p-2 bg-light rounded">
                        <div className="fs-4 fw-bold text-primary">{batiment.nb_salles}</div>
                        <div className="small text-muted">Salles</div>
                      </div>
                    </div>
                    <div className="col-6">
                      <div className="text-center p-2 bg-light rounded">
                        <div className="fs-4 fw-bold text-warning">{batiment.tickets_ouverts}</div>
                        <div className="small text-muted">Tickets</div>
                      </div>
                    </div>
                    <div className="col-12">
                      <div className="text-center p-2 bg-light rounded">
                        <div className="fs-4 fw-bold text-success">{batiment.plannings_actifs}</div>
                        <div className="small text-muted">Plannings actifs</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
          {batiments?.length === 0 && (
            <div className="col-12">
              <div className="alert alert-info text-center">
                <i className="bi bi-info-circle me-2"></i>
                Aucun bâtiment enregistré
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Inventaire Salles par Type */}
      <div className="mb-4">
        <h5 className="mb-3">
          <i className="bi bi-door-closed me-2"></i>
          Salles par Type
        </h5>
        <div className="card">
          <div className="card-body">
            <div className="table-responsive">
              <table className="table table-hover">
                <thead>
                  <tr>
                    <th>Type de Salle</th>
                    <th className="text-center">Total</th>
                    <th className="text-center">Disponibles</th>
                    <th className="text-center">Capacité Totale</th>
                    <th className="text-center">Taux Disponibilité</th>
                  </tr>
                </thead>
                <tbody>
                  {salles?.map((salle) => {
                    const tauxDispo = salle.total > 0 ? ((salle.disponibles / salle.total) * 100).toFixed(0) : 0;
                    return (
                      <tr key={salle.type_salle}>
                        <td>
                          <span className="badge bg-primary">{salle.type_salle}</span>
                        </td>
                        <td className="text-center">
                          <strong>{salle.total}</strong>
                        </td>
                        <td className="text-center">
                          <span className="badge bg-success">{salle.disponibles}</span>
                        </td>
                        <td className="text-center">{salle.capacite_totale} places</td>
                        <td className="text-center">
                          <div className="progress" style={{ height: '20px' }}>
                            <div
                              className={`progress-bar ${
                                Number(tauxDispo) >= 70
                                  ? 'bg-success'
                                  : Number(tauxDispo) >= 40
                                  ? 'bg-warning'
                                  : 'bg-danger'
                              }`}
                              role="progressbar"
                              style={{ width: `${tauxDispo}%` }}
                              aria-valuenow={Number(tauxDispo)}
                              aria-valuemin={0}
                              aria-valuemax={100}
                            >
                              {tauxDispo}%
                            </div>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                  {salles?.length === 0 && (
                    <tr>
                      <td colSpan={5} className="text-center text-muted">
                        Aucune salle enregistrée
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* Inventaire Stocks par Catégorie */}
      <div className="mb-4">
        <h5 className="mb-3">
          <i className="bi bi-box-seam me-2"></i>
          Stocks par Catégorie
        </h5>
        <div className="card">
          <div className="card-body">
            <div className="table-responsive">
              <table className="table table-hover">
                <thead>
                  <tr>
                    <th>Catégorie</th>
                    <th className="text-center">Nb Références</th>
                    <th className="text-center">En Alerte</th>
                    <th className="text-end">Valeur Stock Total</th>
                    <th className="text-center">État</th>
                  </tr>
                </thead>
                <tbody>
                  {stocks?.map((stock) => {
                    const tauxAlerte = stock.nb_references > 0
                      ? ((stock.en_alerte / stock.nb_references) * 100).toFixed(0)
                      : 0;
                    return (
                      <tr key={stock.categorie}>
                        <td>
                          <span className="badge bg-secondary">{stock.categorie}</span>
                        </td>
                        <td className="text-center">
                          <strong>{stock.nb_references}</strong>
                        </td>
                        <td className="text-center">
                          {stock.en_alerte > 0 ? (
                            <span className="badge bg-danger">{stock.en_alerte}</span>
                          ) : (
                            <span className="badge bg-success">0</span>
                          )}
                        </td>
                        <td className="text-end">
                          <strong>{stock.valeur_stock_totale.toLocaleString('fr-FR')} FCFA</strong>
                        </td>
                        <td className="text-center">
                          {Number(tauxAlerte) === 0 ? (
                            <span className="badge bg-success">
                              <i className="bi bi-check-circle me-1"></i>
                              OK
                            </span>
                          ) : Number(tauxAlerte) < 30 ? (
                            <span className="badge bg-warning">
                              <i className="bi bi-exclamation-triangle me-1"></i>
                              Attention
                            </span>
                          ) : (
                            <span className="badge bg-danger">
                              <i className="bi bi-x-circle me-1"></i>
                              Critique
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                  {stocks?.length === 0 && (
                    <tr>
                      <td colSpan={5} className="text-center text-muted">
                        Aucun stock enregistré
                      </td>
                    </tr>
                  )}
                </tbody>
                {stocks && stocks.length > 0 && (
                  <tfoot>
                    <tr className="table-light fw-bold">
                      <td>TOTAL</td>
                      <td className="text-center">
                        {stocks.reduce((sum, s) => sum + s.nb_references, 0)}
                      </td>
                      <td className="text-center">
                        {stocks.reduce((sum, s) => sum + s.en_alerte, 0)}
                      </td>
                      <td className="text-end">
                        {stocks
                          .reduce((sum, s) => sum + s.valeur_stock_totale, 0)
                          .toLocaleString('fr-FR')}{' '}
                        FCFA
                      </td>
                      <td></td>
                    </tr>
                  </tfoot>
                )}
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* Résumé Global */}
      <div className="row g-3">
        <div className="col-md-4">
          <div className="card border-0 shadow-sm">
            <div className="card-body text-center">
              <i className="bi bi-building fs-1 text-primary mb-2"></i>
              <h3 className="mb-0">{batiments?.length || 0}</h3>
              <p className="text-muted mb-0">Bâtiments</p>
            </div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card border-0 shadow-sm">
            <div className="card-body text-center">
              <i className="bi bi-door-closed fs-1 text-success mb-2"></i>
              <h3 className="mb-0">{salles?.reduce((sum, s) => sum + s.total, 0) || 0}</h3>
              <p className="text-muted mb-0">Salles Totales</p>
            </div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card border-0 shadow-sm">
            <div className="card-body text-center">
              <i className="bi bi-box-seam fs-1 text-info mb-2"></i>
              <h3 className="mb-0">{stocks?.reduce((sum, s) => sum + s.nb_references, 0) || 0}</h3>
              <p className="text-muted mb-0">Références Stock</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Made with Bob
