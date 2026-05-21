import React, { useState } from 'react';
import { api } from '../../api/client';

interface RapportJournalier {
  date: string;
  total_paiements: number;
  nb_paiements: number;
  paiements: any[];
  par_mode_paiement: any[];
}

const RapportFinancierPage: React.FC = () => {
  const [typeRapport, setTypeRapport] = useState<'journalier' | 'mensuel' | 'annuel'>('journalier');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [mois, setMois] = useState(new Date().getMonth() + 1);
  const [annee, setAnnee] = useState(new Date().getFullYear());
  const [rapport, setRapport] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const fetchRapport = async () => {
    try {
      setLoading(true);
      let url = '';
      
      if (typeRapport === 'journalier') {
        url = `/api/economat/rapports/journalier?date=${date}`;
      } else if (typeRapport === 'mensuel') {
        url = `/api/economat/rapports/mensuel?mois=${mois}&annee=${annee}`;
      } else {
        url = `/api/economat/rapports/annuel?annee_academique_id=current`;
      }

      const response = await api.get(url);
      setRapport(response.data);
    } catch (error) {
      console.error('Erreur:', error);
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

  const exportPDF = () => {
    alert('Export PDF en cours de développement');
  };

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>
          <i className="bi bi-file-earmark-bar-graph me-2"></i>
          Rapport Financier
        </h2>
        {rapport && (
          <button className="btn btn-danger" onClick={exportPDF}>
            <i className="bi bi-file-pdf me-2"></i>
            Exporter PDF
          </button>
        )}
      </div>

      {/* Filters */}
      <div className="card mb-4">
        <div className="card-body">
          <div className="row g-3">
            <div className="col-md-3">
              <label className="form-label">Type de Rapport</label>
              <select
                className="form-select"
                value={typeRapport}
                onChange={(e) => setTypeRapport(e.target.value as any)}
              >
                <option value="journalier">Journalier</option>
                <option value="mensuel">Mensuel</option>
                <option value="annuel">Annuel</option>
              </select>
            </div>

            {typeRapport === 'journalier' && (
              <div className="col-md-3">
                <label className="form-label">Date</label>
                <input
                  type="date"
                  className="form-control"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                />
              </div>
            )}

            {typeRapport === 'mensuel' && (
              <>
                <div className="col-md-2">
                  <label className="form-label">Mois</label>
                  <select
                    className="form-select"
                    value={mois}
                    onChange={(e) => setMois(parseInt(e.target.value))}
                  >
                    {[...Array(12)].map((_, i) => (
                      <option key={i} value={i + 1}>
                        {new Date(2000, i).toLocaleString('fr-FR', { month: 'long' })}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="col-md-2">
                  <label className="form-label">Année</label>
                  <input
                    type="number"
                    className="form-control"
                    value={annee}
                    onChange={(e) => setAnnee(parseInt(e.target.value))}
                  />
                </div>
              </>
            )}

            <div className="col-md-2 d-flex align-items-end">
              <button className="btn btn-primary w-100" onClick={fetchRapport} disabled={loading}>
                {loading ? (
                  <span className="spinner-border spinner-border-sm me-2"></span>
                ) : (
                  <i className="bi bi-search me-2"></i>
                )}
                Générer
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Rapport Content */}
      {rapport && (
        <div className="card">
          <div className="card-body">
            {typeRapport === 'journalier' && (
              <div>
                <h4 className="mb-4">Rapport du {new Date(rapport.date).toLocaleDateString('fr-FR')}</h4>
                
                <div className="row mb-4">
                  <div className="col-md-6">
                    <div className="card bg-light">
                      <div className="card-body">
                        <h5>Total Encaissé</h5>
                        <h2 className="text-success">{formatMoney(rapport.total_paiements)}</h2>
                        <p className="text-muted mb-0">{rapport.nb_paiements} transaction(s)</p>
                      </div>
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="card bg-light">
                      <div className="card-body">
                        <h5>Modes de Paiement</h5>
                        {rapport.par_mode_paiement?.map((mode: any, idx: number) => (
                          <div key={idx} className="d-flex justify-content-between mb-2">
                            <span>{mode.mode_paiement}:</span>
                            <strong>{formatMoney(mode.montant_total)}</strong>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                <h5 className="mb-3">Détail des Paiements</h5>
                <div className="table-responsive">
                  <table className="table table-sm table-hover">
                    <thead>
                      <tr>
                        <th>Heure</th>
                        <th>Reçu N°</th>
                        <th>Étudiant</th>
                        <th>Mode</th>
                        <th>Montant</th>
                        <th>Caissier</th>
                      </tr>
                    </thead>
                    <tbody>
                      {rapport.paiements?.map((p: any, idx: number) => (
                        <tr key={idx}>
                          <td>{p.heure}</td>
                          <td>{p.recu_numero}</td>
                          <td>{p.matricule} - {p.nom} {p.prenom}</td>
                          <td>{p.mode_paiement}</td>
                          <td className="fw-bold">{formatMoney(p.montant)}</td>
                          <td>{p.caissier || '-'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {typeRapport === 'mensuel' && (
              <div>
                <h4 className="mb-4">
                  Rapport de {new Date(annee, mois - 1).toLocaleString('fr-FR', { month: 'long', year: 'numeric' })}
                </h4>
                
                <div className="row mb-4">
                  <div className="col-md-4">
                    <div className="card bg-light">
                      <div className="card-body">
                        <h6>Total du Mois</h6>
                        <h3 className="text-success">{formatMoney(rapport.total_mois)}</h3>
                      </div>
                    </div>
                  </div>
                  <div className="col-md-4">
                    <div className="card bg-light">
                      <div className="card-body">
                        <h6>Nombre de Paiements</h6>
                        <h3 className="text-primary">{rapport.nb_paiements}</h3>
                      </div>
                    </div>
                  </div>
                  <div className="col-md-4">
                    <div className="card bg-light">
                      <div className="card-body">
                        <h6>Moyenne Journalière</h6>
                        <h3 className="text-info">{formatMoney(rapport.moyenne_journaliere)}</h3>
                      </div>
                    </div>
                  </div>
                </div>

                <h5 className="mb-3">Évolution Journalière</h5>
                <div className="table-responsive">
                  <table className="table table-sm">
                    <thead>
                      <tr>
                        <th>Date</th>
                        <th>Nombre</th>
                        <th>Montant</th>
                      </tr>
                    </thead>
                    <tbody>
                      {rapport.par_jour?.map((j: any, idx: number) => (
                        <tr key={idx}>
                          <td>{new Date(j.jour).toLocaleDateString('fr-FR')}</td>
                          <td>{j.nb_paiements}</td>
                          <td>{formatMoney(j.montant_total)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {typeRapport === 'annuel' && (
              <div>
                <h4 className="mb-4">Rapport Annuel - {rapport.annee_academique}</h4>
                
                <div className="row mb-4">
                  <div className="col-md-4">
                    <div className="card border-success">
                      <div className="card-body">
                        <h6>Recettes Totales</h6>
                        <h3 className="text-success">{formatMoney(rapport.recettes_totales)}</h3>
                      </div>
                    </div>
                  </div>
                  <div className="col-md-4">
                    <div className="card border-danger">
                      <div className="card-body">
                        <h6>Dépenses Totales</h6>
                        <h3 className="text-danger">{formatMoney(rapport.depenses_totales)}</h3>
                      </div>
                    </div>
                  </div>
                  <div className="col-md-4">
                    <div className="card border-primary">
                      <div className="card-body">
                        <h6>Solde</h6>
                        <h3 className={rapport.solde >= 0 ? 'text-success' : 'text-danger'}>
                          {formatMoney(rapport.solde)}
                        </h3>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {!rapport && !loading && (
        <div className="card">
          <div className="card-body text-center text-muted py-5">
            <i className="bi bi-file-earmark-bar-graph" style={{ fontSize: '3rem' }}></i>
            <p className="mt-3">Sélectionnez les paramètres et cliquez sur "Générer" pour afficher le rapport</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default RapportFinancierPage;

// Made with Bob
