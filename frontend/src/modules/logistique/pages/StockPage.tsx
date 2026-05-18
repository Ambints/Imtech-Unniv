import React, { useState } from 'react';
import { useStock, useCreateArticle, useEnregistrerMouvement } from '../hooks/useStock';
import type { CreateStockDto, MouvementStockDto } from '../types/logistique.types';

export default function StockPage() {
  const [filters, setFilters] = useState<{ categorie?: string; en_alerte?: boolean }>({});
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showMouvementModal, setShowMouvementModal] = useState<{ id: string; libelle: string; quantite: number } | null>(null);

  const { data: stock, isLoading } = useStock(filters);
  const createMutation = useCreateArticle();
  const mouvementMutation = useEnregistrerMouvement();

  const handleCreateArticle = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    const data: CreateStockDto = {
      reference: formData.get('reference') as string,
      libelle: formData.get('libelle') as string,
      categorie: formData.get('categorie') as any,
      unite: formData.get('unite') as string,
      quantite_stock: parseFloat(formData.get('quantite_stock') as string),
      seuil_alerte: parseFloat(formData.get('seuil_alerte') as string),
      prix_unitaire: formData.get('prix_unitaire') ? parseFloat(formData.get('prix_unitaire') as string) : undefined,
      fournisseur: formData.get('fournisseur') as string || undefined,
      emplacement: formData.get('emplacement') as string || undefined,
    };

    await createMutation.mutateAsync(data);
    setShowCreateModal(false);
    e.currentTarget.reset();
  };

  const handleMouvement = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!showMouvementModal) return;

    const formData = new FormData(e.currentTarget);
    
    const data: MouvementStockDto = {
      type_mouvement: formData.get('type_mouvement') as any,
      quantite: parseFloat(formData.get('quantite') as string),
      motif: formData.get('motif') as string || undefined,
      reference_doc: formData.get('reference_doc') as string || undefined,
    };

    await mouvementMutation.mutateAsync({ id: showMouvementModal.id, data });
    setShowMouvementModal(null);
    e.currentTarget.reset();
  };

  const getCategorieColor = (categorie: string) => {
    const colors: Record<string, string> = {
      bureau: 'primary',
      nettoyage: 'success',
      informatique: 'info',
      pedagogique: 'warning',
      energie: 'danger',
      autre: 'secondary',
    };
    return colors[categorie] || 'secondary';
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
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>
          <i className="bi bi-box-seam me-2"></i>
          Inventaire stock
        </h2>
        <button
          className="btn btn-primary"
          onClick={() => setShowCreateModal(true)}
        >
          <i className="bi bi-plus-lg me-2"></i>
          Nouvel article
        </button>
      </div>

      {/* Filtres */}
      <div className="card border-0 shadow-sm mb-4">
        <div className="card-body">
          <div className="row g-3">
            <div className="col-md-3">
              <label className="form-label small">Catégorie</label>
              <select
                className="form-select"
                value={filters.categorie || ''}
                onChange={(e) => setFilters({ ...filters, categorie: e.target.value || undefined })}
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
            <div className="col-md-3">
              <label className="form-label small">Alertes</label>
              <select
                className="form-select"
                value={filters.en_alerte ? 'true' : ''}
                onChange={(e) => setFilters({ ...filters, en_alerte: e.target.value === 'true' ? true : undefined })}
              >
                <option value="">Tous</option>
                <option value="true">En alerte uniquement</option>
              </select>
            </div>
            <div className="col-md-3">
              <label className="form-label small">&nbsp;</label>
              <button
                className="btn btn-outline-secondary w-100"
                onClick={() => setFilters({})}
              >
                <i className="bi bi-x-circle me-2"></i>
                Réinitialiser
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Statistiques rapides */}
      <div className="row g-3 mb-4">
        <div className="col-md-3">
          <div className="card border-0 shadow-sm">
            <div className="card-body">
              <div className="d-flex justify-content-between">
                <div>
                  <p className="text-muted mb-1 small">Total articles</p>
                  <h4 className="mb-0">{stock?.length || 0}</h4>
                </div>
                <div className="bg-primary bg-opacity-10 p-3 rounded">
                  <i className="bi bi-box text-primary fs-4"></i>
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
                  <p className="text-muted mb-1 small">En alerte</p>
                  <h4 className="mb-0 text-danger">
                    {stock?.filter(s => s.en_alerte).length || 0}
                  </h4>
                </div>
                <div className="bg-danger bg-opacity-10 p-3 rounded">
                  <i className="bi bi-exclamation-triangle text-danger fs-4"></i>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Liste stock */}
      <div className="card border-0 shadow-sm">
        <div className="card-body p-0">
          <div className="table-responsive">
            <table className="table table-hover mb-0">
              <thead className="table-light">
                <tr>
                  <th>Référence</th>
                  <th>Libellé</th>
                  <th>Catégorie</th>
                  <th>Stock</th>
                  <th>Seuil</th>
                  <th>État</th>
                  <th>Prix unitaire</th>
                  <th>Valeur</th>
                  <th>Fournisseur</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {stock?.map((article) => (
                  <tr key={article.id} className={article.en_alerte ? 'stock-row-alerte' : ''}>
                    <td><code>{article.reference}</code></td>
                    <td className="fw-medium">{article.libelle}</td>
                    <td>
                      <span className={`badge bg-${getCategorieColor(article.categorie)}`}>
                        {article.categorie}
                      </span>
                    </td>
                    <td>
                      <span className={article.en_alerte ? 'text-danger fw-bold' : ''}>
                        {article.quantite_stock} {article.unite}
                      </span>
                    </td>
                    <td className="text-muted">{article.seuil_alerte} {article.unite}</td>
                    <td>
                      {article.en_alerte ? (
                        <span className="badge bg-danger stock-alerte-badge">
                          <i className="bi bi-exclamation-triangle-fill me-1"></i>
                          Alerte
                        </span>
                      ) : (
                        <span className="badge bg-success">OK</span>
                      )}
                    </td>
                    <td className="text-muted">
                      {article.prix_unitaire ? `${article.prix_unitaire.toFixed(2)} €` : '-'}
                    </td>
                    <td className="text-muted">
                      {article.prix_unitaire 
                        ? `${(article.quantite_stock * article.prix_unitaire).toFixed(2)} €`
                        : '-'
                      }
                    </td>
                    <td className="text-muted small">{article.fournisseur || '-'}</td>
                    <td>
                      <div className="btn-group btn-group-sm">
                        <button
                          className="btn btn-success"
                          onClick={() => setShowMouvementModal({ 
                            id: article.id, 
                            libelle: article.libelle,
                            quantite: article.quantite_stock 
                          })}
                          title="Entrée"
                        >
                          <i className="bi bi-arrow-down"></i>
                        </button>
                        <button
                          className="btn btn-danger"
                          onClick={() => setShowMouvementModal({ 
                            id: article.id, 
                            libelle: article.libelle,
                            quantite: article.quantite_stock 
                          })}
                          disabled={article.quantite_stock <= 0}
                          title="Sortie"
                        >
                          <i className="bi bi-arrow-up"></i>
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

      {/* Modal création article */}
      {showCreateModal && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-lg">
            <div className="modal-content">
              <form onSubmit={handleCreateArticle}>
                <div className="modal-header">
                  <h5 className="modal-title">Nouvel article</h5>
                  <button
                    type="button"
                    className="btn-close"
                    onClick={() => setShowCreateModal(false)}
                  ></button>
                </div>
                <div className="modal-body">
                  <div className="row g-3">
                    <div className="col-md-6">
                      <label className="form-label">Référence *</label>
                      <input
                        type="text"
                        name="reference"
                        className="form-control"
                        required
                      />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label">Catégorie *</label>
                      <select name="categorie" className="form-select" required>
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
                        name="libelle"
                        className="form-control"
                        required
                      />
                    </div>
                    <div className="col-md-4">
                      <label className="form-label">Unité *</label>
                      <input
                        type="text"
                        name="unite"
                        className="form-control"
                        placeholder="ex: pièce, litre, kg"
                        required
                      />
                    </div>
                    <div className="col-md-4">
                      <label className="form-label">Quantité initiale *</label>
                      <input
                        type="number"
                        name="quantite_stock"
                        className="form-control"
                        min="0"
                        step="0.01"
                        required
                      />
                    </div>
                    <div className="col-md-4">
                      <label className="form-label">Seuil d'alerte *</label>
                      <input
                        type="number"
                        name="seuil_alerte"
                        className="form-control"
                        min="0"
                        step="0.01"
                        required
                      />
                    </div>
                    <div className="col-md-4">
                      <label className="form-label">Prix unitaire (€)</label>
                      <input
                        type="number"
                        name="prix_unitaire"
                        className="form-control"
                        min="0"
                        step="0.01"
                      />
                    </div>
                    <div className="col-md-4">
                      <label className="form-label">Fournisseur</label>
                      <input
                        type="text"
                        name="fournisseur"
                        className="form-control"
                      />
                    </div>
                    <div className="col-md-4">
                      <label className="form-label">Emplacement</label>
                      <input
                        type="text"
                        name="emplacement"
                        className="form-control"
                      />
                    </div>
                  </div>
                </div>
                <div className="modal-footer">
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => setShowCreateModal(false)}
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={createMutation.isPending}
                  >
                    {createMutation.isPending ? 'Création...' : 'Créer l\'article'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Modal mouvement */}
      {showMouvementModal && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog">
            <div className="modal-content">
              <form onSubmit={handleMouvement}>
                <div className="modal-header">
                  <h5 className="modal-title">Mouvement de stock</h5>
                  <button
                    type="button"
                    className="btn-close"
                    onClick={() => setShowMouvementModal(null)}
                  ></button>
                </div>
                <div className="modal-body">
                  <div className="alert alert-info">
                    <strong>{showMouvementModal.libelle}</strong>
                    <br />
                    <small>Stock actuel: {showMouvementModal.quantite}</small>
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Type de mouvement *</label>
                    <select name="type_mouvement" className="form-select" required>
                      <option value="entree">Entrée</option>
                      <option value="sortie">Sortie</option>
                      <option value="ajustement">Ajustement</option>
                    </select>
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Quantité *</label>
                    <input
                      type="number"
                      name="quantite"
                      className="form-control"
                      min="0.01"
                      step="0.01"
                      required
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Motif</label>
                    <textarea
                      name="motif"
                      className="form-control"
                      rows={2}
                    ></textarea>
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Référence document</label>
                    <input
                      type="text"
                      name="reference_doc"
                      className="form-control"
                      placeholder="ex: BON-2024-001"
                    />
                  </div>
                </div>
                <div className="modal-footer">
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => setShowMouvementModal(null)}
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    className="btn btn-primary"
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
