import React, { useState } from 'react';
import { useStock, useStockAlertes, useCreateStock, useEnregistrerMouvement } from '../hooks';
import { CreateStockEntretienDto, MouvementStockEntretienDto, CategorieStock } from '../types/entretien.types';

export default function StockEntretienPage() {
  const [filters, setFilters] = useState({
    categorie: '',
    en_alerte: false,
  });
  const [showModal, setShowModal] = useState(false);
  const [showMouvementModal, setShowMouvementModal] = useState(false);
  const [selectedArticle, setSelectedArticle] = useState<any>(null);
  const [formData, setFormData] = useState<CreateStockEntretienDto>({
    reference: '',
    libelle: '',
    categorie: 'nettoyage',
    unite: '',
    quantite_stock: 0,
    seuil_alerte: 0,
  });
  const [mouvementData, setMouvementData] = useState<MouvementStockEntretienDto>({
    type_mouvement: 'entree',
    quantite: 0,
  });

  const { data: stock, isLoading } = useStock(filters);
  const { data: alertes } = useStockAlertes();
  const createMutation = useCreateStock();
  const mouvementMutation = useEnregistrerMouvement();

  const categorieColors: Record<CategorieStock, string> = {
    bureau: 'primary',
    nettoyage: 'success',
    informatique: 'info',
    pedagogique: 'warning',
    energie: 'danger',
    autre: 'secondary',
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createMutation.mutateAsync(formData);
      setShowModal(false);
      setFormData({
        reference: '',
        libelle: '',
        categorie: 'nettoyage',
        unite: '',
        quantite_stock: 0,
        seuil_alerte: 0,
      });
    } catch (error) {
      console.error('Erreur création article:', error);
    }
  };

  const handleMouvement = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedArticle) return;

    try {
      await mouvementMutation.mutateAsync({
        id: selectedArticle.id,
        data: mouvementData,
      });
      setShowMouvementModal(false);
      setSelectedArticle(null);
      setMouvementData({ type_mouvement: 'entree', quantite: 0 });
    } catch (error) {
      console.error('Erreur mouvement stock:', error);
    }
  };

  const openMouvementModal = (article: any, type: 'entree' | 'sortie') => {
    setSelectedArticle(article);
    setMouvementData({ type_mouvement: type, quantite: 0 });
    setShowMouvementModal(true);
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

  return (
    <div className="container-fluid py-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="mb-0">
          <i className="bi bi-box-seam me-2"></i>
          Gestion du Stock
        </h2>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>
          <i className="bi bi-plus-circle me-2"></i>
          Nouvel Article
        </button>
      </div>

      {/* Alertes critiques */}
      {alertes && alertes.length > 0 && (
        <div className="alert alert-warning mb-4">
          <div className="d-flex align-items-center mb-2">
            <i className="bi bi-exclamation-triangle-fill me-2 fs-4"></i>
            <strong>{alertes.length} article(s) en alerte critique</strong>
          </div>
          <div className="row g-2">
            {alertes.slice(0, 3).map((article) => (
              <div key={article.id} className="col-md-4">
                <div className="card border-warning">
                  <div className="card-body p-2">
                    <div className="d-flex justify-content-between align-items-center">
                      <div>
                        <strong>{article.libelle}</strong>
                        <div className="small text-muted">
                          Stock: {article.quantite_stock} {article.unite} / Seuil: {article.seuil_alerte}
                        </div>
                      </div>
                      <button
                        className="btn btn-sm btn-success"
                        onClick={() => openMouvementModal(article, 'entree')}
                      >
                        <i className="bi bi-plus"></i>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Filtres */}
      <div className="card mb-4">
        <div className="card-body">
          <div className="row g-3">
            <div className="col-md-4">
              <label className="form-label small">Catégorie</label>
              <select
                className="form-select"
                value={filters.categorie}
                onChange={(e) => setFilters({ ...filters, categorie: e.target.value })}
              >
                <option value="">Toutes</option>
                <option value="bureau">Bureau</option>
                <option value="nettoyage">Nettoyage</option>
                <option value="informatique">Informatique</option>
                <option value="pedagogique">Pédagogique</option>
                <option value="energie">Énergie</option>
                <option value="autre">Autre</option>
              </select>
            </div>
            <div className="col-md-4 d-flex align-items-end">
              <div className="form-check">
                <input
                  className="form-check-input"
                  type="checkbox"
                  checked={filters.en_alerte}
                  onChange={(e) => setFilters({ ...filters, en_alerte: e.target.checked })}
                  id="filterAlerte"
                />
                <label className="form-check-label" htmlFor="filterAlerte">
                  Afficher uniquement les alertes
                </label>
              </div>
            </div>
            <div className="col-md-4 d-flex align-items-end">
              <button
                className="btn btn-secondary w-100"
                onClick={() => setFilters({ categorie: '', en_alerte: false })}
              >
                <i className="bi bi-x-circle me-2"></i>
                Réinitialiser
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Tableau stock */}
      <div className="card">
        <div className="card-body">
          <div className="table-responsive">
            <table className="table table-hover">
              <thead>
                <tr>
                  <th>Référence</th>
                  <th>Libellé</th>
                  <th>Catégorie</th>
                  <th>Stock</th>
                  <th>Seuil</th>
                  <th>État</th>
                  <th>Prix Unit.</th>
                  <th>Valeur</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {stock?.map((article) => (
                  <tr
                    key={article.id}
                    className={article.en_alerte ? 'table-warning stock-alerte' : ''}
                  >
                    <td>
                      <code>{article.reference}</code>
                    </td>
                    <td>
                      <strong>{article.libelle}</strong>
                      {article.emplacement && (
                        <div className="small text-muted">
                          <i className="bi bi-geo-alt me-1"></i>
                          {article.emplacement}
                        </div>
                      )}
                    </td>
                    <td>
                      <span className={`badge bg-${categorieColors[article.categorie]}`}>
                        {article.categorie}
                      </span>
                    </td>
                    <td>
                      <strong>{article.quantite_stock}</strong> {article.unite}
                    </td>
                    <td>{article.seuil_alerte} {article.unite}</td>
                    <td>
                      {article.en_alerte ? (
                        <span className="badge bg-danger">
                          <i className="bi bi-exclamation-triangle me-1"></i>
                          Alerte
                        </span>
                      ) : (
                        <span className="badge bg-success">
                          <i className="bi bi-check-circle me-1"></i>
                          OK
                        </span>
                      )}
                    </td>
                    <td>
                      {article.prix_unitaire
                        ? `${article.prix_unitaire.toLocaleString('fr-FR')} FCFA`
                        : '-'}
                    </td>
                    <td>
                      {article.prix_unitaire
                        ? `${(article.quantite_stock * article.prix_unitaire).toLocaleString(
                            'fr-FR'
                          )} FCFA`
                        : '-'}
                    </td>
                    <td>
                      <div className="btn-group btn-group-sm">
                        <button
                          className="btn btn-success"
                          onClick={() => openMouvementModal(article, 'entree')}
                          title="Entrée"
                        >
                          <i className="bi bi-plus"></i>
                        </button>
                        <button
                          className="btn btn-danger"
                          onClick={() => openMouvementModal(article, 'sortie')}
                          disabled={article.quantite_stock <= 0}
                          title="Sortie"
                        >
                          <i className="bi bi-dash"></i>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {stock?.length === 0 && (
                  <tr>
                    <td colSpan={9} className="text-center text-muted">
                      Aucun article trouvé
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Modal Création Article */}
      {showModal && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-lg">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Nouvel Article Stock</h5>
                <button className="btn-close" onClick={() => setShowModal(false)}></button>
              </div>
              <form onSubmit={handleSubmit}>
                <div className="modal-body">
                  <div className="row g-3">
                    <div className="col-md-6">
                      <label className="form-label">Référence *</label>
                      <input
                        type="text"
                        className="form-control"
                        value={formData.reference}
                        onChange={(e) => setFormData({ ...formData, reference: e.target.value })}
                        required
                      />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label">Catégorie *</label>
                      <select
                        className="form-select"
                        value={formData.categorie}
                        onChange={(e) =>
                          setFormData({ ...formData, categorie: e.target.value as CategorieStock })
                        }
                        required
                      >
                        <option value="bureau">Bureau</option>
                        <option value="nettoyage">Nettoyage</option>
                        <option value="informatique">Informatique</option>
                        <option value="pedagogique">Pédagogique</option>
                        <option value="energie">Énergie</option>
                        <option value="autre">Autre</option>
                      </select>
                    </div>
                    <div className="col-12">
                      <label className="form-label">Libellé *</label>
                      <input
                        type="text"
                        className="form-control"
                        value={formData.libelle}
                        onChange={(e) => setFormData({ ...formData, libelle: e.target.value })}
                        required
                      />
                    </div>
                    <div className="col-md-4">
                      <label className="form-label">Unité *</label>
                      <input
                        type="text"
                        className="form-control"
                        value={formData.unite}
                        onChange={(e) => setFormData({ ...formData, unite: e.target.value })}
                        placeholder="Ex: pièce, litre, kg"
                        required
                      />
                    </div>
                    <div className="col-md-4">
                      <label className="form-label">Quantité initiale *</label>
                      <input
                        type="number"
                        className="form-control"
                        min="0"
                        value={formData.quantite_stock}
                        onChange={(e) =>
                          setFormData({ ...formData, quantite_stock: parseFloat(e.target.value) })
                        }
                        required
                      />
                    </div>
                    <div className="col-md-4">
                      <label className="form-label">Seuil d'alerte *</label>
                      <input
                        type="number"
                        className="form-control"
                        min="0"
                        value={formData.seuil_alerte}
                        onChange={(e) =>
                          setFormData({ ...formData, seuil_alerte: parseFloat(e.target.value) })
                        }
                        required
                      />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label">Prix unitaire (FCFA)</label>
                      <input
                        type="number"
                        className="form-control"
                        min="0"
                        value={formData.prix_unitaire || ''}
                        onChange={(e) =>
                          setFormData({ ...formData, prix_unitaire: parseFloat(e.target.value) })
                        }
                      />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label">Fournisseur</label>
                      <input
                        type="text"
                        className="form-control"
                        value={formData.fournisseur || ''}
                        onChange={(e) => setFormData({ ...formData, fournisseur: e.target.value })}
                      />
                    </div>
                    <div className="col-12">
                      <label className="form-label">Emplacement</label>
                      <input
                        type="text"
                        className="form-control"
                        value={formData.emplacement || ''}
                        onChange={(e) => setFormData({ ...formData, emplacement: e.target.value })}
                        placeholder="Ex: Magasin A - Étagère 3"
                      />
                    </div>
                  </div>
                </div>
                <div className="modal-footer">
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => setShowModal(false)}
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={createMutation.isPending}
                  >
                    {createMutation.isPending ? 'Création...' : 'Créer'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Modal Mouvement */}
      {showMouvementModal && selectedArticle && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">
                  {mouvementData.type_mouvement === 'entree' ? 'Entrée' : 'Sortie'} de Stock
                </h5>
                <button className="btn-close" onClick={() => setShowMouvementModal(false)}></button>
              </div>
              <form onSubmit={handleMouvement}>
                <div className="modal-body">
                  <div className="alert alert-info">
                    <strong>{selectedArticle.libelle}</strong>
                    <div className="small">
                      Stock actuel: {selectedArticle.quantite_stock} {selectedArticle.unite}
                    </div>
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Quantité *</label>
                    <input
                      type="number"
                      className="form-control"
                      min="0.01"
                      step="0.01"
                      max={
                        mouvementData.type_mouvement === 'sortie'
                          ? selectedArticle.quantite_stock
                          : undefined
                      }
                      value={mouvementData.quantite}
                      onChange={(e) =>
                        setMouvementData({ ...mouvementData, quantite: parseFloat(e.target.value) })
                      }
                      required
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Motif</label>
                    <textarea
                      className="form-control"
                      rows={2}
                      value={mouvementData.motif || ''}
                      onChange={(e) => setMouvementData({ ...mouvementData, motif: e.target.value })}
                      placeholder="Raison du mouvement..."
                    ></textarea>
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Référence document</label>
                    <input
                      type="text"
                      className="form-control"
                      value={mouvementData.reference_doc || ''}
                      onChange={(e) =>
                        setMouvementData({ ...mouvementData, reference_doc: e.target.value })
                      }
                      placeholder="Ex: BL-2024-001"
                    />
                  </div>
                </div>
                <div className="modal-footer">
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => setShowMouvementModal(false)}
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    className={`btn btn-${mouvementData.type_mouvement === 'entree' ? 'success' : 'danger'}`}
                    disabled={mouvementMutation.isPending}
                  >
                    {mouvementMutation.isPending ? 'Enregistrement...' : 'Enregistrer'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Made with Bob
