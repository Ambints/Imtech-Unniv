import React, { useState, useEffect } from 'react';
import { useAuthStore } from '../../store/authStore';
import { 
  CreditCard, 
  Plus, 
  Edit2, 
  Trash2, 
  Eye, 
  EyeOff, 
  Save, 
  X,
  Smartphone,
  Building2,
  DollarSign,
  CheckCircle,
  AlertCircle
} from 'lucide-react';

interface ConfigurationPaiement {
  id: string;
  tenantId: string;
  typePaiement: 'bank' | 'mobile_money' | 'cash';
  nomAffichage: string;
  estActif: boolean;
  ordreAffichage: number;
  nomBanque?: string;
  numeroCompte?: string;
  nomTitulaire?: string;
  nomService?: string;
  numeroTelephone?: string;
  instructionsSupplementaires?: string;
  createdAt: string;
  updatedAt: string;
  // Support ancien format pour rétrocompatibilité
  libelle?: string;
  actif?: boolean;
  operateur?: string;
  nomBeneficiaire?: string;
  titulaireCompte?: string;
  instructions?: string;
}

const TYPE_PAIEMENT_OPTIONS = [
  { value: 'mobile_money', label: 'Mobile Money', icon: Smartphone },
  { value: 'bank', label: 'Virement Bancaire', icon: Building2 },
  { value: 'cash', label: 'Espèces', icon: DollarSign },
];

