import React, { useState } from 'react';
import { useBatiments } from '../hooks/useSalles';
import { useCreateBatiment } from '../hooks/useBatiments';
import toast from 'react-hot-toast';

export default function BatimentsPage() {
  const { data: batiments, isLoading } = useBatiments();
  const createBatiment = useCreateBatiment();
  
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    nom: '',
    code: '',
    adresse: '',
    actif: true,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.nom || !formData.code) {
      toast.error('Le nom et le code sont obligatoires');
      return;
    }

    try {
      await createBatiment.mutateAsync(formData);
      toast.success('Bâtiment créé avec succès');
      setShowModal(false);
      setFormData({ nom: '', code: '', adresse: '', actif: true });
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Erreur lors de la création');
    }
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
        <h2>
          <i className="bi bi-building me-2"></i>
          Gestion des bâtiments
        </h2>
        <button
          className="btn btn-primary"
          onClick={() => setShowModal(true)}
        >
          <i className="bi bi-plus-lg me-2"></i>
          Ajouter un bâtiment
        </button>
      </div>

      <div className="row g-3">
        {Array.isArray(batiments) && batiments.length > 0 ? batiments.map((batiment) => (
          <div key={batiment.id} className="col-md-6 col-lg-4">
            <div className="card border-0 shadow-sm h-100">
              <div className="card-body">
                <div className="d-flex justify-content-between align-items-start mb-3">
                  <div>
                    <h5 className="card-title mb-1">{batiment.nom}</h5>
                    {batiment.code && (
                      <p className="text-muted small mb-0">Code: {batiment.code}</p>
                    )}
                  </div>
                  <span className={`badge ${batiment.actif ? 'bg-success' : 'bg-secondary'}`}>
                    {batiment.actif ? 'Actif' : 'Inactif'}
                  </span>
                </div>

                {batiment.adresse && (
                  <p className="text-muted small mb-3">
                    <i className="bi bi-geo-alt me-1"></i>
                    {batiment.adresse}
                  </p>
                )}

                <div className="row g-2">
                  <div className="col-6">
                    <div className="bg-light p-2 rounded text-center">
                      <div className="fw-bold text-primary">{batiment.nb_salles}</div>
                      <small className="text-muted">Salles</small>
                    </div>
                  </div>
                  <div className="col-6">
                    <div className="bg-light p-2 rounded text-center">
                      <div className="fw-bold text-success">{batiment.salles_disponibles}</div>
                      <small className="text-muted">Disponibles</small>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )) : (
          <div className="col-12">
            <div className="alert alert-info">
              <i className="bi bi-info-circle me-2"></i>
              Aucun bâtiment trouvé
            </div>
          </div>
        )}
      </div>

      {/* Modal d'ajout */}
      {showModal && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">
                  <i className="bi bi-building me-2"></i>
                  Nouveau bâtiment
                </h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setShowModal(false)}
                ></button>
              </div>
              <form onSubmit={handleSubmit}>
                <div className="modal-body">
                  <div className="mb-3">
                    <label className="form-label">
                      Nom du bâtiment <span className="text-danger">*</span>
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      value={formData.nom}
                      onChange={(e) => setFormData({ ...formData, nom: e.target.value })}
                      placeholder="Ex: Bloc A - Sciences"
                      required
                    />
                  </div>

                  <div className="mb-3">
                    <label className="form-label">
                      Code <span className="text-danger">*</span>
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      value={formData.code}
                      onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                      placeholder="Ex: BLOCA"
                      required
                    />
                  </div>

                  <div className="mb-3">
                    <label className="form-label">Adresse</label>
                    <textarea
                      className="form-control"
                      rows={2}
                      value={formData.adresse}
                      onChange={(e) => setFormData({ ...formData, adresse: e.target.value })}
                      placeholder="Adresse du bâtiment"
                    />
                  </div>

                  <div className="form-check">
                    <input
                      type="checkbox"
                      className="form-check-input"
                      id="actif"
                      checked={formData.actif}
                      onChange={(e) => setFormData({ ...formData, actif: e.target.checked })}
                    />
                    <label className="form-check-label" htmlFor="actif">
                      Bâtiment actif
                    </label>
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
                    disabled={createBatiment.isPending}
                  >
                    {createBatiment.isPending ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2"></span>
                        Création...
                      </>
                    ) : (
                      <>
                        <i className="bi bi-check-lg me-2"></i>
                        Créer
                      </>
                    )}
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
