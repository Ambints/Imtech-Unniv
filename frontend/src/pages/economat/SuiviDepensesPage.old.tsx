import React, { useState, useEffect } from 'react';
import { api } from '../../api/client';

interface Depense {
  id: string;
  libelle: string;
  montant: number;
  date_depense: string;
  fournisseur?: string;
  numero_facture?: string;
  statut: 'en_attente' | 'approuve' | 'paye' | 'rejete';
  categorie?: string;
  demandeur?: string;
  approbateur?: string;
  facture_url?: string;
  observations?: string;
}

interface DepenseStats {
  nb_en_attente: number;
  montant_total: number;
  nb_approuve: number;
  nb_paye: number;
  nb_rejete: number;
}

const SuiviDepensesPage: React.FC = () => {
  const [depenses, setDepenses] = useState<Depense[]>([]);
  const [stats, setStats] = useState<DepenseStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showApproveModal, setShowApproveModal] = useState(false);
  const [selectedDepense, setSelectedDepense] = useState<Depense | null>(null);
  const [totalPages, setTotalPages] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);

  const [filters, setFilters] = useState({
    statut: '',
    categorie: '',
    fournisseur: '',
    search: '',
    page: 1,
    limit: 10,
  });

  const [formData, setFormData] = useState({
    libelle: '',
    montant: '',
    categorie: '',
    fournisseur: '',
    numero_facture: '',
    observations: '',
  });

  const [approveData, setApproveData] = useState({
    statut: 'approuve' as 'approuve' | 'rejete',
    motif_decision: '',
  });

  useEffect(() => {
    fetchDepenses();
    fetchStats();
  }, [filters]);

  const fetchDepenses = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value) params.append(key, value.toString());
      });

      const response = await api.get(`/economat/depenses?${params.toString()}`);
      setDepenses(Array.isArray(response.data.data) ? response.data.data : []);
      setTotalPages(Math.ceil((response.data.total || 0) / filters.limit));
    } catch (error) {
      console.error('Erreur lors du chargement des dépenses:', error);
      setDepenses([]);
      setTotalPages(1);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await api.get('/economat/depenses/stats');
      setStats(response.data);
    } catch (error) {
      console.error('Erreur lors du chargement des statistiques:', error);
      setStats({
        nb_en_attente: 0,
        montant_total: 0,
        nb_approuve: 0,
        nb_paye: 0,
        nb_rejete: 0,
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/economat/depenses', {
        ...formData,
        montant: parseFloat(formData.montant),
        annee_academique_id: 'current', // Should be fetched from context
      });
      setShowModal(false);
      resetForm();
      fetchDepenses();
      fetchStats();
      alert('Dépense créée avec succès');
    } catch (error: any) {
      console.error('Erreur lors de la création:', error);
      alert(error.response?.data?.message || 'Erreur lors de la création de la dépense');
    }
  };

  const handleApprove = async () => {
    if (!selectedDepense) return;
    try {
      await api.patch(`/economat/depenses/${selectedDepense.id}/approve`, approveData);
      setShowApproveModal(false);
      setSelectedDepense(null);
      fetchDepenses();
      fetchStats();
      alert('Dépense traitée avec succès');
    } catch (error) {
      console.error('Erreur lors de l\'approbation:', error);
      alert('Erreur lors du traitement de la dépense');
    }
  };

  const handleMarkAsPaid = async (id: string) => {
    if (!confirm('Confirmer le paiement de cette dépense?')) return;
    try {
      await api.patch(`/economat/depenses/${id}/mark-paid`, {});
      fetchDepenses();
      fetchStats();
      alert('Dépense marquée comme payée');
    } catch (error) {
      console.error('Erreur:', error);
      alert('Erreur lors de la mise à jour');
    }
  };

  const resetForm = () => {
    setFormData({
      libelle: '',
      montant: '',
      categorie: '',
      fournisseur: '',
      numero_facture: '',
      observations: '',
    });
  };

  const getStatusBadge = (statut: string) => {
    const badges = {
      en_attente: 'warning',
      approuve: 'info',
      paye: 'success',
      rejete: 'danger',
    };
    const labels = {
      en_attente: 'En attente',
      approuve: 'Approuvé',
      paye: 'Payé',
      rejete: 'Rejeté',
    };
    return (
      <span className={`badge bg-${badges[statut as keyof typeof badges]}`}>
        {labels[statut as keyof typeof labels]}
      </span>
    );
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
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>
          <i className="bi bi-cash-stack me-2"></i>
          Suivi des Dépenses
        </h2>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>
          <i className="bi bi-plus-circle me-2"></i>
          Nouvelle Dépense
        </button>
      </div>

      {/* Statistics */}
      {stats && (
        <div className="row mb-4">
          <div className="col-md-3">
            <div className="card border-warning">
              <div className="card-body">
                <h6 className="text-muted">En Attente</h6>
                <h3 className="text-warning">{stats.nb_en_attente}</h3>
                <small>{formatMoney(stats.montant_total)}</small>
              </div>
            </div>
          </div>
          <div className="col-md-3">
            <div className="card border-info">
              <div className="card-body">
                <h6 className="text-muted">Approuvées</h6>
                <h3 className="text-info">{stats.nb_approuve}</h3>
              </div>
            </div>
          </div>
          <div className="col-md-3">
            <div className="card border-success">
              <div className="card-body">
                <h6 className="text-muted">Payées</h6>
                <h3 className="text-success">{stats.nb_paye}</h3>
              </div>
            </div>
          </div>
          <div className="col-md-3">
            <div className="card border-danger">
              <div className="card-body">
                <h6 className="text-muted">Rejetées</h6>
                <h3 className="text-danger">{stats.nb_rejete}</h3>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="card mb-4">
        <div className="card-body">
          <div className="row g-3">
            <div className="col-md-3">
              <input
                type="text"
                className="form-control"
                placeholder="Rechercher..."
                value={filters.search}
                onChange={(e) => setFilters({ ...filters, search: e.target.value, page: 1 })}
              />
            </div>
            <div className="col-md-2">
              <select
                className="form-select"
                value={filters.statut}
                onChange={(e) => setFilters({ ...filters, statut: e.target.value, page: 1 })}
              >
                <option value="">Tous les statuts</option>
                <option value="en_attente">En attente</option>
                <option value="approuve">Approuvé</option>
                <option value="paye">Payé</option>
                <option value="rejete">Rejeté</option>
              </select>
            </div>
            <div className="col-md-2">
              <select
                className="form-select"
                value={filters.categorie}
                onChange={(e) => setFilters({ ...filters, categorie: e.target.value, page: 1 })}
              >
                <option value="">Toutes catégories</option>
                <option value="personnel">Personnel</option>
                <option value="equipement">Équipement</option>
                <option value="fonctionnement">Fonctionnement</option>
              </select>
            </div>
            <div className="col-md-3">
              <input
                type="text"
                className="form-control"
                placeholder="Fournisseur..."
                value={filters.fournisseur}
                onChange={(e) => setFilters({ ...filters, fournisseur: e.target.value, page: 1 })}
              />
            </div>
            <div className="col-md-2">
              <button className="btn btn-secondary w-100" onClick={fetchDepenses}>
                <i className="bi bi-arrow-clockwise me-2"></i>
                Actualiser
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Depenses Table */}
      {loading ? (
        <div className="text-center py-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Chargement...</span>
          </div>
        </div>
      ) : (
        <>
          <div className="card">
            <div className="table-responsive">
              <table className="table table-hover mb-0">
                <thead className="table-light">
                  <tr>
                    <th>Date</th>
                    <th>Libellé</th>
                    <th>Fournisseur</th>
                    <th>Montant</th>
                    <th>Statut</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {depenses.map((depense) => (
                    <tr key={depense.id}>
                      <td>{new Date(depense.date_depense).toLocaleDateString('fr-FR')}</td>
                      <td>
                        <div>{depense.libelle}</div>
                        {depense.numero_facture && (
                          <small className="text-muted">N° {depense.numero_facture}</small>
                        )}
                      </td>
                      <td>{depense.fournisseur || '-'}</td>
                      <td className="fw-bold">{formatMoney(depense.montant)}</td>
                      <td>{getStatusBadge(depense.statut)}</td>
                      <td>
                        {depense.statut === 'en_attente' && (
                          <button
                            className="btn btn-sm btn-outline-primary me-2"
                            onClick={() => {
                              setSelectedDepense(depense);
                              setShowApproveModal(true);
                            }}
                          >
                            <i className="bi bi-check-circle"></i>
                          </button>
                        )}
                        {depense.statut === 'approuve' && (
                          <button
                            className="btn btn-sm btn-outline-success"
                            onClick={() => handleMarkAsPaid(depense.id)}
                          >
                            <i className="bi bi-cash"></i> Payer
                          </button>
                        )}
                        {depense.facture_url && (
                          <a
                            href={depense.facture_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="btn btn-sm btn-outline-secondary ms-2"
                          >
                            <i className="bi bi-file-earmark-pdf"></i>
                          </a>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <nav className="mt-3">
              <ul className="pagination justify-content-center">
                <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                  <button
                    className="page-link"
                    onClick={() => setFilters({ ...filters, page: currentPage - 1 })}
                  >
                    Précédent
                  </button>
                </li>
                {[...Array(totalPages)].map((_, i) => (
                  <li key={i} className={`page-item ${currentPage === i + 1 ? 'active' : ''}`}>
                    <button
                      className="page-link"
                      onClick={() => setFilters({ ...filters, page: i + 1 })}
                    >
                      {i + 1}
                    </button>
                  </li>
                ))}
                <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
                  <button
                    className="page-link"
                    onClick={() => setFilters({ ...filters, page: currentPage + 1 })}
                  >
                    Suivant
                  </button>
                </li>
              </ul>
            </nav>
          )}
        </>
      )}

      {/* Create Modal */}
      {showModal && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-lg">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Nouvelle Dépense</h5>
                <button type="button" className="btn-close" onClick={() => setShowModal(false)}></button>
              </div>
              <form onSubmit={handleSubmit}>
                <div className="modal-body">
                  <div className="row">
                    <div className="col-md-12 mb-3">
                      <label className="form-label">Libellé *</label>
                      <input
                        type="text"
                        className="form-control"
                        value={formData.libelle}
                        onChange={(e) => setFormData({ ...formData, libelle: e.target.value })}
                        required
                      />
                    </div>
                    <div className="col-md-6 mb-3">
                      <label className="form-label">Montant *</label>
                      <input
                        type="number"
                        className="form-control"
                        value={formData.montant}
                        onChange={(e) => setFormData({ ...formData, montant: e.target.value })}
                        required
                        min="0"
                        step="0.01"
                      />
                    </div>
                    <div className="col-md-6 mb-3">
                      <label className="form-label">Catégorie</label>
                      <select
                        className="form-select"
                        value={formData.categorie}
                        onChange={(e) => setFormData({ ...formData, categorie: e.target.value })}
                      >
                        <option value="">Sélectionner...</option>
                        <option value="personnel">Personnel</option>
                        <option value="equipement">Équipement</option>
                        <option value="fonctionnement">Fonctionnement</option>
                      </select>
                    </div>
                    <div className="col-md-6 mb-3">
                      <label className="form-label">Fournisseur</label>
                      <input
                        type="text"
                        className="form-control"
                        value={formData.fournisseur}
                        onChange={(e) => setFormData({ ...formData, fournisseur: e.target.value })}
                      />
                    </div>
                    <div className="col-md-6 mb-3">
                      <label className="form-label">N° Facture</label>
                      <input
                        type="text"
                        className="form-control"
                        value={formData.numero_facture}
                        onChange={(e) => setFormData({ ...formData, numero_facture: e.target.value })}
                      />
                    </div>
                    <div className="col-md-12 mb-3">
                      <label className="form-label">Observations</label>
                      <textarea
                        className="form-control"
                        rows={3}
                        value={formData.observations}
                        onChange={(e) => setFormData({ ...formData, observations: e.target.value })}
                      ></textarea>
                    </div>
                  </div>
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>
                    Annuler
                  </button>
                  <button type="submit" className="btn btn-primary">
                    Créer
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Approve Modal */}
      {showApproveModal && selectedDepense && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Traiter la Dépense</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setShowApproveModal(false)}
                ></button>
              </div>
              <div className="modal-body">
                <div className="mb-3">
                  <strong>Libellé:</strong> {selectedDepense.libelle}
                </div>
                <div className="mb-3">
                  <strong>Montant:</strong> {formatMoney(selectedDepense.montant)}
                </div>
                <div className="mb-3">
                  <label className="form-label">Décision *</label>
                  <select
                    className="form-select"
                    value={approveData.statut}
                    onChange={(e) =>
                      setApproveData({ ...approveData, statut: e.target.value as 'approuve' | 'rejete' })
                    }
                  >
                    <option value="approuve">Approuver</option>
                    <option value="rejete">Rejeter</option>
                  </select>
                </div>
                <div className="mb-3">
                  <label className="form-label">Motif</label>
                  <textarea
                    className="form-control"
                    rows={3}
                    value={approveData.motif_decision}
                    onChange={(e) => setApproveData({ ...approveData, motif_decision: e.target.value })}
                  ></textarea>
                </div>
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setShowApproveModal(false)}
                >
                  Annuler
                </button>
                <button type="button" className="btn btn-primary" onClick={handleApprove}>
                  Confirmer
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SuiviDepensesPage;

// Made with Bob
