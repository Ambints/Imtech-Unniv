import React, { useState, useEffect } from 'react';
import { api } from '../../api/client';

interface Fournisseur {
  fournisseur: string;
  nb_factures: number;
  montant_total: number;
  montant_moyen: number;
  derniere_transaction: string;
}

interface Transaction {
  id: string;
  libelle: string;
  montant: number;
  date_depense: string;
  numero_facture?: string;
  statut: string;
}

const FournisseursPage: React.FC = () => {
  const [fournisseurs, setFournisseurs] = useState<Fournisseur[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [selectedFournisseur, setSelectedFournisseur] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchFournisseurs();
  }, [search]);

  const fetchFournisseurs = async () => {
    try {
      setLoading(true);
      const params = search ? `?search=${search}` : '';
      const response = await api.get(`/economat/fournisseurs${params}`);
      
      // Debug: voir la structure de la réponse
      console.log('API response:', response.data);
      
      // Gérer différentes structures de réponse
      if (Array.isArray(response.data)) {
        setFournisseurs(response.data);
      } else if (response.data?.data && Array.isArray(response.data.data)) {
        setFournisseurs(response.data.data);
      } else if (response.data?.fournisseurs && Array.isArray(response.data.fournisseurs)) {
        setFournisseurs(response.data.fournisseurs);
      } else {
        console.warn('Format de réponse inattendu:', response.data);
        setFournisseurs([]);
      }
    } catch (error) {
      console.error('Erreur:', error);
      setFournisseurs([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchTransactions = async (fournisseur: string) => {
    try {
      const response = await api.get(`/economat/fournisseurs/${encodeURIComponent(fournisseur)}/transactions`);
      
      // Gérer différentes structures de réponse
      if (Array.isArray(response.data)) {
        setTransactions(response.data);
      } else if (response.data?.data && Array.isArray(response.data.data)) {
        setTransactions(response.data.data);
      } else if (response.data?.transactions && Array.isArray(response.data.transactions)) {
        setTransactions(response.data.transactions);
      } else {
        console.warn('Format de réponse inattendu:', response.data);
        setTransactions([]);
      }
      
      setSelectedFournisseur(fournisseur);
    } catch (error) {
      console.error('Erreur:', error);
      setTransactions([]);
    }
  };

  const formatMoney = (amount: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'MGA',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>
          <i className="bi bi-building me-2"></i>
          Fournisseurs
        </h2>
      </div>

      <div className="row mb-4">
        <div className="col-md-6">
          <input
            type="text"
            className="form-control"
            placeholder="Rechercher un fournisseur..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <div className="row">
        <div className="col-md-6">
          <div className="card">
            <div className="card-header">
              <h5 className="mb-0">Liste des Fournisseurs</h5>
            </div>
            <div className="list-group list-group-flush" style={{ maxHeight: '600px', overflowY: 'auto' }}>
              {loading ? (
                <div className="text-center py-4">
                  <div className="spinner-border text-primary" role="status"></div>
                </div>
              ) : (
                fournisseurs.map((f) => (
                  <button
                    key={f.fournisseur}
                    className={`list-group-item list-group-item-action ${
                      selectedFournisseur === f.fournisseur ? 'active' : ''
                    }`}
                    onClick={() => fetchTransactions(f.fournisseur)}
                  >
                    <div className="d-flex justify-content-between align-items-center">
                      <div>
                        <h6 className="mb-1">{f.fournisseur}</h6>
                        <small>{f.nb_factures} facture(s)</small>
                      </div>
                      <div className="text-end">
                        <div className="fw-bold">{formatMoney(f.montant_total)}</div>
                        <small>Moy: {formatMoney(f.montant_moyen)}</small>
                      </div>
                    </div>
                  </button>
                ))
              )}
            </div>
          </div>
        </div>

        <div className="col-md-6">
          {selectedFournisseur ? (
            <div className="card">
              <div className="card-header">
                <h5 className="mb-0">Transactions - {selectedFournisseur}</h5>
              </div>
              <div className="card-body">
                <div className="table-responsive">
                  <table className="table table-sm">
                    <thead>
                      <tr>
                        <th>Date</th>
                        <th>Libellé</th>
                        <th>Montant</th>
                        <th>Statut</th>
                      </tr>
                    </thead>
                    <tbody>
                      {transactions.map((t) => (
                        <tr key={t.id}>
                          <td>{new Date(t.date_depense).toLocaleDateString('fr-FR')}</td>
                          <td>
                            <div>{t.libelle}</div>
                            {t.numero_facture && <small className="text-muted">N° {t.numero_facture}</small>}
                          </td>
                          <td>{formatMoney(t.montant)}</td>
                          <td>
                            <span className={`badge bg-${t.statut === 'paye' ? 'success' : 'warning'}`}>
                              {t.statut}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          ) : (
            <div className="card">
              <div className="card-body text-center text-muted py-5">
                <i className="bi bi-building" style={{ fontSize: '3rem' }}></i>
                <p className="mt-3">Sélectionnez un fournisseur pour voir ses transactions</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FournisseursPage;

// Made with Bob
