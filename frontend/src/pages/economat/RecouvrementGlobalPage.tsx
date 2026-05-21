import React, { useState, useEffect } from 'react';
import { api } from '../../api/client';

interface RecouvrementStats {
  nb_inscriptions: number;
  montant_attendu: number;
  montant_recouvre: number;
  montant_impaye: number;
  taux_recouvrement: number;
}

interface InscriptionImpayee {
  inscription_id: string;
  matricule: string;
  nom: string;
  prenom: string;
  parcours: string;
  niveau: string;
  montant_total: number;
  montant_paye: number;
  reste_a_payer: number;
  statut: string;
}

interface RecouvrementByParcours {
  parcours: string;
  nb_etudiants: number;
  montant_attendu: number;
  montant_recouvre: number;
  taux: number;
}

const RecouvrementGlobalPage: React.FC = () => {
  const [stats, setStats] = useState<RecouvrementStats | null>(null);
  const [impayes, setImpayes] = useState<InscriptionImpayee[]>([]);
  const [byParcours, setByParcours] = useState<RecouvrementByParcours[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [statsRes, impayesRes, parcoursRes] = await Promise.all([
        api.get('/economat/recouvrement/stats'),
        api.get('/economat/recouvrement/impayes'),
        api.get('/economat/recouvrement/by-parcours'),
      ]);
      setStats(statsRes.data || {
        nb_inscriptions: 0,
        montant_attendu: 0,
        montant_recouvre: 0,
        montant_impaye: 0,
        taux_recouvrement: 0,
      });
      setImpayes(Array.isArray(impayesRes.data) ? impayesRes.data : []);
      setByParcours(Array.isArray(parcoursRes.data) ? parcoursRes.data : []);
    } catch (error) {
      console.error('Erreur:', error);
      setStats({
        nb_inscriptions: 0,
        montant_attendu: 0,
        montant_recouvre: 0,
        montant_impaye: 0,
        taux_recouvrement: 0,
      });
      setImpayes([]);
      setByParcours([]);
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

  const filteredImpayes = impayes.filter(
    (i) =>
      i.matricule.toLowerCase().includes(search.toLowerCase()) ||
      i.nom.toLowerCase().includes(search.toLowerCase()) ||
      i.prenom.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>
          <i className="bi bi-credit-card me-2"></i>
          Recouvrement Global
        </h2>
        <button className="btn btn-primary" onClick={fetchData}>
          <i className="bi bi-arrow-clockwise me-2"></i>
          Actualiser
        </button>
      </div>

      {/* Statistics */}
      {stats && (
        <div className="row mb-4">
          <div className="col-md-3">
            <div className="card border-primary">
              <div className="card-body">
                <h6 className="text-muted">Inscriptions</h6>
                <h3 className="text-primary">{stats.nb_inscriptions}</h3>
              </div>
            </div>
          </div>
          <div className="col-md-3">
            <div className="card border-info">
              <div className="card-body">
                <h6 className="text-muted">Montant Attendu</h6>
                <h3 className="text-info">{formatMoney(stats.montant_attendu)}</h3>
              </div>
            </div>
          </div>
          <div className="col-md-3">
            <div className="card border-success">
              <div className="card-body">
                <h6 className="text-muted">Montant Recouvré</h6>
                <h3 className="text-success">{formatMoney(stats.montant_recouvre)}</h3>
              </div>
            </div>
          </div>
          <div className="col-md-3">
            <div className="card border-warning">
              <div className="card-body">
                <h6 className="text-muted">Taux de Recouvrement</h6>
                <h3 className="text-warning">{stats.taux_recouvrement}%</h3>
                <div className="progress mt-2" style={{ height: '10px' }}>
                  <div
                    className="progress-bar bg-success"
                    style={{ width: `${stats.taux_recouvrement}%` }}
                  ></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Recouvrement par Parcours */}
      <div className="card mb-4">
        <div className="card-header">
          <h5 className="mb-0">Recouvrement par Parcours</h5>
        </div>
        <div className="card-body">
          <div className="table-responsive">
            <table className="table table-hover">
              <thead>
                <tr>
                  <th>Parcours</th>
                  <th>Étudiants</th>
                  <th>Attendu</th>
                  <th>Recouvré</th>
                  <th>Taux</th>
                </tr>
              </thead>
              <tbody>
                {byParcours.map((p, idx) => (
                  <tr key={idx}>
                    <td>{p.parcours}</td>
                    <td>{p.nb_etudiants}</td>
                    <td>{formatMoney(p.montant_attendu)}</td>
                    <td>{formatMoney(p.montant_recouvre)}</td>
                    <td>
                      <div className="d-flex align-items-center">
                        <div className="progress flex-grow-1 me-2" style={{ height: '20px' }}>
                          <div
                            className={`progress-bar ${
                              p.taux >= 75 ? 'bg-success' : p.taux >= 50 ? 'bg-warning' : 'bg-danger'
                            }`}
                            style={{ width: `${p.taux}%` }}
                          >
                            {p.taux}%
                          </div>
                        </div>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Inscriptions Impayées */}
      <div className="card">
        <div className="card-header">
          <div className="d-flex justify-content-between align-items-center">
            <h5 className="mb-0">Inscriptions avec Impayés ({filteredImpayes.length})</h5>
            <input
              type="text"
              className="form-control w-25"
              placeholder="Rechercher..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>
        <div className="card-body">
          {loading ? (
            <div className="text-center py-4">
              <div className="spinner-border text-primary" role="status"></div>
            </div>
          ) : (
            <div className="table-responsive">
              <table className="table table-hover">
                <thead>
                  <tr>
                    <th>Matricule</th>
                    <th>Étudiant</th>
                    <th>Parcours</th>
                    <th>Niveau</th>
                    <th>Total</th>
                    <th>Payé</th>
                    <th>Reste</th>
                    <th>Statut</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredImpayes.map((i) => (
                    <tr key={i.inscription_id}>
                      <td>{i.matricule}</td>
                      <td>
                        {i.nom} {i.prenom}
                      </td>
                      <td>{i.parcours}</td>
                      <td>{i.niveau}</td>
                      <td>{formatMoney(i.montant_total)}</td>
                      <td className="text-success">{formatMoney(i.montant_paye)}</td>
                      <td className="text-danger fw-bold">{formatMoney(i.reste_a_payer)}</td>
                      <td>
                        <span
                          className={`badge ${
                            i.reste_a_payer > i.montant_total * 0.5 ? 'bg-danger' : 'bg-warning'
                          }`}
                        >
                          {i.statut}
                        </span>
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

export default RecouvrementGlobalPage;

// Made with Bob