export const ConfigurationPaiementPage: React.FC = () => {
  const { tenant, accessToken } = useAuthStore();
  const [configurations, setConfigurations] = useState<ConfigurationPaiement[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');
  const [showModal, setShowModal] = useState(false);
  const [editingConfig, setEditingConfig] = useState<ConfigurationPaiement | null>(null);
  const [formData, setFormData] = useState<Partial<ConfigurationPaiement>>({
    typePaiement: 'mobile_money',
    nomAffichage: '',
    estActif: true,
    ordreAffichage: 0,
  });

  useEffect(() => {
    loadConfigurations();
  }, []);

  const loadConfigurations = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/v1/configuration/${tenant?.id}/paiement`, {
        headers: { Authorization: `Bearer ${accessToken}` }
      });

      if (response.ok) {
        const data = await response.json();
        setConfigurations(data);
      } else {
        setError('Erreur lors du chargement des configurations');
      }
    } catch (err) {
      setError('Erreur de connexion au serveur');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      const url = editingConfig
        ? `/api/v1/configuration/${tenant?.id}/paiement/${editingConfig.id}`
        : `/api/v1/configuration/${tenant?.id}/paiement`;

      const method = editingConfig ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`
        },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        setSuccess(editingConfig ? 'Configuration mise à jour avec succès' : 'Configuration créée avec succès');
        setShowModal(false);
        setEditingConfig(null);
        setFormData({
          typePaiement: 'mobile_money',
          nomAffichage: '',
          estActif: true,
          ordreAffichage: 0,
        });
        loadConfigurations();
      } else {
        const errorData = await response.json();
        setError(errorData.message || 'Erreur lors de l\'enregistrement');
      }
    } catch (err) {
      setError('Erreur de connexion au serveur');
    }
  };

  const handleEdit = (config: ConfigurationPaiement) => {
    setEditingConfig(config);
    setFormData(config);
    setShowModal(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette configuration ?')) return;

    try {
      const response = await fetch(`/api/v1/configuration/${tenant?.id}/paiement/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${accessToken}` }
      });

      if (response.ok) {
        setSuccess('Configuration supprimée avec succès');
        loadConfigurations();
      } else {
        setError('Erreur lors de la suppression');
      }
    } catch (err) {
      setError('Erreur de connexion au serveur');
    }
  };

  const handleToggleActif = async (id: string, actif: boolean) => {
    try {
      const response = await fetch(`/api/v1/configuration/${tenant?.id}/paiement/${id}/toggle`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`
        },
        body: JSON.stringify({ actif })
      });

      if (response.ok) {
        setSuccess(`Configuration ${actif ? 'activée' : 'désactivée'} avec succès`);
        loadConfigurations();
      } else {
        setError('Erreur lors de la modification du statut');
      }
    } catch (err) {
      setError('Erreur de connexion au serveur');
    }
  };

  const openCreateModal = () => {
    setEditingConfig(null);
    setFormData({
      typePaiement: 'mobile_money',
      nomAffichage: '',
      estActif: true,
      ordreAffichage: 0,
    });
    setShowModal(true);
  };

  const getTypeIcon = (type: string) => {
    const option = TYPE_PAIEMENT_OPTIONS.find(opt => opt.value === type);
    return option ? option.icon : CreditCard;
  };

  return (
    <div className="container-fluid py-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="mb-1">
            <CreditCard className="me-2" size={28} />
            Configuration des Moyens de Paiement
          </h2>
          <p className="text-muted">Gérez les informations de paiement affichées aux étudiants</p>
        </div>
        <button className="btn btn-primary" onClick={openCreateModal}>
          <Plus size={20} className="me-2" />
          Nouveau Moyen de Paiement
        </button>
      </div>

      {error && (
        <div className="alert alert-danger alert-dismissible fade show" role="alert">
          <AlertCircle size={20} className="me-2" />
          {error}
          <button type="button" className="btn-close" onClick={() => setError('')}></button>
        </div>
      )}

      {success && (
        <div className="alert alert-success alert-dismissible fade show" role="alert">
          <CheckCircle size={20} className="me-2" />
          {success}
          <button type="button" className="btn-close" onClick={() => setSuccess('')}></button>
        </div>
      )}

      {loading ? (
        <div className="text-center py-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Chargement...</span>
          </div>
        </div>
      ) : (
        <div className="row">
          {configurations.map((config) => {
            const Icon = getTypeIcon(config.typePaiement);
            return (
              <div key={config.id} className="col-md-6 col-lg-4 mb-4">
                <div className={`card h-100 ${config.estActif ? '' : 'border-secondary'}`}>
                  <div className="card-body">
                    <div className="d-flex justify-content-between align-items-start mb-3">
                      <div className="d-flex align-items-center">
                        <Icon size={24} className="text-primary me-2" />
                        <h5 className="card-title mb-0">{config.nomAffichage}</h5>
                      </div>
                      <span className={`badge ${config.estActif ? 'bg-success' : 'bg-secondary'}`}>
                        {config.estActif ? 'Actif' : 'Inactif'}
                      </span>
                    </div>

                    <div className="mb-3">
                      <small className="text-muted d-block mb-2">Type: {TYPE_PAIEMENT_OPTIONS.find(t => t.value === config.typePaiement)?.label}</small>
                      
                      {config.typePaiement === 'mobile_money' && (
                        <>
                          <p className="mb-1"><strong>Service:</strong> {config.nomService}</p>
                          <p className="mb-1"><strong>Numéro:</strong> {config.numeroTelephone}</p>
                          <p className="mb-1"><strong>Titulaire:</strong> {config.nomTitulaire}</p>
                        </>
                      )}

                      {config.typePaiement === 'bank' && (
                        <>
                          <p className="mb-1"><strong>Banque:</strong> {config.nomBanque}</p>
                          <p className="mb-1"><strong>Compte:</strong> {config.numeroCompte}</p>
                          <p className="mb-1"><strong>Titulaire:</strong> {config.nomTitulaire}</p>
                        </>
                      )}

                      {(config.instructionsSupplementaires || config.instructions) && (
                        <p className="mt-2 mb-0"><small className="text-muted">{config.instructionsSupplementaires || config.instructions}</small></p>
                      )}
                    </div>

                    <div className="d-flex gap-2">
                      <button
                        className="btn btn-sm btn-outline-primary flex-fill"
                        onClick={() => handleEdit(config)}
                      >
                        <Edit2 size={16} className="me-1" />
                        Modifier
                      </button>
                      <button
                        className={`btn btn-sm ${config.estActif ? 'btn-outline-warning' : 'btn-outline-success'} flex-fill`}
                        onClick={() => handleToggleActif(config.id, !config.estActif)}
                      >
                        {config.estActif ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                      <button
                        className="btn btn-sm btn-outline-danger"
                        onClick={() => handleDelete(config.id)}
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}

          {configurations.length === 0 && (
            <div className="col-12">
              <div className="alert alert-info text-center">
                <CreditCard size={48} className="mb-3 text-muted" />
                <p className="mb-0">Aucun moyen de paiement configuré. Cliquez sur "Nouveau Moyen de Paiement" pour commencer.</p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Modal de création/édition */}
      {showModal && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-lg">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">
                  {editingConfig ? 'Modifier' : 'Nouveau'} Moyen de Paiement
                </h5>
                <button type="button" className="btn-close" onClick={() => setShowModal(false)}></button>
              </div>
              <form onSubmit={handleSubmit}>
                <div className="modal-body">
                  <div className="row">
                    <div className="col-md-6 mb-3">
                      <label className="form-label">Type de Paiement *</label>
                      <select
                        className="form-select"
                        value={formData.typePaiement}
                        onChange={(e) => setFormData({ ...formData, typePaiement: e.target.value as any })}
                        required
                      >
                        {TYPE_PAIEMENT_OPTIONS.map(option => (
                          <option key={option.value} value={option.value}>{option.label}</option>
                        ))}
                      </select>
                    </div>

                    <div className="col-md-12 mb-3">
                      <div className="form-check form-switch mt-4">
                        <input
                          className="form-check-input"
                          type="checkbox"
                          checked={formData.estActif}
                          onChange={(e) => setFormData({ ...formData, estActif: e.target.checked })}
                        />
                        <label className="form-check-label">Actif</label>
                      </div>
                    </div>
                  </div>

                  {formData.typePaiement === 'mobile_money' && (
                    <div className="row">
                      <div className="col-md-6 mb-3">
                        <label className="form-label">Opérateur *</label>
                        <input
                          type="text"
                          className="form-control"
                          value={formData.nomService || ''}
                          onChange={(e) => setFormData({ ...formData, nomService: e.target.value })}
                          placeholder="Ex: Orange Money"
                          required
                        />
                      </div>

                      <div className="col-md-6 mb-3">
                        <label className="form-label">Numéro de Téléphone *</label>
                        <input
                          type="text"
                          className="form-control"
                          value={formData.numeroTelephone || ''}
                          onChange={(e) => setFormData({ ...formData, numeroTelephone: e.target.value })}
                          placeholder="Ex: 032 XX XXX XX"
                          required
                        />
                      </div>

                      <div className="col-12 mb-3">
                        <label className="form-label">Nom du Bénéficiaire *</label>
                        <input
                          type="text"
                          className="form-control"
                          value={formData.nomTitulaire || ''}
                          onChange={(e) => setFormData({ ...formData, nomTitulaire: e.target.value })}
                          placeholder="Ex: IMTECH UNIVERSITY"
                          required
                        />
                      </div>
                    </div>
                  )}

                  {formData.typePaiement === 'bank' && (
                    <div className="row">
                      <div className="col-md-6 mb-3">
                        <label className="form-label">Nom de la Banque *</label>
                        <input
                          type="text"
                          className="form-control"
                          value={formData.nomBanque || ''}
                          onChange={(e) => setFormData({ ...formData, nomBanque: e.target.value })}
                          placeholder="Ex: BNI Madagascar"
                          required
                        />
                      </div>

                      <div className="col-md-6 mb-3">
                        <label className="form-label">Numéro de Compte *</label>
                        <input
                          type="text"
                          className="form-control"
                          value={formData.numeroCompte || ''}
                          onChange={(e) => setFormData({ ...formData, numeroCompte: e.target.value })}
                          placeholder="Ex: 00001234567890"
                          required
                        />
                      </div>

                      <div className="col-12 mb-3">
                        <label className="form-label">Titulaire du Compte *</label>
                        <input
                          type="text"
                          className="form-control"
                          value={formData.nomTitulaire || ''}
                          onChange={(e) => setFormData({ ...formData, nomTitulaire: e.target.value })}
                          placeholder="Ex: IMTECH UNIVERSITY"
                          required
                        />
                      </div>
                    </div>
                  )}

                  <div className="mb-3">
                    <label className="form-label">Instructions</label>
                    <textarea
                      className="form-control"
                      rows={3}
                      value={formData.instructionsSupplementaires || ''}
                      onChange={(e) => setFormData({ ...formData, instructionsSupplementaires: e.target.value })}
                      placeholder="Instructions supplémentaires pour l'étudiant..."
                    />
                  </div>
                </div>

                <div className="modal-footer">
                  <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>
                    <X size={16} className="me-1" />
                    Annuler
                  </button>
                  <button type="submit" className="btn btn-primary">
                    <Save size={16} className="me-1" />
                    {editingConfig ? 'Mettre à jour' : 'Créer'}
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
