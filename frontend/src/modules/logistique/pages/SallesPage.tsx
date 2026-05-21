import React, { useState } from 'react';
import { useSalles, useBatiments, useCreateSalle, useToggleDisponibilite } from '../hooks/useSalles';
import type { CreateSalleDto } from '../types/logistique.types';

export default function SallesPage() {
  const [filters, setFilters] = useState<{ type_salle?: string; disponible?: boolean }>({});
  const [showCreateModal, setShowCreateModal] = useState(false);

  const { data: salles, isLoading } = useSalles(filters);
  const { data: batiments } = useBatiments();
  const createMutation = useCreateSalle();
  const toggleMutation = useToggleDisponibilite();

  const handleCreateSalle = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    const data: CreateSalleDto = {
      batiment_id: formData.get('batiment_id') as string,
      nom: formData.get('nom') as string,
      code: formData.get('code') as string || undefined,
      capacite: parseInt(formData.get('capacite') as string),
      type_salle: formData.get('type_salle') as any,
      etage: parseInt(formData.get('etage') as string) || 0,
      disponible: true,
    };

    await createMutation.mutateAsync(data);
    setShowCreateModal(false);
    e.currentTarget.reset();
  };

  const handleToggleDisponibilite = async (id: string, disponible: boolean) => {
    await toggleMutation.mutateAsync({ id, disponible: !disponible });
  };

  const getTypeSalleIcon = (type: string) => {
    const icons: Record<string, string> = {
      cours: 'bi-book',
      amphitheatre: 'bi-people',
      laboratoire: 'bi-flask',
      salle_info: 'bi-laptop',
      salle_reunion: 'bi-briefcase',
      bibliotheque: 'bi-journal-bookmark',
    };
    return icons[type] || 'bi-door-open';
  };

  const getTypeSalleColor = (type: string) => {
    const colors: Record<string, string> = {
      cours: 'primary',
      amphitheatre: 'success',
      laboratoire: 'warning',
      salle_info: 'info',
      salle_reunion: 'secondary',
      bibliotheque: 'danger',
    };
    return colors[type] || 'secondary';
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
          <i className="bi bi-door-open me-2"></i>
          Gestion des salles
        </h2>
        <button
          className="btn btn-primary"
          onClick={() => setShowCreateModal(true)}
        >
          <i className="bi bi-plus-lg me-2"></i>
          Nouvelle salle
        </button>
      </div>

      {/* Filtres */}
      <div className="card border-0 shadow-sm mb-4">
        <div className="card-body">
          <div className="row g-3">
            <div className="col-md-3">
              <label className="form-label small">Type de salle</label>
              <select
                className="form-select"
                value={filters.type_salle || ''}
                onChange={(e) => setFilters({ ...filters, type_salle: e.target.value || undefined })}
              >
                <option value="">Tous</option>
                <option value="cours">Cours</option>
                <option value="amphitheatre">Amphithéâtre</option>
                <option value="laboratoire">Laboratoire</option>
                <option value="salle_info">Salle informatique</option>
                <option value="salle_reunion">Salle de réunion</option>
                <option value="bibliotheque">Bibliothèque</option>
              </select>
            </div>
            <div className="col-md-3">
              <label className="form-label small">Disponibilité</label>
              <select
                className="form-select"
                value={filters.disponible !== undefined ? String(filters.disponible) : ''}
                onChange={(e) => setFilters({ 
                  ...filters, 
                  disponible: e.target.value === '' ? undefined : e.target.value === 'true' 
                })}
              >
                <option value="">Toutes</option>
                <option value="true">Disponibles</option>
                <option value="false">Indisponibles</option>
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

      {/* Statistiques */}
      <div className="row g-3 mb-4">
        <div className="col-md-3">
          <div className="card border-0 shadow-sm">
            <div className="card-body">
              <div className="d-flex justify-content-between">
                <div>
                  <p className="text-muted mb-1 small">Total salles</p>
                  <h4 className="mb-0">{salles?.length || 0}</h4>
                </div>
                <div className="bg-primary bg-opacity-10 p-3 rounded">
                  <i className="bi bi-door-open text-primary fs-4"></i>
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
                  <p className="text-muted mb-1 small">Disponibles</p>
                  <h4 className="mb-0 text-success">
                    {salles?.filter(s => s.disponible).length || 0}
                  </h4>
                </div>
                <div className="bg-success bg-opacity-10 p-3 rounded">
                  <i className="bi bi-check-circle text-success fs-4"></i>
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
                  <p className="text-muted mb-1 small">Capacité totale</p>
                  <h4 className="mb-0">
                    {salles?.reduce((sum, s) => sum + s.capacite, 0) || 0}
                  </h4>
                </div>
                <div className="bg-info bg-opacity-10 p-3 rounded">
                  <i className="bi bi-people text-info fs-4"></i>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Grille salles */}
      <div className="row g-3">
        {salles?.map((salle) => (
          <div key={salle.id} className="col-md-6 col-lg-4">
            <div className={`card border-0 shadow-sm h-100 salle-card ${salle.disponible ? 'disponible' : 'indisponible'}`}>
              <div className="card-body">
                <div className="d-flex justify-content-between align-items-start mb-3">
                  <div>
                    <h5 className="card-title mb-1">{salle.nom}</h5>
                    {salle.code && (
                      <p className="text-muted small mb-0">Code: {salle.code}</p>
                    )}
                  </div>
                  <span className={`badge bg-${getTypeSalleColor(salle.type_salle)}`}>
                    <i className={`${getTypeSalleIcon(salle.type_salle)} me-1`}></i>
                    {salle.type_salle}
                  </span>
                </div>

                <div className="mb-3">
                  <div className="d-flex justify-content-between mb-2">
                    <span className="text-muted small">
                      <i className="bi bi-building me-1"></i>
                      {salle.batiment_nom || 'N/A'}
                    </span>
                    <span className="text-muted small">
                      <i className="bi bi-layers me-1"></i>
                      Étage {salle.etage}
                    </span>
                  </div>
                  <div className="d-flex justify-content-between">
                    <span className="text-muted small">
                      <i className="bi bi-people me-1"></i>
                      Capacité: {salle.capacite}
                    </span>
                    <span className={`badge ${salle.disponible ? 'bg-success' : 'bg-danger'}`}>
                      {salle.disponible ? 'Disponible' : 'Indisponible'}
                    </span>
                  </div>
                </div>

                <div className="d-flex gap-2">
                  <button
                    className={`btn btn-sm ${salle.disponible ? 'btn-warning' : 'btn-success'} flex-grow-1`}
                    onClick={() => handleToggleDisponibilite(salle.id, salle.disponible)}
                    disabled={toggleMutation.isPending}
                  >
                    <i className={`bi ${salle.disponible ? 'bi-x-circle' : 'bi-check-circle'} me-1`}></i>
                    {salle.disponible ? 'Rendre indisponible' : 'Rendre disponible'}
                  </button>
                  <button className="btn btn-sm btn-outline-primary">
                    <i className="bi bi-eye"></i>
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Modal création */}
      {showCreateModal && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-lg">
            <div className="modal-content">
              <form onSubmit={handleCreateSalle}>
                <div className="modal-header">
                  <h5 className="modal-title">Nouvelle salle</h5>
                  <button
                    type="button"
                    className="btn-close"
                    onClick={() => setShowCreateModal(false)}
                  ></button>
                </div>
                <div className="modal-body">
                  <div className="row g-3">
                    <div className="col-md-6">
                      <label className="form-label">Bâtiment *</label>
                      <select name="batiment_id" className="form-select" required>
                        <option value="">Sélectionner...</option>
                        {batiments?.map((b) => (
                          <option key={b.id} value={b.id}>{b.nom}</option>
                        ))}
                      </select>
                    </div>
                    <div className="col-md-6">
                      <label className="form-label">Type de salle *</label>
                      <select name="type_salle" className="form-select" required>
                        <option value="cours">Cours</option>
                        <option value="amphitheatre">Amphithéâtre</option>
                        <option value="laboratoire">Laboratoire</option>
                        <option value="salle_info">Salle informatique</option>
                        <option value="salle_reunion">Salle de réunion</option>
                        <option value="bibliotheque">Bibliothèque</option>
                      </select>
                    </div>
                    <div className="col-md-6">
                      <label className="form-label">Nom *</label>
                      <input
                        type="text"
                        name="nom"
                        className="form-control"
                        required
                      />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label">Code</label>
                      <input
                        type="text"
                        name="code"
                        className="form-control"
                        placeholder="ex: A101"
                      />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label">Capacité *</label>
                      <input
                        type="number"
                        name="capacite"
                        className="form-control"
                        min="1"
                        required
                      />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label">Étage</label>
                      <input
                        type="number"
                        name="etage"
                        className="form-control"
                        defaultValue="0"
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
                    {createMutation.isPending ? 'Création...' : 'Créer la salle'}
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
