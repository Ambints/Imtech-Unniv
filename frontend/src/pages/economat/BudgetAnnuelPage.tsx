import React, { useState, useEffect } from 'react';
import { api } from '../../api/client';

interface Budget {
  id: string;
  categorie: string;
  montant_prevu: number;
  montant_realise: number;
  departement?: string;
  annee?: string;
  taux_execution: number;
  solde: number;
  description?: string;
}

interface BudgetStats {
  budget_total: number;
  depense_totale: number;
  solde: number;
  taux_execution: number;
}

interface AnneeAcademique {
  id: string;
  libelle: string;
  date_debut: string;
  date_fin: string;
  active: boolean;
}

const BudgetAnnuelPage: React.FC = () => {
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [stats, setStats] = useState<BudgetStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingBudget, setEditingBudget] = useState<Budget | null>(null);
  const [anneesAcademiques, setAnneesAcademiques] = useState<AnneeAcademique[]>([]);
  const [filters, setFilters] = useState({
    departement_id: '',
    categorie: '',
    search: '',
  });

  const [formData, setFormData] = useState({
    annee_academique_id: '',
    departement_id: '',
    categorie: '',
    montant_prevu: '',
    description: '',
  });

  useEffect(() => {
    fetchBudgets();
    fetchStats();
    fetchAnneesAcademiques();
  }, [filters]);

  const fetchAnneesAcademiques = async () => {
    try {
      const response = await api.get('/economat/annee-academique');
      console.log('Response années académiques:', response);
      console.log('Response.data:', response.data);
      
      // S'assurer que response.data est un tableau
      const annees = Array.isArray(response.data) ? response.data : [];
      console.log('Années académiques chargées:', annees);
      setAnneesAcademiques(annees);
      
      // Sélectionner automatiquement l'année active
      const activeYear = annees.find((year: AnneeAcademique) => year.active);
      console.log('Année active trouvée:', activeYear);
      if (activeYear) {
        setFormData(prev => ({ ...prev, annee_academique_id: activeYear.id }));
      }
    } catch (error) {
      console.error('Erreur lors du chargement des années académiques:', error);
      setAnneesAcademiques([]); // Définir un tableau vide en cas d'erreur
    }
  };

  const fetchBudgets = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (filters.departement_id) params.append('departement_id', filters.departement_id);
      if (filters.categorie) params.append('categorie', filters.categorie);
      if (filters.search) params.append('search', filters.search);

      const response = await api.get(`/economat/budget?${params.toString()}`);
      // Ensure we always set an array
      setBudgets(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error('Erreur lors du chargement des budgets:', error);
      setBudgets([]); // Set empty array on error
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await api.get('/economat/budget/stats');
      setStats(response.data);
    } catch (error) {
      console.error('Erreur lors du chargement des statistiques:', error);
      // Set default stats on error
      setStats({
        budget_total: 0,
        depense_totale: 0,
        solde: 0,
        taux_execution: 0,
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (editingBudget) {
        await api.put(`/economat/budget/${editingBudget.id}`, {
          montant_prevu: parseFloat(formData.montant_prevu),
          description: formData.description,
        });
      } else {
        // Envoyer l'année académique sélectionnée
        await api.post('/economat/budget', {
          annee_academique_id: formData.annee_academique_id,
          categorie: formData.categorie,
          montant_prevu: parseFloat(formData.montant_prevu),
          description: formData.description || null,
          departement_id: formData.departement_id || null,
        });
      }
      setShowModal(false);
      setEditingBudget(null);
      resetForm();
      fetchBudgets();
      fetchStats();
      alert('Budget sauvegardé avec succès');
    } catch (error: any) {
      console.error('Erreur lors de la sauvegarde:', error);
      const errorMessage = error.response?.data?.message || 'Erreur lors de la sauvegarde du budget';
      alert(errorMessage);
    }
  };

  const resetForm = () => {
    // Garder l'année académique active sélectionnée
    // S'assurer que anneesAcademiques est un tableau
    const activeYear = Array.isArray(anneesAcademiques)
      ? anneesAcademiques.find(year => year.active)
      : null;
    setFormData({
      annee_academique_id: activeYear?.id || '',
      departement_id: '',
      categorie: '',
      montant_prevu: '',
      description: '',
    });
  };

  const openEditModal = (budget: Budget) => {
    setEditingBudget(budget);
    // S'assurer que anneesAcademiques est un tableau
    const activeYear = Array.isArray(anneesAcademiques)
      ? anneesAcademiques.find(year => year.active)
      : null;
    setFormData({
      annee_academique_id: activeYear?.id || '',
      departement_id: '',
      categorie: budget.categorie,
      montant_prevu: budget.montant_prevu.toString(),
      description: budget.description || '',
    });
    setShowModal(true);
  };

  const getProgressColor = (taux: number) => {
    if (taux >= 90) return 'danger';
    if (taux >= 75) return 'warning';
    return 'success';
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
          <i className="bi bi-graph-up me-2"></i>
          Budget Annuel
        </h2>
        <button
          className="btn btn-primary"
          onClick={() => {
            setEditingBudget(null);
            resetForm();
            setShowModal(true);
          }}
        >
          <i className="bi bi-plus-circle me-2"></i>
          Nouveau Budget
        </button>
      </div>

      {/* Statistics Cards */}
      {stats && (
        <div className="row mb-4">
          <div className="col-md-3">
            <div className="card border-primary">
              <div className="card-body">
                <h6 className="text-muted">Budget Total</h6>
                <h3 className="text-primary">{formatMoney(stats.budget_total)}</h3>
              </div>
            </div>
          </div>
          <div className="col-md-3">
            <div className="card border-danger">
              <div className="card-body">
                <h6 className="text-muted">Dépenses</h6>
                <h3 className="text-danger">{formatMoney(stats.depense_totale)}</h3>
              </div>
            </div>
          </div>
          <div className="col-md-3">
            <div className="card border-success">
              <div className="card-body">
                <h6 className="text-muted">Solde</h6>
                <h3 className="text-success">{formatMoney(stats.solde)}</h3>
              </div>
            </div>
          </div>
          <div className="col-md-3">
            <div className="card border-info">
              <div className="card-body">
                <h6 className="text-muted">Taux d'Exécution</h6>
                <h3 className="text-info">{stats.taux_execution}%</h3>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="card mb-4">
        <div className="card-body">
          <div className="row g-3">
            <div className="col-md-4">
              <input
                type="text"
                className="form-control"
                placeholder="Rechercher..."
                value={filters.search}
                onChange={(e) => setFilters({ ...filters, search: e.target.value })}
              />
            </div>
            <div className="col-md-4">
              <select
                className="form-select"
                value={filters.categorie}
                onChange={(e) => setFilters({ ...filters, categorie: e.target.value })}
              >
                <option value="">Toutes les catégories</option>
                <option value="personnel">Personnel</option>
                <option value="equipement">Équipement</option>
                <option value="fonctionnement">Fonctionnement</option>
                <option value="subvention">Subvention</option>
              </select>
            </div>
            <div className="col-md-4">
              <button className="btn btn-secondary w-100" onClick={fetchBudgets}>
                <i className="bi bi-arrow-clockwise me-2"></i>
                Actualiser
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Budget List */}
      {loading ? (
        <div className="text-center py-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Chargement...</span>
          </div>
        </div>
      ) : (
        <div className="row">
          {budgets.map((budget) => (
            <div key={budget.id} className="col-md-6 mb-3">
              <div className="card">
                <div className="card-body">
                  <div className="d-flex justify-content-between align-items-start mb-3">
                    <div>
                      <h5 className="card-title mb-1">{budget.categorie}</h5>
                      {budget.departement && (
                        <small className="text-muted">
                          <i className="bi bi-building me-1"></i>
                          {budget.departement}
                        </small>
                      )}
                    </div>
                    <button
                      className="btn btn-sm btn-outline-primary"
                      onClick={() => openEditModal(budget)}
                    >
                      <i className="bi bi-pencil"></i>
                    </button>
                  </div>

                  <div className="mb-3">
                    <div className="d-flex justify-content-between mb-1">
                      <span>Budget: {formatMoney(budget.montant_prevu)}</span>
                      <span>Dépensé: {formatMoney(budget.montant_realise)}</span>
                    </div>
                    <div className="progress" style={{ height: '25px' }}>
                      <div
                        className={`progress-bar bg-${getProgressColor(budget.taux_execution)}`}
                        role="progressbar"
                        style={{ width: `${Math.min(budget.taux_execution, 100)}%` }}
                      >
                        {budget.taux_execution}%
                      </div>
                    </div>
                  </div>

                  <div className="d-flex justify-content-between">
                    <span className="text-muted">Solde:</span>
                    <strong className={budget.solde < 0 ? 'text-danger' : 'text-success'}>
                      {formatMoney(budget.solde)}
                    </strong>
                  </div>

                  {budget.taux_execution >= 90 && (
                    <div className="alert alert-warning mt-2 mb-0 py-2">
                      <i className="bi bi-exclamation-triangle me-2"></i>
                      Attention: Budget presque épuisé!
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">
                  {editingBudget ? 'Modifier le Budget' : 'Nouveau Budget'}
                </h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => {
                    setShowModal(false);
                    setEditingBudget(null);
                  }}
                ></button>
              </div>
              <form onSubmit={handleSubmit}>
                <div className="modal-body">
                  {!editingBudget && (
                    <>
                      <div className="mb-3">
                        <label className="form-label">Année Académique *</label>
                        <select
                          className="form-select"
                          value={formData.annee_academique_id}
                          onChange={(e) => setFormData({ ...formData, annee_academique_id: e.target.value })}
                          required
                        >
                          <option value="">Sélectionner une année...</option>
                          {anneesAcademiques.map((annee) => (
                            <option key={annee.id} value={annee.id}>
                              {annee.libelle} {annee.active && '(Active)'}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="mb-3">
                        <label className="form-label">Catégorie *</label>
                        <select
                          className="form-select"
                          value={formData.categorie}
                          onChange={(e) => setFormData({ ...formData, categorie: e.target.value })}
                          required
                        >
                          <option value="">Sélectionner...</option>
                          <option value="personnel">Personnel</option>
                          <option value="equipement">Équipement</option>
                          <option value="fonctionnement">Fonctionnement</option>
                          <option value="subvention">Subvention</option>
                        </select>
                      </div>
                    </>
                  )}

                  <div className="mb-3">
                    <label className="form-label">Montant Prévu *</label>
                    <input
                      type="number"
                      className="form-control"
                      value={formData.montant_prevu}
                      onChange={(e) => setFormData({ ...formData, montant_prevu: e.target.value })}
                      required
                      min="0"
                      step="0.01"
                    />
                  </div>

                  <div className="mb-3">
                    <label className="form-label">Description</label>
                    <textarea
                      className="form-control"
                      rows={3}
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    ></textarea>
                  </div>
                </div>
                <div className="modal-footer">
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => {
                      setShowModal(false);
                      setEditingBudget(null);
                    }}
                  >
                    Annuler
                  </button>
                  <button type="submit" className="btn btn-primary">
                    {editingBudget ? 'Mettre à jour' : 'Créer'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BudgetAnnuelPage;

// Made with Bob
