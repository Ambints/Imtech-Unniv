import React, { useState, useEffect } from 'react';
import { useAuthStore } from '../../store/authStore';
import { api } from '../../api/client';
import { Plus, Edit2, Trash2, Check, X, AlertCircle } from 'lucide-react';

interface NiveauEtude {
  id: string;
  code: string;
  libelle: string;
  description: string;
  ordre: number;
  type_diplome: string;
  actif: boolean;
  created_at: string;
  updated_at: string;
}

export const GestionNiveauxPage: React.FC = () => {
  const { tenant } = useAuthStore();
  const [niveaux, setNiveaux] = useState<NiveauEtude[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    code: '',
    libelle: '',
    description: '',
    ordre: 1,
    typeDiplome: 'Licence',
    actif: true
  });

  useEffect(() => {
    loadNiveaux();
  }, []);

  const loadNiveaux = async () => {
    try {
      const tenantId = tenant?.id;
      if (!tenantId) {
        setError('Tenant ID manquant');
        return;
      }

      const response = await api.get(`/admin/${tenantId}/niveaux-etude`);
      setNiveaux(response.data);
    } catch (err: any) {
      console.error('Erreur chargement niveaux:', err);
      setError(err.response?.data?.message || 'Erreur lors du chargement des niveaux');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const tenantId = tenant?.id;
      if (!tenantId) {
        setError('Tenant ID manquant');
        setLoading(false);
        return;
      }

      if (editingId) {
        await api.put(`/admin/${tenantId}/niveaux-etude/${editingId}`, formData);
        setSuccess('Niveau modifié avec succès');
      } else {
        await api.post(`/admin/${tenantId}/niveaux-etude`, formData);
        setSuccess('Niveau créé avec succès');
      }

      setShowForm(false);
      setEditingId(null);
      resetForm();
      loadNiveaux();
    } catch (err: any) {
      console.error('Erreur enregistrement niveau:', err);
      setError(err.response?.data?.message || 'Erreur lors de l\'enregistrement');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (niveau: NiveauEtude) => {
    setFormData({
      code: niveau.code,
      libelle: niveau.libelle,
      description: niveau.description || '',
      ordre: niveau.ordre,
      typeDiplome: niveau.type_diplome || 'Licence',
      actif: niveau.actif
    });
    setEditingId(niveau.id);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce niveau ?')) return;

    try {
      const tenantId = tenant?.id;
      if (!tenantId) {
        setError('Tenant ID manquant');
        return;
      }

      await api.delete(`/admin/${tenantId}/niveaux-etude/${id}`);
      setSuccess('Niveau supprimé avec succès');
      loadNiveaux();
    } catch (err: any) {
      console.error('Erreur suppression niveau:', err);
      setError(err.response?.data?.message || 'Erreur lors de la suppression');
    }
  };

  const handleToggleActif = async (id: string) => {
    try {
      const tenantId = tenant?.id;
      if (!tenantId) {
        setError('Tenant ID manquant');
        return;
      }

      await api.patch(`/admin/${tenantId}/niveaux-etude/${id}/toggle-actif`);
      setSuccess('Statut modifié avec succès');
      loadNiveaux();
    } catch (err: any) {
      console.error('Erreur toggle actif:', err);
      setError(err.response?.data?.message || 'Erreur lors de la modification du statut');
    }
  };

  const resetForm = () => {
    setFormData({
      code: '',
      libelle: '',
      description: '',
      ordre: niveaux.length + 1,
      typeDiplome: 'Licence',
      actif: true
    });
    setEditingId(null);
  };

  return (
    <div className="container-fluid p-4">
      <div className="row">
        <div className="col-12">
          <div className="d-flex justify-content-between align-items-center mb-4">
            <div>
              <h2 className="h3 mb-1">Gestion des Niveaux d'Études</h2>
              <p className="text-muted mb-0">Configurez les niveaux disponibles pour les inscriptions</p>
            </div>
            <button
              className="btn btn-primary"
              onClick={() => {
                resetForm();
                setShowForm(true);
              }}
            >
              <Plus size={18} className="me-2" />
              Nouveau Niveau
            </button>
          </div>

          {/* Alertes */}
          {error && (
            <div className="alert alert-danger d-flex align-items-center mb-3" role="alert">
              <AlertCircle size={20} className="me-2" />
              {error}
            </div>
          )}
          {success && (
            <div className="alert alert-success d-flex align-items-center mb-3" role="alert">
              <Check size={20} className="me-2" />
              {success}
            </div>
          )}

          {/* Liste des niveaux */}
          <div className="card shadow-sm">
            <div className="card-body">
              <div className="table-responsive">
                <table className="table table-hover">
                  <thead>
                    <tr>
                      <th>Ordre</th>
                      <th>Code</th>
                      <th>Libellé</th>
                      <th>Type Diplôme</th>
                      <th>Description</th>
                      <th>Statut</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {niveaux.map((niveau) => (
                      <tr key={niveau.id}>
                        <td><strong>{niveau.ordre}</strong></td>
                        <td><code>{niveau.code}</code></td>
                        <td>{niveau.libelle}</td>
                        <td>
                          <span className="badge bg-info">{niveau.type_diplome}</span>
                        </td>
                        <td className="text-muted small">{niveau.description}</td>
                        <td>
                          <button
                            className={`btn btn-sm ${niveau.actif ? 'btn-success' : 'btn-secondary'}`}
                            onClick={() => handleToggleActif(niveau.id)}
                          >
                            {niveau.actif ? <Check size={14} /> : <X size={14} />}
                          </button>
                        </td>
                        <td>
                          <button
                            className="btn btn-sm btn-outline-primary me-2"
                            onClick={() => handleEdit(niveau)}
                          >
                            <Edit2 size={14} />
                          </button>
                          <button
                            className="btn btn-sm btn-outline-danger"
                            onClick={() => handleDelete(niveau.id)}
                          >
                            <Trash2 size={14} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal de formulaire */}
      {showForm && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">
                  {editingId ? 'Modifier le niveau' : 'Nouveau niveau'}
                </h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => {
                    setShowForm(false);
                    resetForm();
                  }}
                ></button>
              </div>
              <form onSubmit={handleSubmit}>
                <div className="modal-body">
                  <div className="mb-3">
                    <label className="form-label">Code *</label>
                    <input
                      type="text"
                      className="form-control"
                      value={formData.code}
                      onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                      required
                      placeholder="Ex: L1, M2"
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Libellé *</label>
                    <input
                      type="text"
                      className="form-control"
                      value={formData.libelle}
                      onChange={(e) => setFormData({ ...formData, libelle: e.target.value })}
                      required
                      placeholder="Ex: L1 - 1ère année"
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Description</label>
                    <textarea
                      className="form-control"
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      rows={2}
                      placeholder="Description du niveau"
                    />
                  </div>
                  <div className="row">
                    <div className="col-md-6 mb-3">
                      <label className="form-label">Ordre *</label>
                      <input
                        type="number"
                        className="form-control"
                        value={formData.ordre}
                        onChange={(e) => setFormData({ ...formData, ordre: Number(e.target.value) })}
                        required
                        min="1"
                      />
                    </div>
                    <div className="col-md-6 mb-3">
                      <label className="form-label">Type Diplôme</label>
                      <select
                        className="form-select"
                        value={formData.typeDiplome}
                        onChange={(e) => setFormData({ ...formData, typeDiplome: e.target.value })}
                      >
                        <option value="Licence">Licence</option>
                        <option value="Master">Master</option>
                        <option value="Doctorat">Doctorat</option>
                        <option value="BTS">BTS</option>
                        <option value="DUT">DUT</option>
                        <option value="Autre">Autre</option>
                      </select>
                    </div>
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
                      Actif
                    </label>
                  </div>
                </div>
                <div className="modal-footer">
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => {
                      setShowForm(false);
                      resetForm();
                    }}
                  >
                    Annuler
                  </button>
                  <button type="submit" className="btn btn-primary" disabled={loading}>
                    {loading ? (
                      <span className="spinner-border spinner-border-sm me-2"></span>
                    ) : (
                      <Check size={18} className="me-2" />
                    )}
                    {editingId ? 'Modifier' : 'Créer'}
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

// Made with Bob
