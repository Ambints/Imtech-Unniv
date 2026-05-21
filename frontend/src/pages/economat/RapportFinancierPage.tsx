import React, { useState, useEffect } from 'react';
import { api } from '../../api/client';

interface RapportFinancier {
  periode: string;
  total_recettes: number;
  total_depenses: number;
  solde: number;
  nb_inscriptions: number;
  nb_depenses: number;
  depenses_par_categorie: Array<{
    categorie: string;
    montant: number;
    nb: number;
  }>;
  recettes_par_parcours: Array<{
    parcours: string;
    montant: number;
    nb: number;
  }>;
}

const RapportFinancierPage: React.FC = () => {
  const [rapport, setRapport] = useState<RapportFinancier | null>(null);
  const [loading, setLoading] = useState(false);
  const [typeRapport, setTypeRapport] = useState<'mensuel' | 'annuel'>('mensuel');
  const [mois, setMois] = useState(new Date().getMonth() + 1);
  const [annee, setAnnee] = useState(new Date().getFullYear());

  useEffect(() => {
    fetchRapport();
  }, []);

  const fetchRapport = async () => {
    try {
      setLoading(true);
      let url = '';
      
      if (typeRapport === 'mensuel') {
        url = `/economat/rapports/mensuel?mois=${mois}&annee=${annee}`;
      } else {
        url = `/economat/rapports/annuel?annee=${annee}`;
      }

      const response = await api.get(url);
      // Ajouter des valeurs par défaut pour éviter les erreurs
      const data = response.data || {};
      setRapport({
        periode: data.periode || `${mois}/${annee}`,
        total_recettes: data.total_recettes || data.recettes_totales || 0,
        total_depenses: data.total_depenses || data.depenses_totales || 0,
        solde: data.solde || 0,
        nb_inscriptions: data.nb_inscriptions || data.nb_paiements || 0,
        nb_depenses: data.nb_depenses || 0,
        depenses_par_categorie: data.depenses_par_categorie || data.par_categorie_depense || [],
        recettes_par_parcours: data.recettes_par_parcours || data.par_source_recette || [],
      });
    } catch (error) {
      console.error('Erreur lors du chargement du rapport:', error);
      alert('Erreur lors du chargement du rapport');
    } finally {
      setLoading(false);
    }
  };

  const formatMoney = (amount: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'MGA',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const moisNoms = [
    'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
    'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'
  ];

  const handlePrint = () => {
    window.print();
  };

  return (
    <div>
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>
          <i className="bi bi-file-earmark-bar-graph me-2"></i>
          Rapport Financier
        </h2>
        <button className="btn btn-secondary" onClick={handlePrint}>
          <i className="bi bi-printer me-2"></i>
          Imprimer
        </button>
      </div>

      {/* Filters */}
      <div className="card mb-4">
        <div className="card-body">
          <div className="row g-3">
            <div className="col-md-3">
              <label className="form-label">Type de rapport</label>
              <select
                className="form-select"
                value={typeRapport}
                onChange={(e) => setTypeRapport(e.target.value as 'mensuel' | 'annuel')}
              >
                <option value="mensuel">Mensuel</option>
                <option value="annuel">Annuel</option>
              </select>
            </div>
            {typeRapport === 'mensuel' && (
              <div className="col-md-3">
                <label className="form-label">Mois</label>
                <select
                  className="form-select"
                  value={mois}
                  onChange={(e) => setMois(parseInt(e.target.value))}
                >
                  {moisNoms.map((nom, index) => (
                    <option key={index} value={index + 1}>
                      {nom}
                    </option>
                  ))}
                </select>
              </div>
            )}
            <div className="col-md-3">
              <label className="form-label">Année</label>
              <input
                type="number"
                className="form-control"
                value={annee}
                onChange={(e) => setAnnee(parseInt(e.target.value))}
                min="2020"
                max="2030"
              />
            </div>
            <div className="col-md-3">
              <label className="form-label">&nbsp;</label>
              <button className="btn btn-primary w-100" onClick={fetchRapport}>
                <i className="bi bi-search me-2"></i>
                Générer
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Loading */}
      {loading && (
        <div className="text-center py-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Chargement...</span>
          </div>
        </div>
      )}

      {/* Rapport */}
      {!loading && rapport && (
        <div>
          {/* Période */}
          <div className="alert alert-info mb-4">
            <h4 className="mb-0">
              <i className="bi bi-calendar3 me-2"></i>
              {rapport.periode}
            </h4>
          </div>

          {/* Résumé */}
          <div className="row mb-4">
            <div className="col-md-4">
              <div className="card border-success">
                <div className="card-body">
                  <h6 className="text-muted">Total Recettes</h6>
                  <h3 className="text-success">{formatMoney(rapport.total_recettes)}</h3>
                  <small className="text-muted">{rapport.nb_inscriptions} paiements</small>
                </div>
              </div>
            </div>
            <div className="col-md-4">
              <div className="card border-danger">
                <div className="card-body">
                  <h6 className="text-muted">Total Dépenses</h6>
                  <h3 className="text-danger">{formatMoney(rapport.total_depenses)}</h3>
                  <small className="text-muted">{rapport.nb_depenses} dépenses</small>
                </div>
              </div>
            </div>
            <div className="col-md-4">
              <div className={`card border-${rapport.solde >= 0 ? 'primary' : 'warning'}`}>
                <div className="card-body">
                  <h6 className="text-muted">Solde</h6>
                  <h3 className={rapport.solde >= 0 ? 'text-primary' : 'text-warning'}>
                    {formatMoney(rapport.solde)}
                  </h3>
                  <small className="text-muted">
                    {rapport.solde >= 0 ? 'Excédent' : 'Déficit'}
                  </small>
                </div>
              </div>
            </div>
          </div>

          {/* Dépenses par catégorie */}
          <div className="card mb-4">
            <div className="card-header">
              <h5 className="mb-0">
                <i className="bi bi-pie-chart me-2"></i>
                Dépenses par Catégorie
              </h5>
            </div>
            <div className="card-body">
              {rapport.depenses_par_categorie.length === 0 ? (
                <p className="text-muted">Aucune dépense pour cette période</p>
              ) : (
                <div className="table-responsive">
                  <table className="table table-hover">
                    <thead>
                      <tr>
                        <th>Catégorie</th>
                        <th className="text-end">Nombre</th>
                        <th className="text-end">Montant</th>
                        <th className="text-end">%</th>
                      </tr>
                    </thead>
                    <tbody>
                      {rapport.depenses_par_categorie.map((cat, index) => {
                        const pourcentage = rapport.total_depenses > 0
                          ? (cat.montant / rapport.total_depenses) * 100
                          : 0;
                        return (
                          <tr key={index}>
                            <td>{cat.categorie}</td>
                            <td className="text-end">{cat.nb}</td>
                            <td className="text-end fw-bold">{formatMoney(cat.montant)}</td>
                            <td className="text-end">{pourcentage.toFixed(1)}%</td>
                          </tr>
                        );
                      })}
                      <tr className="table-active fw-bold">
                        <td>TOTAL</td>
                        <td className="text-end">{rapport.nb_depenses}</td>
                        <td className="text-end">{formatMoney(rapport.total_depenses)}</td>
                        <td className="text-end">100%</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>

          {/* Recettes par parcours */}
          <div className="card mb-4">
            <div className="card-header">
              <h5 className="mb-0">
                <i className="bi bi-bar-chart me-2"></i>
                Recettes par Parcours
              </h5>
            </div>
            <div className="card-body">
              {rapport.recettes_par_parcours.length === 0 ? (
                <p className="text-muted">Aucune recette pour cette période</p>
              ) : (
                <div className="table-responsive">
                  <table className="table table-hover">
                    <thead>
                      <tr>
                        <th>Parcours</th>
                        <th className="text-end">Nombre</th>
                        <th className="text-end">Montant</th>
                        <th className="text-end">%</th>
                      </tr>
                    </thead>
                    <tbody>
                      {rapport.recettes_par_parcours.map((rec, index) => {
                        const pourcentage = rapport.total_recettes > 0
                          ? (rec.montant / rapport.total_recettes) * 100
                          : 0;
                        return (
                          <tr key={index}>
                            <td>{rec.parcours}</td>
                            <td className="text-end">{rec.nb}</td>
                            <td className="text-end fw-bold">{formatMoney(rec.montant)}</td>
                            <td className="text-end">{pourcentage.toFixed(1)}%</td>
                          </tr>
                        );
                      })}
                      <tr className="table-active fw-bold">
                        <td>TOTAL</td>
                        <td className="text-end">{rapport.nb_inscriptions}</td>
                        <td className="text-end">{formatMoney(rapport.total_recettes)}</td>
                        <td className="text-end">100%</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>

          {/* Analyse */}
          <div className="card">
            <div className="card-header">
              <h5 className="mb-0">
                <i className="bi bi-lightbulb me-2"></i>
                Analyse
              </h5>
            </div>
            <div className="card-body">
              <div className="row">
                <div className="col-md-6">
                  <h6>Points Positifs</h6>
                  <ul>
                    {rapport.solde >= 0 && (
                      <li className="text-success">
                        Excédent de {formatMoney(rapport.solde)}
                      </li>
                    )}
                    {rapport.nb_inscriptions > 0 && (
                      <li className="text-success">
                        {rapport.nb_inscriptions} paiements reçus
                      </li>
                    )}
                  </ul>
                </div>
                <div className="col-md-6">
                  <h6>Points d'Attention</h6>
                  <ul>
                    {rapport.solde < 0 && (
                      <li className="text-warning">
                        Déficit de {formatMoney(Math.abs(rapport.solde))}
                      </li>
                    )}
                    {rapport.total_depenses > rapport.total_recettes && (
                      <li className="text-warning">
                        Les dépenses dépassent les recettes
                      </li>
                    )}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* No data */}
      {!loading && !rapport && (
        <div className="alert alert-info">
          <i className="bi bi-info-circle me-2"></i>
          Sélectionnez une période et cliquez sur "Générer" pour afficher le rapport
        </div>
      )}
    </div>
  );
};

export default RapportFinancierPage;

// Made with Bob
